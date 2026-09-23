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
  /** `true` quando o draft atual difere da versão publicada (ver Layout e Publicação). */
  hasUnpublishedChanges: boolean;
  publishedAt: string | null;

  loadFromDetail: (detail: MiniSiteDetail) => void;
  /**
   * Atualiza só os metadados de publicação (status/publishedAt/
   * hasUnpublishedChanges) a partir da resposta do servidor — usado depois
   * de um autosave ou de um publish. Nunca toca em `config`: se sobrescrevesse
   * `config` com a resposta (potencialmente já desatualizada por uma edição
   * feita enquanto o request estava em voo), reintroduziria a mesma corrida
   * que `patchConfig` em forma de função resolve.
   */
  setPublishMeta: (meta: { status: MiniSiteStatus; publishedAt: string | null; hasUnpublishedChanges: boolean }) => void;
  setInternalName: (value: string) => void;
  setNiche: (value: string) => void;
  setSlug: (value: string) => void;
  /**
   * Merge raso no nível superior do config. Aceita um objeto OU uma função
   * `(config) => patch` — a função recebe o `config` FRESCO no momento em
   * que o `set()` do Zustand roda, não uma cópia capturada no closure do
   * componente no momento do render.
   *
   * Isso importa de verdade: editores que fazem "leio a fatia atual via
   * seletor, espalho, e chamo patchConfig({ appearance: {...} })" capturam
   * `appearance` no render. Se duas chamadas acontecerem antes de um
   * re-render (drag rápido no color picker, dois uploads assíncronos
   * resolvendo em sequência), a segunda chamada ainda vê a fatia ANTIGA —
   * seu merge sobrescreve o campo que a primeira chamada tinha acabado de
   * gravar, apagando silenciosamente uma cor/campo já salvo. Usar a forma
   * função (lendo o `config` do próprio callback) elimina essa corrida.
   */
  patchConfig: (patch: Partial<MiniSiteConfig> | ((config: MiniSiteConfig) => Partial<MiniSiteConfig>)) => void;
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
    hasUnpublishedChanges: false,
    publishedAt: null,

    loadFromDetail: (detail) =>
      set({
        internalName: detail.internalName,
        niche: detail.niche ?? "",
        slug: detail.slug,
        status: detail.status,
        config: detail.config,
        hasUnpublishedChanges: detail.hasUnpublishedChanges,
        publishedAt: detail.publishedAt,
        loaded: true,
      }),
    setPublishMeta: (meta) => set(meta),
    setInternalName: (value) => set({ internalName: value }),
    setNiche: (value) => set({ niche: value }),
    setSlug: (value) => set({ slug: value }),
    patchConfig: (patch) =>
      set((state) => ({
        config: { ...state.config, ...(typeof patch === "function" ? patch(state.config) : patch) },
      })),
  }));
}

const EditorStoreContext = createContext<EditorStoreApi | null>(null);
export const EditorStoreProvider = EditorStoreContext.Provider;

export function useEditorStore<T>(selector: (state: EditorState) => T): T {
  const store = useContext(EditorStoreContext);
  if (!store) throw new Error("useEditorStore precisa estar dentro de <EditorStoreProvider>");
  return store(selector);
}
