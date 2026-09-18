import { Hono } from "hono";
import { authRoutes } from "./routes/auth";
import { healthRoutes } from "./routes/health";
import { mediaRoutes } from "./routes/media";
import { publicRoutes } from "./routes/public";
import type { AppEnv } from "./types";

/**
 * `assets.run_worker_first = true` (wrangler.jsonc) faz TODO request passar
 * por este app primeiro. A separação conceitual de rotas é:
 *   /api/*    -> Hono (health, auth)
 *   /media/*  -> Hono lendo do binding R2
 *   /app/*    -> delegado ao binding ASSETS (build estático do admin/SPA)
 *   /:slug    -> SSR público (spike nesta fase)
 * Ordem importa: rotas específicas antes do catch-all de slug.
 */
const app = new Hono<AppEnv>();

app.route("/api", healthRoutes);
app.route("/api", authRoutes);
app.route("/", mediaRoutes);

app.get("/", (c) => c.env.ASSETS.fetch(c.req.raw));
app.all("/app", (c) => c.env.ASSETS.fetch(c.req.raw));
app.all("/app/*", (c) => c.env.ASSETS.fetch(c.req.raw));

app.route("/", publicRoutes);

export default app;
