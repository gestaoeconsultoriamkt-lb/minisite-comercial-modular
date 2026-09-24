import { Hono } from "hono";
import { createAuth } from "../auth";
import type { AppEnv } from "../types";

/** Senha exigida: exatamente 8 dígitos numéricos (ver briefing de cadastro). */
const PASSWORD_PATTERN = /^\d{8}$/;

/**
 * Monta o handler do Better Auth em `/api/auth/*`. Único ponto de regra
 * própria: validar o formato da senha no cadastro (8 dígitos numéricos)
 * antes de delegar à lib — o Better Auth não conhece essa regra de negócio
 * específica. Login, sessão, reset de senha e unicidade de e-mail (unique
 * constraint em `user.email`, ver db/auth-schema.ts) continuam 100%
 * delegados à lib, sem autenticação paralela.
 */
export const authRoutes = new Hono<AppEnv>();

authRoutes.on(["GET", "POST"], "/auth/*", async (c) => {
  const isSignUpRequest = c.req.method === "POST" && c.req.path.includes("/sign-up");

  if (isSignUpRequest) {
    // Clona a request antes de ler o corpo — o handler do Better Auth,
    // chamado depois com `c.req.raw`, ainda precisa do stream original.
    const body = await c.req.raw
      .clone()
      .json()
      .catch(() => null);
    const password = body && typeof body === "object" && "password" in body ? (body as { password?: unknown }).password : undefined;
    if (typeof password !== "string" || !PASSWORD_PATTERN.test(password)) {
      // Mesmo shape { code, message } dos erros do Better Auth, para que o
      // client (better-fetch) e translateAuthError() no admin tratem este
      // 400 igual a qualquer outro erro de auth.
      return c.json({ code: "INVALID_PASSWORD", message: "A senha deve conter exatamente 8 números." }, 400);
    }
  }

  const auth = createAuth(c.env);
  return auth.handler(c.req.raw);
});
