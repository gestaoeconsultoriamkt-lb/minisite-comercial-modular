import { useId, type ReactNode } from "react";
import type { MiniSiteConfig } from "../schemas/miniSiteConfig";
import { getAssetUrl } from "../assetUrl";
import { hexToRgba, mixHex } from "../colors";
import { getTypographyTokens, type TypographyTokens } from "../typography";
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

/**
 * Máscara vertical do fade da capa — GLOBAL: aplicada sempre que a hero
 * renderiza um fundo (capa OU o gradiente de marca de fallback), em
 * qualquer combinação de `logoPosition`/`heroTreatment`/preset visual.
 * Não é mais condicionada à logo "flutuante" — antes disso, "sobre a
 * capa"/"clássica"/"destaque" mantinham o corte reto original.
 * Curva com vários pontos de controle (em vez de um degradê linear
 * simples) para dissolver de forma convincente: mais da metade superior
 * intacta, início perceptível por volta de 60%, e a maior parte da queda
 * concentrada nos últimos ~25% — sem isso, um degrau linear "0% a 100%"
 * lê como escurecimento uniforme, não como a imagem de fato desaparecendo.
 */
const HERO_COVER_FADE_MASK =
  "linear-gradient(to bottom, #000 0%, #000 50%, rgba(0,0,0,0.92) 62%, rgba(0,0,0,0.62) 75%, rgba(0,0,0,0.22) 88%, transparent 100%)";

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
 *
 * `boost` (heroTreatment "destaque"/"vitrine") aumenta a dimensão mais um
 * degrau — "classic" nunca usa `boost`, então nenhum MiniSite existente
 * muda de tamanho de logo.
 */
function LogoPlate({
  logoKey,
  alt,
  size,
  treatment,
  boost,
}: {
  logoKey: string;
  alt: string;
  size: "compact" | "normal" | "floating";
  treatment: "plate" | "none";
  boost: boolean;
}) {
  const dimension = boost
    ? size === "compact"
      ? "h-[7rem] w-[7rem]"
      : size === "floating"
        ? "h-[8.25rem] w-[8.25rem] sm:h-[9.5rem] sm:w-[9.5rem]"
        : "h-[9.5rem] w-[9.5rem]"
    : size === "compact"
      ? "h-24 w-24"
      : size === "floating"
        ? "h-28 w-28 sm:h-32 sm:w-32"
        : "h-32 w-32";

  const noneShadow = boost ? "drop-shadow-[0_10px_24px_rgba(0,0,0,0.45)]" : "drop-shadow-[0_4px_14px_rgba(0,0,0,0.35)]";
  if (treatment === "none") {
    return (
      <div className={`flex shrink-0 items-center justify-center ${noneShadow} ${dimension}`}>
        <img src={getAssetUrl(logoKey)} alt={alt} className="h-full w-full object-contain" />
      </div>
    );
  }

  const plateShadow = boost
    ? "shadow-[0_1px_0_rgba(255,255,255,0.7)_inset,0_16px_36px_-8px_rgba(0,0,0,0.5),0_4px_10px_rgba(0,0,0,0.25)]"
    : "shadow-[0_8px_20px_rgba(0,0,0,0.28)]";

  return (
    <div
      className={`relative flex shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white p-2.5 ring-1 ring-black/5 ${plateShadow} ${dimension}`}
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white via-white to-slate-50" aria-hidden />
      <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-white" aria-hidden />
      <img src={getAssetUrl(logoKey)} alt={alt} className="relative z-10 h-full w-full object-contain" />
    </div>
  );
}

/**
 * Nome/headline/descrição — mesmo bloco de texto usado tanto com a logo
 * "sobre a capa" quanto "flutuante" (ver logoPosition). `typography` traz
 * a família/peso/tracking do preset tipográfico (ver src/shared/typography.ts);
 * `boost` (heroTreatment "destaque"/"vitrine") aumenta a escala do nome e
 * adiciona um pequeno acento decorativo — nunca ativo em "classic".
 */
function HeroTextBlock({
  displayName,
  headline,
  shortDescription,
  isCompact,
  typography,
  boost,
}: {
  displayName: string;
  headline?: string;
  shortDescription?: string;
  isCompact: boolean;
  typography: TypographyTokens;
  boost: boolean;
}) {
  const nameSizeClass = isCompact ? "text-xl" : boost ? "text-[30px] sm:text-[36px]" : "text-[28px] sm:text-[32px]";
  return (
    <>
      {displayName ? (
        <h1
          className={`text-white ${boost ? "leading-[1.12]" : "leading-tight"} ${nameSizeClass} ${typography.nameClassName} ${boost ? "drop-shadow-[0_2px_16px_rgba(0,0,0,0.45)]" : ""}`}
          style={{ fontFamily: typography.nameFontFamily }}
        >
          {displayName}
        </h1>
      ) : null}
      {boost && displayName ? <div className="mx-auto mt-3 h-[3px] w-10 rounded-full bg-white/50" aria-hidden /> : null}
      {headline ? (
        <p className={`mt-2 text-white/90 ${isCompact ? "text-sm" : "text-[15px] sm:text-base"} ${typography.headlineClassName}`}>{headline}</p>
      ) : null}
      {shortDescription ? <p className="mt-2 text-[13px] font-medium leading-relaxed text-white/70 sm:text-sm">{shortDescription}</p> : null}
    </>
  );
}

/**
 * Painel de vidro (heroTreatment "vitrine") — glassmorphism contido, só na
 * primeira dobra: blur+saturate altos (o efeito precisa ser EVIDENTE, não
 * só um fundo escuro semitransparente), tinta neutra-escura levemente
 * misturada com a cor primária da marca (nunca a cor pura — mesma lição do
 * corpo acrílico removido: marca quente + alpha alto vira lavagem de cor,
 * não vidro). Três camadas dão a sensação de "objeto de vidro flutuante":
 * o preenchimento translúcido em si (`style`), um highlight superior (luz
 * "batendo" no topo do vidro) e um anel de duas cores (mais claro no topo,
 * mais discreto embaixo) — sem eles, translúcido + blur sozinhos leem só
 * como "escurecido", não como vidro de verdade. `mixHex`/`hexToRgba` — ver
 * src/shared/colors.ts. Margem lateral no mobile vem do `max-w` + do `px-5`
 * do container pai — nunca cola nas bordas da tela.
 */
function HeroGlassPanel({ tintColor, children }: { tintColor: string; children: ReactNode }) {
  const background = hexToRgba(mixHex("#0b1220", tintColor, 0.28), 0.4);
  return (
    <div
      className="relative w-full max-w-[22rem] overflow-hidden rounded-[28px] ring-1 ring-inset ring-white/25 backdrop-blur-2xl backdrop-saturate-150 shadow-[0_28px_70px_-16px_rgba(0,0,0,0.6),0_8px_20px_-8px_rgba(0,0,0,0.35)]"
      style={{ backgroundColor: background }}
    >
      {/* Highlight superior — luz "batendo" no topo do painel, o que mais
          vende a sensação de vidro/acrílico físico em vez de só "escuro
          translúcido". Não recebe pointer-events nem participa do layout. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/25 via-white/5 to-transparent"
      />
      {/* Anel externo levemente mais claro só na borda superior — reforça a
          borda "de vidro" sem depender de um único ring plano. */}
      <div aria-hidden className="pointer-events-none absolute inset-0 rounded-[28px] ring-1 ring-inset ring-white/10" />
      <div className="relative px-6 py-7 text-center">{children}</div>
    </div>
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

  // Sistema de estilo (ver §1 do briefing "mini framework de estilização"):
  // tipografia sempre lida do preset; hero "destaque"/"vitrine" aumentam
  // presença de logo/nome; "vitrine" adiciona o painel de vidro.
  const typography = getTypographyTokens(appearance.typographyPreset);
  const heroBoost = appearance.heroTreatment !== "classic";
  const isVitrine = appearance.heroTreatment === "vitrine";
  const vitrineTint = appearance.colorPrimary || "#1d4ed8";
  // "Vitrine" é uma composição única (logo + nome + subtítulo + botões no
  // MESMO painel de vidro) — os botões saem do fluxo normal de módulos e
  // entram dentro do HeroGlassPanel; o resto (galeria/catálogo/local)
  // mantém a ordem configurada normalmente.
  const bodyModuleKeys = getOrderedModules(config).filter((key) => !isVitrine || key !== "actionButtons");

  // Formato da base da hero — "reta" não aplica nada; "curva" arredonda a
  // base; "onda" usa um clip-path SVG (objectBoundingBox — responsivo por
  // natureza, sem depender de pixels fixos) para um divisor orgânico leve.
  const heroShapeClass = appearance.heroShape === "curve" ? "rounded-b-[2.75rem]" : "";
  const heroShapeStyle = appearance.heroShape === "wave" ? { clipPath: `url(#${waveClipId})` } : undefined;

  return (
    <div
      className="minisite-root relative isolate min-h-full overflow-hidden"
      style={{ fontFamily: typography.bodyFontFamily, ...(!hasBackgroundImage ? { background: gradientCss } : {}) }}
    >
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
            {/* Fade global da capa (ver HERO_COVER_FADE_MASK): a capa (imagem
                OU gradiente de marca) some suavemente na base via
                `mask-image` — dissolve os PRÓPRIOS pixels (imagem + seu
                escurecimento) em vez de pintar uma tarja nova por cima,
                revelando o fundo real da página (que já fica por trás, ver
                overlay/gradiente do `.minisite-root`). Sempre ativo,
                independente de logoPosition/heroTreatment/preset — não há
                composição que deva manter o corte reto original. */}
            <div className="absolute inset-0" style={{ maskImage: HERO_COVER_FADE_MASK, WebkitMaskImage: HERO_COVER_FADE_MASK }}>
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
            {isVitrine ? (
              // Glassmorphism só fica convincente quando há textura por
              // trás pro blur "trabalhar" — um fundo chapado escuro (sem
              // capa, ou capa já muito escurecida pelo overlay) deixa o
              // painel parecendo só "card escuro", não vidro. Dois blobs
              // de luz suaves (um neutro, um na cor da marca), desfocados
              // no próprio elemento (não backdrop) — ambient glow por trás
              // do painel, contido na mesma máscara de formato da hero.
              <>
                <div className="absolute -left-12 top-2 h-44 w-44 rounded-full bg-white/15 blur-3xl" aria-hidden />
                <div
                  className="absolute -right-10 bottom-0 h-56 w-56 rounded-full blur-3xl"
                  style={{ backgroundColor: hexToRgba(vitrineTint, 0.4) }}
                  aria-hidden
                />
              </>
            ) : null}
          </div>

          {!floatingLogo ? (
            <div className={`relative z-10 flex h-full flex-col items-center justify-center px-5 pb-6 text-center ${isCompact ? "pt-8" : "pt-12"}`}>
              {isVitrine ? (
                <HeroGlassPanel tintColor={vitrineTint}>
                  {hasLogo ? (
                    <div className="mb-5 flex justify-center">
                      <LogoPlate logoKey={appearance.logoKey!} alt={logoAlt} size={isCompact ? "compact" : "normal"} treatment={logoTreatment} boost={heroBoost} />
                    </div>
                  ) : null}
                  <HeroTextBlock
                    displayName={displayName}
                    headline={header.headline}
                    shortDescription={header.shortDescription}
                    isCompact={isCompact}
                    typography={typography}
                    boost={heroBoost}
                  />
                  <ButtonsSection config={config} spacingClassName="mt-6" insidePanel />
                </HeroGlassPanel>
              ) : (
                <>
                  {hasLogo ? (
                    <LogoPlate logoKey={appearance.logoKey!} alt={logoAlt} size={isCompact ? "compact" : "normal"} treatment={logoTreatment} boost={heroBoost} />
                  ) : null}
                  <div className={hasLogo ? "mt-5" : ""}>
                    <HeroTextBlock
                      displayName={displayName}
                      headline={header.headline}
                      shortDescription={header.shortDescription}
                      isCompact={isCompact}
                      typography={typography}
                      boost={heroBoost}
                    />
                  </div>
                </>
              )}
            </div>
          ) : null}
        </div>

        {/* Ponte visual hero -> corpo: sem isso a transição é seca (o fim da
            capa/gradiente encontra o corpo com um corte abrupto). Uma faixa
            de gradiente sobreposta suaviza a costura — fica FORA do
            container recortado da hero (que tem overflow-hidden próprio),
            então nunca é cortada pelo formato reto/curva/onda escolhido. */}
        <div className="pointer-events-none relative -mt-16 h-16 bg-gradient-to-b from-transparent to-black/35" aria-hidden />

        {/* V1: corpo é sempre sólido (sem seletor de estilo no editor) —
            `appearance.bodyStyle` não é mais lido aqui (deprecated no
            schema, "acrylic" removido). `pt-6` dá respiro consistente com
            o restante da hero, sem depender de painel translúcido. */}
        <div className="relative flex flex-col items-center px-5 pb-12 pt-6 text-center">
          {floatingLogo ? (
            <>
              {hasLogo ? (
                <div className={`relative z-10 mb-3 flex justify-center ${isVitrine ? "-mt-16 sm:-mt-20" : "-mt-14 sm:-mt-16"}`}>
                  <LogoPlate logoKey={appearance.logoKey!} alt={logoAlt} size="floating" treatment={logoTreatment} boost={heroBoost} />
                </div>
              ) : null}
              {displayName || header.headline || header.shortDescription ? (
                isVitrine ? (
                  <div className={`mb-6 flex justify-center ${hasLogo ? "-mt-8" : ""}`}>
                    <HeroGlassPanel tintColor={vitrineTint}>
                      <div className={hasLogo ? "pt-6" : ""}>
                        <HeroTextBlock
                          displayName={displayName}
                          headline={header.headline}
                          shortDescription={header.shortDescription}
                          isCompact={isCompact}
                          typography={typography}
                          boost={heroBoost}
                        />
                        <ButtonsSection config={config} spacingClassName="mt-6" insidePanel />
                      </div>
                    </HeroGlassPanel>
                  </div>
                ) : (
                  <div className="mb-6">
                    <HeroTextBlock
                      displayName={displayName}
                      headline={header.headline}
                      shortDescription={header.shortDescription}
                      isCompact={isCompact}
                      typography={typography}
                      boost={heroBoost}
                    />
                  </div>
                )
              ) : null}
            </>
          ) : null}

          {bodyModuleKeys.map((key) => (
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
