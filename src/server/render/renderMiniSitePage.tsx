import { renderToStaticMarkup } from "react-dom/server";
import { MiniSiteRenderer } from "../../shared/renderer";
import { getAssetUrl } from "../../shared/assetUrl";
import { findButton, isButtonReady } from "../../shared/actionButtons";
import { getFilledSocialEntries } from "../../shared/socialLinks";
import { TYPOGRAPHY_FONT_LINK_HREF } from "../../shared/typography";
import type { MiniSiteConfig } from "../../shared/schemas/miniSiteConfig";
// CSS do mesmo Tailwind usado no admin, embutida inline como string — o
// renderer público é servido puro pelo Worker (sem o HTML/manifest do
// admin), então não há um <link> de asset com hash para apontar.
import publicStyles from "../../admin/styles.css?inline";

export interface RenderMiniSitePageOptions {
  /** Nome público da hero — opcional, string vazia não renderiza nada (ver MiniSiteRenderer). */
  heroDisplayName: string;
  /** <title>/og:title — sempre tem valor (cai no nome interno se não houver nome público). */
  seoTitle: string;
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
 * JSON-LD `LocalBusiness` só com dados reais/configurados — nunca inventa
 * horário, avaliação, preço ou coordenada. Cada propriedade opcional só
 * entra no objeto quando o dado correspondente realmente existe.
 */
function buildLocalBusinessJsonLd(config: MiniSiteConfig, name: string, pageUrl: string, image: string | null): Record<string, unknown> {
  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name,
    url: pageUrl,
  };
  if (image) jsonLd.image = image;

  const telefoneButton = findButton(config, "telefone");
  const telephone =
    telefoneButton && isButtonReady(telefoneButton, config) && typeof telefoneButton.value.phone === "string" ? telefoneButton.value.phone : null;
  if (telephone) jsonLd.telephone = telephone;

  const location = config.location;
  if (location?.address) {
    jsonLd.address = {
      "@type": "PostalAddress",
      streetAddress: location.address,
      ...(location.city ? { addressLocality: location.city } : {}),
      ...(location.state ? { addressRegion: location.state } : {}),
    };
  }

  const sameAs = getFilledSocialEntries(config.socialLinks).map((entry) => entry.href);
  if (sameAs.length > 0) jsonLd.sameAs = sameAs;

  return jsonLd;
}

/** Serializa JSON-LD para dentro de uma <script> com segurança — escapa `<` para nunca fechar a tag prematuramente. */
function serializeJsonLd(data: Record<string, unknown>): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

/**
 * SSR real: renderiza o MESMO componente usado no preview do editor/layout
 * (LivePreview) com o `config` real de um MiniSite, mais SEO básico
 * (title/description/OG). Sem hidratação — HTML estático puro.
 */
export function renderMiniSitePage({ heroDisplayName, seoTitle, config, slug, origin, noindex }: RenderMiniSitePageOptions): string {
  const body = renderToStaticMarkup(<MiniSiteRenderer displayName={heroDisplayName} config={config} />);

  const description = config.header.shortDescription || config.header.headline || "";
  const imageKey = config.appearance.coverKey || config.appearance.logoKey;
  const ogImage = imageKey ? `${origin}${getAssetUrl(imageKey)}` : null;
  const pageUrl = `${origin}/${slug}`;
  const title = escapeHtml(seoTitle);
  const safeDescription = escapeHtml(description);
  const jsonLd = serializeJsonLd(buildLocalBusinessJsonLd(config, seoTitle, pageUrl, ogImage));
  // Só a família do preset tipográfico escolhido (ver src/shared/typography.ts)
  // — diferente do admin, que pré-carrega as 3 de uma vez para o LivePreview.
  const fontHref = TYPOGRAPHY_FONT_LINK_HREF[config.appearance.typographyPreset];

  return `<!DOCTYPE html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${title}</title>
    ${description ? `<meta name="description" content="${safeDescription}" />` : ""}
    ${noindex ? `<meta name="robots" content="noindex, nofollow" />` : ""}
    <link rel="canonical" href="${escapeHtml(pageUrl)}" />
    <meta property="og:type" content="website" />
    <meta property="og:title" content="${title}" />
    ${description ? `<meta property="og:description" content="${safeDescription}" />` : ""}
    ${ogImage ? `<meta property="og:image" content="${escapeHtml(ogImage)}" />` : ""}
    <meta property="og:url" content="${escapeHtml(pageUrl)}" />
    <script type="application/ld+json">${jsonLd}</script>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link rel="stylesheet" href="${fontHref}" />
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
