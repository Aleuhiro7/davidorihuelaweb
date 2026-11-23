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

// Carrusel de fotos del reproductor: pasan solas
const slides = document.querySelectorAll(".slide");
const bars = document.querySelectorAll(".player__track i");
const SLIDE_TIME = 5000;
let current = 0;
document.documentElement.style.setProperty("--slide-time", SLIDE_TIME + "ms");
const showSlide = (n) => {
  current = n % slides.length;
  slides.forEach((s, i) => s.classList.toggle("is-active", i === current));
  bars.forEach((b, i) => {
    b.classList.remove("is-active", "is-done");
    void b.offsetWidth; // reinicia la animación de la barra
    if (i < current) b.classList.add("is-done");
    if (i === current) b.classList.add("is-active");
  });
};
if (slides.length > 1) setInterval(() => showSlide(current + 1), SLIDE_TIME);

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

// WhatsApp: cambia aquí tu número (con prefijo de país, sin + ni espacios)
const WHATSAPP = "34600000000";
const waLink = (text) => `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(text)}`;

// Botones de valoración: abren WhatsApp con un mensaje ya escrito
document.querySelectorAll("[data-wa]").forEach((a) => {
  a.href = waLink("Hola David, me gustaría hacer la valoración gratuita.");
});

// Formulario de contacto: prepara el mensaje y lo abre en WhatsApp
const form = document.getElementById("contact-form");
const msg = form.querySelector(".form__msg");

form.addEventListener("submit", (e) => {
  e.preventDefault();
  msg.className = "form__msg";
  const ok = form.nombre.value.trim() !== "";
  form.nombre.classList.toggle("invalid", !ok);
  if (!ok) {
    msg.textContent = "Escribe tu nombre para continuar.";
    msg.classList.add("err");
    return;
  }
  const data = Object.fromEntries(new FormData(form));
  let text = `Hola David, soy ${data.nombre.trim()}. Me gustaría hacer la valoración gratuita.\nObjetivo: ${data.objetivo}`;
  if (data.mensaje.trim()) text += `\n\n${data.mensaje.trim()}`;
  window.open(waLink(text), "_blank", "noopener");
  msg.textContent = "Abriendo WhatsApp con tu mensaje…";
  msg.classList.add("ok");
});
