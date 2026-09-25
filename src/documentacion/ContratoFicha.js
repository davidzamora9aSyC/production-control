import { servicioPorId } from "./contenido";
import { ejemploDe } from "./ejemplosLlamada";

const O = "Opcional";
const S = "Obligatorio";

export const CONTRATOS = {
  aplicacion: {
    escrituras: [
      {
        metodo: "POST",
        ruta: "/evento",
        dto: "Sin DTO. El controlador revisa el cuerpo a mano.",
        campos: [
          ["estacion", "string", S],
          ["id", "string", S],
          ["intervalo", "número", "Obligatorio si id es tolva o pedal"],
          ["distancia", "número", "Obligatorio si id es tolva"],
          ["luz", "número", "Obligatorio si id es tolva"],
        ],
        manual: true,
      },
      {
        metodo: "POST",
        ruta: "/impacto",
        dto: "Sin DTO. El controlador revisa el cuerpo a mano.",
        campos: [
          ["estacion", "string", S],
          ["id", "stop | stop-m | continue", S],
        ],
        manual: true,
      },
      {
        metodo: "POST",
        ruta: "/minuta",
        dto: "Sin DTO. Distinto de POST /minutas.",
        campos: [
          ["accion", "string", S],
          ["fecha", "string", S],
          ["proceso", "string", S],
          ["trabajador", "string", O],
          ["orden_produccion", "string", O],
          ["cantidad_piezas", "número", "Obligatorio si accion es Terminar turno"],
          ["meta", "número", "Obligatorio si accion es Terminar turno"],
          ["npt_min", "número", "Obligatorio si accion es Terminar turno"],
        ],
        manual: true,
      },
    ],
    lecturas: [
      { metodo: "GET", ruta: "/", queries: [] },
      { metodo: "GET", ruta: "/hora-colombia", queries: [] },
      { metodo: "GET", ruta: "/sincronizar", queries: [] },
    ],
  },
  auth: {
    escrituras: [
      {
        metodo: "POST",
        ruta: "/auth/login",
        dto: "login.dto.ts",
        campos: [
          ["username", "string", S],
          ["password", "string, mínimo 3", S],
        ],
      },
    ],
    lecturas: [
      {
        metodo: "GET",
        ruta: "/auth/validate",
        queries: [["token", "string", "Opcional si el Bearer ya viene en Authorization"]],
      },
    ],
  },
  configuracion: {
    escrituras: [
      {
        metodo: "PUT",
        ruta: "/configuracion",
        dto: "update-configuracion.dto.ts",
        campos: [
          ["minutosInactividadParaNPT", "entero, mínimo 1", O],
          ["zonaHorariaCliente", "string", O],
          ["maxDescansosDiariosPorTrabajador", "entero, mínimo 1", O],
          ["maxDuracionPausaMinutos", "entero, mínimo 1", O],
          ["maxHorasSesionAbierta", "entero, mínimo 1", O],
        ],
      },
    ],
    lecturas: [{ metodo: "GET", ruta: "/configuracion", queries: [] }],
  },
  empresa: {
    escrituras: [
      {
        metodo: "POST",
        ruta: "/empresas",
        dto: "create-empresa.dto.ts",
        campos: [["nombre", "string", S]],
      },
      {
        metodo: "PUT",
        ruta: "/empresas/:id",
        dto: "update-empresa.dto.ts",
        campos: [["nombre", "string", O]],
      },
    ],
    lecturas: [
      { metodo: "GET", ruta: "/empresas", queries: [] },
      { metodo: "GET", ruta: "/empresas/:id", queries: [] },
    ],
  },
  area: {
    escrituras: [
      {
        metodo: "POST",
        ruta: "/areas",
        dto: "create-area.dto.ts",
        campos: [["nombre", "string", S]],
      },
      {
        metodo: "PUT",
        ruta: "/areas/:id",
        dto: "update-area.dto.ts",
        campos: [["nombre", "string", O]],
      },
    ],
    lecturas: [
      { metodo: "GET", ruta: "/areas", queries: [] },
      { metodo: "GET", ruta: "/areas/:id", queries: [] },
    ],
  },
  trabajador: {
    escrituras: [
      {
        metodo: "POST",
        ruta: "/trabajadores",
        dto: "create-trabajador.dto.ts",
        campos: [
          ["nombre", "string", S],
          ["identificacion", "string", S],
          ["grupo", "produccion | admin", S],
          ["turno", "mañana | tarde | noche", S],
          ["fechaInicio", "fecha ISO", S],
        ],
      },
      {
        metodo: "PUT",
        ruta: "/trabajadores/:id",
        dto: "update-trabajador.dto.ts",
        campos: [
          ["nombre", "string", O],
          ["identificacion", "string", O],
          ["grupo", "produccion | admin", O],
          ["turno", "mañana | tarde | noche", O],
          ["fechaInicio", "fecha ISO", O],
        ],
      },
    ],
    lecturas: [
      { metodo: "GET", ruta: "/trabajadores", queries: [] },
      { metodo: "GET", ruta: "/trabajadores/:id", queries: [] },
      {
        metodo: "GET",
        ruta: "/trabajadores/buscar",
        queries: [
          ["q", "string", O],
          ["nombre", "string", O],
          ["identificacion", "string", O],
          ["limit", "string", "Opcional, defecto 20"],
        ],
      },
    ],
  },
  maquina: {
    escrituras: [
      {
        metodo: "POST",
        ruta: "/maquinas",
        dto: "create-maquina.dto.ts",
        campos: [
          ["nombre", "string, 1 a 50", S],
          ["codigo", "string, 1 a 50", S],
          ["ubicacion", "string, 1 a 100", S],
          ["fechaInstalacion", "fecha ISO", S],
          ["tipo", "enum TipoMaquina", S],
          ["areaId", "uuid", S],
          ["observaciones", "string, 0 a 255", "Obligatorio para el validador; admite cadena vacía"],
        ],
      },
      {
        metodo: "PUT",
        ruta: "/maquinas/:id",
        dto: "update-maquina.dto.ts",
        campos: [
          ["nombre", "string, 1 a 50", O],
          ["ubicacion", "string, 1 a 100", O],
          ["fechaInstalacion", "fecha ISO", O],
          ["tipo", "enum TipoMaquina", O],
          ["observaciones", "string, 0 a 255", O],
          ["areaId", "uuid", O],
        ],
      },
    ],
    lecturas: [
      { metodo: "GET", ruta: "/maquinas", queries: [] },
      { metodo: "GET", ruta: "/maquinas/:id", queries: [] },
      { metodo: "GET", ruta: "/maquinas/tipos", queries: [] },
      {
        metodo: "GET",
        ruta: "/maquinas/buscar",
        queries: [
          ["q", "string", O],
          ["nombre", "string", O],
          ["areaId", "string", O],
          ["limit", "string", "Opcional, defecto 20"],
        ],
      },
    ],
  },
  "orden-produccion": {
    escrituras: [
      {
        metodo: "POST",
        ruta: "/ordenes",
        dto: "crear-orden.dto.ts y paso-orden.dto.ts",
        campos: [
          ["numero", "string", S],
          ["producto", "string", S],
          ["cantidadAProducir", "entero", S],
          ["fechaOrden", "Date", S],
          ["fechaVencimiento", "Date", S],
          ["pasos", "arreglo de pasos", S],
          ["pasos[].nombre", "string", S],
          ["pasos[].codigoInterno", "string", S],
          ["pasos[].cantidadRequerida", "número", S],
          ["pasos[].numeroPaso", "entero", S],
          ["pasos[].cantidadProducida", "número", O],
          ["pasos[].cantidadPedaleos", "número", O],
          ["pasos[].estado", "pendiente | activo | pausado | finalizado", O],
        ],
      },
    ],
    lecturas: [
      { metodo: "GET", ruta: "/ordenes", queries: [] },
      { metodo: "GET", ruta: "/ordenes/:id", queries: [] },
      { metodo: "GET", ruta: "/ordenes/:id/pasos-mini", queries: [] },
      { metodo: "GET", ruta: "/ordenes/:id/detalle", queries: [] },
    ],
  },
  "paso-produccion": {
    escrituras: [
      {
        metodo: "POST",
        ruta: "/pasos",
        dto: "create-paso-produccion.dto.ts",
        campos: [
          ["nombre", "string", S],
          ["orden", "uuid", S],
          ["codigoInterno", "string", S],
          ["cantidadRequerida", "número", S],
          ["numeroPaso", "número", S],
        ],
      },
      {
        metodo: "PUT",
        ruta: "/pasos/:id",
        dto: "update-paso-produccion.dto.ts",
        campos: [
          ["nombre", "string", O],
          ["orden", "uuid", O],
          ["codigoInterno", "string", O],
          ["cantidadRequerida", "número", O],
          ["cantidadProducida", "número", O],
          ["cantidadPedaleos", "número", O],
          ["numeroPaso", "número", O],
        ],
      },
      { metodo: "PATCH", ruta: "/pasos/:id/finalizar", dto: "Sin cuerpo.", campos: [] },
    ],
    lecturas: [
      { metodo: "GET", ruta: "/pasos", queries: [] },
      { metodo: "GET", ruta: "/pasos/:id", queries: [] },
      { metodo: "GET", ruta: "/pasos/orden/:ordenId", queries: [] },
    ],
  },
  "material-orden": {
    escrituras: [
      {
        metodo: "POST",
        ruta: "/materiales-orden",
        dto: "create-material-orden.dto.ts",
        campos: [
          ["orden", "uuid", S],
          ["codigo", "string", S],
          ["descripcion", "string", S],
          ["unidad", "string", S],
          ["cantidad", "entero", S],
        ],
      },
      {
        metodo: "PUT",
        ruta: "/materiales-orden/:id",
        dto: "update-material-orden.dto.ts",
        campos: [
          ["orden", "uuid", O],
          ["codigo", "string", O],
          ["descripcion", "string", O],
          ["unidad", "string", O],
          ["cantidad", "entero", O],
        ],
      },
    ],
    lecturas: [
      { metodo: "GET", ruta: "/materiales-orden", queries: [] },
      { metodo: "GET", ruta: "/materiales-orden/:id", queries: [] },
    ],
  },
  minuta: {
    escrituras: [
      {
        metodo: "POST",
        ruta: "/minutas",
        dto: "create-minuta.dto.ts",
        campos: [
          ["recursoId", "string", S],
          ["ordenId", "string", S],
          ["pasoId", "string", S],
          ["cantidad", "número", S],
          ["pedalazos", "número", S],
          ["observaciones", "string", O],
        ],
      },
    ],
    lecturas: [
      { metodo: "GET", ruta: "/minutas", queries: [] },
      { metodo: "GET", ruta: "/minutas/:id", queries: [] },
    ],
  },
  "sesion-trabajo": {
    escrituras: [
      {
        metodo: "POST",
        ruta: "/sesiones-trabajo",
        dto: "create-sesion-trabajo.dto.ts",
        campos: [
          ["trabajador", "uuid", S],
          ["maquina", "uuid", S],
          ["desdeTablet", "boolean", O],
        ],
        queries: [["esp32", "string", "Opcional. El valor true devuelve solo el id"]],
      },
      {
        metodo: "PUT",
        ruta: "/sesiones-trabajo/:id",
        dto: "update-sesion-trabajo.dto.ts",
        campos: [
          ["fechaFin", "boolean", O],
          ["cantidadProducida", "número", O],
          ["cantidadPedaleos", "número", O],
        ],
      },
      { metodo: "POST", ruta: "/sesiones-trabajo/:id/finalizar", dto: "Sin cuerpo.", campos: [] },
      { metodo: "POST", ruta: "/sesiones-trabajo/finalizar-todas", dto: "Sin cuerpo.", campos: [] },
    ],
    lecturas: [
      { metodo: "GET", ruta: "/sesiones-trabajo", queries: [] },
      { metodo: "GET", ruta: "/sesiones-trabajo/actuales", queries: [] },
      { metodo: "GET", ruta: "/sesiones-trabajo/activas/resumen", queries: [] },
      { metodo: "GET", ruta: "/sesiones-trabajo/:id", queries: [] },
      { metodo: "GET", ruta: "/sesiones-trabajo/:id/orden-produccion", queries: [] },
      {
        metodo: "GET",
        ruta: "/sesiones-trabajo/activas",
        queries: [["trabajador", "uuid", O]],
      },
      {
        metodo: "GET",
        ruta: "/sesiones-trabajo/:id/serie-minuto",
        queries: [
          ["inicio", "fecha ISO", O],
          ["fin", "fecha ISO", O],
        ],
      },
      {
        metodo: "GET",
        ruta: "/sesiones-trabajo/maquina/:id/activa",
        queries: [["esp32", "string", "Opcional. El valor true devuelve solo el id"]],
      },
      {
        metodo: "GET",
        ruta: "/sesiones-trabajo/maquina/:id/rango",
        queries: [
          ["desde", "string", S],
          ["hasta", "string", S],
        ],
      },
    ],
  },
  "sesion-trabajo-paso": {
    escrituras: [
      {
        metodo: "POST",
        ruta: "/sesion-trabajo-pasos",
        dto: "create-sesion-trabajo-paso.dto.ts",
        campos: [
          ["sesionTrabajo", "uuid", S],
          ["pasoOrden", "uuid", S],
          ["cantidadAsignada", "número", O],
          ["porAdministrador", "boolean", O],
          ["desdeTablet", "boolean", O],
        ],
      },
      {
        metodo: "POST",
        ruta: "/sesion-trabajo-pasos/batch",
        dto: "Arreglo de create-sesion-trabajo-paso.dto.ts",
        campos: [
          ["[]", "arreglo del DTO de alta", S],
        ],
        nota: "El tipo en ejecución es un arreglo. El ValidationPipe no recorre cada elemento.",
      },
      {
        metodo: "PUT",
        ruta: "/sesion-trabajo-pasos/:id",
        dto: "update-sesion-trabajo-paso.dto.ts",
        campos: [
          ["cantidadAsignada", "número", O],
          ["cantidadProducida", "número", O],
          ["cantidadPedaleos", "número", O],
          ["comentarioDefectuosas", "string", O],
        ],
      },
      {
        metodo: "PUT",
        ruta: "/sesion-trabajo-pasos/batch",
        dto: "Arreglo de { id, data }",
        campos: [
          ["[].id", "uuid", S],
          ["[].data", "update-sesion-trabajo-paso.dto.ts", S],
        ],
        nota: "El tipo en ejecución es un arreglo. El ValidationPipe no recorre cada elemento.",
      },
      { metodo: "POST", ruta: "/sesion-trabajo-pasos/:id/finalizar", dto: "Sin cuerpo.", campos: [] },
      { metodo: "POST", ruta: "/sesion-trabajo-pasos/finalizar-sesiones-terminadas", dto: "Sin cuerpo.", campos: [] },
    ],
    lecturas: [
      { metodo: "GET", ruta: "/sesion-trabajo-pasos", queries: [] },
      { metodo: "GET", ruta: "/sesion-trabajo-pasos/:id", queries: [] },
      { metodo: "GET", ruta: "/sesion-trabajo-pasos/por-paso/:pasoId", queries: [] },
      { metodo: "GET", ruta: "/sesion-trabajo-pasos/por-sesion/:sesionId", queries: [] },
    ],
  },
  "registro-minuto": {
    escrituras: [
      {
        metodo: "POST",
        ruta: "/registro-minuto/acumular",
        dto: "acumulador.dto.ts",
        campos: [
          ["maquina", "uuid", S],
          ["paso", "uuid", S],
          ["tipo", "pedal | pieza", S],
          ["minutoInicio", "fecha ISO", O],
        ],
      },
      { metodo: "POST", ruta: "/registro-minuto/guardar", dto: "Sin cuerpo.", campos: [] },
    ],
    lecturas: [
      { metodo: "GET", ruta: "/registro-minuto/sesion/:id", queries: [] },
      { metodo: "GET", ruta: "/registro-minuto/sesion/:id/ultimos", queries: [] },
    ],
  },
  "estado-sesion": {
    escrituras: [
      {
        metodo: "POST",
        ruta: "/estados-sesion",
        dto: "create-estado-sesion.dto.ts",
        campos: [
          ["sesionTrabajo", "uuid", S],
          ["estado", "produccion | inactivo | otro", S],
          ["inicio", "Date", S],
          ["fin", "Date", O],
        ],
      },
      {
        metodo: "PUT",
        ruta: "/estados-sesion/:id",
        dto: "update-estado-sesion.dto.ts",
        campos: [
          ["sesionTrabajo", "uuid", O],
          ["estado", "produccion | inactivo | otro", O],
          ["inicio", "Date", O],
          ["fin", "Date", O],
        ],
      },
    ],
    lecturas: [
      { metodo: "GET", ruta: "/estados-sesion", queries: [] },
      { metodo: "GET", ruta: "/estados-sesion/:id", queries: [] },
      { metodo: "GET", ruta: "/estados-sesion/por-sesion/:sesionId", queries: [] },
    ],
  },
  "estado-trabajador": {
    escrituras: [
      {
        metodo: "POST",
        ruta: "/estados-trabajador",
        dto: "create-estado-trabajador.dto.ts",
        campos: [
          ["trabajador", "uuid", S],
          ["descanso", "boolean", S],
        ],
      },
      {
        metodo: "PUT",
        ruta: "/estados-trabajador/:id",
        dto: "update-estado-trabajador.dto.ts",
        campos: [["fin", "fecha ISO", O]],
      },
      { metodo: "POST", ruta: "/estados-trabajador/trabajador/:id/finalizar-descanso", dto: "Sin cuerpo.", campos: [] },
    ],
    lecturas: [
      { metodo: "GET", ruta: "/estados-trabajador", queries: [] },
      { metodo: "GET", ruta: "/estados-trabajador/:id", queries: [] },
      {
        metodo: "GET",
        ruta: "/estados-trabajador/trabajador/:id",
        queries: [
          ["inicio", "string", S],
          ["fin", "string", S],
        ],
      },
    ],
  },
  "estado-maquina": {
    escrituras: [
      {
        metodo: "POST",
        ruta: "/estados-maquina",
        dto: "create-estado-maquina.dto.ts",
        campos: [
          ["maquina", "uuid", S],
          ["mantenimiento", "boolean", S],
        ],
      },
      {
        metodo: "PUT",
        ruta: "/estados-maquina/:id",
        dto: "update-estado-maquina.dto.ts",
        campos: [["fin", "fecha ISO", O]],
      },
      { metodo: "POST", ruta: "/estados-maquina/maquina/:id/finalizar-mantenimiento", dto: "Sin cuerpo.", campos: [] },
    ],
    lecturas: [
      { metodo: "GET", ruta: "/estados-maquina", queries: [] },
      { metodo: "GET", ruta: "/estados-maquina/:id", queries: [] },
      {
        metodo: "GET",
        ruta: "/estados-maquina/maquina/:id",
        queries: [
          ["inicio", "string", S],
          ["fin", "string", S],
        ],
      },
    ],
  },
  "produccion-diaria": {
    escrituras: [],
    lecturas: [
      { metodo: "GET", ruta: "/produccion/diaria/mes-actual", queries: [["areaId", "string", O]] },
      { metodo: "GET", ruta: "/produccion/diaria/ultimos-30-dias", queries: [["areaId", "string", O]] },
      { metodo: "GET", ruta: "/produccion/mensual/ano-actual", queries: [["areaId", "string", O]] },
      { metodo: "GET", ruta: "/produccion/mensual/ultimos-12-meses", queries: [["areaId", "string", O]] },
    ],
  },
  indicadores: {
    escrituras: [],
    lecturas: [
      {
        metodo: "GET",
        ruta: "/indicadores/producto",
        queries: [
          ["productoId", "string", "Opcional. Si falta, hace falta producto"],
          ["producto", "string", "Opcional. El servicio exige producto o productoId"],
          ["periodo", "diario | semanal | mensual", O],
          ["inicio", "fecha ISO", O],
          ["fin", "fecha ISO", O],
          ["compararCon", "previo | mismoPeriodoAnterior | personalizado | ninguno", O],
          ["compararInicio", "fecha ISO", O],
          ["compararFin", "fecha ISO", O],
          ["targetNc", "número en texto", O],
          ["targetNpt", "número en texto", O],
          ["targetCumplimiento", "número en texto", O],
        ],
      },
      { metodo: "GET", ruta: "/indicadores/diaria/mes-actual", queries: [["areaId", "string", O]] },
      { metodo: "GET", ruta: "/indicadores/diaria/ultimos-30-dias", queries: [["areaId", "string", O]] },
      { metodo: "GET", ruta: "/indicadores/mensual/ano-actual", queries: [["areaId", "string", O]] },
      { metodo: "GET", ruta: "/indicadores/mensual/ultimos-12-meses", queries: [["areaId", "string", O]] },
      { metodo: "GET", ruta: "/indicadores/resumen/dia", queries: [["fecha", "string", O]] },
      { metodo: "GET", ruta: "/indicadores/resumen/mes-actual", queries: [] },
      { metodo: "GET", ruta: "/indicadores/realtime/area-velocidad", queries: [["areaId", "string", O]] },
      {
        metodo: "GET",
        ruta: "/indicadores/sesiones/velocidad-normalizada",
        queries: [
          ["inicio", "fecha ISO", S],
          ["fin", "fecha ISO", S],
          ["areaId", "string", O],
          ["points", "string", "Opcional, defecto 50"],
        ],
      },
      {
        metodo: "GET",
        ruta: "/indicadores/trabajadores",
        queries: [
          ["rango", "hoy | semana | mes | ultimos-30-dias | ano | ultimos-12-meses", O],
          ["inicio", "fecha ISO", O],
          ["fin", "fecha ISO", O],
          ["metrics", "lista separada por comas", O],
          ["compararCon", "previo | mismo-periodo-anterior | personalizado | ninguno", O],
          ["compararInicio", "fecha ISO", O],
          ["compararFin", "fecha ISO", O],
        ],
      },
      {
        metodo: "GET",
        ruta: "/indicadores/trabajadores/:id/resumen",
        queries: [
          ["inicio", "fecha ISO", S],
          ["fin", "fecha ISO", S],
          ["includeVentana", "string", "Opcional, defecto false"],
        ],
      },
      {
        metodo: "GET",
        ruta: "/indicadores/trabajadores/:id/diaria",
        queries: [
          ["rango", "string", O],
          ["inicio", "fecha ISO", O],
          ["fin", "fecha ISO", O],
        ],
      },
      {
        metodo: "GET",
        ruta: "/indicadores/maquinas",
        queries: [
          ["rango", "string", O],
          ["inicio", "fecha ISO", O],
          ["fin", "fecha ISO", O],
          ["metrics", "lista separada por comas", O],
        ],
      },
      {
        metodo: "GET",
        ruta: "/indicadores/maquinas/:id/resumen",
        queries: [
          ["inicio", "fecha ISO", S],
          ["fin", "fecha ISO", S],
          ["includeVentana", "string", "Opcional, defecto false"],
        ],
      },
      {
        metodo: "GET",
        ruta: "/indicadores/maquinas/:id/diaria",
        queries: [
          ["rango", "string", O],
          ["inicio", "fecha ISO", O],
          ["fin", "fecha ISO", O],
        ],
      },
    ],
  },
  alerta: {
    escrituras: [
      {
        metodo: "PUT",
        ruta: "/alertas/umbrales",
        dto: "update-umbrales-alerta.dto.ts",
        campos: [
          ["maxDescansosDiariosPorTrabajador", "entero, mínimo 1", O],
          ["maxDuracionPausaMinutos", "entero, mínimo 1", O],
          ["minutosInactividadParaNPT", "entero, mínimo 1", O],
        ],
      },
    ],
    lecturas: [
      { metodo: "GET", ruta: "/alertas/umbrales", queries: [] },
      {
        metodo: "GET",
        ruta: "/alertas",
        queries: [
          ["fecha", "YYYY-MM-DD", O],
          ["trabajadorId", "string", O],
          ["identificacion", "string", O],
        ],
      },
      {
        metodo: "GET",
        ruta: "/alertas/trabajador/rango",
        queries: [
          ["desde", "YYYY-MM-DD", S],
          ["hasta", "YYYY-MM-DD", S],
          ["trabajadorId", "string", O],
          ["identificacion", "string", O],
        ],
      },
      {
        metodo: "GET",
        ruta: "/alertas/maquina/rango",
        queries: [
          ["desde", "YYYY-MM-DD", S],
          ["hasta", "YYYY-MM-DD", S],
          ["maquinaId", "uuid", O],
          ["maquina", "id, código o nombre", O],
        ],
      },
    ],
  },
};

function TablaFilas({ columnas, filas }) {
  return (
    <table className="manual-tabla">
      <thead>
        <tr>
          {columnas.map((columna) => (
            <th key={columna}>{columna}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {filas.map((fila) => (
          <tr key={fila[0]}>
            {fila.map((celda, indice) => (
              <td key={indice} className={indice === 0 ? "ruta" : undefined}>{celda}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function pideJwt(id, metodo, ruta) {
  const fila = servicioPorId(id)?.endpoints?.find((item) => item[0] === metodo && item[1] === ruta);
  return fila ? fila[2] === "JWT" : false;
}

function rutaExterna(ruta) {
  if (ruta === "/") return "/api/";
  return `/api${ruta}`;
}

function encabezado(metodo, ruta, jwt) {
  const lineas = [`${metodo} ${rutaExterna(ruta)}`];
  if (metodo !== "GET") lineas.push("Content-Type: application/json");
  if (jwt) lineas.push("Authorization: Bearer <token>");
  return lineas.join("\n");
}

function Bloque({ titulo, texto }) {
  if (!texto) return null;
  return (
    <>
      <p>{titulo}</p>
      <pre className="plano">{texto}</pre>
    </>
  );
}

function EjemploJson({ id, metodo, ruta }) {
  const ejemplo = ejemploDe(metodo, ruta);
  if (!ejemplo) return null;
  const jwt = pideJwt(id, metodo, ruta);
  return (
    <>
      <Bloque titulo="Llamada" texto={encabezado(metodo, ruta, jwt)} />
      <Bloque titulo="Cuerpo" texto={ejemplo.peticion} />
      <Bloque titulo="Cuerpo mínimo, sin los opcionales" texto={ejemplo.minima} />
      <Bloque titulo="Respuesta de éxito" texto={ejemplo.respuesta} />
      {ejemplo.aviso ? <p>{ejemplo.aviso}</p> : null}
    </>
  );
}

function NotaValidacion({ manual }) {
  if (manual) {
    return (
      <div className="nota">
        <strong>ERROR DE ESTE CUERPO. </strong>
        Estos POST no usan un DTO. El controlador responde <span className="ruta">{`{ error: "texto" }`}</span>.
        No pasa por el ValidationPipe, así que una propiedad de más no produce el 400 de la lista blanca.
      </div>
    );
  }
  return (
    <div className="nota">
      <strong>ERROR DE VALIDACIÓN. </strong>
      El ValidationPipe global usa lista blanca y rechaza propiedades que el DTO no declara.
      La respuesta es 400 con <span className="ruta">statusCode</span>, <span className="ruta">error: "Bad Request"</span> y <span className="ruta">message</span> como arreglo de textos de class-validator.
      Una propiedad extra entra en ese arreglo como <span className="ruta">property &lt;nombre&gt; should not exist</span>.
      El tubo no tiene <span className="ruta">transform: true</span>: un campo <span className="ruta">Date</span> no acepta un texto ISO, y un boolean o un entero tienen que llegar con ese tipo.
    </div>
  );
}

export default function ContratoFicha({ id }) {
  const contrato = CONTRATOS[id];
  if (!contrato) return null;
  const escrituras = contrato.escrituras || [];
  const lecturas = contrato.lecturas || [];
  const sinQuery = lecturas.filter((item) => item.queries.length === 0);
  const conQuery = lecturas.filter((item) => item.queries.length > 0);
  const usaTubo = escrituras.some((item) => item.campos.length > 0 && !item.manual);
  const usaManual = escrituras.some((item) => item.manual);

  return (
    <>
      {escrituras.length > 0 ? (
        <>
          <h3>Cuerpo de escritura</h3>
          {escrituras.map((item) => (
            <section key={`${item.metodo}-${item.ruta}`}>
              <h4>{item.metodo} <span className="ruta">{item.ruta}</span></h4>
              <p>{item.dto}</p>
              {item.campos.length > 0 ? (
                <TablaFilas columnas={["Campo", "Tipo", "Presencia"]} filas={item.campos} />
              ) : (
                <p>Sin cuerpo.</p>
              )}
              {item.queries ? (
                <>
                  <p>Query de esta escritura:</p>
                  <TablaFilas columnas={["Query", "Tipo", "Presencia"]} filas={item.queries} />
                </>
              ) : null}
              {item.nota ? <p>{item.nota}</p> : null}
              <EjemploJson id={id} metodo={item.metodo} ruta={item.ruta} />
            </section>
          ))}
          {usaTubo ? <NotaValidacion /> : null}
          {usaManual ? <NotaValidacion manual /> : null}
        </>
      ) : null}

      {lecturas.length > 0 ? (
        <>
          <h3>Query de lectura</h3>
          {sinQuery.length > 0 ? (
            <>
              <p>
                Sin query: {sinQuery.map((item) => item.ruta).join(", ")}.
              </p>
              {sinQuery.map((item) => (
                <EjemploJson key={`${item.metodo}-${item.ruta}`} id={id} metodo={item.metodo} ruta={item.ruta} />
              ))}
            </>
          ) : null}
          {conQuery.map((item) => (
            <section key={`${item.metodo}-${item.ruta}`}>
              <h4>{item.metodo} <span className="ruta">{item.ruta}</span></h4>
              <TablaFilas columnas={["Query", "Tipo", "Presencia"]} filas={item.queries} />
              <EjemploJson id={id} metodo={item.metodo} ruta={item.ruta} />
            </section>
          ))}
        </>
      ) : null}
    </>
  );
}
