import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: ReactNode;
  /** Slot à direita do input, ex.: botão de mostrar/ocultar senha. */
  rightSlot?: ReactNode;
  error?: string;
}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(function TextField(
  { label, icon, rightSlot, error, id, name, className, ...inputProps },
  ref,
) {
  const inputId = id ?? name;
  const errorId = error ? `${inputId}-error` : undefined;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={inputId} className="text-sm font-semibold text-brand-navy-900">
        {label}
      </label>
      <div className="relative">
        {icon ? (
          <span className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-slate-400">
            {icon}
          </span>
        ) : null}
        <input
          ref={ref}
          id={inputId}
          name={name}
          aria-invalid={Boolean(error)}
          aria-describedby={errorId}
          className={[
            "w-full rounded-xl border bg-white py-3 text-sm text-slate-900 placeholder:text-slate-400 transition",
            "focus:outline-none focus:ring-2 focus:ring-brand-blue-500/40 focus:border-brand-blue-500",
            icon ? "pl-11" : "pl-4",
            rightSlot ? "pr-11" : "pr-4",
            error ? "border-red-400" : "border-slate-200",
            className ?? "",
          ].join(" ")}
          {...inputProps}
        />
        {rightSlot ? (
          <span className="absolute inset-y-0 right-3 flex items-center">{rightSlot}</span>
        ) : null}
      </div>
      {error ? (
        <p id={errorId} className="text-xs font-medium text-red-600">
          {error}
        </p>
      ) : null}
    </div>
  );
});
