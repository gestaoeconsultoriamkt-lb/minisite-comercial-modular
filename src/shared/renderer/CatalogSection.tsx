import { getAssetUrl } from "../assetUrl";
import { formatCatalogPrice, getSectionImageItems, isCatalogSectionReady, type CatalogImageItem } from "../catalog";
import { TagIcon } from "../icons";
import type { MiniSiteConfig } from "../schemas/miniSiteConfig";

/**
 * A imagem é a unidade visual principal da seção — sem Item/CTA/descrição
 * longa. Cada imagem pode opcionalmente ter um nome curto e/ou preço,
 * mostrados numa faixa translúcida discreta sobre a base da foto, sem
 * aumentar a altura do card nem quebrar a proporção vertical.
 */
function CatalogImageCard({ id, item, showPrice }: { id: string; item: CatalogImageItem; showPrice: boolean }) {
  const hasLabel = Boolean(item.label?.trim());
  const hasPrice = showPrice && typeof item.price === "number";

  return (
    <div id={id} className="relative w-36 shrink-0 snap-start overflow-hidden rounded-2xl bg-white/10 sm:w-44">
      <img src={getAssetUrl(item.imageKey)} alt={item.label ?? ""} loading="lazy" className="aspect-[3/4] w-full object-cover" />
      {hasLabel || hasPrice ? (
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent px-2.5 pb-2.5 pt-7">
          {hasLabel ? <p className="truncate text-[13px] font-semibold text-white">{item.label}</p> : null}
          {hasPrice ? <p className="text-[13px] font-semibold text-white">{formatCatalogPrice(item.price!)}</p> : null}
        </div>
      ) : null}
    </div>
  );
}

export function CatalogSection({ config }: { config: MiniSiteConfig }) {
  const sections = [...config.sections].filter(isCatalogSectionReady).sort((a, b) => a.position - b.position);
  if (sections.length === 0) return null;

  return (
    <section className="mt-8 flex flex-col gap-8">
      {sections.map((section) => {
        const images = getSectionImageItems(section);
        return (
          <div key={section.id} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <TagIcon className="h-4 w-4 shrink-0 text-white/70" />
                <h3 className="text-sm font-bold uppercase tracking-wide text-white">{section.title}</h3>
              </div>
              <div className="h-px w-full bg-white/15" />
            </div>
            <div className="flex flex-col gap-2">
              {/* Sem hidratação no MiniSite público — swipe funciona nativamente via
                  scroll-snap (inclusive scroll horizontal por mouse/trackpad no
                  desktop); os pontos são links de âncora (scroll-to-target
                  nativo, sem JS). Não é possível destacar o ponto "ativo" sem
                  JS — trade-off aceito para manter a página 100% funcional
                  sem hidratação. */}
              <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {images.map((item, index) => (
                  <CatalogImageCard key={`${item.id}-${index}`} id={`cat-${section.id}-img-${index}`} item={item} showPrice={section.showPrices} />
                ))}
              </div>
              {images.length > 1 ? (
                <div className="flex justify-center gap-1.5">
                  {images.map((_, index) => (
                    <a
                      key={index}
                      href={`#cat-${section.id}-img-${index}`}
                      aria-label={`Ir para imagem ${index + 1}`}
                      className="h-1.5 w-1.5 rounded-full bg-white/40"
                    />
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        );
      })}
    </section>
  );
}
