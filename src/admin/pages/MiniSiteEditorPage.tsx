import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { getMiniSiteDetail, patchMiniSite, MiniSiteApiError } from "../lib/minisitesApi";
import { isValidSlugFormat } from "../../shared/reservedSlugs";
import { useToast } from "../lib/toast";
import { createEditorStore, EditorStoreProvider } from "../editor/editorStore";
import { BasicInfoEditor } from "../editor/BasicInfoEditor";
import { VisualIdentityEditor } from "../editor/VisualIdentityEditor";
import { HeaderEditor } from "../editor/HeaderEditor";
import { ActionButtonsEditor } from "../editor/ActionButtonsEditor";
import { SocialLinksEditor } from "../editor/SocialLinksEditor";
import { GalleryEditor } from "../editor/GalleryEditor";
import { CatalogEditor } from "../editor/CatalogEditor";
import { LocationEditor } from "../editor/LocationEditor";
import { FooterEditor } from "../editor/FooterEditor";
import { LivePreview } from "../editor/LivePreview";
import { FullPageSpinner } from "../components/FullPageSpinner";
import { ArrowLeftIcon, CheckCircleIcon, EyeIcon, SaveIcon, SendIcon } from "../components/icons";

type SaveStatus = "idle" | "saving" | "saved" | "error";

export function MiniSiteEditorPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [store] = useState(() => createEditorStore(id!));
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");

  const debounceRef = useRef<number | undefined>(undefined);
  const skipFirstRef = useRef(true);

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

  async function flushSave() {
    if (!store.getState().loaded) return;
    const state = store.getState();
    setSaveStatus("saving");
    try {
      await patchMiniSite(state.minisiteId, {
        internalName: state.internalName,
        niche: state.niche,
        slug: isValidSlugFormat(state.slug) ? state.slug : undefined,
        config: state.config,
      });
      setSaveStatus("saved");
    } catch (err) {
      setSaveStatus("error");
      showToast(err instanceof MiniSiteApiError ? err.message : "Não foi possível salvar.", "error");
    }
  }

  const internalName = store((s) => s.internalName);
  const niche = store((s) => s.niche);
  const slug = store((s) => s.slug);
  const config = store((s) => s.config);

  useEffect(() => {
    if (loading || loadError) return;
    if (skipFirstRef.current) {
      skipFirstRef.current = false;
      return;
    }
    window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => {
      flushSave();
    }, 1000);
    return () => window.clearTimeout(debounceRef.current);
    // flushSave lê o estado mais atual via store.getState() — não precisa entrar como dependência.
  }, [internalName, niche, slug, config, loading, loadError]);

  async function handleSaveDraft() {
    window.clearTimeout(debounceRef.current);
    await flushSave();
    showToast("Rascunho salvo");
  }

  async function handlePreview() {
    window.clearTimeout(debounceRef.current);
    await flushSave();
    window.open(`/${store.getState().slug}`, "_blank", "noopener,noreferrer");
  }

  async function handlePublish() {
    window.clearTimeout(debounceRef.current);
    await flushSave();
    navigate(`/app/minisites/${id}/layout`);
  }

  if (loading) return <FullPageSpinner />;

  if (loadError) {
    return (
      <div className="mx-auto max-w-3xl">
        <Link to="/app/minisites" className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-blue-600 hover:underline">
          <ArrowLeftIcon className="h-4 w-4" />
          Voltar para Meus MiniSites
        </Link>
        <div className="mt-6 rounded-3xl border border-dashed border-slate-200 bg-white px-6 py-16 text-center">
          <p className="text-base font-semibold text-brand-navy-900">MiniSite não encontrado</p>
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
          Voltar para Meus MiniSites
        </Link>

        <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-brand-navy-900">Editor do MiniSite</h1>
            <p className="mt-1 text-sm text-slate-500">Monte seu mini site de forma simples e rápida.</p>
          </div>

          <div className="flex items-center gap-3">
            <SaveStatusLabel status={saveStatus} />
            <button
              type="button"
              onClick={handleSaveDraft}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-brand-navy-900 transition hover:bg-slate-50"
            >
              <SaveIcon className="h-4 w-4" />
              Salvar rascunho
            </button>
            <button
              type="button"
              onClick={handlePreview}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-brand-navy-900 transition hover:bg-slate-50"
            >
              <EyeIcon className="h-4 w-4" />
              Pré-visualizar
            </button>
            <button
              type="button"
              onClick={handlePublish}
              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-brand-blue-500 to-brand-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-blue-600/25 transition hover:from-brand-blue-600 hover:to-brand-blue-600"
            >
              <SendIcon className="h-4 w-4" />
              Publicar
            </button>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="flex min-w-0 flex-col gap-5">
            <BasicInfoEditor />
            <VisualIdentityEditor />
            <HeaderEditor />
            <ActionButtonsEditor />
            <SocialLinksEditor />
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
