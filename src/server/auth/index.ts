import { betterAuth, APIError } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { eq } from "drizzle-orm";
import { getDb } from "../db";
import * as schema from "../db/schema";
import { createBrevoEmailProvider } from "../email/brevoEmailProvider";
import { buildAuthOptions } from "./sharedOptions";
import type { Bindings } from "../types";

/**
 * Instância real do Better Auth, criada por request com o binding D1 de
 * `c.env` (não há singleton em nível de módulo — bindings do Worker só
 * existem dentro do handler de fetch). Credenciais, sessão e verificação
 * ficam 100% sob responsabilidade da lib; nenhum password_hash próprio.
 */
export function createAuth(env: Bindings) {
  const db = getDb(env);
  const emailProvider = createBrevoEmailProvider({
    apiKey: env.BREVO_API_KEY,
    senderEmail: env.BREVO_SENDER_EMAIL,
    senderName: env.BREVO_SENDER_NAME,
  });

  return betterAuth(
    buildAuthOptions(drizzleAdapter(db, { provider: "sqlite", schema }), {
      secret: env.BETTER_AUTH_SECRET,
      baseURL: env.BETTER_AUTH_URL,
      emailAndPassword: {
        enabled: true,
        autoSignIn: true,
        sendResetPassword: async ({ user, url }) => {
          await emailProvider.sendPasswordReset({ to: user.email, resetUrl: url });
        },
      },
      // Bloqueia login de usuário desativado. Login por e-mail/senha é uma
      // sessão RETORNANDO (não passa por `validateUserInfo`, que só roda em
      // create-user/link-account/sign-in de provider OAuth — ver o próprio
      // aviso no tipo dele em @better-auth/core) — `session.create.before`
      // é o ponto documentado para isso. Lançar `APIError` (em vez de só
      // retornar `false`) garante uma mensagem clara pro cliente, não um
      // bloqueio silencioso.
      databaseHooks: {
        session: {
          create: {
            before: async (session) => {
              const rows = await db.select({ active: schema.user.active }).from(schema.user).where(eq(schema.user.id, session.userId)).limit(1);
              if (rows[0] && rows[0].active === false) {
                throw new APIError("FORBIDDEN", {
                  code: "ACCOUNT_DISABLED",
                  message: "Esta conta foi desativada. Contate o administrador.",
                });
              }
            },
          },
        },
      },
    }),
  );
}

export type Auth = ReturnType<typeof createAuth>;
