import { Hono } from "hono";
import { getDb } from "../db";
import { requireApiAuth } from "../middleware/authGuards";
import { findOwned } from "./minisites";
import { uploadPurposeSchema } from "../../shared/schemas/minisiteApi";
import type { AppEnv } from "../types";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const SIGNATURES: { mime: string; ext: string; check: (bytes: Uint8Array) => boolean }[] = [
  { mime: "image/png", ext: "png", check: (b) => b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47 },
  { mime: "image/jpeg", ext: "jpg", check: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  {
    mime: "image/webp",
    ext: "webp",
    check: (b) =>
      b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 && b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50,
  },
];

function detectImageType(bytes: Uint8Array): { mime: string; ext: string } | null {
  const match = SIGNATURES.find((sig) => sig.check(bytes));
  return match ? { mime: match.mime, ext: match.ext } : null;
}

export const uploadsRoutes = new Hono<AppEnv>();
uploadsRoutes.use("*", requireApiAuth);

/**
 * Upload real para o R2, usado por logo/capa/fundo/galeria/cards/seções do
 * editor. Convenção de key: `minisites/{id}/{purpose}/{uuid}.{ext}` — a
 * entrega continua pela rota `/media/*` já existente (ver getAssetUrl).
 */
uploadsRoutes.post("/uploads", async (c) => {
  const formData = await c.req.formData().catch(() => null);
  if (!formData) return c.json({ code: "INVALID_INPUT", message: "Envio inválido." }, 400);

  const minisiteId = formData.get("minisiteId");
  const purposeRaw = formData.get("purpose");
  const file = formData.get("file");

  if (typeof minisiteId !== "string" || !minisiteId) {
    return c.json({ code: "INVALID_INPUT", message: "minisiteId ausente." }, 400);
  }
  const purposeParsed = uploadPurposeSchema.safeParse(purposeRaw);
  if (!purposeParsed.success) {
    return c.json({ code: "INVALID_INPUT", message: "Finalidade de upload inválida." }, 400);
  }
  if (!(file instanceof File)) {
    return c.json({ code: "INVALID_INPUT", message: "Arquivo ausente." }, 400);
  }
  if (file.size === 0 || file.size > MAX_FILE_SIZE) {
    return c.json({ code: "FILE_TOO_LARGE", message: "Imagem deve ter no máximo 5MB." }, 400);
  }

  const db = getDb(c.env);
  const owned = await findOwned(db, minisiteId, c.get("userId"));
  if (!owned) return c.json({ code: "NOT_FOUND", message: "MiniSite não encontrado." }, 404);

  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer.slice(0, 16));
  const detected = detectImageType(bytes);
  if (!detected) {
    return c.json({ code: "INVALID_FILE_TYPE", message: "Envie uma imagem PNG, JPG ou WebP." }, 400);
  }

  const key = `minisites/${minisiteId}/${purposeParsed.data}/${crypto.randomUUID()}.${detected.ext}`;
  await c.env.MEDIA_BUCKET.put(key, buffer, { httpMetadata: { contentType: detected.mime } });

  return c.json({ key }, 201);
});
