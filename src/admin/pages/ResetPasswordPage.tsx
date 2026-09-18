import { useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { AuthLayout } from "../components/AuthLayout";
import { AuthCard } from "../components/AuthCard";
import { BrandLogo } from "../components/BrandLogo";
import { PasswordField } from "../components/PasswordField";
import { Button } from "../components/Button";
import { Alert } from "../components/Alert";
import { ArrowLeftIcon } from "../components/icons";
import { authClient } from "../lib/authClient";
import { translateAuthError } from "../lib/authErrors";

const MIN_PASSWORD_LENGTH = 8;

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const linkError = searchParams.get("error");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const invalidLink = !token || Boolean(linkError);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading || !token) return;

    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      setError(`A senha precisa ter ao menos ${MIN_PASSWORD_LENGTH} caracteres.`);
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }

    setLoading(true);
    setError(null);

    const { error: resetError } = await authClient.resetPassword({ newPassword, token });

    setLoading(false);

    if (resetError) {
      setError(translateAuthError(resetError));
      return;
    }

    setDone(true);
  }

  return (
    <AuthLayout>
      <AuthCard>
        <BrandLogo size={40} />
        <h1 className="mt-8 text-3xl font-extrabold tracking-tight text-brand-navy-900">Redefinir senha</h1>

        {invalidLink ? (
          <div className="mt-7 flex flex-col gap-5">
            <Alert variant="error">Este link é inválido ou já expirou. Solicite um novo link de recuperação.</Alert>
            <Link
              to="/esqueci-senha"
              className="flex items-center justify-center gap-1.5 text-sm font-semibold text-brand-blue-600 hover:underline"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              Solicitar novo link
            </Link>
          </div>
        ) : done ? (
          <div className="mt-7 flex flex-col gap-5">
            <Alert variant="success">Sua senha foi redefinida com sucesso.</Alert>
            <Button type="button" onClick={() => navigate("/login", { replace: true })}>
              Ir para o login
            </Button>
          </div>
        ) : (
          <>
            <p className="mt-1.5 text-sm text-slate-500">Escolha uma nova senha para sua conta.</p>
            <form className="mt-7 flex flex-col gap-5" onSubmit={handleSubmit} noValidate>
              {error ? <Alert variant="error">{error}</Alert> : null}

              <PasswordField
                label="Nova senha"
                name="newPassword"
                autoComplete="new-password"
                placeholder="Crie uma nova senha"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={MIN_PASSWORD_LENGTH}
              />

              <PasswordField
                label="Confirmar nova senha"
                name="confirmPassword"
                autoComplete="new-password"
                placeholder="Repita a nova senha"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />

              <Button type="submit" loading={loading}>
                Redefinir senha
              </Button>
            </form>
          </>
        )}
      </AuthCard>
    </AuthLayout>
  );
}
