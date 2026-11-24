// Año del footer
document.getElementById("year").textContent = new Date().getFullYear();

// Cronómetro: tiempo que el visitante lleva en la página
const timers = document.querySelectorAll(".js-timer");
const start = Date.now();
const tick = () => {
  const s = Math.floor((Date.now() - start) / 1000);
  const txt = String(Math.floor(s / 60)).padStart(2, "0") + ":" + String(s % 60).padStart(2, "0");
  timers.forEach((t) => { t.textContent = txt; });
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

// Las solicitudes se envían a un servicio propio (netlify/functions/solicitud.js),
// que te las reenvía a tu WhatsApp. Tu número nunca aparece en la web.
const ENDPOINT = "/api/solicitud";

// Botones de reserva: abren el formulario emergente
const dialog = document.getElementById("booking");
const openForm = (e) => {
  if (!dialog || typeof dialog.showModal !== "function") return; // sin soporte: baja al formulario de contacto
  e.preventDefault();
  dialog.showModal();
  document.body.classList.add("no-scroll");
  setTimeout(() => dialog.querySelector("input[name=nombre]").focus(), 50);
};
document.querySelectorAll("[data-open-form]").forEach((a) => a.addEventListener("click", openForm));
if (dialog) {
  dialog.addEventListener("close", () => document.body.classList.remove("no-scroll"));
  dialog.querySelector("[data-close-form]").addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", (e) => { if (e.target === dialog) dialog.close(); }); // clic fuera
}

// Formularios: envían la solicitud y te llega a tu WhatsApp
document.querySelectorAll(".js-booking").forEach((form) => {
  const msg = form.querySelector(".form__msg");
  const btn = form.querySelector("button[type=submit]");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    msg.className = "form__msg";
    const nameOk = form.nombre.value.trim() !== "";
    const phoneOk = form.telefono.value.replace(/\D/g, "").length >= 9;
    form.nombre.classList.toggle("invalid", !nameOk);
    form.telefono.classList.toggle("invalid", !phoneOk);
    if (!nameOk || !phoneOk) {
      msg.textContent = !nameOk ? "Escribe tu nombre para continuar." : "Escribe un número de teléfono válido.";
      msg.classList.add("err");
      return;
    }
    btn.disabled = true;
    msg.textContent = "Enviando…";
    try {
      const res = await fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(new FormData(form))),
      });
      if (!res.ok) throw new Error();
      form.reset();
      msg.textContent = "¡Recibido! Te escribo por WhatsApp en menos de 24 horas.";
      msg.classList.add("ok");
    } catch {
      msg.textContent = "No se ha podido enviar. Inténtalo de nuevo en unos minutos.";
      msg.classList.add("err");
    } finally {
      btn.disabled = false;
    }
  });
});
