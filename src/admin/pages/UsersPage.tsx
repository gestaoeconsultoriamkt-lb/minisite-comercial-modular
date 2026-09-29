import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router";
import { useToast } from "../lib/toast";
import { authClient } from "../lib/authClient";
import { FullPageSpinner } from "../components/FullPageSpinner";
import {
  listUsers,
  setUserActive,
  deleteUser,
  UsersApiError,
  type AdminUserListItem,
} from "../lib/usersApi";
import { NewUserModal } from "../components/NewUserModal";
import { ResetTempPasswordModal } from "../components/ResetTempPasswordModal";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { Button } from "../components/Button";
import {
  AlertCircleIcon,
  ArrowLeftIcon,
  LockIcon,
  PlusIcon,
  PowerIcon,
  ShieldCheckIcon,
  TrashIcon,
  UsersIcon,
} from "../components/icons";

function formatDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" }).format(new Date(iso));
  } catch {
    return iso;
  }
}

/**
 * Configurações > Usuários — só para `role === "admin"` (o próprio
 * componente pai, SettingsPlaceholderPage, só mostra o link pra aqui
 * quando admin; esta página se protege de novo, direto, contra alguém
 * navegar pra URL sem ter o link — toda ação real ainda é validada no
 * backend, ver requireAdminApiAuth).
 */
export function UsersPage() {
  const { data: session, isPending } = authClient.useSession();
  const { showToast } = useToast();
  const currentUserId = session?.user.id;

  const [users, setUsers] = useState<AdminUserListItem[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [resetTarget, setResetTarget] = useState<AdminUserListItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminUserListItem | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function loadUsers() {
    setLoadError(null);
    try {
      setUsers(await listUsers());
    } catch (err) {
      setLoadError(err instanceof UsersApiError ? err.message : "Não foi possível carregar os usuários.");
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  function handleCreated(user: AdminUserListItem) {
    setUsers((prev) => (prev ? [user, ...prev] : [user]));
    setModalOpen(false);
    showToast("Usuário criado com sucesso.");
  }

  async function handleToggleActive(target: AdminUserListItem) {
    setBusyId(target.id);
    try {
      const updated = await setUserActive(target.id, !target.active);
      setUsers((prev) => prev?.map((u) => (u.id === updated.id ? updated : u)) ?? prev);
      showToast(updated.active ? "Usuário ativado." : "Usuário desativado.");
    } catch (err) {
      showToast(err instanceof UsersApiError ? err.message : "Não foi possível atualizar o usuário.", "error");
    } finally {
      setBusyId(null);
    }
  }

  function handleResetDone() {
    setResetTarget(null);
    showToast("Senha temporária redefinida. O usuário precisará trocá-la no próximo acesso.");
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteUser(deleteTarget.id);
      setUsers((prev) => prev?.filter((u) => u.id !== deleteTarget.id) ?? prev);
      showToast("Usuário excluído.");
      setDeleteTarget(null);
    } catch (err) {
      showToast(err instanceof UsersApiError ? err.message : "Não foi possível excluir o usuário.", "error");
    } finally {
      setDeleting(false);
    }
  }

  if (isPending) return <FullPageSpinner />;
  if (session?.user.role !== "admin") return <Navigate to="/app/configuracoes" replace />;

  const hasAny = (users?.length ?? 0) > 0;

  return (
    <div className="mx-auto max-w-5xl">
      <Link to="/app/configuracoes" className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-blue-600 hover:underline">
        <ArrowLeftIcon className="h-4 w-4" />
        Voltar para Configurações
      </Link>

      <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-brand-navy-900">Usuários</h1>
          <p className="mt-1 text-sm text-slate-500">Crie e gerencie o acesso de outras pessoas ao painel.</p>
        </div>
        <Button type="button" fullWidth={false} icon={<PlusIcon className="h-4 w-4" />} onClick={() => setModalOpen(true)}>
          Novo usuário
        </Button>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.06),0_18px_36px_-20px_rgba(15,23,42,0.22)]">
        {users === null && !loadError ? (
          <div className="flex flex-col gap-3 p-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-14 animate-pulse rounded-xl bg-slate-100" />
            ))}
          </div>
        ) : loadError ? (
          <div className="flex flex-col items-center gap-3 px-6 py-14 text-center">
            <AlertCircleIcon className="h-8 w-8 text-red-500" />
            <p className="text-sm font-semibold text-red-700">{loadError}</p>
            <Button type="button" variant="secondary" fullWidth={false} onClick={loadUsers}>
              Tentar novamente
            </Button>
          </div>
        ) : !hasAny ? (
          <div className="flex flex-col items-center px-6 py-14 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-blue-50">
              <UsersIcon className="h-7 w-7 text-brand-blue-600" />
            </div>
            <p className="mt-5 text-base font-semibold text-brand-navy-900">Nenhum usuário ainda.</p>
            <p className="mt-1.5 max-w-sm text-sm text-slate-500">Crie o primeiro usuário para liberar acesso ao painel.</p>
          </div>
        ) : (
          <div className="flex flex-col divide-y divide-slate-100">
            {users!.map((u) => (
              <div key={u.id} className="flex flex-wrap items-center gap-4 px-5 py-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-bold text-brand-navy-900">{u.email}</p>
                    {u.role === "admin" ? (
                      <span className="flex items-center gap-1 rounded-full bg-brand-blue-50 px-2 py-0.5 text-[11px] font-semibold text-brand-blue-700">
                        <ShieldCheckIcon className="h-3 w-3" />
                        Admin
                      </span>
                    ) : null}
                    {u.mustChangePassword ? (
                      <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700">
                        Troca de senha pendente
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-0.5 text-xs text-slate-400">Criado em {formatDate(u.createdAt)}</p>
                </div>

                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                    u.active ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"
                  }`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${u.active ? "bg-emerald-500" : "bg-red-500"}`} />
                  {u.active ? "Ativo" : "Desativado"}
                </span>

                <div className="flex shrink-0 items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setResetTarget(u)}
                    aria-label="Redefinir senha temporária"
                    title="Redefinir senha temporária"
                    className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-brand-navy-900"
                  >
                    <LockIcon className="h-4.5 w-4.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleToggleActive(u)}
                    disabled={u.id === currentUserId || busyId === u.id}
                    aria-label={u.active ? "Desativar usuário" : "Ativar usuário"}
                    title={u.id === currentUserId ? "Você não pode desativar a própria conta" : u.active ? "Desativar" : "Ativar"}
                    className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-brand-navy-900 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <PowerIcon className="h-4.5 w-4.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(u)}
                    disabled={u.id === currentUserId}
                    aria-label="Excluir usuário"
                    title={u.id === currentUserId ? "Você não pode excluir a própria conta" : "Excluir"}
                    className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <TrashIcon className="h-4.5 w-4.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <NewUserModal open={modalOpen} onClose={() => setModalOpen(false)} onCreated={handleCreated} />

      <ResetTempPasswordModal
        open={Boolean(resetTarget)}
        userId={resetTarget?.id ?? null}
        userEmail={resetTarget?.email ?? null}
        onClose={() => setResetTarget(null)}
        onDone={handleResetDone}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Excluir usuário"
        description={`Tem certeza que deseja excluir "${deleteTarget?.email ?? ""}"? Esta ação não pode ser desfeita.`}
        loading={deleting}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
