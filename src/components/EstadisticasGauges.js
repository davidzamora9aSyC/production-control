import { useEffect, useMemo, useState } from "react";

const API_BASE = "https://smartindustries.org";

function Gauge({ percent, label, valueText }) {
  const clamped = Math.max(0, Math.min(100, Number(percent) || 0));
  const angle = -90 + (clamped / 100) * 180;

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-28 h-16">
        <svg viewBox="0 0 100 50" className="w-full h-full">
          <defs>
            <linearGradient id="gaugeGradient2" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#4ade80" />
              <stop offset="50%" stopColor="#facc15" />
              <stop offset="100%" stopColor="#f87171" />
            </linearGradient>
          </defs>
          <path d="M10,50 A40,40 0 0,1 90,50" fill="none" stroke="url(#gaugeGradient2)" strokeWidth="20" />
          <line x1="50" y1="50" x2="50" y2="10" stroke="black" strokeWidth="3" strokeLinecap="round" transform={`rotate(${angle}, 50, 50)`} />
        </svg>
      </div>
      <div className="text-sm text-center mt-1">{label}</div>
      <div className="text-base font-semibold">{valueText}</div>
    </div>
  );
}

export default function EstadisticasGauges() {
  const [areaId, setAreaId] = useState("");
  const [areas, setAreas] = useState([]);
  const [dayData, setDayData] = useState(null);
  const [monthData, setMonthData] = useState(null);
  const hoy = useMemo(() => new Date().toISOString().split("T")[0], []);

  useEffect(() => {
    const loadAreas = async () => {
      try {
        const res = await fetch(`${API_BASE}/areas`);
        const list = await res.json();
        const arr = Array.isArray(list) ? list : [];
        setAreas(arr);
        // Dejar "Todos" ("") como selección por defecto si no hay selección
      } catch {
        setAreas([]);
      }
    };
    loadAreas();
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const [diaRes, mesRes] = await Promise.all([
          fetch(`${API_BASE}/indicadores/resumen/dia?fecha=${hoy}`),
          fetch(`${API_BASE}/indicadores/resumen/mes-actual`),
        ]);
        const diaAll = await diaRes.json();
        const mesAll = await mesRes.json();

        const agg = (arr) => {
          if (!Array.isArray(arr) || arr.length === 0) return null;
          const totalProd = arr.reduce((a, r) => a + (Number(r.produccionTotal) || 0), 0);
          const totalDef = arr.reduce((a, r) => a + (Number(r.defectos) || 0), 0);
          const totalNPT = arr.reduce((a, r) => a + (Number(r.nptMin) || 0), 0);
          const totalPausas = arr.reduce((a, r) => a + (Number(r.pausasMin) || 0), 0);
          const totalDur = arr.reduce((a, r) => a + (Number(r.duracionTotalMin) || 0), 0);
          const pctDef = (totalProd + totalDef) > 0 ? (totalDef / (totalProd + totalDef)) * 100 : 0;
          const avgSpeed = totalDur > 0
            ? arr.reduce((a, r) => a + (Number(r.avgSpeed) || 0) * (Number(r.duracionTotalMin) || 0), 0) / totalDur
            : (arr.reduce((a, r) => a + (Number(r.avgSpeed) || 0), 0) / arr.length);
          return {
            produccionTotal: totalProd,
            defectos: totalDef,
            nptMin: totalNPT,
            pausasMin: totalPausas,
            duracionTotalMin: totalDur,
            porcentajeDefectos: pctDef,
            avgSpeed: avgSpeed,
          };
        };

        if (areaId) {
          const areaIdStr = String(areaId);
          setDayData(Array.isArray(diaAll) ? diaAll.find(r => String(r.areaId) === areaIdStr) : null);
          setMonthData(Array.isArray(mesAll) ? mesAll.find(r => String(r.areaId) === areaIdStr) : null);
        } else {
          setDayData(Array.isArray(diaAll) ? agg(diaAll) : null);
          setMonthData(Array.isArray(mesAll) ? agg(mesAll) : null);
        }
      } catch {
        setDayData(null);
        setMonthData(null);
      }
    };
    load();
  }, [areaId, hoy]);

  // Helpers to build gauges with display text and a naive percent mapping
  const buildGauge = (label, value, unit, maxForGauge = 100) => {
    const num = Number(value) || 0;
    const percent = maxForGauge ? Math.min(100, (num / maxForGauge) * 100) : 0;
    const valueText = unit === "%" ? `${num}%` : unit ? `${num} ${unit}` : `${num}`;
    return { label, percent, valueText };
  };

  // Daily gauges
  const dailyGauges = useMemo(() => {
    if (!dayData) return [];
    return [
      buildGauge("Producción diaria", dayData.produccionTotal, "u", 1000),
      buildGauge("Velocidad promedio (día)", dayData.avgSpeed, "", 200),
      buildGauge("% no conformes (día)", dayData.porcentajeDefectos, "%", 100),
      buildGauge("NPT (min, día)", dayData.nptMin, "min", 480),
    ];
  }, [dayData]);

  const monthlyGauges = useMemo(() => {
    if (!monthData) return [];
    return [
      buildGauge("Producción mensual", monthData.produccionTotal, "u", 30000),
      buildGauge("Velocidad promedio (mes)", monthData.avgSpeed, "", 200),
      buildGauge("% no conformes (mes)", monthData.porcentajeDefectos, "%", 100),
      buildGauge("NPT (min, mes)", monthData.nptMin, "min", 20000),
    ];
  }, [monthData]);

  return (
    <div className="mb-20">
      <div className="flex justify-between mb-6 items-end">
        <h3 className="font-semibold text-2xl">Indicadores clave</h3>
        <select
          value={areaId}
          onChange={e => setAreaId(e.target.value)}
          className="border-b border-black text-xl focus:outline-none"
        >
          <option value="">Todos</option>
          {areas.map(area => (
            <option key={area.id} value={area.id}>{area.nombre}</option>
          ))}
        </select>
      </div>

      <div className="border rounded-2xl shadow-md p-4">
        <div className="mb-3 text-lg font-semibold text-gray-700">Diario</div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
          {dailyGauges.map((g, i) => (
            <Gauge key={i} percent={g.percent} label={g.label} valueText={g.valueText} />
          ))}
        </div>

        <div className="mt-2 mb-3 text-lg font-semibold text-gray-700">Mensual</div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {monthlyGauges.map((g, i) => (
            <Gauge key={i} percent={g.percent} label={g.label} valueText={g.valueText} />
          ))}
        </div>
      </div>
    </div>
  );
}
