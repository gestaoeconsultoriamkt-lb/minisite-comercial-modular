import type { MiniSiteConfig, MiniSiteVisualStyle } from "../schemas/miniSiteConfig";
import { ExternalLinkIcon, MapPinIcon } from "../icons";
import { normalizeUrl } from "../urls";
import { extractMapEmbedUrl } from "../mapEmbed";

function googleMapsSearchUrl(query: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

/**
 * Tratamento do card "Como chegar" por `visualStyle` (ver §1 do sistema de
 * presets) — `simple` é byte-a-byte o card que já existia (default, sem
 * regressão). `premium` refina sombra/anel/raio mantendo fundo sólido
 * claro; `glass` estende o vidro da hero "vitrine" aos cards secundários,
 * por isso troca para texto claro sobre fundo translúcido escuro.
 */
const CARD_STYLE: Record<
  MiniSiteVisualStyle,
  { section: string; iconBadge: string; heading: string; address: string; mapRing: string; mapsButton: string }
> = {
  simple: {
    section: "rounded-2xl bg-white/95 p-5 text-slate-900",
    iconBadge: "bg-slate-100 text-slate-600",
    heading: "text-sm font-bold",
    address: "mt-1.5 text-sm text-slate-600",
    mapRing: "ring-1 ring-slate-200",
    mapsButton: "bg-slate-900 text-white",
  },
  premium: {
    section:
      "rounded-[24px] bg-white p-6 text-slate-900 shadow-[0_1px_0_rgba(255,255,255,0.6)_inset,0_20px_44px_-16px_rgba(0,0,0,0.32)] ring-1 ring-black/[0.06]",
    iconBadge: "bg-slate-900/5 text-slate-700 ring-1 ring-inset ring-black/5",
    heading: "text-sm font-bold tracking-tight",
    address: "mt-1.5 text-sm text-slate-600",
    mapRing: "ring-1 ring-black/10 shadow-[0_14px_30px_-12px_rgba(0,0,0,0.4)]",
    mapsButton: "bg-slate-900 text-white shadow-[0_1px_0_rgba(255,255,255,0.15)_inset,0_12px_24px_-8px_rgba(0,0,0,0.45)]",
  },
  glass: {
    section:
      "rounded-[24px] p-6 text-white shadow-[0_1px_0_rgba(255,255,255,0.15)_inset,0_24px_56px_-18px_rgba(0,0,0,0.55)] ring-1 ring-inset ring-white/15 backdrop-blur-xl backdrop-saturate-150",
    iconBadge: "bg-white/10 text-white/85 ring-1 ring-inset ring-white/15",
    heading: "text-sm font-bold tracking-tight text-white",
    address: "mt-1.5 text-sm text-white/70",
    mapRing: "ring-1 ring-white/15 shadow-[0_14px_30px_-12px_rgba(0,0,0,0.5)]",
    mapsButton: "bg-white/12 text-white ring-1 ring-inset ring-white/25 shadow-[0_1px_0_rgba(255,255,255,0.2)_inset] backdrop-blur-md",
  },
};

const GLASS_SECTION_BG = "rgba(15, 23, 42, 0.4)";

export function LocationSection({ config }: { config: MiniSiteConfig }) {
  const { location } = config;
  const hasLocation = Boolean(location?.address || location?.mapsUrl);
  if (!hasLocation) return null;

  const visualStyle = config.appearance.visualStyle;
  const cardStyle = CARD_STYLE[visualStyle];

  // Mesma normalização dos demais links baseados em URL — sem protocolo,
  // o navegador trataria como caminho relativo do próprio app/SSR.
  const mapsHref = location?.mapsUrl ? normalizeUrl(location.mapsUrl) : location?.address ? googleMapsSearchUrl(location.address) : null;
  // Aceita a URL de embed pura OU o código <iframe> completo colado pelo
  // usuário (extrai o `src` por regex, sem dangerouslySetInnerHTML) — ver
  // extractMapEmbedUrl. Só aceita destinos do Google Maps.
  const mapEmbedSrc = location?.mapEmbedUrl ? extractMapEmbedUrl(location.mapEmbedUrl) : null;

  const boosted = visualStyle !== "simple";

  return (
    <section className={`mt-10 w-full text-left ${cardStyle.section}`} style={visualStyle === "glass" ? { backgroundColor: GLASS_SECTION_BG } : undefined}>
      <div className={`flex items-center gap-2.5 ${cardStyle.heading}`}>
        {boosted ? (
          <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${cardStyle.iconBadge}`}>
            <MapPinIcon className="h-3.5 w-3.5" />
          </span>
        ) : (
          <MapPinIcon className="h-4 w-4" />
        )}
        Como chegar
      </div>
      {location?.address ? (
        <p className={cardStyle.address}>
          {location.address}
          {location.city ? `, ${location.city}` : ""}
          {location.state ? ` - ${location.state}` : ""}
        </p>
      ) : null}
      {mapEmbedSrc ? (
        // O conteúdo interno do embed (inclusive qualquer rótulo/link que o
        // próprio Google desenha dentro do iframe) é de outra origem — a
        // página não tem acesso para remover ou estilizar nada lá dentro
        // (restrição de segurança do navegador, não uma limitação nossa).
        // A moldura arredondada com anel sutil é o "fallback premium"
        // possível: cerca o mapa de forma intencional; a navegação real
        // continua garantida pelo botão "Abrir no Google Maps" abaixo.
        <div className={`overflow-hidden rounded-xl ${boosted ? "mt-4" : "mt-3.5"} ${cardStyle.mapRing}`}>
          <iframe title="Mapa" src={mapEmbedSrc} className="h-52 w-full border-0" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
        </div>
      ) : null}
      {mapsHref ? (
        <a
          href={mapsHref}
          target="_blank"
          rel="noopener noreferrer"
          className={`flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold ${boosted ? "mt-4" : "mt-3.5"} ${cardStyle.mapsButton}`}
        >
          <ExternalLinkIcon className="h-4 w-4" />
          Abrir no Google Maps
        </a>
      ) : null}
    </section>
  );
}
