import type { ReactNode } from "react";

interface EditorSectionProps {
  icon: ReactNode;
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
}

/**
 * Bloco padrão do editor: ícone + título + subtítulo no topo, ação opcional
 * (ex.: "+ Adicionar seção") alinhada à direita, todos os controles do bloco
 * abaixo — nunca espremidos ao lado do título.
 */
export function EditorSection({ icon, title, subtitle, action, children }: EditorSectionProps) {
  return (
    <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-blue-50 text-brand-blue-600">
            {icon}
          </div>
          <div>
            <h2 className="text-base font-bold text-brand-navy-900">{title}</h2>
            {subtitle ? <p className="mt-0.5 text-sm text-slate-500">{subtitle}</p> : null}
          </div>
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      <div className="mt-5 flex flex-col gap-5">{children}</div>
    </section>
  );
}
