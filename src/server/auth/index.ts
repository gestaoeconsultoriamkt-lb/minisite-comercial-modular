import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
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
    }),
  );
}

export type Auth = ReturnType<typeof createAuth>;
