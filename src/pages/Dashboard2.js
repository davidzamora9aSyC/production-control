import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import ProduccionChart from "../components/ProduccionChart";
import IndicadorChart from "../components/IndicadorChart";
import EstadisticasGauges from "../components/EstadisticasGauges";
import AlertasComponent from "../components/AlertasComponent";
import ExpandableCard from "../components/ExpandableCard";
import AreaRealtimeSpeed from "../components/AreaRealtimeSpeed";
import SesionesVelocidadNormalizada from "../components/SesionesVelocidadNormalizada";
import IndicadoresLista from "../components/IndicadoresLista";


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
      <EstadisticasGauges />
      <ExpandableCard>
        <ProduccionChart />
      </ExpandableCard>
      <ExpandableCard>
        <AreaRealtimeSpeed />
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
    </div>
  );
}

function AreasView() {
  return (
    <div className="p-6 space-y-6 overflow-y-auto h-full">
      <h2 className="text-2xl font-semibold">Indicadores por áreas</h2>
      <ExpandableCard>
        <AreaRealtimeSpeed />
      </ExpandableCard>
      <ExpandableCard>
        <SesionesVelocidadNormalizada />
      </ExpandableCard>
    </div>
  );
}

function TrabajadoresMejores() {
  const ResumenTrabajador = require("../components/ResumenTrabajador").default;
  return (
    <div className="p-6 space-y-6 overflow-y-auto h-full">
      <h2 className="text-2xl font-semibold">Trabajadores</h2>
      <ExpandableCard>
        <IndicadoresLista tipo="trabajadores" />
      </ExpandableCard>
      <ExpandableCard>
        <ResumenTrabajador />
      </ExpandableCard>
    </div>
  );
}

function MaquinasMejores() {
  const ResumenMaquina = require("../components/ResumenMaquina").default;
  return (
    <div className="p-6 space-y-6 overflow-y-auto h-full">
      <h2 className="text-2xl font-semibold">Máquinas</h2>
      <ExpandableCard>
        <IndicadoresLista tipo="maquinas" />
      </ExpandableCard>
      <ExpandableCard>
        <ResumenMaquina />
      </ExpandableCard>
    </div>
  );
}

export default function Dashboard() {
  const location = useLocation();
  const path = location.pathname.replace(/\/+$/, "");
  const view = path.split("/")[2] || "general"; // /dashboard/<view>

  const content = view === "trabajadores"
    ? <TrabajadoresMejores />
    : view === "maquinas"
      ? <MaquinasMejores />
      : view === "areas"
        ? <AreasView />
      : view === "alertas"
        ? <div className="p-6 space-y-6 h-full overflow-y-auto"><AlertasComponent /></div>
        : <GeneralView />;

  return (
    <div className="flex h-[calc(100vh-5rem)]">
      <aside className="w-64 bg-gray-100 border-r p-4 space-y-6">
        <nav className="space-y-4">
          <div>
            <Link to="/dashboard/general" className={`block w-full text-left p-2 rounded hover:bg-gray-200 ${view === "general" ? "bg-gray-200" : ""}`}>
              General
            </Link>
          </div>
          <div>
            <div className="font-semibold text-gray-700 mb-2">Áreas</div>
            <Link to="/dashboard/areas" className={`block w-full text-left p-2 rounded hover:bg-gray-200 ${view === "areas" ? "bg-gray-200" : ""}`}>
              Indicadores por áreas
            </Link>
          </div>
          <div>
            <div className="font-semibold text-gray-700 mb-2">Trabajadores</div>
            <Link to="/dashboard/trabajadores" className={`block w-full text-left p-2 rounded hover:bg-gray-200 ${view === "trabajadores" ? "bg-gray-200" : ""}`}>
              Ver mejores
            </Link>
          </div>
          <div>
            <div className="font-semibold text-gray-700 mb-2">Máquina</div>
            <Link to="/dashboard/maquinas" className={`block w-full text-left p-2 rounded hover:bg-gray-200 ${view === "maquinas" ? "bg-gray-200" : ""}`}>
              Ver mejores
            </Link>
          </div>
          <div>
            <div className="font-semibold text-gray-700 mb-2">Alertas</div>
            <Link to="/dashboard/alertas" className={`block w-full text-left p-2 rounded hover:bg-gray-200 ${view === "alertas" ? "bg-gray-200" : ""}`}>
              Ver alertas
            </Link>
          </div>
        </nav>
      </aside>
      <main className="flex-1 overflow-hidden">
        {content}
      </main>
    </div>
  );
}
