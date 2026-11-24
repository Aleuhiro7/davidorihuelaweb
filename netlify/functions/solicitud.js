// Recibe las solicitudes del formulario y te las reenvía a tu WhatsApp
// usando CallMeBot (servicio gratuito de avisos para tu propio número).
// Tu número y tu clave se guardan como variables de entorno en Netlify,
// nunca en la web, así que los clientes no pueden verlos:
//   WHATSAPP_PHONE    -> tu número con prefijo, p. ej. 34612345678
//   CALLMEBOT_APIKEY  -> la clave que te da CallMeBot

const clean = (v, max) => String(v ?? "").replace(/[\u0000-\u001f\u007f]/g, " ").trim().slice(0, max);

export default async (req) => {
  if (req.method !== "POST") return new Response("Método no permitido", { status: 405 });

  let data;
  try { data = await req.json(); } catch { return new Response("Datos no válidos", { status: 400 }); }

  // Campo trampa: los robots lo rellenan, las personas no lo ven
  if (data.web) return new Response("ok");

  const nombre = clean(data.nombre, 80);
  const objetivo = clean(data.objetivo, 60);
  const telefono = clean(data.telefono, 30);
  const mensaje = String(data.mensaje ?? "").trim().slice(0, 800);

  if (!nombre || telefono.replace(/\D/g, "").length < 9) {
    return new Response("Faltan datos", { status: 400 });
  }

  const { WHATSAPP_PHONE, CALLMEBOT_APIKEY } = process.env;
  if (!WHATSAPP_PHONE || !CALLMEBOT_APIKEY) return new Response("Servicio sin configurar", { status: 500 });

  let text = `🟢 Nueva solicitud de valoración\n\nNombre: ${nombre}\nObjetivo: ${objetivo}\nTeléfono: ${telefono}`;
  if (mensaje) text += `\n\nMensaje: ${mensaje}`;

  const url = new URL("https://api.callmebot.com/whatsapp.php");
  url.searchParams.set("phone", WHATSAPP_PHONE);
  url.searchParams.set("text", text);
  url.searchParams.set("apikey", CALLMEBOT_APIKEY);

  const res = await fetch(url);
  if (!res.ok) return new Response("No se pudo avisar", { status: 502 });
  return new Response("ok");
};

export const config = { path: "/api/solicitud" };
