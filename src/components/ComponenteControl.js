
import { useEffect, useState, useContext } from "react";
import { ExpandButton, ExpandContext } from "./ExpandableCard";


const Gauge = ({ value, label }) => {
  const [angle, setAngle] = useState(-90);

  useEffect(() => {
    let num = parseFloat(value);
    const normalized = Math.min(Math.max(num, 0), 100);
    const newAngle = -90 + (normalized / 100) * 180;
    setAngle(newAngle);
  }, [value]);

  const labelMap = {
    "Vel. prod. promedio": "Velocidad promedio de producción",
    "Defectos": "Cantidad de defectos",
    "TPN promedio (min)": "Tiempo perdido promedio (minutos)"
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-24 h-14">
        <svg viewBox="0 0 100 50" className="w-full h-full">
          <defs>
            <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#4ade80" />
              <stop offset="50%" stopColor="#facc15" />
              <stop offset="100%" stopColor="#f87171" />
            </linearGradient>
          </defs>
          <path d="M10,50 A40,40 0 0,1 90,50" fill="none" stroke="url(#gaugeGradient)" strokeWidth="20" />
          <line x1="50" y1="50" x2="50" y2="10" stroke="black" strokeWidth="3" strokeLinecap="round" transform={`rotate(${angle}, 50, 50)`} />
        </svg>
      </div>
      <div className="text-md text-center mb-1 flex items-center justify-center gap-1 relative group">
        <span className="cursor-pointer">{label}</span>
        <div className="absolute top-full mt-1 px-2 py-1 bg-white text-black text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 max-w-[160px] text-center break-words">
          {labelMap[label]}
        </div>
      </div>
      <div className="text-md text-semibold mt-1">{value}</div>
    </div>
  );
};

const Area = ({ nombre, trabajadores }) => {
  const promedio = key => {
    const total = trabajadores.reduce((acc, t) => acc + Number(t[key]), 0);
    return (total / trabajadores.length).toFixed(1);
  };

  const gauges = [
    { label: "Vel. prod. promedio", value: promedio("produccion") },
    { label: "Defectos", value: promedio("defectos") },
    { label: "TPN promedio (min)", value: promedio("npt") }
  ];

  return (
    <div className="mb-6">
      <h3 className="text-blue-600 text-2xl font-bold mb-2">{nombre}</h3>
      <table className="w-full text-md mb-4 border border-dashed border-gray-400">
        <thead>
          <tr>
            <th className="text-left border border-dashed border-gray-400 px-2 py-1">Máquina</th>
            <th className="text-left border border-dashed border-gray-400 px-2 py-1">Trabajador</th>
            <th className="text-left border border-dashed border-gray-400 px-2 py-1">Producción</th>
            <th className="text-left border border-dashed border-gray-400 px-2 py-1">Defectos</th>
            <th className="text-left border border-dashed border-gray-400 px-2 py-1">NPT (min)</th>
          </tr>
        </thead>
        <tbody>
          {trabajadores.map((t, i) => (
            <tr key={i}>
              <td className="border border-dashed border-gray-400 px-2 py-1">{t.maquina}</td>
              <td className="border border-dashed border-gray-400 px-2 py-1">{t.trabajador}</td>
              <td className="border border-dashed border-gray-400 px-2 py-1">{t.produccion}</td>
              <td className="border border-dashed border-gray-400 px-2 py-1">{t.defectos}</td>
              <td className="border border-dashed border-gray-400 px-2 py-1">{t.npt}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="grid grid-cols-3 gap-4">
        {gauges.map((g, i) => <Gauge key={i} {...g} />)}
      </div>
    </div>
  );
};


export default function ComponenteControl() {
  const { expanded } = useContext(ExpandContext);
  const areas = [
    {
      nombre: "Troquelado",
      trabajadores: [
        { trabajador: "Carlos Pérez", maquina: "2", produccion: 100, defectos: 2, npt: 30 },
        { trabajador: "Lucía Rojas", maquina: "6", produccion: 95, defectos: 1, npt: 28 },
        { trabajador: "José Ramírez", maquina: "7", produccion: 88, defectos: 3, npt: 35 },
        { trabajador: "Elena Torres", maquina: "8", produccion: 90, defectos: 0, npt: 27 }
      ],
      gauges: [
        { label: "Prod. Speed", value: "30" },
        { label: "Defects", value: "1.5" },
        { label: "NPT (min)", value: "30" }
      ]
    },
    {
      nombre: "Vulcanizado",
      trabajadores: [
        { trabajador: "Ana Gómez", maquina: "5", produccion: 80, defectos: 1, npt: 20 },
        { trabajador: "Pedro Silva", maquina: "9", produccion: 85, defectos: 2, npt: 22 },
        { trabajador: "Daniela Pardo", maquina: "10", produccion: 78, defectos: 0, npt: 18 },
        { trabajador: "Esteban Mora", maquina: "11", produccion: 82, defectos: 1, npt: 19 }
      ],
      gauges: [
        { label: "Prod. Speed", value: "32" },
        { label: "Defects", value: "1" },
        { label: "NPT (min)", value: "20" }
      ]
    },
    {
      nombre: "Soldadura",
      trabajadores: [
        { trabajador: "Luis Díaz", maquina: "3", produccion: 90, defectos: 3, npt: 25 },
        { trabajador: "Mariana Torres", maquina: "12", produccion: 88, defectos: 2, npt: 23 },
        { trabajador: "Camilo Reyes", maquina: "13", produccion: 91, defectos: 1, npt: 21 },
        { trabajador: "Nathalia Suárez", maquina: "14", produccion: 86, defectos: 2, npt: 22 }
      ],
      gauges: [
        { label: "Prod. Speed", value: "29" },
        { label: "Defects", value: "2" },
        { label: "NPT (min)", value: "23" }
      ]
    }
  ];

  return (
    <div className={`w-full ${expanded ? "h-full flex flex-col" : ""}`}> 
      <div className="flex justify-between items-center pb-8  text-md ">
        <h2 className="text-2xl font-semibold">Control</h2>
        <div className="flex items-center gap-4 text-base">
          <label>De <input type="date" className="ml-1 border px-2 py-1 rounded text-black" /></label>
          <label>A <input type="date" className="ml-1 border px-2 py-1 rounded text-black" /></label>
          <ExpandButton />
        </div>
      </div>

      <div className={`border rounded-2xl shadow-md p-4 w-full ${expanded ? "flex-1 overflow-y-auto" : "max-h-[320px] overflow-y-scroll"}`}>
        <div className="mb-6">
          <h3 className="text-xl mb-4 font-semibold">Estadísticas globales</h3>
          <div className="grid grid-cols-3 gap-4">
            <Gauge label="Vel. prod. promedio" value="30" />
            <Gauge label="Defectos" value="2" />
            <Gauge label="TPN promedio (min)" value="5" />
          </div>
        </div>

        {areas.map((area, i) => <Area key={i} {...area} />)}
      </div>
    </div>
  );
}
