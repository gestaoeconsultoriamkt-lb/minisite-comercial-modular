import { Hono } from "hono";
import { accountRoutes } from "./routes/account";
import { authRoutes } from "./routes/auth";
import { healthRoutes } from "./routes/health";
import { mediaRoutes } from "./routes/media";
import { minisitesRoutes } from "./routes/minisites";
import { previewRoutes } from "./routes/preview";
import { publicRoutes } from "./routes/public";
import { uploadsRoutes } from "./routes/uploads";
import { usersRoutes } from "./routes/users";
import { requireAuth, redirectIfAuthenticated, serveAssets } from "./middleware/authGuards";
import { renderHomePage } from "./render/renderHomePage";
import type { AppEnv } from "./types";

/**
 * `assets.run_worker_first = true` (wrangler.jsonc) faz TODO request passar
 * por este app primeiro — inclusive os próprios arquivos estáticos do admin
 * (build de produção em /assets/* e, em dev, os módulos servidos ao vivo
 * pelo Vite em /@vite/*, /@react-refresh e /src/*). Nada disso é servido
 * automaticamente; precisa ser delegado a ASSETS explicitamente, senão cai
 * no catch-all de `/:slug` e 404. Separação conceitual de rotas:
 *   /api/*                    -> Hono (health, auth, usuários)
 *   /media/*                   -> Hono lendo do binding R2
 *   /assets/*, /favicon.webp,
 *   /@vite/*, /@react-refresh,
 *   /src/*, /node_modules/*     -> ASSETS (bundle/módulos do admin)
 *   /login, /esqueci-senha,
 *   /redefinir-senha,
 *   /definir-senha, /app/*      -> SPA (ASSETS), com guards de sessão
 *   /                           -> landing page pública BioSystem (SSR,
 *                                  ver render/renderHomePage.tsx) — sempre
 *                                  a mesma, sem checar sessão
 *   /preview/:id                -> SSR do DRAFT, só para o dono autenticado
 *   /:slug                      -> SSR público (spike da Fase 0)
 * Ordem importa: rotas específicas antes do catch-all de slug. "preview" é
 * slug reservado (ver reservedSlugs.ts) então não há colisão possível com
 * o slug de um MiniSite real.
 *
 * Cadastro público FECHADO — não existe mais rota `/cadastro`. A única
 * forma de criar conta é o administrador em Configurações > Usuários (ver
 * routes/users.ts); qualquer visitante que tentar `/cadastro` cai no
 * catch-all de `/:slug` abaixo e recebe 404 ("cadastro" é slug reservado,
 * ver reservedSlugs.ts — nunca colide com um MiniSite real).
 */
const app = new Hono<AppEnv>();

app.route("/api", healthRoutes);
app.route("/api", authRoutes);
app.route("/api", minisitesRoutes);
app.route("/api", uploadsRoutes);
app.route("/api", usersRoutes);
app.route("/api", accountRoutes);
app.route("/", mediaRoutes);

app.get("/assets/*", serveAssets);
app.get("/favicon.webp", serveAssets);
app.get("/@vite/*", serveAssets);
app.get("/@react-refresh", serveAssets);
app.get("/src/*", serveAssets);
app.get("/node_modules/*", serveAssets);

app.get("/login", redirectIfAuthenticated, serveAssets);
app.get("/esqueci-senha", serveAssets);
app.get("/redefinir-senha", serveAssets);
app.get("/redefinir-senha/*", serveAssets);
app.get("/definir-senha", requireAuth, serveAssets);

app.all("/app", requireAuth, serveAssets);
app.all("/app/*", requireAuth, serveAssets);

// Landing page pública (BioSystem) — sempre a mesma pra qualquer visitante,
// autenticado ou não; "Entrar" leva pra /login, que já redireciona sozinho
// pra /app/minisites se a sessão já existir (ver redirectIfAuthenticated).
app.get("/", (c) => c.html(renderHomePage()));

app.route("/", previewRoutes);
app.route("/", publicRoutes);

export default app;
