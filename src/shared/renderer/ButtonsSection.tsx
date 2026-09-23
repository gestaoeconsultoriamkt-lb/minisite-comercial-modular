import { useState, type MouseEvent, type ReactNode } from "react";
import type { MiniSiteConfig } from "../schemas/miniSiteConfig";
import { BUTTON_ICONS, CopyIcon, ExternalLinkIcon, PixIcon, SOCIAL_ICONS, WifiIcon } from "../icons";
import { EDITABLE_BUTTON_TYPES, getButtonHref, getButtonLabel, isButtonReady } from "../actionButtons";
import { SOCIAL_PLATFORM_LABELS, getFilledSocialEntries } from "../socialLinks";
import { getButtonColors, miniSiteButtonClassName, MiniSiteButtonLink, type MiniSiteButtonColors } from "./MiniSiteButton";

/**
 * Pix/Wi-Fi usam <details>/<summary> nativo para revelar/copiar — funciona
 * sem JS tanto no preview (React hidratado) quanto no HTML estático do SSR
 * público. O <summary> É o botão: mesma classe/profundidade (ver
 * miniSiteButtonClassName) dos demais — sem subtítulo, sem parecer um
 * componente diferente na lista. O valor revelado aparece como um painel
 * neutro separado abaixo, só quando aberto — não afeta a altura/aparência
 * do botão fechado.
 */
function CopyableReveal({
  icon,
  label,
  value,
  hint,
  colors,
}: {
  icon: ReactNode;
  label: string;
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
    <details className="group">
      <summary className={miniSiteButtonClassName("cursor-pointer list-none")} style={{ backgroundColor: colors.background, color: colors.text }}>
        <span className="flex h-5 w-5 shrink-0 items-center justify-center">{icon}</span>
        <span className="truncate">{label}</span>
      </summary>
      <div className="mt-2 flex items-center justify-between gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
        <code className="truncate text-xs text-slate-700">{value}</code>
        <button type="button" onClick={handleCopy} aria-label="Copiar" className="shrink-0 text-slate-500 transition hover:text-slate-900">
          <CopyIcon className="h-4 w-4" />
        </button>
      </div>
      {copied || hint ? <p className="mt-1 px-1 text-xs font-medium text-slate-400">{copied ? "Copiado!" : hint}</p> : null}
    </details>
  );
}

/**
 * Módulo único de botões: ações (WhatsApp, Pix, Agendar...) e redes
 * sociais (Instagram, Facebook...) no mesmo bloco visual, mesmo
 * componente base — antes eram dois blocos separados no corpo da
 * página. Os ícones do rodapé (Rodapé Social) continuam independentes.
 */
export function ButtonsSection({ config }: { config: MiniSiteConfig }) {
  const readyButtons = EDITABLE_BUTTON_TYPES.map((type) => config.buttons.find((b) => b.type === type)).filter(
    (button): button is NonNullable<typeof button> => Boolean(button && isButtonReady(button, config)),
  );
  const socialEntries = getFilledSocialEntries(config.socialLinks);

  if (readyButtons.length === 0 && socialEntries.length === 0) return null;

  const socialColors = getButtonColors(config);

  return (
    <div className="mt-6 flex w-full flex-col gap-2.5">
      {readyButtons.map((button) => {
        const Icon = BUTTON_ICONS[button.type] ?? ExternalLinkIcon;
        const label = getButtonLabel(button);
        const colors = getButtonColors(config, button);

        if (button.type === "pix" && config.pix) {
          return <CopyableReveal key={button.id} icon={<PixIcon className="h-5 w-5" />} label={label} value={config.pix.key} hint={config.pix.holderName} colors={colors} />;
        }
        if (button.type === "wifi" && config.wifi) {
          return (
            <CopyableReveal
              key={button.id}
              icon={<WifiIcon className="h-5 w-5" />}
              label={label}
              value={config.wifi.password ? `${config.wifi.ssid} / ${config.wifi.password}` : config.wifi.ssid}
              hint="Rede / senha"
              colors={colors}
            />
          );
        }

        const href = getButtonHref(button);
        if (!href) return null;

        return <MiniSiteButtonLink key={button.id} href={href} icon={<Icon className="h-4.5 w-4.5" />} label={label} colors={colors} />;
      })}
      {socialEntries.map(({ platform, href }) => {
        const Icon = SOCIAL_ICONS[platform];
        return (
          <MiniSiteButtonLink key={platform} href={href} icon={<Icon className="h-4.5 w-4.5" />} label={SOCIAL_PLATFORM_LABELS[platform]} colors={socialColors} />
        );
      })}
    </div>
  );
}
