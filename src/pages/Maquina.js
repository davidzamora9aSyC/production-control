import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useParams } from "react-router-dom";
import { API_BASE_URL } from "../api";


const generarData = () => {
    const ahora = new Date();
    const data = [];
    const descansoInicio = Math.floor(Math.random() * 100) + 10;

    for (let i = 119; i >= 0; i--) {
        const minuto = new Date(ahora.getTime() - i * 60000);
        const etiqueta = minuto.getHours().toString().padStart(2, '0') + ':' + minuto.getMinutes().toString().padStart(2, '0');

        if (i <= descansoInicio && i > descansoInicio - 10) {
            data.push({
                minuto: etiqueta,
                usos: 11,
                piezas: 11,
                fillUsos: "#84cc16",
                fillPiezas: "#84cc16",
            });
        } else {
            const usos = Math.floor(Math.random() * 10) + 1;
            const piezas = usos - (Math.random() < 0.8 ? 0 : Math.floor(Math.random() * 3));
            data.push({
                minuto: etiqueta,
                usos,
                piezas: Math.max(0, piezas),
                fillUsos: "#3b82f6",
                fillPiezas: "#3b82f6",
            });
        }
    }

    return data;
};


export default function Maquina() {
    const [fechaHora, setFechaHora] = useState(new Date());
    const [data, setData] = useState(generarData());
    const [maquina, setMaquina] = useState(null);
    const { id } = useParams();

    useEffect(() => {
        const intervalo = setInterval(() => setFechaHora(new Date()), 1000);
        return () => clearInterval(intervalo);
    }, []);

    useEffect(() => {
        fetch(`${API_BASE_URL}/maquinas/${id}`)
            .then(res => res.json())
            .then(setMaquina)
            .catch(err => console.error('Error al obtener maquina:', err));
    }, [id]);

    useEffect(() => {
        const intervalo = setInterval(() => {
            setData(prevData => {
                const nuevoMinuto = new Date();
                const etiqueta = nuevoMinuto.getHours().toString().padStart(2, '0') + ':' + nuevoMinuto.getMinutes().toString().padStart(2, '0');
                const usos = Math.floor(Math.random() * 10) + 1;
                const piezas = usos - (Math.random() < 0.8 ? 0 : Math.floor(Math.random() * 3));
                const nuevoDato = {
                    minuto: etiqueta,
                    usos,
                    piezas: Math.max(0, piezas),
                    fillUsos: "#3b82f6",
                    fillPiezas: "#3b82f6",
                };
                return [...prevData.slice(1), nuevoDato];
            });
        }, 60000);

        return () => clearInterval(intervalo);
    }, []);

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-semibold">Uso de máquina</h1>
                <span>{fechaHora.toLocaleString()}</span>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-6">
                <div className="bg-white p-4 rounded-lg shadow">
                    <p><strong>Número de máquina:</strong> {maquina?.id}</p>
                    <p><strong>Operario actual:</strong> {maquina?.operario || '-'}</p>
                    <p><strong>Tipo de máquina:</strong> {maquina?.tipo}</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                    <p><strong>Orden de producción actual:</strong> <a href="#" className="text-blue-600">{maquina?.ordenActual || '-'}</a></p>
                    <p><strong>Avance:</strong> {maquina?.avance || '-'}%</p>
                    <p><strong>{maquina?.producidas || 0}/{maquina?.requeridas || 0} piezas</strong></p>
                </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow mb-4">
                <h2 className="text-lg font-semibold mb-2">Usos de máquina en los últimos 120 minutos</h2>
                <div className="h-40 w-full bg-white relative overflow-hidden">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data}>
                            <XAxis dataKey="minuto" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="usos" key="usos" fill="#3b82f6">
                                {data.map((entry, index) => {
                                    const isDescanso = entry.fillUsos === "#84cc16";
                                    const isFirst = isDescanso && (!data[index - 1] || data[index - 1].fillUsos !== "#84cc16");
                                    const isLast = isDescanso && (!data[index + 1] || data[index + 1].fillUsos !== "#84cc16");
                                    const radius = isDescanso
                                        ? [isFirst ? 5 : 0, isLast ? 5 : 0, isLast ? 5 : 0, isFirst ? 5 : 0]
                                        : [5, 5, 0, 0];
                                    return <Cell key={`usos-${index}`} fill={entry.fillUsos} radius={radius} />;
                                })}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                <div className="flex gap-6 text-sm mt-2">
                    <div className="flex items-center gap-2"><span className="w-3 h-3 bg-blue-600 inline-block rounded-full"></span>Usos de máquina por minuto</div>
                    <div className="flex items-center gap-2"><span className="w-3 h-3 bg-lime-300 inline-block rounded-full"></span>Operario en descanso</div>
                </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow">
                <h2 className="text-lg font-semibold mb-2">Piezas producidas en los últimos 120 minutos</h2>
                <div className="h-40 w-full bg-white relative overflow-hidden">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data}>
                            <XAxis dataKey="minuto" />
                            <YAxis />
                            <Tooltip />

                            <Bar dataKey="piezas" key="piezas" fill="#3b82f6">
                                {data.map((entry, index) => {
                                    const isDescanso = entry.fillPiezas === "#84cc16";
                                    const isFirst = isDescanso && (!data[index - 1] || data[index - 1].fillPiezas !== "#84cc16");
                                    const isLast = isDescanso && (!data[index + 1] || data[index + 1].fillPiezas !== "#84cc16");
                                    const radius = isDescanso
                                        ? [isFirst ? 5 : 0, isLast ? 5 : 0, isLast ? 5 : 0, isFirst ? 5 : 0]
                                        : [5, 5, 0, 0];
                                    return <Cell key={`piezas-${index}`} fill={entry.fillPiezas} radius={radius} />;
                                })}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                <div className="flex gap-6 text-sm mt-2">
                    <div className="flex items-center gap-2"><span className="w-3 h-3 bg-blue-600 inline-block rounded-full"></span>Piezas por minuto</div>
                    <div className="flex items-center gap-2"><span className="w-3 h-3 bg-lime-300 inline-block rounded-full"></span>Operario en descanso</div>
                </div>
            </div>

            <p className="text-sm text-gray-500 mt-4">Creada el 29/11/2024 9:00 AM</p>
        </div>
    );
}