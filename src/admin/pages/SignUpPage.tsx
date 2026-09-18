import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router";
import { AuthLayout } from "../components/AuthLayout";
import { AuthCard } from "../components/AuthCard";
import { BrandLogo } from "../components/BrandLogo";
import { TextField } from "../components/TextField";
import { PasswordField } from "../components/PasswordField";
import { Button } from "../components/Button";
import { Alert } from "../components/Alert";
import { ArrowLeftIcon, MailIcon, UserPlusIcon } from "../components/icons";
import { authClient } from "../lib/authClient";
import { translateAuthError } from "../lib/authErrors";

const MIN_PASSWORD_LENGTH = 8;

export function SignUpPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function validate(): string | null {
    if (name.trim().length < 2) return "Informe seu nome completo.";
    if (password.length < MIN_PASSWORD_LENGTH) return `A senha precisa ter ao menos ${MIN_PASSWORD_LENGTH} caracteres.`;
    if (password !== confirmPassword) return "As senhas não coincidem.";
    return null;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError(null);

    const { error: signUpError } = await authClient.signUp.email({ name: name.trim(), email, password });

    if (signUpError) {
      setError(translateAuthError(signUpError));
      setLoading(false);
      return;
    }

    navigate("/app/minisites", { replace: true });
  }

  return (
    <AuthLayout>
      <AuthCard>
        <BrandLogo size={40} />

        <h1 className="mt-8 text-3xl font-extrabold tracking-tight text-brand-navy-900">Cadastrar usuário</h1>
        <p className="mt-1.5 text-sm text-slate-500">Crie o primeiro administrador do MiniSite Comercial Modular.</p>

        <form className="mt-7 flex flex-col gap-5" onSubmit={handleSubmit} noValidate>
          {error ? <Alert variant="error">{error}</Alert> : null}

          <TextField
            label="Nome"
            type="text"
            name="name"
            autoComplete="name"
            placeholder="Seu nome"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

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
            autoComplete="new-password"
            placeholder="Crie uma senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={MIN_PASSWORD_LENGTH}
          />

          <PasswordField
            label="Confirmar senha"
            name="confirmPassword"
            autoComplete="new-password"
            placeholder="Repita a senha"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          <Button type="submit" loading={loading} icon={<UserPlusIcon className="h-4 w-4" />}>
            Criar conta
          </Button>

          <Link
            to="/login"
            className="flex items-center justify-center gap-1.5 text-sm font-semibold text-brand-blue-600 hover:underline"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Voltar para o login
          </Link>
        </form>
      </AuthCard>
    </AuthLayout>
  );
}
