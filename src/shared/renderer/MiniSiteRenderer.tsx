import { useId, type ReactNode } from "react";
import type { MiniSiteConfig } from "../schemas/miniSiteConfig";
import { getAssetUrl } from "../assetUrl";
import { SOCIAL_ICONS } from "../icons";
import { getFilledSocialEntries } from "../socialLinks";
import { getOrderedModules, type ModuleKey } from "../moduleOrder";
import { GallerySection } from "./GallerySection";
import { ButtonsSection } from "./ButtonsSection";
import { CatalogSection } from "./CatalogSection";
import { LocationSection } from "./LocationSection";

export interface MiniSiteRendererProps {
  /** Nome público exibido na hero — opcional; string vazia não renderiza nada (nunca cai no nome interno). */
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
 * Placa branca por trás da logo (`logoTreatment: "plate"`, default) — dá
 * legibilidade a qualquer logo (circular, quadrada, transparente,
 * retangular) sem distorcer (object-contain). Um leve sheen/gradiente
 * interno e um anel duplo (branco + sombra) fazem parecer uma "medalha"
 * intencional, não um quadrado branco jogado atrás. `logoTreatment: "none"`
 * pula a placa — para logos que já têm fundo/contexto próprio.
 */
function LogoPlate({
  logoKey,
  alt,
  size,
  treatment,
}: {
  logoKey: string;
  alt: string;
  size: "compact" | "normal" | "floating";
  treatment: "plate" | "none";
}) {
  const dimension = size === "compact" ? "h-24 w-24" : size === "floating" ? "h-28 w-28 sm:h-32 sm:w-32" : "h-32 w-32";

  if (treatment === "none") {
    return (
      <div className={`flex shrink-0 items-center justify-center drop-shadow-[0_4px_14px_rgba(0,0,0,0.35)] ${dimension}`}>
        <img src={getAssetUrl(logoKey)} alt={alt} className="h-full w-full object-contain" />
      </div>
    );
  }

  return (
    <div
      className={`relative flex shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white p-2.5 shadow-[0_8px_20px_rgba(0,0,0,0.28)] ring-1 ring-black/5 ${dimension}`}
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white via-white to-slate-50" aria-hidden />
      <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-white" aria-hidden />
      <img src={getAssetUrl(logoKey)} alt={alt} className="relative z-10 h-full w-full object-contain" />
    </div>
  );
}

/** Nome/headline/descrição — mesmo bloco de texto usado tanto com a logo "sobre a capa" quanto "flutuante" (ver logoPosition). */
function HeroTextBlock({
  displayName,
  headline,
  shortDescription,
  isCompact,
}: {
  displayName: string;
  headline?: string;
  shortDescription?: string;
  isCompact: boolean;
}) {
  return (
    <>
      {displayName ? (
        <h1 className={`font-extrabold leading-tight text-white ${isCompact ? "text-xl" : "text-[28px] sm:text-[32px]"}`}>{displayName}</h1>
      ) : null}
      {headline ? <p className={`mt-2 font-semibold text-white/90 ${isCompact ? "text-sm" : "text-[15px] sm:text-base"}`}>{headline}</p> : null}
      {shortDescription ? <p className="mt-2 text-[13px] font-medium leading-relaxed text-white/70 sm:text-sm">{shortDescription}</p> : null}
    </>
  );
}

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
  const waveClipId = `hero-wave-${useId().replace(/[^a-zA-Z0-9]/g, "")}`;

  // Mesma resolução @handle/domínio/URL completa usada pelos botões de
  // redes sociais no corpo da página — rodapé e corpo nunca discordam
  // sobre o que "conta" como preenchido nem sobre o destino do link.
  const socialEntries = getFilledSocialEntries(config.socialLinks);

  const gradientCss = `linear-gradient(160deg, ${appearance.colorSecondary || "#0f1d45"}, ${appearance.colorPrimary || "#1d4ed8"})`;

  // V1: fundo da página é sempre imagem NÍTIDA quando há `backgroundKey` —
  // sem seletor de estilo no editor (removido). Sem imagem, cai no
  // gradiente da marca. `appearance.backgroundMode` não é mais lido aqui
  // (deprecated no schema, mantido só para não descartar valor antigo).
  const hasBackgroundImage = Boolean(appearance.backgroundKey);

  const floatingLogo = appearance.logoPosition === "floating";
  const hasLogo = Boolean(appearance.logoKey);
  const logoAlt = displayName || "Logo";
  const logoTreatment = appearance.logoTreatment;

  // Formato da base da hero — "reta" não aplica nada; "curva" arredonda a
  // base; "onda" usa um clip-path SVG (objectBoundingBox — responsivo por
  // natureza, sem depender de pixels fixos) para um divisor orgânico leve.
  const heroShapeClass = appearance.heroShape === "curve" ? "rounded-b-[2.75rem]" : "";
  const heroShapeStyle = appearance.heroShape === "wave" ? { clipPath: `url(#${waveClipId})` } : undefined;

  return (
    <div className="minisite-root relative isolate min-h-full overflow-hidden" style={!hasBackgroundImage ? { background: gradientCss } : undefined}>
      {appearance.heroShape === "wave" ? (
        <svg width="0" height="0" className="absolute" aria-hidden>
          <defs>
            <clipPath id={waveClipId} clipPathUnits="objectBoundingBox">
              <path d="M0,0 L1,0 L1,0.86 C0.83,0.98 0.62,0.98 0.5,0.9 C0.38,0.82 0.17,0.82 0,0.94 Z" />
            </clipPath>
          </defs>
        </svg>
      ) : null}

      {hasBackgroundImage ? (
        <img src={getAssetUrl(appearance.backgroundKey!)} alt="" aria-hidden loading="eager" className="absolute inset-0 h-full w-full object-cover" />
      ) : null}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/45 to-black/70" aria-hidden />

      <div className="relative z-10 mx-auto w-full max-w-md">
        {/* Hero: a capa (quando houver) fica só aqui, atrás do logo/nome/título
            quando a logo está "sobre a capa"; com logo "flutuante", a hero é só
            o pano de fundo (capa ou gradiente da marca) — nome/headline/descrição
            e a logo aparecem depois, na transição para o corpo.
            O recorte de formato (curva/onda) fica numa camada de fundo própria,
            separada do conteúdo — recortar o container inteiro cortaria texto
            junto quando a logo está "sobre a capa" (nome/headline moram dentro
            da hero nesse modo). Altura mínima garante uma capa com presença
            mesmo com pouco texto (nome/headline curtos ou ausentes). */}
        <div className={`relative ${floatingLogo ? "h-48 sm:h-56" : "min-h-[15rem] sm:min-h-[17rem]"}`}>
          <div className={`absolute inset-0 overflow-hidden ${heroShapeClass}`} style={heroShapeStyle} aria-hidden>
            {appearance.coverKey ? (
              <>
                <img src={getAssetUrl(appearance.coverKey)} alt="" loading="eager" className="absolute inset-0 h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/35 to-black/65" />
              </>
            ) : (
              // B. Sem capa: nunca deixa a hero "quebrada" — cai no gradiente da
              // marca, mesmo que o fundo da página esteja em modo imagem.
              <div className="absolute inset-0" style={{ background: gradientCss }} />
            )}
          </div>

          {!floatingLogo ? (
            <div className={`relative z-10 flex h-full flex-col items-center justify-center px-5 pb-6 text-center ${isCompact ? "pt-8" : "pt-12"}`}>
              {hasLogo ? <LogoPlate logoKey={appearance.logoKey!} alt={logoAlt} size={isCompact ? "compact" : "normal"} treatment={logoTreatment} /> : null}
              <div className={hasLogo ? "mt-5" : ""}>
                <HeroTextBlock displayName={displayName} headline={header.headline} shortDescription={header.shortDescription} isCompact={isCompact} />
              </div>
            </div>
          ) : null}
        </div>

        {/* V1: corpo é sempre sólido (sem seletor de estilo no editor) —
            `appearance.bodyStyle` não é mais lido aqui (deprecated no
            schema, "acrylic" removido). `pt-6` dá respiro consistente com
            o restante da hero, sem depender de painel translúcido. */}
        <div className="flex flex-col items-center px-5 pb-12 pt-6 text-center">
          {floatingLogo ? (
            <>
              {hasLogo ? (
                <div className="-mt-14 mb-3 flex justify-center sm:-mt-16">
                  <LogoPlate logoKey={appearance.logoKey!} alt={logoAlt} size="floating" treatment={logoTreatment} />
                </div>
              ) : null}
              {displayName || header.headline || header.shortDescription ? (
                <div className="mb-6">
                  <HeroTextBlock displayName={displayName} headline={header.headline} shortDescription={header.shortDescription} isCompact={isCompact} />
                </div>
              ) : null}
            </>
          ) : null}

          {getOrderedModules(config).map((key) => (
            <div key={key} className="w-full">
              {MODULE_COMPONENTS[key](config)}
            </div>
          ))}

          {footer.showSocialIcons && socialEntries.length > 0 ? (
            <div className="mt-10 flex items-center gap-4">
              {socialEntries.map(({ platform, href }) => {
                const Icon = SOCIAL_ICONS[platform];
                return (
                  <a key={platform} href={href} target="_blank" rel="noopener noreferrer" className="text-white/80 hover:text-white">
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
