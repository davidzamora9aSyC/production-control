# Production Control — frontend

SPA de React 18 (Create React App) del control de producción. Habla con el microservicio `db-updater-ms` por el prefijo `/api`.

## Arranque

```bash
npm install
npm start
```

El servidor de desarrollo queda en [http://localhost:3000](http://localhost:3000).

## Manual técnico

Al levantar el front, el manual del sistema está en una ruta propia, sin login:

[http://localhost:3000/documentacion](http://localhost:3000/documentacion)

También se abre desde el enlace «Manual técnico del sistema» en la pantalla de ingreso, y desde Funciones cuando hay sesión.

El manual tiene tres partes:

1. Despliegue y arquitectura, incluida la ubicación de PostgreSQL.
2. Construcción del backend: controlador (endpoints), servicio y repositorio.
3. Ficha de cada servicio de dominio dentro del microservicio `db-updater-ms`.

El código del manual está en `src/pages/Documentacion.js` y `src/documentacion/`.

## Dónde está cada cosa

| Ruta | Papel |
|---|---|
| `src/App.js` | Rutas. `/documentacion` es pública. El resto operativo pide JWT. |
| `src/api.js` | Base de la API, token y caché de GET. |
| `src/pages` | Pantallas. |
| `src/components` | Piezas de interfaz. |
| `nginx.conf` | El build publicado devuelve `index.html` para cualquier ruta, incluida `/documentacion`. |
| `Dockerfile` | Build de producción y nginx. |

En local y detrás del gateway la API es `/api` del mismo origen. El build de producción usa `REACT_APP_API_BASE_URL` de `.env.production`.

## Scripts

| Comando | Efecto |
|---|---|
| `npm start` | Desarrollo en el puerto 3000. |
| `npm run start:lan` | Igual, escuchando en `0.0.0.0`. |
| `npm run build` | Salida en `build/`. |
| `npm test` | Pruebas. |
