import { useState } from "react";
import { EditorSection } from "../components/EditorSection";
import { TextField } from "../components/TextField";
import { StatusBadge } from "../components/StatusBadge";
import { ClipboardIcon, LinkIcon } from "../components/icons";
import { isReservedSlug, isValidSlugFormat } from "../../shared/reservedSlugs";
import { slugify } from "../lib/slugify";
import { useEditorStore } from "./editorStore";

export function BasicInfoEditor() {
  const internalName = useEditorStore((s) => s.internalName);
  const niche = useEditorStore((s) => s.niche);
  const slug = useEditorStore((s) => s.slug);
  const status = useEditorStore((s) => s.status);
  const setInternalName = useEditorStore((s) => s.setInternalName);
  const setNiche = useEditorStore((s) => s.setNiche);
  const setSlug = useEditorStore((s) => s.setSlug);

  const [slugError, setSlugError] = useState<string | null>(null);

  function handleSlugChange(raw: string) {
    const value = slugify(raw);
    setSlug(value);
    if (!value) setSlugError("Informe o endereço do MiniSite");
    else if (!isValidSlugFormat(value)) setSlugError("Use apenas letras minúsculas, números e hífen (3–50 caracteres)");
    else if (isReservedSlug(value)) setSlugError("Esse endereço não pode ser usado.");
    else setSlugError(null);
  }

  return (
    <EditorSection icon={<ClipboardIcon className="h-5 w-5" />} title="Informações básicas" subtitle="Defina as informações principais do seu mini site.">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <TextField name="internalName" label="Nome interno" value={internalName} onChange={(e) => setInternalName(e.target.value)} required />

        <TextField
          name="slug"
          label="Slug / URL"
          value={slug}
          onChange={(e) => handleSlugChange(e.target.value)}
          error={slugError ?? undefined}
          icon={<LinkIcon className="h-4 w-4" />}
        />
      </div>

      <p className="-mt-3 truncate text-xs text-slate-400">
        {typeof window !== "undefined" ? window.location.host : ""}/{slug || "seu-slug"}
      </p>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <TextField name="niche" label="Nicho" value={niche} onChange={(e) => setNiche(e.target.value)} required />

        <div className="flex flex-col gap-1.5">
          <p className="text-sm font-semibold text-brand-navy-900">Status</p>
          <div className="flex h-[46px] items-center">
            <StatusBadge status={status} />
          </div>
        </div>
      </div>
    </EditorSection>
  );
}
