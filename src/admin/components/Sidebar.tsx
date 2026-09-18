import { NavLink, useNavigate } from "react-router";
import { BrandLogo, BrandMark } from "./BrandLogo";
import { CrownIcon, ImageIcon, LayoutGridIcon, LogOutIcon, SettingsIcon } from "./icons";
import { authClient } from "../lib/authClient";

const NAV_ITEMS = [
  { to: "/app/minisites", label: "Meus MiniSites", icon: LayoutGridIcon },
  { to: "/app/midia", label: "Mídia", icon: ImageIcon },
  { to: "/app/configuracoes", label: "Configurações", icon: SettingsIcon },
];

function navLinkClass(active: boolean) {
  return [
    "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition",
    active ? "bg-white/10 text-white" : "text-white/70 hover:bg-white/5 hover:text-white",
  ].join(" ");
}

function UpgradeCard() {
  return (
    <div className="rounded-2xl bg-white/5 p-4">
      <div className="flex items-center gap-2 text-white">
        <CrownIcon className="h-4 w-4 text-brand-cyan-400" />
        <p className="text-sm font-bold">Plano Profissional</p>
      </div>
      <p className="mt-1.5 text-xs leading-relaxed text-white/60">Mais possibilidades para o seu negócio.</p>
      <button
        type="button"
        className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl bg-white/10 px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/15"
      >
        Fazer upgrade
      </button>
    </div>
  );
}

export function Sidebar() {
  const navigate = useNavigate();

  async function handleSignOut() {
    await authClient.signOut();
    navigate("/login", { replace: true });
  }

  return (
    <>
      {/* Mobile: barra superior compacta */}
      <nav className="flex items-center justify-between gap-3 bg-brand-navy-950 px-4 py-3 md:hidden">
        <div className="flex items-center gap-2">
          <BrandMark size={28} />
          <span className="text-sm font-bold text-white">MiniSite</span>
        </div>
        <div className="flex items-center gap-1">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} className={({ isActive }) => navLinkClass(isActive)} aria-label={label}>
              <Icon className="h-5 w-5" />
            </NavLink>
          ))}
          <button
            type="button"
            onClick={handleSignOut}
            aria-label="Sair"
            className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-white/70 transition hover:bg-white/5 hover:text-white"
          >
            <LogOutIcon className="h-5 w-5" />
          </button>
        </div>
      </nav>

      {/* Desktop: coluna lateral completa */}
      <aside className="hidden md:flex md:w-64 md:shrink-0 md:flex-col md:bg-brand-navy-950 md:px-4 md:py-6">
        <div className="px-2">
          <BrandLogo size={32} tone="light" />
        </div>

        <nav className="mt-10 flex flex-1 flex-col gap-1">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} className={({ isActive }) => navLinkClass(isActive)}>
              <Icon className="h-5 w-5" />
              {label}
            </NavLink>
          ))}
        </nav>

        <UpgradeCard />

        <button
          type="button"
          onClick={handleSignOut}
          className="mt-3 flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-white/70 transition hover:bg-white/5 hover:text-white"
        >
          <LogOutIcon className="h-5 w-5" />
          Sair
        </button>
      </aside>
    </>
  );
}
