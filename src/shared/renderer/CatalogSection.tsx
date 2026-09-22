import { getAssetUrl } from "../assetUrl";
import { findButton, isButtonEnabled } from "../actionButtons";
import { buildWhatsAppUrl } from "../whatsapp";
import { getReadyCards, getSectionImages, isCatalogSectionReady } from "../catalog";
import { TagIcon } from "../icons";
import type { MiniSiteCard, MiniSiteConfig, MiniSiteSection as MiniSiteSectionData } from "../schemas/miniSiteConfig";

function CatalogCard({ card, section, whatsappPhone }: { card: MiniSiteCard; section: MiniSiteSectionData; whatsappPhone: string | null }) {
  const showPrice = section.showPrices && typeof card.price === "number";
  const showCta = section.showCta && card.ctaType;

  let ctaHref: string | null = null;
  if (showCta && card.ctaType === "url" && card.ctaTarget) {
    ctaHref = card.ctaTarget;
  } else if (showCta && card.ctaType === "whatsapp" && whatsappPhone) {
    ctaHref = buildWhatsAppUrl(whatsappPhone, card.whatsappMessage || `Olá! Gostaria de pedir ${card.title}.`);
  }

  return (
    // Card vertical, mais alto — imagem em destaque (proporção 3:4) acima
    // do conteúdo, item de um carrossel horizontal (snap-start + shrink-0).
    <div className="flex w-40 shrink-0 flex-col snap-start overflow-hidden rounded-2xl bg-white/95 shadow-sm">
      {card.imageKey ? (
        <img src={getAssetUrl(card.imageKey)} alt="" className="aspect-[3/4] w-full object-cover" />
      ) : (
        <div className="aspect-[3/4] w-full bg-slate-100" />
      )}
      <div className="flex flex-1 flex-col gap-1.5 p-3.5">
        <p className="text-sm font-bold text-slate-900">{card.title}</p>
        {card.description ? <p className="line-clamp-2 text-xs text-slate-500">{card.description}</p> : null}
        <div className="mt-auto flex flex-col gap-2 pt-1">
          {showPrice ? (
            <p className="text-sm font-bold text-slate-900">
              {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(card.price!)}
            </p>
          ) : null}
          {ctaHref ? (
            <a
              href={ctaHref}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-slate-900 px-2.5 py-1.5 text-center text-xs font-semibold text-white"
            >
              {card.ctaLabel || "Pedir"}
            </a>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function SectionImageCarousel({ sectionId, images }: { sectionId: string; images: string[] }) {
  return (
    <div className="flex flex-col gap-2">
      {/* Sem hidratação no MiniSite público — swipe funciona nativamente via
          scroll-snap; os pontos são links de âncora (scroll-to-target nativo,
          sem JS). Não é possível destacar o ponto "ativo" sem JS — trade-off
          aceito para manter a página 100% funcional sem hidratação. */}
      <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {images.map((key, index) => (
          <img
            key={`${key}-${index}`}
            id={`cat-${sectionId}-img-${index}`}
            src={getAssetUrl(key)}
            alt=""
            className="h-40 w-[85%] shrink-0 snap-center rounded-2xl object-cover sm:w-[60%]"
          />
        ))}
      </div>
      {images.length > 1 ? (
        <div className="flex justify-center gap-1.5">
          {images.map((_, index) => (
            <a
              key={index}
              href={`#cat-${sectionId}-img-${index}`}
              aria-label={`Ir para imagem ${index + 1}`}
              className="h-1.5 w-1.5 rounded-full bg-white/40"
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function CatalogSection({ config }: { config: MiniSiteConfig }) {
  const sections = [...config.sections].filter(isCatalogSectionReady).sort((a, b) => a.position - b.position);
  if (sections.length === 0) return null;

  const whatsappButton = findButton(config, "whatsapp");
  const whatsappPhone =
    whatsappButton && isButtonEnabled(whatsappButton) && typeof whatsappButton.value.phone === "string"
      ? whatsappButton.value.phone
      : null;

  return (
    <section className="mt-8 flex flex-col gap-8">
      {sections.map((section) => {
        const cards = getReadyCards(section);
        const images = getSectionImages(section);
        return (
          <div key={section.id} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <TagIcon className="h-4 w-4 shrink-0 text-white/70" />
                <h3 className="text-sm font-bold uppercase tracking-wide text-white">{section.title}</h3>
              </div>
              <div className="h-px w-full bg-white/15" />
            </div>
            {images.length > 0 ? <SectionImageCarousel sectionId={section.id} images={images} /> : null}
            {cards.length > 0 ? (
              <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {cards.map((card) => (
                  <CatalogCard key={card.id} card={card} section={section} whatsappPhone={whatsappPhone} />
                ))}
              </div>
            ) : null}
          </div>
        );
      })}
    </section>
  );
}
