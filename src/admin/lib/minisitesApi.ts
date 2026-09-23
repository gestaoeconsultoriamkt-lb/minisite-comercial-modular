import type { MiniSiteConfig } from "../../shared/schemas/miniSiteConfig";

export type MiniSiteStatus = "draft" | "active" | "disabled";

export interface MiniSiteListItem {
  id: string;
  slug: string;
  internalName: string;
  niche: string | null;
  status: MiniSiteStatus;
  displayName: string | null;
  headline: string | null;
  shortDescription: string | null;
  coverKey: string | null;
  logoKey: string | null;
  colorPrimary: string | null;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
}

export interface CreateMiniSiteInput {
  internalName: string;
  niche: string;
  slug: string;
  displayName?: string;
}

export interface MiniSiteDetail {
  id: string;
  slug: string;
  internalName: string;
  niche: string | null;
  status: MiniSiteStatus;
  /** Sempre a versão de TRABALHO (draft) — o que o editor/preview usam. Nunca a versão pública. */
  config: MiniSiteConfig;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
  /** `true` quando o draft difere do snapshot publicado (ou quando o MiniSite está ativo/desativado e ainda não tem snapshot). */
  hasUnpublishedChanges: boolean;
}

export interface PatchMiniSiteInput {
  internalName?: string;
  niche?: string;
  slug?: string;
  config?: MiniSiteConfig;
}

export class MiniSiteApiError extends Error {
  code: string;
  status: number;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

async function parseJsonOrThrow<T>(response: Response): Promise<T> {
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    const code = (body as { code?: string } | null)?.code ?? "UNKNOWN_ERROR";
    const message = (body as { message?: string } | null)?.message ?? "Ocorreu um erro inesperado.";
    throw new MiniSiteApiError(response.status, code, message);
  }
  return body as T;
}

export async function listMiniSites(): Promise<MiniSiteListItem[]> {
  const response = await fetch("/api/minisites");
  const data = await parseJsonOrThrow<{ minisites: MiniSiteListItem[] }>(response);
  return data.minisites;
}

export async function getMiniSiteDetail(id: string): Promise<MiniSiteDetail> {
  const response = await fetch(`/api/minisites/${id}`);
  const data = await parseJsonOrThrow<{ minisite: MiniSiteDetail }>(response);
  return data.minisite;
}

export async function patchMiniSite(id: string, input: PatchMiniSiteInput): Promise<MiniSiteDetail> {
  const response = await fetch(`/api/minisites/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const data = await parseJsonOrThrow<{ minisite: MiniSiteDetail }>(response);
  return data.minisite;
}

export type UploadPurpose = "logo" | "cover" | "background" | "gallery" | "card" | "section";

export async function uploadMedia(minisiteId: string, purpose: UploadPurpose, file: Blob): Promise<{ key: string }> {
  const formData = new FormData();
  formData.append("minisiteId", minisiteId);
  formData.append("purpose", purpose);
  formData.append("file", file);
  const response = await fetch("/api/uploads", { method: "POST", body: formData });
  return parseJsonOrThrow<{ key: string }>(response);
}

export async function createMiniSite(input: CreateMiniSiteInput): Promise<MiniSiteListItem> {
  const response = await fetch("/api/minisites", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const data = await parseJsonOrThrow<{ minisite: MiniSiteListItem }>(response);
  return data.minisite;
}

export async function duplicateMiniSite(id: string): Promise<MiniSiteListItem> {
  const response = await fetch(`/api/minisites/${id}/duplicate`, { method: "POST" });
  const data = await parseJsonOrThrow<{ minisite: MiniSiteListItem }>(response);
  return data.minisite;
}

export async function publishMiniSite(id: string): Promise<MiniSiteDetail> {
  const response = await fetch(`/api/minisites/${id}/publish`, { method: "POST" });
  const data = await parseJsonOrThrow<{ minisite: MiniSiteDetail }>(response);
  return data.minisite;
}

export async function disableMiniSite(id: string): Promise<MiniSiteDetail> {
  const response = await fetch(`/api/minisites/${id}/disable`, { method: "POST" });
  const data = await parseJsonOrThrow<{ minisite: MiniSiteDetail }>(response);
  return data.minisite;
}

export async function reactivateMiniSite(id: string): Promise<MiniSiteDetail> {
  const response = await fetch(`/api/minisites/${id}/reactivate`, { method: "POST" });
  const data = await parseJsonOrThrow<{ minisite: MiniSiteDetail }>(response);
  return data.minisite;
}

export async function deleteMiniSite(id: string): Promise<void> {
  const response = await fetch(`/api/minisites/${id}`, { method: "DELETE" });
  await parseJsonOrThrow<{ status: string }>(response);
}
