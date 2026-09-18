import { useState, type FormEvent } from "react";
import { Link } from "react-router";
import { AuthLayout } from "../components/AuthLayout";
import { AuthCard } from "../components/AuthCard";
import { BrandLogo } from "../components/BrandLogo";
import { TextField } from "../components/TextField";
import { Button } from "../components/Button";
import { Alert } from "../components/Alert";
import { ArrowLeftIcon, MailIcon, SendIcon } from "../components/icons";
import { authClient } from "../lib/authClient";
import { translateAuthError } from "../lib/authErrors";

export function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;

    setLoading(true);
    setError(null);

    const { error: requestError } = await authClient.requestPasswordReset({
      email,
      redirectTo: "/redefinir-senha",
    });

    setLoading(false);

    if (requestError) {
      setError(translateAuthError(requestError));
      return;
    }

    setSent(true);
  }

  return (
    <AuthLayout>
      <AuthCard>
        <BrandLogo size={40} />

        <h1 className="mt-8 text-3xl font-extrabold tracking-tight text-brand-navy-900">Esqueci minha senha</h1>
        <p className="mt-1.5 text-sm text-slate-500">
          Informe seu e-mail. Se houver uma conta associada, enviaremos um link de redefinição.
        </p>

        {sent ? (
          <div className="mt-7 flex flex-col gap-5">
            <Alert variant="success">
              Se este e-mail estiver cadastrado, você receberá um link para redefinir sua senha em instantes.
            </Alert>
            <Link
              to="/login"
              className="flex items-center justify-center gap-1.5 text-sm font-semibold text-brand-blue-600 hover:underline"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              Voltar para o login
            </Link>
          </div>
        ) : (
          <form className="mt-7 flex flex-col gap-5" onSubmit={handleSubmit} noValidate>
            {error ? <Alert variant="error">{error}</Alert> : null}

            <TextField
              label="E-mail"
              type="email"
              name="email"
              autoComplete="email"
              placeholder="seu@exemplo.com"
              icon={<MailIcon className="h-5 w-5" />}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Button type="submit" loading={loading} icon={<SendIcon className="h-4 w-4" />}>
              Enviar link de recuperação
            </Button>

            <Link
              to="/login"
              className="flex items-center justify-center gap-1.5 text-sm font-semibold text-brand-blue-600 hover:underline"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              Voltar para o login
            </Link>
          </form>
        )}
      </AuthCard>
    </AuthLayout>
  );
}
