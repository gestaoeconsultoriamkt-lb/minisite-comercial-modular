/**
 * Abstração de envio de e-mail. O fluxo de autenticação (reset de senha)
 * depende só desta interface — trocar de provedor no futuro significa criar
 * um novo adapter e religar em `src/server/auth/index.ts`, sem tocar no
 * fluxo do Better Auth.
 */
export interface EmailProvider {
  sendPasswordReset(params: { to: string; resetUrl: string }): Promise<void>;
}
