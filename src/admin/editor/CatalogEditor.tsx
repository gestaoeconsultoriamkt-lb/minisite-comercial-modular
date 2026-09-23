import { EditorSection } from "../components/EditorSection";
import { Button } from "../components/Button";
import { LayoutGridIcon, PlusIcon } from "../components/icons";
import { CatalogSectionEditor } from "./CatalogSectionEditor";
import type { MiniSiteSection } from "../../shared/schemas/miniSiteConfig";
import { useEditorStore } from "./editorStore";

export function CatalogEditor() {
  const minisiteId = useEditorStore((s) => s.minisiteId);
  const sections = useEditorStore((s) => s.config.sections);
  const patchConfig = useEditorStore((s) => s.patchConfig);

  const sorted = [...sections].sort((a, b) => a.position - b.position);

  function addSection() {
    patchConfig((config) => {
      const newSection: MiniSiteSection = {
        id: crypto.randomUUID(),
        title: "Nova seção",
        imageKeys: [],
        images: [],
        showPrices: true,
        showCta: true,
        position: config.sections.length,
        cards: [],
      };
      return { sections: [...config.sections, newSection] };
    });
  }

  /**
   * `patch` pode ser um objeto OU uma função `(section) => patch` — a
   * função recebe a seção FRESCA lida de dentro do `patchConfig`, mesmo
   * motivo do `patchConfig` funcional em editorStore.ts: `SectionImagesField`
   * escreve `images` a partir da lista atual, e duas escritas em sequência
   * rápida (dois uploads, ou upload + edição de rótulo) não podem se basear
   * numa cópia da seção capturada no props/render.
   */
  function updateSection(id: string, patch: Partial<MiniSiteSection> | ((section: MiniSiteSection) => Partial<MiniSiteSection>)) {
    patchConfig((config) => ({
      sections: config.sections.map((s) => (s.id === id ? { ...s, ...(typeof patch === "function" ? patch(s) : patch) } : s)),
    }));
  }

  function removeSection(id: string) {
    patchConfig((config) => ({ sections: config.sections.filter((s) => s.id !== id).map((s, i) => ({ ...s, position: i })) }));
  }

  return (
    <EditorSection
      icon={<LayoutGridIcon className="h-5 w-5" />}
      title="Catálogo / Seções"
      subtitle="Produtos, cardápio e serviços. Adicione quantas seções precisar."
      action={
        <Button type="button" variant="secondary" fullWidth={false} icon={<PlusIcon className="h-4 w-4" />} onClick={addSection}>
          Adicionar seção
        </Button>
      }
    >
      {sorted.length === 0 ? (
        <p className="text-sm text-slate-400">Nenhuma seção criada ainda. O catálogo não aparece no MiniSite até ter ao menos uma seção com imagens.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {sorted.map((section) => (
            <CatalogSectionEditor
              key={section.id}
              minisiteId={minisiteId}
              section={section}
              onChange={(patch) => updateSection(section.id, patch)}
              onRemove={() => removeSection(section.id)}
            />
          ))}
        </div>
      )}
    </EditorSection>
  );
}
