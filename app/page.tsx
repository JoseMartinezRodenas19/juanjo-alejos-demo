import Header from "@/components/Header";
import ChatPanel from "@/components/ChatPanel";
import CalendarPanel from "@/components/CalendarPanel";

export default function Home() {
  return (
    <div className="flex min-h-full flex-col">
      <Header />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-4 sm:px-6 sm:py-6">
        <div className="grid h-[calc(100vh-9rem)] min-h-[520px] grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
          {/* Chat */}
          <section className="min-h-[420px]">
            <ChatPanel />
          </section>

          {/* Calendario */}
          <section className="min-h-[420px]">
            <CalendarPanel />
          </section>
        </div>
      </main>

      <footer className="border-t border-brand-line bg-brand-surface px-4 py-3 text-center text-xs text-brand-gray">
        Juanjo Alejos · Fisioterapia Avanzada — Demo del asistente virtual ·
        Novantin
      </footer>
    </div>
  );
}
