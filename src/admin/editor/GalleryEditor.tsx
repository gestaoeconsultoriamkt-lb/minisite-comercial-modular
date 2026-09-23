import { useRef, useState } from "react";
import { EditorSection } from "../components/EditorSection";
import { Button } from "../components/Button";
import { TextField } from "../components/TextField";
import { ToggleSwitch } from "../components/ToggleSwitch";
import { ArrowDownIcon, ArrowUpIcon, ImageIcon, PlusIcon, TrashIcon } from "../components/icons";
import { getAssetUrl } from "../../shared/assetUrl";
import { uploadMedia, MiniSiteApiError } from "../lib/minisitesApi";
import { compressImage } from "../lib/imageProcessing";
import { useToast } from "../lib/toast";
import { useEditorStore } from "./editorStore";

export function GalleryEditor() {
  const minisiteId = useEditorStore((s) => s.minisiteId);
  const gallery = useEditorStore((s) => s.config.gallery);
  const heading = useEditorStore((s) => s.config.galleryHeading);
  const patchConfig = useEditorStore((s) => s.patchConfig);
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const { showToast } = useToast();

  function updateHeading(patch: Partial<typeof heading>) {
    patchConfig({ galleryHeading: { ...heading, ...patch } });
  }

  const sorted = [...gallery].sort((a, b) => a.position - b.position);

  function saveOrder(images: typeof gallery) {
    patchConfig({ gallery: images.map((img, index) => ({ ...img, position: index })) });
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
      const compressed = await compressImage(file, "gallery");
      const { key } = await uploadMedia(minisiteId, "gallery", compressed);
      saveOrder([...sorted, { id: crypto.randomUUID(), imageKey: key, position: sorted.length }]);
    } catch (err) {
      showToast(err instanceof MiniSiteApiError ? err.message : "Não foi possível enviar a imagem.", "error");
    } finally {
      setUploading(false);
    }
  }

  function remove(id: string) {
    saveOrder(sorted.filter((img) => img.id !== id));
  }

  function move(id: string, direction: -1 | 1) {
    const index = sorted.findIndex((img) => img.id === id);
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= sorted.length) return;
    const next = [...sorted];
    [next[index], next[targetIndex]] = [next[targetIndex]!, next[index]!];
    saveOrder(next);
  }

  return (
    <EditorSection
      icon={<ImageIcon className="h-5 w-5" />}
      title="Galeria"
      subtitle="Fotos adicionais do seu negócio. Totalmente opcional."
      action={
        <Button type="button" variant="secondary" fullWidth={false} icon={<PlusIcon className="h-4 w-4" />} loading={uploading} onClick={() => inputRef.current?.click()}>
          Adicionar imagem
        </Button>
      }
    >
      <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={handleFileSelected} />

      <div className="flex flex-col gap-3 rounded-xl border border-slate-100 p-3">
        <TextField
          name="galleryTitle"
          label="Título da galeria"
          placeholder="Galeria"
          value={heading.title}
          onChange={(e) => updateHeading({ title: e.target.value })}
        />
        <label className="flex items-center gap-2.5 text-sm font-medium text-slate-600">
          <ToggleSwitch checked={heading.show} onChange={(v) => updateHeading({ show: v })} label="Exibir título da galeria" />
          Exibir título da galeria
        </label>
      </div>

      {sorted.length === 0 ? (
        <p className="text-sm text-slate-400">Nenhuma imagem adicionada ainda. A galeria não aparece no MiniSite até ter ao menos uma foto.</p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {sorted.map((image, index) => (
            <div key={image.id} className="group relative overflow-hidden rounded-xl border border-slate-100">
              <img src={getAssetUrl(image.imageKey)} alt="" className="h-24 w-full object-cover" />
              <div className="absolute inset-0 flex items-center justify-center gap-1 bg-black/50 opacity-0 transition group-hover:opacity-100">
                <button
                  type="button"
                  onClick={() => move(image.id, -1)}
                  disabled={index === 0}
                  aria-label="Mover para cima"
                  className="rounded-full bg-white/90 p-1.5 text-slate-700 disabled:opacity-40"
                >
                  <ArrowUpIcon className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => move(image.id, 1)}
                  disabled={index === sorted.length - 1}
                  aria-label="Mover para baixo"
                  className="rounded-full bg-white/90 p-1.5 text-slate-700 disabled:opacity-40"
                >
                  <ArrowDownIcon className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => remove(image.id)}
                  aria-label="Remover imagem"
                  className="rounded-full bg-white/90 p-1.5 text-red-600"
                >
                  <TrashIcon className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </EditorSection>
  );
}
