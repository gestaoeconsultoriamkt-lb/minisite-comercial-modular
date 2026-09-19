import { EditorSection } from "../components/EditorSection";
import { ImageUploadField } from "../components/ImageUploadField";
import { ColorField } from "../components/ColorField";
import { PaletteIcon } from "../components/icons";
import { useEditorStore } from "./editorStore";

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
