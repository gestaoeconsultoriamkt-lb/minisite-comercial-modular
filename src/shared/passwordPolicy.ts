/**
 * Regra única de senha (temporária ou definitiva): exatamente 8 dígitos
 * numéricos. Usada tanto no servidor (validação de verdade) quanto no
 * cliente (feedback imediato) — nunca duplicada como regex solta em cada
 * arquivo que precisa validar senha.
 */
export const PASSWORD_PATTERN = /^\d{8}$/;

export function isValidPassword(value: unknown): value is string {
  return typeof value === "string" && PASSWORD_PATTERN.test(value);
}
