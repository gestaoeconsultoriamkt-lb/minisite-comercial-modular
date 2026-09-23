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

export const sectionImageSchema = z.object({
  id: z.string(),
  imageKey: z.string(),
  /** Nome curto opcional (ex.: "Pizza de Chocolate"). */
  label: z.string().optional(),
  price: z.number().nonnegative().optional(),
  position: z.number().int().nonnegative(),
});

export const sectionSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  /** @deprecated Geração 1 (uma imagem só). Substituído por `images`. Só leitura — ver getSectionImageItems(). */
  imageKey: z.string().optional(),
  /** @deprecated Geração 2 (array de chaves, sem metadados). Substituído por `images`. Só leitura — ver getSectionImageItems(). */
  imageKeys: z.array(z.string()).default([]),
  /** Geração atual: imagens com metadados opcionais (nome/preço) — a unidade visual principal da seção. */
  images: z.array(sectionImageSchema).default([]),
  /** Controla a exibição do preço nas imagens desta seção. */
  showPrices: z.boolean().default(true),
  /** @deprecated Estrutura de Item (cards com CTA) removida do fluxo visual/editor. Campo mantido só para não apagar dados antigos. */
  showCta: z.boolean().default(true),
  position: z.number().int().nonnegative(),
  /** @deprecated Estrutura de Item (cards com imagem/descrição/CTA) removida do fluxo visual/editor. Campo mantido só para não apagar dados antigos. */
  cards: z.array(cardSchema).default([]),
});

export const galleryImageSchema = z.object({
  id: z.string(),
  imageKey: z.string(),
  position: z.number().int().nonnegative(),
  alt: z.string().optional(),
});

/**
 * Guarda o valor bruto digitado (@handle, domínio sem protocolo ou URL
 * completa) — não força `z.url()` porque o campo aceita handle puro
 * (ex.: "@leandrobertholini"), que não é uma URL válida por si só. A
 * normalização/resolução para uma URL absoluta acontece só no ponto de
 * uso (ver src/shared/socialLinks.ts), igual ao padrão dos botões de ação.
 */
export const socialLinksSchema = z
  .object({
    instagram: z.string().optional(),
    facebook: z.string().optional(),
    tiktok: z.string().optional(),
    kwai: z.string().optional(),
    youtube: z.string().optional(),
    linkedin: z.string().optional(),
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

/**
 * @deprecated V1 simplificou para um único comportamento efetivo: imagem
 * nítida quando há `backgroundKey`, gradiente da marca quando não há — ver
 * `MiniSiteRenderer`, que não lê mais este campo (sem selector no editor).
 * Mantido só para não descartar o valor de configs salvos antes dessa
 * simplificação — nenhuma migração destrutiva.
 */
export const backgroundModeSchema = z.enum(["solid", "image", "image_blurred"]);

/**
 * @deprecated V1 simplificou para um único comportamento efetivo: corpo
 * sempre sólido — ver `MiniSiteRenderer`, que não lê mais este campo (sem
 * selector no editor, modo "acrylic" removido da interface). Mantido só
 * para não descartar o valor de configs salvos antes dessa simplificação.
 */
export const bodyStyleSchema = z.enum(["solid", "acrylic"]);

export const logoPositionSchema = z.enum(["over_cover", "floating"]);

export const heroShapeSchema = z.enum(["straight", "curve", "wave"]);

/**
 * `plate` (placa branca por trás da logo) é o comportamento visual que já
 * existia — default seguro para configs antigas. `none` deixa a logo
 * "solta" sobre a capa/fundo, sem placa — útil para logos que já têm fundo
 * próprio (branco, circular, sólido) e não precisam de suporte.
 */
export const logoTreatmentSchema = z.enum(["plate", "none"]);

export const appearanceSchema = z
  .object({
    logoKey: z.string().optional(),
    coverKey: z.string().optional(),
    backgroundKey: z.string().optional(),
    colorPrimary: hexColor.optional(),
    colorSecondary: hexColor.optional(),
    /** Fundo de TODOS os botões (ação e redes sociais) — visual único da marca. */
    colorButtonBackground: hexColor.optional(),
    colorButtonText: hexColor.optional(),
    backgroundMode: backgroundModeSchema.default("image_blurred"),
    bodyStyle: bodyStyleSchema.default("solid"),
    logoPosition: logoPositionSchema.default("over_cover"),
    heroShape: heroShapeSchema.default("straight"),
    logoTreatment: logoTreatmentSchema.default("plate"),
  })
  .default({
    backgroundMode: "image_blurred",
    bodyStyle: "solid",
    logoPosition: "over_cover",
    heroShape: "straight",
    logoTreatment: "plate",
  });

export const footerSchema = z
  .object({
    showSocialIcons: z.boolean().default(true),
  })
  .default({ showSocialIcons: true });

/** Cabeçalho opcional da Galeria — mesmo padrão visual (ícone + título + divisor) das seções do catálogo. */
export const galleryHeadingSchema = z
  .object({
    title: z.string().default("Galeria"),
    show: z.boolean().default(true),
  })
  .default({ title: "Galeria", show: true });

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
  galleryHeading: galleryHeadingSchema,
  sections: z.array(sectionSchema).default([]),
  footer: footerSchema,
  moduleOrder: z.array(z.string()).default([]),
});

export type MiniSiteConfig = z.infer<typeof miniSiteConfigSchema>;
export type MiniSiteButton = z.infer<typeof buttonSchema>;
export type MiniSiteSection = z.infer<typeof sectionSchema>;
export type MiniSiteSectionImage = z.infer<typeof sectionImageSchema>;
export type MiniSiteCard = z.infer<typeof cardSchema>;
export type MiniSiteGalleryHeading = z.infer<typeof galleryHeadingSchema>;
export type MiniSiteLocation = NonNullable<z.infer<typeof locationSchema>>;
export type MiniSitePix = NonNullable<z.infer<typeof pixSchema>>;
export type MiniSiteWifi = NonNullable<z.infer<typeof wifiSchema>>;
export type MiniSiteSocialLinks = z.infer<typeof socialLinksSchema>;
export type MiniSiteButtonType = z.infer<typeof buttonTypeSchema>;
export type MiniSiteBackgroundMode = z.infer<typeof backgroundModeSchema>;
export type MiniSiteBodyStyle = z.infer<typeof bodyStyleSchema>;
export type MiniSiteLogoPosition = z.infer<typeof logoPositionSchema>;
export type MiniSiteHeroShape = z.infer<typeof heroShapeSchema>;
export type MiniSiteLogoTreatment = z.infer<typeof logoTreatmentSchema>;
