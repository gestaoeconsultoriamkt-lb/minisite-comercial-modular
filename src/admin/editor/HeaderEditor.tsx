import { EditorSection } from "../components/EditorSection";
import { TextField } from "../components/TextField";
import { TextareaField } from "../components/TextareaField";
import { ChevronDownIcon, TypeIcon } from "../components/icons";
import { useEditorStore } from "./editorStore";

export function HeaderEditor() {
  const header = useEditorStore((s) => s.config.header);
  const patchConfig = useEditorStore((s) => s.patchConfig);

  function updateHeader(patch: Partial<typeof header>) {
    patchConfig({ header: { ...header, ...patch } });
  }

  return (
    <EditorSection icon={<TypeIcon className="h-5 w-5" />} title="Cabeçalho" subtitle="Nome, headline e apresentação do seu negócio.">
      <TextField
        name="displayName"
        label="Nome do negócio"
        placeholder="Nome exibido no MiniSite"
        value={header.displayName ?? ""}
        onChange={(e) => updateHeader({ displayName: e.target.value })}
      />

      <TextField
        name="headline"
        label="Headline"
        placeholder="Uma frase que resume seu negócio"
        value={header.headline ?? ""}
        onChange={(e) => updateHeader({ headline: e.target.value })}
      />

      <TextareaField
        name="shortDescription"
        label="Descrição curta"
        placeholder="Uma linha curta de apoio à headline"
        rows={2}
        value={header.shortDescription ?? ""}
        onChange={(e) => updateHeader({ shortDescription: e.target.value })}
      />

      <div className="max-w-xs">
        <label htmlFor="headerVariant" className="text-sm font-semibold text-brand-navy-900">
          Layout da capa
        </label>
        <div className="relative mt-1.5">
          <select
            id="headerVariant"
            value={header.variant}
            onChange={(e) => updateHeader({ variant: e.target.value as "highlight" | "compact" })}
            className="w-full appearance-none rounded-xl border border-slate-200 bg-white py-3 pl-4 pr-9 text-sm font-medium text-slate-700 focus:border-brand-blue-500 focus:outline-none focus:ring-2 focus:ring-brand-blue-500/40"
          >
            <option value="highlight">Destaque visual</option>
            <option value="compact">Compacto institucional</option>
          </select>
          <ChevronDownIcon className="pointer-events-none absolute inset-y-0 right-3 my-auto h-4 w-4 text-slate-400" />
        </div>
      </div>
    </EditorSection>
  );
}
