// Año del footer
document.getElementById("year").textContent = new Date().getFullYear();

// Menú móvil
const nav = document.querySelector(".nav");
const toggle = document.querySelector(".nav__toggle");
const links = document.querySelector(".nav__links");

toggle.addEventListener("click", () => {
  const open = links.classList.toggle("open");
  nav.classList.toggle("menu-open", open);
  toggle.setAttribute("aria-expanded", String(open));
});
links.addEventListener("click", (e) => {
  if (e.target.tagName === "A") {
    links.classList.remove("open");
    nav.classList.remove("menu-open");
    toggle.setAttribute("aria-expanded", "false");
  }
});

// Al elegir un plan, preseleccionarlo en el formulario
const planSelect = document.getElementById("plan-select");
document.querySelectorAll("[data-plan]").forEach((btn) => {
  btn.addEventListener("click", () => { planSelect.value = btn.dataset.plan; });
});

// Animación de aparición al hacer scroll
const revealTargets = document.querySelectorAll(".section h2, .steps li, .plan, .testimonials figure, .split > *");
if ("IntersectionObserver" in window) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  revealTargets.forEach((el) => { el.classList.add("reveal"); io.observe(el); });
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

  const body = `Nombre: ${data.nombre}\nEmail: ${data.email}\nObjetivo: ${data.objetivo}\nPlan: ${data.plan}\n\n${data.mensaje}`;
  window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent("Valoración gratuita - " + data.nombre)}&body=${encodeURIComponent(body)}`;
  msg.textContent = "Abriendo tu correo para enviar la solicitud…";
  msg.classList.add("ok");
});
