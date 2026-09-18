import { count } from "drizzle-orm";
import { user } from "../db/schema";
import type { Database } from "../db";

/**
 * V1: bootstrap por ausência de usuário. Sem tabela/flag extra — só conta
 * quantos usuários existem. Se 0, libera criação do primeiro admin; depois
 * disso, self-signup público fica bloqueado (ver routes/auth.ts).
 *
 * Risco aceito (decisão registrada): corrida teórica entre dois cadastros
 * simultâneos no primeiro uso — aceitável por ser um setup manual controlado.
 */
export async function hasAnyUser(db: Database): Promise<boolean> {
  const rows = await db.select({ total: count() }).from(user);
  return (rows[0]?.total ?? 0) > 0;
}
