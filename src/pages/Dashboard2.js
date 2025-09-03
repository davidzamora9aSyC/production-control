import { useState, useEffect } from "react";
import ProduccionChart from "../components/ProduccionChart";
import IndicadorChart from "../components/IndicadorChart";
import ComponenteControl from "../components/ComponenteControl";
import EstadisticasPanel from "../components/EstadisticasPanel";
import AlertasComponent from "../components/AlertasComponent";
import ExpandableCard from "../components/ExpandableCard";


function GeneralView() {
  const [fechaHora, setFechaHora] = useState(new Date());

  useEffect(() => {
    const intervalo = setInterval(() => setFechaHora(new Date()), 1000);
    return () => clearInterval(intervalo);
  }, []);

  return (
    <div className="h-full overflow-y-auto p-6 space-y-6">
      <div className="flex justify-between items-center mb-2">
        <div className="font-semibold text-4xl">Resumen general</div>
        <div className="text-sm text-gray-600">{fechaHora.toLocaleString()}</div>
      </div>
      <ExpandableCard>
        <ProduccionChart />
      </ExpandableCard>
      <ExpandableCard>
        <IndicadorChart metricKey="porcentajeDefectos" title="% No conformes por" />
      </ExpandableCard>
      <ExpandableCard>
        <IndicadorChart metricKey="porcentajeNPT" title="% NPT por" />
      </ExpandableCard>
      <ExpandableCard>
        <IndicadorChart metricKey="avgSpeed" title="Velocidad promedio por" isPercent={false} />
      </ExpandableCard>
      <EstadisticasPanel />
      <ExpandableCard>
        <ComponenteControl />
      </ExpandableCard>
      <ExpandableCard>
        <AlertasComponent />
      </ExpandableCard>

    </div>
  );
}

function TrabajadoresMejores() {
  return (
    <div className="p-6 space-y-4 overflow-y-auto h-full">
      <h2 className="text-2xl font-semibold">Comparativa de trabajadores</h2>
      <div className="flex flex-wrap gap-4">
        <div>
          <label className="block mb-1">Área</label>
          <select className="border rounded p-2">
            <option>Área 1</option>
            <option>Área 2</option>
            <option>Área 3</option>
          </select>
        </div>
        <div>
          <label className="block mb-1">Métrica</label>
          <select className="border rounded p-2">
            <option>Producción</option>
            <option>Eficiencia</option>
            <option>Calidad</option>
          </select>
        </div>
      </div>
      <div className="mt-4 border rounded p-4 text-gray-500">
        Aquí se mostrará la comparativa de trabajadores seleccionados.
      </div>
    </div>
  );
}

function MaquinasMejores() {
  return (
    <div className="p-6 space-y-4 overflow-y-auto h-full">
      <h2 className="text-2xl font-semibold">Comparativa de máquinas</h2>
      <div className="flex flex-wrap gap-4">
        <div>
          <label className="block mb-1">Área</label>
          <select className="border rounded p-2">
            <option>Área 1</option>
            <option>Área 2</option>
            <option>Área 3</option>
          </select>
        </div>
        <div>
          <label className="block mb-1">Métrica</label>
          <select className="border rounded p-2">
            <option>Rendimiento</option>
            <option>Disponibilidad</option>
            <option>Uso</option>
          </select>
        </div>
      </div>
      <div className="mt-4 border rounded p-4 text-gray-500">
        Aquí se mostrará la comparativa de máquinas seleccionadas.
      </div>
    </div>
  );
}

export default function Dashboard2() {
  const [view, setView] = useState("general");

  let content;
  switch (view) {
    case "trabajadores":
      content = <TrabajadoresMejores />;
      break;
    case "maquinas":
      content = <MaquinasMejores />;
      break;
    default:
      content = <GeneralView />;
  }

  return (
    <div className="flex h-screen">
      <aside className="w-64 bg-gray-100 border-r p-4 space-y-6">
        <nav className="space-y-4">
          <div>
            <button
              onClick={() => setView("general")}
              className={`block w-full text-left p-2 rounded hover:bg-gray-200 ${view === "general" ? "bg-gray-200" : ""}`}
            >
              General
            </button>
          </div>
          <div>
            <div className="font-semibold text-gray-700 mb-2">Trabajadores</div>
            <button
              onClick={() => setView("trabajadores")}
              className={`block w-full text-left p-2 rounded hover:bg-gray-200 ${view === "trabajadores" ? "bg-gray-200" : ""}`}
            >
              Ver mejores
            </button>
          </div>
          <div>
            <div className="font-semibold text-gray-700 mb-2">Máquina</div>
            <button
              onClick={() => setView("maquinas")}
              className={`block w-full text-left p-2 rounded hover:bg-gray-200 ${view === "maquinas" ? "bg-gray-200" : ""}`}
            >
              Ver mejores
            </button>
          </div>
        </nav>
      </aside>
      <main className="flex-1 overflow-hidden">
        {content}
      </main>
    </div>
  );
}
