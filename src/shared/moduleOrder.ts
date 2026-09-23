import type { MiniSiteConfig } from "./schemas/miniSiteConfig";
import { EDITABLE_BUTTON_TYPES, isButtonReady } from "./actionButtons";
import { isCatalogSectionReady } from "./catalog";
import { getFilledSocialEntries } from "./socialLinks";

/**
 * Módulos públicos reordenáveis. Cabeçalho fica sempre no início e o
 * rodapé social sempre no final — não fazem parte desta lista.
 *
 * `actionButtons` é o módulo único de botões (ações + redes sociais) —
 * antes eram dois módulos separados (`actionButtons` + `socialButtons`);
 * unificados num só bloco visual, mas a CHAVE do módulo continua
 * `actionButtons` de propósito, para que uma ordem já salva por um
 * usuário (`config.moduleOrder`) continue valendo sem precisar de
 * migração — ver getOrderedModules().
 *
 * A ordem desta lista só vale como DEFAULT/fallback — para MiniSites sem
 * `module_order` personalizado ainda. Uma ordem já salva pelo usuário na
 * Tela de Layout nunca é sobrescrita por ela.
 */
export const MODULE_KEYS = ["actionButtons", "gallery", "catalog", "location"] as const;
export type ModuleKey = (typeof MODULE_KEYS)[number];

export const MODULE_INFO: Record<ModuleKey, { label: string; description: string }> = {
  actionButtons: { label: "Botões", description: "WhatsApp, Google, Pix, Instagram e outros" },
  gallery: { label: "Galeria", description: "Imagens em destaque do seu negócio" },
  catalog: { label: "Catálogo / Seções", description: "Produtos, serviços ou categorias" },
  location: { label: "Como chegar", description: "Endereço e mapa" },
};

function hasGallery(config: MiniSiteConfig): boolean {
  return config.gallery.length > 0;
}

/** Módulo único de botões: aparece com conteúdo de ações OU de redes sociais. */
function hasActionButtons(config: MiniSiteConfig): boolean {
  const hasAction = EDITABLE_BUTTON_TYPES.some((type) => {
    const button = config.buttons.find((b) => b.type === type);
    return button ? isButtonReady(button, config) : false;
  });
  return hasAction || getFilledSocialEntries(config.socialLinks).length > 0;
}

function hasCatalog(config: MiniSiteConfig): boolean {
  return config.sections.some(isCatalogSectionReady);
}

function hasLocation(config: MiniSiteConfig): boolean {
  return Boolean(config.location?.address || config.location?.mapsUrl);
}

const PRESENCE_CHECK: Record<ModuleKey, (config: MiniSiteConfig) => boolean> = {
  gallery: hasGallery,
  actionButtons: hasActionButtons,
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
 * desconhecidos (inclusive a antiga chave "socialButtons", de registros
 * salvos antes da unificação — simplesmente descartada, sem erro), e
 * acrescenta ao final módulos visíveis que ainda não estavam na lista
 * (registros antigos ou módulos novos) — nunca some conteúdo por causa
 * de uma ordem desatualizada.
 */
export function getOrderedModules(config: MiniSiteConfig): ModuleKey[] {
  const visible = new Set(getVisibleModules(config));
  const fromOrder = config.moduleOrder.filter((key): key is ModuleKey => visible.has(key as ModuleKey));
  const missing = MODULE_KEYS.filter((key) => visible.has(key) && !fromOrder.includes(key));
  return [...fromOrder, ...missing];
}
