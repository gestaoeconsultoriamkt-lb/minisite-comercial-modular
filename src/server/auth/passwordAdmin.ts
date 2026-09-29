import { hashPassword } from "better-auth/crypto";
import { and, eq } from "drizzle-orm";
import { account, user } from "../db/schema";
import type { Database } from "../db";

/**
 * Define a senha de um usuário fora do fluxo normal de "trocar senha"
 * (que exige a senha atual) — usado tanto pela criação administrativa de
 * usuário quanto pela troca obrigatória no primeiro acesso e pelo reset de
 * senha temporária pelo administrador. `hashPassword` é a MESMA função que
 * o Better Auth usa internamente (`better-auth/crypto`, sem customização
 * de hasher neste projeto) — nunca um hash próprio/paralelo. Escreve
 * direto na conta de credencial (`account.providerId = "credential"`),
 * que é exatamente a linha que `auth.api.signUpEmail`/login já leem.
 */
export async function setUserPassword(
  db: Database,
  userId: string,
  plainPassword: string,
  mustChangePassword: boolean,
): Promise<void> {
  const hash = await hashPassword(plainPassword);
  const now = new Date();
  await db
    .update(account)
    .set({ password: hash, updatedAt: now })
    .where(and(eq(account.userId, userId), eq(account.providerId, "credential")));
  await db.update(user).set({ mustChangePassword, updatedAt: now }).where(eq(user.id, userId));
}
