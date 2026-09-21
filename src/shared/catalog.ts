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

/**
 * Readiness da seção é independente da readiness dos itens: uma seção
 * aparece no MiniSite quando tem título e ao menos um conteúdo visual
 * válido — a própria imagem da seção OU um item pronto. Uma seção com
 * título + imagem mas zero itens já é conteúdo real (ex.: "Pizzas e
 * esfihas tradicionais" com foto, catálogo de itens ainda por vir) e não
 * deve depender de ter item nenhum para ser mostrada.
 */
export function isCatalogSectionReady(section: MiniSiteSection): boolean {
  return Boolean(section.title?.trim()) && (Boolean(section.imageKey) || section.cards.some(isCatalogCardReady));
}
