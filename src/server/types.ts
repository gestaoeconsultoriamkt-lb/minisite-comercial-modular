/**
 * Bindings/variáveis do Worker, conforme declarados em wrangler.jsonc.
 * Secrets (BETTER_AUTH_SECRET, BREVO_API_KEY etc.) são injetados via
 * `.dev.vars` local ou `wrangler secret put` em produção — nunca aqui.
 */
export interface Bindings {
  DB: D1Database;
  MEDIA_BUCKET: R2Bucket;
  ASSETS: Fetcher;

  APP_ENV: string;

  BETTER_AUTH_SECRET?: string;
  BETTER_AUTH_URL?: string;

  BREVO_API_KEY?: string;
  BREVO_SENDER_EMAIL?: string;
  BREVO_SENDER_NAME?: string;
}

export interface AppEnv {
  Bindings: Bindings;
}
