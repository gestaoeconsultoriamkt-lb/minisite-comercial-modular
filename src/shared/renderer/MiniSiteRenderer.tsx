import type { MiniSiteConfig } from "../schemas/miniSiteConfig";
import { getAssetUrl } from "../assetUrl";

export interface MiniSiteRendererProps {
  displayName: string;
  config: MiniSiteConfig;
}

/**
 * Spike técnico da Fase 0: componente React usado TANTO no preview ao vivo
 * do editor (client-side) QUANTO no SSR da página pública (server-side, via
 * renderToStaticMarkup). Nenhuma API de browser (window/document/localStorage)
 * pode ser usada aqui — é o que garante que ele rode nos dois ambientes.
 *
 * O visual completo (header, botões, catálogo, galeria etc.) é implementado
 * nas fases seguintes; aqui só existe o suficiente para provar o mecanismo.
 */
export function MiniSiteRenderer({ displayName, config }: MiniSiteRendererProps) {
  const { headline, shortDescription } = config.header;
  const coverKey = config.appearance.coverKey;

  return (
    <div className="minisite-root">
      {coverKey ? <img className="minisite-cover" src={getAssetUrl(coverKey)} alt="" /> : null}
      <h1 className="minisite-name">{displayName}</h1>
      {headline ? <p className="minisite-headline">{headline}</p> : null}
      {shortDescription ? <p className="minisite-description">{shortDescription}</p> : null}
    </div>
  );
}
