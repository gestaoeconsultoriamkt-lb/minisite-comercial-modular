import { useState, type FormEvent } from "react";
import { Modal } from "./Modal";
import { TextField } from "./TextField";
import { PasswordField } from "./PasswordField";
import { Button } from "./Button";
import { Alert } from "./Alert";
import { MailIcon, UserPlusIcon } from "./icons";
import { createUser, UsersApiError, type AdminUserListItem } from "../lib/usersApi";
import { PASSWORD_PATTERN } from "../../shared/passwordPolicy";

interface NewUserModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: (user: AdminUserListItem) => void;
}

export function NewUserModal({ open, onClose, onCreated }: NewUserModalProps) {
  const [email, setEmail] = useState("");
  const [tempPassword, setTempPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);

  function reset() {
    setEmail("");
    setTempPassword("");
    setError(null);
    setEmailError(null);
  }

  function handleClose() {
    if (loading) return;
    reset();
    onClose();
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;

    if (!email.trim()) {
      setError("Informe o e-mail do novo usuário.");
      return;
    }
    if (!PASSWORD_PATTERN.test(tempPassword)) {
      setError("A senha temporária deve conter exatamente 8 números.");
      return;
    }

    setLoading(true);
    setError(null);
    setEmailError(null);

    try {
      const user = await createUser({ email: email.trim(), tempPassword });
      reset();
      onCreated(user);
    } catch (err) {
      if (err instanceof UsersApiError && err.code === "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL") {
        setEmailError(err.message);
      } else if (err instanceof UsersApiError) {
        setError(err.message);
      } else {
        setError("Não foi possível criar o usuário. Tente novamente.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal open={open} onClose={handleClose} title="Novo usuário">
      <form className="flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
        {error ? <Alert variant="error">{error}</Alert> : null}

        <TextField
          label="E-mail"
          type="email"
          name="email"
          autoComplete="off"
          placeholder="usuario@exemplo.com"
          icon={<MailIcon className="h-5 w-5" />}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={emailError ?? undefined}
          required
          autoFocus
        />

        <div>
          <PasswordField
            label="Senha temporária"
            name="tempPassword"
            autoComplete="off"
            placeholder="8 números"
            value={tempPassword}
            onChange={(e) => setTempPassword(e.target.value.replace(/\D/g, "").slice(0, 8))}
            required
            minLength={8}
            maxLength={8}
            inputMode="numeric"
          />
          <p className="mt-1.5 text-xs text-slate-400">
            Exatamente 8 números (ex.: 12345678). O usuário precisará trocá-la no primeiro acesso.
          </p>
        </div>

        <div className="mt-2 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button type="button" variant="secondary" fullWidth={false} onClick={handleClose} disabled={loading}>
            Cancelar
          </Button>
          <Button type="submit" fullWidth={false} loading={loading} icon={<UserPlusIcon className="h-4 w-4" />}>
            Criar usuário
          </Button>
        </div>
      </form>
    </Modal>
  );
}
