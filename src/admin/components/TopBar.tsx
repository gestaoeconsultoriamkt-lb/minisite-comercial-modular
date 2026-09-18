import { authClient } from "../lib/authClient";
import { BellIcon, ChevronDownIcon, WindowIcon } from "./icons";

function greetingName(name: string | null | undefined, email: string | null | undefined): string {
  if (name && name.trim()) return name.trim().split(/\s+/)[0]!;
  if (email) {
    const localPart = email.split("@")[0] ?? email;
    return localPart.charAt(0).toUpperCase() + localPart.slice(1);
  }
  return "por aqui";
}

function initialsOf(name: string | null | undefined, email: string | null | undefined): string {
  const source = (name && name.trim()) || email || "?";
  const parts = source.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return `${parts[0]![0]}${parts[1]![0]}`.toUpperCase();
  return source.slice(0, 2).toUpperCase();
}

export function TopBar() {
  const { data: session } = authClient.useSession();
  const user = session?.user;
  const name = greetingName(user?.name, user?.email);
  const fullName = user?.name?.trim() || user?.email || "Usuário";

  return (
    <header className="flex items-center justify-between gap-4 border-b border-slate-100 bg-white px-6 py-4 md:px-10">
      <div className="flex items-center gap-3">
        <div className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-blue-50 text-brand-blue-600 sm:flex">
          <WindowIcon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-base font-bold text-brand-navy-900">Olá, {name}!</p>
          <p className="text-sm text-slate-500">Que bom ver você por aqui. 👋</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button
          type="button"
          aria-label="Notificações"
          className="relative rounded-full p-2 text-slate-400 transition hover:bg-slate-50 hover:text-brand-navy-900"
        >
          <BellIcon className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />
        </button>

        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-blue-600 text-xs font-bold text-white">
            {initialsOf(user?.name, user?.email)}
          </div>
          <div className="hidden text-left sm:block">
            <p className="text-sm font-semibold leading-tight text-brand-navy-900">{fullName}</p>
            <p className="flex items-center gap-0.5 text-xs text-slate-500">
              Minha conta
              <ChevronDownIcon className="h-3.5 w-3.5" />
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
