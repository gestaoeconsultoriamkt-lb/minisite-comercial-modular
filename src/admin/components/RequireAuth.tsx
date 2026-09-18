import type { ReactNode } from "react";
import { Navigate } from "react-router";
import { authClient } from "../lib/authClient";
import { FullPageSpinner } from "./FullPageSpinner";

/**
 * Camada client-side de proteção de `/app/*`. A navegação direta (link
 * compartilhado, refresh) já é barrada no Worker (ver server/index.ts); isto
 * cobre sessão expirando durante navegação client-side dentro da SPA.
 */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { data: session, isPending } = authClient.useSession();

  if (isPending) return <FullPageSpinner />;
  if (!session) return <Navigate to="/login" replace />;

  return <>{children}</>;
}
