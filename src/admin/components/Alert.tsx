import type { ReactNode } from "react";
import { AlertCircleIcon, CheckCircleIcon } from "./icons";

interface AlertProps {
  variant: "error" | "success";
  children: ReactNode;
}

const styles = {
  error: "border-red-200 bg-red-50 text-red-700",
  success: "border-emerald-200 bg-emerald-50 text-emerald-700",
};

export function Alert({ variant, children }: AlertProps) {
  const Icon = variant === "error" ? AlertCircleIcon : CheckCircleIcon;
  return (
    <div role="alert" className={`flex items-start gap-2 rounded-xl border px-4 py-3 text-sm ${styles[variant]}`}>
      <Icon className="mt-0.5 h-4.5 w-4.5 shrink-0" />
      <span>{children}</span>
    </div>
  );
}
