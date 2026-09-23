import { useEffect, useRef, useState } from "react";
import { patchMiniSite, MiniSiteApiError } from "../lib/minisitesApi";
import { isValidSlugFormat } from "../../shared/reservedSlugs";
import { useToast } from "../lib/toast";
import type { EditorStoreApi } from "./editorStore";

export type SaveStatus = "idle" | "saving" | "saved" | "error";

/**
 * Autosave com debounce (~1s), compartilhado entre o Editor (Fase 3) e a
 * Tela de Layout/Publicação (Fase 4) — mesmo mecanismo, mesmo endpoint
 * PATCH, sem arquitetura de persistência nova.
 */
export function useAutosave(store: EditorStoreApi, ready: boolean) {
  const [status, setStatus] = useState<SaveStatus>("idle");
  const debounceRef = useRef<number | undefined>(undefined);
  const skipFirstRef = useRef(true);
  const { showToast } = useToast();

  async function flush() {
    if (!store.getState().loaded) return;
    const state = store.getState();
    setStatus("saving");
    try {
      const detail = await patchMiniSite(state.minisiteId, {
        internalName: state.internalName,
        niche: state.niche,
        slug: isValidSlugFormat(state.slug) ? state.slug : undefined,
        config: state.config,
      });
      // Só os metadados de publicação — nunca `config`: a resposta reflete o
      // que foi enviado no INÍCIO deste request, e uma edição pode ter
      // acontecido enquanto ele estava em voo. Sobrescrever `config` aqui
      // reintroduziria a mesma corrida que o `patchConfig` funcional resolve.
      store.getState().setPublishMeta({
        status: detail.status,
        publishedAt: detail.publishedAt,
        hasUnpublishedChanges: detail.hasUnpublishedChanges,
      });
      setStatus("saved");
    } catch (err) {
      setStatus("error");
      showToast(err instanceof MiniSiteApiError ? err.message : "Não foi possível salvar.", "error");
    }
  }

  const internalName = store((s) => s.internalName);
  const niche = store((s) => s.niche);
  const slug = store((s) => s.slug);
  const config = store((s) => s.config);

  useEffect(() => {
    if (!ready) return;
    if (skipFirstRef.current) {
      skipFirstRef.current = false;
      return;
    }
    window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => {
      flush();
    }, 1000);
    return () => window.clearTimeout(debounceRef.current);
    // flush lê o estado mais atual via store.getState() — não precisa entrar como dependência.
  }, [internalName, niche, slug, config, ready]);

  async function flushNow() {
    window.clearTimeout(debounceRef.current);
    await flush();
  }

  return { status, flushNow };
}
