import { useEffect, useRef, useState } from "react";
import { HexColorPicker } from "react-colorful";

interface ColorFieldProps {
  label: string;
  value: string;
  onChange: (hex: string) => void;
}

const HEX_PATTERN = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

/**
 * Compartilhado pelas 3 cores da identidade visual (primária, secundária,
 * texto dos botões) — mesmo padrão de UX para todas: swatch + hex digitável
 * + picker visual, sempre em sincronia com o valor real do config.
 */
export function ColorField({ label, value, onChange }: ColorFieldProps) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState(value);
  const focusedRef = useRef(false);

  // Resincroniza com o valor externo quando o campo não está em edição —
  // cobre o config sendo recarregado (ex.: trocar de MiniSite sem
  // desmontar o editor) sem sobrescrever o que o usuário está digitando.
  useEffect(() => {
    if (!focusedRef.current) setText(value);
  }, [value]);

  function commitText(next: string) {
    setText(next);
    if (HEX_PATTERN.test(next)) onChange(next);
  }

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-semibold text-brand-navy-900">{label}</label>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-label={`Escolher ${label.toLowerCase()}`}
          className="h-10 w-10 shrink-0 rounded-xl border border-slate-200 shadow-sm transition hover:border-slate-300 hover:shadow-md focus:outline-none focus:ring-[3px] focus:ring-brand-blue-500/15"
          style={{ backgroundColor: HEX_PATTERN.test(value) ? value : "#ffffff" }}
        />
        <input
          type="text"
          value={text}
          onChange={(e) => commitText(e.target.value)}
          onFocus={() => {
            focusedRef.current = true;
          }}
          onBlur={() => {
            focusedRef.current = false;
            setText(HEX_PATTERN.test(value) ? value : text);
          }}
          placeholder="#000000"
          className="w-28 rounded-xl border border-slate-200 px-2.5 py-2 text-sm uppercase text-slate-900 shadow-[inset_0_1px_2px_rgba(15,23,42,0.03)] transition hover:border-slate-300 focus:border-brand-blue-500 focus:outline-none focus:ring-[3px] focus:ring-brand-blue-500/15"
        />
      </div>
      {open ? (
        <div className="mt-1">
          <HexColorPicker
            color={HEX_PATTERN.test(value) ? value : "#000000"}
            onChange={(hex) => {
              setText(hex);
              onChange(hex);
            }}
          />
        </div>
      ) : null}
    </div>
  );
}
