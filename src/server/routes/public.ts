import { Hono } from "hono";
import { eq } from "drizzle-orm";
import { getDb } from "../db";
import { minisites } from "../db/schema";
import { getSession } from "../auth/session";
import { migrateMiniSiteConfig } from "../../shared/schemas/migrateMiniSiteConfig";
import { isReservedSlug, isValidSlugFormat } from "../../shared/reservedSlugs";
import { renderMiniSitePage, renderUnavailablePage } from "../render/renderMiniSitePage";
import type { AppEnv } from "../types";

/**
 * `/:slug` — SSR público, ciente de status (§18 da Fase 4):
 *   active   -> acesso público normal, indexável.
 *   draft    -> só o dono autenticado (senão 404, como se não existisse).
 *   disabled -> visitante anônimo vê uma página mínima "indisponível"
 *               (noindex); o dono continua vendo o conteúdo normal.
 * Nunca cria mecanismo de token — reaproveita a sessão/cookie já existente.
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

  if (row.status !== "active") {
    const session = await getSession(c.env, c.req.raw);
    const isOwner = session?.user.id === row.ownerUserId;

    if (!isOwner) {
      if (row.status === "disabled") return c.html(renderUnavailablePage());
      return c.notFound(); // draft: visitante anônimo não deve saber que existe
    }
  }

  const { config } = migrateMiniSiteConfig(row.configJson, row.configVersion);
  const displayName = config.header.displayName || row.internalName;
  const origin = new URL(c.req.url).origin;

  return c.html(
    renderMiniSitePage({
      displayName,
      config,
      slug: row.slug,
      origin,
      noindex: row.status !== "active",
    }),
  );
});
