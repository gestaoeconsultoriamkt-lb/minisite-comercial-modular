import { useState } from "react";
import { ImageUploadField } from "../components/ImageUploadField";
import { Button } from "../components/Button";
import { ChevronDownIcon, PlusIcon, TrashIcon } from "../components/icons";
import { CatalogItemEditor } from "./CatalogItemEditor";
import type { MiniSiteCard, MiniSiteSection } from "../../shared/schemas/miniSiteConfig";

function ToggleSwitch({ checked, onChange }: { checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative h-5 w-9 shrink-0 rounded-full transition ${checked ? "bg-brand-blue-600" : "bg-slate-200"}`}
    >
      <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-[18px]" : "translate-x-0.5"}`} />
    </button>
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

  function updateItem(id: string, patch: Partial<MiniSiteCard>) {
    onChange({ cards: section.cards.map((c) => (c.id === id ? { ...c, ...patch } : c)) });
  }

  function removeItem(id: string) {
    onChange({ cards: section.cards.filter((c) => c.id !== id).map((c, i) => ({ ...c, position: i })) });
  }

  function addItem() {
    const newItem: MiniSiteCard = { id: crypto.randomUUID(), title: "Novo item", position: section.cards.length };
    onChange({ cards: [...section.cards, newItem] });
  }

  return (
    <div className="rounded-2xl border border-slate-100">
      <div className="flex flex-wrap items-center gap-3 px-4 py-3">
        <button type="button" onClick={() => setExpanded((v) => !v)} aria-label={expanded ? "Recolher seção" : "Expandir seção"}>
          <ChevronDownIcon className={`h-4 w-4 text-slate-400 transition-transform ${expanded ? "rotate-180" : ""}`} />
        </button>
        <input
          type="text"
          aria-label="Título da seção"
          value={section.title}
          onChange={(e) => onChange({ title: e.target.value })}
          placeholder="Título da seção"
          className="min-w-[160px] flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-brand-navy-900 focus:border-brand-blue-500 focus:outline-none focus:ring-2 focus:ring-brand-blue-500/40"
        />
        <label className="flex items-center gap-2 text-xs font-medium text-slate-500">
          <ToggleSwitch checked={section.showPrices} onChange={(v) => onChange({ showPrices: v })} />
          Exibir preço (opcional)
        </label>
        <label className="flex items-center gap-2 text-xs font-medium text-slate-500">
          <ToggleSwitch checked={section.showCta} onChange={(v) => onChange({ showCta: v })} />
          Exibir botão (opcional)
        </label>
        <button type="button" onClick={onRemove} aria-label="Remover seção" className="text-slate-400 hover:text-red-600">
          <TrashIcon className="h-4 w-4" />
        </button>
      </div>

      {expanded ? (
        <div className="flex flex-col gap-3 border-t border-slate-100 p-4">
          <ImageUploadField
            label="Imagem da seção (opcional)"
            minisiteId={minisiteId}
            purpose="section"
            shape="wide"
            imageKey={section.imageKey}
            onChange={(key) => onChange({ imageKey: key })}
          />

          {[...section.cards]
            .sort((a, b) => a.position - b.position)
            .map((item) => (
              <CatalogItemEditor
                key={item.id}
                minisiteId={minisiteId}
                item={item}
                onChange={(patch) => updateItem(item.id, patch)}
                onRemove={() => removeItem(item.id)}
              />
            ))}

          <Button type="button" variant="secondary" fullWidth={false} icon={<PlusIcon className="h-4 w-4" />} onClick={addItem}>
            Adicionar item
          </Button>
        </div>
      ) : null}
    </div>
  );
}
