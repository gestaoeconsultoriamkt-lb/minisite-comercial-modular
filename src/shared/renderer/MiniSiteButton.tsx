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

/** Botão-pílula padrão: ícone à esquerda, texto centralizado com ele, mesma altura/raio/sombra em todo o MiniSite. */
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
      className="flex items-center justify-center gap-2.5 rounded-2xl px-4 py-3.5 text-[15px] font-semibold shadow-sm transition hover:opacity-90 active:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
      style={{ backgroundColor: colors.background, color: colors.text }}
    >
      <span className="flex h-5 w-5 shrink-0 items-center justify-center">{icon}</span>
      <span className="truncate">{label}</span>
    </a>
  );
}
