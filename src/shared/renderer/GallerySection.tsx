import { getAssetUrl } from "../assetUrl";
import { TagIcon } from "../icons";
import { SectionHeading } from "./SectionHeading";
import type { MiniSiteConfig, MiniSiteVisualStyle } from "../schemas/miniSiteConfig";

/** Moldura do card de imagem por `visualStyle` — `simple` é o card que já existia (sem regressão). */
const CARD_FRAME: Record<MiniSiteVisualStyle, string> = {
  simple: "rounded-2xl",
  premium: "rounded-[20px] ring-1 ring-white/10 shadow-[0_10px_26px_-10px_rgba(0,0,0,0.45)]",
  glass: "rounded-[20px] ring-1 ring-white/20 shadow-[0_14px_32px_-12px_rgba(0,0,0,0.5)]",
};

/**
 * Carrossel 100% CSS (scroll-snap) — funciona com swipe nativo em qualquer
 * contexto, inclusive no HTML estático do SSR público, sem precisar de JS.
 * Indicadores são decorativos (não sincronizam com a posição do scroll).
 * `visualStyle` só encorpa a moldura (anel/sombra/raio) — a imagem em si
 * nunca muda de proporção/corte.
 */
export function GallerySection({ config }: { config: MiniSiteConfig }) {
  const images = [...config.gallery].sort((a, b) => a.position - b.position);
  if (images.length === 0) return null;

  const heading = config.galleryHeading;
  const showHeading = heading.show && Boolean(heading.title.trim());
  const frame = CARD_FRAME[config.appearance.visualStyle];

  return (
    <section className="mt-10 flex flex-col gap-5">
      {showHeading ? <SectionHeading icon={<TagIcon className="h-3.5 w-3.5" />} title={heading.title} /> : null}
      <div className="flex flex-col gap-2">
        <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {images.map((image) => (
            <div key={image.id} className={`relative h-52 w-52 shrink-0 snap-center overflow-hidden ${frame}`}>
              <img src={getAssetUrl(image.imageKey)} alt={image.alt ?? ""} loading="lazy" className="h-full w-full object-cover" />
              {config.appearance.visualStyle === "glass" ? (
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 rounded-[inherit] bg-gradient-to-b from-white/10 via-transparent to-transparent ring-1 ring-inset ring-white/10"
                />
              ) : null}
            </div>
          ))}
        </div>
        {images.length > 1 ? (
          <div className="flex justify-center gap-1.5">
            {images.map((image, index) => (
              <span
                key={image.id}
                className={`h-1.5 rounded-full transition-all ${index === 0 ? "w-4 bg-white" : "w-1.5 bg-white/50"}`}
              />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
