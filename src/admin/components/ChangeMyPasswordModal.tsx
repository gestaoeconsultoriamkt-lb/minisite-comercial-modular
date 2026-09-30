import { useState, type FormEvent } from "react";
import { Modal } from "./Modal";
import { PasswordField } from "./PasswordField";
import { Button } from "./Button";
import { Alert } from "./Alert";
import { ShieldCheckIcon } from "./icons";
import { setNewPassword, UsersApiError } from "../lib/usersApi";
import { isValidDefinitivePassword, DEFINITIVE_PASSWORD_MESSAGE, MIN_DEFINITIVE_PASSWORD_LENGTH } from "../../shared/passwordPolicy";

interface ChangeMyPasswordModalProps {
  open: boolean;
  onClose: () => void;
  onDone: () => void;
}

/**
 * Troca voluntária da própria senha (Configurações > Minha conta) —
 * qualquer usuário logado, admin incluso. Reaproveita o mesmo endpoint da
 * troca obrigatória do primeiro acesso (POST /api/account/set-new-password,
 * ver setNewPassword em lib/usersApi.ts), então a mesma regra de senha
 * definitiva (mínimo 10 caracteres) já vale nos dois fluxos sem duplicar
 * validação.
 */
export function ChangeMyPasswordModal({ open, onClose, onDone }: ChangeMyPasswordModalProps) {
  const [newPassword, setNewPasswordValue] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function reset() {
    setNewPasswordValue("");
    setConfirmPassword("");
    setError(null);
  }

  function handleClose() {
    if (loading) return;
    reset();
    onClose();
  }

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
      reset();
      onDone();
    } catch (err) {
      setError(err instanceof UsersApiError ? err.message : "Não foi possível trocar a senha. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal open={open} onClose={handleClose} title="Trocar minha senha">
      <form className="flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
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

        <div className="mt-2 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button type="button" variant="secondary" fullWidth={false} onClick={handleClose} disabled={loading}>
            Cancelar
          </Button>
          <Button type="submit" fullWidth={false} loading={loading} icon={<ShieldCheckIcon className="h-4 w-4" />}>
            Trocar senha
          </Button>
        </div>
      </form>
    </Modal>
  );
}
