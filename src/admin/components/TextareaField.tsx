import { forwardRef, type TextareaHTMLAttributes } from "react";

interface TextareaFieldProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  hint?: string;
}

export const TextareaField = forwardRef<HTMLTextAreaElement, TextareaFieldProps>(function TextareaField(
  { label, hint, id, name, className, rows = 3, ...rest },
  ref,
) {
  const inputId = id ?? name;
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={inputId} className="text-sm font-semibold text-brand-navy-900">
        {label}
      </label>
      <textarea
        ref={ref}
        id={inputId}
        name={name}
        rows={rows}
        className={[
          "w-full resize-y rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-[inset_0_1px_2px_rgba(15,23,42,0.03)] placeholder:text-slate-400 transition",
          "hover:border-slate-300 focus:outline-none focus:ring-[3px] focus:ring-brand-blue-500/15 focus:border-brand-blue-500",
          className ?? "",
        ].join(" ")}
        {...rest}
      />
      {hint ? <p className="text-xs text-slate-400">{hint}</p> : null}
    </div>
  );
});
