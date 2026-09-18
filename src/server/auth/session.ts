import { createAuth } from "./index";
import type { Bindings } from "../types";

/** Checagem de sessão server-side, usada pelos guards de rota do Worker. */
export function getSession(env: Bindings, request: Request) {
  const auth = createAuth(env);
  return auth.api.getSession({ headers: request.headers });
}
