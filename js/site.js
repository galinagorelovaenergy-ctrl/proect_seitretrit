"use strict";

const header = document.getElementById("header");
const menuToggle = document.getElementById("menuToggle");
const mobileNav = document.getElementById("mobileNav");
const yearNode = document.getElementById("currentYear");
const contactForm = document.getElementById("contactForm");
const formStatus = document.getElementById("formStatus");
const WHATSAPP_NUMBER = "79287720636";

const openWhatsApp = (text) => {
  const url = "https://wa.me/" + WHATSAPP_NUMBER + "?text=" + encodeURIComponent(text);
  const popup = window.open(url, "_blank", "noopener,noreferrer");
  if (!popup) window.location.href = url;
  if (typeof window.nteReachWhatsAppApplicationGoal === "function") {
    window.nteReachWhatsAppApplicationGoal();
  }
};

if (header) {
  const setHeaderState = () => header.classList.toggle("is-solid", window.scrollY > 40);
  setHeaderState();
  window.addEventListener("scroll", setHeaderState, { passive: true });
}

if (yearNode) yearNode.textContent = String(new Date().getFullYear());
document.querySelectorAll(".place-photo").forEach((el) => el.classList.add("is-printed"));

if (menuToggle && mobileNav) {
  const closeMenu = () => {
    mobileNav.classList.remove("open");
    mobileNav.hidden = true;
    menuToggle.setAttribute("aria-expanded", "false");
  };
  menuToggle.addEventListener("click", () => {
    const open = !mobileNav.classList.contains("open");
    mobileNav.classList.toggle("open", open);
    mobileNav.hidden = !open;
    menuToggle.setAttribute("aria-expanded", String(open));
  });
  mobileNav.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));
}

document.querySelectorAll(".faq-q").forEach((button) => {
  button.addEventListener("click", () => {
    const item = button.closest(".faq-item");
    const open = !item.classList.contains("open");
    document.querySelectorAll(".faq-item.open").forEach((other) => {
      if (other !== item) {
        other.classList.remove("open");
        other.querySelector(".faq-q").setAttribute("aria-expanded", "false");
      }
    });
    item.classList.toggle("open", open);
    button.setAttribute("aria-expanded", String(open));
  });
});

const revealNodes = document.querySelectorAll(".reveal");
if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver((entries, current) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-in");
      current.unobserve(entry.target);
    });
  }, { threshold: 0.08, rootMargin: "90px 0px" });
  revealNodes.forEach((node) => observer.observe(node));
} else {
  revealNodes.forEach((node) => node.classList.add("is-in"));
}

if (contactForm) {
  const setFormStatus = (kind, text) => {
    if (!formStatus) return;
    formStatus.style.display = "block";
    formStatus.classList.remove("is-wait", "is-err");
    if (kind) formStatus.classList.add(kind);
    formStatus.textContent = text;
  };

  let sendingApplication = false;
  const sendApplication = () => {
    if (sendingApplication) return false;
    if (!contactForm.reportValidity()) return false;
    const honey = contactForm.querySelector("[name='_gotcha']");
    if (honey && honey.value.trim()) {
      setFormStatus("", "Заявка отправлена. Мы перезвоним в указанное время.");
      return true;
    }
    const program = (contactForm.querySelector("[name='program']") || {}).value || "Выездная программа";
    const name = document.getElementById("name").value.trim();
    const phone = document.getElementById("userPhone").value.trim();
    const callbackTime = document.getElementById("callbackTime").value.trim();
    const message = document.getElementById("message").value.trim();
    const body = [
      "Здравствуйте! Заявка с сайта «Новая точка энергии».",
      "Программа: " + program,
      "Имя: " + name,
      "Телефон: " + phone,
      callbackTime ? "Удобное время для звонка: " + callbackTime : "",
      "Вопрос: " + (message || "Нет дополнительных вопросов")
    ].filter(Boolean).join("\n");
    sendingApplication = true;
    setFormStatus("is-wait", "Открываем WhatsApp с текстом заявки…");
    try {
      openWhatsApp(body);
      setFormStatus("", "Открылся WhatsApp. Проверьте текст и нажмите «Отправить» — заявка придёт на +7 928 772-06-36.");
      return true;
    } catch (error) {
      setFormStatus("is-err", "Не удалось открыть WhatsApp. Напишите, пожалуйста, на +7 928 772-06-36 или на zoodiana@yandex.ru.");
      return false;
    } finally {
      window.setTimeout(() => {
        sendingApplication = false;
      }, 1200);
    }
  };

  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();
    sendApplication();
  });
}
