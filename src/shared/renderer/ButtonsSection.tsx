import { useState, type MouseEvent, type ReactNode } from "react";
import type { MiniSiteConfig } from "../schemas/miniSiteConfig";
import { BUTTON_ICONS, CopyIcon, ExternalLinkIcon, PixIcon, WifiIcon } from "../icons";
import { EDITABLE_BUTTON_TYPES, getButtonHref, getButtonLabel, isButtonReady } from "../actionButtons";
import { getButtonColors, MiniSiteButtonLink, type MiniSiteButtonColors } from "./MiniSiteButton";

/**
 * Revelar Pix/Wi-Fi usa <details>/<summary> nativo — funciona sem JS tanto
 * no preview (React hidratado) quanto no HTML estático do SSR público. O
 * botão "copiar" é só um bônus quando há um React vivo (preview); no SSR
 * puro ele fica inerte (sem hidratação ainda) — degrada bem, não quebra.
 *
 * Mesma cor de fundo/texto dos demais botões, mas layout próprio: título
 * principal + subtítulo menor centralizados, mais alto que um botão comum
 * (duas linhas + o valor revelado), já que ele acumula duas ações
 * (ver/copiar) em vez de uma navegação simples.
 */
function CopyableReveal({
  icon,
  title,
  value,
  hint,
  colors,
}: {
  icon: ReactNode;
  title: string;
  value: string;
  hint?: string;
  colors: MiniSiteButtonColors;
}) {
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
    <details className="group overflow-hidden rounded-2xl shadow-sm" style={{ backgroundColor: colors.background, color: colors.text }}>
      <summary className="flex cursor-pointer list-none flex-col items-center gap-0.5 px-4 py-4 text-center">
        <span className="flex items-center gap-2 text-base font-bold">
          {icon}
          {title}
        </span>
        <span className="text-xs font-medium opacity-80 group-open:hidden">toque para ver</span>
        <span className="hidden text-xs font-medium opacity-80 group-open:block">toque para copiar</span>
      </summary>
      <div className="mx-4 mb-3 flex items-center justify-between gap-2 rounded-xl bg-black/10 px-3 py-2">
        <code className="truncate text-xs">{value}</code>
        <button type="button" onClick={handleCopy} aria-label="Copiar" className="shrink-0 opacity-90 transition hover:opacity-100" style={{ color: colors.text }}>
          <CopyIcon className="h-4 w-4" />
        </button>
      </div>
      {copied || hint ? <p className="mb-4 px-4 text-center text-xs opacity-80">{copied ? "Copiado!" : hint}</p> : null}
    </details>
  );
}

export function ButtonsSection({ config }: { config: MiniSiteConfig }) {
  const readyButtons = EDITABLE_BUTTON_TYPES.map((type) => config.buttons.find((b) => b.type === type)).filter(
    (button): button is NonNullable<typeof button> => Boolean(button && isButtonReady(button, config)),
  );

  if (readyButtons.length === 0) return null;
  const colors = getButtonColors(config);

  return (
    <div className="mt-6 flex w-full flex-col gap-2.5">
      {readyButtons.map((button) => {
        const Icon = BUTTON_ICONS[button.type] ?? ExternalLinkIcon;
        const label = getButtonLabel(button);

        if (button.type === "pix" && config.pix) {
          return (
            <CopyableReveal key={button.id} icon={<PixIcon className="h-5 w-5" />} title={label} value={config.pix.key} hint={config.pix.holderName} colors={colors} />
          );
        }
        if (button.type === "wifi" && config.wifi) {
          return (
            <CopyableReveal
              key={button.id}
              icon={<WifiIcon className="h-5 w-5" />}
              title={label}
              value={config.wifi.password ? `${config.wifi.ssid} / ${config.wifi.password}` : config.wifi.ssid}
              hint="Rede / senha"
              colors={colors}
            />
          );
        }

        const href = getButtonHref(button);
        if (!href) return null;

        return <MiniSiteButtonLink key={button.id} href={href} icon={<Icon className="h-4 w-4" />} label={label} colors={colors} />;
      })}
    </div>
  );
}
