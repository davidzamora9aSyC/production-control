import Navbar from "../components/Navbar";
import ProduccionChart from "../components/ProduccionChart";
import ComponenteControl from "../components/ComponenteControl";
import EstadisticasPanel from "../components/EstadisticasPanel";
import AlertasComponent from "../components/AlertasComponent";
import { useAspectRatio } from "../context/AspectRatioContext";
import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

export default function Dashboard() {
    const location = useLocation();
    const entradaReturn = location.state?.entradaReturn || false;

    const { aspectRatio } = useAspectRatio();
    console.log(aspectRatio);

    const [fechaHora, setFechaHora] = useState(new Date());

    useEffect(() => {
        const intervalo = setInterval(() => setFechaHora(new Date()), 1000);
        return () => clearInterval(intervalo);
    }, []);

    return (
        <div className={`h-screen bg-white relative ${entradaReturn ? "animate-slideRight" : ""} ${aspectRatio === "16:9" ? "mb-40" : ""}`}>
            <div className={`absolute left-1/2 ${aspectRatio === "16:10" ? "top-[15%]" : "top-[10%]"} w-px h-[calc(95%)] border-r-2 border-dashed border-gray-400 z-0 pointer-events-none`} />
            <div className={`absolute left-1/2 ${aspectRatio === "16:10" ? "top-[47%]" : "top-[53%]"} -translate-x-1/2 h-px w-[90%] border-b-2 border-dashed border-gray-400 z-0 pointer-events-none`} />

            <div className="px-20 py-6 text-xl h-[calc(100%-80px)]">
                <div className="flex justify-between items-center mb-2 px-4">
                    <div className="font-semibold text-4xl mt-[-4px]">Resumen general</div>
                    <div className="text-sm text-gray-600">{fechaHora.toLocaleString()}</div>
                </div>

                <div className="relative grid grid-rows-2 grid-cols-2 gap-x-10 pt-6 px-4">
                    <div className="z-10"><ProduccionChart /></div>
                    <div className="z-10"><EstadisticasPanel /></div>
                    <div className="z-10"><ComponenteControl /></div>
                    <div className="z-10"><AlertasComponent /></div>
                </div>
            </div>
        </div>
    );
}
