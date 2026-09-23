import { Hono } from "hono";
import { eq } from "drizzle-orm";
import { getDb } from "../db";
import { minisites } from "../db/schema";
import { ensurePublishedSnapshot } from "../db/publishedSnapshot";
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

  // Visitante público num MiniSite ativo vê o SNAPSHOT PUBLICADO — nunca o
  // draft de trabalho; autosave nunca altera o que está no ar (ver
  // src/server/db/publishedSnapshot.ts). O dono vendo seu próprio MiniSite
  // ainda em draft/disabled continua vendo o draft atual (é a prévia dele).
  // `ensurePublishedSnapshot` formaliza, sem apagar nada, o config atual
  // como primeiro snapshot de MiniSites `active` antigos que nunca tiveram
  // essa separação.
  const ensuredRow = await ensurePublishedSnapshot(db, row);
  const usePublished = ensuredRow.status === "active" && ensuredRow.publishedConfigJson !== null && ensuredRow.publishedConfigVersion !== null;
  const { config } = usePublished
    ? migrateMiniSiteConfig(ensuredRow.publishedConfigJson!, ensuredRow.publishedConfigVersion!)
    : migrateMiniSiteConfig(ensuredRow.configJson, ensuredRow.configVersion);
  // Nome público na hero é opcional (sem fallback); <title>/og:title sempre
  // precisa de um valor, então esse sim cai no nome interno.
  const heroDisplayName = config.header.displayName ?? "";
  const seoTitle = config.header.displayName || row.internalName;
  const origin = new URL(c.req.url).origin;

  return c.html(
    renderMiniSitePage({
      heroDisplayName,
      seoTitle,
      config,
      slug: row.slug,
      origin,
      noindex: row.status !== "active",
    }),
  );
});
