import { useState } from "react";
import { HexColorPicker } from "react-colorful";

interface ColorFieldProps {
  label: string;
  value: string;
  onChange: (hex: string) => void;
}

const HEX_PATTERN = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

export function ColorField({ label, value, onChange }: ColorFieldProps) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState(value);

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
          className="h-10 w-10 shrink-0 rounded-lg border border-slate-200 shadow-sm"
          style={{ backgroundColor: HEX_PATTERN.test(value) ? value : "#ffffff" }}
        />
        <input
          type="text"
          value={text}
          onChange={(e) => commitText(e.target.value)}
          onBlur={() => setText(HEX_PATTERN.test(value) ? value : text)}
          placeholder="#000000"
          className="w-28 rounded-lg border border-slate-200 px-2.5 py-2 text-sm uppercase text-slate-900 focus:border-brand-blue-500 focus:outline-none focus:ring-2 focus:ring-brand-blue-500/40"
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
