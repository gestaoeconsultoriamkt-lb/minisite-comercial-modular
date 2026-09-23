import { normalizeUrl } from "./urls";

const ALLOWED_MAP_EMBED_HOSTS = ["google.com", "maps.google.com"];

function isAllowedMapHost(hostname: string): boolean {
  return ALLOWED_MAP_EMBED_HOSTS.some((host) => hostname === host || hostname.endsWith(`.${host}`));
}

/**
 * O usuário pode colar a URL de embed pura (`https://www.google.com/maps/embed?...`)
 * ou o código `<iframe>` completo que o Google Maps oferece em "Compartilhar >
 * Incorporar um mapa" — extraímos o `src` por regex (sem parser de HTML nem
 * `dangerouslySetInnerHTML`) e só aceitamos destinos do domínio do Google Maps,
 * nunca um iframe arbitrário colado pelo usuário.
 */
export function extractMapEmbedUrl(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  const iframeMatch = trimmed.match(/<iframe[^>]*\ssrc=["']([^"']+)["']/i);
  const candidate = iframeMatch ? iframeMatch[1] : trimmed;
  const url = normalizeUrl(candidate);

  try {
    const parsed = new URL(url);
    return isAllowedMapHost(parsed.hostname) ? url : null;
  } catch {
    return null;
  }
}
