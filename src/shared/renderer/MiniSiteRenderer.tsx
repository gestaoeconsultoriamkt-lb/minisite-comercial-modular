import type { ReactNode } from "react";
import type { MiniSiteConfig } from "../schemas/miniSiteConfig";
import { getAssetUrl } from "../assetUrl";
import { SOCIAL_ICONS } from "../icons";
import { getOrderedModules, type ModuleKey } from "../moduleOrder";
import { GallerySection } from "./GallerySection";
import { ButtonsSection } from "./ButtonsSection";
import { CatalogSection } from "./CatalogSection";
import { LocationSection } from "./LocationSection";

export interface MiniSiteRendererProps {
  displayName: string;
  config: MiniSiteConfig;
}

const MODULE_COMPONENTS: Record<ModuleKey, (config: MiniSiteConfig) => ReactNode> = {
  gallery: (config) => <GallerySection config={config} />,
  actionButtons: (config) => <ButtonsSection config={config} />,
  catalog: (config) => <CatalogSection config={config} />,
  location: (config) => <LocationSection config={config} />,
};

/**
 * Componente único, compartilhado entre o preview do editor (client,
 * hidratado) e o SSR público (renderToStaticMarkup) — nunca toca
 * window/localStorage/APIs exclusivas do browser durante o render em si
 * (só dentro de handlers, que nunca rodam no SSR puro).
 *
 * Header sempre primeiro, rodapé social sempre por último; os módulos do
 * meio seguem `getOrderedModules` (deriva de `config.moduleOrder`,
 * normalizado — ver src/shared/moduleOrder.ts).
 */
export function MiniSiteRenderer({ displayName, config }: MiniSiteRendererProps) {
  const { appearance, header, footer } = config;
  const isCompact = header.variant === "compact";

  const socialEntries = (Object.keys(SOCIAL_ICONS) as (keyof typeof SOCIAL_ICONS)[])
    .map((platform) => ({ platform, url: config.socialLinks[platform] }))
    .filter((entry): entry is { platform: keyof typeof SOCIAL_ICONS; url: string } => Boolean(entry.url));

  // Fundo da página: só usa a imagem de fundo dedicada (`backgroundKey`).
  // A capa NUNCA assume esse papel por conta própria — ela é usada de
  // fato na hero, abaixo. Sem fundo dedicado, cai num gradiente estável
  // com as cores da marca (nunca um cinza genérico).
  const pageBackgroundKey = appearance.backgroundKey;
  const fallbackBackground = `linear-gradient(160deg, ${appearance.colorSecondary || "#0f1d45"}, ${appearance.colorPrimary || "#1d4ed8"})`;

  return (
    <div className="minisite-root relative isolate min-h-full overflow-hidden" style={!pageBackgroundKey ? { background: fallbackBackground } : undefined}>
      {pageBackgroundKey ? (
        <img src={getAssetUrl(pageBackgroundKey)} alt="" aria-hidden className="absolute inset-0 h-full w-full scale-110 object-cover blur-xl" />
      ) : null}
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/80" aria-hidden />

      <div className="relative z-10 mx-auto w-full max-w-md">
        {/* Hero: a capa (quando houver) fica só aqui, atrás do logo/nome/título,
            com um overlay leve só para legibilidade — nunca desfocada e nunca
            usada como fundo do restante da página. */}
        <div className="relative overflow-hidden">
          {appearance.coverKey ? (
            <>
              <img src={getAssetUrl(appearance.coverKey)} alt="" aria-hidden className="absolute inset-0 h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/35 to-black/65" aria-hidden />
            </>
          ) : null}

          <div className={`relative z-10 flex flex-col items-center px-5 pb-6 text-center ${isCompact ? "pt-8" : "pt-12"}`}>
            {appearance.logoKey ? (
              <img
                src={getAssetUrl(appearance.logoKey)}
                alt={displayName}
                className={`rounded-2xl border-2 border-white/80 object-cover shadow-lg ${isCompact ? "h-16 w-16" : "h-24 w-24"}`}
              />
            ) : null}

            <h1 className={`mt-4 font-extrabold text-white ${isCompact ? "text-xl" : "text-2xl"}`}>{displayName}</h1>
            {header.headline ? (
              <p className={`mt-1 font-semibold text-white/90 ${isCompact ? "text-sm" : "text-base"}`}>{header.headline}</p>
            ) : null}
            {header.shortDescription ? (
              <p className="mt-1 text-xs uppercase tracking-wide text-white/70">{header.shortDescription}</p>
            ) : null}
          </div>
        </div>

        <div className="flex flex-col items-center px-5 pb-10 text-center">
          {getOrderedModules(config).map((key) => (
            <div key={key} className="w-full">
              {MODULE_COMPONENTS[key](config)}
            </div>
          ))}

          {footer.showSocialIcons && socialEntries.length > 0 ? (
            <div className="mt-8 flex items-center gap-4">
              {socialEntries.map(({ platform, url }) => {
                const Icon = SOCIAL_ICONS[platform];
                return (
                  <a key={platform} href={url} target="_blank" rel="noopener noreferrer" className="text-white/80 hover:text-white">
                    <Icon className="h-5 w-5" />
                  </a>
                );
              })}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
