/**
 * Aceita URLs digitadas sem protocolo (ex.: "meusite.com.br"). Sem isso, o
 * navegador trata o valor como caminho relativo do próprio app admin/SSR
 * (`<a href="meusite.com">` dentro de `https://app.../algo` navega para
 * `https://app.../meusite.com`, não para o site externo) — era a causa do
 * "link personalizado abre dentro do próprio app".
 */
export function normalizeUrl(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return "";
  // Já tem um scheme (http:, https:, mailto:, tel:...) — não tocar.
  if (/^[a-z][a-z0-9+.-]*:/i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}
