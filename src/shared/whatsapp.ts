/** Gera a URL wa.me a partir de um telefone (qualquer formatação) e mensagem opcional. */
export function buildWhatsAppUrl(phone: string, message?: string): string {
  const digits = phone.replace(/\D/g, "");
  const query = message?.trim() ? `?text=${encodeURIComponent(message.trim())}` : "";
  return `https://wa.me/${digits}${query}`;
}
