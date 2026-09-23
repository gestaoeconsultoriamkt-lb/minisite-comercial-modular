import { Hono } from "hono";
import { getDb } from "../db";
import { getSession } from "../auth/session";
import { findOwned } from "./minisites";
import { migrateMiniSiteConfig } from "../../shared/schemas/migrateMiniSiteConfig";
import { renderMiniSitePage } from "../render/renderMiniSitePage";
import type { AppEnv } from "../types";

/**
 * `/preview/:id` — pré-visualização autenticada do DRAFT ("preview" já é um
 * slug reservado, ver reservedSlugs.ts). Existe porque o botão
 * "Pré-visualizar" (Editor e Layout e Publicação) precisa abrir uma aba
 * externa mostrando exatamente o que o autosave já gravou em `config_json`
 * — inclusive alterações ainda não publicadas — sem depender do mockup
 * lateral (client-side) nem do `/:slug` público, que a partir da separação
 * draft × published passou a servir o SNAPSHOT PUBLICADO para MiniSites
 * `active` mesmo para o dono (ver src/server/routes/public.ts).
 *
 * Somente leitura: nunca chama `ensurePublishedSnapshot`, nunca escreve em
 * `published_config_json`/`published_at`, nunca altera `status`. Exige
 * sessão do próprio dono (mesmo guard de `/app/*`) — sem token novo, sem
 * infraestrutura extra. `noindex` é sempre true, independente do status do
 * MiniSite, então o draft nunca é indexável mesmo que a rota vaze via link.
 */
export const previewRoutes = new Hono<AppEnv>();

previewRoutes.get("/preview/:id", async (c) => {
  const session = await getSession(c.env, c.req.raw);
  if (!session) return c.redirect("/login", 302);

  const db = getDb(c.env);
  const row = await findOwned(db, c.req.param("id"), session.user.id);
  if (!row) return c.notFound();

  const { config } = migrateMiniSiteConfig(row.configJson, row.configVersion);
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
      noindex: true,
    }),
  );
});
