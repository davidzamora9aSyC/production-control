import { Link } from "react-router-dom";

function Atributos({ filas }) {
  return (
    <table className="manual-tabla">
      <thead>
        <tr>
          <th>Atributo</th>
          <th>Tipo</th>
          <th>Obligatorio</th>
          <th>Apunta a</th>
        </tr>
      </thead>
      <tbody>
        {filas.map(([atributo, tipo, obligatorio, apunta]) => (
          <tr key={atributo}>
            <td className="ruta">{atributo}</td>
            <td>{tipo}</td>
            <td>{obligatorio}</td>
            <td>{apunta}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default function ModeloDatos() {
  return (
    <>
      <h2>Modelo de datos</h2>
      <p>
        PostgreSQL, vía TypeORM. El dibujo sigue las relaciones que declaran las entidades.
        El detalle de cada pantalla que las usa está en <Link to="/documentacion/front">Frontend</Link> y las rutas y contratos están en <Link to="/documentacion/backend">Backend y API</Link>.
      </p>

      <h3>Como leer este modelo</h3>
      <p>Estas categorias solo organizan la documentacion; no son tipos ni estados de PostgreSQL. Todas las tablas se persisten. La categoria indica el papel que juega la informacion en el sistema.</p>
      <table className="manual-tabla">
        <thead>
          <tr>
            <th>Clase</th>
            <th>Qué es</th>
            <th>Tablas</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Catálogos y planificación</td>
            <td>Información que define el contexto antes de producir: personas, máquinas, áreas, órdenes, pasos y materiales.</td>
            <td><span className="ruta">area</span>, <span className="ruta">Maquina</span>, <span className="ruta">trabajador</span>, <span className="ruta">OrdenProduccion</span>, <span className="ruta">PasoProduccion</span>, <span className="ruta">material_orden</span>, <span className="ruta">alerta_tipo</span>, <span className="ruta">auth_user</span></td>
          </tr>
          <tr>
            <td>Registros operativos</td>
            <td>Hechos que ocurren durante la operación: una sesión, un trabajo, un conteo, una pausa, un estado o una alerta.</td>
            <td><span className="ruta">sesion_trabajo</span>, <span className="ruta">sesion_trabajo_paso</span>, <span className="ruta">registro_minuto</span>, <span className="ruta">pausa_paso_sesion</span>, <span className="ruta">estado_sesion</span>, <span className="ruta">estado_trabajador</span>, <span className="ruta">estado_maquina</span>, <span className="ruta">alerta</span></td>
          </tr>
          <tr>
            <td>Indicadores calculados</td>
            <td>Indicadores que el proceso arma a partir del minuto, las pausas y la duración, y después persiste.</td>
            <td><span className="ruta">indicador_sesion_minuto</span>, <span className="ruta">indicador_sesion</span>, <span className="ruta">indicador_diario_dim</span></td>
          </tr>
        </tbody>
      </table>
      <p>
        En el paso, en la sesión y en la asignación, <span className="ruta">cantidadProducida</span> y <span className="ruta">cantidadPedaleos</span> son acumulados. El registro por minuto los incrementa; la captura manual también los incrementa al cerrar un trabajo. No representan una orden ni reemplazan el historial de minutos.
      </p>

      <h3>Relaciones</h3>
      <pre className="plano">{`area
 └── Maquina
       ├── estado_maquina
       └── sesion_trabajo ──── trabajador
             │                      └── estado_trabajador
             ├── estado_sesion
             ├── sesion_trabajo_paso ── PasoProduccion ── OrdenProduccion
             │         │                                      └── material_orden
             │         └── pausa_paso_sesion
             ├── registro_minuto
             ├── indicador_sesion_minuto
             └── indicador_sesion

indicador_diario_dim   ids de área, máquina y trabajador, sin clave foránea
alerta ── alerta_tipo  sujetoId según sujetoTipo, sin clave foránea
auth_user              sin relación con el resto`}</pre>
      <div className="nota">
        <strong>NOMBRE DE LA CLASE. </strong>
        Cuatro tablas se llaman como la clase porque <span className="ruta">@Entity()</span> no fija otro nombre: <span className="ruta">Maquina</span>, <span className="ruta">OrdenProduccion</span>, <span className="ruta">PasoProduccion</span> y <span className="ruta">Minuta</span>.
        Minuta es un recurso histórico simple, separado del flujo principal de sesión y asignación. Este dibujo sigue área, orden, sesión, indicadores, alerta y <span className="ruta">auth_user</span>.
      </div>

      <h3>area</h3>
      <p>Catálogo. Carpeta <span className="ruta">src/area</span>.</p>
      <Atributos filas={[
        ["id", "uuid", "Sí", "—"],
        ["nombre", "varchar", "Sí", "—"],
      ]} />

      <h3>Maquina</h3>
      <p>Catálogo. El nombre de la tabla es el de la clase. Carpeta <span className="ruta">src/maquina</span>.</p>
      <Atributos filas={[
        ["id", "uuid", "Sí", "—"],
        ["nombre", "varchar", "Sí", "—"],
        ["codigo", "varchar", "Sí, defecto vacío", "—"],
        ["ubicacion", "varchar(100)", "No", "—"],
        ["fechaInstalacion", "varchar", "No", "—"],
        ["tipo", "enum TipoMaquina", "No", "—"],
        ["observaciones", "varchar(255)", "No", "—"],
        ["areaId", "uuid", "Sí", "area"],
        ["createdAt", "timestamp", "Sí", "—"],
        ["updatedAt", "timestamp", "Sí", "—"],
      ]} />

      <h3>trabajador</h3>
      <p>Catálogo. Carpeta <span className="ruta">src/trabajador</span>.</p>
      <Atributos filas={[
        ["id", "uuid", "Sí", "—"],
        ["nombre", "varchar", "Sí", "—"],
        ["identificacion", "varchar, único", "Sí", "—"],
        ["grupo", "enum produccion | admin", "Sí", "—"],
        ["turno", "enum mañana | tarde | noche", "Sí", "—"],
        ["fechaInicio", "date", "Sí", "—"],
        ["createdAt", "timestamp", "Sí", "—"],
        ["updatedAt", "timestamp", "Sí", "—"],
      ]} />

      <h3>OrdenProduccion</h3>
      <p>Planificación. El nombre de la tabla es el de la clase. Carpeta <span className="ruta">src/orden-produccion</span>.</p>
      <Atributos filas={[
        ["id", "uuid", "Sí", "—"],
        ["numero", "varchar", "Sí", "—"],
        ["producto", "varchar", "Sí", "—"],
        ["cantidadAProducir", "int", "Sí", "—"],
        ["fechaOrden", "date", "Sí", "—"],
        ["fechaVencimiento", "date", "Sí", "—"],
        ["estado", "enum pendiente | activa | pausada | finalizada", "Sí, defecto pendiente", "—"],
        ["createdAt", "timestamptz", "No", "—"],
      ]} />

      <h3>PasoProduccion</h3>
      <p>Planificación. El nombre de la tabla es el de la clase. Borrar la orden borra sus pasos. Carpeta <span className="ruta">src/paso-produccion</span>.</p>
      <Atributos filas={[
        ["id", "uuid", "Sí", "—"],
        ["nombre", "varchar", "Sí", "—"],
        ["ordenId", "uuid", "Sí", "OrdenProduccion"],
        ["codigoInterno", "varchar", "Sí", "—"],
        ["cantidadRequerida", "int", "Sí", "—"],
        ["cantidadProducida", "int", "Sí", "—"],
        ["cantidadPedaleos", "int", "Sí, defecto 0", "—"],
        ["fechaMetaAlcanzada", "timestamptz", "No", "—"],
        ["estado", "enum pendiente | activo | pausado | finalizado", "Sí, defecto pendiente", "—"],
        ["numeroPaso", "int", "Sí", "—"],
      ]} />

      <h3>material_orden</h3>
      <p>Planificación. Carpeta <span className="ruta">src/material-orden</span>.</p>
      <Atributos filas={[
        ["id", "uuid", "Sí", "—"],
        ["ordenId", "uuid", "Sí", "OrdenProduccion"],
        ["codigo", "varchar", "Sí", "—"],
        ["descripcion", "varchar", "Sí", "—"],
        ["unidad", "varchar", "Sí", "—"],
        ["cantidad", "int", "Sí", "—"],
      ]} />

      <h3>sesion_trabajo</h3>
      <p>Registro operativo: la unión temporal entre trabajador y máquina. Carpeta <span className="ruta">src/sesion-trabajo</span>.</p>
      <Atributos filas={[
        ["id", "uuid", "Sí", "—"],
        ["trabajadorId", "uuid", "Sí", "trabajador"],
        ["maquinaId", "uuid", "Sí", "Maquina"],
        ["areaIdSnapshot", "uuid", "No", "copia el id de area al crear"],
        ["fechaInicio", "timestamp", "Sí", "—"],
        ["fechaFin", "timestamp", "No", "—"],
        ["cantidadProducida", "int", "Sí, defecto 0", "—"],
        ["cantidadPedaleos", "int", "Sí, defecto 0", "—"],
        ["agregadoEnProduccion", "boolean", "Sí, defecto false", "—"],
        ["fuente", "enum firmware | tablet", "No", "—"],
      ]} />

      <h3>sesion_trabajo_paso</h3>
      <p>Registro operativo: une la sesión con el paso y representa el trabajo realizado. Borrar la sesión o el paso borra la asignación. Carpeta <span className="ruta">src/sesion-trabajo-paso</span>.</p>
      <Atributos filas={[
        ["id", "uuid", "Sí", "—"],
        ["sesionTrabajoId", "uuid", "Sí", "sesion_trabajo"],
        ["pasoOrdenId", "uuid", "Sí", "PasoProduccion"],
        ["cantidadAsignada", "int", "Sí, defecto 0", "—"],
        ["cantidadProducida", "int", "Sí, defecto 0", "—"],
        ["cantidadPedaleos", "int", "Sí, defecto 0", "—"],
        ["comentarioDefectuosas", "text", "No", "—"],
        ["fuente", "enum firmware | tablet", "No", "—"],
        ["finalizado", "boolean", "Sí, defecto false", "—"],
        ["finalizadoEn", "timestamptz", "No", "—"],
        ["createdAt", "timestamptz", "No", "—"],
      ]} />

      <h3>registro_minuto</h3>
      <p>Registro operativo: conteos asociados a una sesión y a su trabajo. Borrar la sesión o la asignación borra el registro. Carpeta <span className="ruta">src/registro-minuto</span>.</p>
      <Atributos filas={[
        ["id", "uuid", "Sí", "—"],
        ["sesionTrabajoId", "uuid", "Sí", "sesion_trabajo"],
        ["pasoSesionTrabajoId", "uuid", "Sí", "sesion_trabajo_paso"],
        ["minutoInicio", "timestamp", "Sí", "—"],
        ["pedaleadas", "int", "Sí", "—"],
        ["piezasContadas", "int", "Sí", "—"],
      ]} />

      <h3>pausa_paso_sesion</h3>
      <p>Registro operativo: intervalo de pausa de un trabajo asignado. <span className="ruta">maquinaId</span> y <span className="ruta">trabajadorId</span> guardan el uuid sin relación TypeORM. Carpeta <span className="ruta">src/pausa-paso-sesion</span>.</p>
      <Atributos filas={[
        ["id", "uuid", "Sí", "—"],
        ["pasoSesionId", "uuid", "Sí", "sesion_trabajo_paso"],
        ["inicio", "timestamp", "Sí", "—"],
        ["fin", "timestamp", "No", "—"],
        ["maquinaId", "uuid", "No", "id de Maquina, sin clave foránea"],
        ["trabajadorId", "uuid", "No", "id de trabajador, sin clave foránea"],
      ]} />

      <h3>estado_sesion</h3>
      <p>Registro operativo: historial de estados de una sesión. Valores <span className="ruta">produccion</span>, <span className="ruta">inactivo</span>, <span className="ruta">otro</span>. Carpeta <span className="ruta">src/estado-sesion</span>.</p>
      <Atributos filas={[
        ["id", "uuid", "Sí", "—"],
        ["sesionTrabajoId", "uuid", "Sí", "sesion_trabajo"],
        ["estado", "enum", "Sí", "—"],
        ["inicio", "timestamp", "Sí", "—"],
        ["fin", "timestamp", "No", "—"],
      ]} />

      <h3>estado_trabajador</h3>
      <p>Registro operativo: descanso del trabajador. Carpeta <span className="ruta">src/estado-trabajador</span>.</p>
      <Atributos filas={[
        ["id", "uuid", "Sí", "—"],
        ["trabajadorId", "uuid", "Sí", "trabajador"],
        ["descanso", "boolean", "Sí, defecto false", "—"],
        ["origen", "varchar(50)", "No", "—"],
        ["inicio", "timestamp", "Sí", "—"],
        ["fin", "timestamp", "No", "—"],
      ]} />

      <h3>estado_maquina</h3>
      <p>Registro operativo: mantenimiento de la máquina. Carpeta <span className="ruta">src/estado-maquina</span>.</p>
      <Atributos filas={[
        ["id", "uuid", "Sí", "—"],
        ["maquinaId", "uuid", "Sí", "Maquina"],
        ["mantenimiento", "boolean", "Sí, defecto false", "—"],
        ["inicio", "timestamp", "Sí", "—"],
        ["fin", "timestamp", "No", "—"],
      ]} />

      <h3>indicador_sesion_minuto</h3>
      <p>Indicador calculado. Una fila por sesión y minuto. Se borra al finalizar la sesión. Carpeta <span className="ruta">src/indicador-sesion-minuto</span>.</p>
      <Atributos filas={[
        ["id", "uuid", "Sí", "—"],
        ["sesionTrabajoId", "uuid", "Sí", "sesion_trabajo"],
        ["minuto", "timestamp", "Sí", "—"],
        ["produccionTotal", "int", "Sí", "—"],
        ["defectos", "int", "Sí", "—"],
        ["porcentajeDefectos", "float", "Sí", "—"],
        ["avgSpeed", "float", "Sí", "—"],
        ["avgSpeedSesion", "float", "Sí", "—"],
        ["velocidadActual", "float", "Sí", "—"],
        ["nptMin", "decimal(10,2)", "Sí", "—"],
        ["nptPorInactividad", "decimal(10,2)", "Sí", "—"],
        ["porcentajeNPT", "float", "Sí", "—"],
        ["pausasCount", "int", "Sí", "—"],
        ["pausasMin", "int", "Sí", "—"],
        ["porcentajePausa", "float", "Sí", "—"],
        ["duracionSesionMin", "int", "Sí", "—"],
        ["actualizadoEn", "timestamp", "Sí", "—"],
      ]} />

      <h3>indicador_sesion</h3>
      <p>Indicador calculado. Se escribe al finalizar la sesión. Los ids de área, trabajador y máquina quedan copiados, sin relación TypeORM. Carpeta <span className="ruta">src/indicador-sesion</span>.</p>
      <Atributos filas={[
        ["id", "uuid", "Sí", "—"],
        ["sesionTrabajoId", "uuid", "Sí", "sesion_trabajo"],
        ["areaIdSnapshot", "varchar", "Sí", "copia el id de area"],
        ["trabajadorId", "varchar", "Sí", "copia el id de trabajador"],
        ["maquinaId", "varchar", "Sí", "copia el id de Maquina"],
        ["maquinaTipo", "varchar", "Sí", "—"],
        ["fechaInicio", "timestamp", "Sí", "—"],
        ["fechaFin", "timestamp", "Sí", "—"],
        ["fuente", "enum firmware | tablet", "No", "—"],
        ["produccionTotal", "int", "Sí", "—"],
        ["defectos", "int", "Sí", "—"],
        ["porcentajeDefectos", "float", "Sí", "—"],
        ["avgSpeed", "float", "Sí", "—"],
        ["avgSpeedSesion", "float", "Sí", "—"],
        ["velocidadMax10m", "float", "Sí", "—"],
        ["nptMin", "int", "Sí", "—"],
        ["nptPorInactividad", "int", "Sí", "—"],
        ["porcentajeNPT", "float", "Sí", "—"],
        ["pausasCount", "int", "Sí", "—"],
        ["pausasMin", "int", "Sí", "—"],
        ["porcentajePausa", "float", "Sí", "—"],
        ["duracionSesionMin", "int", "Sí", "—"],
        ["creadoEn", "timestamp", "Sí", "—"],
      ]} />

      <h3>indicador_diario_dim</h3>
      <p>Indicador calculado: agregado del día. Los tres ids son opcionales y no son clave foránea. Carpeta <span className="ruta">src/indicador-diario-dim</span>.</p>
      <Atributos filas={[
        ["id", "uuid", "Sí", "—"],
        ["fecha", "date", "Sí", "—"],
        ["trabajadorId", "uuid", "No", "id de trabajador, sin clave foránea"],
        ["maquinaId", "uuid", "No", "id de Maquina, sin clave foránea"],
        ["areaId", "uuid", "No", "id de area, sin clave foránea"],
        ["fuente", "enum firmware | tablet", "No", "—"],
        ["produccionTotal", "int", "Sí", "—"],
        ["defectos", "int", "Sí", "—"],
        ["porcentajeDefectos", "float", "Sí", "—"],
        ["avgSpeed", "float", "Sí", "—"],
        ["avgSpeedSesion", "float", "Sí", "—"],
        ["nptMin", "int", "Sí", "—"],
        ["nptPorInactividad", "int", "Sí", "—"],
        ["porcentajeNPT", "float", "Sí", "—"],
        ["pausasCount", "int", "Sí", "—"],
        ["pausasMin", "int", "Sí", "—"],
        ["porcentajePausa", "float", "Sí", "—"],
        ["duracionTotalMin", "int", "Sí", "—"],
        ["sesionesCerradas", "int", "Sí", "—"],
        ["updatedAt", "timestamp", "Sí", "—"],
      ]} />

      <h3>alerta_tipo y alerta</h3>
      <p>
        <span className="ruta">alerta_tipo</span> es un catálogo de tipos.
        <span className="ruta">alerta</span> es un registro operativo de una alerta disparada. <span className="ruta">sujetoId</span> apunta, según <span className="ruta">sujetoTipo</span>, a trabajador, máquina, área u orden, sin clave foránea.
        Carpeta <span className="ruta">src/alerta</span>.
      </p>
      <Atributos filas={[
        ["alerta_tipo.id", "uuid", "Sí", "—"],
        ["alerta_tipo.codigo", "enum, único", "Sí", "—"],
        ["alerta_tipo.nombre", "varchar", "Sí", "—"],
        ["alerta_tipo.descripcion", "text", "Sí", "—"],
        ["alerta.id", "uuid", "Sí", "—"],
        ["alerta.tipoId", "uuid", "Sí", "alerta_tipo"],
        ["alerta.sujetoTipo", "enum TRABAJADOR | MAQUINA | AREA | ORDEN", "Sí", "—"],
        ["alerta.sujetoId", "uuid", "Sí", "id según sujetoTipo, sin clave foránea"],
        ["alerta.fecha", "date", "Sí", "—"],
        ["alerta.metadata", "jsonb", "No", "—"],
        ["alerta.createdAt", "timestamp", "Sí", "—"],
      ]} />

      <h3>auth_user</h3>
      <p>Catálogo de acceso al tablero. No tiene relación con trabajador. Carpeta <span className="ruta">src/auth</span>.</p>
      <Atributos filas={[
        ["id", "uuid", "Sí", "—"],
        ["username", "varchar, único", "Sí", "—"],
        ["name", "varchar", "No", "—"],
        ["passwordHash", "varchar", "Sí", "—"],
        ["isActive", "boolean", "Sí, defecto true", "—"],
        ["createdAt", "timestamp", "Sí", "—"],
        ["updatedAt", "timestamp", "Sí", "—"],
      ]} />
    </>
  );
}
