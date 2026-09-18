import type { EmailProvider } from "./EmailProvider";

export interface BrevoEmailProviderOptions {
  apiKey?: string;
  senderEmail?: string;
  senderName?: string;
}

const BREVO_TRANSACTIONAL_ENDPOINT = "https://api.brevo.com/v3/smtp/email";

/**
 * Adapter estrutural do provedor Brevo (API HTTP transacional). Não exige
 * API key nesta fase — se chamado sem `apiKey`/`senderEmail` configurados,
 * falha de forma explícita em vez de enviar silenciosamente nada.
 */
export function createBrevoEmailProvider(options: BrevoEmailProviderOptions): EmailProvider {
  return {
    async sendPasswordReset({ to, resetUrl }) {
      if (!options.apiKey || !options.senderEmail) {
        throw new Error(
          "Brevo não configurado (BREVO_API_KEY/BREVO_SENDER_EMAIL ausentes). " +
            "Defina os secrets antes de habilitar o envio real de e-mails.",
        );
      }

      const response = await fetch(BREVO_TRANSACTIONAL_ENDPOINT, {
        method: "POST",
        headers: {
          "api-key": options.apiKey,
          "content-type": "application/json",
          accept: "application/json",
        },
        body: JSON.stringify({
          sender: { email: options.senderEmail, name: options.senderName ?? "MiniSite" },
          to: [{ email: to }],
          subject: "Redefinição de senha",
          htmlContent: `<p>Clique no link abaixo para redefinir sua senha:</p><p><a href="${resetUrl}">${resetUrl}</a></p><p>Se você não solicitou isso, ignore este e-mail.</p>`,
        }),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Falha ao enviar e-mail via Brevo (HTTP ${response.status}): ${errorBody}`);
      }
    },
  };
}
