import { eq } from "drizzle-orm";
import type { Database } from ".";
import { minisites, type MiniSiteRow } from "./schema";
import { safeErrorMessage } from "../safeErrorMessage";

/**
 * `true` só quando o snapshot publicado é utilizável de fato. Checagem
 * deliberadamente por `typeof`, não por `!== null`: um banco em que a
 * migration `0001_tricky_lockheed` (colunas `published_config_json`/
 * `published_config_version`) ainda não rodou devolve essas colunas como
 * `undefined` (coluna inexistente), não `null` (coluna existente e vazia).
 * `undefined !== null` é `true` em JS — um `!== null` sozinho tratava
 * "coluna nem existe" como "snapshot já existe", e o valor `undefined`
 * seguia até `migrateMiniSiteConfig`, que falha ao dar `JSON.parse` nele.
 * Causa raiz real do 500 em produção (`Pizzaria Dom Capelli`): D1 remoto
 * nunca recebeu essa migration, só o D1 local de cada sessão de dev.
 */
export function hasPublishedSnapshot(
  row: Pick<MiniSiteRow, "publishedConfigJson" | "publishedConfigVersion">,
): row is MiniSiteRow & { publishedConfigJson: string; publishedConfigVersion: number } {
  return typeof row.publishedConfigJson === "string" && typeof row.publishedConfigVersion === "number";
}

/**
 * Backfill lógico e seguro do snapshot publicado — nunca destrutivo.
 * MiniSites `active`/`disabled` criados antes da separação draft/published
 * existir não têm `published_config_json` ainda; para eles, o `config_json`
 * atual já era, na prática, o que estava no ar. Formalizamos isso
 * escrevendo esse mesmo valor como o primeiro snapshot publicado — sem
 * apagar nada, sem exigir publicação manual do usuário para continuar
 * funcionando como antes.
 *
 * MiniSites em `draft` (nunca publicados) são ignorados: não há "o que
 * estava no ar" para formalizar.
 *
 * Chamado tanto pelo GET/PATCH do editor quanto pela rota pública — em
 * qualquer um dos dois primeiros pontos de leitura depois do deploy desta
 * mudança, o snapshot já existirá.
 *
 * Defesa extra: se a migration realmente não rodou no banco em uso, a
 * própria escrita abaixo falha ("no such column"). Nesse caso o backfill é
 * só best-effort — devolve o `row` original (sem inventar um
 * `publishedConfigJson` que não foi de fato gravado) para os chamadores
 * caírem no fallback de ler `config_json` direto, em vez de propagar um
 * erro de schema do banco pra rota pública.
 */
export async function ensurePublishedSnapshot(db: Database, row: MiniSiteRow): Promise<MiniSiteRow> {
  if (row.status === "draft") return row;
  if (hasPublishedSnapshot(row)) return row;

  try {
    await db
      .update(minisites)
      .set({ publishedConfigJson: row.configJson, publishedConfigVersion: row.configVersion })
      .where(eq(minisites.id, row.id));
  } catch (error) {
    console.error("ensurePublishedSnapshot: backfill falhou (schema do banco desatualizado?)", {
      minisiteId: row.id,
      errorName: error instanceof Error ? error.name : typeof error,
      errorMessage: safeErrorMessage(error),
    });
    return row;
  }

  return { ...row, publishedConfigJson: row.configJson, publishedConfigVersion: row.configVersion };
}
