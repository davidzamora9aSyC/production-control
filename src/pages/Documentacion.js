import { useEffect, useState } from "react";
import { Link, NavLink, useLocation, useNavigate, useParams } from "react-router-dom";
import logoSmartIndustries from "../assets/logo2.png";
import "../documentacion/manual.css";
import { GRUPOS, MANUAL, servicioPorId } from "../documentacion/contenido";
import DockerGuia from "../documentacion/DockerGuia";
import ContratoFicha from "../documentacion/ContratoFicha";
import ModeloDatos from "../documentacion/ModeloDatos";

function claseNav({ isActive }) {
  return isActive ? "activo" : undefined;
}

function TablaEndpoints({ filas }) {
  if (!filas.length) {
    return <p>Este servicio no publica endpoints. Lo invocan otros servicios del mismo proceso.</p>;
  }
  return (
    <table className="manual-tabla">
      <thead>
        <tr>
          <th>Método</th>
          <th>Ruta interna</th>
          <th>Acceso</th>
          <th>Qué hace</th>
        </tr>
      </thead>
      <tbody>
        {filas.map(([metodo, ruta, acceso, hace]) => (
          <tr key={`${metodo}-${ruta}`}>
            <td>{metodo}</td>
            <td className="ruta">{ruta}</td>
            <td>{acceso}</td>
            <td>{hace}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function Pie() {
  return (
    <p className="manual-pie">
      {MANUAL.codigo} · Revisión {MANUAL.revision} · {MANUAL.fecha} · Documento interno de operación.
      La ruta externa lleva el prefijo <span className="ruta">/api</span>. Swagger del proceso: <span className="ruta">/docs</span>,
      y por el gateway <span className="ruta">/api/docs</span>.
    </p>
  );
}

function Indice() {
  return (
    <>
      <h2>Índice</h2>
      <p>
        Manual del sistema de control de producción. El despliegue dice cómo está armado y dónde vive la base.
        El backend dice cómo está construido cada módulo: controlador, servicio y repositorio.
        La tercera parte ficha el microservicio <span className="ruta">db-updater-ms</span> servicio por servicio.
      </p>
      <table className="manual-ficha">
        <tbody>
          <tr>
            <th>Documento</th>
            <td>{MANUAL.codigo}</td>
          </tr>
          <tr>
            <th>Revisión</th>
            <td>{MANUAL.revision} — {MANUAL.fecha}</td>
          </tr>
          <tr>
            <th>Ruta de este manual</th>
            <td className="ruta">/documentacion</td>
          </tr>
          <tr>
            <th>Microservicio de backend</th>
            <td>Uno: <span className="ruta">Back/db-updater-ms</span>. NestJS 11. Los módulos de <span className="ruta">src</span> son servicios de dominio dentro de ese proceso, no procesos aparte.</td>
          </tr>
          <tr>
            <th>Base de datos</th>
            <td>PostgreSQL 16, base <span className="ruta">distrecoldb</span>, contenedor <span className="ruta">postgres</span>, volumen <span className="ruta">pgdata</span>. Detalle en Despliegue.</td>
          </tr>
        </tbody>
      </table>
      <h3>Convenciones</h3>
      <p>
        <span className="ruta">Back/db-updater-ms/src</span> es el código NestJS. <span className="ruta">nest build</span> lo compila a <span className="ruta">dist</span> y el contenedor ejecuta <span className="ruta">dist/main</span>. No es una carpeta sobrante.
        Las rutas de las fichas van sin <span className="ruta">/api</span>; por el gateway se llaman <span className="ruta">/api/&lt;ruta&gt;</span>.
        La autenticación es JWT: salvo lo marcado <span className="ruta">@Public()</span>, la guardia exige <span className="ruta">Authorization: Bearer</span>.
      </p>
      <h3>Contenido</h3>
      <ol>
        <li><Link to="/documentacion/sistema">Qué es el sistema</Link> — idea, usuarios y alcance</li>
        <li><Link to="/documentacion/recorrido">Recorrido de una sesión</Link> — alta, minuto, cierre y la pantalla que lo lee</li>
        <li><Link to="/documentacion/primera-vez">Cómo levantarlo la primera vez</Link> — solo front, o Docker</li>
        <li><Link to="/documentacion/despliegue">Despliegue y arquitectura</Link></li>
        <li><Link to="/documentacion/docker">Docker</Link> — principal, desarrollo y qué no tocar</li>
        <li><Link to="/documentacion/front">Front</Link> — rutas, base URL y pantallas</li>
        <li><Link to="/documentacion/backend">Construcción del backend</Link> — controlador, servicio y repositorio</li>
        <li><Link to="/documentacion/modelo-datos">Modelo de datos</Link> — relaciones y atributos</li>
        <li><Link to="/documentacion/seguridad">Seguridad</Link> — JWT, guardia del API y guarda de rutas del front</li>
        <li><Link to="/documentacion/servicios">Servicios del microservicio</Link> — una ficha por módulo</li>
        <li><Link to="/documentacion/limites">Límites y decisiones</Link> — lo que el código hace hoy</li>
        <li><Link to="/documentacion/glosario">Glosario</Link> — términos de planta y de la ruta</li>
      </ol>
      <Pie />
    </>
  );
}

function QueEsElSistema() {
  return (
    <>
      <h2>Qué es el sistema</h2>
      <p>
        Production Control lleva el registro de la planta a una pantalla y a una API.
        Una orden dice qué hay que fabricar. Una sesión ata esa orden a una máquina y a una persona.
        El puesto cuenta, minuto a minuto, pedaleos y piezas. El tablero lee esos números como indicadores y alertas.
      </p>
      <p>
        El programa que hace eso es uno solo en el backend: <span className="ruta">db-updater-ms</span>.
        El front, en <span className="ruta">front/production-control</span>, es la pantalla.
        Esa pantalla publicada corre en Vercel, en <span className="ruta">https://production-control.vercel.app</span>.
        El puesto, o una ESP32, llama la API.
      </p>

      <h3>Usuarios</h3>
      <table className="manual-tabla">
        <thead>
          <tr>
            <th>Quién</th>
            <th>Qué usa</th>
            <th>Cómo entra</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Puesto o ESP32</td>
            <td>Abre y cierra la sesión de una máquina, acumula pedaleos o piezas y deja la minuta. La sesión guarda la fuente <span className="ruta">firmware</span> o <span className="ruta">tablet</span>.</td>
            <td>Rutas marcadas <span className="ruta">@Public()</span>. Con <span className="ruta">?esp32=true</span>, crear sesión y pedir la activa devuelven solo el id.</td>
          </tr>
          <tr>
            <td>Supervisor del tablero</td>
            <td>Resumen, órdenes, sesiones, personas, máquinas y alertas. Ajusta umbrales de alerta y la configuración.</td>
            <td>Login en <span className="ruta">/login</span>. El token JWT abre las pantallas con <span className="ruta">RequireAuth</span> y las rutas del API que no son públicas.</td>
          </tr>
          <tr>
            <td>Quien despliega</td>
            <td>Publica el front en Vercel y levanta gateway, front, backend y PostgreSQL. Distingue el entorno principal del de desarrollo.</td>
            <td>El front publicado está en <span className="ruta">https://production-control.vercel.app</span>. Compose, en <span className="ruta">Back/db-updater-ms</span>. El detalle está en <Link to="/documentacion/docker">Docker</Link> y en <Link to="/documentacion/despliegue">Despliegue</Link>.</td>
          </tr>
        </tbody>
      </table>

      <h3>Alcance que el código cubre</h3>
      <table className="manual-tabla">
        <thead>
          <tr>
            <th>Parte</th>
            <th>Qué queda registrado</th>
            <th>Dónde está</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Órdenes</td>
            <td>Orden de producción, sus pasos y los materiales de la orden. El paso tiene cantidad requerida, producida y estado.</td>
            <td><span className="ruta">/ordenes</span>, <span className="ruta">/pasos</span>, <span className="ruta">/materiales-orden</span>. En el front, <span className="ruta">/ordenes</span>.</td>
          </tr>
          <tr>
            <td>Sesiones</td>
            <td>Sesión de trabajo de una máquina y una persona, el paso asignado, las pausas y los estados de sesión, trabajador y máquina.</td>
            <td><span className="ruta">/sesiones-trabajo</span> y los módulos de paso, pausa y estados. En el front, <span className="ruta">/sesiones</span> y <span className="ruta">/sesion/:id</span>.</td>
          </tr>
          <tr>
            <td>Registro por minuto</td>
            <td>Acumulador del puesto: pedaleadas y piezas contadas en un minuto, ligadas a la sesión y al paso.</td>
            <td><span className="ruta">/registro-minuto</span>. La serie que se consulta sale por <span className="ruta">/sesiones-trabajo/:id/serie-minuto</span>.</td>
          </tr>
          <tr>
            <td>Indicadores</td>
            <td>Cumplimiento, calidad, NPT, velocidad y series por producto, área, trabajador o máquina. También la producción agregada por día y por mes.</td>
            <td><span className="ruta">/indicadores</span> y <span className="ruta">/produccion</span>. En el front, <span className="ruta">/dashboard</span>.</td>
          </tr>
          <tr>
            <td>Alertas</td>
            <td>Alertas por trabajador, máquina u otro sujeto, y los umbrales que salen de la configuración.</td>
            <td><span className="ruta">/alertas</span> y <span className="ruta">/alertas/umbrales</span>. En el front, <span className="ruta">/alertas</span>.</td>
          </tr>
        </tbody>
      </table>
      <p>
        Alrededor de eso el código también guarda catálogos: área, empresa, trabajador y máquina, más la minuta, la configuración y el usuario de acceso.
        La ficha de cada uno está en <Link to="/documentacion/servicios">Servicios</Link>.
      </p>
      <Pie />
    </>
  );
}

function PrimeraVez() {
  return (
    <>
      <h2>Cómo levantarlo la primera vez</h2>
      <p>
        Hay dos caminos. El primero enciende solo la pantalla y este manual. El segundo enciende gateway, front, API y base.
        Los puertos de cada servicio están en <Link to="/documentacion/docker">Docker</Link>; aquí no se repiten.
      </p>

      <h3>Camino 1. Solo el front</h3>
      <p>
        Desde <span className="ruta">front/production-control</span>, con Node instalado:
      </p>
      <pre className="plano">{`npm install
npm start`}</pre>
      <p>
        Create React App abre <span className="ruta">http://localhost:3000</span>. El manual, sin login y sin API, está en
        <span className="ruta"> http://localhost:3000/documentacion</span>.
        El tablero y el login sí llaman a <span className="ruta">/api</span> del mismo origen. Sin el gateway o el backend, esas pantallas no tienen datos.
      </p>
      <p>
        El puerto 3000 es el mismo que publica el gateway del entorno principal. Si ese stack ya está arriba, <span className="ruta">npm start</span> no puede ocupar el puerto. En ese caso se usa el front del contenedor, en la misma URL, o se trabaja contra el entorno de desarrollo.
      </p>

      <h3>Camino 2. Stack Docker</h3>
      <p>
        Antes de levantar nada, mirar desde qué carpeta corre Compose:
      </p>
      <pre className="plano">{`docker compose ls
docker ps`}</pre>
      <div className="nota">
        <strong>SI LA RUTA ES OTRA COPIA. </strong>
        <span className="ruta">docker compose ls</span> muestra el archivo de Compose de cada proyecto.
        Si no es el <span className="ruta">docker-compose.yml</span> de este <span className="ruta">Back/db-updater-ms</span>, no ejecutes <span className="ruta">up</span>, <span className="ruta">down</span>, <span className="ruta">build</span> ni borres volúmenes sobre ese proyecto. Estarías moviendo el stack de la otra carpeta. El script <span className="ruta">start-docker-compose.ps1</span> apunta por defecto a <span className="ruta">C:\Users\pc\Documents\Back\db-updater-ms\docker-compose.yml</span>.
      </div>
      <p>
        Con la ruta confirmada, desde <span className="ruta">Back/db-updater-ms</span> de esta copia:
      </p>
      <pre className="plano">{`docker compose -f docker-compose.yml up -d
docker compose -f docker-compose.dev.yml up -d`}</pre>
      <p>
        La primera línea es el entorno principal: la entrada queda en el puerto 3000.
        La segunda es el de desarrollo: la entrada queda en el puerto 3100, con otra base.
        Si cambiaste código y el de desarrollo ya existía, reconstruye con el comando de <Link to="/documentacion/docker">Docker</Link>. No hace falta volver a listar aquí los puertos internos.
      </p>

      <h3>Comprobar que el API responde</h3>
      <p>
        <span className="ruta">GET /</span> del backend es público y responde el saludo del proceso. Por el gateway esa misma ruta se pide con el prefijo <span className="ruta">/api</span>.
      </p>
      <table className="manual-tabla">
        <thead>
          <tr>
            <th>Entorno</th>
            <th>Directo al proceso</th>
            <th>Por el gateway</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Principal</td>
            <td className="ruta">GET http://localhost:3001/</td>
            <td className="ruta">GET http://localhost:3000/api/</td>
          </tr>
          <tr>
            <td>Desarrollo</td>
            <td className="ruta">GET http://localhost:3101/</td>
            <td className="ruta">GET http://localhost:3100/api/</td>
          </tr>
        </tbody>
      </table>
      <p>
        <span className="ruta">GET http://localhost:3000/</span> abre el front, no el saludo del API.
        El manual del contenedor principal queda en <span className="ruta">http://localhost:3000/documentacion</span> y el de desarrollo en <span className="ruta">http://localhost:3100/documentacion</span>.
      </p>
      <Pie />
    </>
  );
}

function Glosario() {
  return (
    <>
      <h2>Glosario</h2>
      <p>Cada término cabe en dos líneas. La segunda dice la tabla o la carpeta donde vive.</p>

      <h3>Sesión de trabajo</h3>
      <p>Une un trabajador con una máquina entre un inicio y un fin, y guarda de dónde salió el conteo.</p>
      <p>Tabla <span className="ruta">sesion_trabajo</span>, carpeta <span className="ruta">src/sesion-trabajo</span>.</p>

      <h3>Paso</h3>
      <p>Etapa de una orden: nombre, código interno y cantidades requerida y producida.</p>
      <p>
        Tabla <span className="ruta">PasoProduccion</span>, carpeta <span className="ruta">src/paso-produccion</span>.
        La fila que ata ese paso a una sesión está en <span className="ruta">sesion_trabajo_paso</span>.
      </p>

      <h3>Orden</h3>
      <p>Lo que hay que fabricar: número, producto, cantidad y estado.</p>
      <p>Tabla <span className="ruta">OrdenProduccion</span>, carpeta <span className="ruta">src/orden-produccion</span>.</p>

      <h3>Minuta</h3>
      <p>Parte de producción con recurso, orden, paso, cantidad y pedalazos.</p>
      <p>Tabla <span className="ruta">Minuta</span>, carpeta <span className="ruta">src/minuta</span>.</p>

      <h3>Registro por minuto</h3>
      <p>Un minuto de una sesión y de su paso asignado, con pedaleadas y piezas contadas.</p>
      <p>Tabla <span className="ruta">registro_minuto</span>, carpeta <span className="ruta">src/registro-minuto</span>.</p>

      <h3>NPT</h3>
      <p>Tiempo no productivo. El umbral de inactividad que lo dispara está en <span className="ruta">configuracion.minutosInactividadParaNPT</span>.</p>
      <p>
        Los minutos quedan en <span className="ruta">nptMin</span>, <span className="ruta">nptPorInactividad</span> y <span className="ruta">porcentajeNPT</span> de las tablas <span className="ruta">indicador_sesion_minuto</span> e <span className="ruta">indicador_diario_dim</span>.
      </p>

      <h3>Fuente firmware / tablet</h3>
      <p>Columna <span className="ruta">fuente</span>. El enum <span className="ruta">FuenteDatosSesion</span> vale <span className="ruta">firmware</span> o <span className="ruta">tablet</span>.</p>
      <p>
        Vive en <span className="ruta">sesion_trabajo</span> y se copia en <span className="ruta">sesion_trabajo_paso</span> e <span className="ruta">indicador_diario_dim</span>. Carpeta <span className="ruta">src/sesion-trabajo</span>.
      </p>

      <h3>Gateway</h3>
      <p>Nginx que publica una sola entrada y reparte el front y el API.</p>
      <p>Carpeta <span className="ruta">Back/db-updater-ms/gateway</span>, archivos <span className="ruta">nginx.conf</span> y <span className="ruta">nginx.dev.conf</span>.</p>

      <h3>Ruta interna y /api</h3>
      <p>El controlador Nest declara la ruta sin prefijo. <span className="ruta">GET /sesiones-trabajo</span> es la ruta interna.</p>
      <p>
        En <span className="ruta">gateway/nginx.conf</span>, <span className="ruta">location /api/</span> reescribe <span className="ruta">^/api/(.*)$</span> a <span className="ruta">/$1</span> y la entrega al backend. Desde fuera esa misma llamada es <span className="ruta">GET /api/sesiones-trabajo</span>.
      </p>
      <Pie />
    </>
  );
}

function Recorrido() {
  return (
    <>
      <h2>Recorrido de una sesión</h2>
      <p>
        Un puesto abre la sesión, suma pedales y piezas en memoria, guarda el minuto y cierra.
        Las rutas de esta página son las del controlador. Desde fuera del gateway llevan el prefijo <span className="ruta">/api</span>, como explica el <Link to="/documentacion/glosario">glosario</Link>.
      </p>
      <p>
        El cuerpo del alta es el de <span className="ruta">create-sesion-trabajo.dto.ts</span>: <span className="ruta">trabajador</span> y <span className="ruta">maquina</span>, ambos UUID, y <span className="ruta">desdeTablet</span> booleano y opcional.
        El de acumular es el de <span className="ruta">acumulador.dto.ts</span>: <span className="ruta">maquina</span> y <span className="ruta">paso</span> UUID, <span className="ruta">tipo</span> igual a <span className="ruta">pedal</span> o <span className="ruta">pieza</span>, y <span className="ruta">minutoInicio</span> opcional en fecha ISO.
      </p>

      <table className="manual-tabla">
        <thead>
          <tr>
            <th>Paso</th>
            <th>Entrada</th>
            <th>Salida</th>
            <th>Acceso</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Crear</td>
            <td>
              <span className="ruta">POST /sesiones-trabajo</span>. Query <span className="ruta">esp32=true</span> si el puesto solo quiere el id.
              Cuerpo: trabajador, máquina y, si la sesión sale de una tablet, <span className="ruta">desdeTablet: true</span>.
            </td>
            <td>
              Con <span className="ruta">esp32=true</span>, el id de la sesión. Sin ese query, la sesión, con fechas en hora de Bogotá.
              La máquina no puede tener otra sesión abierta. <span className="ruta">desdeTablet</span> en true deja la fuente en <span className="ruta">tablet</span>; si se omite, la fuente queda vacía.
              El estado inicial en <span className="ruta">estado_sesion</span> es <span className="ruta">inactivo</span>.
            </td>
            <td>Pública</td>
          </tr>
          <tr>
            <td>Acumular</td>
            <td>
              <span className="ruta">POST /registro-minuto/acumular</span>.
              Máquina, paso, tipo <span className="ruta">pedal</span> o <span className="ruta">pieza</span>, y el minuto ISO si el puesto lo envía.
            </td>
            <td>
              <span className="ruta">{`{ ok: true }`}</span>. Suma uno en memoria, de pedaleadas o de piezas.
              Solo cuenta si esa máquina tiene una sesión abierta en estado <span className="ruta">produccion</span> y el paso ya está asignado en <span className="ruta">sesion_trabajo_paso</span>.
              Si falta la sesión o la asignación, la respuesta es la misma y no se suma nada.
            </td>
            <td>Pública</td>
          </tr>
          <tr>
            <td>Guardar el minuto</td>
            <td><span className="ruta">POST /registro-minuto/guardar</span>. Sin cuerpo.</td>
            <td>
              <span className="ruta">{`{ ok: true }`}</span>. Escribe la fila en <span className="ruta">registro_minuto</span>, suma pedaleadas y piezas a la sesión, a la asignación y al paso, y vacía la memoria.
            </td>
            <td>Pública</td>
          </tr>
          <tr>
            <td>Finalizar</td>
            <td><span className="ruta">POST /sesiones-trabajo/:id/finalizar</span>. El id va en la ruta. Sin cuerpo.</td>
            <td>
              La sesión con <span className="ruta">fechaFin</span>. Deja el indicador de la sesión en <span className="ruta">indicador_sesion</span>, actualiza el diario y cierra las asignaciones de paso que seguían abiertas.
              Si el trabajador está en descanso, el cierre se rechaza.
            </td>
            <td>Pública</td>
          </tr>
        </tbody>
      </table>

      <h3>Qué pantalla lee el resultado</h3>
      <p>
        Mientras la sesión sigue abierta, <span className="ruta">/sesiones</span> (Sesiones actuales) lee <span className="ruta">GET /sesiones-trabajo/actuales</span>: sesiones sin fecha de fin, con el último indicador de minuto.
        El detalle está en <span className="ruta">/sesion/:id</span> (Información de la sesión). Esa pantalla lee la sesión, la orden y el paso activos, y <span className="ruta">GET /registro-minuto/sesion/:id/ultimos</span> para las barras del minuto.
        Esas tres lecturas del API son públicas. Entrar a la pantalla del front pide login.
      </p>
      <p>
        Al finalizar, la sesión deja de salir en Sesiones actuales. El tablero, en <span className="ruta">/dashboard</span>, lee el agregado por <span className="ruta">/indicadores</span>. Esas rutas del API piden JWT.
      </p>
      <Pie />
    </>
  );
}

function Despliegue() {
  return (
    <>
      <h2>1. Despliegue y arquitectura</h2>
      <p>
        Hay un solo plano de producción en este repositorio: cuatro contenedores definidos en
        <span className="ruta"> Back/db-updater-ms/docker-compose.yml</span>. El de desarrollo repite el mismo dibujo
        con otros nombres y otros puertos, en <span className="ruta">docker-compose.dev.yml</span>.
        Puertos, volúmenes, las dos copias posibles y las reglas para no mezclar entornos están en <Link to="/documentacion/docker">Docker</Link>.
      </p>
      <p>
        El front publicado corre en Vercel: <span className="ruta">https://production-control.vercel.app</span>.
        Vercel entrega el build estático de <span className="ruta">front/production-control</span>.
        Ese origen está en la lista de CORS de <span className="ruta">main.ts</span>.
        Desde ese host, <span className="ruta">api.js</span> llama la URL pública declarada en <span className="ruta">PUBLIC_API_BASE_URL</span>.
      </p>

      <h3>Dónde está la base de datos</h3>
      <table className="manual-ficha">
        <tbody>
          <tr>
            <th>Motor</th>
            <td>PostgreSQL 16, imagen <span className="ruta">postgres:16-alpine</span>.</td>
          </tr>
          <tr>
            <th>Producción</th>
            <td>
              Servicio Compose <span className="ruta">postgres</span>, contenedor <span className="ruta">postgres</span>,
              base <span className="ruta">distrecoldb</span>. Puerto publicado en el host: <span className="ruta">5432</span>.
            </td>
          </tr>
          <tr>
            <th>Dónde están los datos</th>
            <td>
              Volumen Docker <span className="ruta">pgdata</span>, montado dentro del contenedor en
              <span className="ruta"> /var/lib/postgresql/data</span>. No hay un archivo <span className="ruta">.sql</span> en el repositorio: el esquema lo crea TypeORM al arrancar.
            </td>
          </tr>
          <tr>
            <th>Cómo llega el backend</th>
            <td>
              Por la red de Compose, hostname <span className="ruta">postgres</span>, puerto <span className="ruta">5432</span>.
              Lo fija el entorno <span className="ruta">DB_HOST=postgres</span> del servicio <span className="ruta">backend</span>.
            </td>
          </tr>
          <tr>
            <th>Dónde está el código de conexión</th>
            <td><span className="ruta">Back/db-updater-ms/src/app.module.ts</span>, <span className="ruta">TypeOrmModule.forRoot</span>.</td>
          </tr>
          <tr>
            <th>Variables</th>
            <td className="ruta">DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD, DB_DATABASE, DB_SSL, DB_SYNCHRONIZE</td>
          </tr>
          <tr>
            <th>Si no hay entorno</th>
            <td>
              El código asume <span className="ruta">localhost:5432</span>, base <span className="ruta">distrecoldb</span> y sincronización activa.
              Eso vale para un Postgres local, no para el nombre del contenedor.
            </td>
          </tr>
          <tr>
            <th>Desarrollo</th>
            <td>
              Contenedor <span className="ruta">postgres-dev</span>, base <span className="ruta">distrecoldb_dev</span>,
              puerto del host <span className="ruta">5433</span>, volumen <span className="ruta">pgdata_dev</span>.
            </td>
          </tr>
        </tbody>
      </table>
      <div className="nota">
        <strong>NOTA. </strong>
        <span className="ruta">DB_SYNCHRONIZE</span> queda en verdadero si no se apaga. TypeORM altera tablas para que coincidan con las entidades. En una base que ya tiene datos de planta, ese interruptor se cambia a propósito, no por accidente.
      </div>

      <h3>Plano</h3>
      <pre className="plano">{`Navegador                         ESP32 / puesto
    |                                  |
    |  SPA React                       |  HTTP /api/...
    v                                  v
+------------------------------------------------------+
| Gateway nginx                                        |
| imagen nginx:1.27-alpine                             |
| host :3000  ->  contenedor :80                       |
| conf: Back/db-updater-ms/gateway/nginx.conf         |
+------------------------------------------------------+
     |  /                              |  /api/*
     |  proxy a frontend:80            |  quita /api y proxy a backend:3001
     v                                 v
+-------------------+         +---------------------------+
| frontend          |         | backend                   |
| build React       |         | NestJS  db-updater-ms     |
| nginx sirve dist  |         | puerto 3001               |
+-------------------+         +---------------------------+
                                        |
                                        |  DB_HOST=postgres
                                        v
                              +---------------------------+
                              | PostgreSQL 16             |
                              | contenedor postgres       |
                              | base distrecoldb          |
                              | host :5432                |
                              | volumen pgdata            |
                              +---------------------------+`}</pre>

      <h3>Conjunto de desarrollo</h3>
      <p>
        El mismo corte, aislado. Gateway <span className="ruta">gateway-dev</span> en el puerto <span className="ruta">3100</span>,
        backend <span className="ruta">backend-dev</span> publicado en <span className="ruta">3101</span>,
        base <span className="ruta">distrecoldb_dev</span>. El front de ese compose se construye con
        <span className="ruta"> REACT_APP_USE_DEV_BACKEND=true</span>.
      </p>

      <h3>Qué hace cada pieza</h3>
      <table className="manual-tabla">
        <thead>
          <tr>
            <th>Pieza</th>
            <th>Dónde está</th>
            <th>Papel</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Front</td>
            <td className="ruta">front/production-control</td>
            <td>SPA React 18. Publicado en Vercel, en <span className="ruta">https://production-control.vercel.app</span>. En desarrollo, <span className="ruta">npm start</span> abre el puerto 3000. Este manual vive en <span className="ruta">/documentacion</span>.</td>
          </tr>
          <tr>
            <td>Backend</td>
            <td className="ruta">Back/db-updater-ms</td>
            <td>Único microservicio. Escucha 3001. Swagger en <span className="ruta">/docs</span>.</td>
          </tr>
          <tr>
            <td>Gateway de Compose</td>
            <td className="ruta">Back/db-updater-ms/gateway/nginx.conf</td>
            <td>Es el que monta el contenedor <span className="ruta">gateway</span>. <span className="ruta">/</span> va al front y <span className="ruta">/api/</span> al backend.</td>
          </tr>
          <tr>
            <td>Copia del gateway</td>
            <td className="ruta">nginx-gateway-public/nginx.conf</td>
            <td>Copia operativa del mismo criterio. No es la que monta el compose.</td>
          </tr>
          <tr>
            <td>Front publicado</td>
            <td className="ruta">front/production-control/nginx.conf</td>
            <td>Sirve el build y devuelve <span className="ruta">index.html</span> en cualquier ruta, incluida <span className="ruta">/documentacion</span>.</td>
          </tr>
        </tbody>
      </table>

      <h3>Tráfico de la API</h3>
      <ol>
        <li>El navegador o la ESP32 llaman <span className="ruta">/api/&lt;ruta&gt;</span> en el origen del gateway.</li>
        <li>Nginx reescribe <span className="ruta">/api/(.*)</span> a <span className="ruta">/$1</span> y lo entrega al backend en el puerto 3001.</li>
        <li>Por eso las fichas de este manual muestran la ruta interna, sin <span className="ruta">/api</span>. Desde fuera se le antepone ese prefijo.</li>
        <li>El front de Vercel, en <span className="ruta">production-control.vercel.app</span>, toma la base de API de <span className="ruta">PUBLIC_API_BASE_URL</span> en <span className="ruta">api.js</span>, salvo que el build traiga <span className="ruta">REACT_APP_API_BASE_URL</span>. En local y detrás del gateway usa <span className="ruta">/api</span> del mismo origen.</li>
      </ol>
      <p>
        CORS, en <span className="ruta">src/main.ts</span>, acepta el front publicado en <span className="ruta">https://production-control.vercel.app</span>, localhost, redes privadas y orígenes ngrok.
        Hay un <span className="ruta">ValidationPipe</span> global con lista blanca.
      </p>
      <Pie />
    </>
  );
}

function Backend() {
  return (
    <>
      <h2>2. Construcción del backend</h2>
      <p>
        <span className="ruta">db-updater-ms</span> es un proceso NestJS. Cada carpeta de dominio bajo
        <span className="ruta"> src</span> es un módulo. El módulo registra tres capas. No hay clases <span className="ruta">*Repository</span> escritas a mano:
        el repositorio es el <span className="ruta">Repository&lt;Entidad&gt;</span> de TypeORM, inyectado en el servicio.
      </p>
      <table className="manual-capas">
        <tbody>
          <tr>
            <td><strong>Controlador</strong><br />HTTP, DTO, ruta</td>
            <td className="flecha">→</td>
            <td><strong>Servicio</strong><br />regla y consulta</td>
            <td className="flecha">→</td>
            <td><strong>Repositorio</strong><br />TypeORM</td>
            <td className="flecha">→</td>
            <td><strong>PostgreSQL</strong><br />distrecoldb</td>
          </tr>
        </tbody>
      </table>

      <h3 id="controlador">Controlador — endpoints</h3>
      <p>
        El controlador no abre SQL. Recibe el verbo y la ruta, valida el cuerpo con el DTO y llama al servicio del mismo módulo.
        <span className="ruta"> AppModule</span> cuelga <span className="ruta">JwtAuthGuard</span> en toda la aplicación. Un método es público solo si lleva
        <span className="ruta"> @Public()</span>. Esos métodos son los que usa el puesto o la ESP32 sin token. El resto exige
        <span className="ruta"> Authorization: Bearer</span>.
      </p>
      <p>
        La ruta que ve el controlador es la interna. El gateway le quita <span className="ruta">/api</span> antes de entregarla.
        Swagger describe los DTO en <span className="ruta">/docs</span>.
      </p>

      <h3 id="servicio">Servicio</h3>
      <p>
        El servicio tiene la regla: armar una sesión, cerrar un descanso, calcular una serie, decidir una alerta.
        Puede usar varios repositorios y otros servicios exportados. No conoce el request HTTP.
        Tres módulos no tienen controlador. Quién los llama está en el mapa de dependencias.
      </p>

      <h3 id="repositorio">Repositorio</h3>
      <p>
        El módulo declara las entidades en <span className="ruta">TypeOrmModule.forFeature</span>. El servicio recibe el repositorio con
        <span className="ruta"> @InjectRepository</span>. La entidad marca la tabla. Si <span className="ruta">@Entity('nombre')</span> trae nombre, esa es la tabla.
        Si <span className="ruta">@Entity()</span> va vacío, TypeORM usa el nombre de la clase. En este código eso ocurre con
        <span className="ruta">Maquina</span>, <span className="ruta">OrdenProduccion</span>, <span className="ruta">PasoProduccion</span> y <span className="ruta">Minuta</span>.
      </p>
      <p>
        <span className="ruta">autoLoadEntities</span> está activo. Con <span className="ruta">DB_SYNCHRONIZE</span> en verdadero, el arreglo de tablas sigue a las entidades al levantar el proceso.
        La conexión única está en <span className="ruta">AppModule</span> y apunta a la base descrita en Despliegue.
      </p>
      <h3 id="dependencias">Dependencias entre módulos</h3>
      <p>
        El mapa sale de <span className="ruta">imports</span> en cada <span className="ruta">*.module.ts</span>.
        <span className="ruta"> AppModule</span> junta todos los módulos de dominio en un solo proceso.
        <span className="ruta">IndicadorDiarioDimModule</span> no está en esa lista: entra porque lo importan la sesión y el indicador por minuto.
        Empresa, área, minuta, material, paso, orden, trabajador, máquina, producción diaria y configuración solo declaran <span className="ruta">TypeOrmModule.forFeature</span>.
      </p>
      <table className="manual-tabla">
        <thead>
          <tr>
            <th>Módulo</th>
            <th>Importa</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="ruta">SesionTrabajoModule</td>
            <td><span className="ruta">RegistroMinutoModule</span>, <span className="ruta">EstadoSesionModule</span>, <span className="ruta">IndicadorDiarioDimModule</span></td>
          </tr>
          <tr>
            <td className="ruta">RegistroMinutoModule</td>
            <td><span className="ruta">ProduccionDiariaModule</span>, <span className="ruta">SesionTrabajoPasoModule</span></td>
          </tr>
          <tr>
            <td className="ruta">SesionTrabajoPasoModule</td>
            <td><span className="ruta">PausaPasoSesionModule</span>, <span className="ruta">PasoProduccionModule</span></td>
          </tr>
          <tr>
            <td className="ruta">PausaPasoSesionModule</td>
            <td><span className="ruta">PasoProduccionModule</span></td>
          </tr>
          <tr>
            <td className="ruta">EstadoSesionModule</td>
            <td><span className="ruta">PasoProduccionModule</span></td>
          </tr>
          <tr>
            <td className="ruta">EstadoTrabajadorModule</td>
            <td><span className="ruta">PasoProduccionModule</span>, <span className="ruta">EstadoSesionModule</span>, <span className="ruta">PausaPasoSesionModule</span></td>
          </tr>
          <tr>
            <td className="ruta">EstadoMaquinaModule</td>
            <td><span className="ruta">PasoProduccionModule</span>, <span className="ruta">EstadoSesionModule</span>, <span className="ruta">PausaPasoSesionModule</span></td>
          </tr>
          <tr>
            <td className="ruta">IndicadorSesionMinutoModule</td>
            <td><span className="ruta">SesionTrabajoModule</span>, <span className="ruta">IndicadorDiarioDimModule</span></td>
          </tr>
          <tr>
            <td className="ruta">IndicadoresModule</td>
            <td><span className="ruta">SesionTrabajoModule</span></td>
          </tr>
          <tr>
            <td className="ruta">AlertaModule</td>
            <td><span className="ruta">ConfiguracionModule</span></td>
          </tr>
          <tr>
            <td className="ruta">AuthModule</td>
            <td><span className="ruta">PassportModule</span></td>
          </tr>
        </tbody>
      </table>
      <p>Sin controlador, y quién los usa:</p>
      <table className="manual-tabla">
        <thead>
          <tr>
            <th>Módulo</th>
            <th>Qué exporta</th>
            <th>Quién lo llama</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="ruta">pausa-paso-sesion</td>
            <td><span className="ruta">PausaPasoSesionService</span></td>
            <td>
              <span className="ruta">SesionTrabajoPasoService</span>, <span className="ruta">EstadoTrabajadorService</span> y <span className="ruta">EstadoMaquinaService</span>.
              El archivo es <span className="ruta">pausa-paso-sesion.module.ts</span>: tiene <span className="ruta">providers</span> y <span className="ruta">exports</span>, y no tiene <span className="ruta">controllers</span>.
            </td>
          </tr>
          <tr>
            <td className="ruta">indicador-sesion-minuto</td>
            <td><span className="ruta">IndicadorSesionMinutoService</span></td>
            <td>
              Ningún otro servicio lo inyecta. El propio servicio corre <span className="ruta">@Cron('* * * * *')</span> en <span className="ruta">generar()</span> y escribe la fila del minuto.
              <span className="ruta">SesionTrabajoService</span> lee y borra esa tabla por el repositorio, no por este servicio.
              <span className="ruta">indicador-sesion-minuto.module.ts</span> no declara controlador.
            </td>
          </tr>
          <tr>
            <td className="ruta">indicador-diario-dim</td>
            <td><span className="ruta">IndicadorDiarioSyncService</span></td>
            <td>
              <span className="ruta">SesionTrabajoService</span> y <span className="ruta">IndicadorSesionMinutoService</span>.
              <span className="ruta">indicador-diario-dim.module.ts</span> no declara controlador.
            </td>
          </tr>
        </tbody>
      </table>

      <div className="nota">
        <strong>CÓMO LEER UNA FICHA. </strong>
        Controlador: clase y rutas. Servicio: qué decide y a quién llama. Repositorio: entidad, tabla y los otros repositorios que inyecta.
        La columna Acceso dice si el método es público o pide JWT.
        Al cambiar un endpoint, se actualiza la ficha en <span className="ruta">src/documentacion/contenido.js</span>.
      </div>
      <p>
        El catálogo está en <Link to="/documentacion/servicios">Servicios del microservicio</Link>.
      </p>
      <Pie />
    </>
  );
}

function Limites() {
  return (
    <>
      <h2>Límites y decisiones</h2>
      <p>Cada fila es lo que el código hace hoy, con el archivo donde se ve.</p>
      <table className="manual-tabla">
        <thead>
          <tr>
            <th>Punto</th>
            <th>Decisión o restricción</th>
            <th>Dónde</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Un solo proceso Nest</td>
            <td>Decisión. Dominio, guardia e interceptores viven en el mismo proceso. <span className="ruta">main.ts</span> abre un puerto y arranca <span className="ruta">AppModule</span>.</td>
            <td><span className="ruta">src/app.module.ts</span>, <span className="ruta">src/main.ts</span></td>
          </tr>
          <tr>
            <td>DB_SYNCHRONIZE</td>
            <td>Restricción. Si la variable no viene en el entorno, el valor usado es true y TypeORM ajusta el esquema al arrancar.</td>
            <td><span className="ruta">src/app.module.ts</span></td>
          </tr>
          <tr>
            <td>Rutas públicas del puesto</td>
            <td>Decisión. La guardia global deja pasar el método o la clase marcados <span className="ruta">@Public()</span>. Por ahí entran el puesto y la ESP32. El resto pide Bearer. El detalle de cada ruta está en <Link to="/documentacion/servicios">Servicios</Link>.</td>
            <td><span className="ruta">src/auth/jwt-auth.guard.ts</span>, <span className="ruta">src/app.module.ts</span></td>
          </tr>
          <tr>
            <td>JWT sin roles ni revocación</td>
            <td>Restricción. El payload lleva <span className="ruta">sub</span>, <span className="ruta">username</span> y <span className="ruta">name</span>. La estrategia no consulta roles. Cerrar sesión en el front borra el token local; el servidor no tiene lista de tokens anulados ni token de refresco.</td>
            <td><span className="ruta">src/auth/jwt.strategy.ts</span>, <span className="ruta">src/auth/auth.service.ts</span></td>
          </tr>
          <tr>
            <td>Secreto de firma</td>
            <td>Restricción. La firma lee <span className="ruta">JWT_SECRET</span>. Si la variable no está, el fuente usa un secreto de desarrollo. En producción la variable tiene que estar definida.</td>
            <td><span className="ruta">src/auth/auth.service.ts</span>, <span className="ruta">src/auth/jwt.strategy.ts</span></td>
          </tr>
          <tr>
            <td>Interceptor de zona horaria</td>
            <td>Decisión registrada, con un límite: <span className="ruta">TimezoneInterceptor</span> es global y su <span className="ruta">intercept</span> devuelve la respuesta sin modificarla. La hora de Colombia la calcula <span className="ruta">TimezoneService</span>, zona <span className="ruta">America/Bogota</span>. <span className="ruta">convertFromUTC</span> devuelve el dato igual que llegó.</td>
            <td><span className="ruta">src/app.module.ts</span>, <span className="ruta">src/common/timezone.interceptor.ts</span>, <span className="ruta">src/common/timezone.service.ts</span></td>
          </tr>
          <tr>
            <td>Dependencias que el fuente no importa</td>
            <td>
              Restricción de empaque. En el backend están declarados <span className="ruta">mongoose</span> y <span className="ruta">@nestjs/mongoose</span>, y ningún archivo de <span className="ruta">src</span> los importa.
              En el front están declarados <span className="ruta">@auth0/auth0-react</span>, <span className="ruta">react-minimal-pie-chart</span>, <span className="ruta">react-swiper</span> y <span className="ruta">swiper</span>, y ningún archivo de <span className="ruta">src</span> los importa.
            </td>
            <td><span className="ruta">Back/db-updater-ms/package.json</span>, <span className="ruta">front/production-control/package.json</span></td>
          </tr>
        </tbody>
      </table>
      <Pie />
    </>
  );
}

function ListaServicios() {
  return (
    <>
      <h2>3. Servicios del microservicio</h2>
      <p>
        Un solo proceso, <span className="ruta">db-updater-ms</span>, registrado en <span className="ruta">src/app.module.ts</span>.
        Cada fila es un servicio de dominio. Los que dicen «sin HTTP» no tienen controlador: los usa otro servicio del mismo proceso.
      </p>
      {GRUPOS.map((grupo) => (
        <section key={grupo.id}>
          <h3>{grupo.titulo}</h3>
          <table className="manual-tabla">
            <thead>
              <tr>
                <th>Servicio</th>
                <th>Prefijo</th>
                <th>Tabla</th>
              </tr>
            </thead>
            <tbody>
              {grupo.ids.map((id) => {
                const item = servicioPorId(id);
                return (
                  <tr key={id}>
                    <td><Link to={`/documentacion/servicios/${id}`}>{item.nombre}</Link></td>
                    <td className="ruta">{item.prefijo}</td>
                    <td>{item.tabla}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>
      ))}
      <Pie />
    </>
  );
}

function Ficha({ id }) {
  const item = servicioPorId(id);
  if (!item) {
    return (
      <>
        <h2>Servicio no registrado</h2>
        <p>Ese identificador no está en el manual. Volver al <Link to="/documentacion/servicios">índice de servicios</Link>.</p>
      </>
    );
  }
  return (
    <>
      <h2>{item.nombre}</h2>
      <table className="manual-ficha">
        <tbody>
          <tr>
            <th>Microservicio</th>
            <td>db-updater-ms</td>
          </tr>
          <tr>
            <th>Carpeta</th>
            <td className="ruta">{item.carpeta}</td>
          </tr>
          <tr>
            <th>Controlador</th>
            <td>{item.controlador}</td>
          </tr>
          <tr>
            <th>Prefijo interno</th>
            <td className="ruta">{item.prefijo}</td>
          </tr>
          <tr>
            <th>Tabla</th>
            <td>{item.tabla}</td>
          </tr>
        </tbody>
      </table>
      <p>{item.resumen}</p>

      <h3>Controlador — endpoints</h3>
      <p>{item.publicos}</p>
      <TablaEndpoints filas={item.endpoints} />
      <ContratoFicha id={id} />

      <h3>Servicio</h3>
      <p>{item.servicio}</p>

      <h3>Repositorio</h3>
      <p>{item.repositorio}</p>
      <p>La conexión es la de <span className="ruta">AppModule</span>: PostgreSQL <span className="ruta">distrecoldb</span> en el contenedor <span className="ruta">postgres</span>.</p>
      {id === "auth" ? (
        <p>La construcción completa de este segmento está en <Link to="/documentacion/seguridad">Seguridad</Link>.</p>
      ) : null}
      <Pie />
    </>
  );
}

function Front() {
  return (
    <>
      <h2>Front</h2>
      <p>
        La pantalla vive en <span className="ruta">front/production-control</span> y el front publicado corre en Vercel, en <span className="ruta">https://production-control.vercel.app</span>.
        Es una SPA de React 18 (Create React App) con React Router 6, Tailwind y Nginx para el build de Docker.
        Gráficas con Recharts, QR con <span className="ruta">qrcode</span> y ZXing, Excel con <span className="ruta">xlsx</span>, iconos con Lucide y React Icons.
        El texto de partida de este capítulo está en <span className="ruta">documentacion/03-frontend.md</span>.
      </p>

      <h3>Carpetas</h3>
      <table className="manual-tabla">
        <thead>
          <tr>
            <th>Ubicación</th>
            <th>Qué hace</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="ruta">src/index.js</td>
            <td>Monta React.</td>
          </tr>
          <tr>
            <td className="ruta">src/App.js</td>
            <td>Router, proveedores y la guarda de cada ruta.</td>
          </tr>
          <tr>
            <td className="ruta">src/api.js</td>
            <td>Elige la base URL, arma el <span className="ruta">fetch</span>, pone el JWT y cachea los GET.</td>
          </tr>
          <tr>
            <td className="ruta">src/context</td>
            <td>Autenticación, áreas y relación de aspecto.</td>
          </tr>
          <tr>
            <td className="ruta">src/pages</td>
            <td>Pantallas.</td>
          </tr>
          <tr>
            <td className="ruta">src/components</td>
            <td>Formularios, paneles, tablas y gráficas.</td>
          </tr>
          <tr>
            <td className="ruta">src/utils</td>
            <td>Lectura de datos y textos de indicadores.</td>
          </tr>
        </tbody>
      </table>

      <h3>Rutas de App.js</h3>
      <p>
        Tres proveedores envuelven el router, de fuera hacia dentro: <span className="ruta">AspectRatioProvider</span>, <span className="ruta">AuthProvider</span> y <span className="ruta">AreasProvider</span>.
        Las rutas con <span className="ruta">RequireAuth</span> usan además <span className="ruta">ProtectedLayout</span>, que pone la barra y vuelve arriba al cambiar de página.
      </p>
      <table className="manual-tabla">
        <thead>
          <tr>
            <th>Ruta</th>
            <th>Pantalla</th>
            <th>Acceso</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="ruta">/</td>
            <td><span className="ruta">pages/NuevaMinuta.js</span></td>
            <td>Pública</td>
          </tr>
          <tr>
            <td className="ruta">/login</td>
            <td><span className="ruta">components/Login.js</span></td>
            <td>Pública. Con sesión, entra a <span className="ruta">/dashboard</span>.</td>
          </tr>
          <tr>
            <td className="ruta">/documentacion</td>
            <td>Índice de este manual</td>
            <td>Pública</td>
          </tr>
          <tr>
            <td className="ruta">/documentacion/docker</td>
            <td>Capítulo Docker</td>
            <td>Pública</td>
          </tr>
          <tr>
            <td className="ruta">/documentacion/*</td>
            <td>El resto de capítulos, el mismo componente</td>
            <td>Pública</td>
          </tr>
          <tr>
            <td className="ruta">/dashboard/*</td>
            <td>Tablero actual, <span className="ruta">pages/Dashboard2.js</span>. Vistas general, trabajadores, máquinas, áreas, productos y alertas.</td>
            <td>RequireAuth</td>
          </tr>
          <tr>
            <td className="ruta">/dashboard2</td>
            <td>Tablero anterior, <span className="ruta">pages/Dashboard.js</span></td>
            <td>RequireAuth</td>
          </tr>
          <tr>
            <td className="ruta">/alertas</td>
            <td><span className="ruta">pages/Alertas.js</span></td>
            <td>RequireAuth</td>
          </tr>
          <tr>
            <td className="ruta">/sesiones</td>
            <td><span className="ruta">pages/Sesiones.js</span></td>
            <td>RequireAuth</td>
          </tr>
          <tr>
            <td className="ruta">/sesion/:id</td>
            <td><span className="ruta">pages/Maquina.js</span></td>
            <td>RequireAuth</td>
          </tr>
          <tr>
            <td className="ruta">/ordenes</td>
            <td><span className="ruta">pages/OrdenesProduccion.js</span></td>
            <td>RequireAuth</td>
          </tr>
          <tr>
            <td className="ruta">/ordenes/:id</td>
            <td><span className="ruta">pages/DetalleOrden.js</span></td>
            <td>RequireAuth</td>
          </tr>
          <tr>
            <td className="ruta">/personas</td>
            <td><span className="ruta">pages/Personas.js</span></td>
            <td>RequireAuth</td>
          </tr>
          <tr>
            <td className="ruta">/maquinas</td>
            <td><span className="ruta">pages/Equipos.js</span></td>
            <td>RequireAuth</td>
          </tr>
          <tr>
            <td className="ruta">/funciones/wifi-qr</td>
            <td><span className="ruta">pages/WifiQrTool.js</span>. Arma el QR en el navegador.</td>
            <td>RequireAuth</td>
          </tr>
          <tr>
            <td className="ruta">/sesiones/personas</td>
            <td>Redirige a <span className="ruta">/personas</span></td>
            <td>Pública. Es un <span className="ruta">Navigate</span>.</td>
          </tr>
          <tr>
            <td className="ruta">/sesiones/equipos</td>
            <td>Redirige a <span className="ruta">/maquinas</span></td>
            <td>Pública. Es un <span className="ruta">Navigate</span>.</td>
          </tr>
          <tr>
            <td className="ruta">*</td>
            <td>Texto «Page not found», con la barra</td>
            <td>Entra al layout. Esta ruta comodín no pasa por RequireAuth.</td>
          </tr>
        </tbody>
      </table>

      <h3>Cómo api.js elige la base URL</h3>
      <p>
        <span className="ruta">REACT_APP_API_BASE_URL</span>, si viene en el build, es la base. Si no viene, <span className="ruta">api.js</span> elige así:
      </p>
      <ol>
        <li>En <span className="ruta">localhost</span> o <span className="ruta">127.0.0.1</span>, o con <span className="ruta">REACT_APP_USE_DEV_BACKEND=true</span>, usa <span className="ruta">origen/api</span>.</li>
        <li>En <span className="ruta">production-control.vercel.app</span>, y en cualquier host <span className="ruta">*.vercel.app</span>, usa la URL pública declarada en <span className="ruta">PUBLIC_API_BASE_URL</span>. Vercel sirve el React; una llamada a <span className="ruta">/api</span> en ese mismo host cae en <span className="ruta">index.html</span>.</li>
        <li>En una IP de la red o en el gateway, usa otra vez <span className="ruta">origen/api</span>.</li>
      </ol>
      <p>
        <span className="ruta">apiFetch</span> agrega <span className="ruta">ngrok-skip-browser-warning</span> y, si hay token en <span className="ruta">auth:token</span> y la llamada no trae ya <span className="ruta">Authorization</span>, el encabezado Bearer.
        <span className="ruta">fetchJsonCached</span> guarda los GET JSON 15 segundos y une las peticiones iguales que aún están en vuelo.
      </p>
      <p>
        La pantalla arma la URL como <span className="ruta">API_BASE_URL</span> más la ruta, y el cuerpo con <span className="ruta">JSON.stringify</span>.
        <span className="ruta"> apiFetch</span> añade <span className="ruta">ngrok-skip-browser-warning: true</span> y, si <span className="ruta">localStorage</span> tiene <span className="ruta">auth:token</span>, <span className="ruta">Authorization: Bearer</span>.
      </p>
      <p>Alta de sesión en <span className="ruta">pages/NuevaMinuta.js</span>:</p>
      <pre className="plano">{`POST \${API_BASE_URL}/sesiones-trabajo
Content-Type: application/json
ngrok-skip-browser-warning: true
Authorization: Bearer <token>   si hay auth:token

{
  "trabajador": "<uuid del trabajador elegido>",
  "maquina": "<uuid de la máquina>",
  "desdeTablet": true
}`}</pre>
      <p>
        Si la respuesta trae <span className="ruta">id</span>, la pantalla asigna el paso con otro POST a <span className="ruta">/sesion-trabajo-pasos</span> y vuelve a leer la sesión activa de la máquina.
        El puesto o la ESP32 llama <span className="ruta">POST /api/sesiones-trabajo?esp32=true</span> directo, sin <span className="ruta">apiFetch</span>.
      </p>

      <h3>Contextos</h3>
      <table className="manual-tabla">
        <thead>
          <tr>
            <th>Contexto</th>
            <th>Qué comparte</th>
            <th>Recurso</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="ruta">AuthContext</td>
            <td>Token, si hay sesión y si sigue comprobando. Login y salida. Al arrancar valida el token guardado.</td>
            <td><span className="ruta">POST /auth/login</span> y <span className="ruta">GET /auth/validate</span></td>
          </tr>
          <tr>
            <td className="ruta">AreasContext</td>
            <td>Lista de áreas para selectores y filtros del tablero. La carga cuando la lista está vacía.</td>
            <td><span className="ruta">GET /areas</span></td>
          </tr>
          <tr>
            <td className="ruta">AspectRatioContext</td>
            <td>Clasifica la ventana en 16:9, 16:10 u otra medida. Lo usa el tablero de <span className="ruta">/dashboard2</span>.</td>
            <td>Solo el tamaño de la ventana.</td>
          </tr>
        </tbody>
      </table>
      <p>
        <span className="ruta">ExpandContext</span> vive dentro de cada tarjeta del tablero. Abre y cierra esa tarjeta. No envuelve la aplicación.
      </p>

      <h3>Qué página consume qué recurso</h3>
      <table className="manual-tabla">
        <thead>
          <tr>
            <th>Página</th>
            <th>Recursos</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><span className="ruta">/</span> Nueva minuta</td>
            <td><span className="ruta">/sesiones-trabajo</span>, <span className="ruta">/sesion-trabajo-pasos</span>, <span className="ruta">/maquinas</span>, <span className="ruta">/minutas</span>, <span className="ruta">/estados-trabajador</span>, <span className="ruta">/estados-maquina</span></td>
          </tr>
          <tr>
            <td><span className="ruta">/login</span></td>
            <td><span className="ruta">/auth/login</span>, a través de AuthContext</td>
          </tr>
          <tr>
            <td><span className="ruta">/documentacion</span> y <span className="ruta">/documentacion/docker</span></td>
            <td>Ninguno. El texto está en el propio front.</td>
          </tr>
          <tr>
            <td><span className="ruta">/dashboard/*</span></td>
            <td><span className="ruta">/indicadores</span>, <span className="ruta">/produccion</span>, <span className="ruta">/alertas</span> y las áreas del contexto</td>
          </tr>
          <tr>
            <td><span className="ruta">/dashboard2</span></td>
            <td><span className="ruta">/produccion</span>, <span className="ruta">/indicadores</span> y <span className="ruta">/alertas</span></td>
          </tr>
          <tr>
            <td><span className="ruta">/alertas</span></td>
            <td><span className="ruta">/alertas</span> y <span className="ruta">/alertas/umbrales</span>. El selector de persona usa <span className="ruta">/trabajadores/buscar</span>.</td>
          </tr>
          <tr>
            <td><span className="ruta">/sesiones</span></td>
            <td><span className="ruta">GET /sesiones-trabajo/actuales</span></td>
          </tr>
          <tr>
            <td><span className="ruta">/sesion/:id</span></td>
            <td><span className="ruta">/sesiones-trabajo/:id</span>, su orden, <span className="ruta">/registro-minuto/sesion/:id/ultimos</span>, estados de máquina y de trabajador</td>
          </tr>
          <tr>
            <td><span className="ruta">/ordenes</span> y <span className="ruta">/ordenes/:id</span></td>
            <td><span className="ruta">/ordenes</span> y <span className="ruta">/ordenes/:id/detalle</span></td>
          </tr>
          <tr>
            <td><span className="ruta">/personas</span></td>
            <td><span className="ruta">/trabajadores</span></td>
          </tr>
          <tr>
            <td><span className="ruta">/maquinas</span></td>
            <td><span className="ruta">/maquinas</span></td>
          </tr>
          <tr>
            <td><span className="ruta">/funciones/wifi-qr</span></td>
            <td>Ninguno del API.</td>
          </tr>
        </tbody>
      </table>
      <Pie />
    </>
  );
}

function Seguridad() {
  return (
    <>
      <h2>Seguridad</h2>
      <p>
        El segmento de seguridad son dos piezas que no se sustituyen. El API decide si una petición entra.
        El front decide si una pantalla se muestra. Un token válido en el navegador no abre una ruta marcada
        <span className="ruta"> @Public()</span>, y una pantalla protegida no se salta porque el API esté arriba.
      </p>

      <h3>Dónde está construido</h3>
      <table className="manual-ficha">
        <tbody>
          <tr>
            <th>Módulo</th>
            <td><span className="ruta">Back/db-updater-ms/src/auth</span>. Controlador, servicio, entidad, estrategia JWT y decorador público.</td>
          </tr>
          <tr>
            <th>Guardia del API</th>
            <td><span className="ruta">JwtAuthGuard</span>, colgada en <span className="ruta">AppModule</span> con <span className="ruta">APP_GUARD</span>. Aplica a todos los controladores.</td>
          </tr>
          <tr>
            <th>Pantallas</th>
            <td><span className="ruta">src/context/AuthContext.js</span>, <span className="ruta">src/components/RequireAuth.js</span> y el encabezado que arma <span className="ruta">src/api.js</span>.</td>
          </tr>
          <tr>
            <th>Borde HTTP</th>
            <td>CORS y <span className="ruta">ValidationPipe</span> en <span className="ruta">src/main.ts</span>.</td>
          </tr>
          <tr>
            <th>Tabla</th>
            <td><span className="ruta">auth_user</span>. La clave no se guarda en claro: la columna es <span className="ruta">passwordHash</span>.</td>
          </tr>
        </tbody>
      </table>

      <h3>Capas del módulo</h3>
      <table className="manual-capas">
        <tbody>
          <tr>
            <td><strong>AuthController</strong><br />POST /auth/login<br />GET /auth/validate</td>
            <td className="flecha">→</td>
            <td><strong>AuthService</strong><br />bcrypt y firma JWT</td>
            <td className="flecha">→</td>
            <td><strong>Repository</strong><br />AuthUser</td>
            <td className="flecha">→</td>
            <td><strong>auth_user</strong><br />PostgreSQL</td>
          </tr>
        </tbody>
      </table>
      <p>
        Al lado del servicio está <span className="ruta">JwtStrategy</span> (Passport). La guardia global la usa para leer
        el Bearer y rechazar un token vencido. <span className="ruta">ignoreExpiration</span> está en falso.
        El decorador <span className="ruta">@Public()</span> solo marca metadata: la guardia lo consulta y, si está, no pide token.
      </p>

      <h3>Cómo entra una sesión de persona</h3>
      <pre className="plano">{`Pantalla /login
    |  POST /api/auth/login   { username, password }
    v
AuthController  (@Public, no exige token para entrar)
    |
    v
AuthService.login
    |  busca auth_user activo
    |  bcrypt.compare(clave, passwordHash)
    |  jwt.sign({ sub, username, name })
    v
{ access_token, token_type: Bearer, expires_in, user }
    |
    v
AuthContext guarda el token en localStorage, clave auth:token
    |
    v
RequireAuth deja pasar la ruta
apiFetch agrega Authorization: Bearer en las llamadas siguientes`}</pre>
      <table className="manual-tabla">
        <thead>
          <tr>
            <th>Dato</th>
            <th>De dónde sale</th>
            <th>Qué hace si no está</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="ruta">JWT_SECRET</td>
            <td>Firma en <span className="ruta">AuthService</span> y verificación en <span className="ruta">JwtStrategy</span>. Las dos leen la misma variable.</td>
            <td>El proceso usa un secreto de desarrollo escrito en el código. En un despliegue real la variable tiene que existir.</td>
          </tr>
          <tr>
            <td className="ruta">JWT_EXPIRES_IN</td>
            <td>Caducidad del token.</td>
            <td>Ocho horas.</td>
          </tr>
          <tr>
            <td className="ruta">BCRYPT_SALT_ROUNDS</td>
            <td>Coste del hash al crear el usuario.</td>
            <td>12 rondas.</td>
          </tr>
          <tr>
            <td className="ruta">ADMIN_USERNAME</td>
            <td rowSpan={2}>Al arrancar, <span className="ruta">onModuleInit</span> crea el usuario solo si las dos variables existen y ese nombre todavía no está en <span className="ruta">auth_user</span>.</td>
            <td rowSpan={2}>No crea nadie. Si el usuario ya existe, no cambia la clave.</td>
          </tr>
          <tr>
            <td className="ruta">ADMIN_PASSWORD</td>
          </tr>
          <tr>
            <td className="ruta">ADMIN_NAME</td>
            <td>Nombre visible del usuario sembrado.</td>
            <td>Administrador.</td>
          </tr>
        </tbody>
      </table>
      <p>
        El cuerpo de login exige <span className="ruta">username</span> (texto) y <span className="ruta">password</span> (texto, mínimo 3 caracteres).
        Si la persona no existe, está inactiva o la clave no coincide, la respuesta es 401 con «Credenciales inválidas».
        La respuesta de éxito no incluye la clave ni el hash. El payload del token lleva <span className="ruta">sub</span>, <span className="ruta">username</span> y <span className="ruta">name</span>.
        No hay roles ni permisos: un token vigente abre cualquier ruta que no sea pública.
      </p>

      <h3>Guardia del API</h3>
      <p>
        <span className="ruta">JwtAuthGuard</span> mira el método y la clase. Si alguno tiene <span className="ruta">@Public()</span>, la petición sigue.
        Si no, Passport saca el JWT del encabezado <span className="ruta">Authorization: Bearer</span>. Un token ausente, mal firmado o vencido no entra.
        La estrategia no vuelve a leer la tabla: confía en la firma y en la caducidad.
      </p>
      <p>
        <span className="ruta">GET /auth/validate</span> es público a propósito. Sirve para que el front pregunte si el token sigue firme.
        Acepta el Bearer o, si no viene, el query <span className="ruta">token</span>. Sin token responde <span className="ruta">{`{ valid: false }`}</span>.
        Con token válido responde <span className="ruta">valid</span>, el usuario, <span className="ruta">iat</span> y <span className="ruta">exp</span>.
        El comentario del controlador lo deja explícito: validar no protege el resto de las rutas. Eso lo hace la guardia global.
      </p>
      <p>
        Las rutas públicas son las del puesto y la ESP32 (alta de sesión, registro por minuto, lecturas marcadas en cada ficha).
        El catálogo está en <Link to="/documentacion/servicios">Servicios</Link>, columna Acceso.
      </p>

      <h3>Guarda de las pantallas</h3>
      <p>
        <span className="ruta">AuthProvider</span> envuelve la aplicación. Al cargar lee <span className="ruta">auth:token</span> y llama a
        <span className="ruta"> GET /auth/validate</span>. <span className="ruta">RequireAuth</span> espera ese chequeo, muestra «Verificando sesión...»
        y, si no hay sesión, manda a <span className="ruta">/login</span> guardando la ruta de origen.
        Cada cambio de ruta protegida vuelve a validar el token.
      </p>
      <p>
        <span className="ruta">apiFetch</span> pone el Bearer solo si hay token y la llamada no trae ya un <span className="ruta">Authorization</span>.
        Cerrar sesión borra la clave del navegador. No hay revocación en el servidor: el token sigue siendo válido hasta <span className="ruta">exp</span>.
      </p>
      <table className="manual-tabla">
        <thead>
          <tr>
            <th>Ruta del front</th>
            <th>Guarda</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="ruta">/</td>
            <td>Pública. Nueva minuta.</td>
          </tr>
          <tr>
            <td className="ruta">/login</td>
            <td>Pública. Si ya hay sesión, entra al tablero.</td>
          </tr>
          <tr>
            <td className="ruta">/documentacion</td>
            <td>Pública. Índice del manual.</td>
          </tr>
          <tr>
            <td className="ruta">/documentacion/docker</td>
            <td>Pública. Capítulo Docker, dentro de <span className="ruta">/documentacion/*</span>.</td>
          </tr>
          <tr>
            <td>Tablero, órdenes, sesiones, alertas, personas, máquinas y el resto de <span className="ruta">App.js</span></td>
            <td><span className="ruta">RequireAuth</span>.</td>
          </tr>
        </tbody>
      </table>

      <h3>CORS y validación del cuerpo</h3>
      <p>
        CORS, en <span className="ruta">main.ts</span>, acepta el origen del front publicado, <span className="ruta">https://production-control.vercel.app</span>, más <span className="ruta">localhost:3000</span>,
        direcciones IPv4 privadas y dominios ngrok. Otro origen se rechaza. Las credenciales van permitidas.
        Los verbos admitidos son GET, POST, PUT, PATCH y DELETE.
      </p>
      <p>
        El <span className="ruta">ValidationPipe</span> global usa lista blanca y rechaza campos que el DTO no declara.
        Un cuerpo de login con propiedades de más no pasa.
      </p>
      <div className="nota">
        <strong>LÍMITE DEL SEGMENTO. </strong>
        No hay perfil de usuario, ni token de refresco, ni lista de tokens anulados. La salida del sistema es local.
        Las rutas <span className="ruta">@Public()</span> quedan abiertas para el dispositivo. El secreto de firma tiene que venir de
        <span className="ruta"> JWT_SECRET</span>.
      </div>
      <Pie />
    </>
  );
}

function Contenido() {
  const { "*": resto = "" } = useParams();
  const trozos = resto.split("/").filter(Boolean);
  const [capitulo, ficha] = trozos;

  if (!capitulo) return <Indice />;
  if (capitulo === "sistema") return <QueEsElSistema />;
  if (capitulo === "recorrido") return <Recorrido />;
  if (capitulo === "primera-vez") return <PrimeraVez />;
  if (capitulo === "glosario") return <Glosario />;
  if (capitulo === "despliegue") return <Despliegue />;
  if (capitulo === "docker") return <DockerGuia />;
  if (capitulo === "front") return <Front />;
  if (capitulo === "backend") return <Backend />;
  if (capitulo === "modelo-datos") return <ModeloDatos />;
  if (capitulo === "limites") return <Limites />;
  if (capitulo === "seguridad") return <Seguridad />;
  if (capitulo === "servicios" && ficha) return <Ficha id={ficha} />;
  if (capitulo === "servicios") return <ListaServicios />;
  return <Indice />;
}

function migas(pathname) {
  const base = [{ href: "/documentacion", texto: "Índice" }];
  if (pathname.startsWith("/documentacion/sistema")) {
    return [...base, { texto: "Qué es el sistema" }];
  }
  if (pathname.startsWith("/documentacion/recorrido")) {
    return [...base, { texto: "Recorrido de una sesión" }];
  }
  if (pathname.startsWith("/documentacion/primera-vez")) {
    return [...base, { texto: "Cómo levantarlo la primera vez" }];
  }
  if (pathname.startsWith("/documentacion/glosario")) {
    return [...base, { texto: "Glosario" }];
  }
  if (pathname.startsWith("/documentacion/despliegue")) {
    return [...base, { texto: "Despliegue" }];
  }
  if (pathname.startsWith("/documentacion/docker")) {
    return [...base, { texto: "Docker" }];
  }
  if (pathname.startsWith("/documentacion/front")) {
    return [...base, { texto: "Front" }];
  }
  if (pathname.startsWith("/documentacion/backend")) {
    return [...base, { texto: "Backend" }];
  }
  if (pathname.startsWith("/documentacion/modelo-datos")) {
    return [...base, { texto: "Modelo de datos" }];
  }
  if (pathname.startsWith("/documentacion/limites")) {
    return [...base, { texto: "Límites y decisiones" }];
  }
  if (pathname.startsWith("/documentacion/seguridad")) {
    return [...base, { texto: "Seguridad" }];
  }
  if (pathname.startsWith("/documentacion/servicios/")) {
    const id = pathname.split("/")[3];
    const item = servicioPorId(id);
    return [
      ...base,
      { href: "/documentacion/servicios", texto: "Servicios" },
      { texto: item ? item.nombre : id },
    ];
  }
  if (pathname.startsWith("/documentacion/servicios")) {
    return [...base, { texto: "Servicios" }];
  }
  return [{ texto: "Índice" }];
}

const TEMA_GUARDADO = "documentacion-tema";

function seccionesDeRuta(pathname) {
  const abiertos = new Set();
  if (pathname.startsWith("/documentacion/backend")) abiertos.add("backend");
  if (pathname.startsWith("/documentacion/servicios")) {
    abiertos.add("servicios");
    const id = pathname.split("/")[3];
    const grupo = GRUPOS.find((item) => item.ids.includes(id));
    if (grupo) abiertos.add(grupo.id);
  }
  return abiertos;
}

function MenuDesplegable({ id, titulo, to, abierto, onToggle, anidado, activo, children }) {
  const navigate = useNavigate();
  const visible = abierto.has(id);

  const alClick = () => {
    onToggle(id);
    if (to && !visible) navigate(to);
  };

  return (
    <li className={anidado ? "manual-anidado" : undefined}>
      <button
        type="button"
        className={`manual-fila${anidado ? " manual-fila-grupo" : ""}${activo ? " activo" : ""}`}
        aria-expanded={visible}
        onClick={alClick}
      >
        <span className="manual-chevron" aria-hidden="true">{visible ? "▾" : "▸"}</span>
        {titulo}
      </button>
      {visible ? children : null}
    </li>
  );
}

export default function Documentacion() {
  const location = useLocation();
  const [abierto, setAbierto] = useState(() => seccionesDeRuta(window.location.pathname));
  const [oscuro, setOscuro] = useState(() => {
    try {
      return localStorage.getItem(TEMA_GUARDADO) === "oscuro";
    } catch {
      return false;
    }
  });

  const alternarTema = () => {
    setOscuro((actual) => {
      const siguiente = !actual;
      try {
        localStorage.setItem(TEMA_GUARDADO, siguiente ? "oscuro" : "claro");
      } catch {
        /* el manual sigue usable si el navegador bloquea el almacenamiento */
      }
      return siguiente;
    });
  };

  useEffect(() => {
    document.title = "Manual técnico — Production Control";
  }, []);

  useEffect(() => {
    setAbierto((previo) => {
      const extra = seccionesDeRuta(location.pathname);
      if ([...extra].every((id) => previo.has(id))) return previo;
      return new Set([...previo, ...extra]);
    });
  }, [location.pathname]);

  const alternarMenu = (id) => {
    setAbierto((previo) => {
      const siguiente = new Set(previo);
      if (siguiente.has(id)) siguiente.delete(id);
      else siguiente.add(id);
      return siguiente;
    });
  };

  useEffect(() => {
    if (location.hash) {
      const destino = document.getElementById(location.hash.slice(1));
      if (destino) {
        destino.scrollIntoView();
        return;
      }
    }
    window.scrollTo(0, 0);
  }, [location.pathname, location.hash]);

  const camino = migas(location.pathname);

  return (
    <div className={oscuro ? "manual oscuro" : "manual"}>
      <header className="manual-barra">
        <img src={logoSmartIndustries} alt="Smart Industries" className="manual-logo" />
        <div className="manual-barra-texto">
          <h1>{MANUAL.titulo}</h1>
          <p>
            {MANUAL.codigo} · Rev. {MANUAL.revision} · {MANUAL.fecha} · Ruta /documentacion
          </p>
        </div>
        <div className="manual-acciones">
          <button
            type="button"
            className="manual-tema"
            onClick={alternarTema}
            aria-pressed={oscuro}
          >
            {oscuro ? "Tema claro" : "Tema oscuro"}
          </button>
          <Link className="manual-volver" to="/login">Volver al sistema</Link>
        </div>
      </header>
      <div className="manual-marco">
        <nav className="manual-indice" aria-label="Índice del manual">
          <h2>Contenido</h2>
          <ol>
            <li><NavLink to="/documentacion" end className={claseNav}>Índice</NavLink></li>
            <li><NavLink to="/documentacion/sistema" className={claseNav}>Qué es el sistema</NavLink></li>
            <li><NavLink to="/documentacion/recorrido" className={claseNav}>Recorrido</NavLink></li>
            <li><NavLink to="/documentacion/primera-vez" className={claseNav}>Primera vez</NavLink></li>
            <li><NavLink to="/documentacion/glosario" className={claseNav}>Glosario</NavLink></li>
            <li><NavLink to="/documentacion/despliegue" className={claseNav}>Despliegue</NavLink></li>
            <li><NavLink to="/documentacion/docker" className={claseNav}>Docker</NavLink></li>
            <li><NavLink to="/documentacion/front" className={claseNav}>Front</NavLink></li>
            <li><NavLink to="/documentacion/seguridad" className={claseNav}>Seguridad</NavLink></li>
            <MenuDesplegable
              id="backend"
              titulo="Backend"
              to="/documentacion/backend"
              abierto={abierto}
              onToggle={alternarMenu}
              activo={location.pathname.startsWith("/documentacion/backend")}
            >
              <ul className="manual-sub">
                <li><Link to="/documentacion/backend#controlador">Controlador</Link></li>
                <li><Link to="/documentacion/backend#servicio">Servicio</Link></li>
                <li><Link to="/documentacion/backend#repositorio">Repositorio</Link></li>
                <li><Link to="/documentacion/backend#dependencias">Dependencias</Link></li>
              </ul>
            </MenuDesplegable>
            <li><NavLink to="/documentacion/modelo-datos" className={claseNav}>Modelo de datos</NavLink></li>
            <MenuDesplegable
              id="servicios"
              titulo="Servicios"
              to="/documentacion/servicios"
              abierto={abierto}
              onToggle={alternarMenu}
              activo={location.pathname === "/documentacion/servicios"}
            >
              <ul className="manual-sub manual-grupos">
                {GRUPOS.map((grupo) => (
                  <MenuDesplegable
                    key={grupo.id}
                    id={grupo.id}
                    titulo={grupo.titulo}
                    abierto={abierto}
                    onToggle={alternarMenu}
                    anidado
                    activo={grupo.ids.some((id) => location.pathname === `/documentacion/servicios/${id}`)}
                  >
                    <ul className="manual-sub">
                      {grupo.ids.map((id) => (
                        <li key={id}>
                          <NavLink to={`/documentacion/servicios/${id}`} className={claseNav}>
                            {servicioPorId(id).nombre}
                          </NavLink>
                        </li>
                      ))}
                    </ul>
                  </MenuDesplegable>
                ))}
              </ul>
            </MenuDesplegable>
            <li><NavLink to="/documentacion/limites" className={claseNav}>Límites</NavLink></li>
          </ol>
        </nav>
        <article className="manual-hoja">
          <p className="manual-migas">
            {camino.map((paso, indice) => (
              <span key={paso.texto}>
                {indice > 0 ? " / " : null}
                {paso.href ? <Link to={paso.href}>{paso.texto}</Link> : paso.texto}
              </span>
            ))}
          </p>
          <Contenido />
        </article>
      </div>
    </div>
  );
}
