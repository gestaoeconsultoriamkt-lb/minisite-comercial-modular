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

export async function getMiniSite(id: string): Promise<MiniSiteListItem> {
  const response = await fetch(`/api/minisites/${id}`);
  const data = await parseJsonOrThrow<{ minisite: MiniSiteListItem }>(response);
  return data.minisite;
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

export async function deleteMiniSite(id: string): Promise<void> {
  const response = await fetch(`/api/minisites/${id}`, { method: "DELETE" });
  await parseJsonOrThrow<{ status: string }>(response);
}
