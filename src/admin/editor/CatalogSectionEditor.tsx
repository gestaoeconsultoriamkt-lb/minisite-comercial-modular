import { useState } from "react";
import { ImageUploadField } from "../components/ImageUploadField";
import { Button } from "../components/Button";
import { ChevronDownIcon, PlusIcon, TrashIcon } from "../components/icons";
import { CatalogItemEditor } from "./CatalogItemEditor";
import { isCatalogSectionReady } from "../../shared/catalog";
import type { MiniSiteCard, MiniSiteSection } from "../../shared/schemas/miniSiteConfig";

/**
 * Trilha em escala padrão do Tailwind (mesmo padrão já aplicado aos
 * toggles dos Botões de ação): 44px de trilha, bolinha de 20px com 2px de
 * margem nos dois estados (`translate-x-0` / `translate-x-5`) — nunca
 * sobrepõe o texto ao lado.
 */
function ToggleSwitch({ checked, onChange, label }: { checked: boolean; onChange: (checked: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={`${checked ? "Desativar" : "Ativar"} ${label}`}
      onClick={() => onChange(!checked)}
      className={`inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-brand-blue-500/40 focus:ring-offset-1 ${
        checked ? "bg-brand-blue-600" : "bg-slate-200"
      }`}
    >
      <span aria-hidden className={`ml-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${checked ? "translate-x-5" : "translate-x-0"}`} />
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

  const totalCount = section.cards.length;
  const readyCount = section.cards.filter((c) => c.title.trim()).length;
  const sectionReady = isCatalogSectionReady(section);

  return (
    // Card com borda/sombra próprias — visualmente claro onde a seção
    // começa e termina, mesmo padrão do restante do editor.
    <div className="overflow-hidden rounded-2xl border border-slate-200 shadow-sm">
      <div className="flex flex-col gap-3 bg-slate-50 px-4 py-3.5">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            aria-label={expanded ? "Recolher seção" : "Expandir seção"}
            className="shrink-0 text-slate-400 transition hover:text-slate-600"
          >
            <ChevronDownIcon className={`h-4.5 w-4.5 transition-transform ${expanded ? "rotate-180" : ""}`} />
          </button>
          <input
            type="text"
            aria-label="Título da seção"
            value={section.title}
            onChange={(e) => onChange({ title: e.target.value })}
            placeholder="Título da seção"
            className="min-w-[160px] flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-brand-navy-900 focus:border-brand-blue-500 focus:outline-none focus:ring-2 focus:ring-brand-blue-500/40"
          />
          <button
            type="button"
            onClick={onRemove}
            aria-label="Remover seção"
            className="shrink-0 rounded-lg p-1.5 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>

        {/* Controles gerais da seção, numa linha própria — nunca disputando espaço com título/excluir. */}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pl-7">
          <label className="flex items-center gap-2.5 text-sm font-medium text-slate-600">
            <ToggleSwitch checked={section.showPrices} onChange={(v) => onChange({ showPrices: v })} label="Exibir preço" />
            Exibir preço (opcional)
          </label>
          <label className="flex items-center gap-2.5 text-sm font-medium text-slate-600">
            <ToggleSwitch checked={section.showCta} onChange={(v) => onChange({ showCta: v })} label="Exibir botão" />
            Exibir botão (opcional)
          </label>
          <span className={`text-xs font-semibold sm:ml-auto ${sectionReady ? "text-emerald-600" : "text-slate-400"}`}>
            {!sectionReady
              ? "Adicione uma imagem da seção ou um item com título"
              : readyCount > 0
                ? `${readyCount} de ${totalCount} ${totalCount === 1 ? "item visível" : "itens visíveis"} no MiniSite`
                : "Seção visível — ainda sem itens"}
          </span>
        </div>
      </div>

      {expanded ? (
        <div className="flex flex-col gap-4 border-t border-slate-100 p-4">
          <ImageUploadField
            label="Imagem da seção (opcional)"
            minisiteId={minisiteId}
            purpose="section"
            shape="wide"
            imageKey={section.imageKey}
            onChange={(key) => onChange({ imageKey: key })}
          />

          <div className="flex flex-col gap-3">
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
          </div>

          <Button type="button" variant="secondary" fullWidth={false} icon={<PlusIcon className="h-4 w-4" />} onClick={addItem}>
            Adicionar item
          </Button>
        </div>
      ) : null}
    </div>
  );
}
