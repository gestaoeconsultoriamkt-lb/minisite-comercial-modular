import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";
import { user } from "./auth-schema";

/**
 * Tabela única do domínio (modelo híbrido/documental): só o que precisa ser
 * consultado/indexado vira coluna. Toda a configuração modular (aparência,
 * header, botões, redes sociais, pix, wifi, localização, galeria, seções,
 * cards, ordem dos módulos) vive em `config_json`, validada por
 * `miniSiteConfigSchema` (ver src/shared/schemas).
 *
 * Draft × Published: `config_json`/`config_version` são a versão de
 * TRABALHO — autosave grava só aqui, e é o que o editor/preview sempre lê.
 * `published_config_json`/`published_config_version` são o SNAPSHOT
 * público — só mudam quando o usuário clica em "Publicar" (ver
 * POST /:id/publish). A página pública lê o snapshot publicado, nunca o
 * draft — autosave nunca altera o que está no ar. As colunas de snapshot
 * são nullable de propósito: registros antigos (ativos antes dessa
 * separação existir) não têm snapshot ainda; `ensurePublishedSnapshot()`
 * faz o backfill lógico (usa o config atual como primeiro snapshot) sem
 * apagar nem exigir migração manual.
 */
export const minisites = sqliteTable(
  "minisites",
  {
    id: text("id").primaryKey(),
    ownerUserId: text("owner_user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    slug: text("slug").notNull().unique(),
    internalName: text("internal_name").notNull(),
    niche: text("niche"),
    status: text("status", { enum: ["draft", "active", "disabled"] })
      .notNull()
      .default("draft"),

    configJson: text("config_json").notNull(),
    configVersion: integer("config_version").notNull().default(1),
    publishedConfigJson: text("published_config_json"),
    publishedConfigVersion: integer("published_config_version"),

    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
    publishedAt: text("published_at"),
  },
  (table) => [
    index("minisites_owner_user_id_idx").on(table.ownerUserId),
    index("minisites_status_idx").on(table.status),
  ],
);

export type MiniSiteRow = typeof minisites.$inferSelect;
export type NewMiniSiteRow = typeof minisites.$inferInsert;

// Reexporta o schema gerado pelo Better Auth (user/session/account/verification)
// para que drizzle-kit enxergue todas as tabelas a partir de um único ponto.
export * from "./auth-schema";
