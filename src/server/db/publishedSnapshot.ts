import { eq } from "drizzle-orm";
import type { Database } from ".";
import { minisites, type MiniSiteRow } from "./schema";

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
 */
export async function ensurePublishedSnapshot(db: Database, row: MiniSiteRow): Promise<MiniSiteRow> {
  if (row.status === "draft") return row;
  if (row.publishedConfigJson !== null && row.publishedConfigVersion !== null) return row;

  await db
    .update(minisites)
    .set({ publishedConfigJson: row.configJson, publishedConfigVersion: row.configVersion })
    .where(eq(minisites.id, row.id));

  return { ...row, publishedConfigJson: row.configJson, publishedConfigVersion: row.configVersion };
}
