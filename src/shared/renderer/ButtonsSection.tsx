import { useState, type MouseEvent, type ReactNode } from "react";
import type { MiniSiteConfig } from "../schemas/miniSiteConfig";
import { BUTTON_ICONS, CopyIcon, ExternalLinkIcon, PixIcon, SOCIAL_ICONS, WifiIcon } from "../icons";
import { EDITABLE_BUTTON_TYPES, getButtonHref, getButtonLabel, isButtonReady } from "../actionButtons";
import { SOCIAL_PLATFORM_LABELS, getFilledSocialEntries } from "../socialLinks";
import {
  getButtonColors,
  miniSiteButtonClassName,
  resolveButtonSurface,
  MiniSiteButtonLink,
  MiniSiteButtonSurface,
  MiniSiteButtonGlassSheen,
  MiniSiteButtonContent,
  type MiniSiteButtonColors,
  type MiniSiteButtonTier,
} from "./MiniSiteButton";
import type { MiniSiteButtonStyle } from "../schemas/miniSiteConfig";

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
  style,
  tier,
  insidePanel,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  hint?: string;
  colors: MiniSiteButtonColors;
  style: MiniSiteButtonStyle;
  tier: MiniSiteButtonTier;
  insidePanel: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const surface = resolveButtonSurface(style, tier, colors, insidePanel);

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
      <summary
        className={miniSiteButtonClassName(style, tier, insidePanel, "cursor-pointer list-none")}
        style={{ backgroundColor: surface.backgroundColor, color: surface.color }}
      >
        <MiniSiteButtonSurface style={style} />
        {!insidePanel ? <MiniSiteButtonGlassSheen style={style} /> : null}
        <MiniSiteButtonContent icon={icon} label={label} />
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
 * `insidePanel` (renderizado dentro do HeroGlassPanel, hero "vitrine")
 * troca a receita `glass` por uma sem `backdrop-blur` próprio — ver
 * MiniSiteButton.tsx — pra não borrar o painel já borrado.
 */
export function ButtonsSection({
  config,
  spacingClassName = "mt-10",
  insidePanel = false,
}: {
  config: MiniSiteConfig;
  spacingClassName?: string;
  insidePanel?: boolean;
}) {
  const readyButtons = EDITABLE_BUTTON_TYPES.map((type) => config.buttons.find((b) => b.type === type)).filter(
    (button): button is NonNullable<typeof button> => Boolean(button && isButtonReady(button, config)),
  );
  const socialEntries = getFilledSocialEntries(config.socialLinks);

  if (readyButtons.length === 0 && socialEntries.length === 0) return null;

  const socialColors = getButtonColors(config);
  const style = config.appearance.buttonStyle;
  // Hierarquia: o 1º botão de ação pronto é `primary`, os demais `secondary`.
  // Redes sociais são `tertiary` — a menos que não haja NENHUM botão de
  // ação, aí o 1º link social vira `primary` (sempre existe um CTA
  // principal quando há pelo menos um item na lista).
  const hasActionButtons = readyButtons.length > 0;

  return (
    <div className={`flex w-full flex-col gap-3.5 ${spacingClassName}`}>
      {readyButtons.map((button, index) => {
        const tier: MiniSiteButtonTier = index === 0 ? "primary" : "secondary";
        const Icon = BUTTON_ICONS[button.type] ?? ExternalLinkIcon;
        const label = getButtonLabel(button);
        const colors = getButtonColors(config, button);

        if (button.type === "pix" && config.pix) {
          return (
            <CopyableReveal
              key={button.id}
              icon={<PixIcon className="h-5 w-5" />}
              label={label}
              value={config.pix.key}
              hint={config.pix.holderName}
              colors={colors}
              style={style}
              tier={tier}
              insidePanel={insidePanel}
            />
          );
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
              style={style}
              tier={tier}
              insidePanel={insidePanel}
            />
          );
        }

        const href = getButtonHref(button);
        if (!href) return null;

        return (
          <MiniSiteButtonLink
            key={button.id}
            href={href}
            icon={<Icon className="h-5 w-5" />}
            label={label}
            colors={colors}
            style={style}
            tier={tier}
            insidePanel={insidePanel}
          />
        );
      })}
      {socialEntries.map(({ platform, href }, index) => {
        const Icon = SOCIAL_ICONS[platform];
        const tier: MiniSiteButtonTier = !hasActionButtons && index === 0 ? "primary" : "tertiary";
        return (
          <MiniSiteButtonLink
            key={platform}
            href={href}
            icon={<Icon className="h-5 w-5" />}
            label={SOCIAL_PLATFORM_LABELS[platform]}
            colors={socialColors}
            style={style}
            tier={tier}
            insidePanel={insidePanel}
          />
        );
      })}
    </div>
  );
}
