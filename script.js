// Año del footer
document.getElementById("year").textContent = new Date().getFullYear();

// Cronómetro: tiempo que el visitante lleva en la página
const timers = document.querySelectorAll(".js-timer");
const head = document.querySelector(".player__head");
const start = Date.now();
const tick = () => {
  const s = Math.floor((Date.now() - start) / 1000);
  const txt = String(Math.floor(s / 60)).padStart(2, "0") + ":" + String(s % 60).padStart(2, "0");
  timers.forEach((t) => { t.textContent = txt; });
  if (head) head.style.width = Math.min(8 + s * 1.5, 100) + "%";
};
setInterval(tick, 1000);

// Barra de progreso tipo reproductor según el scroll
const fill = document.querySelector(".scrub__fill");
let ticking = false;
const onScroll = () => {
  const max = document.documentElement.scrollHeight - innerHeight;
  fill.style.width = (max > 0 ? (scrollY / max) * 100 : 0) + "%";
  ticking = false;
};
addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
onScroll();

// Animación de aparición al hacer scroll
const revealTargets = document.querySelectorAll(".statement, .title, .cols, .tagline, .about__photo, .spec, .pillars li, .band h2, .offer__card, .qa > div, .form");
const timeline = document.querySelector(".timeline");
if ("IntersectionObserver" in window) {
  const tio = new IntersectionObserver(([e]) => { if (e.isIntersecting) { timeline.classList.add("visible"); tio.disconnect(); } }, { threshold: 0.6 });
  tio.observe(timeline);
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  revealTargets.forEach((el) => { el.classList.add("reveal"); io.observe(el); });
} else {
  timeline.classList.add("visible");
}

// Formulario de contacto
// Por ahora abre el cliente de correo con los datos rellenados.
// Para recibir los mensajes sin email, conecta un servicio como Formspree:
// cambia FORM_ENDPOINT por tu URL (p. ej. "https://formspree.io/f/xxxxxx").
const FORM_ENDPOINT = "";
const CONTACT_EMAIL = "hola@davidorihuela.com";

const form = document.getElementById("contact-form");
const msg = form.querySelector(".form__msg");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  msg.className = "form__msg";
  const fields = [form.nombre, form.email];
  let valid = true;
  fields.forEach((f) => {
    const ok = f.value.trim() !== "" && f.checkValidity();
    f.classList.toggle("invalid", !ok);
    if (!ok) valid = false;
  });
  if (!valid) {
    msg.textContent = "Revisa tu nombre y un email válido.";
    msg.classList.add("err");
    return;
  }

  const data = Object.fromEntries(new FormData(form));

  if (FORM_ENDPOINT) {
    try {
      const res = await fetch(FORM_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error();
      form.reset();
      msg.textContent = "¡Gracias! Te escribiré en menos de 24 horas.";
      msg.classList.add("ok");
    } catch {
      msg.textContent = "No se pudo enviar. Escríbeme directamente por email o WhatsApp.";
      msg.classList.add("err");
    }
    return;
  }

  const body = `Nombre: ${data.nombre}\nEmail: ${data.email}\nObjetivo: ${data.objetivo}\n\n${data.mensaje}`;
  window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent("Valoración gratuita - " + data.nombre)}&body=${encodeURIComponent(body)}`;
  msg.textContent = "Abriendo tu correo para enviar la solicitud…";
  msg.classList.add("ok");
});
