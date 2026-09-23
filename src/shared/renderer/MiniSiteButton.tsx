import type { ReactNode } from "react";
import type { MiniSiteButton, MiniSiteConfig } from "../schemas/miniSiteConfig";

export interface MiniSiteButtonColors {
  background: string;
  text: string;
}

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
 * Classe única do botão-pílula em todo o MiniSite (ações + redes sociais,
 * inclusive o `<summary>` do Pix/Wi-Fi) — profundidade de "botão físico"
 * premium, mais evidente que um botão flat: sombra externa perceptível,
 * highlight interno no topo, borda sutil (ring branco translúcido, lê bem
 * sobre qualquer cor de fundo) e um leve gradiente vertical (aplicado por
 * MiniSiteButtonSurface, já que a cor de fundo é dinâmica/inline — não dá
 * pra expressar "baseado na cor do botão" com uma classe Tailwind fixa).
 * Hover eleva ~2px e brilha um pouco mais; active desce ~1px e reduz a
 * sombra — simula pressão física sem alterar a cor configurada nem o
 * layout (contraste/foco/área de toque preservados). 52–56px de altura
 * (py-4 + texto 15px), raio 16px, sem estética gamer/neon.
 */
export function miniSiteButtonClassName(extra = ""): string {
  return [
    "relative isolate flex items-center justify-center gap-3 rounded-2xl px-5 py-4 text-[15px] font-semibold",
    "ring-1 ring-inset ring-white/15",
    "transition-all duration-150 ease-out",
    "focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70",
    "shadow-[0_1px_0_rgba(255,255,255,0.4)_inset,0_4px_10px_rgba(0,0,0,0.28)]",
    "hover:-translate-y-[2px] hover:brightness-[1.05] hover:shadow-[0_1px_0_rgba(255,255,255,0.45)_inset,0_8px_18px_rgba(0,0,0,0.32)]",
    "active:translate-y-[1px] active:brightness-95 active:shadow-[0_1px_0_rgba(255,255,255,0.25)_inset,0_2px_4px_rgba(0,0,0,0.22)]",
    extra,
  ]
    .filter(Boolean)
    .join(" ");
}

/**
 * Camada de gradiente vertical discreto sobre a cor do botão (highlight
 * translúcido no topo → sombra translúcida na base) — funciona "baseado
 * na cor" de qualquer botão porque modula a cor de fundo já aplicada,
 * em vez de fixar uma cor própria. Decorativa, atrás do conteúdo.
 */
export function MiniSiteButtonSurface() {
  return <span aria-hidden className="pointer-events-none absolute inset-0 rounded-[inherit] bg-gradient-to-b from-white/20 via-transparent to-black/15" />;
}

/** Botão-pílula padrão: ícone à esquerda, texto centralizado com ele, mesma altura/raio/profundidade em todo o MiniSite. */
export function MiniSiteButtonLink({
  href,
  icon,
  label,
  colors,
}: {
  href: string;
  icon: ReactNode;
  label: string;
  colors: MiniSiteButtonColors;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={miniSiteButtonClassName()}
      style={{ backgroundColor: colors.background, color: colors.text }}
    >
      <MiniSiteButtonSurface />
      <span className="relative z-10 flex h-5 w-5 shrink-0 items-center justify-center">{icon}</span>
      <span className="relative z-10 truncate">{label}</span>
    </a>
  );
}
