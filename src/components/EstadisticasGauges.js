import { useEffect, useMemo, useState } from "react";
import { useAreas } from "../context/AreasContext";

const API_BASE = "https://smartindustries.org";

function StatCard({ label, valueText }) {
  return (
    <div className="border rounded-xl p-4 bg-white shadow-sm">
      <div className="text-sm text-gray-600">{label}</div>
      <div className="text-2xl font-semibold mt-1">{valueText}</div>
    </div>
  );
}

function formatMetricValue(value, unit = "") {
  const num = Number(value) || 0;
  if (unit === "%") return `${num.toFixed(2)}%`;
  if (unit === "u") return `${Math.round(num)}`;
  if (unit === "minutos") return `${Math.round(num)} minutos`;
  if (unit === "pzas/h") return `${num.toFixed(1)} pzas/h`;
  return `${num}`;
}

function buildCards(data, periodLabel) {
  if (!data) return [];
  return [
    {
      label: `Producción ${periodLabel.toLowerCase()}`,
      valueText: formatMetricValue(data.produccionTotal, "u"),
    },
    {
      label: `Velocidad promedio (${periodLabel.toLowerCase()})`,
      valueText: formatMetricValue(data.avgSpeed, "pzas/h"),
    },
    {
      label: `% no conformes (${periodLabel.toLowerCase()})`,
      valueText: formatMetricValue(data.porcentajeDefectos, "%"),
    },
    {
      label: `Tiempos muertos (${periodLabel.toLowerCase()})`,
      valueText: formatMetricValue(data.nptMin, "minutos"),
    },
  ];
}

export default function EstadisticasGauges() {
  const [areaId, setAreaId] = useState("");
  const { areas } = useAreas();
  const [dayData, setDayData] = useState(null);
  const [monthData, setMonthData] = useState(null);
  const hoy = useMemo(() => new Date().toISOString().split("T")[0], []);

  // áreas provienen del contexto compartido

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

  const dailyCards = useMemo(() => buildCards(dayData, "Diario"), [dayData]);
  const monthlyCards = useMemo(() => buildCards(monthData, "Mensual"), [monthData]);

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
          {dailyCards.map((g, i) => (
            <StatCard key={i} label={g.label} valueText={g.valueText} />
          ))}
        </div>

        <div className="mt-2 mb-3 text-lg font-semibold text-gray-700">Mensual</div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {monthlyCards.map((g, i) => (
            <StatCard key={i} label={g.label} valueText={g.valueText} />
          ))}
        </div>
      </div>
    </div>
  );
}
