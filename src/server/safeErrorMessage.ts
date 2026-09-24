/**
 * Extrai uma mensagem de erro segura para log (Observability/console) —
 * nunca o conteúdo bruto de um `config_json` (endereço, telefone, nome do
 * negócio). O driver D1/libsql do Drizzle embute os PARÂMETROS da query
 * na própria `Error.message` de uma query falha (`"Failed query: ...\n
 * params: <json completo>"`), então logar `error.message` cru vaza
 * exatamente os dados sensíveis que este arquivo existe pra evitar — corta
 * tudo a partir de `\nparams:` antes de logar.
 */
export function safeErrorMessage(error: unknown): string {
  const raw = error instanceof Error ? error.message : String(error);
  const paramsIndex = raw.indexOf("\nparams:");
  return paramsIndex === -1 ? raw : raw.slice(0, paramsIndex);
}
