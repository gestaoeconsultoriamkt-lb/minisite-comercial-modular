import { renderToStaticMarkup } from "react-dom/server";
import { MiniSiteRenderer } from "../../shared/renderer";
import type { MiniSiteConfig } from "../../shared/schemas/miniSiteConfig";
// CSS do mesmo Tailwind usado no admin, embutida inline como string — o
// renderer público é servido puro pelo Worker (sem o HTML/manifest do
// admin), então não há um <link> de asset com hash para apontar.
import publicStyles from "../../admin/styles.css?inline";

/**
 * SSR real: renderiza o MESMO componente usado no preview do editor
 * (LivePreview) com o `config` real de um MiniSite. Continua sem
 * hidratação (HTML estático puro) — a página pública final com
 * cache/publicação de verdade é escopo da Fase 4; isto só faz o spike da
 * Fase 0 consultar dados reais em vez de um config vazio.
 */
export function renderMiniSitePage(displayName: string, config: MiniSiteConfig): string {
  const body = renderToStaticMarkup(<MiniSiteRenderer displayName={displayName} config={config} />);

  return `<!DOCTYPE html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${displayName} — MiniSite</title>
    <style>${publicStyles}</style>
  </head>
  <body>${body}</body>
</html>`;
}
