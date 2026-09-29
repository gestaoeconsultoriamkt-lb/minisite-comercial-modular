export interface AdminUserListItem {
  id: string;
  email: string;
  role: string;
  active: boolean;
  mustChangePassword: boolean;
  createdAt: string;
}

export class UsersApiError extends Error {
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
    throw new UsersApiError(response.status, code, message);
  }
  return body as T;
}

export async function listUsers(): Promise<AdminUserListItem[]> {
  const response = await fetch("/api/users");
  const data = await parseJsonOrThrow<{ users: AdminUserListItem[] }>(response);
  return data.users;
}

export async function createUser(input: { email: string; tempPassword: string }): Promise<AdminUserListItem> {
  const response = await fetch("/api/users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const data = await parseJsonOrThrow<{ user: AdminUserListItem }>(response);
  return data.user;
}

export async function setUserActive(id: string, active: boolean): Promise<AdminUserListItem> {
  const response = await fetch(`/api/users/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ active }),
  });
  const data = await parseJsonOrThrow<{ user: AdminUserListItem }>(response);
  return data.user;
}

export async function resetUserTempPassword(id: string, tempPassword: string): Promise<void> {
  const response = await fetch(`/api/users/${id}/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tempPassword }),
  });
  await parseJsonOrThrow<{ ok: true }>(response);
}

export async function deleteUser(id: string): Promise<void> {
  const response = await fetch(`/api/users/${id}`, { method: "DELETE" });
  await parseJsonOrThrow<{ ok: true }>(response);
}

export async function setNewPassword(newPassword: string): Promise<void> {
  const response = await fetch("/api/account/set-new-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ newPassword }),
  });
  await parseJsonOrThrow<{ ok: true }>(response);
}
