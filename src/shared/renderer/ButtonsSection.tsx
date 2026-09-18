import { useState, type MouseEvent, type ReactNode } from "react";
import type { MiniSiteConfig } from "../schemas/miniSiteConfig";
import { BUTTON_ICONS, CopyIcon, ExternalLinkIcon, PixIcon, WifiIcon } from "../icons";
import { EDITABLE_BUTTON_TYPES, getButtonHref, getButtonLabel, isButtonReady } from "../actionButtons";

/**
 * Revelar Pix/Wi-Fi usa <details>/<summary> nativo — funciona sem JS tanto
 * no preview (React hidratado) quanto no HTML estático do SSR público. O
 * botão "copiar" é só um bônus quando há um React vivo (preview); no SSR
 * puro ele fica inerte (sem hidratação ainda) — degrada bem, não quebra.
 */
function CopyableReveal({ icon, label, value, hint }: { icon: ReactNode; label: string; value: string; hint?: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy(event: MouseEvent) {
    event.preventDefault();
    try {
      // Cast local e contido: este arquivo também é type-checked sob o
      // tsconfig do Worker (sem lib DOM), que não conhece `Navigator`.
      const nav = (globalThis as { navigator?: { clipboard?: { writeText(text: string): Promise<void> } } }).navigator;
      if (!nav?.clipboard) return;
      await nav.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ambiente sem clipboard (ex.: SSR estático sem hidratação) — sem efeito, sem crash.
    }
  }

  return (
    <details className="group rounded-2xl bg-white/95 p-4 text-slate-900">
      <summary className="flex cursor-pointer list-none items-center gap-2 text-sm font-semibold">
        {icon}
        {label}
        <span className="ml-auto text-xs text-slate-400 group-open:hidden">toque para ver</span>
      </summary>
      <div className="mt-3 flex items-center justify-between gap-2 rounded-xl bg-slate-50 px-3 py-2">
        <code className="truncate text-xs">{value}</code>
        <button type="button" onClick={handleCopy} className="shrink-0 text-slate-500 hover:text-slate-900">
          <CopyIcon className="h-4 w-4" />
        </button>
      </div>
      {copied ? <p className="mt-1 text-xs font-medium text-emerald-600">Copiado!</p> : hint ? <p className="mt-1 text-xs text-slate-400">{hint}</p> : null}
    </details>
  );
}

export function ButtonsSection({ config }: { config: MiniSiteConfig }) {
  const { appearance } = config;
  const readyButtons = EDITABLE_BUTTON_TYPES.map((type) => config.buttons.find((b) => b.type === type)).filter(
    (button): button is NonNullable<typeof button> => Boolean(button && isButtonReady(button, config)),
  );

  if (readyButtons.length === 0) return null;

  return (
    <div className="mt-6 flex w-full flex-col gap-2.5">
      {readyButtons.map((button) => {
        const Icon = BUTTON_ICONS[button.type] ?? ExternalLinkIcon;
        const label = getButtonLabel(button);

        if (button.type === "pix" && config.pix) {
          return (
            <CopyableReveal key={button.id} icon={<PixIcon className="h-4 w-4" />} label={label} value={config.pix.key} hint={config.pix.holderName} />
          );
        }
        if (button.type === "wifi" && config.wifi) {
          return (
            <CopyableReveal
              key={button.id}
              icon={<WifiIcon className="h-4 w-4" />}
              label={label}
              value={config.wifi.password ? `${config.wifi.ssid} / ${config.wifi.password}` : config.wifi.ssid}
              hint="Rede / senha"
            />
          );
        }

        const href = getButtonHref(button);
        if (!href) return null;
        const isWhatsapp = button.type === "whatsapp";
        const isPrimary = button.type === "agendar";

        return (
          <a
            key={button.id}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold shadow-sm transition ${
              isWhatsapp ? "bg-[#25D366] text-white" : isPrimary ? "text-white" : "bg-white/95 text-slate-900"
            }`}
            style={isPrimary ? { backgroundColor: appearance.colorPrimary || "#1d4ed8", color: appearance.colorButtonText || "#fff" } : undefined}
          >
            <Icon className="h-4 w-4" />
            {label}
          </a>
        );
      })}
    </div>
  );
}
