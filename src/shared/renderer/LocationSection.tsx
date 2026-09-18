import type { MiniSiteConfig } from "../schemas/miniSiteConfig";
import { ExternalLinkIcon, MapPinIcon } from "../icons";

function googleMapsSearchUrl(query: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

export function LocationSection({ config }: { config: MiniSiteConfig }) {
  const { location } = config;
  const hasLocation = Boolean(location?.address || location?.mapsUrl);
  if (!hasLocation) return null;

  const mapsHref = location?.mapsUrl || (location?.address ? googleMapsSearchUrl(location.address) : null);

  return (
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
        <iframe title="Mapa" src={location.mapEmbedUrl} className="mt-3 h-40 w-full rounded-xl border-0" loading="lazy" />
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
  );
}
