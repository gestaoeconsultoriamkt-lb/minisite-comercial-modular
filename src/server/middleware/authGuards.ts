import type { Context, Next } from "hono";
import { getSession } from "../auth/session";
import { getDb } from "../db";
import { hasAnyUser } from "../auth/bootstrap";
import type { AppEnv } from "../types";

/** `/app/*`: sem sessão válida, redireciona para `/login` antes de servir a SPA. */
export async function requireAuth(c: Context<AppEnv>, next: Next) {
  const session = await getSession(c.env, c.req.raw);
  if (!session) {
    return c.redirect("/login", 302);
  }
  return next();
}

/** `/login`: já autenticado, redireciona direto para o painel. */
export async function redirectIfAuthenticated(c: Context<AppEnv>, next: Next) {
  const session = await getSession(c.env, c.req.raw);
  if (session) {
    return c.redirect("/app/minisites", 302);
  }
  return next();
}

/** `/cadastro`: só acessível enquanto nenhum usuário existir (bootstrap). */
export async function requireBootstrapOpen(c: Context<AppEnv>, next: Next) {
  const db = getDb(c.env);
  if (await hasAnyUser(db)) {
    return c.notFound();
  }
  return next();
}

/** `/api/minisites/*`: exige sessão válida; disponibiliza `userId` via `c.get("userId")`. */
export async function requireApiAuth(c: Context<AppEnv>, next: Next) {
  const session = await getSession(c.env, c.req.raw);
  if (!session) {
    return c.json({ code: "UNAUTHORIZED", message: "Sessão inválida ou expirada." }, 401);
  }
  c.set("userId", session.user.id);
  return next();
}

export function serveAssets(c: Context<AppEnv>) {
  return c.env.ASSETS.fetch(c.req.raw);
}
