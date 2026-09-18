import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { getMiniSite, MiniSiteApiError, type MiniSiteListItem } from "../lib/minisitesApi";
import { ArrowLeftIcon, PencilIcon } from "../components/icons";
import { FullPageSpinner } from "../components/FullPageSpinner";

/**
 * Placeholder da rota do editor — a Fase 3 substitui isto pelo editor em
 * blocos de verdade. Existe agora só para o fluxo "Editar" ficar completo.
 */
export function MiniSiteEditorPlaceholderPage() {
  const { id } = useParams<{ id: string }>();
  const [minisite, setMinisite] = useState<MiniSiteListItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getMiniSite(id)
      .then(setMinisite)
      .catch((err) => setError(err instanceof MiniSiteApiError ? err.message : "MiniSite não encontrado."))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <FullPageSpinner />;

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        to="/app/minisites"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-blue-600 hover:underline"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        Voltar para Meus MiniSites
      </Link>

      <div className="mt-6 flex flex-col items-center rounded-3xl border border-dashed border-slate-200 bg-white px-6 py-16 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-blue-50">
          <PencilIcon className="h-7 w-7 text-brand-blue-600" />
        </div>
        {error ? (
          <>
            <p className="mt-5 text-base font-semibold text-brand-navy-900">MiniSite não encontrado</p>
            <p className="mt-1.5 max-w-sm text-sm text-slate-500">{error}</p>
          </>
        ) : (
          <>
            <p className="mt-5 text-base font-semibold text-brand-navy-900">
              Editando: {minisite?.displayName || minisite?.internalName}
            </p>
            <p className="mt-1.5 max-w-sm text-sm text-slate-500">
              O editor completo (identidade visual, botões, catálogo, galeria e publicação) chega na próxima fase.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
