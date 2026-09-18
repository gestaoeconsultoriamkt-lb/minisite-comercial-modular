import { Hono } from "hono";
import type { AppEnv } from "../types";

/**
 * Entrega de mídia do R2 pelo próprio Worker — convenção `/media/*`,
 * enquanto não há domínio próprio para apontar direto ao bucket. Chaves são
 * uuid/imutáveis (upload novo = key nova), então o cache pode ser agressivo.
 * Migrar para um domínio custom no R2 no futuro só exige trocar
 * `getAssetUrl()` (src/shared/assetUrl.ts) — esta rota deixa de ser usada,
 * nenhum componente muda.
 */
export const mediaRoutes = new Hono<AppEnv>();

mediaRoutes.get("/media/*", async (c) => {
  const key = c.req.path.replace(/^\/media\//, "");
  if (!key) return c.notFound();

  const object = await c.env.MEDIA_BUCKET.get(key);
  if (!object) return c.notFound();

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("etag", object.httpEtag);
  headers.set("Cache-Control", "public, max-age=31536000, immutable");

  return new Response(object.body, { headers });
});
