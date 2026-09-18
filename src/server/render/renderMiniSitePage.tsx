import { renderToStaticMarkup } from "react-dom/server";
import { MiniSiteRenderer } from "../../shared/renderer";
import { getAssetUrl } from "../../shared/assetUrl";
import type { MiniSiteConfig } from "../../shared/schemas/miniSiteConfig";
// CSS do mesmo Tailwind usado no admin, embutida inline como string — o
// renderer público é servido puro pelo Worker (sem o HTML/manifest do
// admin), então não há um <link> de asset com hash para apontar.
import publicStyles from "../../admin/styles.css?inline";

export interface RenderMiniSitePageOptions {
  displayName: string;
  config: MiniSiteConfig;
  slug: string;
  origin: string;
  /** true para draft/disabled (só o dono vê) — nunca deve ser indexado. */
  noindex: boolean;
}

function escapeHtml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/**
 * SSR real: renderiza o MESMO componente usado no preview do editor/layout
 * (LivePreview) com o `config` real de um MiniSite, mais SEO básico
 * (title/description/OG). Sem hidratação — HTML estático puro.
 */
export function renderMiniSitePage({ displayName, config, slug, origin, noindex }: RenderMiniSitePageOptions): string {
  const body = renderToStaticMarkup(<MiniSiteRenderer displayName={displayName} config={config} />);

  const description = config.header.shortDescription || config.header.headline || "";
  const imageKey = config.appearance.coverKey || config.appearance.logoKey;
  const ogImage = imageKey ? `${origin}${getAssetUrl(imageKey)}` : null;
  const pageUrl = `${origin}/${slug}`;
  const title = escapeHtml(displayName);
  const safeDescription = escapeHtml(description);

  return `<!DOCTYPE html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${title}</title>
    ${description ? `<meta name="description" content="${safeDescription}" />` : ""}
    ${noindex ? `<meta name="robots" content="noindex, nofollow" />` : ""}
    <meta property="og:type" content="website" />
    <meta property="og:title" content="${title}" />
    ${description ? `<meta property="og:description" content="${safeDescription}" />` : ""}
    ${ogImage ? `<meta property="og:image" content="${escapeHtml(ogImage)}" />` : ""}
    <meta property="og:url" content="${escapeHtml(pageUrl)}" />
    <style>${publicStyles}</style>
  </head>
  <body>${body}</body>
</html>`;
}

/** Página mínima para `disabled` visto por visitante anônimo — sem expor config interna. */
export function renderUnavailablePage(): string {
  return `<!DOCTYPE html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="robots" content="noindex, nofollow" />
    <title>MiniSite indisponível</title>
    <style>${publicStyles}</style>
  </head>
  <body class="flex min-h-dvh items-center justify-center bg-brand-navy-950 px-6 text-center">
    <div>
      <p class="text-lg font-bold text-white">MiniSite temporariamente indisponível</p>
      <p class="mt-2 text-sm text-white/60">Volte mais tarde.</p>
    </div>
  </body>
</html>`;
}
