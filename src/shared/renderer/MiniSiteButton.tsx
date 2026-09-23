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
 * inclusive o `<summary>` do Pix/Wi-Fi) — sensação de profundidade/botão
 * físico sutil, sem exagero: highlight interno superior, sombra interna
 * inferior leve (dá volume ao próprio preenchimento colorido) e uma
 * sombra externa suave que destaca o botão do fundo. No hover, o botão
 * "levanta" 1px e brilha um pouco mais; no active, "afunda" 1px e a
 * sombra reduz — simula pressão física sem transformar a cor nem o
 * layout (mantém contraste/acessibilidade e a área de toque intactas).
 */
export function miniSiteButtonClassName(extra = ""): string {
  return [
    "relative flex items-center justify-center gap-2.5 rounded-2xl px-4 py-3.5 text-[15px] font-semibold",
    "transition-all duration-150 ease-out",
    "focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70",
    "shadow-[inset_0_1px_0_rgba(255,255,255,0.35),inset_0_-2px_3px_rgba(0,0,0,0.15),0_3px_8px_rgba(0,0,0,0.22)]",
    "hover:-translate-y-px hover:brightness-[1.04] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.4),inset_0_-2px_3px_rgba(0,0,0,0.15),0_5px_12px_rgba(0,0,0,0.26)]",
    "active:translate-y-[1px] active:brightness-95 active:shadow-[inset_0_1px_0_rgba(255,255,255,0.25),inset_0_-1px_2px_rgba(0,0,0,0.12),0_1px_3px_rgba(0,0,0,0.18)]",
    extra,
  ]
    .filter(Boolean)
    .join(" ");
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
      <span className="flex h-5 w-5 shrink-0 items-center justify-center">{icon}</span>
      <span className="truncate">{label}</span>
    </a>
  );
}
