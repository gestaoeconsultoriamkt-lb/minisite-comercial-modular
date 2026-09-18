import { EditorSection } from "../components/EditorSection";
import { TextField } from "../components/TextField";
import { MapPinIcon } from "../components/icons";
import { useEditorStore } from "./editorStore";

export function LocationEditor() {
  const location = useEditorStore((s) => s.config.location);
  const patchConfig = useEditorStore((s) => s.patchConfig);
  const value = location ?? {};

  function update(patch: Partial<typeof value>) {
    patchConfig({ location: { ...value, ...patch } });
  }

  return (
    <EditorSection icon={<MapPinIcon className="h-5 w-5" />} title="Como chegar" subtitle="Endereço e mapa.">
      <TextField name="address" label="Endereço completo" placeholder="R. das Flores, 123 - Centro" value={value.address ?? ""} onChange={(e) => update({ address: e.target.value })} />

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <TextField name="city" label="Cidade" value={value.city ?? ""} onChange={(e) => update({ city: e.target.value })} />
        <TextField name="state" label="Estado" placeholder="SP" value={value.state ?? ""} onChange={(e) => update({ state: e.target.value })} />
      </div>

      <TextField
        name="mapsUrl"
        label="Link do Google Maps"
        placeholder="https://maps.google.com/..."
        value={value.mapsUrl ?? ""}
        onChange={(e) => update({ mapsUrl: e.target.value })}
      />
      <p className="-mt-3 text-xs text-slate-400">Cole aqui o link correto do Google Maps.</p>

      <TextField
        name="mapEmbedUrl"
        label="URL de embed do mapa (opcional)"
        placeholder="https://www.google.com/maps/embed?..."
        value={value.mapEmbedUrl ?? ""}
        onChange={(e) => update({ mapEmbedUrl: e.target.value })}
      />
    </EditorSection>
  );
}
