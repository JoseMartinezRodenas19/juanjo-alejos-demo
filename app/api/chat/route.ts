import { NextRequest } from "next/server";

// El webhook vive en n8n; la URL es secreta y solo se usa en servidor.
const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL;

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Normaliza cualquier forma de respuesta de n8n a un array de strings. */
function extractMessages(payload: unknown): string[] {
  if (payload == null) return [];

  // Caso: string JSON dentro de string
  if (typeof payload === "string") {
    const trimmed = payload.trim();
    if (trimmed.startsWith("[") || trimmed.startsWith("{")) {
      try {
        return extractMessages(JSON.parse(trimmed));
      } catch {
        return [trimmed];
      }
    }
    return trimmed ? [trimmed] : [];
  }

  // Caso: array → puede ser ["a","b"] o [{json:...}] o [{output:...}]
  if (Array.isArray(payload)) {
    return payload.flatMap((item) => extractMessages(item));
  }

  if (typeof payload === "object") {
    const obj = payload as Record<string, unknown>;
    // claves típicas de n8n / agentes
    for (const key of ["messages", "output", "text", "respuesta", "json", "data", "body"]) {
      if (key in obj) return extractMessages(obj[key]);
    }
  }

  return [];
}

export async function POST(request: NextRequest) {
  if (!N8N_WEBHOOK_URL) {
    return Response.json(
      { error: "El servidor no tiene configurada N8N_WEBHOOK_URL." },
      { status: 500 }
    );
  }

  let body: { sessionId?: string; message?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "JSON inválido." }, { status: 400 });
  }

  const message = (body.message ?? "").toString().trim();
  const sessionId = (body.sessionId ?? "web-anon").toString();

  if (!message) {
    return Response.json({ error: "Mensaje vacío." }, { status: 400 });
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60000); // 60s

    const res = await fetch(N8N_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId,
        message,
        channel: "web",
        source: "demo-frontend",
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      console.error("n8n respondió", res.status, detail);
      return Response.json(
        { error: `El asistente devolvió un error (${res.status}).` },
        { status: 502 }
      );
    }

    const raw = await res.text();
    let parsed: unknown = raw;
    try {
      parsed = JSON.parse(raw);
    } catch {
      // si no es JSON, lo tratamos como texto plano
    }

    const messages = extractMessages(parsed);
    return Response.json({ messages });
  } catch (err) {
    const aborted = err instanceof Error && err.name === "AbortError";
    console.error("Error contactando n8n:", err);
    return Response.json(
      {
        error: aborted
          ? "El asistente tardó demasiado en responder."
          : "No se pudo contactar con el asistente.",
      },
      { status: 504 }
    );
  }
}
