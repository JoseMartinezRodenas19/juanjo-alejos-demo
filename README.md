# Juanjo Alejos · Fisioterapia Avanzada — Demo del asistente

Frontend de demostración para enseñar al cliente el asistente de WhatsApp:
un **chat** para interactuar con el bot y un **Google Calendar embebido** que
muestra en (casi) tiempo real cómo el bot agenda / reagenda / cancela citas.

- **Framework:** Next.js 16 (App Router) + Tailwind v4 · desplegable en Vercel.
- **Chat:** `app/api/chat/route.ts` hace de proxy seguro al webhook de n8n.
- **Calendario:** iframe oficial de Google Calendar (`components/CalendarPanel.tsx`).

## Arquitectura

```
[ Navegador ]
   ├─ Chat  ── POST /api/chat ──▶ (servidor Next) ── POST ──▶ n8n webhook /chat-web
   │                                                            └─ POLICIA → AGENDADOR/CONVERSACION/TROL
   │                                                            └─ Respond to Webhook → { messages: [...] }
   └─ <iframe> Google Calendar (calendario del fisio, público)
```

El workflow de n8n que atiende la web es **`FISIO — WEB DEMO`** (id `5UKGhpjBCAEuvP2z`),
SEPARADO del de producción (`FISIO`, id `x9osM0nCgF9wOGE2`). Reutiliza los mismos
agentes y sub-workflows (disponibilidad / agendamiento / reagendador / consultar
citas) y el mismo Google Calendar + tabla `citas`, pero responde de forma síncrona
y sin Redis ni WhatsApp.

> ⚠️ Las citas que se creen en la demo son **reales** (se ven en tu Calendar). Bórralas
> por el propio bot al terminar la demo para no descuadrar la agenda.

## Variables de entorno

Copia `.env.example` a `.env.local` y rellena:

| Variable | Qué es | ¿Pública? |
|---|---|---|
| `N8N_WEBHOOK_URL` | URL del webhook `chat-web` en n8n | No (solo servidor) |
| `NEXT_PUBLIC_CALENDAR_ID` | Calendar ID del fisio (debe ser público) | Sí |
| `NEXT_PUBLIC_CALENDAR_TZ` | Zona horaria (`Europe/Madrid`) | Sí |

## Desarrollo local

```bash
npm install
npm run dev      # http://localhost:3000
```

## El logo

Sustituye `public/logo.svg` (placeholder) por el logo real de Juanjo Alejos.
Si lo dejas como `logo.png`/`logo.jpg`, actualiza la ruta en `components/Header.tsx`.

## Deploy en Vercel

1. Sube esta carpeta `frontend/` a un repositorio de GitHub (o usa Vercel CLI).
2. En [vercel.com](https://vercel.com) → **Add New… → Project** → importa el repo.
   - **Root Directory:** `frontend` (si subes todo el proyecto) o la raíz (si solo subes esta carpeta).
   - Framework: Next.js (autodetectado).
3. En **Environment Variables** añade las 3 variables de arriba
   (con los valores de tu `.env.local`).
4. **Deploy**. Vercel te da una URL `https://...vercel.app`.

> El calendario debe estar **público** en Google Calendar para que se vea en el iframe
> (Configuración del calendario → *Permisos de acceso* → Hacer público).
