import type { MiniSiteSection } from "./schemas/miniSiteConfig";

export interface CatalogImageItem {
  id: string;
  imageKey: string;
  label?: string;
  price?: number;
}

/**
 * Imagens efetivas da seção, da geração mais nova para a mais antiga —
 * nunca perde conteúdo já salvo:
 *  1) `images` (atual — cada imagem com nome/preço opcionais);
 *  2) `imageKeys` (rodada anterior — array de chaves, sem metadados);
 *  3) `imageKey` (geração original — uma imagem só).
 * A primeira edição feita pelo editor novo já escreve em `images`,
 * carregando para lá o que existir das gerações anteriores (ver
 * `SectionImagesField` em CatalogSectionEditor.tsx).
 */
export function getSectionImageItems(section: MiniSiteSection): CatalogImageItem[] {
  if (section.images.length > 0) {
    return [...section.images]
      .sort((a, b) => a.position - b.position)
      .map(({ id, imageKey, label, price }) => ({ id, imageKey, label, price }));
  }
  if (section.imageKeys.length > 0) {
    return section.imageKeys.map((imageKey, index) => ({ id: `legacy-${index}`, imageKey }));
  }
  if (section.imageKey) {
    return [{ id: "legacy-0", imageKey: section.imageKey }];
  }
  return [];
}

/**
 * A estrutura de Item (cards com descrição/CTA) foi removida do fluxo
 * visual/editor — a imagem é a unidade principal da seção. Uma seção
 * aparece no MiniSite quando tem título e ao menos uma imagem.
 */
export function isCatalogSectionReady(section: MiniSiteSection): boolean {
  return Boolean(section.title?.trim()) && getSectionImageItems(section).length > 0;
}

export function formatCatalogPrice(price: number): string {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(price);
}
