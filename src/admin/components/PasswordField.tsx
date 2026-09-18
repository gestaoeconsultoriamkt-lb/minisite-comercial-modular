import { forwardRef, useState, type InputHTMLAttributes } from "react";
import { TextField } from "./TextField";
import { EyeIcon, EyeOffIcon, LockIcon } from "./icons";

interface PasswordFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label: string;
  error?: string;
}

export const PasswordField = forwardRef<HTMLInputElement, PasswordFieldProps>(function PasswordField(
  { label, error, ...inputProps },
  ref,
) {
  const [visible, setVisible] = useState(false);
  const inputId = inputProps.id ?? inputProps.name;

  return (
    <TextField
      {...inputProps}
      ref={ref}
      label={label}
      error={error}
      type={visible ? "text" : "password"}
      icon={<LockIcon className="h-5 w-5" />}
      rightSlot={
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Ocultar senha" : "Mostrar senha"}
          aria-controls={inputId}
          className="rounded-md p-1 text-slate-400 transition hover:text-brand-navy-900 focus:outline-none focus:ring-2 focus:ring-brand-blue-500/40"
        >
          {visible ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
        </button>
      }
    />
  );
});
