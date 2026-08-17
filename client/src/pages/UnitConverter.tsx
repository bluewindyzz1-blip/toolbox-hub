import { useEffect, useMemo, useState } from "react";
import { ArrowRightLeft } from "lucide-react";
import { ToolFrame } from "@/components/ToolLayout";
import { convertUnit, unitDefinitions } from "@shared/toolbox";

const categoryLabels: Record<string, string> = { length: "길이", weight: "무게", temperature: "온도", area: "넓이", volume: "부피", speed: "속도", data: "데이터", time: "시간", pressure: "압력", energy: "에너지" };

export default function UnitConverter({ initialCategory = "length" }: { initialCategory?: string }) {
  const initialKeys = Object.keys(unitDefinitions[initialCategory] ?? unitDefinitions.length);
  const [category, setCategory] = useState(initialCategory in unitDefinitions ? initialCategory : "length");
  const [from, setFrom] = useState(initialKeys[0] ?? "m");
  const [to, setTo] = useState(initialKeys[1] ?? initialKeys[0] ?? "m");
  const [value, setValue] = useState(1);
  const units = unitDefinitions[category];
  const result = useMemo(() => convertUnit(value, category, from, to), [value, category, from, to]);
  useEffect(() => { if (initialCategory in unitDefinitions) { const keys = Object.keys(unitDefinitions[initialCategory]); setCategory(initialCategory); setFrom(keys[0]); setTo(keys[1] ?? keys[0]); } }, [initialCategory]);
  function changeCategory(next: string) { const keys = Object.keys(unitDefinitions[next]); setCategory(next); setFrom(keys[0]); setTo(keys[1] ?? keys[0]); }
  function swap() { setFrom(to); setTo(from); }
  return (
    <ToolFrame index="05" tag="UNIT ENGINE" title="단위 변환기" description="길이·넓이·무게·부피·온도부터 속도·데이터·시간·압력·에너지까지 빠르게 환산합니다.">
      <section className="unit-shell">
        <div className="category-tabs">{Object.entries(categoryLabels).map(([key, label]) => <button key={key} className={category === key ? "selected" : ""} onClick={() => changeCategory(key)}>{label}</button>)}</div>
        <div className="unit-grid"><div className="unit-field"><label>변환 전</label><input type="number" value={value} onChange={(event) => setValue(Number(event.target.value))} /><select value={from} onChange={(event) => setFrom(event.target.value)}>{Object.entries(units).map(([key, unit]) => <option value={key} key={key}>{unit.label}</option>)}</select></div><button className="swap-button" onClick={swap} aria-label="변환 단위 바꾸기"><ArrowRightLeft size={25} /></button><div className="unit-field result-field"><label>변환 후</label><output>{new Intl.NumberFormat("ko-KR", { maximumFractionDigits: 6 }).format(result)}</output><select value={to} onChange={(event) => setTo(event.target.value)}>{Object.entries(units).map(([key, unit]) => <option value={key} key={key}>{unit.label}</option>)}</select></div></div>
        <p className="conversion-sentence">{value} {units[from].label} = <b>{new Intl.NumberFormat("ko-KR", { maximumFractionDigits: 6 }).format(result)} {units[to].label}</b></p>
      </section>
    </ToolFrame>
  );
}
