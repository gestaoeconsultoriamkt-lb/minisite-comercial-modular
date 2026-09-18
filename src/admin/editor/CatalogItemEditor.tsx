import { ImageUploadField } from "../components/ImageUploadField";
import { TextField } from "../components/TextField";
import { TextareaField } from "../components/TextareaField";
import { ChevronDownIcon, TrashIcon } from "../components/icons";
import type { MiniSiteCard } from "../../shared/schemas/miniSiteConfig";

interface CatalogItemEditorProps {
  minisiteId: string;
  item: MiniSiteCard;
  onChange: (patch: Partial<MiniSiteCard>) => void;
  onRemove: () => void;
}

/**
 * Preço, CTA e imagem são independentes e opcionais por item — combine
 * livremente (só foto+título; foto+título+preço; +CTA; qualquer combinação).
 */
export function CatalogItemEditor({ minisiteId, item, onChange, onRemove }: CatalogItemEditorProps) {
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-slate-100 p-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-semibold text-brand-navy-900">Item</p>
        <button type="button" onClick={onRemove} aria-label="Remover item" className="text-slate-400 hover:text-red-600">
          <TrashIcon className="h-4 w-4" />
        </button>
      </div>

      <ImageUploadField
        label="Imagem (opcional)"
        minisiteId={minisiteId}
        purpose="card"
        shape="wide"
        imageKey={item.imageKey}
        onChange={(key) => onChange({ imageKey: key })}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <TextField name={`item-${item.id}-title`} label="Título" value={item.title} onChange={(e) => onChange({ title: e.target.value })} required />
        <TextField
          name={`item-${item.id}-price`}
          label="Preço (opcional)"
          type="number"
          min="0"
          step="0.01"
          value={item.price ?? ""}
          onChange={(e) => onChange({ price: e.target.value === "" ? undefined : Number(e.target.value) })}
        />
      </div>

      <TextareaField
        name={`item-${item.id}-description`}
        label="Descrição (opcional)"
        rows={2}
        value={item.description ?? ""}
        onChange={(e) => onChange({ description: e.target.value })}
      />

      <div className="max-w-xs">
        <label htmlFor={`item-${item.id}-ctaType`} className="text-sm font-semibold text-brand-navy-900">
          CTA (opcional)
        </label>
        <div className="relative mt-1.5">
          <select
            id={`item-${item.id}-ctaType`}
            value={item.ctaType ?? ""}
            onChange={(e) => onChange({ ctaType: (e.target.value || undefined) as MiniSiteCard["ctaType"] })}
            className="w-full appearance-none rounded-xl border border-slate-200 bg-white py-2.5 pl-3 pr-9 text-sm text-slate-700 focus:border-brand-blue-500 focus:outline-none focus:ring-2 focus:ring-brand-blue-500/40"
          >
            <option value="">Sem CTA</option>
            <option value="whatsapp">WhatsApp</option>
            <option value="url">Link externo</option>
          </select>
          <ChevronDownIcon className="pointer-events-none absolute inset-y-0 right-3 my-auto h-4 w-4 text-slate-400" />
        </div>
      </div>

      {item.ctaType ? (
        <div className="flex flex-col gap-4 rounded-xl bg-slate-50 p-3">
          <TextField name={`item-${item.id}-ctaLabel`} label="Texto do botão" placeholder="Pedir" value={item.ctaLabel ?? ""} onChange={(e) => onChange({ ctaLabel: e.target.value })} />
          {item.ctaType === "url" ? (
            <TextField name={`item-${item.id}-ctaTarget`} label="URL de destino" placeholder="https://" value={item.ctaTarget ?? ""} onChange={(e) => onChange({ ctaTarget: e.target.value })} />
          ) : (
            <TextField
              name={`item-${item.id}-whatsappMessage`}
              label="Mensagem do WhatsApp"
              placeholder={`Olá! Gostaria de pedir ${item.title || "este item"}.`}
              value={item.whatsappMessage ?? ""}
              onChange={(e) => onChange({ whatsappMessage: e.target.value })}
            />
          )}
        </div>
      ) : null}
    </div>
  );
}
