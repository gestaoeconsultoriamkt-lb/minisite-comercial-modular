import type { ReactNode } from "react";
import type { MiniSiteConfig } from "../schemas/miniSiteConfig";

export interface MiniSiteButtonColors {
  background: string;
  text: string;
}

/**
 * Cor única de fundo/texto para TODOS os botões do MiniSite (ação e redes
 * sociais) — visual consistente da marca, em vez de cada tipo de botão ter
 * sua própria cor (ex.: WhatsApp verde). Cadeia de fallback: cor dedicada
 * de botão -> cor primária da marca -> azul padrão.
 */
export function getButtonColors(config: MiniSiteConfig): MiniSiteButtonColors {
  const { appearance } = config;
  return {
    background: appearance.colorButtonBackground || appearance.colorPrimary || "#1d4ed8",
    text: appearance.colorButtonText || "#ffffff",
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
      className="flex items-center justify-center gap-2.5 rounded-2xl px-4 py-3.5 text-sm font-semibold shadow-sm transition hover:opacity-90 active:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
      style={{ backgroundColor: colors.background, color: colors.text }}
    >
      <span className="flex h-4.5 w-4.5 shrink-0 items-center justify-center">{icon}</span>
      <span className="truncate">{label}</span>
    </a>
  );
}
