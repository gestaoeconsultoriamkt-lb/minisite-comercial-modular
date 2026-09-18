import type { ReactNode } from "react";

export function AuthCard({ children }: { children: ReactNode }) {
  return (
    <div className="w-full rounded-3xl border border-slate-100 bg-white p-8 shadow-[0_20px_60px_-15px_rgba(15,23,66,0.25)] sm:p-10">
      {children}
    </div>
  );
}
