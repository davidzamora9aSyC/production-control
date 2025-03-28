import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const generarData = () => {
  const ahora = new Date();
  const data = [];

  for (let i = 119; i >= 0; i--) {
    const minuto = new Date(ahora.getTime() - i * 60000);
    const etiqueta = minuto.getHours().toString().padStart(2, '0') + ':' + minuto.getMinutes().toString().padStart(2, '0');
    data.push({
      minuto: etiqueta,
      usos: Math.floor(Math.random() * 10) + 1,
      piezas: Math.floor(Math.random() * 20) + 1,
    });
  }

  return data;
};

export default function Maquina() {
  const [fechaHora, setFechaHora] = useState(new Date());
  const [data, setData] = useState(generarData());

  useEffect(() => {
    const intervalo = setInterval(() => setFechaHora(new Date()), 1000);
    return () => clearInterval(intervalo);
  }, []);

  useEffect(() => {
    const intervalo = setInterval(() => {
      setData(prevData => {
        const nuevoMinuto = new Date();
        const etiqueta = nuevoMinuto.getHours().toString().padStart(2, '0') + ':' + nuevoMinuto.getMinutes().toString().padStart(2, '0');
        const nuevoDato = {
          minuto: etiqueta,
          usos: Math.floor(Math.random() * 10) + 1,
          piezas: Math.floor(Math.random() * 20) + 1,
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
        <div className="bg-white p-4 rounded shadow">
          <p><strong>Número de máquina:</strong> 2</p>
          <p><strong>Operario actual:</strong> Carlos Pérez</p>
          <p><strong>Tipo de máquina:</strong> Troqueladora</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <p><strong>Orden de producción actual:</strong> <a href="#" className="text-blue-600">GG921IAEMC</a></p>
          <p><strong>Avance:</strong> 25%</p>
          <p><strong>50/200 piezas</strong></p>
        </div>
      </div>

      <div className="bg-white p-4 rounded shadow mb-4">
        <h2 className="text-lg font-semibold mb-2">Usos de máquina en los últimos 120 minutos</h2>
        <div className="h-40 w-full bg-white relative overflow-hidden">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <XAxis dataKey="minuto" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="usos" fill="#3b82f6" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="flex gap-6 text-sm mt-2">
          <div className="flex items-center gap-2"><span className="w-3 h-3 bg-blue-600 inline-block rounded-full"></span>Usos de máquina por minuto</div>
          <div className="flex items-center gap-2"><span className="w-3 h-3 bg-lime-300 inline-block rounded-full"></span>Operario en descanso</div>
        </div>
      </div>

      <div className="bg-white p-4 rounded shadow">
        <h2 className="text-lg font-semibold mb-2">Piezas producidas en los últimos 120 minutos</h2>
        <div className="h-40 w-full bg-white relative overflow-hidden">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <XAxis dataKey="minuto" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="piezas" fill="#84cc16" radius={[2, 2, 0, 0]} />
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