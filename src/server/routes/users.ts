import { Hono } from "hono";
import { desc, eq } from "drizzle-orm";
import { APIError } from "better-auth";
import { getDb } from "../db";
import { createAuth } from "../auth";
import { user, session, account, minisites } from "../db/schema";
import { setUserPassword } from "../auth/passwordAdmin";
import { requireAdminApiAuth } from "../middleware/authGuards";
import { isValidPassword } from "../../shared/passwordPolicy";
import type { AppEnv } from "../types";

type UserRow = typeof user.$inferSelect;

/**
 * `/api/users*` — gestão de usuários, restrita a `role === "admin"` (ver
 * requireAdminApiAuth). Criação/reset de senha reaproveitam o Better Auth
 * (auth.api.signUpEmail para criar, hashPassword — mesma função da lib —
 * para redefinir), nunca autenticação/hash próprios.
 */
export const usersRoutes = new Hono<AppEnv>();
// Escopo explícito em "/users" e "/users/*" (não "*"): `app.route("/api", usersRoutes)`
// mistura este middleware com o de outras sub-rotas montadas no mesmo prefixo
// "/api" (ex.: accountRoutes) — um "*" aqui vazaria para "/api/account/*" também.
usersRoutes.use("/users", requireAdminApiAuth);
usersRoutes.use("/users/*", requireAdminApiAuth);

function toListItem(row: UserRow) {
  return {
    id: row.id,
    email: row.email,
    role: row.role,
    active: row.active,
    mustChangePassword: row.mustChangePassword,
    createdAt: row.createdAt,
  };
}

// GET /api/users — lista todos os usuários.
usersRoutes.get("/users", async (c) => {
  const db = getDb(c.env);
  const rows = await db.select().from(user).orderBy(desc(user.createdAt));
  return c.json({ users: rows.map(toListItem) });
});

// POST /api/users — cria usuário com senha temporária (obrigatória a troca no primeiro acesso).
usersRoutes.post("/users", async (c) => {
  const body = await c.req.json().catch(() => null);
  const email = body && typeof body === "object" && typeof (body as { email?: unknown }).email === "string" ? (body as { email: string }).email.trim().toLowerCase() : "";
  const tempPassword = body && typeof body === "object" ? (body as { tempPassword?: unknown }).tempPassword : undefined;

  if (!email) {
    return c.json({ code: "INVALID_EMAIL", message: "Informe um e-mail." }, 400);
  }
  if (!isValidPassword(tempPassword)) {
    return c.json({ code: "INVALID_PASSWORD", message: "A senha temporária deve conter exatamente 8 números." }, 400);
  }

  const db = getDb(c.env);
  const existing = await db.select({ id: user.id }).from(user).where(eq(user.email, email)).limit(1);
  if (existing.length > 0) {
    return c.json({ code: "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL", message: "Este e-mail já está cadastrado." }, 409);
  }

  const auth = createAuth(c.env);
  let createdId: string;
  try {
    // Chama a MESMA lógica de criação de usuário/conta que o cadastro
    // público usava (hash, unicidade, geração de id) — só não passa pela
    // rota HTTP pública (fechada em routes/auth.ts). `name` não é pedido
    // nesta tela (só e-mail/senha), então usa o e-mail como fallback —
    // não aparece em nenhuma tela deste app.
    const result = await auth.api.signUpEmail({ body: { name: email, email, password: tempPassword } });
    createdId = result.user.id;
  } catch (err) {
    if (err instanceof APIError) {
      return c.json({ code: err.body?.code ?? "SIGNUP_FAILED", message: err.body?.message ?? "Não foi possível criar o usuário." }, 409);
    }
    throw err;
  }

  // `signUpEmail` já aplica os defaults de additionalFields (role: "user",
  // active: true) — só falta marcar a troca obrigatória de senha, que por
  // padrão nasce `false` (correto para o fluxo normal, não para este).
  await db.update(user).set({ mustChangePassword: true }).where(eq(user.id, createdId));

  const [created] = await db.select().from(user).where(eq(user.id, createdId)).limit(1);
  return c.json({ user: toListItem(created!) }, 201);
});

// PATCH /api/users/:id — ativa/desativa.
usersRoutes.patch("/users/:id", async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json().catch(() => null);
  const active = body && typeof body === "object" ? (body as { active?: unknown }).active : undefined;
  if (typeof active !== "boolean") {
    return c.json({ code: "INVALID_INPUT", message: "Informe o novo status (ativo/inativo)." }, 400);
  }
  if (id === c.get("userId") && active === false) {
    return c.json({ code: "CANNOT_DISABLE_SELF", message: "Você não pode desativar a própria conta." }, 400);
  }

  const db = getDb(c.env);
  const [target] = await db.select({ id: user.id }).from(user).where(eq(user.id, id)).limit(1);
  if (!target) return c.json({ code: "NOT_FOUND", message: "Usuário não encontrado." }, 404);

  await db.update(user).set({ active }).where(eq(user.id, id));
  const [updated] = await db.select().from(user).where(eq(user.id, id)).limit(1);
  return c.json({ user: toListItem(updated!) });
});

// POST /api/users/:id/reset-password — admin define uma nova senha temporária.
usersRoutes.post("/users/:id/reset-password", async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json().catch(() => null);
  const tempPassword = body && typeof body === "object" ? (body as { tempPassword?: unknown }).tempPassword : undefined;
  if (!isValidPassword(tempPassword)) {
    return c.json({ code: "INVALID_PASSWORD", message: "A senha temporária deve conter exatamente 8 números." }, 400);
  }

  const db = getDb(c.env);
  const [target] = await db.select({ id: user.id }).from(user).where(eq(user.id, id)).limit(1);
  if (!target) return c.json({ code: "NOT_FOUND", message: "Usuário não encontrado." }, 404);

  await setUserPassword(db, id, tempPassword, true);
  return c.json({ ok: true });
});

// DELETE /api/users/:id — exclui, só se o usuário não tiver MiniSites (nunca apaga MiniSite pra excluir dono).
usersRoutes.delete("/users/:id", async (c) => {
  const id = c.req.param("id");
  if (id === c.get("userId")) {
    return c.json({ code: "CANNOT_DELETE_SELF", message: "Você não pode excluir a própria conta." }, 400);
  }

  const db = getDb(c.env);
  const [target] = await db.select({ id: user.id }).from(user).where(eq(user.id, id)).limit(1);
  if (!target) return c.json({ code: "NOT_FOUND", message: "Usuário não encontrado." }, 404);

  const owned = await db.select({ id: minisites.id }).from(minisites).where(eq(minisites.ownerUserId, id)).limit(1);
  if (owned.length > 0) {
    return c.json(
      { code: "USER_HAS_MINISITES", message: "Este usuário possui MiniSites. Desative a conta em vez de excluir." },
      409,
    );
  }

  // `session`/`account` referenciam `user.id` — apagados explicitamente
  // antes do usuário (não depende de cascade do driver D1/SQLite estar
  // ativo). Nunca toca em `minisites`: só chega aqui quando não há nenhum.
  await db.delete(session).where(eq(session.userId, id));
  await db.delete(account).where(eq(account.userId, id));
  await db.delete(user).where(eq(user.id, id));
  return c.json({ ok: true });
});
