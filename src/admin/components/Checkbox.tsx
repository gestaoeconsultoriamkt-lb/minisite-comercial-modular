import { forwardRef, type InputHTMLAttributes } from "react";

interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { label, id, name, className, ...rest },
  ref,
) {
  const inputId = id ?? name;
  return (
    <label htmlFor={inputId} className={`flex cursor-pointer items-center gap-2 text-sm text-slate-600 ${className ?? ""}`}>
      <input
        ref={ref}
        id={inputId}
        name={name}
        type="checkbox"
        className="h-4 w-4 rounded border-slate-300 text-brand-blue-600 focus:ring-2 focus:ring-brand-blue-500/40"
        {...rest}
      />
      {label}
    </label>
  );
});
