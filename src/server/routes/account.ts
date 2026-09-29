import { Hono } from "hono";
import { requireApiAuth } from "../middleware/authGuards";
import { setUserPassword } from "../auth/passwordAdmin";
import { isValidPassword } from "../../shared/passwordPolicy";
import { getDb } from "../db";
import type { AppEnv } from "../types";

/**
 * `/api/account/*` — ações que o próprio usuário autenticado faz sobre a
 * própria conta (diferente de `/api/users/*`, que é o administrador
 * gerenciando outros). Hoje só a troca obrigatória de senha no primeiro
 * acesso.
 */
export const accountRoutes = new Hono<AppEnv>();
accountRoutes.use("*", requireApiAuth);

/**
 * POST /api/account/set-new-password — troca obrigatória de senha no
 * primeiro acesso (usuário criado pelo administrador com senha
 * temporária). Não pede a senha atual de propósito: a sessão válida já
 * prova que o usuário acabou de entrar com a temporária (ver briefing —
 * tela "Definir nova senha" só tem os campos de nova senha/confirmação).
 */
accountRoutes.post("/account/set-new-password", async (c) => {
  const body = await c.req.json().catch(() => null);
  const newPassword = body && typeof body === "object" ? (body as { newPassword?: unknown }).newPassword : undefined;
  if (!isValidPassword(newPassword)) {
    return c.json({ code: "INVALID_PASSWORD", message: "A senha deve conter exatamente 8 números." }, 400);
  }

  const db = getDb(c.env);
  await setUserPassword(db, c.get("userId"), newPassword, false);
  return c.json({ ok: true });
});
