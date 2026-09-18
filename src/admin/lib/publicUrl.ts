/**
 * URL pública do MiniSite, centralizada aqui. Sem domínio próprio ainda —
 * usa a origem atual da aplicação (ver getAssetUrl em src/shared para o
 * mesmo princípio aplicado a mídia).
 */
export function getPublicMiniSiteUrl(slug: string): string {
  return `${window.location.origin}/${slug}`;
}

/** Versão curta (host + caminho) para exibição, sem o protocolo. */
export function getPublicMiniSiteDisplayUrl(slug: string): string {
  return `${window.location.host}/${slug}`;
}
