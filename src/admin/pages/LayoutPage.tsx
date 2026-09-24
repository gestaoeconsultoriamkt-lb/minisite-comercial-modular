import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { getMiniSiteDetail, publishMiniSite, disableMiniSite, reactivateMiniSite, MiniSiteApiError } from "../lib/minisitesApi";
import { getPublicMiniSiteDisplayUrl, getPublicMiniSiteUrl } from "../lib/publicUrl";
import { slugify } from "../lib/slugify";
import { useToast } from "../lib/toast";
import { createEditorStore, EditorStoreProvider, type EditorStoreApi } from "../editor/editorStore";
import { useAutosave, type SaveStatus } from "../editor/useAutosave";
import { LivePreview } from "../editor/LivePreview";
import { FullPageSpinner } from "../components/FullPageSpinner";
import { StatusBadge } from "../components/StatusBadge";
import { Button } from "../components/Button";
import { TextField } from "../components/TextField";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { EditorSection } from "../components/EditorSection";
import { getOrderedModules, MODULE_INFO, type ModuleKey } from "../../shared/moduleOrder";
import { computePublishChecklist } from "../../shared/publishability";
import { isReservedSlug, isValidSlugFormat } from "../../shared/reservedSlugs";
import {
  AlertCircleIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  ChevronRightIcon,
  CopyIcon,
  EyeIcon,
  GripIcon,
  ImageIcon,
  LinkIcon,
  ListIcon,
  MapPinIcon,
  PowerIcon,
  RotateIcon,
  SaveIcon,
  SendIcon,
} from "../components/icons";

const MODULE_ICONS: Record<ModuleKey, typeof ImageIcon> = {
  gallery: ImageIcon,
  actionButtons: LinkIcon,
  catalog: ListIcon,
  location: MapPinIcon,
};

/**
 * Tela 4 — `/app/minisites/:id/layout`: organizar módulos, conferir preview
 * final e publicar. Mesmo store/autosave do Editor (Fase 3), mesmo
 * `MiniSiteRenderer` compartilhado (via <LivePreview />) — nenhuma
 * arquitetura nova, só a UI desta tela.
 */
export function LayoutPage() {
  const { id } = useParams<{ id: string }>();
  const [store] = useState(() => createEditorStore(id!));
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

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
      <LayoutContent store={store} minisiteId={id!} />
    </EditorStoreProvider>
  );
}

function LayoutContent({ store, minisiteId }: { store: EditorStoreApi; minisiteId: string }) {
  const { showToast } = useToast();
  const { status: saveStatus, flushNow } = useAutosave(store, true);

  const internalName = store((s) => s.internalName);
  const slug = store((s) => s.slug);
  const status = store((s) => s.status);
  const config = store((s) => s.config);
  const hasUnpublishedChanges = store((s) => s.hasUnpublishedChanges);
  const setSlug = store((s) => s.setSlug);

  const [slugError, setSlugError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [confirmDisableOpen, setConfirmDisableOpen] = useState(false);
  const [mutating, setMutating] = useState<"publish" | "disable" | "reactivate" | null>(null);

  const orderedModules = useMemo(() => getOrderedModules(config), [config]);
  const checklist = useMemo(() => computePublishChecklist({ internalName, slug, config }), [internalName, slug, config]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const current = getOrderedModules(store.getState().config);
    const oldIndex = current.indexOf(active.id as ModuleKey);
    const newIndex = current.indexOf(over.id as ModuleKey);
    if (oldIndex === -1 || newIndex === -1) return;
    store.getState().patchConfig({ moduleOrder: arrayMove(current, oldIndex, newIndex) });
  }

  function handleSlugChange(raw: string) {
    const value = slugify(raw);
    setSlug(value);
    if (!value) setSlugError("Informe o endereço do site");
    else if (!isValidSlugFormat(value)) setSlugError("Use apenas letras minúsculas, números e hífen (3–50 caracteres)");
    else if (isReservedSlug(value)) setSlugError("Esse endereço não pode ser usado.");
    else setSlugError(null);
  }

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

  async function handleCopyUrl() {
    try {
      await navigator.clipboard.writeText(getPublicMiniSiteUrl(slug));
      setCopied(true);
      showToast("Link copiado");
      setTimeout(() => setCopied(false), 1500);
    } catch {
      showToast("Não foi possível copiar o link", "error");
    }
  }

  async function handlePublish() {
    await flushNow();
    setMutating("publish");
    try {
      const updated = await publishMiniSite(minisiteId);
      store.getState().loadFromDetail(updated);
      showToast("Publicado com sucesso");
    } catch (err) {
      showToast(err instanceof MiniSiteApiError ? err.message : "Não foi possível publicar.", "error");
    } finally {
      setMutating(null);
    }
  }

  async function handleDisable() {
    setMutating("disable");
    try {
      const updated = await disableMiniSite(minisiteId);
      store.getState().loadFromDetail(updated);
      showToast("Site desativado");
      setConfirmDisableOpen(false);
    } catch (err) {
      showToast(err instanceof MiniSiteApiError ? err.message : "Não foi possível desativar.", "error");
    } finally {
      setMutating(null);
    }
  }

  async function handleReactivate() {
    setMutating("reactivate");
    try {
      const updated = await reactivateMiniSite(minisiteId);
      store.getState().loadFromDetail(updated);
      showToast("Site reativado");
    } catch (err) {
      showToast(err instanceof MiniSiteApiError ? err.message : "Não foi possível reativar.", "error");
    } finally {
      setMutating(null);
    }
  }

  const displayUrl = getPublicMiniSiteDisplayUrl(slug);

  const primaryAction =
    status === "disabled"
      ? { label: "Reativar Site", icon: RotateIcon, onClick: handleReactivate, loading: mutating === "reactivate", disabled: false }
      : {
          // Sempre "Publicar" — nunca "Atualizar publicação". O botão só
          // promove o draft atual ao snapshot público; a indicação de que
          // já existem mudanças pendentes vem do badge ao lado, não do
          // texto do botão (ver hasUnpublishedChanges).
          label: "Publicar",
          icon: SendIcon,
          onClick: handlePublish,
          loading: mutating === "publish",
          disabled: !checklist.canPublish,
        };

  return (
    <div className="mx-auto max-w-[1400px]">
      <Link
        to={`/app/minisites/${minisiteId}/editar`}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-blue-600 hover:underline"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        Voltar para o Editor
      </Link>

      <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-brand-navy-900">Layout e Publicação</h1>
          <p className="mt-1 text-sm text-slate-500">Organize os módulos e confira seu site antes de publicar.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <SaveStatusLabel status={saveStatus} />
          {status !== "draft" ? <UnpublishedChangesBadge hasUnpublishedChanges={hasUnpublishedChanges} /> : null}
          <Button type="button" variant="secondary" fullWidth={false} icon={<SaveIcon className="h-4 w-4" />} onClick={handleSaveDraft}>
            Salvar rascunho
          </Button>
          <Button type="button" variant="secondary" fullWidth={false} icon={<EyeIcon className="h-4 w-4" />} onClick={handlePreview}>
            Pré-visualizar
          </Button>
          <Button
            type="button"
            fullWidth={false}
            icon={<primaryAction.icon className="h-4 w-4" />}
            onClick={primaryAction.onClick}
            loading={primaryAction.loading}
            disabled={primaryAction.disabled}
            title={primaryAction.disabled ? `Não é possível publicar: ${checklist.blockers.join(", ")}.` : undefined}
          >
            {primaryAction.label}
          </Button>
        </div>
      </div>

      {/* Coluna do preview alargada (400px -> 460px), igual ao Editor —
          mesmo mockup de celular (ver LivePreview), mesma largura de
          coluna, para as duas telas lerem como o mesmo produto. */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_460px]">
        <div className="flex min-w-0 flex-col gap-5">
          <EditorSection icon={<ListIcon className="h-5 w-5" />} title="Módulos públicos" subtitle="Arraste para reorganizar a ordem em que aparecem no site.">
            {orderedModules.length === 0 ? (
              <p className="rounded-xl border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-500">
                Nenhum módulo com conteúdo ainda. Volte ao editor para configurar galeria, botões, catálogo ou localização.
              </p>
            ) : (
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={orderedModules} strategy={verticalListSortingStrategy}>
                  <div className="flex flex-col gap-2.5">
                    {orderedModules.map((key) => (
                      <SortableModuleRow key={key} moduleKey={key} />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}
          </EditorSection>

          <EditorSection
            icon={<SendIcon className="h-5 w-5" />}
            title="Publicação"
            subtitle="Configure as informações de publicação do seu site."
            action={
              status === "active" ? (
                <button
                  type="button"
                  onClick={() => setConfirmDisableOpen(true)}
                  className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-sm font-semibold text-red-600 transition hover:bg-red-50 hover:text-red-700"
                >
                  <PowerIcon className="h-4 w-4" />
                  Desativar Site
                </button>
              ) : undefined
            }
          >
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <p className="text-sm font-semibold text-brand-navy-900">Status</p>
                <div className="flex h-[46px] items-center rounded-xl border border-slate-200 bg-slate-50 px-4 shadow-[inset_0_1px_2px_rgba(15,23,42,0.03)]">
                  <StatusBadge status={status} />
                </div>
              </div>
              <TextField
                name="layout-slug"
                label="Slug / URL"
                value={slug}
                onChange={(e) => handleSlugChange(e.target.value)}
                error={slugError ?? undefined}
                icon={<LinkIcon className="h-4 w-4" />}
              />
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-brand-navy-900">URL pública</p>
                <div className="mt-1.5 truncate rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600 shadow-[inset_0_1px_2px_rgba(15,23,42,0.03)]">
                  {displayUrl}
                </div>
              </div>
              <Button type="button" variant="secondary" fullWidth={false} icon={<CopyIcon className="h-4 w-4" />} onClick={handleCopyUrl}>
                Copiar URL
              </Button>
            </div>
            {copied ? <p className="-mt-2 text-xs font-medium text-emerald-600">Link copiado</p> : null}
          </EditorSection>

          <EditorSection icon={<CheckCircleIcon className="h-5 w-5" />} title="Checklist" subtitle="Verifique se tudo está pronto para publicar seu site.">
            {!checklist.canPublish ? (
              <p className="-mt-1 flex items-center gap-1.5 rounded-xl bg-amber-50 px-3.5 py-2.5 text-xs font-semibold text-amber-700">
                <AlertCircleIcon className="h-4 w-4 shrink-0" />
                Antes de publicar: {checklist.blockers.join(", ")}.
              </p>
            ) : null}

            <div className="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-3">
              {checklist.items.map((item) => (
                <div key={item.key} className="flex items-center gap-2">
                  {item.ok ? (
                    <CheckCircleIcon className="h-4.5 w-4.5 shrink-0 text-emerald-500" />
                  ) : item.blocking ? (
                    <AlertCircleIcon className="h-4.5 w-4.5 shrink-0 text-amber-500" />
                  ) : (
                    <span className="h-4.5 w-4.5 shrink-0 rounded-full border-2 border-slate-200" />
                  )}
                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold text-brand-navy-900">{item.label}</p>
                    <p className="text-[11px] text-slate-400">{item.ok ? "OK" : item.blocking ? "Pendente" : "Opcional"}</p>
                  </div>
                </div>
              ))}
            </div>
          </EditorSection>
        </div>

        <div>
          <div className="mb-3 flex items-center gap-2 text-sm font-bold text-brand-navy-900">
            <EyeIcon className="h-4.5 w-4.5 text-brand-blue-600" />
            Pré-visualização do Site
          </div>
          <LivePreview />
        </div>
      </div>

      <ConfirmDialog
        open={confirmDisableOpen}
        title="Desativar Site"
        description="Visitantes não conseguirão mais acessar este site publicamente até que você o reative. O conteúdo e o histórico de publicação são preservados."
        confirmLabel="Desativar"
        loading={mutating === "disable"}
        onCancel={() => setConfirmDisableOpen(false)}
        onConfirm={handleDisable}
      />
    </div>
  );
}

function SortableModuleRow({ moduleKey }: { moduleKey: ModuleKey }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: moduleKey });
  const info = MODULE_INFO[moduleKey];
  const Icon = MODULE_ICONS[moduleKey];

  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3.5 py-3 shadow-sm transition hover:border-slate-300 hover:shadow ${
        isDragging ? "z-10 shadow-lg ring-2 ring-brand-blue-500/40" : ""
      }`}
    >
      <button
        type="button"
        aria-label={`Reordenar ${info.label}`}
        className="cursor-grab touch-none rounded-lg p-1.5 text-slate-300 transition hover:bg-slate-50 hover:text-slate-500 active:cursor-grabbing"
        {...attributes}
        {...listeners}
      >
        <GripIcon className="h-4.5 w-4.5" />
      </button>
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-blue-50 text-brand-blue-600 ring-1 ring-inset ring-brand-blue-100">
        <Icon className="h-4.5 w-4.5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold text-brand-navy-900">{info.label}</p>
        <p className="truncate text-xs text-slate-500">{info.description}</p>
      </div>
      <ChevronRightIcon className="h-4 w-4 shrink-0 text-slate-300" />
    </div>
  );
}

/** Distingue draft (versão de trabalho, sempre salva pelo autosave) de published (snapshot público, só muda ao clicar Publicar) — ver src/server/db/publishedSnapshot.ts. */
function UnpublishedChangesBadge({ hasUnpublishedChanges }: { hasUnpublishedChanges: boolean }) {
  if (hasUnpublishedChanges) {
    return (
      <span className="flex items-center gap-1 text-xs font-semibold text-amber-600">
        <AlertCircleIcon className="h-3.5 w-3.5" />
        Alterações não publicadas
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600">
      <CheckCircleIcon className="h-3.5 w-3.5" />
      Tudo publicado
    </span>
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
