import type { ReactNode } from "react";

interface EditorSectionProps {
  icon: ReactNode;
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
}

/**
 * Bloco padrão do editor/publicação: ícone + título + subtítulo no topo,
 * ação opcional (ex.: "+ Adicionar seção") alinhada à direita, todos os
 * controles do bloco abaixo, separados do cabeçalho por um divisor —
 * nunca espremidos ao lado do título.
 *
 * Elevação real (não só uma borda quase invisível): sombra em duas
 * camadas (contato + ambiente) faz o card "flutuar" sobre o fundo cinza
 * da página, e o divisor entre cabeçalho e conteúdo reforça a hierarquia
 * título → descrição → controles em vez de tudo no mesmo plano.
 */
export function EditorSection({ icon, title, subtitle, action, children }: EditorSectionProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_12px_28px_-14px_rgba(15,23,42,0.16)] sm:p-7">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3.5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-blue-50 text-brand-blue-600 ring-1 ring-inset ring-brand-blue-100">
            {icon}
          </div>
          <div>
            <h2 className="text-base font-bold text-brand-navy-900">{title}</h2>
            {subtitle ? <p className="mt-0.5 text-sm text-slate-500">{subtitle}</p> : null}
          </div>
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      <div className="mt-6 flex flex-col gap-5 border-t border-slate-100 pt-6">{children}</div>
    </section>
  );
}
