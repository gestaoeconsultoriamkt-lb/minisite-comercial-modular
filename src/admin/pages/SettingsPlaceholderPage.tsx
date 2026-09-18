import { SettingsIcon } from "../components/icons";

export function SettingsPlaceholderPage() {
  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="text-2xl font-extrabold tracking-tight text-brand-navy-900">Configurações</h1>
      <p className="mt-1 text-sm text-slate-500">Preferências da conta e da clínica.</p>

      <div className="mt-10 flex flex-col items-center rounded-3xl border border-dashed border-slate-200 bg-white px-6 py-16 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-blue-50">
          <SettingsIcon className="h-7 w-7 text-brand-blue-600" />
        </div>
        <p className="mt-5 text-base font-semibold text-brand-navy-900">Em construção</p>
        <p className="mt-1.5 max-w-sm text-sm text-slate-500">As telas de configuração chegam em uma fase futura.</p>
      </div>
    </div>
  );
}
