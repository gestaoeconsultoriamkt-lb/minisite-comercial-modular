import { getAssetUrl } from "../assetUrl";
import { TagIcon } from "../icons";
import type { MiniSiteConfig } from "../schemas/miniSiteConfig";

/**
 * Carrossel 100% CSS (scroll-snap) — funciona com swipe nativo em qualquer
 * contexto, inclusive no HTML estático do SSR público, sem precisar de JS.
 * Indicadores são decorativos (não sincronizam com a posição do scroll).
 * Título/divisor seguem o mesmo padrão visual das seções do catálogo
 * (ícone + versalete + linha), para consistência entre os módulos.
 */
export function GallerySection({ config }: { config: MiniSiteConfig }) {
  const images = [...config.gallery].sort((a, b) => a.position - b.position);
  if (images.length === 0) return null;

  const heading = config.galleryHeading;
  const showHeading = heading.show && Boolean(heading.title.trim());

  return (
    <section className="mt-10 flex flex-col gap-5">
      {showHeading ? (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <TagIcon className="h-4 w-4 shrink-0 text-white/70" />
            <h3 className="text-sm font-bold uppercase tracking-wide text-white">{heading.title}</h3>
          </div>
          <div className="h-px w-full bg-white/15" />
        </div>
      ) : null}
      <div className="flex flex-col gap-2">
        <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {images.map((image) => (
            <img
              key={image.id}
              src={getAssetUrl(image.imageKey)}
              alt={image.alt ?? ""}
              loading="lazy"
              className="h-52 w-52 shrink-0 snap-center rounded-2xl object-cover"
            />
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
