import { Hono } from "hono";
import { and, desc, eq, ne } from "drizzle-orm";
import { getDb } from "../db";
import { minisites, type MiniSiteRow } from "../db/schema";
import { requireApiAuth } from "../middleware/authGuards";
import { createMiniSiteInputSchema } from "../../shared/schemas/minisiteApi";
import { createDefaultMiniSiteConfig, migrateMiniSiteConfig, serializeMiniSiteConfig } from "../../shared/schemas/migrateMiniSiteConfig";
import { isReservedSlug, isValidSlugFormat } from "../../shared/reservedSlugs";
import type { AppEnv } from "../types";

export const minisitesRoutes = new Hono<AppEnv>();
// Todas as rotas deste router são /api/minisites*, então autenticar tudo aqui é suficiente.
minisitesRoutes.use("*", requireApiAuth);

function toListItem(row: MiniSiteRow) {
  const { config } = migrateMiniSiteConfig(row.configJson, row.configVersion);
  return {
    id: row.id,
    slug: row.slug,
    internalName: row.internalName,
    niche: row.niche,
    status: row.status,
    displayName: config.header.displayName ?? null,
    headline: config.header.headline ?? null,
    shortDescription: config.header.shortDescription ?? null,
    coverKey: config.appearance.coverKey ?? null,
    logoKey: config.appearance.logoKey ?? null,
    colorPrimary: config.appearance.colorPrimary ?? null,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    publishedAt: row.publishedAt,
  };
}

async function slugExists(db: ReturnType<typeof getDb>, slug: string, excludeId?: string) {
  const rows = await db
    .select({ id: minisites.id })
    .from(minisites)
    .where(excludeId ? and(eq(minisites.slug, slug), ne(minisites.id, excludeId)) : eq(minisites.slug, slug))
    .limit(1);
  return rows.length > 0;
}

async function generateUniqueSlug(db: ReturnType<typeof getDb>, baseSlug: string) {
  let candidate = `${baseSlug}-copia`;
  let attempt = 2;
  while ((await slugExists(db, candidate)) && attempt < 100) {
    candidate = `${baseSlug}-copia-${attempt}`;
    attempt += 1;
  }
  return candidate;
}

function findOwned(db: ReturnType<typeof getDb>, id: string, ownerUserId: string) {
  return db
    .select()
    .from(minisites)
    .where(and(eq(minisites.id, id), eq(minisites.ownerUserId, ownerUserId)))
    .limit(1)
    .then((rows) => rows[0] ?? null);
}

// GET /api/minisites — todos os MiniSites do usuário autenticado.
minisitesRoutes.get("/minisites", async (c) => {
  const db = getDb(c.env);
  const ownerUserId = c.get("userId");
  const rows = await db
    .select()
    .from(minisites)
    .where(eq(minisites.ownerUserId, ownerUserId))
    .orderBy(desc(minisites.updatedAt));
  return c.json({ minisites: rows.map(toListItem) });
});

// GET /api/minisites/:id — usado pela página placeholder do editor.
minisitesRoutes.get("/minisites/:id", async (c) => {
  const db = getDb(c.env);
  const row = await findOwned(db, c.req.param("id"), c.get("userId"));
  if (!row) return c.json({ code: "NOT_FOUND", message: "MiniSite não encontrado." }, 404);
  return c.json({ minisite: toListItem(row) });
});

// POST /api/minisites — cria um novo MiniSite em rascunho.
minisitesRoutes.post("/minisites", async (c) => {
  const body = await c.req.json().catch(() => null);
  const parsed = createMiniSiteInputSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ code: "INVALID_INPUT", message: parsed.error.issues[0]?.message ?? "Dados inválidos." }, 400);
  }
  const { internalName, niche, slug, displayName } = parsed.data;

  if (!isValidSlugFormat(slug) || isReservedSlug(slug)) {
    return c.json({ code: "SLUG_RESERVED", message: "Este endereço não pode ser usado. Escolha outro." }, 400);
  }

  const db = getDb(c.env);
  if (await slugExists(db, slug)) {
    return c.json({ code: "SLUG_TAKEN", message: "Esse endereço já está em uso. Escolha outro." }, 409);
  }

  const config = createDefaultMiniSiteConfig();
  if (displayName) config.header.displayName = displayName;
  const { configJson, configVersion } = serializeMiniSiteConfig(config);
  const now = new Date().toISOString();

  const row: typeof minisites.$inferInsert = {
    id: crypto.randomUUID(),
    ownerUserId: c.get("userId"),
    slug,
    internalName,
    niche,
    status: "draft",
    configJson,
    configVersion,
    createdAt: now,
    updatedAt: now,
    publishedAt: null,
  };

  try {
    await db.insert(minisites).values(row);
  } catch (error) {
    if (error instanceof Error && error.message.includes("UNIQUE")) {
      return c.json({ code: "SLUG_TAKEN", message: "Esse endereço já está em uso. Escolha outro." }, 409);
    }
    throw error;
  }

  return c.json({ minisite: toListItem(row as MiniSiteRow) }, 201);
});

// POST /api/minisites/:id/duplicate — copia config/nicho, novo slug, status draft.
minisitesRoutes.post("/minisites/:id/duplicate", async (c) => {
  const db = getDb(c.env);
  const original = await findOwned(db, c.req.param("id"), c.get("userId"));
  if (!original) return c.json({ code: "NOT_FOUND", message: "MiniSite não encontrado." }, 404);

  const newSlug = await generateUniqueSlug(db, original.slug);
  const now = new Date().toISOString();

  const row: typeof minisites.$inferInsert = {
    id: crypto.randomUUID(),
    ownerUserId: original.ownerUserId,
    slug: newSlug,
    internalName: `${original.internalName} (Cópia)`,
    niche: original.niche,
    status: "draft",
    configJson: original.configJson,
    configVersion: original.configVersion,
    createdAt: now,
    updatedAt: now,
    publishedAt: null,
  };

  await db.insert(minisites).values(row);
  return c.json({ minisite: toListItem(row as MiniSiteRow) }, 201);
});

// DELETE /api/minisites/:id
minisitesRoutes.delete("/minisites/:id", async (c) => {
  const db = getDb(c.env);
  const owned = await findOwned(db, c.req.param("id"), c.get("userId"));
  if (!owned) return c.json({ code: "NOT_FOUND", message: "MiniSite não encontrado." }, 404);

  await db.delete(minisites).where(eq(minisites.id, owned.id));
  return c.json({ status: "ok" });
});
