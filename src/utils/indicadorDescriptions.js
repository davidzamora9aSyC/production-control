// Descripciones de indicadores reutilizables para las series diarias
// Clave: metricKey
const INDICADOR_DESCRIPTIONS = {
  produccionTotal:
    "Para cada dia se suman las piezas buenas registradas en todas las sesiones cerradas del trabajador o maquina.",
  defectos:
    "Para cada dia se acumulan los defectos de cada sesion, calculados como pedaleadas menos piezas buenas, y luego se totalizan.",
  nptMin:
    "Para cada dia se suman los minutos sin produccion reportados por cada sesion, ya limitados por la duracion real de esa sesion.",
  nptPorInactividad:
    "Para cada dia se agregan solo los tramos sin actividad de cada sesion que superan el umbral de inactividad configurado.",
  pausasMin:
    "Para cada dia se suman los minutos en pausas manuales que se registraron en los pasos de produccion de todas las sesiones.",
  pausasCount:
    "Para cada dia se cuenta cuantas pausas manuales quedaron registradas en las sesiones del trabajador o maquina.",
  duracionSesionMin:
    "Para cada dia se suma la duracion completa (inicio a fin) de cada sesion ejecutada por el trabajador o la maquina.",
  duracionTotalMin:
    "Para cada dia se suma la duracion completa (inicio a fin) de cada sesion ejecutada por el trabajador o la maquina.",
  sesionesCerradas:
    "Para cada dia se cuenta la cantidad de sesiones que finalizaron para ese trabajador o maquina.",
  porcentajeDefectos:
    "Para cada dia se recalcula como defectos diarios dividido entre la suma de piezas buenas diarias mas defectos diarios, multiplicado por 100.",
  porcentajeNPT:
    "Para cada dia se calcula como minutos no productivos diarios entre minutos totales diarios por 100, usando el valor minimo entre ambos minutos para que nunca supere 100%.",
  porcentajePausa:
    "Para cada dia se calcula como minutos en pausa diarios dividido entre los minutos totales diarios, multiplicado por 100.",
  avgSpeed:
    "Para cada dia se calcula la velocidad efectiva dividiendo las piezas buenas diarias entre los minutos productivos diarios (minutos totales menos NPT) y escalando a piezas por hora.",
  avgSpeedSesion:
    "Para cada dia se calcula la velocidad promedio dividiendo las piezas buenas diarias entre los minutos totales diarios y multiplicando por 60 para obtener piezas por hora.",
  velocidadActual:
    "Velocidad de la ventana de 10 minutos, calculada como piezas contadas en los ultimos 10 minutos menos sus NPT dividido entre los minutos productivos de esa ventana y escalado a piezas por hora.",
};

export default INDICADOR_DESCRIPTIONS;
