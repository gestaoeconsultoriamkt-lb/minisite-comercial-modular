import { Hono } from "hono";
import { requireApiAuth } from "../middleware/authGuards";
import { setUserPassword } from "../auth/passwordAdmin";
import { isValidDefinitivePassword, DEFINITIVE_PASSWORD_MESSAGE } from "../../shared/passwordPolicy";
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
 * POST /api/account/set-new-password — define a senha DEFINITIVA do
 * próprio usuário autenticado: tanto a troca obrigatória do primeiro
 * acesso (usuário criado pelo administrador com senha temporária) quanto
 * a troca voluntária pela própria pessoa (ver Configurações > Minha
 * conta). Não pede a senha atual de propósito: a sessão válida já prova
 * quem é o usuário. Regra: mínimo de 10 caracteres (ver
 * isValidDefinitivePassword) — diferente da senha temporária (8 dígitos),
 * que continua só no fluxo administrativo de criação/reset.
 */
accountRoutes.post("/account/set-new-password", async (c) => {
  const body = await c.req.json().catch(() => null);
  const newPassword = body && typeof body === "object" ? (body as { newPassword?: unknown }).newPassword : undefined;
  if (!isValidDefinitivePassword(newPassword)) {
    return c.json({ code: "INVALID_PASSWORD", message: DEFINITIVE_PASSWORD_MESSAGE }, 400);
  }

  const db = getDb(c.env);
  await setUserPassword(db, c.get("userId"), newPassword, false);
  return c.json({ ok: true });
});
