import { ChevronDownIcon } from "../components/icons";
import { EditorSection } from "../components/EditorSection";
import { ImageUploadField } from "../components/ImageUploadField";
import { ColorField } from "../components/ColorField";
import { PaletteIcon } from "../components/icons";
import type {
  MiniSiteBackgroundMode,
  MiniSiteBodyStyle,
  MiniSiteHeroShape,
  MiniSiteLogoPosition,
} from "../../shared/schemas/miniSiteConfig";
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
    patchConfig({ appearance: { ...appearance, ...patch } });
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
        hint="Fundo desfocado atrás de todo o conteúdo da página. Independente da capa — se não definir, o fundo usa um gradiente com as cores da marca."
        minisiteId={minisiteId}
        purpose="background"
        shape="wide"
        imageKey={appearance.backgroundKey}
        onChange={(key) => updateAppearance({ backgroundKey: key })}
      />

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <AppearanceSelect<MiniSiteBackgroundMode>
          id="backgroundMode"
          label="Estilo do fundo"
          value={appearance.backgroundMode}
          onChange={(value) => updateAppearance({ backgroundMode: value })}
          options={[
            { value: "solid", label: "Sólido / Gradiente" },
            { value: "image", label: "Imagem nítida" },
            { value: "image_blurred", label: "Imagem desfocada" },
          ]}
        />
        <AppearanceSelect<MiniSiteBodyStyle>
          id="bodyStyle"
          label="Estilo do corpo"
          value={appearance.bodyStyle}
          onChange={(value) => updateAppearance({ bodyStyle: value })}
          options={[
            { value: "solid", label: "Sólido" },
            { value: "acrylic", label: "Acrílico" },
          ]}
        />
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
      </div>
      <p className="-mt-3 text-xs text-slate-400">
        O estilo do fundo em modo imagem só se aplica quando há uma imagem de fundo enviada — sem imagem, usa sólido/gradiente automaticamente.
      </p>

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
