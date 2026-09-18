import { z } from "zod";

/**
 * Shape versionado do `config_json` de `minisites`. Esta é a fonte única de
 * validação, usada tanto pelo editor (admin) quanto pelo SSR público (server).
 */
export const MINISITE_CONFIG_CURRENT_VERSION = 1;

const hexColor = z.string().regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, "Cor hexadecimal inválida");

export const buttonTypeSchema = z.enum([
  "agendar",
  "avaliar_google",
  "whatsapp",
  "site",
  "instagram",
  "pix",
  "wifi",
  "localizacao",
  "telefone",
  "link_personalizado",
  "social",
]);

export const buttonSchema = z.object({
  id: z.string(),
  type: buttonTypeSchema,
  label: z.string().min(1),
  icon: z.string().optional(),
  value: z.record(z.string(), z.unknown()).default({}),
  position: z.number().int().nonnegative(),
});

export const cardCtaTypeSchema = z.enum(["whatsapp", "url"]);

export const cardSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  description: z.string().optional(),
  price: z.number().nonnegative().optional(),
  imageKey: z.string().optional(),
  ctaType: cardCtaTypeSchema.optional(),
  ctaLabel: z.string().optional(),
  ctaTarget: z.string().optional(),
  whatsappMessage: z.string().optional(),
  position: z.number().int().nonnegative(),
});

export const sectionSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  imageKey: z.string().optional(),
  /** Controla a exibição de preço/CTA para os itens desta seção; o dado do item é preservado de todo modo. */
  showPrices: z.boolean().default(true),
  showCta: z.boolean().default(true),
  position: z.number().int().nonnegative(),
  cards: z.array(cardSchema).default([]),
});

export const galleryImageSchema = z.object({
  id: z.string(),
  imageKey: z.string(),
  position: z.number().int().nonnegative(),
  alt: z.string().optional(),
});

export const socialLinksSchema = z
  .object({
    instagram: z.url().optional(),
    facebook: z.url().optional(),
    tiktok: z.url().optional(),
    kwai: z.url().optional(),
    youtube: z.url().optional(),
    linkedin: z.url().optional(),
  })
  .default({});

export const pixSchema = z
  .object({
    keyType: z.enum(["cpf", "cnpj", "email", "telefone", "aleatoria"]),
    key: z.string().min(1),
    holderName: z.string().min(1),
  })
  .optional();

export const wifiSchema = z
  .object({
    ssid: z.string().min(1),
    password: z.string().optional(),
  })
  .optional();

export const locationSchema = z
  .object({
    address: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    /** Link "Abrir no Google Maps" — cole o link normal do Google Maps. */
    mapsUrl: z.string().optional(),
    /** URL de embed (iframe) opcional, se disponível. */
    mapEmbedUrl: z.string().optional(),
    lat: z.number().optional(),
    lng: z.number().optional(),
  })
  .optional();

export const appearanceSchema = z
  .object({
    logoKey: z.string().optional(),
    coverKey: z.string().optional(),
    backgroundKey: z.string().optional(),
    colorPrimary: hexColor.optional(),
    colorSecondary: hexColor.optional(),
    colorButtonText: hexColor.optional(),
  })
  .default({});

export const footerSchema = z
  .object({
    showSocialIcons: z.boolean().default(true),
  })
  .default({ showSocialIcons: true });

export const headerSchema = z
  .object({
    variant: z.enum(["highlight", "compact"]).default("highlight"),
    /** Nome exibido publicamente; cai para `internal_name` quando ausente. */
    displayName: z.string().optional(),
    headline: z.string().optional(),
    shortDescription: z.string().optional(),
  })
  .default({ variant: "highlight" });

/**
 * Shape completo do módulo. Todo campo é opcional exceto o mínimo estrutural
 * (arrays/objetos com default) — nenhum módulo é obrigatoriamente preenchido.
 */
export const miniSiteConfigSchema = z.object({
  appearance: appearanceSchema,
  header: headerSchema,
  buttons: z.array(buttonSchema).default([]),
  socialLinks: socialLinksSchema,
  pix: pixSchema,
  wifi: wifiSchema,
  location: locationSchema,
  gallery: z.array(galleryImageSchema).default([]),
  sections: z.array(sectionSchema).default([]),
  footer: footerSchema,
  moduleOrder: z.array(z.string()).default([]),
});

export type MiniSiteConfig = z.infer<typeof miniSiteConfigSchema>;
export type MiniSiteButton = z.infer<typeof buttonSchema>;
export type MiniSiteSection = z.infer<typeof sectionSchema>;
export type MiniSiteCard = z.infer<typeof cardSchema>;
export type MiniSiteLocation = NonNullable<z.infer<typeof locationSchema>>;
export type MiniSitePix = NonNullable<z.infer<typeof pixSchema>>;
export type MiniSiteWifi = NonNullable<z.infer<typeof wifiSchema>>;
export type MiniSiteSocialLinks = z.infer<typeof socialLinksSchema>;
export type MiniSiteButtonType = z.infer<typeof buttonTypeSchema>;
