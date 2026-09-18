import { renderToStaticMarkup } from "react-dom/server";
import { MiniSiteRenderer } from "../../shared/renderer";
import { createDefaultMiniSiteConfig } from "../../shared/schemas/migrateMiniSiteConfig";

/**
 * Spike técnico da Fase 0: prova que o Worker consegue rodar
 * `react-dom/server` (renderToStaticMarkup) usando o MESMO componente que o
 * preview do editor vai usar no client. Sem hidratação — HTML estático puro.
 *
 * Não busca dado real de `minisites`/D1 ainda (isso é a página pública real,
 * fora do escopo desta fase); usa o slug como nome de exibição só para
 * provar o mecanismo fim a fim.
 */
export function renderMiniSitePage(slug: string): string {
  const config = createDefaultMiniSiteConfig();
  const body = renderToStaticMarkup(<MiniSiteRenderer displayName={slug} config={config} />);

  return `<!DOCTYPE html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${slug} — MiniSite</title>
  </head>
  <body>${body}</body>
</html>`;
}
