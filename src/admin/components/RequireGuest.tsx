import type { ReactNode } from "react";
import { Navigate } from "react-router";
import { authClient } from "../lib/authClient";
import { FullPageSpinner } from "./FullPageSpinner";

/** Usado em /login e /cadastro: usuário já autenticado é levado para o painel. */
export function RequireGuest({ children }: { children: ReactNode }) {
  const { data: session, isPending } = authClient.useSession();

  if (isPending) return <FullPageSpinner />;
  if (session) return <Navigate to="/app/minisites" replace />;

  return <>{children}</>;
}
