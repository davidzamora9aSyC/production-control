import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useState } from "react";

const data = [
    { name: "Ene", value: 1000 },
    { name: "Feb", value: 1200 },
    { name: "Mar", value: 800 },
];

export default function ProduccionChart() {
    const [proceso, setProceso] = useState("Troquelado");
    const [periodo, setPeriodo] = useState("Meses");

    return (
        <div className="w-full max-h-[40%] mb-16">
            <div className="flex justify-between items-center ">
                <div>
                    <span className="font-semibold text-2xl mr-4 ">Producción por</span>
                    <select value={proceso} onChange={e => setProceso(e.target.value)} className="border-b border-black focus:outline-none">
                        <option>Troquelado</option>
                        <option>Inyección</option>
                        <option>Ensamble</option>
                    </select>

                </div>

                <select value={periodo} onChange={e => setPeriodo(e.target.value)} className="bg-gray-200 px-4 py-1 rounded-full text-sm">
                    <option>Meses</option>
                    <option>Días</option>
                </select>
            </div>

            <div className="mt-8 border rounded-2xl shadow-md p-4">
                <ResponsiveContainer width="100%" height={223}>
                    <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} dot />
                    </LineChart>
                </ResponsiveContainer>
            </div>

        </div>
    );
}
