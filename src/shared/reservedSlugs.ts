/**
 * Lista central de slugs reservados. Usada na validação de criação/edição de
 * slug (server) e pode ser reaproveitada no formulário do editor (client).
 * Qualquer nova rota de nível raiz (ex: "/app", "/api") precisa ser
 * adicionada aqui para não colidir com o slug público de um MiniSite.
 */
export const RESERVED_SLUGS = [
  "app",
  "api",
  "media",
  "assets",
  "admin",
  "login",
  "logout",
  "cadastro",
  "register",
  "signup",
  "minisites",
  "preview",
  "status",
  "health",
  "esqueci-senha",
  "redefinir-senha",
  "forgot-password",
  "reset-password",
] as const;

const RESERVED_SLUGS_SET = new Set<string>(RESERVED_SLUGS);

export function isReservedSlug(slug: string): boolean {
  return RESERVED_SLUGS_SET.has(slug.toLowerCase());
}

/** Formato aceito para slugs: minúsculas, números e hífen, 3–50 caracteres. */
export const SLUG_PATTERN = /^[a-z0-9-]{3,50}$/;

export function isValidSlugFormat(slug: string): boolean {
  return SLUG_PATTERN.test(slug);
}
