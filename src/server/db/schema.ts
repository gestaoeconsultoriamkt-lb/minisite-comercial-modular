import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";
import { user } from "./auth-schema";

/**
 * Tabela única do domínio (modelo híbrido/documental): só o que precisa ser
 * consultado/indexado vira coluna. Toda a configuração modular (aparência,
 * header, botões, redes sociais, pix, wifi, localização, galeria, seções,
 * cards, ordem dos módulos) vive em `config_json`, validada por
 * `miniSiteConfigSchema` (ver src/shared/schemas). Autosave = um único UPDATE.
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
