import { useState } from "react";
import { Link } from "react-router";
import { authClient } from "../lib/authClient";
import { useToast } from "../lib/toast";
import { ChangeMyPasswordModal } from "../components/ChangeMyPasswordModal";
import { ChevronRightIcon, LockIcon, SettingsIcon, UsersIcon } from "../components/icons";

export function SettingsPlaceholderPage() {
  const { data: session } = authClient.useSession();
  const { showToast } = useToast();
  const isAdmin = session?.user.role === "admin";
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="text-2xl font-extrabold tracking-tight text-brand-navy-900">Configurações</h1>
      <p className="mt-1 text-sm text-slate-500">Preferências da conta e da clínica.</p>

      <button
        type="button"
        onClick={() => setChangePasswordOpen(true)}
        className="mt-6 flex w-full items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:border-brand-blue-200 hover:shadow"
      >
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-blue-50 text-brand-blue-600">
          <LockIcon className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-brand-navy-900">Minha conta</p>
          <p className="mt-0.5 text-sm text-slate-500">Trocar minha senha.</p>
        </div>
        <ChevronRightIcon className="h-4 w-4 shrink-0 text-slate-300" />
      </button>

      <ChangeMyPasswordModal
        open={changePasswordOpen}
        onClose={() => setChangePasswordOpen(false)}
        onDone={() => {
          setChangePasswordOpen(false);
          showToast("Senha alterada com sucesso.");
        }}
      />

      {isAdmin ? (
        <Link
          to="/app/configuracoes/usuarios"
          className="mt-6 flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-brand-blue-200 hover:shadow"
        >
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-blue-50 text-brand-blue-600">
            <UsersIcon className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-brand-navy-900">Usuários</p>
            <p className="mt-0.5 text-sm text-slate-500">Crie e gerencie o acesso de outras pessoas ao painel.</p>
          </div>
          <ChevronRightIcon className="h-4 w-4 shrink-0 text-slate-300" />
        </Link>
      ) : null}

      <div className="mt-6 flex flex-col items-center rounded-3xl border border-dashed border-slate-200 bg-white px-6 py-16 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-blue-50">
          <SettingsIcon className="h-7 w-7 text-brand-blue-600" />
        </div>
        <p className="mt-5 text-base font-semibold text-brand-navy-900">Em construção</p>
        <p className="mt-1.5 max-w-sm text-sm text-slate-500">As demais telas de configuração chegam em uma fase futura.</p>
      </div>
    </div>
  );
}
