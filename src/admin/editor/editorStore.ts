import { createContext, useContext } from "react";
import { create, type StoreApi, type UseBoundStore } from "zustand";
import type { MiniSiteConfig } from "../../shared/schemas/miniSiteConfig";
import { createDefaultMiniSiteConfig } from "../../shared/schemas/migrateMiniSiteConfig";
import type { MiniSiteDetail, MiniSiteStatus } from "../lib/minisitesApi";

export interface EditorState {
  minisiteId: string;
  internalName: string;
  niche: string;
  slug: string;
  status: MiniSiteStatus;
  config: MiniSiteConfig;
  loaded: boolean;

  loadFromDetail: (detail: MiniSiteDetail) => void;
  setInternalName: (value: string) => void;
  setNiche: (value: string) => void;
  setSlug: (value: string) => void;
  /** Merge raso no nível superior do config (ex.: patchConfig({ appearance: {...} })). */
  patchConfig: (patch: Partial<MiniSiteConfig>) => void;
}

export type EditorStoreApi = UseBoundStore<StoreApi<EditorState>>;

/**
 * Uma instância por MiniSite aberto no editor (ver EditorStoreProvider).
 * Draft local derivado do config_json real — a única fonte que o
 * `MiniSiteRenderer` (preview) e o autosave (Fase 3 §22) leem/gravam.
 */
export function createEditorStore(minisiteId: string): EditorStoreApi {
  return create<EditorState>((set) => ({
    minisiteId,
    internalName: "",
    niche: "",
    slug: "",
    status: "draft",
    config: createDefaultMiniSiteConfig(),
    loaded: false,

    loadFromDetail: (detail) =>
      set({
        internalName: detail.internalName,
        niche: detail.niche ?? "",
        slug: detail.slug,
        status: detail.status,
        config: detail.config,
        loaded: true,
      }),
    setInternalName: (value) => set({ internalName: value }),
    setNiche: (value) => set({ niche: value }),
    setSlug: (value) => set({ slug: value }),
    patchConfig: (patch) => set((state) => ({ config: { ...state.config, ...patch } })),
  }));
}

const EditorStoreContext = createContext<EditorStoreApi | null>(null);
export const EditorStoreProvider = EditorStoreContext.Provider;

export function useEditorStore<T>(selector: (state: EditorState) => T): T {
  const store = useContext(EditorStoreContext);
  if (!store) throw new Error("useEditorStore precisa estar dentro de <EditorStoreProvider>");
  return store(selector);
}
