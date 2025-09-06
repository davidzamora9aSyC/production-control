// Descripciones de indicadores reutilizables (tomadas de la página de Sesiones)
// Clave: metricKey
const INDICADOR_DESCRIPTIONS = {
  avgSpeed:
    "Piezas por hora excluyendo NPT (total de piezas de sesión/(minutos de sesión - NPT)  * 60). Se mide en (piezas/hora)",
  avgSpeedSesion:
    "Piezas por hora incluyendo tiempos no productivos (total de piezas de sesión / minutos totales de sesión * 60). Se mide en (piezas/hora)",
  velocidadActual:
    "Piezas por hora en los últimos 10 minutos excluyendo NPT (piezas contadas en la ventana / (minutos de ventana - NPT de ventana) * 60). Se mide en (piezas/hora)",
  nptMin:
    "Minutos sin producción: no hubo pedaleo y no se contaron piezas.",
  nptPorInactividad:
    "Minutos sin actividad detectada durante periodos mayores a 3 minutos en la sesión.",
  porcentajeNPT:
    "(tiempo no productivo total / minutos totales de la sesión) * 100.",
  defectos:
    "Pedaleadas menos piezas en toda la sesión.",
  produccionTotal:
    "Suma de piezas contadas en la sesión.",
};

export default INDICADOR_DESCRIPTIONS;

