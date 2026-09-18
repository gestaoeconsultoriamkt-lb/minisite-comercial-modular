import { useState } from "react";
import { EditorSection } from "../components/EditorSection";
import { TextField } from "../components/TextField";
import { Button } from "../components/Button";
import { ChevronDownIcon, ExternalLinkIcon, ZapIcon } from "../components/icons";
import {
  BUTTON_TYPE_LABELS,
  EDITABLE_BUTTON_TYPES,
  getButtonHref,
  isButtonEnabled,
} from "../../shared/actionButtons";
import type { MiniSiteButton, MiniSiteConfig } from "../../shared/schemas/miniSiteConfig";
import { useEditorStore } from "./editorStore";

type EditableButtonType = (typeof EDITABLE_BUTTON_TYPES)[number];

function ToggleSwitch({ checked, onChange }: { checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 shrink-0 rounded-full transition ${checked ? "bg-brand-blue-600" : "bg-slate-200"}`}
    >
      <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-[22px]" : "translate-x-0.5"}`} />
    </button>
  );
}

function ButtonRow({ type }: { type: EditableButtonType }) {
  const config = useEditorStore((s) => s.config);
  const patchConfig = useEditorStore((s) => s.patchConfig);
  const [expanded, setExpanded] = useState(false);

  const button = config.buttons.find((b) => b.type === type);
  const enabled = isButtonEnabled(button);

  function upsertButton(valuePatch: Record<string, unknown>) {
    const existing = config.buttons.find((b) => b.type === type);
    const newValue = { ...(existing?.value ?? {}), ...valuePatch };
    const buttons: MiniSiteButton[] = existing
      ? config.buttons.map((b) => (b.type === type ? { ...b, value: newValue } : b))
      : [
          ...config.buttons,
          {
            id: crypto.randomUUID(),
            type,
            label: BUTTON_TYPE_LABELS[type],
            value: newValue,
            position: EDITABLE_BUTTON_TYPES.indexOf(type),
          },
        ];
    patchConfig({ buttons });
  }

  function toggle(next: boolean) {
    upsertButton({ enabled: next });
    if (next) setExpanded(true);
  }

  function updatePixWifiOrConfig(patch: Partial<MiniSiteConfig>) {
    patchConfig(patch);
  }

  const value = button?.value ?? {};
  const canTestLink = type !== "pix" && type !== "wifi";
  const testHref = button ? getButtonHref(button) : null;

  return (
    <div className="rounded-xl border border-slate-100">
      <div className="flex items-center gap-3 px-4 py-3">
        <ToggleSwitch checked={enabled} onChange={toggle} />
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="flex flex-1 items-center justify-between gap-2 text-left"
        >
          <span className="text-sm font-semibold text-brand-navy-900">{BUTTON_TYPE_LABELS[type]}</span>
          <ChevronDownIcon className={`h-4 w-4 text-slate-400 transition-transform ${expanded ? "rotate-180" : ""}`} />
        </button>
      </div>

      {expanded ? (
        <div className="flex flex-col gap-4 border-t border-slate-100 px-4 py-4">
          <TextField
            name={`${type}-label`}
            label="Texto do botão"
            placeholder={BUTTON_TYPE_LABELS[type]}
            value={typeof value.label === "string" ? value.label : ""}
            onChange={(e) => upsertButton({ label: e.target.value })}
          />

          {type === "whatsapp" ? (
            <>
              <TextField
                name={`${type}-phone`}
                label="Número (com DDD)"
                placeholder="11999999999"
                value={typeof value.phone === "string" ? value.phone : ""}
                onChange={(e) => upsertButton({ phone: e.target.value })}
              />
              <TextField
                name={`${type}-message`}
                label="Mensagem inicial"
                placeholder="Olá! Vim pelo MiniSite e gostaria de informações."
                value={typeof value.message === "string" ? value.message : ""}
                onChange={(e) => upsertButton({ message: e.target.value })}
              />
            </>
          ) : null}

          {type === "telefone" ? (
            <TextField
              name={`${type}-phone`}
              label="Telefone"
              placeholder="11999999999"
              value={typeof value.phone === "string" ? value.phone : ""}
              onChange={(e) => upsertButton({ phone: e.target.value })}
            />
          ) : null}

          {type === "agendar" || type === "avaliar_google" || type === "site" || type === "link_personalizado" ? (
            <TextField
              name={`${type}-url`}
              label={type === "avaliar_google" ? "Link direto da avaliação" : "Destino (URL)"}
              placeholder="https://"
              value={typeof value.url === "string" ? value.url : ""}
              onChange={(e) => upsertButton({ url: e.target.value })}
            />
          ) : null}

          {type === "pix" ? (
            <PixFields config={config} onChange={updatePixWifiOrConfig} />
          ) : null}

          {type === "wifi" ? (
            <WifiFields config={config} onChange={updatePixWifiOrConfig} />
          ) : null}

          {canTestLink ? (
            <Button
              type="button"
              variant="secondary"
              fullWidth={false}
              icon={<ExternalLinkIcon className="h-4 w-4" />}
              disabled={!testHref}
              onClick={() => testHref && window.open(testHref, "_blank", "noopener,noreferrer")}
            >
              Testar link
            </Button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function PixFields({ config, onChange }: { config: MiniSiteConfig; onChange: (patch: Partial<MiniSiteConfig>) => void }) {
  const pix = config.pix ?? { keyType: "aleatoria" as const, key: "", holderName: "" };
  return (
    <div className="flex flex-col gap-4 rounded-xl bg-slate-50 p-3">
      <div className="max-w-xs">
        <label className="text-sm font-semibold text-brand-navy-900">Tipo da chave</label>
        <select
          value={pix.keyType}
          onChange={(e) => onChange({ pix: { ...pix, keyType: e.target.value as typeof pix.keyType } })}
          className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white py-2.5 px-3 text-sm text-slate-700 focus:border-brand-blue-500 focus:outline-none focus:ring-2 focus:ring-brand-blue-500/40"
        >
          <option value="cpf">CPF</option>
          <option value="cnpj">CNPJ</option>
          <option value="email">E-mail</option>
          <option value="telefone">Telefone</option>
          <option value="aleatoria">Chave aleatória</option>
        </select>
      </div>
      <TextField name="pixKey" label="Chave Pix" value={pix.key} onChange={(e) => onChange({ pix: { ...pix, key: e.target.value } })} />
      <TextField name="pixHolderName" label="Nome do recebedor" value={pix.holderName} onChange={(e) => onChange({ pix: { ...pix, holderName: e.target.value } })} />
    </div>
  );
}

function WifiFields({ config, onChange }: { config: MiniSiteConfig; onChange: (patch: Partial<MiniSiteConfig>) => void }) {
  const wifi = config.wifi ?? { ssid: "", password: "" };
  return (
    <div className="flex flex-col gap-4 rounded-xl bg-slate-50 p-3">
      <TextField name="wifiSsid" label="Nome da rede (SSID)" value={wifi.ssid} onChange={(e) => onChange({ wifi: { ...wifi, ssid: e.target.value } })} />
      <TextField name="wifiPassword" label="Senha" value={wifi.password ?? ""} onChange={(e) => onChange({ wifi: { ...wifi, password: e.target.value } })} />
    </div>
  );
}

export function ActionButtonsEditor() {
  return (
    <EditorSection icon={<ZapIcon className="h-5 w-5" />} title="Botões de ação" subtitle="Escolha quais botões exibir no seu MiniSite. Você pode ativar ou desativar a qualquer momento.">
      <div className="flex flex-col gap-2">
        {EDITABLE_BUTTON_TYPES.map((type) => (
          <ButtonRow key={type} type={type} />
        ))}
      </div>
    </EditorSection>
  );
}
