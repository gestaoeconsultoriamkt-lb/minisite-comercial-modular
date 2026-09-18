import { getAssetUrl } from "../assetUrl";
import type { MiniSiteConfig } from "../schemas/miniSiteConfig";

/**
 * Carrossel 100% CSS (scroll-snap) — funciona com swipe nativo em qualquer
 * contexto, inclusive no HTML estático do SSR público, sem precisar de JS.
 * Indicadores são decorativos (não sincronizam com a posição do scroll).
 */
export function GallerySection({ config }: { config: MiniSiteConfig }) {
  const images = [...config.gallery].sort((a, b) => a.position - b.position);
  if (images.length === 0) return null;

  return (
    <section className="mt-6">
      <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {images.map((image) => (
          <img
            key={image.id}
            src={getAssetUrl(image.imageKey)}
            alt={image.alt ?? ""}
            className="h-40 w-40 shrink-0 snap-center rounded-2xl object-cover"
          />
        ))}
      </div>
      {images.length > 1 ? (
        <div className="mt-2 flex justify-center gap-1.5">
          {images.map((image, index) => (
            <span
              key={image.id}
              className={`h-1.5 rounded-full transition-all ${index === 0 ? "w-4 bg-white" : "w-1.5 bg-white/50"}`}
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}
