const U = "11111111-1111-4111-8111-111111111111";
const U2 = "22222222-2222-4222-8222-222222222222";
const U3 = "33333333-3333-4333-8333-333333333333";

export const EJEMPLOS = {
  "POST /evento": {
    peticion: `{
  "estacion": "estacion-1",
  "id": "tolva",
  "intervalo": 100,
  "distancia": 12.5,
  "luz": 1
}`,
    minima: `{
  "estacion": "estacion-1",
  "id": "pedal",
  "intervalo": 100
}`,
    respuesta: `{ "guardado": 1 }`,
  },
  "POST /impacto": {
    peticion: `{
  "estacion": "estacion-1",
  "id": "stop"
}`,
    respuesta: `{ "guardado": 1 }`,
  },
  "POST /minuta": {
    peticion: `{
  "accion": "Terminar turno",
  "fecha": "2026-09-22T21:00:00.000Z",
  "proceso": "Corte",
  "trabajador": "${U}",
  "orden_produccion": "${U2}",
  "cantidad_piezas": 200,
  "meta": 240,
  "npt_min": 12
}`,
    minima: `{
  "accion": "Otra",
  "fecha": "2026-09-22T21:00:00.000Z",
  "proceso": "Corte"
}`,
    respuesta: `{ "guardado": 1 }`,
  },
  "POST /auth/login": {
    peticion: `{
  "username": "operador",
  "password": "clave-de-ejemplo"
}`,
    respuesta: `{
  "access_token": "<token>",
  "token_type": "Bearer",
  "expires_in": 28800,
  "user": { "username": "operador", "name": "Operador" }
}`,
  },
  "GET /auth/validate": {
    respuesta: `{
  "valid": true,
  "user": { "username": "operador", "name": "Operador" },
  "iat": 1700000000,
  "exp": 1700028800
}`,
  },
  "PUT /configuracion": {
    peticion: `{
  "minutosInactividadParaNPT": 5,
  "zonaHorariaCliente": "America/Bogota",
  "maxDescansosDiariosPorTrabajador": 6,
  "maxDuracionPausaMinutos": 30,
  "maxHorasSesionAbierta": 10
}`,
    minima: `{}`,
    respuesta: `{
  "id": "${U}",
  "minutosInactividadParaNPT": 5,
  "zonaHorariaCliente": "America/Bogota",
  "maxDescansosDiariosPorTrabajador": 6,
  "maxDuracionPausaMinutos": 30,
  "maxHorasSesionAbierta": 10
}`,
  },
  "POST /empresas": {
    peticion: `{ "nombre": "Acme S.A." }`,
    respuesta: `{ "id": "${U}", "nombre": "Acme S.A." }`,
  },
  "PUT /empresas/:id": {
    peticion: `{ "nombre": "Acme S.A." }`,
    minima: `{}`,
    respuesta: `{ "id": "${U}", "nombre": "Acme S.A." }`,
  },
  "POST /areas": {
    peticion: `{ "nombre": "Corte" }`,
    respuesta: `{ "id": "${U}", "nombre": "Corte" }`,
  },
  "PUT /areas/:id": {
    peticion: `{ "nombre": "Corte" }`,
    minima: `{}`,
    respuesta: `{ "id": "${U}", "nombre": "Corte" }`,
  },
  "POST /trabajadores": {
    peticion: `{
  "nombre": "Ana Pérez",
  "identificacion": "104567890",
  "grupo": "produccion",
  "turno": "mañana",
  "fechaInicio": "2026-09-22"
}`,
    respuesta: `{
  "mensaje": "Trabajador creado",
  "data": {
    "id": "${U}",
    "nombre": "Ana Pérez",
    "identificacion": "104567890",
    "grupo": "produccion",
    "turno": "mañana",
    "fechaInicio": "2026-09-22"
  }
}`,
  },
  "PUT /trabajadores/:id": {
    peticion: `{ "turno": "tarde" }`,
    minima: `{}`,
    respuesta: `{
  "mensaje": "Trabajador ${U} actualizado",
  "data": {
    "id": "${U}",
    "nombre": "Ana Pérez",
    "identificacion": "104567890",
    "grupo": "produccion",
    "turno": "tarde",
    "fechaInicio": "2026-09-22"
  }
}`,
  },
  "POST /maquinas": {
    peticion: `{
  "nombre": "Troqueladora 1",
  "codigo": "M-TRQ-01",
  "ubicacion": "Planta A",
  "fechaInstalacion": "2026-09-22",
  "tipo": "troqueladora",
  "areaId": "${U}",
  "observaciones": ""
}`,
    respuesta: `{
  "id": "${U2}",
  "nombre": "Troqueladora 1",
  "codigo": "M-TRQ-01",
  "ubicacion": "Planta A",
  "fechaInstalacion": "2026-09-22",
  "tipo": "troqueladora",
  "observaciones": "",
  "area": { "id": "${U}" }
}`,
  },
  "PUT /maquinas/:id": {
    peticion: `{ "ubicacion": "Planta B" }`,
    minima: `{}`,
    respuesta: `{
  "id": "${U2}",
  "nombre": "Troqueladora 1",
  "codigo": "M-TRQ-01",
  "ubicacion": "Planta B",
  "tipo": "troqueladora",
  "area": { "id": "${U}" }
}`,
  },
  "POST /ordenes": {
    peticion: `{
  "numero": "OP-2026-0001",
  "producto": "Banda transportadora",
  "cantidadAProducir": 1000,
  "fechaOrden": "2026-09-22T00:00:00.000Z",
  "fechaVencimiento": "2026-10-22T00:00:00.000Z",
  "pasos": [
    {
      "nombre": "Corte",
      "codigoInterno": "P-001",
      "cantidadRequerida": 1000,
      "numeroPaso": 1,
      "cantidadProducida": 0,
      "cantidadPedaleos": 0,
      "estado": "pendiente"
    }
  ]
}`,
    minima: `{
  "numero": "OP-2026-0001",
  "producto": "Banda transportadora",
  "cantidadAProducir": 1000,
  "fechaOrden": "2026-09-22T00:00:00.000Z",
  "fechaVencimiento": "2026-10-22T00:00:00.000Z",
  "pasos": [
    {
      "nombre": "Corte",
      "codigoInterno": "P-001",
      "cantidadRequerida": 1000,
      "numeroPaso": 1
    }
  ]
}`,
    respuesta: `{
  "id": "${U}",
  "numero": "OP-2026-0001",
  "producto": "Banda transportadora",
  "cantidadAProducir": 1000,
  "fechaOrden": "2026-09-22T00:00:00.000Z",
  "fechaVencimiento": "2026-10-22T00:00:00.000Z",
  "estado": "pendiente"
}`,
    aviso: "El controlador devuelve la orden guardada. Los pasos se persisten, pero no vienen en este JSON. fechaOrden y fechaVencimiento están declarados como Date.",
  },
  "POST /pasos": {
    peticion: `{
  "nombre": "Corte",
  "orden": "${U}",
  "codigoInterno": "P-001",
  "cantidadRequerida": 100,
  "numeroPaso": 1
}`,
    respuesta: `{
  "id": "${U2}",
  "nombre": "Corte",
  "orden": { "id": "${U}" },
  "codigoInterno": "P-001",
  "cantidadRequerida": 100,
  "cantidadProducida": 0,
  "cantidadPedaleos": 0,
  "estado": "pendiente",
  "numeroPaso": 1
}`,
  },
  "PUT /pasos/:id": {
    peticion: `{ "cantidadProducida": 40 }`,
    minima: `{}`,
    respuesta: `{
  "id": "${U2}",
  "nombre": "Corte",
  "codigoInterno": "P-001",
  "cantidadRequerida": 100,
  "cantidadProducida": 40,
  "cantidadPedaleos": 0,
  "estado": "pendiente",
  "numeroPaso": 1
}`,
  },
  "PATCH /pasos/:id/finalizar": {
    respuesta: `{
  "id": "${U2}",
  "nombre": "Corte",
  "estado": "finalizado",
  "orden": { "id": "${U}" }
}`,
  },
  "POST /materiales-orden": {
    peticion: `{
  "orden": "${U}",
  "codigo": "MAT-001",
  "descripcion": "Acero inoxidable 2mm",
  "unidad": "kg",
  "cantidad": 100
}`,
    respuesta: `{
  "id": "${U2}",
  "orden": { "id": "${U}" },
  "codigo": "MAT-001",
  "descripcion": "Acero inoxidable 2mm",
  "unidad": "kg",
  "cantidad": 100
}`,
  },
  "PUT /materiales-orden/:id": {
    peticion: `{ "cantidad": 80 }`,
    minima: `{}`,
    respuesta: `{
  "id": "${U2}",
  "codigo": "MAT-001",
  "descripcion": "Acero inoxidable 2mm",
  "unidad": "kg",
  "cantidad": 80
}`,
  },
  "POST /minutas": {
    peticion: `{
  "recursoId": "${U}",
  "ordenId": "${U2}",
  "pasoId": "${U3}",
  "cantidad": 120,
  "pedalazos": 240,
  "observaciones": "Turno de la tarde"
}`,
    minima: `{
  "recursoId": "${U}",
  "ordenId": "${U2}",
  "pasoId": "${U3}",
  "cantidad": 120,
  "pedalazos": 240
}`,
    respuesta: `{
  "id": "${U}",
  "recursoId": "${U}",
  "ordenId": "${U2}",
  "pasoId": "${U3}",
  "cantidad": 120,
  "pedalazos": 240,
  "observaciones": "Turno de la tarde"
}`,
  },
  "POST /sesiones-trabajo": {
    peticion: `{
  "trabajador": "${U}",
  "maquina": "${U2}",
  "desdeTablet": true
}`,
    minima: `{
  "trabajador": "${U}",
  "maquina": "${U2}"
}`,
    respuesta: `{
  "id": "${U3}",
  "trabajador": { "id": "${U}" },
  "maquina": { "id": "${U2}" },
  "areaIdSnapshot": "${U}",
  "fechaInicio": "2026-09-22T21:00:00.000-05:00",
  "fechaFin": null,
  "cantidadProducida": 0,
  "cantidadPedaleos": 0,
  "agregadoEnProduccion": false,
  "fuente": "tablet"
}`,
    aviso: "Sin desdeTablet, fuente queda null. Con el query esp32=true la respuesta es solo el id, en texto.",
  },
  "PUT /sesiones-trabajo/:id": {
    peticion: `{
  "fechaFin": true,
  "cantidadProducida": 120,
  "cantidadPedaleos": 300
}`,
    minima: `{}`,
    respuesta: `{
  "id": "${U3}",
  "cantidadProducida": 120,
  "cantidadPedaleos": 300,
  "fechaFin": "2026-09-22T22:00:00.000-05:00"
}`,
  },
  "POST /sesiones-trabajo/:id/finalizar": {
    respuesta: `{
  "id": "${U3}",
  "fechaInicio": "2026-09-22T21:00:00.000-05:00",
  "fechaFin": "2026-09-22T22:00:00.000-05:00",
  "cantidadProducida": 120,
  "cantidadPedaleos": 300,
  "fuente": null
}`,
  },
  "POST /sesiones-trabajo/finalizar-todas": {
    respuesta: `{
  "total": 1,
  "finalizadas": ["${U3}"],
  "noFinalizadas": []
}`,
  },
  "GET /sesiones-trabajo/actuales": {
    respuesta: `[
  {
    "id": "${U3}",
    "fechaInicio": "2026-09-22T21:00:00.000-05:00",
    "fechaFin": null,
    "estadoSesion": "produccion",
    "grupo": "troqueladora",
    "maquina": { "id": "${U2}", "nombre": "Troqueladora 1" },
    "trabajador": { "id": "${U}", "nombre": "Ana Pérez" },
    "avgSpeed": 10,
    "avgSpeedSesion": 8,
    "velocidadActual": 12,
    "nptMin": 0,
    "nptPorInactividad": 0,
    "porcentajeNPT": 0,
    "defectos": 0,
    "produccionTotal": 120
  }
]`,
  },
  "GET /sesiones-trabajo/:id/serie-minuto": {
    respuesta: `[
  {
    "sesionTrabajoId": "${U3}",
    "minuto": "2026-09-22T21:30:00.000Z",
    "produccionTotal": 120,
    "defectos": 0,
    "porcentajeDefectos": 0,
    "avgSpeed": 10,
    "avgSpeedSesion": 8,
    "velocidadActual": 12,
    "nptMin": 0,
    "nptPorInactividad": 0,
    "porcentajeNPT": 0,
    "pausasCount": 0,
    "pausasMin": 0,
    "porcentajePausa": 0,
    "duracionSesionMin": 30,
    "actualizadoEn": "2026-09-22T21:30:10.000Z"
  }
]`,
  },
  "POST /sesion-trabajo-pasos": {
    peticion: `{
  "sesionTrabajo": "${U3}",
  "pasoOrden": "${U2}",
  "cantidadAsignada": 50,
  "porAdministrador": false,
  "desdeTablet": true
}`,
    minima: `{
  "sesionTrabajo": "${U3}",
  "pasoOrden": "${U2}"
}`,
    respuesta: `{
  "id": "${U}",
  "sesionTrabajo": { "id": "${U3}" },
  "pasoOrden": { "id": "${U2}" },
  "cantidadAsignada": 50,
  "cantidadProducida": 0,
  "cantidadPedaleos": 0,
  "fuente": "tablet",
  "finalizado": false,
  "finalizadoEn": null
}`,
  },
  "POST /sesion-trabajo-pasos/batch": {
    peticion: `[
  {
    "sesionTrabajo": "${U3}",
    "pasoOrden": "${U2}"
  }
]`,
    respuesta: `[
  {
    "id": "${U}",
    "sesionTrabajo": { "id": "${U3}" },
    "pasoOrden": { "id": "${U2}" },
    "cantidadProducida": 0,
    "cantidadPedaleos": 0,
    "finalizado": false
  }
]`,
  },
  "PUT /sesion-trabajo-pasos/:id": {
    peticion: `{
  "cantidadProducida": 30,
  "cantidadPedaleos": 60,
  "comentarioDefectuosas": "rebaba"
}`,
    minima: `{}`,
    respuesta: `{
  "id": "${U}",
  "cantidadAsignada": 50,
  "cantidadProducida": 30,
  "cantidadPedaleos": 60,
  "comentarioDefectuosas": "rebaba",
  "finalizado": false
}`,
  },
  "PUT /sesion-trabajo-pasos/batch": {
    peticion: `[
  {
    "id": "${U}",
    "data": { "cantidadProducida": 30 }
  }
]`,
    respuesta: `[
  {
    "id": "${U}",
    "cantidadProducida": 30,
    "finalizado": false
  }
]`,
  },
  "POST /sesion-trabajo-pasos/:id/finalizar": {
    respuesta: `{
  "id": "${U}",
  "finalizado": true,
  "finalizadoEn": "2026-09-22T22:00:00.000Z",
  "estado": "finalizada"
}`,
  },
  "POST /sesion-trabajo-pasos/finalizar-sesiones-terminadas": {
    respuesta: `{
  "total": 1,
  "finalizados": ["${U}"]
}`,
  },
  "POST /registro-minuto/acumular": {
    peticion: `{
  "maquina": "${U2}",
  "paso": "${U}",
  "tipo": "pieza",
  "minutoInicio": "2026-09-22T21:30:00.000Z"
}`,
    minima: `{
  "maquina": "${U2}",
  "paso": "${U}",
  "tipo": "pedal"
}`,
    respuesta: `{ "ok": true }`,
  },
  "POST /registro-minuto/guardar": {
    respuesta: `{ "ok": true }`,
  },
  "GET /registro-minuto/sesion/:id/ultimos": {
    respuesta: `[
  {
    "minutoInicio": "2026-09-22T21:30:00.000Z",
    "pedaleadas": 25,
    "piezasContadas": 20,
    "minutoInicioLocal": "2026-09-22T16:30:00-05:00"
  }
]`,
  },
  "POST /estados-sesion": {
    peticion: `{
  "sesionTrabajo": "${U3}",
  "estado": "produccion",
  "inicio": "2026-09-22T21:00:00.000Z",
  "fin": null
}`,
    minima: `{
  "sesionTrabajo": "${U3}",
  "estado": "inactivo",
  "inicio": "2026-09-22T21:00:00.000Z"
}`,
    respuesta: `{
  "id": "${U}",
  "sesionTrabajo": { "id": "${U3}" },
  "estado": "produccion",
  "inicio": "2026-09-22T21:00:00.000Z",
  "fin": null
}`,
    aviso: "inicio y fin están declarados como Date.",
  },
  "PUT /estados-sesion/:id": {
    peticion: `{ "fin": "2026-09-22T22:00:00.000Z" }`,
    minima: `{}`,
    respuesta: `{
  "id": "${U}",
  "estado": "produccion",
  "fin": "2026-09-22T22:00:00.000Z"
}`,
    aviso: "inicio y fin están declarados como Date.",
  },
  "POST /estados-trabajador": {
    peticion: `{
  "trabajador": "${U}",
  "descanso": true
}`,
    respuesta: `{
  "id": "${U2}",
  "trabajador": { "id": "${U}" },
  "descanso": true,
  "origen": "manual",
  "inicio": "2026-09-22T21:00:00.000Z",
  "fin": null
}`,
  },
  "PUT /estados-trabajador/:id": {
    peticion: `{ "fin": "2026-09-22T21:15:00.000Z" }`,
    minima: `{}`,
    respuesta: `{
  "id": "${U2}",
  "descanso": true,
  "fin": "2026-09-22T21:15:00.000Z"
}`,
  },
  "POST /estados-trabajador/trabajador/:id/finalizar-descanso": {
    respuesta: `{
  "id": "${U2}",
  "descanso": true,
  "fin": "2026-09-22T21:15:00.000Z"
}`,
  },
  "POST /estados-maquina": {
    peticion: `{
  "maquina": "${U2}",
  "mantenimiento": true
}`,
    respuesta: `{
  "id": "${U}",
  "maquina": { "id": "${U2}" },
  "mantenimiento": true,
  "inicio": "2026-09-22T21:00:00.000Z",
  "fin": null
}`,
  },
  "PUT /estados-maquina/:id": {
    peticion: `{ "fin": "2026-09-22T21:20:00.000Z" }`,
    minima: `{}`,
    respuesta: `{
  "id": "${U}",
  "mantenimiento": true,
  "fin": "2026-09-22T21:20:00.000Z"
}`,
  },
  "POST /estados-maquina/maquina/:id/finalizar-mantenimiento": {
    respuesta: `{
  "id": "${U}",
  "mantenimiento": true,
  "fin": "2026-09-22T21:20:00.000Z"
}`,
  },
  "PUT /alertas/umbrales": {
    peticion: `{
  "maxDescansosDiariosPorTrabajador": 6,
  "maxDuracionPausaMinutos": 30,
  "minutosInactividadParaNPT": 5
}`,
    minima: `{}`,
    respuesta: `{
  "maxDescansosDiariosPorTrabajador": 6,
  "maxDuracionPausaMinutos": 30,
  "minutosInactividadParaNPT": 5
}`,
  },
};

export function ejemploDe(metodo, ruta) {
  return EJEMPLOS[`${metodo} ${ruta}`] || null;
}
