import type { BetterAuthOptions } from "better-auth";

/**
 * Opções do Better Auth compartilhadas entre:
 *  - `auth.config.ts` (raiz): usado só pelo CLI (`npx auth generate`) para
 *    gerar o schema Drizzle — roda com um adapter "falso", nunca conecta a
 *    um banco real.
 *  - `src/server/auth/index.ts`: instância real criada por request, com o
 *    binding D1 vindo de `c.env`.
 *
 * Mantém as duas em sincronia sem duplicar a config de plugins/opções.
 */
export function buildAuthOptions(
  database: BetterAuthOptions["database"],
  overrides: Partial<BetterAuthOptions> = {},
): BetterAuthOptions {
  return {
    database,
    emailAndPassword: {
      enabled: true,
      autoSignIn: true,
    },
    ...overrides,
  };
}
