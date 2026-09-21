import type { MiniSiteCard, MiniSiteSection } from "./schemas/miniSiteConfig";

/**
 * Um item do catálogo "conta" no MiniSite só se tiver um título — mesma
 * lógica de "readiness" já usada para os botões de ação (ver
 * isButtonReady em actionButtons.ts): nunca renderizar um card vazio ou
 * quebrado, mas qualquer combinação de imagem/descrição/preço/CTA é
 * livre desde que haja um título.
 */
export function isCatalogCardReady(card: MiniSiteCard): boolean {
  return Boolean(card.title?.trim());
}

/** Itens prontos de uma seção, na ordem configurada. */
export function getReadyCards(section: MiniSiteSection): MiniSiteCard[] {
  return [...section.cards].filter(isCatalogCardReady).sort((a, b) => a.position - b.position);
}

/** Uma seção só aparece no MiniSite quando tem ao menos um item pronto. */
export function isCatalogSectionReady(section: MiniSiteSection): boolean {
  return section.cards.some(isCatalogCardReady);
}
