import { Link, useParams } from "react-router";
import { ArrowLeftIcon, LayoutGridIcon } from "../components/icons";

/**
 * Placeholder de `/app/minisites/:id/layout` (Tela 4). O botão "Publicar"
 * do editor já leva para cá — a organização dos módulos e a publicação de
 * verdade são escopo da Fase 4.
 */
export function LayoutPlaceholderPage() {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="mx-auto max-w-3xl">
      <Link to={`/app/minisites/${id}/editar`} className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-blue-600 hover:underline">
        <ArrowLeftIcon className="h-4 w-4" />
        Voltar para o editor
      </Link>

      <div className="mt-6 flex flex-col items-center rounded-3xl border border-dashed border-slate-200 bg-white px-6 py-16 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-blue-50">
          <LayoutGridIcon className="h-7 w-7 text-brand-blue-600" />
        </div>
        <p className="mt-5 text-base font-semibold text-brand-navy-900">Layout e publicação</p>
        <p className="mt-1.5 max-w-sm text-sm text-slate-500">
          A organização dos módulos e a publicação final do seu MiniSite chegam na próxima fase. Seu rascunho já está salvo.
        </p>
      </div>
    </div>
  );
}
