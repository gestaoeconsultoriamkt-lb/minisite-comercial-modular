import type { ReactNode } from "react";

/**
 * Cabeçalho de seção (Galeria, cada seção do Catálogo) — antes um ícone
 * solto + texto versalete + linha reta de 1px, sem hierarquia nem
 * acabamento. Substituído por: selo circular para o ícone (dá peso e
 * "âncora" visual, em vez do ícone flutuar sozinho ao lado do texto),
 * tracking mais aberto (editorial, não só "maiúsculo genérico") e um
 * divisor em gradiente que se dissolve na borda em vez de cortar reto —
 * a mesma peça visual em qualquer módulo/nicho, sem depender de preset.
 */
export function SectionHeading({ icon, title }: { icon: ReactNode; title: string }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2.5">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/10 text-white/85 ring-1 ring-inset ring-white/10">
          {icon}
        </span>
        <h3 className="text-[13px] font-bold uppercase tracking-[0.16em] text-white/90">{title}</h3>
      </div>
      <div className="h-px w-full bg-gradient-to-r from-white/25 via-white/10 to-transparent" />
    </div>
  );
}
