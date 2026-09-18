/**
 * Ponto único de construção de URL de mídia. Hoje os arquivos do R2 são
 * entregues pela rota `/media/*` do próprio Worker (sem domínio próprio
 * ainda). Quando houver um domínio custom apontando direto para o bucket
 * R2, só esta função muda — nenhum componente que a usa precisa ser tocado.
 */
export function getAssetUrl(key: string): string {
  const normalizedKey = key.replace(/^\/+/, "");
  return `/media/${normalizedKey}`;
}
