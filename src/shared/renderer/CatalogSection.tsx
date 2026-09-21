import { getAssetUrl } from "../assetUrl";
import { findButton, isButtonEnabled } from "../actionButtons";
import { buildWhatsAppUrl } from "../whatsapp";
import { getReadyCards, isCatalogSectionReady } from "../catalog";
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
    <div className="flex flex-col overflow-hidden rounded-2xl bg-white/95 shadow-sm">
      {card.imageKey ? (
        <img src={getAssetUrl(card.imageKey)} alt="" className="h-24 w-full object-cover" />
      ) : null}
      <div className="flex flex-1 flex-col gap-1 p-3">
        <p className="text-sm font-bold text-slate-900">{card.title}</p>
        {card.description ? <p className="text-xs text-slate-500">{card.description}</p> : null}
        <div className="mt-auto flex items-center justify-between gap-2 pt-1">
          {showPrice ? (
            <p className="text-sm font-bold text-slate-900">
              {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(card.price!)}
            </p>
          ) : (
            <span />
          )}
          {ctaHref ? (
            <a
              href={ctaHref}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-slate-900 px-2.5 py-1 text-xs font-semibold text-white"
            >
              {card.ctaLabel || "Pedir"}
            </a>
          ) : null}
        </div>
      </div>
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
    <section className="mt-6 flex flex-col gap-6">
      {sections.map((section) => {
        const cards = getReadyCards(section);
        return (
          <div key={section.id}>
            <h3 className="mb-2 text-sm font-bold text-white">{section.title}</h3>
            {section.imageKey ? (
              // Imagem da seção é conteúdo visual próprio da seção — aparece
              // mesmo sem nenhum item, sempre em crop proporcional (object-cover).
              <img src={getAssetUrl(section.imageKey)} alt="" className="mb-3 h-32 w-full rounded-2xl object-cover" />
            ) : null}
            {cards.length > 0 ? (
              <div className="grid grid-cols-2 gap-3">
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
