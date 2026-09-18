import { Outlet } from "react-router";
import { Sidebar } from "../components/Sidebar";

export function AppShell() {
  return (
    <div className="min-h-dvh w-full bg-slate-50 md:flex">
      <Sidebar />
      <main className="flex-1 p-6 md:p-10">
        <Outlet />
      </main>
    </div>
  );
}
