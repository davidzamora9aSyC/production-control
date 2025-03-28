import Navbar from "../components/Navbar";
import ProduccionChart from "../components/ProduccionChart";
import ComponenteControl from "../components/ComponenteControl";
import EstadisticasPanel from "../components/EstadisticasPanel";
import AlertasComponent from "../components/AlertasComponent";
import { useAspectRatio } from "../context/AspectRatioContext";

export default function Dashboard() {

    const { aspectRatio } = useAspectRatio();
    console.log(aspectRatio);
    return (
        <div className={`h-screen bg-white relative ${aspectRatio === "16:9" ? "mb-40" : ""}`}>

            <Navbar />
            <div className={`absolute left-1/2 ${aspectRatio === "16:10" ? "top-[15%]" : "top-[20%]"} w-px h-[calc(100%-200px)] border-l-2 border-dashed border-gray-400 z-0 pointer-events-none`} />
            <div className={`absolute left-1/2 ${aspectRatio === "16:10" ? "top-[55%]" : "top-[62%]"} -translate-x-1/2 h-px w-[90%] border-t-2 border-dashed border-gray-400 z-0 pointer-events-none`} />


            <div className="px-20 py-6 text-xl h-[calc(100%-80px)]">
                <div className="font-semibold text-4xl mb-4">Resumen general</div>

                <div className="relative grid grid-cols-2 pt-6 gap-x-10">


                    <div className="z-10 flex flex-col justify-between  px-4">
                        <ProduccionChart />
                        <ComponenteControl />
                    </div>

                    <div className="z-10 flex flex-col justify-between px-4">
                        <EstadisticasPanel />
                        <AlertasComponent />
                    </div>
                </div>
            </div>
        </div>
    );
}
