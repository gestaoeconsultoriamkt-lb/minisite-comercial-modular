/**
 * Config "somente para o CLI" (`npx auth generate` / `npx auth migrate`).
 * O adapter aqui nunca conecta a um banco real — existe só para o gerador
 * de schema introspectar o dialect ("sqlite", usado pelo D1) e as opções
 * (plugins, campos extras etc.) e produzir `src/server/db/auth-schema.ts`.
 *
 * A instância real, usada pelo Worker em runtime com o binding D1 real,
 * está em `src/server/auth/index.ts`.
 */
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { drizzle } from "drizzle-orm/sqlite-proxy";
import { buildAuthOptions } from "./src/server/auth/sharedOptions";

const cliOnlyDb = drizzle(async () => ({ rows: [] }));

export const auth = betterAuth(
  buildAuthOptions(drizzleAdapter(cliOnlyDb, { provider: "sqlite" })),
);
