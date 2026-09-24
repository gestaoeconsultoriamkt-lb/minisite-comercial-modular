import type { MiniSiteConfig } from "./schemas/miniSiteConfig";
import { isReservedSlug, isValidSlugFormat } from "./reservedSlugs";
import { isButtonReady } from "./actionButtons";
import { isCatalogSectionReady } from "./catalog";

export interface ChecklistItem {
  key: string;
  label: string;
  ok: boolean;
  blocking: boolean;
}

export interface PublishChecklistInput {
  internalName: string;
  slug: string;
  config: MiniSiteConfig;
}

export interface PublishChecklistResult {
  items: ChecklistItem[];
  blockers: string[];
  canPublish: boolean;
}

/**
 * Única fonte de verdade do checklist — usada tanto para exibir a lista na
 * Tela 4 quanto para validar no servidor antes de publicar (§11/§14 da
 * Fase 4). Só o mínimo estrutural bloqueia; o resto é informativo.
 */
export function computePublishChecklist({ internalName, slug, config }: PublishChecklistInput): PublishChecklistResult {
  const items: ChecklistItem[] = [
    { key: "internalName", label: "Nome do Site", ok: internalName.trim().length >= 2, blocking: true },
    { key: "slug", label: "Slug válido", ok: isValidSlugFormat(slug) && !isReservedSlug(slug), blocking: true },
    {
      key: "renderable",
      label: "Conteúdo renderizável",
      ok: Boolean(internalName.trim() || config.header.displayName?.trim()),
      blocking: true,
    },
    { key: "logo", label: "Logo configurado", ok: Boolean(config.appearance.logoKey), blocking: false },
    { key: "cover", label: "Capa configurada", ok: Boolean(config.appearance.coverKey), blocking: false },
    {
      key: "buttons",
      label: "Botões configurados",
      ok: config.buttons.some((b) => isButtonReady(b, config)),
      blocking: false,
    },
    {
      key: "socials",
      label: "Redes sociais",
      ok: Object.values(config.socialLinks).some((url) => Boolean(url)),
      blocking: false,
    },
    { key: "catalog", label: "Catálogo", ok: config.sections.some(isCatalogSectionReady), blocking: false },
    {
      key: "location",
      label: "Localização",
      ok: Boolean(config.location?.address || config.location?.mapsUrl),
      blocking: false,
    },
  ];

  const blockers = items.filter((i) => i.blocking && !i.ok).map((i) => i.label);
  return { items, blockers, canPublish: blockers.length === 0 };
}
