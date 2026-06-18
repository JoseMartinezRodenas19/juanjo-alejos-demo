"use client";

import { useEffect, useMemo, useState } from "react";

// El Calendar ID y la zona horaria son públicos (van en el iframe de Google).
const CALENDAR_ID =
  process.env.NEXT_PUBLIC_CALENDAR_ID ??
  "bfaad59e7c27fa2f95b73e16fd2e48aa5a4ac0e8f891dc83acb179a5a15b5361@group.calendar.google.com";
const TZ = process.env.NEXT_PUBLIC_CALENDAR_TZ ?? "Europe/Madrid";

type ViewMode = "WEEK" | "AGENDA" | "MONTH";

function buildSrc(mode: ViewMode, bust: number) {
  const params = new URLSearchParams({
    src: CALENDAR_ID,
    ctz: TZ,
    mode,
    wkst: "2", // semana empieza en lunes
    hl: "es",
    showTitle: "0",
    showPrint: "0",
    showTabs: "0",
    showCalendars: "0",
    showTz: "0",
    showNav: "1",
    showDate: "1",
    bgcolor: "%23ffffff",
    color: "%23C9A24B", // color de los eventos (dorado de marca)
  });
  // cache-buster para forzar recarga real al pulsar "Actualizar"
  return `https://calendar.google.com/calendar/embed?${params.toString()}&_=${bust}`;
}

export default function CalendarPanel() {
  const [mode, setMode] = useState<ViewMode>("WEEK");
  const [bust, setBust] = useState(() => Date.now());
  const [autoSeconds, setAutoSeconds] = useState(0);

  // Auto-refresco periódico (cada 30s) para reflejar lo que agenda el bot.
  useEffect(() => {
    const interval = setInterval(() => {
      setBust(Date.now());
      setAutoSeconds(0);
    }, 30000);
    const ticker = setInterval(() => setAutoSeconds((s) => s + 1), 1000);
    return () => {
      clearInterval(interval);
      clearInterval(ticker);
    };
  }, []);

  const src = useMemo(() => buildSrc(mode, bust), [mode, bust]);

  const refresh = () => {
    setBust(Date.now());
    setAutoSeconds(0);
  };

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-brand-line bg-brand-surface shadow-sm">
      {/* Cabecera */}
      <div className="flex flex-wrap items-center gap-2 border-b border-brand-line bg-gradient-to-r from-brand-gold/10 to-brand-teal/10 px-4 py-3">
        <span className="text-sm font-semibold text-brand-ink">
          Agenda en tiempo real
        </span>

        <div className="ml-auto flex items-center gap-2">
          {/* Selector de vista */}
          <div className="flex overflow-hidden rounded-lg border border-brand-line">
            {(["WEEK", "AGENDA", "MONTH"] as ViewMode[]).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={[
                  "px-2.5 py-1 text-xs font-medium transition",
                  mode === m
                    ? "bg-brand-teal text-white"
                    : "bg-brand-surface text-brand-gray hover:bg-brand-bg",
                ].join(" ")}
              >
                {m === "WEEK" ? "Semana" : m === "AGENDA" ? "Agenda" : "Mes"}
              </button>
            ))}
          </div>

          {/* Botón refrescar */}
          <button
            onClick={refresh}
            title="Actualizar ahora"
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-brand-line text-brand-gray transition hover:bg-brand-bg hover:text-brand-teal-dark"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
            >
              <path d="M21 12a9 9 0 11-2.64-6.36" />
              <path d="M21 3v6h-6" />
            </svg>
          </button>
        </div>
      </div>

      {/* Iframe */}
      <div className="relative flex-1 bg-white">
        <iframe
          key={src}
          src={src}
          title="Google Calendar — Juanjo Alejos Fisioterapia"
          className="h-full w-full"
          style={{ border: 0 }}
        />
      </div>

      <div className="border-t border-brand-line px-4 py-2 text-[11px] text-brand-gray">
        Se actualiza solo cada 30s · última hace {autoSeconds}s. Si el bot acaba
        de agendar, pulsa actualizar.
      </div>
    </div>
  );
}
