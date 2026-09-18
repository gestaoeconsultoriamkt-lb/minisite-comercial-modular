import { defineConfig } from "drizzle-kit";

/**
 * Só gera migrations SQL a partir do schema (não faz "push" remoto — não
 * exige credenciais Cloudflare). Aplicar as migrations geradas é feito com
 * `wrangler d1 migrations apply <DB> --local` (dev) ou `--remote` (produção,
 * depois que o D1 real existir).
 */
export default defineConfig({
  dialect: "sqlite",
  schema: "./src/server/db/schema.ts",
  out: "./drizzle/migrations",
});
