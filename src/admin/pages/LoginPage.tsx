import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router";
import { AuthLayout } from "../components/AuthLayout";
import { AuthCard } from "../components/AuthCard";
import { BrandLogo } from "../components/BrandLogo";
import { TextField } from "../components/TextField";
import { PasswordField } from "../components/PasswordField";
import { Checkbox } from "../components/Checkbox";
import { Button } from "../components/Button";
import { Alert } from "../components/Alert";
import { MailIcon, SendIcon, ShieldCheckIcon, UserPlusIcon } from "../components/icons";
import { authClient } from "../lib/authClient";
import { translateAuthError } from "../lib/authErrors";

export function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;

    setLoading(true);
    setError(null);

    const { error: signInError } = await authClient.signIn.email({ email, password, rememberMe });

    if (signInError) {
      setError(translateAuthError(signInError));
      setLoading(false);
      return;
    }

    navigate("/app/minisites", { replace: true });
  }

  return (
    <AuthLayout
      topRightSlot={
        <div className="flex items-center gap-3 text-sm">
          <span className="hidden text-slate-500 sm:inline">Ainda não tem uma conta?</span>
          <Link
            to="/cadastro"
            className="rounded-full bg-brand-blue-50 px-4 py-2 font-semibold text-brand-blue-600 transition hover:bg-brand-blue-100"
          >
            Criar usuário
          </Link>
        </div>
      }
    >
      <AuthCard>
        <BrandLogo size={40} title="Smart" subtitle="Bio Builder" />

        <h1 className="mt-8 text-3xl font-extrabold tracking-tight text-brand-navy-900">Entrar</h1>
        <p className="mt-1.5 text-sm text-slate-500">Acesse sua conta para gerenciar seus MiniSites.</p>

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

          <PasswordField
            label="Senha"
            name="password"
            autoComplete="current-password"
            placeholder="Sua senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <div className="flex items-center justify-between">
            <Checkbox
              label="Lembrar de mim"
              name="rememberMe"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            <Link to="/esqueci-senha" className="text-sm font-semibold text-brand-blue-600 hover:underline">
              Esqueci minha senha
            </Link>
          </div>

          <Button type="submit" loading={loading} icon={<SendIcon className="h-4 w-4" />}>
            Entrar
          </Button>

          {/* Ação secundária — hierarquia deliberadamente mais discreta que
              "Entrar" (variant="secondary", vem depois de um divisor "ou"),
              para nunca competir com a ação principal da tela. */}
          <div className="flex items-center gap-3 text-xs font-medium uppercase tracking-wide text-slate-400">
            <span className="h-px flex-1 bg-slate-200" />
            ou
            <span className="h-px flex-1 bg-slate-200" />
          </div>

          <Button type="button" variant="secondary" icon={<UserPlusIcon className="h-4 w-4" />} onClick={() => navigate("/cadastro")}>
            Criar usuário
          </Button>
        </form>

        <div className="mt-7 flex items-start gap-3 rounded-2xl bg-brand-blue-50 p-4">
          <ShieldCheckIcon className="mt-0.5 h-5 w-5 shrink-0 text-brand-blue-600" />
          <div>
            <p className="text-sm font-semibold text-brand-navy-900">Ambiente seguro e confiável</p>
            <p className="mt-0.5 text-xs text-slate-500">
              Seus dados estão protegidos com criptografia de ponta e alto nível de segurança.
            </p>
          </div>
        </div>
      </AuthCard>
    </AuthLayout>
  );
}
