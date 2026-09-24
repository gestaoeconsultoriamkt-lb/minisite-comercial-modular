import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { getMiniSiteDetail, MiniSiteApiError } from "../lib/minisitesApi";
import { useToast } from "../lib/toast";
import { createEditorStore, EditorStoreProvider } from "../editor/editorStore";
import { useAutosave, type SaveStatus } from "../editor/useAutosave";
import { BasicInfoEditor } from "../editor/BasicInfoEditor";
import { VisualIdentityEditor } from "../editor/VisualIdentityEditor";
import { HeaderEditor } from "../editor/HeaderEditor";
import { ButtonsEditor } from "../editor/ButtonsEditor";
import { GalleryEditor } from "../editor/GalleryEditor";
import { CatalogEditor } from "../editor/CatalogEditor";
import { LocationEditor } from "../editor/LocationEditor";
import { FooterEditor } from "../editor/FooterEditor";
import { LivePreview } from "../editor/LivePreview";
import { FullPageSpinner } from "../components/FullPageSpinner";
import { ArrowLeftIcon, CheckCircleIcon, EyeIcon, SaveIcon, SendIcon } from "../components/icons";

export function MiniSiteEditorPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [store] = useState(() => createEditorStore(id!));
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const { status: saveStatus, flushNow } = useAutosave(store, !loading && !loadError);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getMiniSiteDetail(id!)
      .then((detail) => {
        if (cancelled) return;
        store.getState().loadFromDetail(detail);
      })
      .catch((err) => {
        if (cancelled) return;
        setLoadError(err instanceof MiniSiteApiError ? err.message : "MiniSite não encontrado.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // Roda só quando `id` muda — `store` é estável (useState initializer).
  }, [id]);

  async function handleSaveDraft() {
    await flushNow();
    showToast("Rascunho salvo");
  }

  async function handlePreview() {
    await flushNow();
    // `/preview/:id` (não `/${slug}`) — SSR do DRAFT, sempre; `/:slug`
    // público mostra o snapshot PUBLICADO para MiniSites ativos, mesmo
    // para o dono (ver src/server/routes/preview.ts).
    window.open(`/preview/${store.getState().minisiteId}`, "_blank", "noopener,noreferrer");
  }

  async function handlePublish() {
    await flushNow();
    navigate(`/app/minisites/${id}/layout`);
  }

  if (loading) return <FullPageSpinner />;

  if (loadError) {
    return (
      <div className="mx-auto max-w-3xl">
        <Link to="/app/minisites" className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-blue-600 hover:underline">
          <ArrowLeftIcon className="h-4 w-4" />
          Voltar para Meus Sites
        </Link>
        <div className="mt-6 rounded-3xl border border-dashed border-slate-200 bg-white px-6 py-16 text-center">
          <p className="text-base font-semibold text-brand-navy-900">Site não encontrado</p>
          <p className="mt-1.5 text-sm text-slate-500">{loadError}</p>
        </div>
      </div>
    );
  }

  return (
    <EditorStoreProvider value={store}>
      <div className="mx-auto max-w-[1400px]">
        <Link to="/app/minisites" className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-blue-600 hover:underline">
          <ArrowLeftIcon className="h-4 w-4" />
          Voltar para Meus Sites
        </Link>

        <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-brand-navy-900">Editor do Site</h1>
            <p className="mt-1 text-sm text-slate-500">Monte seu site de forma simples e rápida.</p>
          </div>

          {/* `flex-wrap` + `shrink-0 whitespace-nowrap` em cada botão: em
              telas estreitas, os botões quebram para a linha de baixo
              como blocos inteiros — nunca o texto quebrando dentro de um
              botão (problema real com o CTA mais longo, "Conferir e
              publicar", em 390px). */}
          <div className="flex flex-wrap items-center gap-3">
            <SaveStatusLabel status={saveStatus} />
            <button
              type="button"
              onClick={handleSaveDraft}
              className="flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-brand-navy-900 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 hover:shadow"
            >
              <SaveIcon className="h-4 w-4" />
              Salvar rascunho
            </button>
            <button
              type="button"
              onClick={handlePreview}
              className="flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-brand-navy-900 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 hover:shadow"
            >
              <EyeIcon className="h-4 w-4" />
              Pré-visualizar
            </button>
            <button
              type="button"
              onClick={handlePublish}
              className="flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-xl bg-gradient-to-r from-brand-blue-500 to-brand-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-blue-600/25 transition hover:from-brand-blue-600 hover:to-brand-blue-600 hover:shadow-xl hover:shadow-brand-blue-600/30"
            >
              <SendIcon className="h-4 w-4" />
              Conferir e publicar
            </button>
          </div>
        </div>

        {/* Coluna do preview alargada (400px -> 460px) para caber o mockup
            de celular maior (ver LivePreview) com respiro em volta — sem
            isso o frame de 390px + borda ficaria colado nas bordas da
            coluna. */}
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_460px]">
          <div className="flex min-w-0 flex-col gap-5">
            <BasicInfoEditor />
            <VisualIdentityEditor />
            <HeaderEditor />
            <ButtonsEditor />
            <GalleryEditor />
            <CatalogEditor />
            <LocationEditor />
            <FooterEditor />
          </div>
          <LivePreview />
        </div>
      </div>
    </EditorStoreProvider>
  );
}

function SaveStatusLabel({ status }: { status: SaveStatus }) {
  if (status === "saving") return <span className="text-xs font-medium text-slate-400">Salvando...</span>;
  if (status === "saved")
    return (
      <span className="flex items-center gap-1 text-xs font-medium text-emerald-600">
        <CheckCircleIcon className="h-3.5 w-3.5" />
        Salvo
      </span>
    );
  if (status === "error") return <span className="text-xs font-medium text-red-600">Erro ao salvar</span>;
  return null;
}
