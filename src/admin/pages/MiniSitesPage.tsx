import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { useToast } from "../lib/toast";
import {
  MiniSiteApiError,
  deleteMiniSite,
  duplicateMiniSite,
  listMiniSites,
  type MiniSiteListItem,
  type MiniSiteStatus,
} from "../lib/minisitesApi";
import { MiniSiteCard } from "../components/MiniSiteCard";
import { NewMiniSiteModal } from "../components/NewMiniSiteModal";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { Button } from "../components/Button";
import { AlertCircleIcon, ChevronDownIcon, LayoutGridIcon, PlusIcon, SearchIcon, SortIcon } from "../components/icons";

type StatusFilter = "all" | MiniSiteStatus;
type SortOption = "recent" | "oldest" | "az" | "za";

const STATUS_CHIPS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "active", label: "Ativos" },
  { value: "draft", label: "Rascunhos" },
  { value: "disabled", label: "Desativados" },
];

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "recent", label: "Mais recentes" },
  { value: "oldest", label: "Mais antigos" },
  { value: "az", label: "Nome A-Z" },
  { value: "za", label: "Nome Z-A" },
];

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
          <div className="h-32 w-full animate-pulse bg-slate-100" />
          <div className="space-y-3 px-4 pb-4 pt-8">
            <div className="h-4 w-2/3 animate-pulse rounded bg-slate-100" />
            <div className="h-3 w-1/3 animate-pulse rounded bg-slate-100" />
            <div className="h-8 w-full animate-pulse rounded-lg bg-slate-100" />
            <div className="h-4 w-full animate-pulse rounded bg-slate-100" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function MiniSitesPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [minisites, setMinisites] = useState<MiniSiteListItem[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sortBy, setSortBy] = useState<SortOption>("recent");
  const [modalOpen, setModalOpen] = useState(false);
  const [duplicatingId, setDuplicatingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<MiniSiteListItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function loadMiniSites() {
    setLoadError(null);
    try {
      const data = await listMiniSites();
      setMinisites(data);
    } catch (err) {
      setLoadError(err instanceof MiniSiteApiError ? err.message : "Não foi possível carregar seus MiniSites.");
    }
  }

  useEffect(() => {
    // Roda só na montagem — loadMiniSites é chamada de novo explicitamente
    // (retry, após criar/duplicar/excluir), não precisa entrar como dependência.
    loadMiniSites();
  }, []);

  const filtered = useMemo(() => {
    if (!minisites) return [];
    const query = search.trim().toLowerCase();
    const list = minisites.filter((m) => {
      if (statusFilter !== "all" && m.status !== statusFilter) return false;
      if (!query) return true;
      return (
        m.internalName.toLowerCase().includes(query) ||
        m.slug.toLowerCase().includes(query) ||
        (m.niche ?? "").toLowerCase().includes(query)
      );
    });
    const nameOf = (m: MiniSiteListItem) => (m.displayName || m.internalName).toLowerCase();
    return [...list].sort((a, b) => {
      switch (sortBy) {
        case "recent":
          return b.updatedAt.localeCompare(a.updatedAt);
        case "oldest":
          return a.updatedAt.localeCompare(b.updatedAt);
        case "az":
          return nameOf(a).localeCompare(nameOf(b));
        case "za":
          return nameOf(b).localeCompare(nameOf(a));
        default:
          return 0;
      }
    });
  }, [minisites, search, statusFilter, sortBy]);

  function handleCreated(minisite: MiniSiteListItem) {
    setMinisites((prev) => (prev ? [minisite, ...prev] : [minisite]));
    setModalOpen(false);
    showToast("MiniSite criado com sucesso");
  }

  async function handleDuplicate(id: string) {
    setDuplicatingId(id);
    try {
      const copy = await duplicateMiniSite(id);
      setMinisites((prev) => (prev ? [copy, ...prev] : [copy]));
      showToast("MiniSite duplicado com sucesso");
    } catch (err) {
      showToast(err instanceof MiniSiteApiError ? err.message : "Não foi possível duplicar o MiniSite.", "error");
    } finally {
      setDuplicatingId(null);
    }
  }

  function requestDelete(id: string) {
    const target = minisites?.find((m) => m.id === id) ?? null;
    setDeleteTarget(target);
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteMiniSite(deleteTarget.id);
      setMinisites((prev) => prev?.filter((m) => m.id !== deleteTarget.id) ?? prev);
      showToast("MiniSite excluído");
      setDeleteTarget(null);
    } catch (err) {
      showToast(err instanceof MiniSiteApiError ? err.message : "Não foi possível excluir o MiniSite.", "error");
    } finally {
      setDeleting(false);
    }
  }

  const hasAny = (minisites?.length ?? 0) > 0;

  return (
    <div className="mx-auto max-w-7xl">
      <h1 className="text-2xl font-extrabold tracking-tight text-brand-navy-900">Meus Sites</h1>
      <p className="mt-1 text-sm text-slate-500">Crie e gerencie de forma simples e rápida</p>

      <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative flex-1 lg:max-w-sm">
          <SearchIcon className="pointer-events-none absolute inset-y-0 left-3.5 my-auto h-4.5 w-4.5 text-slate-400" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar pelo nome do negócio"
            aria-label="Buscar MiniSites"
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-blue-500 focus:outline-none focus:ring-2 focus:ring-brand-blue-500/40"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex flex-wrap gap-1.5 rounded-xl bg-slate-100 p-1">
            {STATUS_CHIPS.map((chip) => (
              <button
                key={chip.value}
                type="button"
                onClick={() => setStatusFilter(chip.value)}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                  statusFilter === chip.value
                    ? "bg-brand-blue-600 text-white shadow-sm"
                    : "text-slate-600 hover:bg-white"
                }`}
              >
                {chip.label}
              </button>
            ))}
          </div>

          <div className="relative">
            <SortIcon className="pointer-events-none absolute inset-y-0 left-3 my-auto h-4 w-4 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              aria-label="Ordenar"
              className="appearance-none rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-8 text-sm font-medium text-slate-700 focus:border-brand-blue-500 focus:outline-none focus:ring-2 focus:ring-brand-blue-500/40"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <ChevronDownIcon className="pointer-events-none absolute inset-y-0 right-2.5 my-auto h-4 w-4 text-slate-400" />
          </div>

          <Button type="button" fullWidth={false} icon={<PlusIcon className="h-4 w-4" />} onClick={() => setModalOpen(true)}>
            Novo Site
          </Button>
        </div>
      </div>

      <div className="mt-6">
        {minisites === null && !loadError ? (
          <SkeletonGrid />
        ) : loadError ? (
          <div className="flex flex-col items-center gap-3 rounded-3xl border border-red-100 bg-red-50 px-6 py-14 text-center">
            <AlertCircleIcon className="h-8 w-8 text-red-500" />
            <p className="text-sm font-semibold text-red-700">{loadError}</p>
            <Button type="button" variant="secondary" fullWidth={false} onClick={loadMiniSites}>
              Tentar novamente
            </Button>
          </div>
        ) : !hasAny ? (
          <div className="flex flex-col items-center rounded-3xl border border-dashed border-slate-200 bg-white px-6 py-16 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-blue-50">
              <LayoutGridIcon className="h-7 w-7 text-brand-blue-600" />
            </div>
            <p className="mt-5 text-base font-semibold text-brand-navy-900">Você ainda não possui MiniSites.</p>
            <p className="mt-1.5 max-w-sm text-sm text-slate-500">Crie seu primeiro MiniSite para começar.</p>
            <Button type="button" fullWidth={false} icon={<PlusIcon className="h-4 w-4" />} className="mt-5" onClick={() => setModalOpen(true)}>
              Novo MiniSite
            </Button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-200 bg-white px-6 py-14 text-center">
            <p className="text-sm font-semibold text-brand-navy-900">Nenhum MiniSite encontrado com esses filtros.</p>
            <p className="mt-1 text-sm text-slate-500">Ajuste a busca ou os filtros aplicados.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((minisite) => (
              <MiniSiteCard
                key={minisite.id}
                minisite={minisite}
                onEdit={(id) => navigate(`/app/minisites/${id}/editar`)}
                onDuplicate={handleDuplicate}
                onDelete={requestDelete}
                duplicating={duplicatingId === minisite.id}
              />
            ))}
          </div>
        )}
      </div>

      <NewMiniSiteModal open={modalOpen} onClose={() => setModalOpen(false)} onCreated={handleCreated} />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Excluir MiniSite"
        description={`Tem certeza que deseja excluir "${deleteTarget?.internalName ?? ""}"? Esta ação não pode ser desfeita.`}
        loading={deleting}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
