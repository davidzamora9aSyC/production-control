import { Link } from "react-router-dom";

function Pie() {
  return (
    <p className="manual-pie">
      Revisión de operación del 9 de septiembre de 2026, incorporada al manual.
      Las rutas del API en las fichas van sin <span className="ruta">/api</span>; por el gateway se consumen como <span className="ruta">/api/&lt;ruta&gt;</span>.
    </p>
  );
}

export default function DockerGuia() {
  return (
    <>
      <h2>Docker</h2>
      <p>
        El stack tiene cuatro piezas. El navegador entra por el gateway. El gateway manda <span className="ruta">/</span> al front
        y <span className="ruta">/api</span> al backend, quitando ese prefijo. El backend habla con PostgreSQL.
        Los servicios con sufijo <span className="ruta">-dev</span> repiten el mismo dibujo con otros puertos, otros nombres y otra base,
        para no tocar el entorno principal.
      </p>

      <h3>Dos copias posibles</h3>
      <p>
        Esta copia del repositorio está en el escritorio de Distrecol, carpeta <span className="ruta">Logistics</span>.
        La revisión del 9 de septiembre de 2026 encontró el Compose activo <span className="ruta">db-updater-ms</span> levantado desde
        <span className="ruta"> C:\Users\pc\Documents\Back\db-updater-ms</span>, no desde la carpeta del repo.
        El script <span className="ruta">Back/db-updater-ms/start-docker-compose.ps1</span> sigue apuntando por defecto a
        <span className="ruta"> C:\Users\pc\Documents\Back\db-updater-ms\docker-compose.yml</span>.
      </p>
      <div className="nota">
        <strong>ANTES DE TOCAR DOCKER. </strong>
        Confirmar desde qué ruta está corriendo el proyecto. Editar archivos aquí no cambia un Compose que se levantó en la otra copia.
      </div>
      <pre className="plano">{`docker compose ls
docker ps`}</pre>

      <h3>Las cuatro piezas</h3>
      <table className="manual-tabla">
        <thead>
          <tr>
            <th>Servicio</th>
            <th>Tecnología</th>
            <th>Responsabilidad</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="ruta">gateway</td>
            <td>Nginx</td>
            <td>Entrada HTTP. Decide si la petición va al front o al backend.</td>
          </tr>
          <tr>
            <td className="ruta">frontend</td>
            <td>React compilado y Nginx</td>
            <td>Sirve la aplicación estática.</td>
          </tr>
          <tr>
            <td className="ruta">backend</td>
            <td>NestJS / Node</td>
            <td>API, reglas, autenticación y acceso a datos.</td>
          </tr>
          <tr>
            <td className="ruta">postgres</td>
            <td>PostgreSQL 16 Alpine</td>
            <td>Base del entorno principal, <span className="ruta">distrecoldb</span>.</td>
          </tr>
        </tbody>
      </table>
      <pre className="plano">{`Navegador
  -> http://localhost:3000
    -> gateway
      -> /       -> frontend:80
      -> /api/*  -> backend:3001
        -> postgres:5432

http://localhost:3000/api/auth/login
  llega al backend como /auth/login`}</pre>
      <p>
        <span className="ruta">Back/db-updater-ms/src</span> no es una carpeta sobrante. Es el TypeScript de NestJS.
        <span className="ruta"> nest build</span> lo compila a <span className="ruta">dist</span> y el contenedor ejecuta <span className="ruta">node dist/main</span>. No se borra.
        El detalle de la base y de la guardia JWT está en <Link to="/documentacion/despliegue">Despliegue</Link> y en <Link to="/documentacion/seguridad">Seguridad</Link>.
      </p>

      <h3>Entorno principal</h3>
      <p>
        Archivo <span className="ruta">Back/db-updater-ms/docker-compose.yml</span>. Es el entorno estable. Si hay gente usando el sistema, un túnel o una prueba en curso, no se reconstruye, no se reinicia y no se borra sin confirmar el impacto.
      </p>
      <table className="manual-tabla">
        <thead>
          <tr>
            <th>Servicio</th>
            <th>Puerto en el host</th>
            <th>Puerto interno</th>
            <th>Notas</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="ruta">gateway</td>
            <td>3000</td>
            <td>80</td>
            <td>Entrada desde el navegador o el túnel.</td>
          </tr>
          <tr>
            <td className="ruta">frontend</td>
            <td>No publicado</td>
            <td>80</td>
            <td>Solo lo ve el gateway, dentro de Docker.</td>
          </tr>
          <tr>
            <td className="ruta">backend</td>
            <td>3001</td>
            <td>3001</td>
            <td>API directa, o por el gateway con <span className="ruta">/api</span>.</td>
          </tr>
          <tr>
            <td className="ruta">postgres</td>
            <td>5432</td>
            <td>5432</td>
            <td>Base <span className="ruta">distrecoldb</span>.</td>
          </tr>
        </tbody>
      </table>
      <p>
        El volumen del compose se llama <span className="ruta">pgdata</span>. Docker le antepone el nombre del proyecto.
        Si ese proyecto es <span className="ruta">db-updater-ms</span>, el volumen en el motor es <span className="ruta">db-updater-ms_pgdata</span>. Ahí viven los datos.
      </p>

      <h3>Entorno de desarrollo</h3>
      <p>
        Archivo <span className="ruta">Back/db-updater-ms/docker-compose.dev.yml</span>. Sirve para probar sin tocar
        <span className="ruta"> gateway</span>, <span className="ruta">frontend</span>, <span className="ruta">backend</span> ni <span className="ruta">postgres</span>.
      </p>
      <table className="manual-tabla">
        <thead>
          <tr>
            <th>Servicio</th>
            <th>Puerto en el host</th>
            <th>Puerto interno</th>
            <th>Notas</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="ruta">gateway-dev</td>
            <td>3100</td>
            <td>80</td>
            <td>Entrada del entorno de desarrollo.</td>
          </tr>
          <tr>
            <td className="ruta">frontend-dev</td>
            <td>No publicado</td>
            <td>80</td>
            <td>Solo lo ve <span className="ruta">gateway-dev</span>.</td>
          </tr>
          <tr>
            <td className="ruta">backend-dev</td>
            <td>3101</td>
            <td>3001</td>
            <td>API de desarrollo, directa o por el gateway con <span className="ruta">/api</span>.</td>
          </tr>
          <tr>
            <td className="ruta">postgres-dev</td>
            <td>5433</td>
            <td>5432</td>
            <td>Base <span className="ruta">distrecoldb_dev</span>. Volumen <span className="ruta">pgdata_dev</span> (<span className="ruta">db-updater-ms_pgdata_dev</span> si el proyecto se llama así).</td>
          </tr>
        </tbody>
      </table>
      <p>
        Ese compose no monta el código ni corre <span className="ruta">npm start</span> en modo watch. También construye imágenes.
        Después de cambiar código hay que reconstruir:
      </p>
      <pre className="plano">{`docker compose -f docker-compose.dev.yml up -d --build`}</pre>
      <p>
        El front de desarrollo se construye con <span className="ruta">REACT_APP_USE_DEV_BACKEND=true</span>.
      </p>

      <h3>Para qué está el gateway</h3>
      <p>
        Desde fuera hay una sola entrada, <span className="ruta">http://localhost:3000</span>. Nginx parte el tráfico:
        <span className="ruta"> /</span> al front y <span className="ruta">/api/</span> al backend.
        El front llama a la API con rutas relativas <span className="ruta">/api/...</span>, el front no se publica en un puerto propio,
        y un túnel o un dominio solo tiene que apuntar al gateway.
      </p>

      <h3>Cómo se construyen las imágenes</h3>
      <table className="manual-tabla">
        <thead>
          <tr>
            <th>Imagen</th>
            <th>Dockerfile</th>
            <th>Proceso</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Backend</td>
            <td className="ruta">Back/db-updater-ms/Dockerfile</td>
            <td><span className="ruta">node:20-alpine</span> copia el código, instala, ejecuta <span className="ruta">npm run build</span> y la etapa final corre <span className="ruta">node dist/main</span> tras instalar solo producción.</td>
          </tr>
          <tr>
            <td>Frontend</td>
            <td className="ruta">front/production-control/Dockerfile</td>
            <td><span className="ruta">node:20-alpine</span> hace <span className="ruta">npm ci</span> y <span className="ruta">npm run build</span>. <span className="ruta">nginx:1.27-alpine</span> sirve <span className="ruta">build/</span> desde <span className="ruta">/usr/share/nginx/html</span>.</td>
          </tr>
        </tbody>
      </table>

      <h3>Mapa de URLs</h3>
      <table className="manual-tabla">
        <thead>
          <tr>
            <th>URL</th>
            <th>Llega a</th>
            <th>Uso</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="ruta">http://localhost:3000</td>
            <td>gateway → frontend</td>
            <td>Entorno principal. El manual está en <span className="ruta">/documentacion</span>.</td>
          </tr>
          <tr>
            <td className="ruta">http://localhost:3000/api/...</td>
            <td>gateway → backend</td>
            <td>API principal a través del gateway.</td>
          </tr>
          <tr>
            <td className="ruta">http://localhost:3001</td>
            <td>backend directo</td>
            <td>API principal sin gateway. Swagger en <span className="ruta">/docs</span>.</td>
          </tr>
          <tr>
            <td className="ruta">localhost:5432</td>
            <td>postgres</td>
            <td>Base principal.</td>
          </tr>
          <tr>
            <td className="ruta">http://localhost:3100</td>
            <td>gateway-dev → frontend-dev</td>
            <td>Entorno de desarrollo.</td>
          </tr>
          <tr>
            <td className="ruta">http://localhost:3100/api/...</td>
            <td>gateway-dev → backend-dev</td>
            <td>API de desarrollo por el gateway.</td>
          </tr>
          <tr>
            <td className="ruta">http://localhost:3101</td>
            <td>backend-dev directo</td>
            <td>API de desarrollo sin gateway.</td>
          </tr>
          <tr>
            <td className="ruta">localhost:5433</td>
            <td>postgres-dev</td>
            <td>Base de desarrollo.</td>
          </tr>
        </tbody>
      </table>

      <h3>Reglas para no mezclar entornos</h3>
      <ul>
        <li>Antes de editar, confirmar la ruta activa con <span className="ruta">docker compose ls</span>.</li>
        <li>Antes de cambiar contenedores, decidir si el cambio es del principal o del de desarrollo.</li>
        <li>Para pruebas, preferir <span className="ruta">gateway-dev</span>, <span className="ruta">backend-dev</span>, <span className="ruta">frontend-dev</span> y <span className="ruta">postgres-dev</span>.</li>
        <li>No borrar volúmenes sin autorización. Ahí están los datos.</li>
        <li>No asumir que un cambio en esta copia mueve el Docker activo si Compose se levantó desde <span className="ruta">C:\Users\pc\Documents\Back\db-updater-ms</span>.</li>
        <li>No subir <span className="ruta">.env</span>, <span className="ruta">node_modules</span>, <span className="ruta">dist</span> ni <span className="ruta">build</span>.</li>
      </ul>

      <h3>Inspección</h3>
      <pre className="plano">{`docker ps
docker compose ls
docker logs backend
docker logs backend-dev

docker compose ps
docker compose -f docker-compose.yml -f docker-compose.dev.yml ps

docker compose -f docker-compose.yml up -d
docker compose -f docker-compose.dev.yml up -d
docker compose -f docker-compose.dev.yml up -d --build`}</pre>
      <p>
        Los tres últimos se ejecutan desde la carpeta del backend cuyo Compose se quiere mover.
      </p>
      <Pie />
    </>
  );
}
