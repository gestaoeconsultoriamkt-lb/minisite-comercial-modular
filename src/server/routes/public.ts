import { Hono } from "hono";
import { eq } from "drizzle-orm";
import { getDb } from "../db";
import { minisites } from "../db/schema";
import { migrateMiniSiteConfig } from "../../shared/schemas/migrateMiniSiteConfig";
import { isReservedSlug, isValidSlugFormat } from "../../shared/reservedSlugs";
import { renderMiniSitePage } from "../render/renderMiniSitePage";
import type { AppEnv } from "../types";

/**
 * `/:slug` — SSR público. Lê o MiniSite real por slug e renderiza com o
 * `MiniSiteRenderer` compartilhado (mesmo componente do preview do editor).
 * Sem checagem de status/dono ainda (qualquer status renderiza para quem
 * tiver o link) — isso, cache e a publicação "de verdade" ficam para a
 * Fase 4; aqui só se garante que Abrir/Pré-visualizar mostrem dado real.
 */
export const publicRoutes = new Hono<AppEnv>();

publicRoutes.get("/:slug", async (c) => {
  const slug = c.req.param("slug");

  if (!isValidSlugFormat(slug) || isReservedSlug(slug)) {
    return c.notFound();
  }

  const db = getDb(c.env);
  const rows = await db.select().from(minisites).where(eq(minisites.slug, slug)).limit(1);
  const row = rows[0];
  if (!row) return c.notFound();

  const { config } = migrateMiniSiteConfig(row.configJson, row.configVersion);
  const displayName = config.header.displayName || row.internalName;

  return c.html(renderMiniSitePage(displayName, config));
});
