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
    <div id={id} className="relative w-40 shrink-0 snap-start overflow-hidden rounded-2xl bg-white/10 sm:w-48">
      <img src={getAssetUrl(item.imageKey)} alt={item.label ?? ""} loading="lazy" className="aspect-[2/3] w-full object-cover" />
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
    <section className="mt-10 flex flex-col gap-10">
      {sections.map((section) => {
        const images = getSectionImageItems(section);
        return (
          <div key={section.id} className="flex flex-col gap-5">
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
                  nativo, sem JS). O primeiro ponto aparece "ativo" por padrão
                  (mesmo padrão da Galeria) — não é possível destacar
                  dinamicamente qual imagem está visível sem JS, mas os pontos
                  passam a indicar de fato a quantidade/posição de slides em
                  vez de ficarem todos idênticos. */}
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
                      className={`h-1.5 rounded-full transition-all ${index === 0 ? "w-4 bg-white" : "w-1.5 bg-white/40"}`}
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
