import Image from "next/image";

export default function Header() {
  return (
    <header className="w-full border-b border-brand-line bg-brand-surface">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:px-6">
        <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full ring-1 ring-brand-line">
          <Image
            src="/logo.png"
            alt="Juanjo Alejos — Fisioterapia Avanzada"
            fill
            priority
            sizes="44px"
            className="object-cover"
          />
        </div>
        <div className="min-w-0">
          <h1 className="truncate text-base font-semibold leading-tight text-brand-ink sm:text-lg">
            Juanjo Alejos
            <span className="hidden text-brand-gold sm:inline">
              {" "}
              · Fisioterapia Avanzada
            </span>
          </h1>
          <p className="truncate text-xs text-brand-gray">
            Asistente virtual de reservas · Demo
          </p>
        </div>
        <span className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-brand-teal/10 px-3 py-1 text-xs font-medium text-brand-teal-dark">
          <span className="h-2 w-2 animate-pulse rounded-full bg-brand-teal" />
          En línea
        </span>
      </div>
    </header>
  );
}
