import { Hono } from "hono";
import { and, desc, eq, ne } from "drizzle-orm";
import { getDb } from "../db";
import { minisites, type MiniSiteRow } from "../db/schema";
import { ensurePublishedSnapshot, hasPublishedSnapshot } from "../db/publishedSnapshot";
import { requireApiAuth } from "../middleware/authGuards";
import { createMiniSiteInputSchema, patchMiniSiteInputSchema } from "../../shared/schemas/minisiteApi";
import { createDefaultMiniSiteConfig, migrateMiniSiteConfig, serializeMiniSiteConfig } from "../../shared/schemas/migrateMiniSiteConfig";
import { isReservedSlug, isValidSlugFormat } from "../../shared/reservedSlugs";
import { computePublishChecklist } from "../../shared/publishability";
import type { AppEnv } from "../types";

/**
 * `true` quando o draft (`config_json`) difere do snapshot publicado —
 * a base da indicação "Alterações não publicadas" na Tela de Layout.
 * MiniSites em `draft` (nunca publicados) não entram nessa conta: ainda
 * não existe "publicado" para comparar, então o indicador ficaria confuso
 * — o CTA natural ali já é simplesmente "Publicar".
 */
function computeHasUnpublishedChanges(row: MiniSiteRow): boolean {
  if (row.status === "draft") return false;
  if (!hasPublishedSnapshot(row)) return true;
  try {
    const draft = migrateMiniSiteConfig(row.configJson, row.configVersion).config;
    const published = migrateMiniSiteConfig(row.publishedConfigJson, row.publishedConfigVersion).config;
    return JSON.stringify(draft) !== JSON.stringify(published);
  } catch {
    return true;
  }
}

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

function toDetail(row: MiniSiteRow) {
  // Editor/preview leem sempre o DRAFT — nunca o snapshot publicado.
  const { config } = migrateMiniSiteConfig(row.configJson, row.configVersion);
  return {
    id: row.id,
    slug: row.slug,
    internalName: row.internalName,
    niche: row.niche,
    status: row.status,
    config,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    publishedAt: row.publishedAt,
    hasUnpublishedChanges: computeHasUnpublishedChanges(row),
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

export function findOwned(db: ReturnType<typeof getDb>, id: string, ownerUserId: string) {
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

// GET /api/minisites/:id — detalhe completo (com config), usado pelo Editor.
minisitesRoutes.get("/minisites/:id", async (c) => {
  const db = getDb(c.env);
  const row = await findOwned(db, c.req.param("id"), c.get("userId"));
  if (!row) return c.json({ code: "NOT_FOUND", message: "MiniSite não encontrado." }, 404);
  const ensured = await ensurePublishedSnapshot(db, row);
  return c.json({ minisite: toDetail(ensured) });
});

// PATCH /api/minisites/:id — autosave/edição. Só atualiza os campos enviados,
// e sempre no DRAFT (config_json) — nunca toca no snapshot publicado.
minisitesRoutes.patch("/minisites/:id", async (c) => {
  const db = getDb(c.env);
  let owned = await findOwned(db, c.req.param("id"), c.get("userId"));
  if (!owned) return c.json({ code: "NOT_FOUND", message: "MiniSite não encontrado." }, 404);
  // Backfill ANTES de aplicar o patch: se este MiniSite ainda não tem
  // snapshot, o snapshot formalizado aqui precisa ser o estado de ANTES
  // desta edição (o que estava realmente no ar), nunca incluir a edição
  // que está para ser salva.
  owned = await ensurePublishedSnapshot(db, owned);

  const body = await c.req.json().catch(() => null);
  const parsed = patchMiniSiteInputSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ code: "INVALID_INPUT", message: parsed.error.issues[0]?.message ?? "Dados inválidos." }, 400);
  }
  const { internalName, niche, slug, config } = parsed.data;

  const patch: Partial<typeof minisites.$inferInsert> = { updatedAt: new Date().toISOString() };
  if (internalName !== undefined) patch.internalName = internalName;
  if (niche !== undefined) patch.niche = niche;
  if (config !== undefined) {
    const serialized = serializeMiniSiteConfig(config);
    patch.configJson = serialized.configJson;
    patch.configVersion = serialized.configVersion;
  }

  if (slug !== undefined && slug !== owned.slug) {
    if (!isValidSlugFormat(slug) || isReservedSlug(slug)) {
      return c.json({ code: "SLUG_RESERVED", message: "Este endereço não pode ser usado. Escolha outro." }, 400);
    }
    if (await slugExists(db, slug, owned.id)) {
      return c.json({ code: "SLUG_TAKEN", message: "Esse endereço já está em uso. Escolha outro." }, 409);
    }
    patch.slug = slug;
  }

  try {
    await db.update(minisites).set(patch).where(eq(minisites.id, owned.id));
  } catch (error) {
    if (error instanceof Error && error.message.includes("UNIQUE")) {
      return c.json({ code: "SLUG_TAKEN", message: "Esse endereço já está em uso. Escolha outro." }, 409);
    }
    throw error;
  }

  const updated = await findOwned(db, owned.id, c.get("userId"));
  return c.json({ minisite: toDetail(updated!) });
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

// POST /api/minisites/:id/publish — promove o DRAFT atual a snapshot
// publicado; draft/disabled -> active. Ação explícita do usuário, é a
// ÚNICA rota que escreve em published_config_json/published_config_version
// (fora do backfill de compatibilidade — ver ensurePublishedSnapshot).
minisitesRoutes.post("/minisites/:id/publish", async (c) => {
  const db = getDb(c.env);
  const owned = await findOwned(db, c.req.param("id"), c.get("userId"));
  if (!owned) return c.json({ code: "NOT_FOUND", message: "MiniSite não encontrado." }, 404);

  const { config } = migrateMiniSiteConfig(owned.configJson, owned.configVersion);
  const checklist = computePublishChecklist({ internalName: owned.internalName, slug: owned.slug, config });
  if (!checklist.canPublish) {
    return c.json(
      { code: "CHECKLIST_BLOCKED", message: `Não é possível publicar: ${checklist.blockers.join(", ")}.` },
      400,
    );
  }

  const now = new Date().toISOString();
  const patch: Partial<typeof minisites.$inferInsert> = {
    status: "active",
    updatedAt: now,
    publishedConfigJson: owned.configJson,
    publishedConfigVersion: owned.configVersion,
  };
  if (!owned.publishedAt) patch.publishedAt = now; // preserva published_at original em republicações

  await db.update(minisites).set(patch).where(eq(minisites.id, owned.id));
  const updated = await findOwned(db, owned.id, c.get("userId"));
  return c.json({ minisite: toDetail(updated!) });
});

// POST /api/minisites/:id/disable — active -> disabled. Não apaga dado nem published_at.
minisitesRoutes.post("/minisites/:id/disable", async (c) => {
  const db = getDb(c.env);
  const owned = await findOwned(db, c.req.param("id"), c.get("userId"));
  if (!owned) return c.json({ code: "NOT_FOUND", message: "MiniSite não encontrado." }, 404);

  await db
    .update(minisites)
    .set({ status: "disabled", updatedAt: new Date().toISOString() })
    .where(eq(minisites.id, owned.id));
  const updated = await findOwned(db, owned.id, c.get("userId"));
  return c.json({ minisite: toDetail(updated!) });
});

// POST /api/minisites/:id/reactivate — disabled -> active. Mantém published_at original.
minisitesRoutes.post("/minisites/:id/reactivate", async (c) => {
  const db = getDb(c.env);
  const owned = await findOwned(db, c.req.param("id"), c.get("userId"));
  if (!owned) return c.json({ code: "NOT_FOUND", message: "MiniSite não encontrado." }, 404);

  await db
    .update(minisites)
    .set({ status: "active", updatedAt: new Date().toISOString() })
    .where(eq(minisites.id, owned.id));
  const updated = await findOwned(db, owned.id, c.get("userId"));
  return c.json({ minisite: toDetail(updated!) });
});

// DELETE /api/minisites/:id
minisitesRoutes.delete("/minisites/:id", async (c) => {
  const db = getDb(c.env);
  const owned = await findOwned(db, c.req.param("id"), c.get("userId"));
  if (!owned) return c.json({ code: "NOT_FOUND", message: "MiniSite não encontrado." }, 404);

  await db.delete(minisites).where(eq(minisites.id, owned.id));
  return c.json({ status: "ok" });
});
