import { Hono } from "hono";
import { getDb } from "../db";
import { hasAnyUser } from "../auth/bootstrap";
import type { AppEnv } from "../types";

export const bootstrapRoutes = new Hono<AppEnv>();

/** Usado pela Tela de Login/Cadastro para saber se os CTAs de cadastro devem aparecer. */
bootstrapRoutes.get("/bootstrap-status", async (c) => {
  const db = getDb(c.env);
  const signupAvailable = !(await hasAnyUser(db));
  return c.json({ signupAvailable });
});
