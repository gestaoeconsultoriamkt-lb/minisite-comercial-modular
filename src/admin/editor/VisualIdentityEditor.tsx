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
          hint="Recomendado 1200x630"
        />
      </div>

      <ImageUploadField
        label="Imagem de fundo (opcional)"
        hint="Se não definir, a capa é usada automaticamente como fundo desfocado."
        minisiteId={minisiteId}
        purpose="background"
        shape="wide"
        imageKey={appearance.backgroundKey}
        onChange={(key) => updateAppearance({ backgroundKey: key })}
      />

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <ColorField label="Cor primária" value={appearance.colorPrimary ?? "#1d4ed8"} onChange={(hex) => updateAppearance({ colorPrimary: hex })} />
        <ColorField label="Cor secundária" value={appearance.colorSecondary ?? "#0f1d45"} onChange={(hex) => updateAppearance({ colorSecondary: hex })} />
        <ColorField
          label="Cor do texto dos botões"
          value={appearance.colorButtonText ?? "#ffffff"}
          onChange={(hex) => updateAppearance({ colorButtonText: hex })}
        />
      </div>
    </EditorSection>
  );
}
