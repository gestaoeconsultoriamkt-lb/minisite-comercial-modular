import { useState, type FormEvent } from "react";
import { Modal } from "./Modal";
import { PasswordField } from "./PasswordField";
import { Button } from "./Button";
import { Alert } from "./Alert";
import { LockIcon } from "./icons";
import { resetUserTempPassword, UsersApiError } from "../lib/usersApi";
import { PASSWORD_PATTERN } from "../../shared/passwordPolicy";

interface ResetTempPasswordModalProps {
  open: boolean;
  userId: string | null;
  userEmail: string | null;
  onClose: () => void;
  onDone: () => void;
}

export function ResetTempPasswordModal({ open, userId, userEmail, onClose, onDone }: ResetTempPasswordModalProps) {
  const [tempPassword, setTempPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function reset() {
    setTempPassword("");
    setError(null);
  }

  function handleClose() {
    if (loading) return;
    reset();
    onClose();
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading || !userId) return;

    if (!PASSWORD_PATTERN.test(tempPassword)) {
      setError("A senha temporária deve conter exatamente 8 números.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await resetUserTempPassword(userId, tempPassword);
      reset();
      onDone();
    } catch (err) {
      setError(err instanceof UsersApiError ? err.message : "Não foi possível redefinir a senha. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal open={open} onClose={handleClose} title="Redefinir senha temporária">
      <form className="flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
        {userEmail ? <p className="text-sm text-slate-500">Usuário: {userEmail}</p> : null}
        {error ? <Alert variant="error">{error}</Alert> : null}

        <div>
          <PasswordField
            label="Nova senha temporária"
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
          <p className="mt-1.5 text-xs text-slate-400">O usuário precisará trocá-la no próximo acesso.</p>
        </div>

        <div className="mt-2 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button type="button" variant="secondary" fullWidth={false} onClick={handleClose} disabled={loading}>
            Cancelar
          </Button>
          <Button type="submit" fullWidth={false} loading={loading} icon={<LockIcon className="h-4 w-4" />}>
            Redefinir senha
          </Button>
        </div>
      </form>
    </Modal>
  );
}
