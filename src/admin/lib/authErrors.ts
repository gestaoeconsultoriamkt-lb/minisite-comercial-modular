interface AuthLikeError {
  code?: string | null;
  message?: string | null;
}

const MESSAGES: Record<string, string> = {
  INVALID_EMAIL_OR_PASSWORD: "E-mail ou senha incorretos.",
  USER_NOT_FOUND: "E-mail ou senha incorretos.",
  EMAIL_NOT_VERIFIED: "Confirme seu e-mail antes de entrar.",
  USER_ALREADY_EXISTS: "Este e-mail já está cadastrado.",
  // Código real emitido pelo endpoint de sign-up (ver
  // node_modules/better-auth/dist/api/routes/sign-up.mjs) — `USER_ALREADY_EXISTS`
  // sozinho é de outro plugin (admin) e nunca é lançado neste fluxo.
  USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL: "Este e-mail já está cadastrado.",
  PASSWORD_TOO_SHORT: "A senha é muito curta.",
  PASSWORD_TOO_LONG: "A senha é muito longa.",
  INVALID_TOKEN: "Link inválido ou expirado. Solicite um novo.",
  INVALID_PASSWORD: "A senha deve conter exatamente 8 números.",
};

export function translateAuthError(error: AuthLikeError | null | undefined): string {
  if (!error) return "Ocorreu um erro inesperado. Tente novamente.";
  if (error.code && MESSAGES[error.code]) return MESSAGES[error.code];
  return error.message || "Ocorreu um erro inesperado. Tente novamente.";
}
