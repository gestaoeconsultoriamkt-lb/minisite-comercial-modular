/**
 * Regra da senha TEMPORÁRIA (criada/redefinida pelo admin em
 * Configurações > Usuários): exatamente 8 dígitos numéricos. Usada tanto no
 * servidor (validação de verdade) quanto no cliente (feedback imediato) —
 * nunca duplicada como regex solta em cada arquivo que precisa validar.
 */
export const PASSWORD_PATTERN = /^\d{8}$/;

export function isValidPassword(value: unknown): value is string {
  return typeof value === "string" && PASSWORD_PATTERN.test(value);
}

/**
 * Regra da senha DEFINITIVA — a que o próprio usuário escolhe, seja na
 * troca obrigatória do primeiro acesso ou trocando a senha por conta
 * própria (ver /api/account/set-new-password): mínimo de 10 caracteres,
 * sem exigir só dígitos (diferente da temporária, de propósito — a
 * temporária continua simples porque o admin só a usa uma vez).
 */
export const MIN_DEFINITIVE_PASSWORD_LENGTH = 10;

export const DEFINITIVE_PASSWORD_MESSAGE = `A nova senha deve ter no mínimo ${MIN_DEFINITIVE_PASSWORD_LENGTH} caracteres.`;

export function isValidDefinitivePassword(value: unknown): value is string {
  return typeof value === "string" && value.length >= MIN_DEFINITIVE_PASSWORD_LENGTH;
}
