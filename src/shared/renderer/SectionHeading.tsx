import type { ReactNode } from "react";
import type { MiniSiteVisualStyle } from "../schemas/miniSiteConfig";

/** Selo do ícone por `visualStyle` — mesmo raciocínio dos cards (Como chegar/Galeria/Catálogo): `simple` é o selo que já existia. */
const BADGE_STYLE: Record<MiniSiteVisualStyle, string> = {
  simple: "bg-white/10 ring-1 ring-inset ring-white/10",
  premium: "bg-white/15 ring-1 ring-inset ring-white/15 shadow-[0_4px_10px_-4px_rgba(0,0,0,0.4)]",
  glass: "bg-white/10 ring-1 ring-inset ring-white/20 backdrop-blur-sm shadow-[0_1px_0_rgba(255,255,255,0.2)_inset]",
};

/**
 * Cabeçalho de seção (Galeria, cada seção do Catálogo) — antes um ícone
 * solto + texto versalete + linha reta de 1px, sem hierarquia nem
 * acabamento. Substituído por: selo circular para o ícone (dá peso e
 * "âncora" visual, em vez do ícone flutuar sozinho ao lado do texto),
 * tracking mais aberto (editorial, não só "maiúsculo genérico") e um
 * divisor em gradiente que se dissolve na borda em vez de cortar reto.
 * `visualStyle` (default "simple", sem regressão) só varia a intensidade
 * do selo — a mesma peça em qualquer módulo/nicho.
 */
export function SectionHeading({ icon, title, visualStyle = "simple" }: { icon: ReactNode; title: string; visualStyle?: MiniSiteVisualStyle }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2.5">
        <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-white/85 ${BADGE_STYLE[visualStyle]}`}>{icon}</span>
        <h3 className="text-[13px] font-bold uppercase tracking-[0.16em] text-white/90">{title}</h3>
      </div>
      <div className="h-px w-full bg-gradient-to-r from-white/25 via-white/10 to-transparent" />
    </div>
  );
}
