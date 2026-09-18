import { LayoutGridIcon } from "../components/icons";

/**
 * Estado provisório da Tela 2. Cards, busca, filtros, ordenação e "Novo
 * MiniSite" chegam na próxima fase — aqui só existe o cabeçalho e um
 * empty-state coerente com a identidade visual.
 */
export function MiniSitesPlaceholderPage() {
  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="text-2xl font-extrabold tracking-tight text-brand-navy-900">Meus MiniSites</h1>
      <p className="mt-1 text-sm text-slate-500">Crie e gerencie de forma simples e rápida.</p>

      <div className="mt-10 flex flex-col items-center rounded-3xl border border-dashed border-slate-200 bg-white px-6 py-16 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-blue-50">
          <LayoutGridIcon className="h-7 w-7 text-brand-blue-600" />
        </div>
        <p className="mt-5 text-base font-semibold text-brand-navy-900">Nenhum MiniSite por aqui ainda</p>
        <p className="mt-1.5 max-w-sm text-sm text-slate-500">
          A criação, os cards, a busca e os filtros chegam na próxima fase.
        </p>
      </div>
    </div>
  );
}
