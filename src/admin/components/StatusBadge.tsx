import type { MiniSiteStatus } from "../lib/minisitesApi";

const STATUS_CONFIG: Record<MiniSiteStatus, { label: string; className: string; dot: string }> = {
  active: { label: "Ativo", className: "bg-emerald-50 text-emerald-700", dot: "bg-emerald-500" },
  draft: { label: "Rascunho", className: "bg-amber-50 text-amber-700", dot: "bg-amber-500" },
  disabled: { label: "Desativado", className: "bg-red-50 text-red-600", dot: "bg-red-500" },
};

export function StatusBadge({ status }: { status: MiniSiteStatus }) {
  const config = STATUS_CONFIG[status];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${config.className}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
}

export const STATUS_LABELS: Record<MiniSiteStatus, string> = {
  active: "Ativo",
  draft: "Rascunho",
  disabled: "Desativado",
};
