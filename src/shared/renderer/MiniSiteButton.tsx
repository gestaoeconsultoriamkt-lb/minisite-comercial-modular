import type { ReactNode } from "react";
import { hexToRgba } from "../colors";
import type { MiniSiteButton, MiniSiteButtonStyle, MiniSiteConfig } from "../schemas/miniSiteConfig";

export interface MiniSiteButtonColors {
  background: string;
  text: string;
}

/**
 * Hierarquia visual dos botões — não é um campo de config, é calculada na
 * hora de renderizar (ver ButtonsSection): o primeiro botão de ação pronto
 * é `primary`, os demais são `secondary`, e os links de redes sociais
 * (mesmo bloco, empilhados depois) são `tertiary`. Reutilizável em
 * qualquer nicho porque não depende de QUAL tipo de botão é — só da
 * posição/categoria, nunca hardcoded (ex.: não assume que "WhatsApp" é
 * sempre o principal).
 */
export type MiniSiteButtonTier = "primary" | "secondary" | "tertiary";

const HEX_PATTERN = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

function readHex(value: unknown): string | undefined {
  return typeof value === "string" && HEX_PATTERN.test(value) ? value : undefined;
}

/**
 * Cor de fundo/texto de um botão — mesmo visual da marca por padrão, com
 * sobrescrita opcional por botão individual (ex.: WhatsApp com fundo
 * verde, mantendo os demais no padrão global). Cadeia de fallback:
 * cor individual do botão -> cor global de botão -> cor primária da
 * marca -> azul padrão. `button` é opcional porque botões de redes
 * sociais (sem personalização individual nesta fase) chamam sem ele.
 */
export function getButtonColors(config: MiniSiteConfig, button?: MiniSiteButton): MiniSiteButtonColors {
  const { appearance } = config;
  const individualBackground = button ? readHex(button.value.colorBackground) : undefined;
  const individualText = button ? readHex(button.value.colorText) : undefined;
  return {
    background: individualBackground || appearance.colorButtonBackground || appearance.colorPrimary || "#1d4ed8",
    text: individualText || appearance.colorButtonText || "#ffffff",
  };
}

/**
 * Padding por tier — mesma largura (stretch no flex-col pai), altura
 * decrescente reforça a hierarquia visual sem exigir texto menor (16px
 * `text-base` é mantido em todos os tiers por legibilidade).
 */
const PADDING_BY_TIER: Record<MiniSiteButtonTier, string> = {
  primary: "px-5 py-[18px]",
  secondary: "px-5 py-[15px]",
  tertiary: "px-5 py-[13px]",
};

/**
 * Classes de profundidade/peso visual por (estilo × tier) — combinação
 * explícita em vez de composição por flags: shadow/blur/motion interagem
 * de formas fáceis de quebrar sutilmente (ex.: sombra "só no primary" some
 * o `backdrop-blur` do glass em tiers menores) se fatoradas separadamente.
 * `elevated`/`primary` é BYTE-A-BYTE o botão que já existia antes deste
 * sistema — nenhum MiniSite existente (default `buttonStyle: "elevated"`)
 * muda de aparência.
 */
const BUTTON_RECIPES: Record<MiniSiteButtonStyle, Record<MiniSiteButtonTier, string>> = {
  simple: {
    primary:
      "rounded-xl ring-1 ring-black/10 font-semibold transition-colors duration-150 hover:brightness-95 active:brightness-90",
    secondary:
      "rounded-xl ring-1 ring-black/10 font-medium transition-colors duration-150 hover:brightness-95 active:brightness-90",
    tertiary:
      "rounded-xl ring-1 ring-white/15 font-medium transition-colors duration-150 hover:brightness-110 active:brightness-95",
  },
  elevated: {
    primary:
      "rounded-2xl ring-1 ring-inset ring-white/15 font-semibold transition-all duration-150 ease-out shadow-[0_1px_0_rgba(255,255,255,0.4)_inset,0_4px_10px_rgba(0,0,0,0.28)] hover:-translate-y-[2px] hover:brightness-[1.05] hover:shadow-[0_1px_0_rgba(255,255,255,0.45)_inset,0_8px_18px_rgba(0,0,0,0.32)] active:translate-y-[1px] active:brightness-95 active:shadow-[0_1px_0_rgba(255,255,255,0.25)_inset,0_2px_4px_rgba(0,0,0,0.22)]",
    secondary:
      "rounded-2xl ring-1 ring-inset ring-white/15 font-medium transition-all duration-150 ease-out shadow-[0_1px_0_rgba(255,255,255,0.3)_inset,0_2px_6px_rgba(0,0,0,0.2)] hover:brightness-110 active:brightness-95",
    tertiary:
      "rounded-2xl ring-1 ring-white/15 font-medium transition-all duration-150 ease-out hover:brightness-110 active:brightness-95",
  },
  premium: {
    primary:
      "rounded-2xl ring-1 ring-inset ring-white/25 font-bold tracking-tight transition-all duration-150 ease-out shadow-[0_1px_0_rgba(255,255,255,0.5)_inset,0_10px_24px_-4px_rgba(0,0,0,0.4),0_2px_6px_rgba(0,0,0,0.25)] hover:-translate-y-[3px] hover:scale-[1.01] hover:brightness-[1.06] hover:shadow-[0_1px_0_rgba(255,255,255,0.55)_inset,0_16px_32px_-6px_rgba(0,0,0,0.45),0_4px_10px_rgba(0,0,0,0.28)] active:translate-y-[1px] active:scale-[0.99] active:brightness-95 active:shadow-[0_1px_0_rgba(255,255,255,0.3)_inset,0_4px_10px_rgba(0,0,0,0.3)]",
    secondary:
      "rounded-2xl ring-1 ring-inset ring-white/20 font-semibold tracking-tight transition-all duration-150 ease-out shadow-[0_1px_0_rgba(255,255,255,0.35)_inset,0_4px_12px_rgba(0,0,0,0.22)] hover:brightness-110 active:brightness-95",
    tertiary:
      "rounded-2xl ring-1 ring-white/15 font-semibold tracking-tight transition-all duration-150 ease-out hover:brightness-110 active:brightness-95",
  },
  glass: {
    // 3 camadas por trás do texto (ver MiniSiteButtonSurface): preenchimento
    // translúcido (`style`/resolveButtonSurface), anel + blur/saturate aqui,
    // e o "sheen" diagonal (só glass). O `primary` usa blur mais forte —
    // profundidade de campo reforça que ele está "na frente".
    primary:
      "rounded-2xl ring-1 ring-inset ring-white/35 backdrop-blur-xl backdrop-saturate-150 font-semibold transition-all duration-150 ease-out shadow-[0_1px_0_rgba(255,255,255,0.35)_inset,0_-1px_0_rgba(0,0,0,0.15)_inset,0_14px_32px_-8px_rgba(0,0,0,0.4),0_4px_10px_-2px_rgba(0,0,0,0.25)] hover:-translate-y-[2px] hover:brightness-110 hover:shadow-[0_1px_0_rgba(255,255,255,0.4)_inset,0_-1px_0_rgba(0,0,0,0.15)_inset,0_18px_38px_-8px_rgba(0,0,0,0.45),0_6px_14px_-2px_rgba(0,0,0,0.3)] active:translate-y-[1px] active:brightness-95",
    secondary:
      "rounded-2xl ring-1 ring-inset ring-white/25 backdrop-blur-lg backdrop-saturate-125 font-medium transition-all duration-150 ease-out shadow-[0_1px_0_rgba(255,255,255,0.22)_inset,0_8px_18px_-6px_rgba(0,0,0,0.3)] hover:brightness-110 active:brightness-95",
    tertiary:
      "rounded-2xl ring-1 ring-white/15 backdrop-blur-md font-medium transition-all duration-150 ease-out shadow-[0_1px_0_rgba(255,255,255,0.12)_inset] hover:brightness-110 active:brightness-95",
  },
};

/** Alpha do fundo translúcido no estilo `glass`, por tier — quanto menor o tier, mais discreto. */
const GLASS_ALPHA_BY_TIER: Record<MiniSiteButtonTier, number> = {
  primary: 0.6,
  secondary: 0.32,
  tertiary: 0.16,
};

export function miniSiteButtonClassName(style: MiniSiteButtonStyle, tier: MiniSiteButtonTier, extra = ""): string {
  return [
    "relative isolate flex items-center justify-center text-base",
    PADDING_BY_TIER[tier],
    BUTTON_RECIPES[style][tier],
    "focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70",
    extra,
  ]
    .filter(Boolean)
    .join(" ");
}

/**
 * Fundo/texto reais do botão, resolvidos por (estilo × tier × cores
 * configuradas). `glass` sempre usa a cor de fundo configurada em rgba()
 * (frosted); nos demais estilos, só o `primary` usa a cor sólida cheia —
 * `secondary` usa a mesma cor bem diluída como um "tonal button" (o
 * "tinta" continua sendo a cor de fundo, não uma cor fixa alheia à marca);
 * `tertiary` fica transparente, com o texto/ícone em branco translúcido
 * (após a hero, o fundo da página é sempre um overlay escuro — ver
 * MiniSiteRenderer — então branco sempre lê bem ali).
 */
export function resolveButtonSurface(
  style: MiniSiteButtonStyle,
  tier: MiniSiteButtonTier,
  colors: MiniSiteButtonColors,
): { backgroundColor: string; color: string } {
  // `primary` é o único tier com fundo substancialmente opaco — só aí faz
  // sentido confiar no par cor-de-fundo/cor-de-texto exatamente como o
  // usuário configurou (contraste é responsabilidade dele nesse par).
  // `secondary`/`tertiary` diluem a cor de fundo sobre o fundo sempre
  // escuro da página (overlay em MiniSiteRenderer) — usar `colors.text`
  // (ou pior, `colors.background`) ali arrisca texto ilegível quando a
  // marca usa uma cor de texto escura ou próxima da própria cor de fundo
  // (ex.: fundo e texto de tons parecidos ficam quase invisíveis diluídos
  // sobre um fundo também escuro). Um branco translúcido fixo sempre lê
  // bem, porque o fundo por trás é sempre escuro nesse ponto da página.
  if (tier === "primary") {
    const backgroundColor = style === "glass" ? hexToRgba(colors.background, GLASS_ALPHA_BY_TIER.primary) : colors.background;
    return { backgroundColor, color: colors.text };
  }
  if (tier === "secondary") {
    const alpha = style === "glass" ? GLASS_ALPHA_BY_TIER.secondary : 0.22;
    return { backgroundColor: hexToRgba(colors.background, alpha), color: "rgba(255,255,255,0.92)" };
  }
  const alpha = style === "glass" ? GLASS_ALPHA_BY_TIER.tertiary : 0;
  return { backgroundColor: alpha > 0 ? hexToRgba(colors.background, alpha) : "transparent", color: "rgba(255,255,255,0.85)" };
}

/**
 * Camada de gradiente vertical discreto sobre a cor do botão — só nos
 * estilos com sensação de "objeto físico" (`elevated`/`premium`); `simple`
 * é propositalmente plano. `glass` usa `MiniSiteButtonGlassSheen` (luz
 * diagonal) em vez desta, mais coerente com vidro do que um gradiente
 * vertical liso.
 */
export function MiniSiteButtonSurface({ style }: { style: MiniSiteButtonStyle }) {
  if (style === "simple" || style === "glass") return null;
  return <span aria-hidden className="pointer-events-none absolute inset-0 rounded-[inherit] bg-gradient-to-b from-white/20 via-transparent to-black/15" />;
}

/** Sheen diagonal do botão `glass` — luz "escorregando" pelo vidro, em vez de um gradiente vertical plano. */
export function MiniSiteButtonGlassSheen({ style }: { style: MiniSiteButtonStyle }) {
  if (style !== "glass") return null;
  return (
    <span
      aria-hidden
      className="pointer-events-none absolute inset-0 rounded-[inherit] bg-gradient-to-br from-white/25 via-transparent to-transparent"
    />
  );
}

/**
 * Botão-pílula padrão: ícone + texto formam UM bloco (`inline-flex`,
 * `items-center`, `gap-2.5` = 10px) que é o que fica centralizado no
 * botão — não o texto sozinho com o ícone plantado numa borda. Estilo e
 * tier (ver MiniSiteButtonTier) juntos decidem profundidade/peso/fundo;
 * altura/raio-base continuam consistentes em todo o MiniSite.
 */
export function MiniSiteButtonLink({
  href,
  icon,
  label,
  colors,
  style,
  tier,
}: {
  href: string;
  icon: ReactNode;
  label: string;
  colors: MiniSiteButtonColors;
  style: MiniSiteButtonStyle;
  tier: MiniSiteButtonTier;
}) {
  const surface = resolveButtonSurface(style, tier, colors);
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={miniSiteButtonClassName(style, tier)}
      style={{ backgroundColor: surface.backgroundColor, color: surface.color }}
    >
      <MiniSiteButtonSurface style={style} />
      <MiniSiteButtonGlassSheen style={style} />
      <span className="relative z-10 inline-flex items-center justify-center gap-2.5">
        <span className="flex h-5 w-5 shrink-0 items-center justify-center">{icon}</span>
        <span className="truncate">{label}</span>
      </span>
    </a>
  );
}
