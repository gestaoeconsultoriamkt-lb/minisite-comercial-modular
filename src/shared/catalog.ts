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
 * Imagens efetivas da seção: prefere o novo array `imageKeys`; se vazio,
 * cai para o `imageKey` legado (registros antigos, uma imagem só) — sem
 * migração destrutiva, sem perda de dado ao ler configs pré-existentes.
 */
export function getSectionImages(section: MiniSiteSection): string[] {
  if (section.imageKeys.length > 0) return section.imageKeys;
  return section.imageKey ? [section.imageKey] : [];
}

/**
 * Readiness da seção é independente da readiness dos itens: uma seção
 * aparece no MiniSite quando tem título e ao menos um conteúdo visual
 * válido — imagens da seção OU um item pronto. Uma seção com título +
 * imagem(ns) mas zero itens já é conteúdo real (ex.: "Pizzas e esfihas
 * tradicionais" com fotos, catálogo de itens ainda por vir) e não deve
 * depender de ter item nenhum para ser mostrada.
 */
export function isCatalogSectionReady(section: MiniSiteSection): boolean {
  return Boolean(section.title?.trim()) && (getSectionImages(section).length > 0 || section.cards.some(isCatalogCardReady));
}
