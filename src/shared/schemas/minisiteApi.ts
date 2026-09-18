import { z } from "zod";
import { SLUG_PATTERN } from "../reservedSlugs";
import { miniSiteConfigSchema } from "./miniSiteConfig";

/** Payload de criação de MiniSite (modal "Novo MiniSite"). */
export const createMiniSiteInputSchema = z.object({
  internalName: z.string().trim().min(2, "Informe o nome interno do negócio").max(120),
  niche: z.string().trim().min(1, "Informe o nicho").max(80),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(SLUG_PATTERN, "Use apenas letras minúsculas, números e hífen (3–50 caracteres)"),
  displayName: z.string().trim().max(120).optional(),
});

export type CreateMiniSiteInput = z.infer<typeof createMiniSiteInputSchema>;

/** Payload do autosave/edição (PATCH). Todo campo é opcional — só envia o que mudou. */
export const patchMiniSiteInputSchema = z.object({
  internalName: z.string().trim().min(2, "Informe o nome interno do negócio").max(120).optional(),
  niche: z.string().trim().min(1, "Informe o nicho").max(80).optional(),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(SLUG_PATTERN, "Use apenas letras minúsculas, números e hífen (3–50 caracteres)")
    .optional(),
  config: miniSiteConfigSchema.optional(),
});

export type PatchMiniSiteInput = z.infer<typeof patchMiniSiteInputSchema>;

export const uploadPurposeSchema = z.enum(["logo", "cover", "background", "gallery", "card", "section"]);
export type UploadPurpose = z.infer<typeof uploadPurposeSchema>;
