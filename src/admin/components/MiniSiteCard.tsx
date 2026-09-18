import { useState } from "react";
import { getAssetUrl } from "../../shared/assetUrl";
import { getPublicMiniSiteDisplayUrl, getPublicMiniSiteUrl } from "../lib/publicUrl";
import { useToast } from "../lib/toast";
import type { MiniSiteListItem } from "../lib/minisitesApi";
import { StatusBadge } from "./StatusBadge";
import {
  CopyIcon,
  DuplicateIcon,
  ExternalLinkIcon,
  LinkIcon,
  PencilIcon,
  TagIcon,
  TrashIcon,
} from "./icons";

interface MiniSiteCardProps {
  minisite: MiniSiteListItem;
  onEdit: (id: string) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
  duplicating?: boolean;
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0]}${parts[parts.length - 1]![0]}`.toUpperCase();
}

export function MiniSiteCard({ minisite, onEdit, onDuplicate, onDelete, duplicating }: MiniSiteCardProps) {
  const { showToast } = useToast();
  const [copied, setCopied] = useState(false);

  const displayName = minisite.displayName || minisite.internalName;
  const publicUrl = getPublicMiniSiteUrl(minisite.slug);
  const displayUrl = getPublicMiniSiteDisplayUrl(minisite.slug);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      showToast("Link copiado");
      setTimeout(() => setCopied(false), 1500);
    } catch {
      showToast("Não foi possível copiar o link", "error");
    }
  }

  function handleOpen() {
    window.open(publicUrl, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition hover:shadow-md">
      <div className="relative h-32 w-full overflow-hidden bg-gradient-to-br from-brand-navy-800 to-brand-navy-950">
        {minisite.coverKey ? (
          <img src={getAssetUrl(minisite.coverKey)} alt="" className="h-full w-full object-cover" />
        ) : null}
        {(minisite.headline || minisite.shortDescription) && (
          <div className="absolute inset-0 flex flex-col justify-center gap-1 bg-gradient-to-t from-black/70 via-black/20 to-transparent px-4">
            {minisite.headline ? (
              <p className="text-sm font-bold leading-tight text-white">{minisite.headline}</p>
            ) : null}
            {minisite.shortDescription ? (
              <p className="text-xs text-white/80">{minisite.shortDescription}</p>
            ) : null}
          </div>
        )}

        <div className="absolute -bottom-5 left-4 flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl border-2 border-white bg-white shadow-md">
          {minisite.logoKey ? (
            <img src={getAssetUrl(minisite.logoKey)} alt="" className="h-full w-full object-cover" />
          ) : (
            <div
              className="flex h-full w-full items-center justify-center text-xs font-bold text-white"
              style={{ backgroundColor: minisite.colorPrimary ?? "#1d4ed8" }}
            >
              {initials(displayName)}
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 px-4 pb-4 pt-8">
        <div className="flex items-start justify-between gap-2">
          <h3 className="truncate text-base font-bold text-brand-navy-900">{displayName}</h3>
          <StatusBadge status={minisite.status} />
        </div>

        {minisite.niche ? (
          <div className="-mt-2 flex items-center gap-1.5 text-sm text-slate-500">
            <TagIcon className="h-4 w-4 shrink-0" />
            <span className="truncate">{minisite.niche}</span>
          </div>
        ) : null}

        <div className="flex items-center justify-between gap-2 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
          <div className="flex min-w-0 items-center gap-1.5 text-xs text-slate-600">
            <LinkIcon className="h-3.5 w-3.5 shrink-0 text-slate-400" />
            <span className="truncate">{displayUrl}</span>
          </div>
          <button
            type="button"
            onClick={handleCopy}
            aria-label="Copiar link"
            className="shrink-0 rounded-md p-1 text-slate-400 transition hover:bg-white hover:text-brand-blue-600"
          >
            <CopyIcon className="h-4 w-4" />
          </button>
        </div>
        {copied ? <p className="-mt-2 text-xs font-medium text-emerald-600">Link copiado</p> : null}

        <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-3 text-sm font-medium">
          <button
            type="button"
            onClick={() => onEdit(minisite.id)}
            className="flex items-center gap-1.5 text-brand-blue-600 transition hover:text-brand-blue-700"
          >
            <PencilIcon className="h-4 w-4" />
            Editar
          </button>
          <button
            type="button"
            onClick={handleOpen}
            className="flex items-center gap-1.5 text-slate-700 transition hover:text-brand-navy-900"
          >
            <ExternalLinkIcon className="h-4 w-4" />
            Abrir
          </button>
          <button
            type="button"
            onClick={() => onDuplicate(minisite.id)}
            disabled={duplicating}
            className="flex items-center gap-1.5 text-slate-700 transition hover:text-brand-navy-900 disabled:opacity-50"
          >
            <DuplicateIcon className="h-4 w-4" />
            Duplicar
          </button>
          <button
            type="button"
            onClick={() => onDelete(minisite.id)}
            className="flex items-center gap-1.5 text-red-600 transition hover:text-red-700"
          >
            <TrashIcon className="h-4 w-4" />
            Excluir
          </button>
        </div>
      </div>
    </div>
  );
}
