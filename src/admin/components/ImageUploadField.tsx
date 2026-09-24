import { useRef, useState } from "react";
import { getAssetUrl } from "../../shared/assetUrl";
import { uploadMedia, MiniSiteApiError, type UploadPurpose } from "../lib/minisitesApi";
import { compressImage } from "../lib/imageProcessing";
import { useToast } from "../lib/toast";
import { ImageIcon } from "./icons";

interface ImageUploadFieldProps {
  label: string;
  hint?: string;
  minisiteId: string;
  purpose: UploadPurpose;
  imageKey?: string;
  onChange: (key: string | undefined) => void;
  shape?: "square" | "wide";
}

export function ImageUploadField({ label, hint, minisiteId, purpose, imageKey, onChange, shape = "wide" }: ImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const { showToast } = useToast();

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
      const compressed = await compressImage(file, purpose);
      const { key } = await uploadMedia(minisiteId, purpose, compressed);
      onChange(key);
    } catch (err) {
      showToast(err instanceof MiniSiteApiError ? err.message : "Não foi possível enviar a imagem.", "error");
    } finally {
      setUploading(false);
    }
  }

  const previewBox = shape === "square" ? "h-20 w-20 rounded-xl" : "h-20 w-32 rounded-xl";

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm font-semibold text-brand-navy-900">{label}</p>
      <div className="flex items-center gap-3">
        <div className={`flex shrink-0 items-center justify-center overflow-hidden border border-slate-200 bg-slate-50 shadow-[inset_0_1px_2px_rgba(15,23,42,0.04)] ${previewBox}`}>
          {imageKey ? (
            <img src={getAssetUrl(imageKey)} alt="" className="h-full w-full object-cover" />
          ) : (
            <ImageIcon className="h-6 w-6 text-slate-300" />
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="rounded-lg border border-brand-blue-200 bg-brand-blue-50 px-3 py-1.5 text-xs font-semibold text-brand-blue-700 shadow-sm transition hover:border-brand-blue-300 hover:bg-brand-blue-100 disabled:opacity-60"
            >
              {uploading ? "Enviando..." : imageKey ? "Alterar" : "Enviar imagem"}
            </button>
            {imageKey ? (
              <button
                type="button"
                onClick={() => onChange(undefined)}
                disabled={uploading}
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-500 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
              >
                Remover
              </button>
            ) : null}
          </div>
          <p className="text-xs text-slate-400">{hint ?? "PNG, JPG ou WebP, máx. 5MB"}</p>
        </div>
      </div>
      <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={handleFileSelected} />
    </div>
  );
}
