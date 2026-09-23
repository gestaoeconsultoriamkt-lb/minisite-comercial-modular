import { Hono } from "hono";
import { authRoutes } from "./routes/auth";
import { bootstrapRoutes } from "./routes/bootstrap";
import { healthRoutes } from "./routes/health";
import { mediaRoutes } from "./routes/media";
import { minisitesRoutes } from "./routes/minisites";
import { previewRoutes } from "./routes/preview";
import { publicRoutes } from "./routes/public";
import { uploadsRoutes } from "./routes/uploads";
import { requireAuth, requireBootstrapOpen, redirectIfAuthenticated, serveAssets } from "./middleware/authGuards";
import { getSession } from "./auth/session";
import type { AppEnv } from "./types";

/**
 * `assets.run_worker_first = true` (wrangler.jsonc) faz TODO request passar
 * por este app primeiro — inclusive os próprios arquivos estáticos do admin
 * (build de produção em /assets/* e, em dev, os módulos servidos ao vivo
 * pelo Vite em /@vite/*, /@react-refresh e /src/*). Nada disso é servido
 * automaticamente; precisa ser delegado a ASSETS explicitamente, senão cai
 * no catch-all de `/:slug` e 404. Separação conceitual de rotas:
 *   /api/*                    -> Hono (health, auth, bootstrap-status)
 *   /media/*                   -> Hono lendo do binding R2
 *   /assets/*, /@vite/*,
 *   /@react-refresh, /src/*,
 *   /node_modules/*             -> ASSETS (bundle/módulos do admin)
 *   /login, /cadastro,
 *   /esqueci-senha,
 *   /redefinir-senha, /app/*    -> SPA (ASSETS), com guards de sessão/bootstrap
 *   /preview/:id                -> SSR do DRAFT, só para o dono autenticado
 *   /:slug                      -> SSR público (spike da Fase 0)
 * Ordem importa: rotas específicas antes do catch-all de slug. "preview" é
 * slug reservado (ver reservedSlugs.ts) então não há colisão possível com
 * o slug de um MiniSite real.
 */
const app = new Hono<AppEnv>();

app.route("/api", healthRoutes);
app.route("/api", authRoutes);
app.route("/api", bootstrapRoutes);
app.route("/api", minisitesRoutes);
app.route("/api", uploadsRoutes);
app.route("/", mediaRoutes);

app.get("/assets/*", serveAssets);
app.get("/@vite/*", serveAssets);
app.get("/@react-refresh", serveAssets);
app.get("/src/*", serveAssets);
app.get("/node_modules/*", serveAssets);

app.get("/login", redirectIfAuthenticated, serveAssets);
app.get("/cadastro", requireBootstrapOpen, redirectIfAuthenticated, serveAssets);
app.get("/esqueci-senha", serveAssets);
app.get("/redefinir-senha", serveAssets);
app.get("/redefinir-senha/*", serveAssets);

app.all("/app", requireAuth, serveAssets);
app.all("/app/*", requireAuth, serveAssets);

app.get("/", async (c) => {
  const session = await getSession(c.env, c.req.raw);
  return c.redirect(session ? "/app/minisites" : "/login", 302);
});

app.route("/", previewRoutes);
app.route("/", publicRoutes);

export default app;
