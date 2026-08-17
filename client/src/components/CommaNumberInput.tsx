import { useEffect, useState } from "react";

export function CommaNumberInput({ value, onValueChange, min = 0, step = "any", ariaLabel }: { value: number; onValueChange: (value: number) => void; min?: number; step?: number | "any"; ariaLabel: string }) {
  const [display, setDisplay] = useState(() => new Intl.NumberFormat("ko-KR", { maximumFractionDigits: 6 }).format(value));
  const [error, setError] = useState("");
  useEffect(() => setDisplay(new Intl.NumberFormat("ko-KR", { maximumFractionDigits: 6 }).format(value)), [value]);
  return <span className="comma-number-input"><input aria-label={ariaLabel} aria-invalid={Boolean(error)} inputMode="decimal" step={step} value={display} onChange={(event) => {
    const raw = event.target.value.replace(/,/g, "");
    if (raw === "") { setDisplay(""); setError("값을 입력하세요."); return; }
    if (!/^\d*(\.\d*)?$/.test(raw)) { setError("숫자만 입력하세요."); return; }
    const next = Number(raw);
    if (!Number.isFinite(next) || next < min) { setError(`${min} 이상의 숫자를 입력하세요.`); return; }
    setError(""); onValueChange(next); setDisplay(new Intl.NumberFormat("ko-KR", { maximumFractionDigits: 6 }).format(next));
  }} onBlur={() => { if (!display) setError("값을 입력하세요."); else setDisplay(new Intl.NumberFormat("ko-KR", { maximumFractionDigits: 6 }).format(value)); }} />{error && <small className="input-error" role="alert">{error}</small>}</span>;
}
