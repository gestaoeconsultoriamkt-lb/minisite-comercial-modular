interface AuthLikeError {
  code?: string | null;
  message?: string | null;
}

const MESSAGES: Record<string, string> = {
  INVALID_EMAIL_OR_PASSWORD: "E-mail ou senha incorretos.",
  USER_NOT_FOUND: "E-mail ou senha incorretos.",
  EMAIL_NOT_VERIFIED: "Confirme seu e-mail antes de entrar.",
  USER_ALREADY_EXISTS: "Já existe uma conta com este e-mail.",
  PASSWORD_TOO_SHORT: "A senha é muito curta.",
  PASSWORD_TOO_LONG: "A senha é muito longa.",
  INVALID_TOKEN: "Link inválido ou expirado. Solicite um novo.",
  SIGNUP_DISABLED: "Cadastro público desabilitado: já existe um administrador cadastrado.",
};

export function translateAuthError(error: AuthLikeError | null | undefined): string {
  if (!error) return "Ocorreu um erro inesperado. Tente novamente.";
  if (error.code && MESSAGES[error.code]) return MESSAGES[error.code];
  return error.message || "Ocorreu um erro inesperado. Tente novamente.";
}
