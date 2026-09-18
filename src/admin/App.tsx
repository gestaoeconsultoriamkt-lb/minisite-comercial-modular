import { useEffect, useState } from "react";
import { MiniSiteRenderer } from "../shared/renderer";
import { createDefaultMiniSiteConfig } from "../shared/schemas/migrateMiniSiteConfig";

type HealthStatus = "checking" | "ok" | "error";

/**
 * Entrypoint mínimo do admin — só existe para validar o build/execução do
 * Vite + React nesta fase, e provar que `shared/renderer` também roda no
 * client (mesmo componente usado depois no preview real do editor).
 * Telas 1–4 são implementadas nas fases seguintes.
 */
export function App() {
  const [health, setHealth] = useState<HealthStatus>("checking");

  useEffect(() => {
    fetch("/api/health")
      .then((res) => (res.ok ? res.json() : Promise.reject(res.status)))
      .then(() => setHealth("ok"))
      .catch(() => setHealth("error"));
  }, []);

  return (
    <main style={{ fontFamily: "system-ui, sans-serif", padding: "2rem" }}>
      <h1>MiniSite Comercial Modular</h1>
      <p>Fase 0 — fundação técnica.</p>
      <p>Status da API (/api/health): {health}</p>

      <hr />
      <p>Spike do renderer compartilhado (mesmo componente do SSR público):</p>
      <MiniSiteRenderer displayName="Preview de exemplo" config={createDefaultMiniSiteConfig()} />
    </main>
  );
}
