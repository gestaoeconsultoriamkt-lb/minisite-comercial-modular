import type { MiniSiteSocialLinks } from "./schemas/miniSiteConfig";
import { normalizeUrl } from "./urls";

export type SocialPlatform = keyof MiniSiteSocialLinks;

export const SOCIAL_PLATFORM_LABELS: Record<SocialPlatform, string> = {
  instagram: "Instagram",
  facebook: "Facebook",
  tiktok: "TikTok",
  youtube: "YouTube",
  linkedin: "LinkedIn",
  kwai: "Kwai",
};

/** Base usada quando o campo guarda só um @handle, sem domínio nenhum. */
const SOCIAL_HANDLE_BASE_URL: Record<SocialPlatform, string> = {
  instagram: "https://instagram.com/",
  facebook: "https://facebook.com/",
  tiktok: "https://tiktok.com/@",
  youtube: "https://youtube.com/@",
  linkedin: "https://linkedin.com/company/",
  kwai: "https://kwai.com/@",
};

/**
 * O campo aceita @handle, domínio sem protocolo ou URL completa — sempre
 * devolve uma URL absoluta usável como `href`. Guardamos o valor bruto no
 * config (sem forçar `z.url()`) e normalizamos só aqui, no ponto de uso —
 * mesmo padrão do `getButtonHref` para os botões de ação.
 */
export function getSocialHref(platform: SocialPlatform, raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  if (/^[a-z][a-z0-9+.-]*:/i.test(trimmed)) return trimmed;
  if (trimmed.includes(".")) return normalizeUrl(trimmed);
  return `${SOCIAL_HANDLE_BASE_URL[platform]}${trimmed.replace(/^@+/, "")}`;
}

export interface FilledSocialEntry {
  platform: SocialPlatform;
  href: string;
}

/** Redes com valor preenchido e resolvido para uma URL válida, na ordem canônica. */
export function getFilledSocialEntries(socialLinks: MiniSiteSocialLinks): FilledSocialEntry[] {
  return (Object.keys(SOCIAL_PLATFORM_LABELS) as SocialPlatform[])
    .map((platform) => {
      const raw = socialLinks[platform];
      const href = raw ? getSocialHref(platform, raw) : null;
      return href ? { platform, href } : null;
    })
    .filter((entry): entry is FilledSocialEntry => Boolean(entry));
}
