"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Role = "user" | "assistant";

interface Message {
  id: string;
  role: Role;
  text: string;
}

const WELCOME: Message = {
  id: "welcome",
  role: "assistant",
  text: "¡Hola! 👋 Soy el asistente de Juanjo Alejos Fisioterapia Avanzada. Puedo ayudarte a reservar, consultar o modificar una cita, y resolver tus dudas. ¿En qué te ayudo?",
};

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

/** sessionId estable por navegador (equivale al "teléfono" en WhatsApp). */
function getSessionId() {
  if (typeof window === "undefined") return "web-anon";
  const KEY = "ja-fisio-session-id";
  let id = window.localStorage.getItem(KEY);
  if (!id) {
    id = "web-" + uid();
    window.localStorage.setItem(KEY, id);
  }
  return id;
}

export default function ChatPanel() {
  const [messages, setMessages] = useState<Message[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sessionIdRef = useRef<string>("web-anon");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    sessionIdRef.current = getSessionId();
  }, []);

  // Auto-scroll al fondo cuando hay mensajes nuevos o "escribiendo..."
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, sending]);

  const send = useCallback(async () => {
    const text = input.trim();
    if (!text || sending) return;

    setError(null);
    setInput("");
    setMessages((prev) => [...prev, { id: uid(), role: "user", text }]);
    setSending(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: sessionIdRef.current, message: text }),
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data: { messages?: string[]; error?: string } = await res.json();
      if (data.error) throw new Error(data.error);

      const replies = (data.messages ?? []).filter(
        (m) => typeof m === "string" && m.trim().length > 0
      );

      if (replies.length === 0) {
        setMessages((prev) => [
          ...prev,
          {
            id: uid(),
            role: "assistant",
            text: "(El asistente no devolvió respuesta. Inténtalo de nuevo.)",
          },
        ]);
      } else {
        // Mostramos cada mensaje del agente como una burbuja, con un pequeño
        // retardo entre ellas para que se sienta natural.
        for (let i = 0; i < replies.length; i++) {
          const reply = replies[i];
          if (i > 0) await new Promise((r) => setTimeout(r, 550));
          setMessages((prev) => [
            ...prev,
            { id: uid(), role: "assistant", text: reply },
          ]);
        }
      }
    } catch (err) {
      setError(
        "No se pudo contactar con el asistente. Revisa la conexión e inténtalo de nuevo."
      );
      console.error(err);
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  }, [input, sending]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-brand-line bg-brand-surface shadow-sm">
      {/* Cabecera del chat */}
      <div className="flex items-center gap-2 border-b border-brand-line bg-gradient-to-r from-brand-teal/10 to-brand-gold/10 px-4 py-3">
        <span className="text-sm font-semibold text-brand-ink">
          Chat con el asistente
        </span>
        <span className="text-xs text-brand-gray">· prueba la reserva</span>
      </div>

      {/* Mensajes */}
      <div
        ref={scrollRef}
        className="chat-scroll flex-1 space-y-3 overflow-y-auto px-4 py-4"
      >
        {messages.map((m) => (
          <Bubble key={m.id} role={m.role} text={m.text} />
        ))}

        {sending && (
          <div className="flex justify-start">
            <div className="rounded-2xl rounded-bl-md bg-brand-bg px-4 py-3">
              <div className="flex items-center gap-1">
                <span className="typing-dot h-2 w-2 rounded-full bg-brand-gray" />
                <span className="typing-dot h-2 w-2 rounded-full bg-brand-gray" />
                <span className="typing-dot h-2 w-2 rounded-full bg-brand-gray" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="border-t border-red-100 bg-red-50 px-4 py-2 text-xs text-red-600">
          {error}
        </div>
      )}

      {/* Input */}
      <div className="border-t border-brand-line bg-brand-surface p-3">
        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            rows={1}
            placeholder="Escribe tu mensaje…"
            className="max-h-32 min-h-[44px] flex-1 resize-none rounded-xl border border-brand-line bg-brand-bg px-3 py-2.5 text-sm text-brand-ink outline-none transition focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/20"
          />
          <button
            onClick={send}
            disabled={sending || input.trim().length === 0}
            aria-label="Enviar mensaje"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-gold text-white transition hover:bg-brand-gold-dark disabled:cursor-not-allowed disabled:opacity-40"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-5 w-5"
            >
              <path d="M3.4 20.4l17.45-7.48a1 1 0 000-1.84L3.4 3.6a.993.993 0 00-1.39.91L2 9.12c0 .5.37.93.87.99L17 12 2.87 13.88c-.5.07-.87.5-.87 1l.01 4.61c0 .71.73 1.2 1.39.91z" />
            </svg>
          </button>
        </div>
        <p className="mt-1.5 px-1 text-[11px] text-brand-gray">
          Enter para enviar · Shift+Enter para salto de línea
        </p>
      </div>
    </div>
  );
}

function Bubble({ role, text }: { role: Role; text: string }) {
  const isUser = role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={[
          "bubble-in max-w-[85%] whitespace-pre-wrap break-words rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm",
          isUser
            ? "rounded-br-md bg-brand-gold text-white"
            : "rounded-bl-md bg-brand-bg text-brand-ink",
        ].join(" ")}
      >
        {text}
      </div>
    </div>
  );
}
