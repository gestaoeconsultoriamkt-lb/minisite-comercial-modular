import { Hono } from "hono";
import { createAuth } from "../auth";
import type { AppEnv } from "../types";

/**
 * Monta o handler do Better Auth em `/api/auth/*`. Login, sessão, reset de
 * senha (via link de "esqueci minha senha") e unicidade de e-mail (unique
 * constraint em `user.email`) continuam 100% delegados à lib, sem
 * autenticação paralela.
 *
 * Único ponto de regra própria: cadastro público FECHADO — a única forma
 * de criar conta agora é o administrador em Configurações > Usuários (ver
 * routes/users.ts, que chama `auth.api.signUpEmail` internamente, sem
 * passar por este HTTP endpoint — bloquear a rota pública aqui não afeta
 * esse fluxo). Qualquer `POST .../sign-up*` feito direto contra a API
 * (visitante que descobriu a rota, bookmark antigo etc.) é rejeitado antes
 * de chegar no handler da lib.
 */
export const authRoutes = new Hono<AppEnv>();

authRoutes.on(["GET", "POST"], "/auth/*", async (c) => {
  const isSignUpRequest = c.req.method === "POST" && c.req.path.includes("/sign-up");

  if (isSignUpRequest) {
    return c.json(
      { code: "SIGNUP_DISABLED", message: "Cadastro público desativado. Peça ao administrador para criar sua conta." },
      403,
    );
  }

  const auth = createAuth(c.env);
  return auth.handler(c.req.raw);
});
