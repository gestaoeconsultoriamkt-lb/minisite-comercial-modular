import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger";
  loading?: boolean;
  icon?: ReactNode;
  fullWidth?: boolean;
}

const base =
  "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-xl px-4 py-3 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60";

const variants = {
  primary:
    "bg-gradient-to-r from-brand-blue-500 to-brand-blue-600 text-white shadow-lg shadow-brand-blue-600/25 hover:from-brand-blue-600 hover:to-brand-blue-600 hover:shadow-xl hover:shadow-brand-blue-600/30 focus:ring-brand-blue-500",
  secondary:
    "border border-slate-200 bg-white text-brand-navy-900 shadow-sm hover:border-slate-300 hover:bg-slate-50 hover:shadow focus:ring-brand-blue-500",
  danger:
    "bg-red-600 text-white shadow-lg shadow-red-600/25 hover:bg-red-700 focus:ring-red-500",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", loading, icon, disabled, fullWidth = true, className, children, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={[base, variants[variant], fullWidth ? "w-full" : "", className ?? ""].join(" ")}
      {...rest}
    >
      {loading ? (
        <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden>
          <circle className="opacity-25" cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="3" />
          <path className="opacity-90" d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        </svg>
      ) : (
        icon
      )}
      {children}
    </button>
  );
});
