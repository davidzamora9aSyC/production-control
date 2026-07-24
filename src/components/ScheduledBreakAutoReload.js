import { useEffect } from "react";

const ZONA_BOGOTA = "America/Bogota";
const HORARIOS_RECARGA = new Set(["09:50", "10:00", "13:00", "13:30"]);
const STORAGE_PREFIX = "scheduled-break-reload";

const getBogotaParts = () => {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: ZONA_BOGOTA,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(new Date());

  const valueOf = (type) => parts.find((part) => part.type === type)?.value;
  return {
    weekday: valueOf("weekday"),
    date: `${valueOf("year")}-${valueOf("month")}-${valueOf("day")}`,
    time: `${valueOf("hour")}:${valueOf("minute")}`,
    second: Number(valueOf("second") || 0),
  };
};

export default function ScheduledBreakAutoReload() {
  useEffect(() => {
    const checkReload = () => {
      const bogota = getBogotaParts();
      const isWeekday = ["Mon", "Tue", "Wed", "Thu", "Fri"].includes(
        bogota.weekday,
      );
      if (!isWeekday || !HORARIOS_RECARGA.has(bogota.time)) return;

      const key = `${STORAGE_PREFIX}:${bogota.date}:${bogota.time}`;
      if (sessionStorage.getItem(key)) return;

      sessionStorage.setItem(key, "1");
      const delayMs = Math.max(0, 7000 - bogota.second * 1000);
      window.setTimeout(() => {
        window.location.reload();
      }, delayMs);
    };

    checkReload();
    const intervalId = window.setInterval(checkReload, 15000);
    return () => window.clearInterval(intervalId);
  }, []);

  return null;
}
