import type { MiniSiteConfig } from "./schemas/miniSiteConfig";
import { EDITABLE_BUTTON_TYPES, isButtonReady } from "./actionButtons";
import { getFilledSocialEntries } from "./socialLinks";

/**
 * Módulos públicos reordenáveis. Cabeçalho fica sempre no início e o
 * rodapé social sempre no final — não fazem parte desta lista. Os botões
 * de redes sociais no corpo (`socialButtons`) coexistem com os ícones do
 * rodapé: são duas saídas independentes para o mesmo `config.socialLinks`.
 */
export const MODULE_KEYS = ["gallery", "actionButtons", "socialButtons", "catalog", "location"] as const;
export type ModuleKey = (typeof MODULE_KEYS)[number];

export const MODULE_INFO: Record<ModuleKey, { label: string; description: string }> = {
  gallery: { label: "Galeria", description: "Imagens em destaque do seu negócio" },
  actionButtons: { label: "Botões de ação", description: "WhatsApp, Google, Site, PIX e outros" },
  socialButtons: { label: "Redes sociais", description: "Instagram, Facebook, TikTok e outras" },
  catalog: { label: "Catálogo / Seções", description: "Produtos, serviços ou categorias" },
  location: { label: "Como chegar", description: "Endereço e mapa" },
};

function hasGallery(config: MiniSiteConfig): boolean {
  return config.gallery.length > 0;
}

function hasActionButtons(config: MiniSiteConfig): boolean {
  return EDITABLE_BUTTON_TYPES.some((type) => {
    const button = config.buttons.find((b) => b.type === type);
    return button ? isButtonReady(button, config) : false;
  });
}

function hasCatalog(config: MiniSiteConfig): boolean {
  return config.sections.some((section) => section.cards.length > 0);
}

function hasLocation(config: MiniSiteConfig): boolean {
  return Boolean(config.location?.address || config.location?.mapsUrl);
}

function hasSocialButtons(config: MiniSiteConfig): boolean {
  return getFilledSocialEntries(config.socialLinks).length > 0;
}

const PRESENCE_CHECK: Record<ModuleKey, (config: MiniSiteConfig) => boolean> = {
  gallery: hasGallery,
  actionButtons: hasActionButtons,
  socialButtons: hasSocialButtons,
  catalog: hasCatalog,
  location: hasLocation,
};

/** Módulos com conteúdo real, na ordem "canônica" (sem considerar module_order ainda). */
export function getVisibleModules(config: MiniSiteConfig): ModuleKey[] {
  return MODULE_KEYS.filter((key) => PRESENCE_CHECK[key](config));
}

/**
 * Módulos visíveis, na ordem escolhida pelo usuário (`config.moduleOrder`).
 * Normaliza automaticamente: ignora entradas de módulos sem conteúdo/
 * desconhecidos, e acrescenta ao final módulos visíveis que ainda não
 * estavam na lista (registros antigos ou módulos novos) — nunca some
 * conteúdo por causa de uma ordem desatualizada.
 */
export function getOrderedModules(config: MiniSiteConfig): ModuleKey[] {
  const visible = new Set(getVisibleModules(config));
  const fromOrder = config.moduleOrder.filter((key): key is ModuleKey => visible.has(key as ModuleKey));
  const missing = MODULE_KEYS.filter((key) => visible.has(key) && !fromOrder.includes(key));
  return [...fromOrder, ...missing];
}
