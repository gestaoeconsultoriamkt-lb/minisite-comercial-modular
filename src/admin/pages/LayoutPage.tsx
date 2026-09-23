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
    if (!value) setSlugError("Informe o endereço do MiniSite");
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
      showToast("MiniSite desativado");
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
      showToast("MiniSite reativado");
    } catch (err) {
      showToast(err instanceof MiniSiteApiError ? err.message : "Não foi possível reativar.", "error");
    } finally {
      setMutating(null);
    }
  }

  const displayUrl = getPublicMiniSiteDisplayUrl(slug);

  const primaryAction =
    status === "disabled"
      ? { label: "Reativar MiniSite", icon: RotateIcon, onClick: handleReactivate, loading: mutating === "reactivate", disabled: false }
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
          <p className="mt-1 text-sm text-slate-500">Organize os módulos e confira seu MiniSite antes de publicar.</p>
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

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_400px]">
        <div className="flex min-w-0 flex-col gap-5">
          <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-blue-50 text-brand-blue-600">
                <ListIcon className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-brand-navy-900">Módulos públicos</h2>
                <p className="mt-0.5 text-sm text-slate-500">Arraste para reorganizar a ordem em que aparecem no MiniSite.</p>
              </div>
            </div>

            <div className="mt-5">
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
            </div>
          </section>

          <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-blue-50 text-brand-blue-600">
                  <SendIcon className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-brand-navy-900">Publicação</h2>
                  <p className="mt-0.5 text-sm text-slate-500">Configure as informações de publicação do seu MiniSite.</p>
                </div>
              </div>
              {status === "active" ? (
                <button
                  type="button"
                  onClick={() => setConfirmDisableOpen(true)}
                  className="flex items-center gap-1.5 text-sm font-semibold text-red-600 transition hover:text-red-700"
                >
                  <PowerIcon className="h-4 w-4" />
                  Desativar MiniSite
                </button>
              ) : null}
            </div>

            <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <p className="text-sm font-semibold text-brand-navy-900">Status</p>
                <div className="flex h-[46px] items-center rounded-xl border border-slate-200 bg-slate-50 px-4">
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

            <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:items-end">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-brand-navy-900">URL pública</p>
                <div className="mt-1.5 truncate rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">{displayUrl}</div>
              </div>
              <Button type="button" variant="secondary" fullWidth={false} icon={<CopyIcon className="h-4 w-4" />} onClick={handleCopyUrl}>
                Copiar URL
              </Button>
            </div>
            {copied ? <p className="mt-2 text-xs font-medium text-emerald-600">Link copiado</p> : null}
          </section>

          <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-blue-50 text-brand-blue-600">
                <CheckCircleIcon className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-brand-navy-900">Checklist</h2>
                <p className="mt-0.5 text-sm text-slate-500">Verifique se tudo está pronto para publicar seu MiniSite.</p>
              </div>
            </div>

            {!checklist.canPublish ? (
              <p className="mt-4 flex items-center gap-1.5 rounded-xl bg-amber-50 px-3.5 py-2.5 text-xs font-semibold text-amber-700">
                <AlertCircleIcon className="h-4 w-4 shrink-0" />
                Antes de publicar: {checklist.blockers.join(", ")}.
              </p>
            ) : null}

            <div className="mt-5 grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-3">
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
          </section>
        </div>

        <div>
          <div className="mb-3 flex items-center gap-2 text-sm font-bold text-brand-navy-900">
            <EyeIcon className="h-4.5 w-4.5 text-brand-blue-600" />
            Pré-visualização do MiniSite
          </div>
          <LivePreview />
        </div>
      </div>

      <ConfirmDialog
        open={confirmDisableOpen}
        title="Desativar MiniSite"
        description="Visitantes não conseguirão mais acessar este MiniSite publicamente até que você o reative. O conteúdo e o histórico de publicação são preservados."
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
      className={`flex items-center gap-3 rounded-xl border border-slate-100 bg-white px-3.5 py-3 shadow-sm transition ${
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
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-blue-50 text-brand-blue-600">
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
