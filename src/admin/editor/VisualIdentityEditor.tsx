import { ChevronDownIcon } from "../components/icons";
import { EditorSection } from "../components/EditorSection";
import { ImageUploadField } from "../components/ImageUploadField";
import { ColorField } from "../components/ColorField";
import { PaletteIcon } from "../components/icons";
import type { MiniSiteHeroShape, MiniSiteLogoPosition, MiniSiteLogoTreatment } from "../../shared/schemas/miniSiteConfig";
import { useEditorStore } from "./editorStore";

function AppearanceSelect<T extends string>({
  id,
  label,
  value,
  options,
  onChange,
}: {
  id: string;
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
}) {
  return (
    <div>
      <label htmlFor={id} className="text-sm font-semibold text-brand-navy-900">
        {label}
      </label>
      <div className="relative mt-1.5">
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value as T)}
          className="w-full appearance-none rounded-xl border border-slate-200 bg-white py-3 pl-4 pr-9 text-sm font-medium text-slate-700 focus:border-brand-blue-500 focus:outline-none focus:ring-2 focus:ring-brand-blue-500/40"
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDownIcon className="pointer-events-none absolute inset-y-0 right-3 my-auto h-4 w-4 text-slate-400" />
      </div>
    </div>
  );
}

export function VisualIdentityEditor() {
  const minisiteId = useEditorStore((s) => s.minisiteId);
  const appearance = useEditorStore((s) => s.config.appearance);
  const patchConfig = useEditorStore((s) => s.patchConfig);

  function updateAppearance(patch: Partial<typeof appearance>) {
    patchConfig((config) => ({ appearance: { ...config.appearance, ...patch } }));
  }

  return (
    <EditorSection icon={<PaletteIcon className="h-5 w-5" />} title="Identidade visual" subtitle="Logo, capa e cores da sua marca.">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <ImageUploadField
          label="Logotipo"
          minisiteId={minisiteId}
          purpose="logo"
          shape="square"
          imageKey={appearance.logoKey}
          onChange={(key) => updateAppearance({ logoKey: key })}
        />
        <ImageUploadField
          label="Capa"
          minisiteId={minisiteId}
          purpose="cover"
          shape="wide"
          imageKey={appearance.coverKey}
          onChange={(key) => updateAppearance({ coverKey: key })}
          hint="Aparece no topo do MiniSite, atrás do logo e do nome. Recomendado 1200x630."
        />
      </div>

      <ImageUploadField
        label="Imagem de fundo (opcional)"
        hint="Aparece nítida atrás de todo o conteúdo da página. Independente da capa — se não definir, o fundo usa um gradiente com as cores da marca."
        minisiteId={minisiteId}
        purpose="background"
        shape="wide"
        imageKey={appearance.backgroundKey}
        onChange={(key) => updateAppearance({ backgroundKey: key })}
      />

      {/*
        V1: só "Posição da logo", "Formato da hero" e "Tratamento da logo"
        ficam configuráveis. "Estilo do fundo" (sólido/nítido/desfocado) e
        "Estilo do corpo" (sólido/acrílico) foram removidos da interface —
        o comportamento efetivo agora é fixo (imagem nítida quando houver
        imagem de fundo; corpo sempre sólido). Os campos continuam no
        schema (ver miniSiteConfig.ts) só para não descartar valores já
        salvos em configs antigos — o renderer não lê mais o valor deles.
      */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <AppearanceSelect<MiniSiteLogoPosition>
          id="logoPosition"
          label="Posição da logo"
          value={appearance.logoPosition}
          onChange={(value) => updateAppearance({ logoPosition: value })}
          options={[
            { value: "over_cover", label: "Sobre a capa" },
            { value: "floating", label: "Flutuante na transição" },
          ]}
        />
        <AppearanceSelect<MiniSiteHeroShape>
          id="heroShape"
          label="Formato da hero"
          value={appearance.heroShape}
          onChange={(value) => updateAppearance({ heroShape: value })}
          options={[
            { value: "straight", label: "Reta" },
            { value: "curve", label: "Curva suave" },
            { value: "wave", label: "Onda" },
          ]}
        />
        <AppearanceSelect<MiniSiteLogoTreatment>
          id="logoTreatment"
          label="Tratamento da logo"
          value={appearance.logoTreatment}
          onChange={(value) => updateAppearance({ logoTreatment: value })}
          options={[
            { value: "plate", label: "Com placa branca" },
            { value: "none", label: "Sem placa (logo solta)" },
          ]}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <ColorField label="Cor primária" value={appearance.colorPrimary ?? "#1d4ed8"} onChange={(hex) => updateAppearance({ colorPrimary: hex })} />
        <ColorField label="Cor secundária" value={appearance.colorSecondary ?? "#0f1d45"} onChange={(hex) => updateAppearance({ colorSecondary: hex })} />
        <ColorField
          label="Cor de fundo dos botões"
          value={appearance.colorButtonBackground ?? appearance.colorPrimary ?? "#1d4ed8"}
          onChange={(hex) => updateAppearance({ colorButtonBackground: hex })}
        />
        <ColorField
          label="Cor do texto dos botões"
          value={appearance.colorButtonText ?? "#ffffff"}
          onChange={(hex) => updateAppearance({ colorButtonText: hex })}
        />
      </div>
      <p className="-mt-3 text-xs text-slate-400">
        Todos os botões do MiniSite (ação e redes sociais) usam essas duas cores — visual único e consistente da marca.
      </p>
    </EditorSection>
  );
}
