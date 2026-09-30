import { useState, type FormEvent } from "react";
import { Navigate, useNavigate } from "react-router";
import { AuthLayout } from "../components/AuthLayout";
import { AuthCard } from "../components/AuthCard";
import { BrandLogo } from "../components/BrandLogo";
import { PasswordField } from "../components/PasswordField";
import { Button } from "../components/Button";
import { Alert } from "../components/Alert";
import { ShieldCheckIcon } from "../components/icons";
import { authClient } from "../lib/authClient";
import { setNewPassword, UsersApiError } from "../lib/usersApi";
import { isValidDefinitivePassword, DEFINITIVE_PASSWORD_MESSAGE, MIN_DEFINITIVE_PASSWORD_LENGTH } from "../../shared/passwordPolicy";
import { FullPageSpinner } from "../components/FullPageSpinner";

/**
 * Troca obrigatória de senha no primeiro acesso — só para quem tem
 * `mustChangePassword: true` (usuário criado pelo administrador com senha
 * temporária, ver Configurações > Usuários). Não pede a senha atual de
 * propósito: a sessão só existe porque o usuário acabou de entrar com a
 * temporária.
 */
export function SetNewPasswordPage() {
  const navigate = useNavigate();
  const { data: session, isPending, refetch } = authClient.useSession();
  const [newPassword, setNewPasswordValue] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (isPending) return <FullPageSpinner />;
  if (!session) return <Navigate to="/login" replace />;
  // Já trocou (ou nunca precisou) — nada a fazer aqui.
  if (!session.user.mustChangePassword) return <Navigate to="/app/minisites" replace />;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;

    if (!isValidDefinitivePassword(newPassword)) {
      setError(DEFINITIVE_PASSWORD_MESSAGE);
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await setNewPassword(newPassword);
      // `authClient.getSession()` dispara um fetch avulso que só chega a
      // atualizar o store reativo de `useSession()` (lido também pelo
      // RequireAuth) de forma assíncrona, via um sinal com setTimeout —
      // navegar logo em seguida é uma corrida real: o RequireAuth ainda lê
      // `mustChangePassword: true` do store antigo e manda de volta pra cá.
      // `refetch` (exposto pelo próprio hook) atualiza o store de forma
      // síncrona dentro da mesma cadeia de promises, então o RequireAuth já
      // enxerga `mustChangePassword: false` no próximo render.
      await refetch?.({ query: { disableCookieCache: true } });
      navigate("/app/minisites", { replace: true });
    } catch (err) {
      setError(err instanceof UsersApiError ? err.message : "Não foi possível definir a nova senha. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout>
      <AuthCard>
        <BrandLogo size={40} />
        <h1 className="mt-8 text-3xl font-extrabold tracking-tight text-brand-navy-900">Definir nova senha</h1>
        <p className="mt-1.5 text-sm text-slate-500">Sua senha é temporária. Defina uma nova senha para continuar.</p>

        <form className="mt-7 flex flex-col gap-5" onSubmit={handleSubmit} noValidate>
          {error ? <Alert variant="error">{error}</Alert> : null}

          <div>
            <PasswordField
              label="Nova senha"
              name="newPassword"
              autoComplete="new-password"
              placeholder="Mínimo de 10 caracteres"
              value={newPassword}
              onChange={(e) => setNewPasswordValue(e.target.value)}
              required
              minLength={MIN_DEFINITIVE_PASSWORD_LENGTH}
              autoFocus
            />
            <p className="mt-1.5 text-xs text-slate-400">{DEFINITIVE_PASSWORD_MESSAGE}</p>
          </div>

          <PasswordField
            label="Confirmar nova senha"
            name="confirmPassword"
            autoComplete="new-password"
            placeholder="Repita a nova senha"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={MIN_DEFINITIVE_PASSWORD_LENGTH}
          />

          <Button type="submit" loading={loading} icon={<ShieldCheckIcon className="h-4 w-4" />}>
            Definir nova senha
          </Button>
        </form>
      </AuthCard>
    </AuthLayout>
  );
}
