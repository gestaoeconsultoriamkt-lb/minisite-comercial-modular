import { useState, type MouseEvent, type ReactNode } from "react";
import type { MiniSiteConfig } from "../schemas/miniSiteConfig";
import { getAssetUrl } from "../assetUrl";
import {
  BUTTON_ICONS,
  CopyIcon,
  ExternalLinkIcon,
  MapPinIcon,
  PixIcon,
  SOCIAL_ICONS,
  WifiIcon,
} from "../icons";
import { EDITABLE_BUTTON_TYPES, getButtonHref, getButtonLabel, isButtonReady } from "../actionButtons";
import { GallerySection } from "./GallerySection";
import { CatalogSection } from "./CatalogSection";

export interface MiniSiteRendererProps {
  displayName: string;
  config: MiniSiteConfig;
}

function googleMapsSearchUrl(query: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

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

export function MiniSiteRenderer({ displayName, config }: MiniSiteRendererProps) {
  const { appearance, header, location, footer } = config;
  const backgroundKey = appearance.backgroundKey || appearance.coverKey;
  const isCompact = header.variant === "compact";

  const readyButtons = EDITABLE_BUTTON_TYPES.map((type) => config.buttons.find((b) => b.type === type)).filter(
    (button): button is NonNullable<typeof button> => Boolean(button && isButtonReady(button, config)),
  );

  const socialEntries = (Object.keys(SOCIAL_ICONS) as (keyof typeof SOCIAL_ICONS)[])
    .map((platform) => ({ platform, url: config.socialLinks[platform] }))
    .filter((entry): entry is { platform: keyof typeof SOCIAL_ICONS; url: string } => Boolean(entry.url));

  const hasLocation = Boolean(location?.address || location?.mapsUrl);
  const mapsHref = location?.mapsUrl || (location?.address ? googleMapsSearchUrl(location.address) : null);

  return (
    <div className="minisite-root relative isolate min-h-full overflow-hidden bg-slate-900">
      {backgroundKey ? (
        <img src={getAssetUrl(backgroundKey)} alt="" aria-hidden className="absolute inset-0 h-full w-full scale-110 object-cover blur-xl" />
      ) : null}
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/80" aria-hidden />

      <div className={`relative z-10 flex flex-col items-center px-5 text-center ${isCompact ? "pb-10 pt-8" : "pb-10 pt-12"}`}>
        {appearance.logoKey ? (
          <img
            src={getAssetUrl(appearance.logoKey)}
            alt={displayName}
            className={`rounded-2xl border-2 border-white/80 object-cover shadow-lg ${isCompact ? "h-16 w-16" : "h-24 w-24"}`}
          />
        ) : null}

        <h1 className={`mt-4 font-extrabold text-white ${isCompact ? "text-xl" : "text-2xl"}`}>{displayName}</h1>
        {header.headline ? (
          <p className={`mt-1 font-semibold text-white/90 ${isCompact ? "text-sm" : "text-base"}`}>{header.headline}</p>
        ) : null}
        {header.shortDescription ? (
          <p className="mt-1 text-xs uppercase tracking-wide text-white/70">{header.shortDescription}</p>
        ) : null}

        <GallerySection config={config} />

        {readyButtons.length > 0 ? (
          <div className="mt-6 flex w-full flex-col gap-2.5">
            {readyButtons.map((button) => {
              const Icon = BUTTON_ICONS[button.type] ?? ExternalLinkIcon;
              const label = getButtonLabel(button);

              if (button.type === "pix" && config.pix) {
                return (
                  <CopyableReveal
                    key={button.id}
                    icon={<PixIcon className="h-4 w-4" />}
                    label={label}
                    value={config.pix.key}
                    hint={config.pix.holderName}
                  />
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
                    isWhatsapp
                      ? "bg-[#25D366] text-white"
                      : isPrimary
                        ? "text-white"
                        : "bg-white/95 text-slate-900"
                  }`}
                  style={isPrimary ? { backgroundColor: appearance.colorPrimary || "#1d4ed8", color: appearance.colorButtonText || "#fff" } : undefined}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </a>
              );
            })}
          </div>
        ) : null}

        <CatalogSection config={config} />

        {hasLocation ? (
          <section className="mt-6 w-full rounded-2xl bg-white/95 p-4 text-left text-slate-900">
            <div className="flex items-center gap-2 text-sm font-bold">
              <MapPinIcon className="h-4 w-4" />
              Como chegar
            </div>
            {location?.address ? (
              <p className="mt-1 text-sm text-slate-600">
                {location.address}
                {location.city ? `, ${location.city}` : ""}
                {location.state ? ` - ${location.state}` : ""}
              </p>
            ) : null}
            {location?.mapEmbedUrl ? (
              <iframe
                title="Mapa"
                src={location.mapEmbedUrl}
                className="mt-3 h-40 w-full rounded-xl border-0"
                loading="lazy"
              />
            ) : null}
            {mapsHref ? (
              <a
                href={mapsHref}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white"
              >
                <ExternalLinkIcon className="h-4 w-4" />
                Abrir no Google Maps
              </a>
            ) : null}
          </section>
        ) : null}

        {footer.showSocialIcons && socialEntries.length > 0 ? (
          <div className="mt-8 flex items-center gap-4">
            {socialEntries.map(({ platform, url }) => {
              const Icon = SOCIAL_ICONS[platform];
              return (
                <a key={platform} href={url} target="_blank" rel="noopener noreferrer" className="text-white/80 hover:text-white">
                  <Icon className="h-5 w-5" />
                </a>
              );
            })}
          </div>
        ) : null}
      </div>
    </div>
  );
}
