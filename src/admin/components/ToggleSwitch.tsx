interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
}

/**
 * Trilha em escala padrão do Tailwind (sem valores arbitrários): 44px de
 * trilha, bolinha de 20px com 2px de margem nos dois estados
 * (`translate-x-0` / `translate-x-5`) — nunca invade o conteúdo ao lado
 * porque o próprio switch é um elemento isolado, sem texto adjacente
 * dentro dele. Padrão único de toggle em todo o editor.
 */
export function ToggleSwitch({ checked, onChange, label }: ToggleSwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={`${checked ? "Desativar" : "Ativar"} ${label}`}
      onClick={() => onChange(!checked)}
      className={`inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-brand-blue-500/40 focus:ring-offset-1 ${
        checked ? "bg-brand-blue-600" : "bg-slate-200"
      }`}
    >
      <span aria-hidden className={`ml-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${checked ? "translate-x-5" : "translate-x-0"}`} />
    </button>
  );
}
