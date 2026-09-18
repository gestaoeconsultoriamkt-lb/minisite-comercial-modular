import { Hono } from "hono";
import { isReservedSlug, isValidSlugFormat } from "../../shared/reservedSlugs";
import { renderMiniSitePage } from "../render/renderMiniSitePage";
import type { AppEnv } from "../types";

/**
 * `/:slug` — spike técnico de SSR público (ver render/renderMiniSitePage).
 * Ainda não consulta `minisites` no D1: a página pública real (draft vs.
 * active, 404 de fato, dono/preview) é escopo de fase futura. Aqui só se
 * prova o mecanismo de renderização + a checagem de slug reservado.
 */
export const publicRoutes = new Hono<AppEnv>();

publicRoutes.get("/:slug", (c) => {
  const slug = c.req.param("slug");

  if (!isValidSlugFormat(slug) || isReservedSlug(slug)) {
    return c.notFound();
  }

  return c.html(renderMiniSitePage(slug));
});
