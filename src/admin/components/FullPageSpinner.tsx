export function FullPageSpinner() {
  return (
    <div className="flex min-h-dvh w-full items-center justify-center bg-white" role="status" aria-label="Carregando">
      <svg className="h-8 w-8 animate-spin text-brand-blue-500" viewBox="0 0 24 24" fill="none">
        <circle className="opacity-25" cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="3" />
        <path className="opacity-90" d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      </svg>
    </div>
  );
}
