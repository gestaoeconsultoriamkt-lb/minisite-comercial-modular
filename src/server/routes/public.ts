import { Hono } from "hono";
import { eq } from "drizzle-orm";
import { getDb } from "../db";
import { minisites, type MiniSiteRow } from "../db/schema";
import { ensurePublishedSnapshot, hasPublishedSnapshot } from "../db/publishedSnapshot";
import { getSession } from "../auth/session";
import { migrateMiniSiteConfig, type MigratedMiniSiteConfig } from "../../shared/schemas/migrateMiniSiteConfig";
import { isReservedSlug, isValidSlugFormat } from "../../shared/reservedSlugs";
import { renderMiniSitePage, renderUnavailablePage } from "../render/renderMiniSitePage";
import { safeErrorMessage } from "../safeErrorMessage";
import type { AppEnv } from "../types";

/**
 * Loga o suficiente pra diagnosticar em Observability (nome/mensagem real
 * do erro, issues do Zod quando for `ZodError`) sem nunca incluir o
 * conteúdo bruto do `config_json` (pode ter telefone/endereço do negócio).
 * Zod v4 não inclui o valor recebido em `issues`, só tipo esperado/recebido
 * e o `path` do campo — seguro de logar.
 */
function logConfigMigrationFailure(source: "published" | "draft", row: Pick<MiniSiteRow, "id" | "slug" | "status">, error: unknown) {
  const isZodError = error instanceof Error && error.name === "ZodError";
  console.error("public route: falha ao migrar config do MiniSite", {
    minisiteId: row.id,
    slug: row.slug,
    status: row.status,
    source,
    errorName: error instanceof Error ? error.name : typeof error,
    errorMessage: safeErrorMessage(error),
    zodIssues: isZodError ? (error as unknown as { issues: unknown }).issues : undefined,
  });
}

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
  const usePublished = ensuredRow.status === "active" && hasPublishedSnapshot(ensuredRow);

  // Nunca deixa um config legado/corrompido derrubar a rota pública com um
  // 500 opaco: se o snapshot publicado falhar ao migrar/validar, cai para
  // o draft (ainda é o melhor conteúdo disponível); se os dois falharem,
  // serve a mesma página mínima "indisponível" do status `disabled`, com o
  // erro real registrado no log do Worker (Observability) para diagnóstico
  // — nunca a stack trace crua exposta ao visitante.
  function tryMigrate(source: "published" | "draft"): MigratedMiniSiteConfig | null {
    try {
      // `source === "published"` só é tentado quando `usePublished` já
      // confirmou `hasPublishedSnapshot(ensuredRow)` — a narrowing do
      // type guard não atravessa o booleano `usePublished` até aqui.
      return source === "published"
        ? migrateMiniSiteConfig(ensuredRow.publishedConfigJson as string, ensuredRow.publishedConfigVersion as number)
        : migrateMiniSiteConfig(ensuredRow.configJson, ensuredRow.configVersion);
    } catch (error) {
      logConfigMigrationFailure(source, ensuredRow, error);
      return null;
    }
  }

  const migrated = (usePublished ? tryMigrate("published") : null) ?? tryMigrate("draft");
  if (!migrated) {
    return c.html(renderUnavailablePage());
  }
  const { config } = migrated;
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
