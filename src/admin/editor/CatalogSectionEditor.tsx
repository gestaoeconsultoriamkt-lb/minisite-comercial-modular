import { useRef, useState } from "react";
import { ToggleSwitch } from "../components/ToggleSwitch";
import { ChevronDownIcon, TrashIcon } from "../components/icons";
import { getAssetUrl } from "../../shared/assetUrl";
import { uploadMedia, MiniSiteApiError } from "../lib/minisitesApi";
import { compressImage } from "../lib/imageProcessing";
import { useToast } from "../lib/toast";
import { getSectionImageItems, isCatalogSectionReady, type CatalogImageItem } from "../../shared/catalog";
import type { MiniSiteSection, MiniSiteSectionImage } from "../../shared/schemas/miniSiteConfig";

/**
 * Imagens da seção — cada uma com nome/preço opcionais, editáveis em
 * campos compactos abaixo da miniatura (sem popover/modal, para agilizar
 * a edição). Toda escrita recalcula `position` pela ordem do array e
 * grava sempre em `images` — a primeira edição já carrega para lá
 * qualquer imagem legada de `imageKeys`/`imageKey` (via
 * getSectionImageItems), sem passo de migração explícito.
 */
function SectionImagesField({
  minisiteId,
  section,
  onChange,
}: {
  minisiteId: string;
  section: MiniSiteSection;
  onChange: (patch: Partial<MiniSiteSection>) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const { showToast } = useToast();
  const items = getSectionImageItems(section);

  function writeImages(next: CatalogImageItem[]) {
    const images: MiniSiteSectionImage[] = next.map((it, index) => ({
      id: it.id,
      imageKey: it.imageKey,
      label: it.label,
      price: it.price,
      position: index,
    }));
    onChange({ images });
  }

  async function handleFileSelected(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
      showToast("Envie uma imagem PNG, JPG ou WebP.", "error");
      return;
    }
    setUploading(true);
    try {
      const compressed = await compressImage(file, "section");
      const { key } = await uploadMedia(minisiteId, "section", compressed);
      writeImages([...items, { id: crypto.randomUUID(), imageKey: key }]);
    } catch (err) {
      showToast(err instanceof MiniSiteApiError ? err.message : "Não foi possível enviar a imagem.", "error");
    } finally {
      setUploading(false);
    }
  }

  function remove(id: string) {
    writeImages(items.filter((it) => it.id !== id));
  }

  function updateItem(id: string, patch: Partial<CatalogImageItem>) {
    writeImages(items.map((it) => (it.id === id ? { ...it, ...patch } : it)));
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-brand-navy-900">Imagens da seção</p>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="rounded-lg border border-brand-blue-200 bg-brand-blue-50 px-3 py-1.5 text-xs font-semibold text-brand-blue-700 transition hover:bg-brand-blue-100 disabled:opacity-60"
        >
          {uploading ? "Enviando..." : "Adicionar imagem"}
        </button>
      </div>
      <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={handleFileSelected} />
      {items.length === 0 ? (
        <p className="text-xs text-slate-400">Nenhuma imagem ainda. A seção não aparece no MiniSite até ter ao menos uma foto.</p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {items.map((item) => (
            <div key={item.id} className="flex flex-col gap-1.5">
              <div className="group relative overflow-hidden rounded-xl border border-slate-100">
                <img src={getAssetUrl(item.imageKey)} alt="" className="aspect-[3/4] w-full object-cover" />
                <button
                  type="button"
                  onClick={() => remove(item.id)}
                  aria-label="Remover imagem"
                  className="absolute right-1.5 top-1.5 rounded-full bg-black/60 p-1.5 text-white opacity-0 transition group-hover:opacity-100"
                >
                  <TrashIcon className="h-3.5 w-3.5" />
                </button>
              </div>
              <input
                type="text"
                aria-label="Nome da imagem (opcional)"
                name={`section-image-${item.id}-label`}
                placeholder="Nome (opcional)"
                value={item.label ?? ""}
                onChange={(e) => updateItem(item.id, { label: e.target.value || undefined })}
                className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm text-slate-700 focus:border-brand-blue-500 focus:outline-none focus:ring-1 focus:ring-brand-blue-500/40"
              />
              <input
                type="number"
                min="0"
                step="0.01"
                aria-label="Preço da imagem (opcional)"
                name={`section-image-${item.id}-price`}
                placeholder="Preço"
                value={item.price ?? ""}
                onChange={(e) => updateItem(item.id, { price: e.target.value === "" ? undefined : Number(e.target.value) })}
                className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm text-slate-700 focus:border-brand-blue-500 focus:outline-none focus:ring-1 focus:ring-brand-blue-500/40"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

interface CatalogSectionEditorProps {
  minisiteId: string;
  section: MiniSiteSection;
  onChange: (patch: Partial<MiniSiteSection>) => void;
  onRemove: () => void;
}

export function CatalogSectionEditor({ minisiteId, section, onChange, onRemove }: CatalogSectionEditorProps) {
  const [expanded, setExpanded] = useState(true);

  const images = getSectionImageItems(section);
  const sectionReady = isCatalogSectionReady(section);

  return (
    // Card com borda/sombra próprias — visualmente claro onde a seção
    // começa e termina, mesmo padrão do restante do editor.
    <div className="overflow-hidden rounded-2xl border border-slate-200 shadow-sm">
      <div className="flex flex-col gap-3 bg-slate-50 px-4 py-3.5">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            aria-label={expanded ? "Recolher seção" : "Expandir seção"}
            className="shrink-0 text-slate-400 transition hover:text-slate-600"
          >
            <ChevronDownIcon className={`h-4.5 w-4.5 transition-transform ${expanded ? "rotate-180" : ""}`} />
          </button>
          <input
            type="text"
            aria-label="Título da seção"
            value={section.title}
            onChange={(e) => onChange({ title: e.target.value })}
            placeholder="Título da seção"
            className="min-w-[160px] flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-brand-navy-900 focus:border-brand-blue-500 focus:outline-none focus:ring-2 focus:ring-brand-blue-500/40"
          />
          <button
            type="button"
            onClick={onRemove}
            aria-label="Remover seção"
            className="shrink-0 rounded-lg p-1.5 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>

        {/* Controles gerais da seção, numa linha própria — nunca disputando espaço com título/excluir. */}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pl-7">
          <label className="flex items-center gap-2.5 text-sm font-medium text-slate-600">
            <ToggleSwitch checked={section.showPrices} onChange={(v) => onChange({ showPrices: v })} label="Exibir preço" />
            Exibir preço (opcional)
          </label>
          <span className={`text-xs font-semibold sm:ml-auto ${sectionReady ? "text-emerald-600" : "text-slate-400"}`}>
            {!sectionReady
              ? "Adicione ao menos uma imagem para esta seção aparecer no MiniSite"
              : `${images.length} ${images.length === 1 ? "imagem" : "imagens"} no MiniSite`}
          </span>
        </div>
      </div>

      {expanded ? (
        <div className="flex flex-col gap-4 border-t border-slate-100 p-4">
          <SectionImagesField minisiteId={minisiteId} section={section} onChange={onChange} />
        </div>
      ) : null}
    </div>
  );
}
