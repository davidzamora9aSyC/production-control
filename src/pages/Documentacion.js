import { useEffect, useState } from "react";
import { Link, NavLink, useLocation, useParams } from "react-router-dom";
import logoSmartIndustries from "../assets/logo2.png";
import "../documentacion/manual.css";
import DockerGuia from "../documentacion/DockerGuia";
import ModeloDatos from "../documentacion/ModeloDatos";
import ReferenciaApi from "../documentacion/ReferenciaApi";

const MANUAL = {
  codigo: "PC-DOC-001",
  revision: "2.0",
  fecha: "octubre de 2026",
  titulo: "Control de Produccion - Documentacion tecnica",
};

function claseNav({ isActive }) { return isActive ? "activo" : undefined; }

function Tabla({ encabezados, filas }) {
  return <table className="manual-tabla"><thead><tr>{encabezados.map((texto) => <th key={texto}>{texto}</th>)}</tr></thead><tbody>
    {filas.map((fila, indice) => <tr key={indice}>{fila.map((celda, posicion) => <td key={posicion}>{celda}</td>)}</tr>)}
  </tbody></table>;
}

function Pie() { return <p className="manual-pie">{MANUAL.codigo} · Revision {MANUAL.revision} · {MANUAL.fecha} · Documento interno de desarrollo.</p>; }

function Indice() {
  return <>
    <h2>Indice</h2>
    <p>Esta guia describe el sistema desde el trabajo que ocurre en planta hasta el codigo que lo registra. Primero fija los conceptos operativos; despues explica las dos formas de captura, las pantallas, la API y el despliegue. El firmware y el hardware de la tolva solo se nombran en lo necesario para integrar el sistema.</p>
    <Tabla encabezados={["Documento", "Alcance"]} filas={[
      [MANUAL.codigo, "Frontend production-control y backend db-updater-ms."],
      ["Ruta", <span className="ruta">/documentacion</span>],
      ["Fuente de verdad", "Entidades, DTOs, servicios y controladores de Back/db-updater-ms."],
      ["Fuera de alcance", "Diseno mecanico, cableado, sensores y firmware interno de la tolva ESP32."],
    ]} />
    <h3>Orden de lectura</h3>
    <ol>
      <li><Link to="/documentacion/sistema">Que es el sistema</Link></li>
      <li><Link to="/documentacion/modelo-operativo">Modelo operativo</Link></li>
      <li><Link to="/documentacion/captura">Canales de captura</Link></li>
      <li><Link to="/documentacion/recorrido">Recorrido completo</Link></li>
      <li><Link to="/documentacion/modelo-datos">Modelo de datos</Link></li>
      <li><Link to="/documentacion/front">Frontend</Link></li>
      <li><Link to="/documentacion/backend">Backend y API</Link></li>
      <li><Link to="/documentacion/api">Documentacion de endpoints del backend</Link></li>
      <li><Link to="/documentacion/despliegue">Despliegue</Link></li>
      <li><Link to="/documentacion/recomendaciones">Recomendaciones futuras</Link></li>
      <li><Link to="/documentacion/glosario">Glosario</Link></li>
      <li><Link to="/documentacion/apendice-modelo">Apendice A. UML completo</Link></li>
    </ol>
    <Pie />
  </>;
}

function Sistema() {
  return <>
    <h2>1. Que es el sistema</h2>
    <p>Control de Produccion registra la informacion de los trabajos realizados en planta. El sistema conserva quien trabaja, en que maquina, sobre que paso de una orden, cuanto se produjo, cuanto resulto no conforme, en que momentos hubo pausa o mantenimiento y como evoluciono la velocidad de produccion.</p>
    <p>Una sesion de trabajo une temporalmente a un trabajador con una maquina. Dentro de esa sesion se asigna un paso de una orden de produccion para registrar el trabajo realizado. Esta separacion permite que una misma sesion registre mas de un paso y conserva por separado el contexto del puesto y el avance de la orden.</p>
    <h3>Que resuelve</h3>
    <Tabla encabezados={["Necesidad", "Registro que la representa"]} filas={[
      ["Planificar que fabricar", "Orden de produccion, sus pasos y materiales."],
      ["Saber quien opera un puesto", "Sesion de trabajo: trabajador, maquina, inicio y fin."],
      ["Registrar el trabajo realizado", "Asignacion sesion-paso, con cantidades, comentario y finalizacion."],
      ["Medir actividad", "Registros por minuto, estados, pausas e indicadores calculados."],
      ["Consultar resultados", "Pantalla de sesiones, detalle, dashboard, ordenes y alertas."],
    ]} />
    <h3>Alcance tecnico</h3>
    <p>El frontend React es la interfaz de captura manual y consulta. El backend NestJS <span className="ruta">db-updater-ms</span> expone la API, aplica las reglas y persiste en PostgreSQL. Tanto la pantalla manual como la tolva ESP32 envian datos al mismo modelo; son canales de entrada, no sistemas de produccion distintos.</p>
    <Pie />
  </>;
}

function ModeloOperativo() {
  return <>
    <h2>2. Modelo operativo</h2>
    <p>La sesion da contexto al puesto de trabajo formado por un trabajador y una maquina; la asignacion sesion-paso representa el trabajo realizado sobre una orden de produccion.</p>
    <pre className="plano">{`Trabajador + Maquina
        |
        v
Sesion de trabajo
        |
        +-- Trabajo / asignacion sesion-paso --> Paso de orden --> Orden de produccion
        |             |
        |             +-- piezas buenas, total contado, comentario y finalizacion
        |
        +-- estados, pausas, registros por minuto e indicadores`}</pre>
    <Tabla encabezados={["Concepto", "Definicion funcional", "Persistencia"]} filas={[
      ["Sesion de trabajo", "Union temporal entre un trabajador y una maquina. Inicia inactiva y termina al cerrar la sesion.", <span className="ruta">sesion_trabajo</span>],
      ["Paso de orden", "Etapa concreta de una orden de produccion, con cantidad requerida y acumulados.", <span className="ruta">PasoProduccion</span>],
      ["Trabajo o asignacion", "Relacion entre una sesion y un paso. Es donde se registra lo realizado en ese paso.", <span className="ruta">sesion_trabajo_paso</span>],
      ["Pieza buena", "Cantidad producida conforme. Se almacena como cantidadProducida.", <span className="ruta">cantidadProducida</span>],
      ["Pieza no conforme", "Diferencia entre el total contado y las piezas buenas. El motivo puede quedar en comentarioDefectuosas.", <span className="ruta">cantidadPedaleos - cantidadProducida</span>],
      ["Fuente", "Canal que origino la captura: tablet o firmware. Puede estar vacio para datos anteriores o integraciones incompletas.", <span className="ruta">fuente</span>],
    ]} />
    <div className="nota"><strong>IMPORTANTE. </strong>El nombre tecnico <span className="ruta">cantidadPedaleos</span> se usa como total contado en varios flujos. En la captura manual actual se calcula como piezas buenas mas piezas defectuosas; no debe interpretarse siempre como una accion fisica sobre un pedal.</div>
    <h3>Estados y pausas</h3>
    <p>Al crear una sesion, el backend abre un estado <span className="ruta">inactivo</span>. Al asignar o reactivar un paso, abre <span className="ruta">produccion</span>. Un descanso del trabajador o mantenimiento de maquina cambia la sesion a <span className="ruta">otro</span>, abre una pausa para el trabajo afectado y, al finalizar la causa, restaura produccion cuando no hay otra condicion activa que la impida.</p>
    <Pie />
  </>;
}

function Captura() {
  return <>
    <h2>3. Canales de captura</h2>
    <p>Los dos canales escriben sobre sesiones, asignaciones y sus acumulados. La diferencia es como se obtiene el dato, no el significado del dato.</p>
    <h3>Captura manual: pantalla raiz</h3>
    <p>La ruta <span className="ruta">/</span>, implementada por <span className="ruta">NuevaMinuta.js</span>, es la interfaz de los trabajadores. Aunque conserva el nombre historico de "minuta", su flujo vigente crea una sesion, asigna un paso y registra las acciones de ese trabajo.</p>
    <Tabla encabezados={["Accion de pantalla", "API principal", "Resultado"]} filas={[
      ["Iniciar sesion", "POST /sesiones-trabajo", "Crea trabajador-maquina, con fuente tablet."],
      ["Seleccionar paso", "POST /sesion-trabajo-pasos", "Crea o reactiva el trabajo de ese paso dentro de la sesion."],
      ["Registrar cierre del trabajo", "PUT y POST /sesion-trabajo-pasos/:id/finalizar", "Suma buenas y total contado, guarda comentario y marca finalizado."],
      ["Salir y volver de descanso", "POST /estados-trabajador y /finalizar-descanso", "Registra el descanso y pausa/restaura el trabajo."],
      ["Mantenimiento", "POST /estados-maquina y /finalizar-mantenimiento", "Registra mantenimiento y pausa/restaura el trabajo."],
      ["Cerrar sesion", "POST /sesiones-trabajo/:id/finalizar", "Cierra la sesion y consolida sus indicadores."],
    ]} />
    <h3>Captura automatica: tolva ESP32</h3>
    <p>El flujo fisico esperado es: el trabajador acciona el pedal para producir una pieza y despues deja caer la pieza en la tolva. El sensor del pedal representa el esfuerzo o ciclo de produccion; el sensor infrarrojo de la tolva representa el paso fisico de una pieza. Los lectores QR y el selector permiten al dispositivo identificar trabajador, orden y paso antes de empezar a contar.</p>
    <pre className="plano">{`Trabajador presiona pedal                 Pieza pasa por la tolva
             |                                        |
             v                                        v
   sensor de pedal detecta                     sensor infrarrojo detecta
             |                                        |
             +------------ ESP32 -------------+
                              |
              POST /registro-minuto/acumular
              tipo: "pedal"       tipo: "pieza"
                              |
                              v
       backend suma +1 en memoria para sesion, paso y minuto
                              |
                    tarea cada minuto
                              |
                              v
     registro_minuto y acumulados de sesion, trabajo y paso`}</pre>
    <Tabla encabezados={["Momento", "Peticion y datos", "Que hace el backend"]} filas={[
      ["Preparar el trabajo", "POST /sesiones-trabajo?esp32=true y POST /sesion-trabajo-pasos.", "Abre la sesion y relaciona el paso que se va a trabajar. El primer endpoint puede devolver solo el id de sesion."],
      ["Cada pedal detectado", "POST /registro-minuto/acumular con maquina, paso, tipo: pedal y minutoInicio.", "Busca una sesion en produccion para esa maquina y suma una pedaleada en memoria."],
      ["Cada pieza detectada", "POST /registro-minuto/acumular con maquina, paso, tipo: pieza y minutoInicio.", "Busca la misma sesion y asignacion, y suma una pieza contada en memoria."],
      ["Al terminar el minuto", "No requiere una llamada del dispositivo: el backend ejecuta una tarea cada minuto. POST /registro-minuto/guardar fuerza el mismo guardado.", "Persiste los conteos de memoria en registro_minuto y los agrega a la sesion, al trabajo y al paso de orden."],
    ]} />
    <div className="nota"><strong>CONDICION PARA AGRUPAR. </strong>El contrato recibe un evento por peticion, no un total de eventos. Para que varios eventos formen una sola fila del mismo minuto, la ESP32 debe enviar <span className="ruta">minutoInicio</span> normalizado al inicio de ese minuto y usar exactamente ese mismo valor en todas las llamadas del minuto. Si lo omite, el backend usa la hora exacta de cada peticion y puede crear registros separados en vez de agruparlos.</div>
    <p>El endpoint de acumulacion solo suma si hay una sesion de esa maquina en estado <span className="ruta">produccion</span> y una asignacion activa para el paso enviado. El backend confirma el contrato HTTP, pero en este repositorio no esta el firmware de la ESP32: no es posible afirmar desde este codigo si el dispositivo actual ya manda una peticion por sensor ni si normaliza <span className="ruta">minutoInicio</span>. Esa verificacion debe hacerse en el firmware.</p>
    <Pie />
  </>;
}

function Recorrido() {
  return <>
    <h2>4. Recorrido completo</h2>
    <p>Este es el ciclo de negocio que comparten la pantalla manual y el dispositivo, con variaciones en la forma de capturar los conteos.</p>
    <ol>
      <li>Se identifica un trabajador y una maquina. El sistema rechaza una nueva sesion si esa maquina ya tiene una abierta.</li>
      <li>Se crea la sesion. Todavia no queda ligada a ninguna orden; su estado inicial es inactivo.</li>
      <li>Se selecciona un paso de una orden y se crea la asignacion sesion-paso. La sesion pasa a produccion y las otras asignaciones quedan pausadas.</li>
      <li>En la captura con ESP32, cada deteccion genera un evento que se persiste por minuto. En la captura manual, el trabajador registra las cantidades al finalizar el trabajo asignado. En ambos casos, los acumulados actualizan la asignacion, el paso y la sesion.</li>
      <li>Si hay descanso o mantenimiento, se registra el estado, se abre una pausa sobre el trabajo y se detiene el estado de produccion.</li>
      <li>Al volver, se cierran las pausas correspondientes y se restaura produccion cuando procede.</li>
      <li>Al finalizar el trabajo se registran piezas buenas, piezas no conformes y comentario; el trabajo queda finalizado.</li>
      <li>La sesion puede continuar con otro paso. Cuando se cierra, el backend calcula y consolida los indicadores de la sesion.</li>
    </ol>
    <h3>Como se calculan las cantidades</h3>
    <Tabla encabezados={["Dato", "En el flujo manual", "En el flujo por minuto"]} filas={[
      ["Buenas", "El usuario ingresa piezas buenas; el frontend la envia como cantidadProducida.", "Cada evento tipo pieza incrementa piezasContadas y cantidadProducida."],
      ["Total contado", "El frontend envia buenas + defectuosas como cantidadPedaleos.", "Cada evento tipo pedal incrementa pedaleadas y cantidadPedaleos."],
      ["No conformes", "Se obtiene de total contado menos buenas, con comentario opcional.", "Se deriva de cantidadPedaleos menos cantidadProducida; el endpoint no recibe un motivo."],
    ]} />
    <h3>Velocidad e indicadores</h3>
    <p>Los registros por minuto permiten calcular velocidad actual, promedios, defectos, NPT y pausas. El servicio de indicadores genera una fila por sesion y minuto; al cerrar la sesion se conserva un indicador de sesion y se sincroniza el agregado diario. El dashboard consulta esos datos calculados, no interpreta directamente el sensor.</p>
    <Pie />
  </>;
}

function Frontend() {
  return <>
    <h2>6. Frontend</h2>
    <p>El frontend es una SPA React. La ruta raiz es la captura manual; las rutas de consulta y administracion requieren inicio de sesion.</p>
    <Tabla encabezados={["Ruta", "Pantalla", "Responsabilidad"]} filas={[
      [<span className="ruta">/</span>, "Nueva minuta", "Captura manual: trabajador, maquina, paso, pausas, mantenimiento, cierre de trabajo y sesion."],
      [<span className="ruta">/dashboard</span>, "Dashboard", "Indicadores, tendencias y consultas agregadas."],
      [<span className="ruta">/sesiones</span>, "Sesiones actuales", "Seguimiento de sesiones abiertas."],
      [<span className="ruta">/sesion/:id</span>, "Detalle de sesion", "Datos de la sesion, paso activo, pausas y serie de minutos."],
      [<span className="ruta">/ordenes</span>, "Ordenes", "Creacion, consulta y detalle de ordenes y pasos."],
      [<span className="ruta">/personas y /maquinas</span>, "Catalogos", "Administracion de trabajadores y maquinas."],
      [<span className="ruta">/alertas</span>, "Alertas", "Consulta de alertas y sus umbrales."],
    ]} />
    <h3>Conexion con la API</h3>
    <p><span className="ruta">src/api.js</span> concentra la URL base y <span className="ruta">apiFetch</span>. En localhost y detras del gateway usa <span className="ruta">/api</span> del mismo origen; en despliegues Vercel usa la URL publica configurada. La funcion agrega el token disponible para rutas protegidas. Las rutas de captura del puesto que el backend marca como publicas pueden operar sin ese token.</p>
    <h3>Regla para cambios de interfaz</h3>
    <p>Una nueva accion de planta debe relacionarse primero con sesion, asignacion o estado antes de crear otra nocion de negocio. Si cambia un cuerpo o una ruta, se actualizan a la vez el DTO/controlador del backend, la llamada en el frontend y esta guia.</p>
    <Pie />
  </>;
}

function Backend() {
  return <>
    <h2>7. Backend y API</h2>
    <p><span className="ruta">db-updater-ms</span> es un unico proceso NestJS. Cada carpeta bajo <span className="ruta">src</span> es un modulo de dominio con controlador HTTP cuando corresponde, servicio con reglas y repositorios TypeORM sobre PostgreSQL. No son microservicios separados.</p>
    <h3>Modulos que sostienen el flujo de planta</h3>
    <Tabla encabezados={["Modulo", "Responsabilidad", "Rutas relevantes"]} filas={[
      ["sesion-trabajo", "Crea, consulta y finaliza la union trabajador-maquina; expone series de indicadores.", "POST /sesiones-trabajo; POST /:id/finalizar; GET /actuales."],
      ["sesion-trabajo-paso", "Crea, actualiza, pausa y finaliza el trabajo de un paso dentro de una sesion.", "POST /sesion-trabajo-pasos; PUT /:id; POST /:id/finalizar."],
      ["registro-minuto", "Acumula eventos de dispositivo y los persiste por minuto.", "POST /registro-minuto/acumular y /guardar; GET /sesion/:id."],
      ["estado-trabajador", "Gestiona descansos y coordina pausas y estados de sesion.", "POST /estados-trabajador; POST /trabajador/:id/finalizar-descanso."],
      ["estado-maquina", "Gestiona mantenimiento y coordina pausas y estados de sesion.", "POST /estados-maquina; POST /maquina/:id/finalizar-mantenimiento."],
      ["orden-produccion y paso-produccion", "Mantienen ordenes, pasos, cantidades y estados de avance.", "Rutas /ordenes y /pasos."],
      ["indicadores", "Expone los agregados que consumen dashboard y consultas.", "Rutas /indicadores."],
    ]} />
    <h3>Contratos esenciales</h3>
    <pre className="plano">{`POST /sesiones-trabajo
{ trabajador: UUID, maquina: UUID, desdeTablet?: boolean, fechaInicio?: ISO }

POST /sesion-trabajo-pasos
{ sesionTrabajo: UUID, pasoOrden: UUID, cantidadAsignada?: number,
  desdeTablet?: boolean, porAdministrador?: boolean }

POST /registro-minuto/acumular
{ maquina: UUID, paso: UUID, tipo: "pedal" | "pieza", minutoInicio?: ISO }

PUT /sesion-trabajo-pasos/:id
{ cantidadProducida?: number, cantidadPedaleos?: number,
  cantidadAsignada?: number, comentarioDefectuosas?: string }`}</pre>
    <p>Las rutas se muestran sin el prefijo del gateway. Desde el frontend o la tolva, la ruta usual es <span className="ruta">/api/&lt;ruta&gt;</span>. Swagger publica el contrato completo del proceso en <span className="ruta">/docs</span> o <span className="ruta">/api/docs</span> cuando se entra por gateway.</p>
    <Pie />
  </>;
}

function Despliegue() {
  return <>
    <h2>9. Despliegue</h2>
    <h3>Principal: Vercel y tunel ngrok</h3>
    <pre className="plano">{`TABLETS Y ADMINISTRACION
             |
             | abre production-control.vercel.app
             v
      FRONTEND ESTATICO EN VERCEL
             |
             | solicitudes HTTPS a /api configurada
             v
     TUNEL NGROK PUBLICO  (/api/*)
             |
             | reenvia a localhost:3000
             v
SERVIDOR DISTRECOL: gateway nginx :3000
             |
             | reescribe /api/* y envia a backend:3001
             v
        BACKEND db-updater-ms
             |
             v
 POSTGRESQL distrecoldb (volumen pgdata)

ESP32 ---> tunel ngrok /api/* ---> gateway :3000 ---> backend`}</pre>
    <p>El frontend principal vive en Vercel. Las tablets y pantallas administrativas consumen ese frontend; la API que usa el build de Vercel llega al servidor Distrecol mediante el tunel ngrok. El tunel activo reenvia a <span className="ruta">localhost:3000</span>, donde el gateway principal entrega las rutas <span className="ruta">/api/*</span> al backend. La base de datos del entorno principal vive en el mismo servidor, en el contenedor <span className="ruta">postgres</span>.</p>
    <h3>Alternativa: frontend y API por red local</h3>
    <pre className="plano">{`TABLET O ADMINISTRACION EN LA RED LOCAL
             |
             | http://IP_DEL_SERVIDOR:3000
             v
SERVIDOR DISTRECOL: gateway nginx :3000
             |                         |
             | /                       | /api/*
             v                         v
      frontend Docker :80       backend Docker :3001

ESP32 EN LA RED LOCAL
             |
             | http://IP_DEL_SERVIDOR:3001/<ruta>
             v
      backend Docker :3001

Alternativa ESP32: http://IP_DEL_SERVIDOR:3000/api/<ruta>`}</pre>
    <Tabla encabezados={["Dispositivo", "Direccion", "Destino"]} filas={[
      ["Tablet o administracion", <span className="ruta">http://IP_DEL_SERVIDOR:3000</span>, "Frontend local servido por gateway; las llamadas /api pasan al backend."],
      ["ESP32 directo", <span className="ruta">http://IP_DEL_SERVIDOR:3001/&lt;ruta&gt;</span>, "Backend principal. La ruta directa no lleva el prefijo /api."],
      ["ESP32 por gateway", <span className="ruta">http://IP_DEL_SERVIDOR:3000/api/&lt;ruta&gt;</span>, "Gateway principal y despues backend."],
    ]} />
    <div className="nota"><strong>CONDICIONES DE RED LOCAL. </strong>Las tablets, los ESP32 y el servidor deben estar en la misma red privada o tener conectividad IP enrutable entre ellos. La direccion debe usar la IP LAN concreta del servidor, no <span className="ruta">localhost</span>. El firewall del servidor debe permitir los puertos <span className="ruta">3000</span> para el gateway y <span className="ruta">3001</span> para acceso directo al backend.</div>
    <Tabla encabezados={["Compose", "Gateway", "Backend", "Base de datos"]} filas={[
      ["Principal: docker-compose.yml", "gateway :3000", "backend :3001", "postgres / distrecoldb / pgdata"],
      ["Desarrollo: docker-compose.dev.yml", "gateway-dev :3100", "backend-dev :3101", "postgres-dev / distrecoldb_dev / pgdata_dev"],
    ]} />
    <p>Los archivos <span className="ruta">docker-compose.yml</span> y <span className="ruta">docker-compose.dev.yml</span> viven en <span className="ruta">Back/db-updater-ms</span>. Para los comandos, puertos, volumenes y precauciones operativas, consulta la <Link to="/documentacion/docker">guia Docker</Link>.</p>
    <h3>Continuidad del frontend</h3>
    <p>Para operar una copia propia, el equipo puede hacer un fork del repositorio, conectarlo a una cuenta Vercel propia y crear un nuevo proyecto desde ese fork. Antes de publicarlo debe configurar <span className="ruta">REACT_APP_API_BASE_URL</span> con la API que corresponda a su entorno. Sin esa variable, un build desplegado en Vercel usa la URL publica definida actualmente en <span className="ruta">src/api.js</span>.</p>
    <div className="nota"><strong>DATOS. </strong>TypeORM puede sincronizar entidades al iniciar cuando DB_SYNCHRONIZE esta activo. En una base con datos de planta, ese valor se cambia de manera deliberada y con respaldo.</div>
    <Pie />
  </>;
}

function Glosario() {
  return <>
    <h2>Glosario</h2>
    <Tabla encabezados={["Termino", "Significado en este sistema"]} filas={[
      ["Orden de produccion", "Plan de fabricación de un producto. Define qué se debe producir y se divide en los pasos necesarios para completar la orden. La orden no se une directamente a una sesión: esa relación ocurre a través de uno de sus pasos."],
      ["Paso de orden", "Etapa concreta de una orden, por ejemplo un proceso de fabricación o empaque. Tiene una cantidad requerida y acumulados propios; un paso puede ser trabajado en distintas sesiones a lo largo de la orden."],
      ["Sesion de trabajo", "Contexto temporal del puesto: une a un trabajador con una máquina desde que inicia hasta que se cierra. Una sesión puede continuar aunque se termine un paso y después se asigne otro; por sí misma todavía no indica qué orden se está ejecutando."],
      ["Trabajo o asignacion sesion-paso", "Ejecución de un paso de orden dentro de una sesión de trabajo. Es el registro que recibe las cantidades, el comentario, las pausas y la finalización del trabajo realizado sobre ese paso."],
      ["Trabajo activo", "Asignación sesión-paso que está en producción. Al activar un paso, las otras asignaciones de la misma sesión quedan pausadas para que los conteos se atribuyan a un único trabajo."],
      ["Piezas buenas", "Piezas que resultan conformes. Se guardan como cantidadProducida y alimentan los acumulados del trabajo, del paso, de la sesión y de los indicadores."],
      ["Total contado", "Cantidad total de piezas o ciclos contabilizados, almacenada técnicamente como cantidadPedaleos. En la captura manual equivale a buenas más no conformes; en la tolva se alimenta con los eventos del pedal."],
      ["Piezas no conformes", "Diferencia entre el total contado y las piezas buenas. En el cierre manual puede quedar explicado con un comentario; en los indicadores aparece como defectos."],
      ["Captura manual", "Modo en el que el trabajador inicia la sesión, selecciona el paso, registra descansos o mantenimiento y al finalizar informa las cantidades y observaciones desde la aplicación."],
      ["Captura automatica", "Modo en el que la ESP32 identifica trabajador, orden y paso, y comunica los eventos detectados por el pedal y la tolva. El backend agrupa y persiste esos eventos por minuto."],
      ["Registro por minuto", "Fila que conserva los conteos de pedal y de piezas de un minuto para una sesión y su trabajo activo. Es la base temporal para las velocidades y los indicadores de una sesión activa."],
      ["Descanso", "Estado temporal del trabajador entre su inicio y su finalización. Mientras está abierto, el backend cambia la sesión relacionada a estado otro y abre una pausa sobre el trabajo activo; al terminarlo, puede restaurar la producción."],
      ["Mantenimiento", "Estado temporal de una máquina que indica que no está disponible para producir. Produce el mismo efecto operativo que una pausa sobre el trabajo activo, pero su causa queda asociada a la máquina."],
      ["Pausa", "Intervalo asociado a un trabajo o asignación sesión-paso durante el cual no debe considerarse que ese paso está en producción. Puede ser consecuencia de un descanso, de mantenimiento o de cambiar a otro paso."],
      ["Estado de sesion", "Historial que expresa si el contexto trabajador-máquina está inactivo, en producción u otro. Es distinto de la pausa: el estado describe la sesión completa y la pausa describe un trabajo concreto dentro de ella."],
      ["NPT", "Tiempo no productivo. El sistema lo calcula a partir de la duración de la sesión y de los minutos sin producción, con un componente específico para periodos de inactividad que superan el umbral configurado."],
      ["Fuente", "Canal que originó los datos de una sesión o de sus indicadores: tablet para la captura manual o firmware para la captura desde el dispositivo. Puede faltar en registros heredados."],
      ["Minuta", "Recurso histórico de captura simple, independiente del modelo de sesiones y trabajos. No debe usarse como sinónimo de sesión, asignación ni registro por minuto."],
    ]} />
    <h3>Indicadores mostrados por el frontend</h3>
    <p>Los indicadores generales se consultan por sesión, trabajador, máquina, área o periodo. Sus valores los calcula el backend a partir de las sesiones cerradas, sus registros por minuto y sus pausas; el frontend los presenta, agrupa y grafica.</p>
    <Tabla encabezados={["Indicador", "Que mide y como se interpreta", "Ambito de visualizacion"]} filas={[
      ["Produccion total", "Suma de las piezas buenas registradas en el alcance consultado. No incluye las piezas no conformes.", "Tarjetas diarias y mensuales; resúmenes y listados de trabajadores y máquinas."],
      ["Defectos", "Cantidad de piezas no conformes: total contado menos piezas buenas. En una captura con pedal, el total contado corresponde a las pedaleadas acumuladas.", "Resúmenes, listados y series de sesión."],
      ["% defectos o % no conformes", "Defectos divididos entre piezas buenas más defectos, multiplicado por 100. Expresa qué parte de lo contado no resultó conforme.", "Dashboard, resúmenes, listados y consulta por producto."],
      ["NPT (min)", "Minutos no productivos acumulados. El cálculo se limita a la duración real de la sesión para evitar que el valor supere el tiempo disponible.", "Tarjetas, resúmenes, listados, series y consulta por producto."],
      ["NPT por inactividad", "Parte del NPT atribuida específicamente a tramos sin actividad que superan el umbral de inactividad configurado.", "Resúmenes, listados y series de sesión."],
      ["% NPT", "NPT dividido entre la duración total del alcance consultado, multiplicado por 100. Permite comparar el peso del tiempo no productivo entre periodos de distinta duración.", "Dashboard, resúmenes, listados y series de sesión."],
      ["Minutos en pausas", "Suma de la duración de las pausas abiertas sobre los trabajos. Mide pausas declaradas, no todos los minutos de inactividad detectados automáticamente.", "Resúmenes, listados y series de sesión."],
      ["Numero de pausas", "Cantidad de intervalos de pausa registrados en los trabajos incluidos en la consulta.", "Resúmenes, listados y series de sesión."],
      ["% tiempo en pausas", "Minutos en pausas divididos entre duración total, multiplicado por 100. Indica qué proporción del tiempo transcurrido quedó registrada como pausa.", "Resúmenes, listados y series de sesión."],
      ["Velocidad productiva", "Piezas buenas por hora productiva: excluye del denominador el NPT. Sirve para comparar el ritmo cuando efectivamente se estaba produciendo.", "Tarjetas, resúmenes, listados y series de sesión."],
      ["Velocidad global", "Piezas buenas por hora de duración total de la sesión o periodo. Incluye tanto tiempo productivo como no productivo y describe el resultado operativo completo.", "Resúmenes, listados y series de sesión."],
      ["Velocidad actual o de ventana", "Ritmo de corto plazo calculado en una ventana de 10 minutos, expresado en piezas por hora y descontando el tiempo no productivo de esa ventana.", "Detalle de sesión, series y consultas de velocidad."],
      ["Duracion total y sesiones cerradas", "Duración total suma el tiempo entre inicio y fin de cada sesión; sesiones cerradas cuenta las sesiones finalizadas. Son medidas de contexto para interpretar los demás indicadores.", "Listados y consultas de trabajadores y máquinas."],
    ]} />
    <h3>Indicadores por producto</h3>
    <p>La consulta por producto usa el producto de las órdenes dentro del periodo elegido y permite compararlo con otro periodo y con objetivos ingresados en la pantalla.</p>
    <Tabla encabezados={["Indicador", "Que mide y como se interpreta"]} filas={[
      ["Cumplimiento del plan", "Piezas producidas del producto divididas entre piezas planeadas, multiplicado por 100. La pantalla muestra además la comparación, el objetivo y la brecha frente al objetivo cuando se configuran."],
      ["Calidad: no conformes", "Piezas no conformes del producto divididas entre el total inspeccionado o contado, multiplicado por 100. Es equivalente conceptualmente al porcentaje de defectos, pero se limita al producto y periodo seleccionados."],
      ["NPT por producto", "Horas no productivas atribuidas a los pasos de las órdenes del producto dentro del periodo. La pantalla puede desglosarlo por paso y contrastarlo con un objetivo en horas."],
    ]} />
    <Pie />
  </>;
}

function Recomendaciones() {
  return <>
    <h2>10. Recomendaciones futuras</h2>
    <p>Estas mejoras no describen una capacidad ya implementada. Son decisiones recomendadas para hacer mas robusta la operacion cuando el sistema se despliegue o se entregue a otros equipos.</p>
    <Tabla encabezados={["Tema", "Recomendacion", "Motivo"]} filas={[
      ["Identidad de ESP32", "Negociar y registrar un token o credencial por dispositivo. El dispositivo debe enviarlo en cada llamada de captura y el backend debe poder revocarlo.", "Las rutas de captura son publicas hoy. Una credencial individual permite identificar, limitar y retirar un dispositivo sin afectar los demas."],
      ["Transporte", "Usar TLS para toda comunicacion entre ESP32, frontend y API.", "Protege los identificadores, token de dispositivo y conteos durante el transporte."],
      ["Exposicion de la API", "Retirar ngrok de produccion. Dejarlo, si se necesita, solo para pruebas o desarrollo temporal.", "Un tunel temporal no es una base estable de disponibilidad, identidad de dominio ni operacion."],
      ["Dominio y tunel", "Publicar la API mediante Cloudflare Tunnel y un dominio propio, con los registros DNS administrados en Cloudflare.", "Permite una URL estable, TLS administrado, controles de acceso y una separacion mas clara entre desarrollo y produccion."],
      ["Configuracion", "Mover URL publica de API y secretos fuera del codigo fuente: variables de entorno por ambiente y secretos en la plataforma de despliegue.", "Evita que un fork herede por defecto la API o credenciales de otro equipo."],
      ["Confiabilidad de conteos", "Definir y probar el contrato de minutoInicio en el firmware. Cada evento debe llevar el inicio normalizado del minuto, o la API debe evolucionar para aceptar lotes con conteos.", "El backend actual suma un evento por llamada y solo agrupa correctamente cuando las llamadas del minuto comparten minutoInicio."],
      ["Observabilidad", "Registrar dispositivo, resultado de cada evento, reintentos y conteos descartados por falta de sesion o asignacion activa.", "Facilita detectar desconexiones, QR equivocados, pasos no asignados y diferencias entre la tolva y los indicadores."],
    ]} />
    <Pie />
  </>;
}

function UmlCaja({ nombre, campos }) {
  return <section className="uml-caja">
    <h4>{nombre}</h4>
    <ul>{campos.map((campo) => <li key={campo}>{campo}</li>)}</ul>
  </section>;
}

function ApendiceUmlVisual() {
  const tablas = [
    ["area", ["id : uuid PK", "nombre : varchar"]],
    ["Maquina", ["id : uuid PK", "areaId : uuid FK", "nombre, codigo, ubicacion", "fechaInstalacion, tipo, observaciones", "createdAt, updatedAt"]],
    ["trabajador", ["id : uuid PK", "nombre, identificacion unico", "grupo, turno, fechaInicio", "createdAt, updatedAt"]],
    ["OrdenProduccion", ["id : uuid PK", "numero, producto", "cantidadAProducir", "fechaOrden, fechaVencimiento", "estado, createdAt"]],
    ["PasoProduccion", ["id : uuid PK", "ordenId : uuid FK", "nombre, codigoInterno, numeroPaso", "cantidadRequerida, cantidadProducida", "cantidadPedaleos, fechaMetaAlcanzada", "estado"]],
    ["material_orden", ["id : uuid PK", "ordenId : uuid FK", "codigo, descripcion, unidad, cantidad"]],
    ["sesion_trabajo", ["id : uuid PK", "trabajadorId, maquinaId : uuid FK", "areaIdSnapshot : uuid referencia", "fechaInicio, fechaFin", "cantidadProducida, cantidadPedaleos", "agregadoEnProduccion, fuente"]],
    ["sesion_trabajo_paso", ["id : uuid PK", "sesionTrabajoId, pasoOrdenId : uuid FK", "cantidadAsignada, cantidadProducida", "cantidadPedaleos, comentarioDefectuosas", "fuente, finalizado, finalizadoEn, createdAt"]],
    ["registro_minuto", ["id : uuid PK", "sesionTrabajoId, pasoSesionTrabajoId : uuid FK", "minutoInicio", "pedaleadas, piezasContadas"]],
    ["pausa_paso_sesion", ["id : uuid PK", "pasoSesionId : uuid FK", "inicio, fin", "maquinaId, trabajadorId : uuid referencia"]],
    ["estado_sesion", ["id : uuid PK", "sesionTrabajoId : uuid FK", "estado, inicio, fin"]],
    ["estado_trabajador", ["id : uuid PK", "trabajadorId : uuid FK", "descanso, origen, inicio, fin"]],
    ["estado_maquina", ["id : uuid PK", "maquinaId : uuid FK", "mantenimiento, inicio, fin"]],
    ["indicador_sesion_minuto", ["id : uuid PK", "sesionTrabajoId : uuid FK", "minuto, produccionTotal, defectos", "velocidades, NPT y pausas", "duracionSesionMin, actualizadoEn"]],
    ["indicador_sesion", ["id : uuid PK", "sesionTrabajoId : uuid FK", "areaIdSnapshot, trabajadorId, maquinaId : referencia", "fechas, fuente, produccion, defectos", "velocidades, NPT, pausas, duracion, creadoEn"]],
    ["produccion_diaria", ["fecha + areaId : PK compuesta", "areaId : uuid FK", "piezas, pedaleadas, sesionesCerradas"]],
    ["alerta_tipo", ["id : uuid PK", "codigo unico, nombre, descripcion"]],
    ["alerta", ["id : uuid PK", "tipoId : uuid FK", "sujetoTipo, sujetoId : uuid referencia", "fecha, metadata, createdAt"]],
    ["empresa", ["id : uuid PK", "nombre"]],
    ["configuracion", ["id : uuid PK", "minutosInactividadParaNPT", "zonaHorariaCliente", "limites de descansos, pausas y sesion"]],
    ["Minuta", ["id : uuid PK", "recursoId, ordenId, pasoId : referencia", "cantidad, pedalazos, observaciones", "createdAt, updatedAt"]],
    ["auth_user", ["id : uuid PK", "username unico, name", "passwordHash, isActive", "createdAt, updatedAt"]],
    ["indicador_diario_dim", ["id : uuid PK", "fecha", "trabajadorId, maquinaId, areaId : referencia", "fuente, produccion, defectos", "velocidades, NPT, pausas, duracion, updatedAt"]],
  ];
  const relaciones = [
    "area 1 -- * Maquina", "area 1 -- * produccion_diaria", "trabajador 1 -- * sesion_trabajo", "trabajador 1 -- * estado_trabajador",
    "Maquina 1 -- * sesion_trabajo", "Maquina 1 -- * estado_maquina", "OrdenProduccion 1 -- * PasoProduccion", "OrdenProduccion 1 -- * material_orden",
    "sesion_trabajo 1 -- * sesion_trabajo_paso", "sesion_trabajo 1 -- * registro_minuto", "sesion_trabajo 1 -- * estado_sesion",
    "sesion_trabajo 1 -- * indicador_sesion_minuto", "sesion_trabajo 1 -- * indicador_sesion", "PasoProduccion 1 -- * sesion_trabajo_paso",
    "sesion_trabajo_paso 1 -- * pausa_paso_sesion", "sesion_trabajo_paso 1 -- * registro_minuto", "alerta_tipo 1 -- * alerta",
  ];
  return <div className="uml-diagrama">
    <div className="uml-leyenda"><span><b>PK</b> clave primaria</span><span><b>FK</b> clave foranea TypeORM</span><span><b>referencia</b> UUID sin clave foranea</span></div>
    <div className="uml-cuadricula">{tablas.map(([nombre, campos]) => <UmlCaja key={nombre} nombre={nombre} campos={campos} />)}</div>
    <h3>Relaciones</h3>
    <div className="uml-relaciones">{relaciones.map((relacion) => <span key={relacion}>{relacion}</span>)}</div>
  </div>;
}

function ApendiceModelo() {
  return <>
    <h2>Apendice A. UML completo de tablas</h2>
    <p>Diagrama de clases UML del sistema.</p>
    <div className="manual-pdf">
      <iframe title="Diagrama de clases UML Distrecol" src="/documentacion/diagrama-clases-uml-distrecol.pdf#view=FitH" />
    </div>
    <p><a className="manual-descarga" href="/documentacion/diagrama-clases-uml-distrecol.pdf" download>Descargar diagrama UML en PDF</a></p>
    {false && <ApendiceUmlVisual />}
    <pre className="plano uml-texto-respaldo">{`CATALOGOS Y PLANIFICACION

[area] id PK, nombre
   | 1
   +----< [Maquina] id PK, areaId FK, nombre, codigo, ubicacion, fechaInstalacion, tipo, observaciones, createdAt, updatedAt
   |              |
   |              +----< [sesion_trabajo] id PK, trabajadorId FK, maquinaId FK, areaIdSnapshot*, fechaInicio, fechaFin,
   |              |                       cantidadProducida, cantidadPedaleos, agregadoEnProduccion, fuente
   |              |                         | 1
   |              |                         +----< [estado_sesion] id PK, sesionTrabajoId FK, estado, inicio, fin
   |              |                         +----< [sesion_trabajo_paso] id PK, sesionTrabajoId FK, pasoOrdenId FK, cantidadAsignada,
   |              |                         |                         cantidadProducida, cantidadPedaleos, comentarioDefectuosas, fuente,
   |              |                         |                         finalizado, finalizadoEn, createdAt
   |              |                         |                            | 1
   |              |                         |                            +----< [pausa_paso_sesion] id PK, pasoSesionId FK, inicio, fin,
   |              |                         |                            |                         maquinaId*, trabajadorId*
   |              |                         |                            +----< [registro_minuto] id PK, sesionTrabajoId FK, pasoSesionTrabajoId FK,
   |              |                         |                            |                     minutoInicio, pedaleadas, piezasContadas
   |              |                         |                            |
   |              |                         |                            +---- [PasoProduccion] id PK, ordenId FK, nombre, codigoInterno,
   |              |                         |                                      cantidadRequerida, cantidadProducida, cantidadPedaleos,
   |              |                         |                                      fechaMetaAlcanzada, estado, numeroPaso
   |              |                         |
   |              |                         +----< [indicador_sesion_minuto] id PK, sesionTrabajoId FK, minuto, produccionTotal,
   |              |                         |      defectos, porcentajeDefectos, avgSpeed, avgSpeedSesion, velocidadActual, nptMin,
   |              |                         |      nptPorInactividad, porcentajeNPT, pausasCount, pausasMin, porcentajePausa,
   |              |                         |      duracionSesionMin, actualizadoEn
   |              |                         +----< [indicador_sesion] id PK, sesionTrabajoId FK, areaIdSnapshot*, trabajadorId*, maquinaId*,
   |              |                                maquinaTipo, fechaInicio, fechaFin, fuente, produccionTotal, defectos,
   |              |                                porcentajeDefectos, avgSpeed, avgSpeedSesion, velocidadMax10m, nptMin,
   |              |                                nptPorInactividad, porcentajeNPT, pausasCount, pausasMin, porcentajePausa,
   |              |                                duracionSesionMin, creadoEn
   |              +----< [estado_maquina] id PK, maquinaId FK, mantenimiento, inicio, fin
   |
   +----< [produccion_diaria] fecha PK, areaId PK/FK, piezas, pedaleadas, sesionesCerradas

[trabajador] id PK, nombre, identificacion, grupo, turno, fechaInicio, createdAt, updatedAt
   | 1
   +----< sesion_trabajo (trabajadorId FK)
   +----< [estado_trabajador] id PK, trabajadorId FK, descanso, origen, inicio, fin

[OrdenProduccion] id PK, numero, producto, cantidadAProducir, fechaOrden, fechaVencimiento, estado, createdAt
   | 1
   +----< PasoProduccion (ordenId FK)
   +----< [material_orden] id PK, ordenId FK, codigo, descripcion, unidad, cantidad

ALERTAS

[alerta_tipo] id PK, codigo, nombre, descripcion
   | 1
   +----< [alerta] id PK, tipoId FK, sujetoTipo, sujetoId*, fecha, metadata, createdAt

TABLAS SIN RELACION TYPEORM

[empresa] id PK, nombre
[configuracion] id PK, minutosInactividadParaNPT, zonaHorariaCliente, maxDescansosDiariosPorTrabajador,
                maxDuracionPausaMinutos, maxHorasSesionAbierta
[Minuta] id PK, recursoId*, ordenId*, pasoId*, cantidad, pedalazos, observaciones, createdAt, updatedAt
[auth_user] id PK, username, name, passwordHash, isActive, createdAt, updatedAt
[indicador_diario_dim] id PK, fecha, trabajadorId*, maquinaId*, areaId*, fuente, produccionTotal, defectos,
                       porcentajeDefectos, avgSpeed, avgSpeedSesion, nptMin, nptPorInactividad, porcentajeNPT,
                       pausasCount, pausasMin, porcentajePausa, duracionTotalMin, sesionesCerradas, updatedAt

PK = clave primaria; FK = clave foranea TypeORM; * = UUID o copia de contexto sin clave foranea.`}</pre>
    <h3>Como usarlo</h3>
    <p>Para entender el negocio, empieza por el diagrama breve de <Link to="/documentacion/modelo-datos">Modelo de datos</Link>. Este apendice sirve para desarrollo, consultas SQL y cambios de entidades. Las tablas <span className="ruta">empresa</span>, <span className="ruta">configuracion</span>, <span className="ruta">Minuta</span>, <span className="ruta">auth_user</span> e <span className="ruta">indicador_diario_dim</span> aparecen sin linea porque sus entidades no declaran una relacion TypeORM.</p>
    <Pie />
  </>;
}

function Contenido() {
  const { "*": resto = "" } = useParams();
  const capitulo = resto.split("/").filter(Boolean)[0];
  if (!capitulo) return <Indice />;
  if (capitulo === "sistema") return <Sistema />;
  if (capitulo === "modelo-operativo") return <ModeloOperativo />;
  if (capitulo === "captura") return <Captura />;
  if (capitulo === "recorrido") return <Recorrido />;
  if (capitulo === "modelo-datos") return <ModeloDatos />;
  if (capitulo === "front") return <Frontend />;
  if (capitulo === "backend") return <Backend />;
  if (capitulo === "api") return <ReferenciaApi />;
  if (capitulo === "despliegue") return <Despliegue />;
  if (capitulo === "recomendaciones") return <Recomendaciones />;
  if (capitulo === "docker") return <DockerGuia />;
  if (capitulo === "glosario") return <Glosario />;
  if (capitulo === "apendice-modelo") return <ApendiceModelo />;
  return <Indice />;
}

const NOMBRES = { sistema: "Que es el sistema", "modelo-operativo": "Modelo operativo", captura: "Canales de captura", recorrido: "Recorrido completo", "modelo-datos": "Modelo de datos", front: "Frontend", backend: "Backend y API", api: "Documentacion de endpoints del backend", despliegue: "Despliegue", recomendaciones: "Recomendaciones futuras", docker: "Docker", glosario: "Glosario", "apendice-modelo": "Apendice A. UML completo" };

export default function Documentacion() {
  const location = useLocation();
  const [oscuro, setOscuro] = useState(() => localStorage.getItem("documentacion-tema") === "oscuro");
  useEffect(() => { document.title = "Documentacion tecnica - Production Control"; }, []);
  useEffect(() => { window.scrollTo(0, 0); }, [location.pathname]);
  const capitulo = location.pathname.split("/")[2];
  const migas = capitulo ? NOMBRES[capitulo] : "Indice";
  const alternarTema = () => setOscuro((actual) => {
    const siguiente = !actual;
    localStorage.setItem("documentacion-tema", siguiente ? "oscuro" : "claro");
    return siguiente;
  });

  return <div className={oscuro ? "manual oscuro" : "manual"}>
    <header className="manual-barra">
      <img src={logoSmartIndustries} alt="Smart Industries" className="manual-logo" />
      <div className="manual-barra-texto"><h1>{MANUAL.titulo}</h1><p>{MANUAL.codigo} · Rev. {MANUAL.revision} · {MANUAL.fecha}</p></div>
      <div className="manual-acciones"><button type="button" className="manual-tema" onClick={alternarTema}>{oscuro ? "Tema claro" : "Tema oscuro"}</button><Link className="manual-volver" to="/login">Volver al sistema</Link></div>
    </header>
    <div className="manual-marco">
      <nav className="manual-indice" aria-label="Indice del manual"><h2>Contenido</h2><ol>
        <li><NavLink to="/documentacion" end className={claseNav}>Indice</NavLink></li>
        <li><NavLink to="/documentacion/sistema" className={claseNav}>1. Sistema</NavLink></li>
        <li><NavLink to="/documentacion/modelo-operativo" className={claseNav}>2. Modelo operativo</NavLink></li>
        <li><NavLink to="/documentacion/captura" className={claseNav}>3. Canales de captura</NavLink></li>
        <li><NavLink to="/documentacion/recorrido" className={claseNav}>4. Recorrido completo</NavLink></li>
        <li><NavLink to="/documentacion/modelo-datos" className={claseNav}>5. Modelo de datos</NavLink></li>
        <li><NavLink to="/documentacion/front" className={claseNav}>6. Frontend</NavLink></li>
        <li><NavLink to="/documentacion/backend" className={claseNav}>7. Backend y API</NavLink></li>
        <li><NavLink to="/documentacion/api" className={claseNav}>8. Endpoints del backend</NavLink></li>
        <li><NavLink to="/documentacion/despliegue" className={claseNav}>9. Despliegue</NavLink></li>
        <li><NavLink to="/documentacion/recomendaciones" className={claseNav}>10. Recomendaciones futuras</NavLink></li>
        <li><NavLink to="/documentacion/docker" className={claseNav}>Guia Docker</NavLink></li>
        <li><NavLink to="/documentacion/glosario" className={claseNav}>Glosario</NavLink></li>
        <li><NavLink to="/documentacion/apendice-modelo" className={claseNav}>Apendice A. UML completo</NavLink></li>
      </ol></nav>
      <article className="manual-hoja"><p className="manual-migas"><Link to="/documentacion">Indice</Link> / {migas}</p><Contenido /></article>
    </div>
  </div>;
}
