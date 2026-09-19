import type { MiniSiteButton, MiniSiteButtonType, MiniSiteConfig } from "./schemas/miniSiteConfig";
import { buildWhatsAppUrl } from "./whatsapp";
import { normalizeUrl } from "./urls";

/**
 * Os 8 tipos de botão com editor dedicado nesta fase (V1). "localizacao" e
 * "instagram" já existem no schema/renderer mas são configurados nos blocos
 * "Como chegar" e "Redes sociais" — não duplicam controle aqui. "social" é
 * reservado para uso futuro de redes sociais como botão principal.
 */
export const EDITABLE_BUTTON_TYPES = [
  "agendar",
  "avaliar_google",
  "whatsapp",
  "site",
  "telefone",
  "pix",
  "wifi",
  "link_personalizado",
] as const satisfies readonly MiniSiteButtonType[];

export const BUTTON_TYPE_LABELS: Record<(typeof EDITABLE_BUTTON_TYPES)[number], string> = {
  agendar: "Agendar horário",
  avaliar_google: "Avaliar no Google",
  whatsapp: "WhatsApp",
  site: "Nosso Site",
  telefone: "Telefone",
  pix: "Chave Pix",
  wifi: "Acessar Wi-Fi",
  link_personalizado: "Link personalizado",
};

export function isButtonEnabled(button: MiniSiteButton | undefined): boolean {
  return Boolean(button && button.value.enabled !== false);
}

export function getButtonLabel(button: MiniSiteButton): string {
  const custom = typeof button.value.label === "string" ? button.value.label.trim() : "";
  if (custom) return custom;
  return BUTTON_TYPE_LABELS[button.type as (typeof EDITABLE_BUTTON_TYPES)[number]] ?? button.label;
}

/** Destino do botão. Pix/Wi-Fi não navegam — são revelados inline (ver renderer). */
export function getButtonHref(button: MiniSiteButton): string | null {
  const value = button.value;
  switch (button.type) {
    case "whatsapp": {
      const phone = typeof value.phone === "string" ? value.phone : "";
      if (!phone.trim()) return null;
      return buildWhatsAppUrl(phone, typeof value.message === "string" ? value.message : "");
    }
    case "telefone": {
      const phone = typeof value.phone === "string" ? value.phone.replace(/\D/g, "") : "";
      return phone ? `tel:${phone}` : null;
    }
    case "pix":
    case "wifi":
      return null;
    default: {
      const url = typeof value.url === "string" ? value.url.trim() : "";
      return url ? normalizeUrl(url) : null;
    }
  }
}

/** Um botão "conta" no MiniSite público só se estiver habilitado e tiver o mínimo de dado para funcionar. */
export function isButtonReady(button: MiniSiteButton, config: MiniSiteConfig): boolean {
  if (!isButtonEnabled(button)) return false;
  if (button.type === "pix") return Boolean(config.pix?.key);
  if (button.type === "wifi") return Boolean(config.wifi?.ssid);
  return Boolean(getButtonHref(button));
}

export function findButton(config: MiniSiteConfig, type: MiniSiteButtonType): MiniSiteButton | undefined {
  return config.buttons.find((b) => b.type === type);
}
