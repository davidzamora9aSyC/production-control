import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useParams } from "react-router-dom";
import { API_BASE_URL } from "../api";




export default function Maquina() {
    const [fechaHora, setFechaHora] = useState(new Date());
    const [data, setData] = useState([]);
    const [maquina, setMaquina] = useState(null);
    const [sesion, setSesion] = useState(null);
    const [orden, setOrden] = useState(null);
    const [pasoActivo, setPasoActivo] = useState(null);
    const [ordenError, setOrdenError] = useState(null);
    const { id } = useParams();

    useEffect(() => {
        const intervalo = setInterval(() => setFechaHora(new Date()), 1000);
        return () => clearInterval(intervalo);
    }, []);

    useEffect(() => {
        fetch(`https://smartindustries.org/sesiones-trabajo/${id}`)
            .then(res => res.json())
            .then(data => {
                setSesion(data);
                setMaquina(data.maquina);
                // Nueva lógica para obtener orden-produccion y manejar error 404
                // Se debe usar el id de la URL (useParams), no el id del payload
                fetch(`https://smartindustries.org/sesiones-trabajo/${id}/orden-produccion`)
                  .then(async res => {
                    const payload = await res.json().catch(() => ({}));
                    if (!res.ok) {
                      setOrden(null);
                      setPasoActivo(null);
                      setOrdenError({ status: res.status, message: payload?.message || 'Error' });
                      return;
                    }
                    setOrden(payload.orden);
                    setPasoActivo(payload.paso);
                    setOrdenError(null);
                  })
                  .catch(err => {
                    setOrden(null);
                    setPasoActivo(null);
                    setOrdenError({ status: 0, message: 'Error de red' });
                    console.error('Error al obtener orden de producción:', err);
                  });

                // --- NUEVO: obtener intervalos de mantenimiento y descansos antes de fetch de registro-minuto ---
                // Calcular hora actual UTC y 2 horas atrás en UTC
                const fin = new Date(); // UTC actual
                const inicio = new Date(fin.getTime() - 2 * 60 * 60 * 1000); // UTC - 2h
                const inicioUTC = inicio.toISOString();
                const finUTC = fin.toISOString();
                // Fetch de mantenimientos
                fetch(`https://smartindustries.org/estados-maquina/maquina/${data.maquina?.id}?inicio=${inicioUTC}&fin=${finUTC}`)
                    .then(res => res.json())
                    .then(mantenimientosRaw => {
                        // Los mantenimientos ya vienen en UTC; convertimos sus fechas a hora Colombia
                        const mantenimientos = (mantenimientosRaw || []).map(m => {
                            const inicioColombia = new Date(new Date(m.inicio).toLocaleString('en-US', { timeZone: 'America/Bogota' }));
                            const finISO = m.fin ?? new Date().toISOString();
                            const finColombia = new Date(new Date(finISO).toLocaleString('en-US', { timeZone: 'America/Bogota' }));
                            return { ...m, inicioColombia, finColombia };
                        });

                        // Obtener descansos del trabajador
                        const trabajadorId = data.trabajador?.id;
                        if (trabajadorId) {
                            fetch(`https://smartindustries.org/estados-trabajador/trabajador/${trabajadorId}?inicio=${inicioUTC}&fin=${finUTC}`)
                                .then(res => res.json())
                                .then(descansosRaw => {
                                    // Convertimos a intervalos en Colombia y ajustamos inicio y fin
                                    const descansos = (descansosRaw || []).map(d => {
                                        const inicioRaw = new Date(d.inicio);
                                        const finRaw = d.fin ? new Date(d.fin) : new Date();
                                        const inicioColombia = new Date(inicioRaw.toLocaleString('en-US', { timeZone: 'America/Bogota' }));
                                        const finColombia = new Date(finRaw.toLocaleString('en-US', { timeZone: 'America/Bogota' }));
                                        return { ...d, inicio: inicioColombia.toISOString(), fin: finColombia.toISOString(), inicioColombia, finColombia };
                                    });

                                    // Continúa con el fetch de registro-minuto
                                    fetch(`https://smartindustries.org/registro-minuto/sesion/${data.id}/ultimos`)
                                        .then(res => res.json())
                                        .then(registros => {
                                            const dataTransformada = registros.map(r => {
                                                const s = r.minutoInicioLocal ?? r.minutoInicio;
                                                const d = new Date(new Date(s).toLocaleString('en-US', { timeZone: 'America/Bogota' }));
                                                const etiqueta = d.toLocaleTimeString('es-CO', { timeZone: 'America/Bogota', hour: '2-digit', minute: '2-digit', hour12: false });
                                                const minutoInicio = d;
                                                const minutoFin = new Date(d.getTime() + 60000 - 1);

                                                let estaEnMantenimiento = 0;
                                                for (let m of mantenimientos) {
                                                    if (minutoInicio < m.finColombia && minutoFin > m.inicioColombia) {
                                                        estaEnMantenimiento = 1;
                                                        break;
                                                    }
                                                }

                                                let estaEnDescanso = 0;
                                                for (let des of descansos) {
                                                    if (minutoInicio < des.finColombia && minutoFin > des.inicioColombia) {
                                                        estaEnDescanso = 1;
                                                        break;
                                                    }
                                                }

                                                return {
                                                    ...r,
                                                    minuto: etiqueta,
                                                    piezasNoConformes: Math.max(0, (r.pedaleadas ?? 0) - (r.piezasContadas ?? r.piezas ?? 0)),
                                                    fillPiezasNoConformes: r.fillPiezasNoConformes ?? '#ef4444',
                                                    piezas: r.piezasContadas ?? r.piezas ?? 0,
                                                    fillPiezas: r.fillPiezas ?? (estaEnDescanso === 1 ? '#84cc16' : '#3b82f6'),
                                                    mantenimiento: estaEnMantenimiento,
                                                    fillMantenimiento: estaEnMantenimiento === 1 ? '#f59e0b' : '#3b82f6',
                                                    descanso: estaEnDescanso,
                                                    fillDescanso: estaEnDescanso === 1 ? '#d9f99d' : '#3b82f6',
                                                };
                                            });
                                            setData(dataTransformada);
                                        });
                                });
                        } else {
                            // Si no hay trabajador, seguimos con el fetch de registro-minuto como antes, sin descansos
                            fetch(`https://smartindustries.org/registro-minuto/sesion/${data.id}/ultimos`)
                                .then(res => res.json())
                                .then(registros => {
                                    const dataTransformada = registros.map(r => {
                                        const s = r.minutoInicioLocal ?? r.minutoInicio;
                                        const d = new Date(new Date(s).toLocaleString('en-US', { timeZone: 'America/Bogota' }));
                                        const etiqueta = d.toLocaleTimeString('es-CO', { timeZone: 'America/Bogota', hour: '2-digit', minute: '2-digit', hour12: false });
                                        const minutoInicio = d;
                                        const minutoFin = new Date(d.getTime() + 60000 - 1);
                                        let estaEnMantenimiento = 0;
                                        for (let m of mantenimientos) {
                                            if (minutoInicio < m.finColombia && minutoFin > m.inicioColombia) {
                                                estaEnMantenimiento = 1;
                                                break;
                                            }
                                        }
                                        return {
                                            ...r,
                                            minuto: etiqueta,
                                            piezasNoConformes: Math.max(0, (r.pedaleadas ?? 0) - (r.piezasContadas ?? r.piezas ?? 0)),
                                            fillPiezasNoConformes: r.fillPiezasNoConformes ?? '#ef4444',
                                            piezas: r.piezasContadas ?? r.piezas ?? 0,
                                            fillPiezas: r.fillPiezas ?? (r.descanso === 1 ? '#84cc16' : '#3b82f6'),
                                            mantenimiento: estaEnMantenimiento,
                                            fillMantenimiento: estaEnMantenimiento === 1 ? '#f59e0b' : '#3b82f6',
                                            descanso: r.descanso ?? 0,
                                            fillDescanso: r.fillDescanso ?? '#d9f99d',
                                        };
                                    });
                                    setData(dataTransformada);
                                });
                        }
                    });
            })
            .catch(err => console.error('Error al obtener detalles de la sesión:', err));
    }, [id]);

    useEffect(() => {
        console.log('Sesión actual:', sesion);
    }, [sesion]);

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-semibold">Información de la sesión</h1>
                <span>{fechaHora.toLocaleString()}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="md:col-span-3 bg-white p-4 rounded-lg shadow">
                    <h2 className="text-lg font-semibold mb-2">Sesión</h2>
                    <p><strong>Trabajador:</strong> {sesion?.trabajador?.nombre || '-'}</p>
                    <p><strong>Cantidad producida:</strong> {sesion?.cantidadProducida ?? '-'}</p>
                    <p><strong>Pedaleos:</strong> {sesion?.cantidadPedaleos ?? '-'}</p>
                    <p><strong>Fin:</strong> {sesion?.fechaFin ? new Date(sesion.fechaFin).toLocaleString() : '-'}</p>
                    <p><strong>Inicio:</strong> {sesion?.fechaInicio ? new Date(sesion.fechaInicio).toLocaleString() : '-'}</p>
                    <p>
                      <strong>Estado:</strong>{" "}
                      {(sesion?.estadoSesion ?? sesion?.estado ?? sesion?.estado_sesion) === "produccion"
                        ? "🟢"
                        : (sesion?.estadoSesion ?? sesion?.estado ?? sesion?.estado_sesion) === "inactivo"
                        ? "⚫"
                        : "🟠"}{" "}
                      {sesion?.estadoSesion ?? sesion?.estado ?? sesion?.estado_sesion ?? "-"}
                    </p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                    <h2 className="text-lg font-semibold mb-2">Máquina</h2>
                    <p><strong>Nombre de máquina:</strong> {maquina?.nombre}</p>
                    <p><strong>Código:</strong> {maquina?.codigo}</p>
                    <p><strong>Tipo de máquina:</strong> {maquina?.tipo}</p>
                </div>
                {ordenError?.status === 404 ? (
                  <div className="bg-white p-4 rounded-lg shadow md:col-span-2">
                    <h2 className="text-lg font-semibold mb-2">Orden de producción</h2>
                    <p>La sesión no está trabajando en ninguna orden de producción.</p>
                    <p className="text-sm text-gray-500">{ordenError?.message}</p>
                  </div>
                ) : (
                  <>
                    <div className="bg-white p-4 rounded-lg shadow">
                      <h2 className="text-lg font-semibold mb-2">Orden actual</h2>
                      <p><strong>Número:</strong> {orden?.numero || '-'}</p>
                      <p><strong>Producto:</strong> {orden?.producto || '-'}</p>
                      <p><strong>Cantidad a producir:</strong> {orden?.cantidadAProducir ?? '-'}</p>
                      <p><strong>Fecha de orden:</strong> {orden?.fechaOrden ? new Date(orden.fechaOrden).toLocaleDateString() : '-'}</p>
                      <p><strong>Fecha de vencimiento:</strong> {orden?.fechaVencimiento ? new Date(orden.fechaVencimiento).toLocaleDateString() : '-'}</p>
                      <p>
                        <strong>Estado:</strong>{" "}
                        {orden?.estado === "pendiente"
                          ? "⚪"
                          : orden?.estado === "activa"
                          ? "🟢"
                          : orden?.estado === "pausado"
                          ? "🟠"
                          : orden?.estado === "finalizado"
                          ? "⚫"
                          : "🟠"}{" "}
                        {orden?.estado || "-"}
                      </p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow">
                      <h2 className="text-lg font-semibold mb-2">Paso en producción de la orden actual
                        <span className="relative group inline-flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-gray-500">
                            <path d="M12 2a10 10 0 100 20 10 10 0 000-20zm.75 14.5h-1.5v-6h1.5v6zm0-8h-1.5V7h1.5v1.5z"/>
                          </svg>
                          <div className="absolute left-5 top-0 z-10 hidden group-hover:block bg-gray-800 text-white text-xs p-2 rounded shadow max-w-xs w-72">
                            Una orden de producción tiene varios pasos y cada paso puede realizarse entre diferentes trabajadores en diferentes máquinas. La información de "Paso" muestra la cantidad requerida, producida y pedaleos agregados de todos los trabajadores en ese paso; no corresponde a lo producido por una sola sesión. Para ver lo de una sesión específica se usa la asignación "sesión–trabajo–paso".
                          </div>
                        </span>
                      </h2>
                      <p><strong>Paso que se esta realizando por el trabajador:</strong> {pasoActivo?.nombre || '-'}</p>
                      <p><strong>Código interno:</strong> {pasoActivo?.codigoInterno || '-'}</p>
                      <p><strong>Cantidad requerida:</strong> {pasoActivo?.cantidadRequerida ?? '-'}</p>
                      <p><strong>Cantidad producida:</strong> {pasoActivo?.cantidadProducida ?? '-'}</p>
                      <p><strong>Pedaleos:</strong> {pasoActivo?.cantidadPedaleos ?? '-'}</p>
                      <p>
                        <strong>Estado:</strong>{" "}
                        {pasoActivo?.estado === "pendiente"
                          ? "⚪"
                          : pasoActivo?.estado === "activo"
                          ? "🟢"
                          : pasoActivo?.estado === "pausado"
                          ? "🟠"
                          : pasoActivo?.estado === "finalizado"
                          ? "⚫"
                          : ""}{" "}
                        {pasoActivo?.estado || "-"}
                      </p>
                    </div>
                  </>
                )}
            </div>

            <div className="bg-white p-4 rounded-lg shadow mb-4">
                <h2 className="text-lg font-semibold mb-2">Piezas no conformes en los últimos 120 minutos</h2>
                <div className="h-40 w-full bg-white relative overflow-hidden">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data}>
                          <XAxis dataKey="minuto" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="piezasNoConformes" key="piezasNoConformes" fill="#ef4444">
                            {data.map((entry, index) => {
                              return (
                                <Cell
                                  key={`pnc-${index}`}
                                  fill={entry.fillPiezasNoConformes}
                                  radius={[5, 5, 0, 0]}
                                />
                              );
                            })}
                          </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                <div className="flex gap-6 text-sm mt-2">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-red-500 inline-block rounded-full"></span>
                    Piezas no conformes por minuto
                  </div>
                </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow mb-4">
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
                   
                </div>
            </div>

                <div className="bg-white p-4 rounded-lg shadow mb-4">
                    <h2 className="text-lg font-semibold mb-2">Mantenimiento en los últimos 120 minutos</h2>
                    <div className="h-40 w-full bg-white relative overflow-hidden">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data}>
                                <XAxis dataKey="minuto" interval="preserveStartEnd" />
                                <YAxis domain={[0, 1]} ticks={[0, 1]} allowDecimals={false} />
                                <Tooltip
                                    formatter={(v) => (v === 1 ? '1 (sí)' : '0 (no)')}
                                    labelFormatter={(l) => `Minuto ${l}`}
                                />
                                <Bar dataKey="mantenimiento" key="mantenimiento" fill="#3b82f6" barSize={14}>
                                    {data.map((entry, index) => {
                                        const isActive = entry.mantenimiento === 1;
                                        const isFirst = isActive && (!data[index - 1] || data[index - 1].mantenimiento !== 1);
                                        const isLast = isActive && (!data[index + 1] || data[index + 1].mantenimiento !== 1);
                                        const radius = isActive
                                            ? [isFirst ? 5 : 0, isLast ? 5 : 0, isLast ? 5 : 0, isFirst ? 5 : 0]
                                            : [5, 5, 0, 0];
                                        return <Cell key={`mantenimiento-${index}`} fill={entry.fillMantenimiento} radius={radius} />;
                                    })}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="flex gap-6 text-sm mt-2">
                        <div className="flex items-center gap-2"><span className="w-3 h-3 bg-amber-500 inline-block rounded-full"></span>En mantenimiento = 1</div>
                        <div className="flex items-center gap-2"><span className="w-3 h-3 bg-blue-600 inline-block rounded-full"></span>Operativa = 0</div>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-lg shadow mb-4">
                    <h2 className="text-lg font-semibold mb-2">Descanso del trabajador en los últimos 120 minutos</h2>
                    <div className="h-40 w-full bg-white relative overflow-hidden">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data}>
                                <XAxis dataKey="minuto" interval="preserveStartEnd" />
                                <YAxis domain={[0, 1]} ticks={[0, 1]} allowDecimals={false} />
                                <Tooltip
                                    formatter={(v) => (v === 1 ? '1 (sí)' : '0 (no)')}
                                    labelFormatter={(l) => `Minuto ${l}`}
                                />
                                <Bar dataKey="descanso" key="descanso" fill="#3b82f6" barSize={14}>
                                  {data.map((entry, index) => {
                                    const isActive = entry.descanso === 1;
                                    const isFirst = isActive && (!data[index - 1] || data[index - 1].descanso !== 1);
                                    const isLast = isActive && (!data[index + 1] || data[index + 1].descanso !== 1);
                                    const radius = isActive
                                      ? [isFirst ? 5 : 0, isLast ? 5 : 0, isLast ? 5 : 0, isFirst ? 5 : 0]
                                      : [5, 5, 0, 0];
                                    return <Cell key={`descanso-${index}`} fill={entry.fillDescanso} radius={radius} />;
                                  })}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="flex gap-6 text-sm mt-2">
                        <div className="flex items-center gap-2"><span className="w-3 h-3 bg-lime-300 inline-block rounded-full"></span>En descanso = 1</div>
                        <div className="flex items-center gap-2"><span className="w-3 h-3 bg-blue-600 inline-block rounded-full"></span>Trabajando = 0</div>
                    </div>
                </div>

            <p className="text-sm text-gray-500 mt-4">Creada el 29/11/2024 9:00 AM</p>
        </div>
    );
}
