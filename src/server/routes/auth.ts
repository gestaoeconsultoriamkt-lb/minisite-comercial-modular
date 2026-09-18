import { Hono } from "hono";
import { createAuth } from "../auth";
import { hasAnyUser } from "../auth/bootstrap";
import { getDb } from "../db";
import type { AppEnv } from "../types";

/**
 * Monta o handler do Better Auth em `/api/auth/*`. Único ponto de regra
 * própria: bloquear self-signup público assim que já existir um usuário
 * (bootstrap — ver auth/bootstrap.ts). Todo o resto (login, sessão, reset de
 * senha) é 100% delegado à lib.
 */
export const authRoutes = new Hono<AppEnv>();

authRoutes.on(["GET", "POST"], "/auth/*", async (c) => {
  const isSignUpRequest = c.req.method === "POST" && c.req.path.includes("/sign-up");

  if (isSignUpRequest) {
    const db = getDb(c.env);
    if (await hasAnyUser(db)) {
      // Mesmo shape { code, message } dos erros do Better Auth, para que o
      // client (better-fetch) e translateAuthError() no admin tratem este
      // 403 igual a qualquer outro erro de auth.
      return c.json(
        {
          code: "SIGNUP_DISABLED",
          message: "Cadastro público desabilitado: já existe um administrador cadastrado.",
        },
        403,
      );
    }
  }

  const auth = createAuth(c.env);
  return auth.handler(c.req.raw);
});
