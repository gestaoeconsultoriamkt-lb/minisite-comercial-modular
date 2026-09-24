import { useState } from "react";
import { EditorSection } from "../components/EditorSection";
import { TextField } from "../components/TextField";
import { ColorField } from "../components/ColorField";
import { Button } from "../components/Button";
import { ToggleSwitch } from "../components/ToggleSwitch";
import { AlertCircleIcon, ChevronDownIcon, ExternalLinkIcon, ZapIcon } from "../components/icons";
import { BUTTON_ICONS, SOCIAL_ICONS } from "../../shared/icons";
import {
  BUTTON_TYPE_LABELS,
  EDITABLE_BUTTON_TYPES,
  getButtonHref,
  isButtonEnabled,
  isButtonReady,
} from "../../shared/actionButtons";
import { getButtonColors } from "../../shared/renderer/MiniSiteButton";
import type { MiniSiteButton, MiniSiteConfig, MiniSitePix, MiniSiteSocialLinks, MiniSiteWifi } from "../../shared/schemas/miniSiteConfig";
import { useEditorStore } from "./editorStore";

type EditableButtonType = (typeof EDITABLE_BUTTON_TYPES)[number];

function ButtonRow({ type }: { type: EditableButtonType }) {
  const config = useEditorStore((s) => s.config);
  const patchConfig = useEditorStore((s) => s.patchConfig);
  const [expanded, setExpanded] = useState(false);

  const button = config.buttons.find((b) => b.type === type);
  const enabled = isButtonEnabled(button);
  const ready = button ? isButtonReady(button, config) : false;
  const label = BUTTON_TYPE_LABELS[type];
  const Icon = BUTTON_ICONS[type] ?? ZapIcon;

  function upsertButton(valuePatch: Record<string, unknown>) {
    patchConfig((freshConfig) => {
      const existing = freshConfig.buttons.find((b) => b.type === type);
      const newValue = { ...(existing?.value ?? {}), ...valuePatch };
      const buttons: MiniSiteButton[] = existing
        ? freshConfig.buttons.map((b) => (b.type === type ? { ...b, value: newValue } : b))
        : [
            ...freshConfig.buttons,
            {
              id: crypto.randomUUID(),
              type,
              label: BUTTON_TYPE_LABELS[type],
              value: newValue,
              position: EDITABLE_BUTTON_TYPES.indexOf(type),
            },
          ];
      return { buttons };
    });
  }

  function toggle(next: boolean) {
    upsertButton({ enabled: next });
    if (next) setExpanded(true);
  }

  const DEFAULT_PIX: MiniSitePix = { keyType: "aleatoria", key: "", holderName: "" };
  const DEFAULT_WIFI: MiniSiteWifi = { ssid: "", password: "" };

  function updatePix(patch: Partial<MiniSitePix>) {
    patchConfig((freshConfig) => ({ pix: { ...(freshConfig.pix ?? DEFAULT_PIX), ...patch } }));
  }

  function updateWifi(patch: Partial<MiniSiteWifi>) {
    patchConfig((freshConfig) => ({ wifi: { ...(freshConfig.wifi ?? DEFAULT_WIFI), ...patch } }));
  }

  const value = button?.value ?? {};
  const canTestLink = type !== "pix" && type !== "wifi";
  const testHref = button ? getButtonHref(button) : null;

  const statusText = !enabled ? "Desativado" : ready ? "Ativo no site" : "Ativo — preencha os campos abaixo";
  const statusClassName = !enabled ? "text-slate-400" : ready ? "text-emerald-600" : "text-amber-600";

  // Cor efetiva (individual se houver, senão a global) — usada só para
  // pré-visualizar no swatch; a sobrescrita em si é opcional por botão.
  const effectiveColors = getButtonColors(config, button);
  const hasIndividualBackground = typeof value.colorBackground === "string";
  const hasIndividualText = typeof value.colorText === "string";

  return (
    <div
      className={`overflow-hidden rounded-xl border shadow-sm transition-colors ${
        enabled ? "border-brand-blue-200 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_6px_16px_-8px_rgba(29,78,216,0.18)]" : "border-slate-200"
      }`}
    >
      <div className={`flex items-center gap-3 px-4 py-3.5 ${enabled ? "bg-brand-blue-50/50" : "bg-slate-50/70"}`}>
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
            enabled ? "bg-brand-blue-100 text-brand-blue-600" : "bg-slate-200/70 text-slate-400"
          }`}
        >
          <Icon className="h-4.5 w-4.5" />
        </div>

        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="flex min-w-0 flex-1 items-center justify-between gap-2 rounded-lg p-1 text-left transition hover:bg-white/70"
        >
          <span className="min-w-0">
            <span className={`block truncate text-sm font-bold ${enabled ? "text-brand-navy-900" : "text-slate-500"}`}>{label}</span>
            <span className={`mt-0.5 flex items-center gap-1 text-xs font-medium ${statusClassName}`}>
              {enabled && !ready ? <AlertCircleIcon className="h-3.5 w-3.5 shrink-0" /> : null}
              {statusText}
            </span>
          </span>
          <ChevronDownIcon className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${expanded ? "rotate-180" : ""}`} />
        </button>

        <ToggleSwitch checked={enabled} onChange={toggle} label={label} />
      </div>

      {expanded ? (
        <div className="flex flex-col gap-4 border-t border-slate-100 bg-slate-50/60 px-4 py-4">
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
                placeholder="Olá! Vim pelo site e gostaria de informações."
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
            <div className="flex flex-col gap-1.5">
              <TextField
                name={`${type}-url`}
                label={type === "avaliar_google" ? "Link direto da avaliação" : "Destino (URL)"}
                placeholder="https://"
                value={typeof value.url === "string" ? value.url : ""}
                onChange={(e) => upsertButton({ url: e.target.value })}
              />
              <p className="text-xs text-slate-400">Pode digitar sem "https://" — adicionamos automaticamente.</p>
            </div>
          ) : null}

          {type === "pix" ? (
            <PixFields config={config} onChange={updatePix} />
          ) : null}

          {type === "wifi" ? (
            <WifiFields config={config} onChange={updateWifi} />
          ) : null}

          <div className="grid grid-cols-1 gap-4 border-t border-slate-100 pt-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1">
              <ColorField
                label="Cor de fundo individual (opcional)"
                value={effectiveColors.background}
                onChange={(hex) => upsertButton({ colorBackground: hex })}
              />
              {hasIndividualBackground ? (
                <button
                  type="button"
                  onClick={() => upsertButton({ colorBackground: undefined })}
                  className="self-start text-xs font-medium text-brand-blue-600 hover:underline"
                >
                  Usar cor global
                </button>
              ) : null}
            </div>
            <div className="flex flex-col gap-1">
              <ColorField
                label="Cor do texto individual (opcional)"
                value={effectiveColors.text}
                onChange={(hex) => upsertButton({ colorText: hex })}
              />
              {hasIndividualText ? (
                <button
                  type="button"
                  onClick={() => upsertButton({ colorText: undefined })}
                  className="self-start text-xs font-medium text-brand-blue-600 hover:underline"
                >
                  Usar cor global
                </button>
              ) : null}
            </div>
          </div>

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

function PixFields({ config, onChange }: { config: MiniSiteConfig; onChange: (patch: Partial<MiniSitePix>) => void }) {
  const pix = config.pix ?? { keyType: "aleatoria" as const, key: "", holderName: "" };
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-slate-50/60 p-3.5">
      <div className="max-w-xs">
        <label className="text-sm font-semibold text-brand-navy-900">Tipo da chave</label>
        <select
          value={pix.keyType}
          onChange={(e) => onChange({ keyType: e.target.value as typeof pix.keyType })}
          className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white py-2.5 px-3 text-sm text-slate-700 shadow-[inset_0_1px_2px_rgba(15,23,42,0.03)] transition hover:border-slate-300 focus:border-brand-blue-500 focus:outline-none focus:ring-[3px] focus:ring-brand-blue-500/15"
        >
          <option value="cpf">CPF</option>
          <option value="cnpj">CNPJ</option>
          <option value="email">E-mail</option>
          <option value="telefone">Telefone</option>
          <option value="aleatoria">Chave aleatória</option>
        </select>
      </div>
      <TextField name="pixKey" label="Chave Pix" value={pix.key} onChange={(e) => onChange({ key: e.target.value })} />
      <TextField name="pixHolderName" label="Nome do recebedor" value={pix.holderName} onChange={(e) => onChange({ holderName: e.target.value })} />
    </div>
  );
}

function WifiFields({ config, onChange }: { config: MiniSiteConfig; onChange: (patch: Partial<MiniSiteWifi>) => void }) {
  const wifi = config.wifi ?? { ssid: "", password: "" };
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-slate-50/60 p-3.5">
      <TextField name="wifiSsid" label="Nome da rede (SSID)" value={wifi.ssid} onChange={(e) => onChange({ ssid: e.target.value })} />
      <TextField name="wifiPassword" label="Senha" value={wifi.password ?? ""} onChange={(e) => onChange({ password: e.target.value })} />
    </div>
  );
}

const SOCIAL_FIELDS: { key: keyof MiniSiteSocialLinks; label: string; placeholder: string }[] = [
  { key: "instagram", label: "Instagram", placeholder: "https://instagram.com/seunegocio" },
  { key: "facebook", label: "Facebook", placeholder: "https://facebook.com/seunegocio" },
  { key: "tiktok", label: "Tiktok", placeholder: "https://tiktok.com/@seunegocio" },
  { key: "youtube", label: "YouTube", placeholder: "https://youtube.com/@seunegocio" },
  { key: "linkedin", label: "Linkedin", placeholder: "https://linkedin.com/company/seunegocio" },
  { key: "kwai", label: "Kwai", placeholder: "https://kwai.com/@seunegocio" },
];

/**
 * Módulo único de "Botões": ações (WhatsApp, Pix, Agendar...) e redes
 * sociais (Instagram, Facebook...) no mesmo bloco — antes eram dois
 * módulos/editores separados. Ambos usam o mesmo componente visual base
 * no MiniSite público (ver ButtonsSection/MiniSiteButtonLink); aqui só
 * unificamos onde são configurados.
 */
export function ButtonsEditor() {
  const socialLinks = useEditorStore((s) => s.config.socialLinks);
  const patchConfig = useEditorStore((s) => s.patchConfig);

  function updateSocial(key: keyof MiniSiteSocialLinks, value: string) {
    patchConfig((config) => ({ socialLinks: { ...config.socialLinks, [key]: value || undefined } }));
  }

  return (
    <EditorSection
      icon={<ZapIcon className="h-5 w-5" />}
      title="Botões"
      subtitle="Ações e redes sociais em um único bloco. Ative ou preencha os que quiser exibir no seu site."
    >
      <div className="flex flex-col gap-3">
        {EDITABLE_BUTTON_TYPES.map((type) => (
          <ButtonRow key={type} type={type} />
        ))}
      </div>

      <div className="flex flex-col gap-4 border-t border-slate-100 pt-6">
        <div>
          <p className="text-sm font-bold text-brand-navy-900">Redes sociais</p>
          <p className="mt-0.5 text-xs text-slate-400">Cole o link completo ou digite só o @perfil — aparecem como botões aqui e como ícones no rodapé.</p>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {SOCIAL_FIELDS.map(({ key, label, placeholder }) => {
            const Icon = SOCIAL_ICONS[key];
            return (
              <TextField
                key={key}
                name={key}
                label={label}
                placeholder={placeholder}
                icon={<Icon className="h-4 w-4" />}
                value={socialLinks[key] ?? ""}
                onChange={(e) => updateSocial(key, e.target.value)}
              />
            );
          })}
        </div>
      </div>
    </EditorSection>
  );
}
