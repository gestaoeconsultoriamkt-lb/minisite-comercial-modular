import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields } from "better-auth/client/plugins";

/**
 * Schema passado direto (não `inferAdditionalFields<Auth>()` com o tipo do
 * servidor) — o projeto do admin (tsconfig.app.json) e o do Worker
 * (tsconfig.worker.json) são propositalmente isolados um do outro (o
 * Worker usa globais só dele, tipo `D1Database`); importar um tipo de
 * `src/server/*` aqui quebra esse isolamento no build. Precisa ficar em
 * sincronia manual com `additionalFields` em server/auth/sharedOptions.ts
 * — só os nomes/tipos, sem `defaultValue`/`input` (irrelevantes no
 * cliente). Dá a `session.user` os campos extras
 * (`role`/`active`/`mustChangePassword`) como propriedades tipadas de
 * verdade, em vez de precisar de cast manual em todo lugar que os lê
 * (RequireAuth, LoginPage, UsersPage etc.).
 */
export const authClient = createAuthClient({
  baseURL: typeof window !== "undefined" ? window.location.origin : undefined,
  plugins: [
    inferAdditionalFields({
      user: {
        role: { type: "string" },
        active: { type: "boolean" },
        mustChangePassword: { type: "boolean" },
      },
    }),
  ],
});
