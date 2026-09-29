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
 *
 * `overrides` exclui `user` de propósito (nenhum dos dois chamadores
 * precisa sobrescrever `additionalFields`) — e o retorno usa `satisfies
 * BetterAuthOptions`, não `: BetterAuthOptions`, para não alargar o
 * literal de `user.additionalFields`. A inferência de
 * `session.user.role`/`.active`/`.mustChangePassword` (usada em
 * middleware/authGuards.ts no servidor e via `inferAdditionalFields` no
 * client, ver admin/lib/authClient.ts) depende do TypeScript preservar
 * esse literal exato até `betterAuth(...)`.
 */
export function buildAuthOptions(
  database: BetterAuthOptions["database"],
  overrides: Partial<Omit<BetterAuthOptions, "user">> = {},
) {
  return {
    database,
    emailAndPassword: {
      enabled: true,
      autoSignIn: true,
    },
    /**
     * Campos extras do `user` — via Better Auth `additionalFields`, sem
     * autenticação paralela nem tabela própria. `input: false` em todos:
     * nunca vêm do corpo de uma requisição pública (cadastro/atualização de
     * perfil), só são escritos por rotas administrativas server-side (ver
     * src/server/routes/users.ts).
     *
     * `defaultValue` só vale para registros novos criados pela própria lib
     * (não gera DEFAULT no banco) — usuários que já existiam antes desta
     * migration recebem `role: "admin"` e `active: true`/`mustChangePassword:
     * false` via UPDATE explícito na própria migration (ver
     * drizzle/migrations), não por este default. Isso preserva o acesso do
     * administrador atual exatamente como já funcionava.
     */
    user: {
      additionalFields: {
        role: { type: "string", defaultValue: "user", input: false },
        active: { type: "boolean", defaultValue: true, input: false },
        mustChangePassword: { type: "boolean", defaultValue: false, input: false },
      },
    },
    ...overrides,
  } satisfies BetterAuthOptions;
}
