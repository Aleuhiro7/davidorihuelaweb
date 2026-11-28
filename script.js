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

// Carrusel: al entrar, la primera foto aparece centrada
const screen = document.querySelector(".player__screen");
const firstSlide = document.querySelector(".slide");
const centerCarousel = () => {
  if (!screen || !firstSlide) return;
  const slideW = firstSlide.getBoundingClientRect().width;
  // En pantallas anchas caben varias fotos: la primera empieza a la izquierda, en orden
  const px = screen.clientWidth > slideW * 3 ? 0 : (screen.clientWidth - slideW) / 2;
  document.querySelector(".player").style.setProperty("--center", px + "px");
};
centerCarousel();
addEventListener("resize", centerCarousel);

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
const WHATSAPP = "34696635094";
const waLink = (text) => `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(text)}`;

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

// Formularios: preparan el mensaje y lo abren en WhatsApp
document.querySelectorAll(".js-booking").forEach((form) => {
  const msg = form.querySelector(".form__msg");
  form.addEventListener("submit", (e) => {
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
    const data = Object.fromEntries(new FormData(form));
    let text = `Hola David, soy ${data.nombre.trim()}. Me gustaría hacer la valoración gratuita.\nObjetivo: ${data.objetivo}\nTeléfono: ${data.telefono.trim()}`;
    if (data.mensaje.trim()) text += `\n\n${data.mensaje.trim()}`;
    window.open(waLink(text), "_blank", "noopener");
    msg.textContent = "Abriendo WhatsApp con tu mensaje…";
    msg.classList.add("ok");
  });
});
