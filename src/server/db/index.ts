import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schema";
import type { Bindings } from "../types";

export function getDb(env: Bindings) {
  return drizzle(env.DB, { schema });
}

export type Database = ReturnType<typeof getDb>;
