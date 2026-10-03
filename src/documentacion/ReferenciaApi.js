const U = "JWT";
const P = "Publica";

function devuelve(metodo, ruta, hace) {
  if (ruta === "/") return "Texto de estado del proceso.";
  if (ruta === "/hora-colombia") return "{ hora, zonaHoraria }.";
  if (ruta === "/sincronizar" || ruta === "/evento" || ruta === "/impacto" || ruta === "/minuta") return "{ guardado: 1 } o { error }.";
  if (ruta === "/auth/login") return "{ access_token, token_type, expires_in, user }.";
  if (ruta === "/auth/validate") return "{ valid, user?, iat?, exp? }.";
  if (ruta === "/registro-minuto/acumular" || ruta === "/registro-minuto/guardar") return "{ ok: true }.";
  if (metodo === "DELETE") return "{ deleted: true }.";
  if (ruta.includes("/finalizar-todas")) return "Resumen de sesiones finalizadas.";
  if (ruta.includes("finalizar-sesiones-terminadas")) return "Arreglo de trabajos finalizados.";
  if (ruta.includes("/batch")) return "Arreglo de trabajos creados o actualizados.";
  if (ruta.includes("/pasos-mini")) return "Arreglo resumido de pasos.";
  if (ruta.includes("/orden-produccion")) return "{ orden, paso }.";
  if (ruta.includes("/serie-minuto")) return "Arreglo de indicadores por minuto.";
  if (ruta.includes("/registro-minuto/sesion")) return "Arreglo de registros por minuto.";
  if (ruta.includes("/activa")) return "Sesion activa u id de sesion con esp32=true.";
  if (ruta.includes("/actuales") || ruta.includes("/activas") || ruta.includes("/rango") || ruta.includes("/por-") || ruta.endsWith("/areas") || ruta.endsWith("/trabajadores") || ruta.endsWith("/maquinas") || ruta.endsWith("/ordenes") || ruta.endsWith("/pasos") || ruta.endsWith("/empresas") || ruta.endsWith("/minutas") || ruta.endsWith("/materiales-orden") || ruta.endsWith("/estados-sesion") || ruta.endsWith("/estados-trabajador") || ruta.endsWith("/estados-maquina")) return "Arreglo JSON.";
  if (ruta.startsWith("/indicadores") || ruta.startsWith("/produccion")) return "Objeto o arreglo de metricas calculadas.";
  if (ruta.startsWith("/alertas")) return "Arreglo u objeto de alertas y umbrales.";
  if (metodo === "POST") return "Entidad creada o actualizada.";
  if (metodo === "PUT" || metodo === "PATCH") return "Entidad actualizada.";
  if (metodo === "GET") return "Objeto JSON.";
  return hace;
}

const MODULOS = [
  ["Sistema", [
    ["GET", "/", P, "-", "Estado basico del proceso."],
    ["GET", "/hora-colombia", P, "-", "Fecha y hora de America/Bogota."],
    ["POST", "/evento", P, "{ estacion, id, intervalo?, distancia?, luz? }; id: tolva | pedal.", "Registra evento heredado de estacion."],
    ["GET", "/sincronizar", P, "-", "Devuelve acuse de sincronizacion heredado."],
    ["POST", "/impacto", P, "{ estacion, id }; id: stop | stop-m | continue.", "Registra impacto heredado de estacion."],
    ["POST", "/minuta", P, "{ accion, fecha, proceso, trabajador?, orden_produccion?, cantidad_piezas?, meta?, npt_min? }.", "Registra minuta heredada."],
  ]],
  ["Autenticacion", [
    ["POST", "/auth/login", P, "{ username, password }.", "Emite token JWT."],
    ["GET", "/auth/validate", P, "Authorization: Bearer token o query token?", "Valida token y devuelve usuario y expiracion."],
  ]],
  ["Areas", [
    ["POST", "/areas", U, "{ nombre }.", "Crea area."], ["GET", "/areas", P, "-", "Lista areas."],
    ["GET", "/areas/:id", U, "id UUID (ruta).", "Obtiene area."], ["PUT", "/areas/:id", U, "id UUID; { nombre? }.", "Actualiza area."], ["DELETE", "/areas/:id", U, "id UUID.", "Elimina area."],
  ]],
  ["Trabajadores", [
    ["POST", "/trabajadores", U, "{ nombre, identificacion, grupo: produccion|admin, turno: manana|tarde|noche, fechaInicio }.", "Crea trabajador."],
    ["GET", "/trabajadores", P, "-", "Lista trabajadores."],
    ["GET", "/trabajadores/buscar", P, "q?, nombre?, identificacion?, limit?", "Busca trabajadores."],
    ["GET", "/trabajadores/:id", P, "id UUID.", "Obtiene trabajador."],
    ["PUT", "/trabajadores/:id", U, "id UUID; nombre?, identificacion?, grupo?, turno?, fechaInicio?.", "Actualiza trabajador."],
    ["DELETE", "/trabajadores/:id", U, "id UUID.", "Elimina trabajador."],
  ]],
  ["Maquinas", [
    ["POST", "/maquinas", U, "{ nombre, codigo, ubicacion, fechaInstalacion, tipo, areaId, observaciones? }.", "Crea maquina."],
    ["GET", "/maquinas", U, "-", "Lista maquinas."], ["GET", "/maquinas/buscar", P, "q?, nombre?, codigo?, areaId?, limit?", "Busca maquinas."],
    ["GET", "/maquinas/tipos", P, "-", "Lista tipos de maquina."], ["GET", "/maquinas/:id", P, "id UUID, codigo o nombre.", "Obtiene maquina."],
    ["PUT", "/maquinas/:id", U, "id; nombre?, ubicacion?, fechaInstalacion?, tipo?, areaId?, observaciones?.", "Actualiza maquina."],
    ["DELETE", "/maquinas/:id", U, "id UUID.", "Elimina maquina."],
  ]],
  ["Ordenes de produccion", [
    ["POST", "/ordenes", U, "{ numero, producto, cantidadAProducir, fechaOrden, fechaVencimiento, pasos: [{ nombre, codigoInterno, cantidadRequerida, numeroPaso, cantidadProducida?, cantidadPedaleos?, estado? }] }.", "Crea orden y pasos."],
    ["GET", "/ordenes", U, "-", "Lista ordenes."], ["GET", "/ordenes/:id", U, "id UUID.", "Obtiene orden."],
    ["GET", "/ordenes/:id/pasos-mini", P, "id UUID.", "Lista resumida de pasos."], ["GET", "/ordenes/:id/detalle", U, "id UUID.", "Obtiene orden, pasos y materiales."],
    ["DELETE", "/ordenes/:id", U, "id UUID.", "Elimina orden."],
  ]],
  ["Pasos de produccion", [
    ["POST", "/pasos", U, "{ nombre, orden, codigoInterno, cantidadRequerida, numeroPaso }.", "Crea paso."], ["GET", "/pasos", U, "-", "Lista pasos."],
    ["GET", "/pasos/orden/:ordenId", U, "ordenId UUID.", "Lista pasos de la orden."], ["GET", "/pasos/:id", U, "id UUID.", "Obtiene paso."],
    ["PUT", "/pasos/:id", U, "id; nombre?, orden?, codigoInterno?, cantidadRequerida?, cantidadProducida?, cantidadPedaleos?, numeroPaso?.", "Actualiza paso."],
    ["PATCH", "/pasos/:id/finalizar", P, "id UUID.", "Finaliza paso."], ["DELETE", "/pasos/:id", U, "id UUID.", "Elimina paso."],
  ]],
  ["Materiales de orden", [
    ["POST", "/materiales-orden", U, "{ orden, codigo, descripcion, unidad, cantidad }.", "Crea material."], ["GET", "/materiales-orden", U, "-", "Lista materiales."],
    ["GET", "/materiales-orden/:id", U, "id UUID.", "Obtiene material."], ["PUT", "/materiales-orden/:id", U, "id; orden?, codigo?, descripcion?, unidad?, cantidad?.", "Actualiza material."], ["DELETE", "/materiales-orden/:id", U, "id UUID.", "Elimina material."],
  ]],
  ["Empresas", [
    ["POST", "/empresas", U, "{ nombre }.", "Crea empresa."], ["GET", "/empresas", U, "-", "Lista empresas."], ["GET", "/empresas/:id", U, "id UUID.", "Obtiene empresa."], ["PUT", "/empresas/:id", U, "id; { nombre? }.", "Actualiza empresa."], ["DELETE", "/empresas/:id", U, "id UUID.", "Elimina empresa."],
  ]],
  ["Sesiones de trabajo", [
    ["POST", "/sesiones-trabajo", P, "{ trabajador, maquina, desdeTablet? }; query esp32?: true.", "Crea sesion; esp32=true devuelve id."], ["GET", "/sesiones-trabajo", P, "-", "Lista sesiones."],
    ["GET", "/sesiones-trabajo/actuales", P, "-", "Lista sesiones actuales con indicadores."], ["GET", "/sesiones-trabajo/activas", P, "trabajador? UUID.", "Lista sesiones activas."], ["GET", "/sesiones-trabajo/activas/resumen", P, "-", "Resumen de sesiones activas."],
    ["GET", "/sesiones-trabajo/:id/orden-produccion", P, "id UUID.", "Obtiene orden y paso activos."], ["GET", "/sesiones-trabajo/:id", P, "id UUID.", "Obtiene sesion e indicador reciente."], ["GET", "/sesiones-trabajo/:id/serie-minuto", P, "id UUID; inicio? ISO, fin? ISO.", "Obtiene serie de indicadores por minuto."],
    ["PUT", "/sesiones-trabajo/:id", U, "id; fechaFin?, cantidadProducida?, cantidadPedaleos?.", "Actualiza sesion."], ["POST", "/sesiones-trabajo/:id/finalizar", P, "id UUID.", "Finaliza sesion."], ["POST", "/sesiones-trabajo/finalizar-todas", U, "-", "Finaliza sesiones activas."],
    ["DELETE", "/sesiones-trabajo/:id", U, "id UUID.", "Elimina sesion."], ["GET", "/sesiones-trabajo/maquina/:id/activa", P, "id UUID, codigo o nombre; esp32?: true.", "Obtiene sesion activa; esp32=true devuelve id."], ["GET", "/sesiones-trabajo/maquina/:id/rango", P, "id; desde ISO, hasta ISO.", "Lista sesiones por maquina y rango."],
  ]],
  ["Trabajos sesion-paso", [
    ["POST", "/sesion-trabajo-pasos", P, "{ sesionTrabajo, pasoOrden, cantidadAsignada?, porAdministrador?, desdeTablet? }.", "Crea o reactiva trabajo."], ["POST", "/sesion-trabajo-pasos/batch", P, "Arreglo de cuerpos de creacion.", "Crea trabajos en lote."],
    ["GET", "/sesion-trabajo-pasos", P, "-", "Lista trabajos."], ["GET", "/sesion-trabajo-pasos/por-paso/:pasoId", P, "pasoId UUID.", "Lista trabajos del paso."], ["GET", "/sesion-trabajo-pasos/por-sesion/:sesionId", P, "sesionId UUID.", "Lista trabajos de la sesion."], ["GET", "/sesion-trabajo-pasos/:id", P, "id UUID.", "Obtiene trabajo."],
    ["PUT", "/sesion-trabajo-pasos/:id", P, "id; cantidadAsignada?, cantidadProducida?, cantidadPedaleos?, comentarioDefectuosas?.", "Acumula cantidades o actualiza comentario."], ["POST", "/sesion-trabajo-pasos/:id/finalizar", P, "id UUID.", "Finaliza trabajo."],
    ["POST", "/sesion-trabajo-pasos/finalizar-sesiones-terminadas", U, "-", "Finaliza trabajos de sesiones cerradas."], ["PUT", "/sesion-trabajo-pasos/batch", U, "[{ id, data: { cantidadAsignada?, cantidadProducida?, cantidadPedaleos?, comentarioDefectuosas? } }].", "Actualiza trabajos en lote."],
    ["DELETE", "/sesion-trabajo-pasos/:id", U, "id UUID.", "Elimina trabajo."], ["DELETE", "/sesion-trabajo-pasos/por-sesion/:sesionId", U, "sesionId UUID.", "Elimina trabajos de sesion."], ["DELETE", "/sesion-trabajo-pasos/por-paso/:pasoId", U, "pasoId UUID.", "Elimina trabajos de paso."],
  ]],
  ["Registro por minuto", [
    ["POST", "/registro-minuto/acumular", P, "{ maquina, paso, tipo: pedal|pieza, minutoInicio? ISO }.", "Suma un evento en memoria."], ["POST", "/registro-minuto/guardar", P, "-", "Persiste acumulados en memoria."], ["GET", "/registro-minuto/sesion/:id", P, "id UUID.", "Obtiene registros de la sesion."], ["GET", "/registro-minuto/sesion/:id/ultimos", P, "id UUID.", "Obtiene ultimos 120 minutos."],
  ]],
  ["Estados de sesion", [
    ["POST", "/estados-sesion", U, "{ sesionTrabajo, estado: produccion|inactivo|otro, inicio, fin? }.", "Crea estado."], ["GET", "/estados-sesion", U, "-", "Lista estados."], ["GET", "/estados-sesion/por-sesion/:sesionId", U, "sesionId UUID.", "Lista estados de sesion."], ["GET", "/estados-sesion/:id", U, "id UUID.", "Obtiene estado."], ["PUT", "/estados-sesion/:id", U, "id; sesionTrabajo?, estado?, inicio?, fin?.", "Actualiza estado."], ["DELETE", "/estados-sesion/:id", U, "id UUID.", "Elimina estado."], ["DELETE", "/estados-sesion/por-sesion/:sesionId", U, "sesionId UUID.", "Elimina estados de sesion."],
  ]],
  ["Estados de trabajador", [
    ["POST", "/estados-trabajador", P, "{ trabajador, descanso }.", "Crea estado de trabajador."], ["GET", "/estados-trabajador", U, "-", "Lista estados."], ["GET", "/estados-trabajador/trabajador/:id", P, "id UUID; inicio ISO, fin ISO.", "Obtiene estados del trabajador en rango."], ["GET", "/estados-trabajador/:id", P, "id UUID.", "Obtiene estado."], ["PUT", "/estados-trabajador/:id", U, "id; { fin? ISO }.", "Actualiza estado."], ["DELETE", "/estados-trabajador/:id", U, "id UUID.", "Elimina estado."], ["POST", "/estados-trabajador/trabajador/:id/finalizar-descanso", P, "id UUID.", "Finaliza descanso."],
  ]],
  ["Estados de maquina", [
    ["POST", "/estados-maquina", P, "{ maquina, mantenimiento }.", "Crea estado de maquina."], ["GET", "/estados-maquina", U, "-", "Lista estados."], ["GET", "/estados-maquina/maquina/:id", P, "id UUID; inicio ISO, fin ISO.", "Obtiene estados de maquina en rango."], ["GET", "/estados-maquina/:id", P, "id UUID.", "Obtiene estado."], ["PUT", "/estados-maquina/:id", U, "id; { fin? ISO }.", "Actualiza estado."], ["POST", "/estados-maquina/maquina/:id/finalizar-mantenimiento", P, "id UUID.", "Finaliza mantenimiento."], ["DELETE", "/estados-maquina/:id", U, "id UUID.", "Elimina estado."],
  ]],
  ["Minutas", [["POST", "/minutas", P, "{ recursoId, ordenId, pasoId, cantidad, pedalazos, observaciones? }.", "Crea minuta."], ["GET", "/minutas", U, "-", "Lista minutas."], ["GET", "/minutas/:id", U, "id UUID.", "Obtiene minuta."]]],
  ["Configuracion y alertas", [
    ["GET", "/configuracion", U, "-", "Obtiene configuracion."], ["PUT", "/configuracion", U, "minutosInactividadParaNPT?, zonaHorariaCliente?, maxDescansosDiariosPorTrabajador?, maxDuracionPausaMinutos?, maxHorasSesionAbierta?.", "Actualiza configuracion."],
    ["GET", "/alertas", U, "desde?, hasta?, tipo?, sujetoTipo?, sujetoId?, page?, limit?", "Lista alertas filtradas."], ["GET", "/alertas/trabajador/rango", U, "desde ISO, hasta ISO, trabajadorId? o identificacion?", "Lista alertas de trabajador."], ["GET", "/alertas/maquina/rango", U, "desde ISO, hasta ISO, maquinaId? o maquina?", "Lista alertas de maquina."], ["GET", "/alertas/umbrales", U, "-", "Obtiene umbrales."], ["PUT", "/alertas/umbrales", U, "maxDescansosDiariosPorTrabajador?, maxDuracionPausaMinutos?, minutosInactividadParaNPT?.", "Actualiza umbrales."],
  ]],
  ["Produccion diaria", [
    ["GET", "/produccion/diaria/mes-actual", U, "areaId? UUID.", "Serie diaria del mes."], ["GET", "/produccion/diaria/ultimos-30-dias", U, "areaId? UUID.", "Serie diaria de 30 dias."], ["GET", "/produccion/mensual/ano-actual", U, "areaId? UUID.", "Serie mensual del ano."], ["GET", "/produccion/mensual/ultimos-12-meses", U, "areaId? UUID.", "Serie mensual de 12 meses."],
  ]],
  ["Indicadores", [
    ["GET", "/indicadores/producto", U, "productoId? o producto?, periodo?, inicio?, fin?, compararCon?, compararInicio?, compararFin?, targetNc?, targetNpt?, targetCumplimiento?", "Obtiene indicadores por producto."],
    ["GET", "/indicadores/diaria/mes-actual", U, "areaId? UUID.", "Obtiene serie diaria del mes."], ["GET", "/indicadores/diaria/ultimos-30-dias", U, "areaId? UUID.", "Obtiene serie diaria de 30 dias."], ["GET", "/indicadores/mensual/ano-actual", U, "areaId? UUID.", "Obtiene serie mensual del ano."], ["GET", "/indicadores/mensual/ultimos-12-meses", U, "areaId? UUID.", "Obtiene serie mensual de 12 meses."],
    ["GET", "/indicadores/resumen/dia", U, "fecha? ISO.", "Obtiene resumen diario."], ["GET", "/indicadores/resumen/mes-actual", U, "-", "Obtiene resumen mensual."], ["GET", "/indicadores/realtime/area-velocidad", U, "areaId? UUID.", "Obtiene velocidad de area."], ["GET", "/indicadores/sesiones/velocidad-normalizada", U, "inicio ISO, fin ISO, areaId?, points?", "Obtiene curva normalizada."],
    ["GET", "/indicadores/trabajadores/:id/resumen", U, "id UUID; inicio ISO, fin ISO, includeVentana? boolean.", "Obtiene resumen de trabajador."], ["GET", "/indicadores/maquinas/:id/resumen", U, "id UUID; inicio ISO, fin ISO, includeVentana? boolean.", "Obtiene resumen de maquina."],
    ["GET", "/indicadores/trabajadores", U, "rango?, inicio?, fin?, metrics?, compararCon?, compararInicio?, compararFin?", "Lista trabajadores con metricas."], ["GET", "/indicadores/maquinas", U, "rango?, inicio?, fin?, metrics?", "Lista maquinas con metricas."], ["GET", "/indicadores/trabajadores/:id/diaria", U, "id UUID; rango?, inicio?, fin?", "Obtiene serie de trabajador."], ["GET", "/indicadores/maquinas/:id/diaria", U, "id UUID; rango?, inicio?, fin?", "Obtiene serie de maquina."],
  ]],
];

export default function ReferenciaApi() {
  return <>
    <h2>8. Documentacion de endpoints del backend</h2>
    {MODULOS.map(([modulo, endpoints]) => <section key={modulo}>
      <h3>{modulo}</h3>
      <table className="manual-tabla"><thead><tr><th>Metodo</th><th>Ruta</th><th>Acceso</th><th>Recibe</th><th>Hace</th><th>Devuelve</th></tr></thead><tbody>
        {endpoints.map(([metodo, ruta, acceso, recibe, hace]) => <tr key={`${metodo}-${ruta}`}><td>{metodo}</td><td className="ruta">{ruta}</td><td>{acceso}</td><td>{recibe}</td><td>{hace}</td><td>{devuelve(metodo, ruta, hace)}</td></tr>)}
      </tbody></table>
    </section>)}
  </>;
}
