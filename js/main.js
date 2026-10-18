"use strict";

const header = document.getElementById("header");
const menuToggle = document.getElementById("menuToggle");
const mobileNav = document.getElementById("mobileNav");
const yearNode = document.getElementById("currentYear");
const contactForm = document.getElementById("contactForm");
const formStatus = document.getElementById("formStatus");
const cursor = document.getElementById("cursor");
const progress = document.getElementById("progress");
const datePins = [...document.querySelectorAll(".dates span")];
const ORGANIZER_EMAIL = "galinagorelovaenergy@gmail.com";
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = window.matchMedia("(pointer: fine)").matches;

const setHeaderState = () => {
  header.classList.toggle("is-solid", window.scrollY > 40);
};

const setProgress = () => {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  progress.style.width = max > 0 ? (window.scrollY / max * 100) + "%" : "0%";
};

const setDatePin = () => {
  const index = Math.min(
    datePins.length - 1,
    Math.floor((window.scrollY / Math.max(1, document.documentElement.scrollHeight - window.innerHeight)) * datePins.length)
  );
  datePins.forEach((pin, i) => pin.classList.toggle("is-on", i === index));
};

const onScroll = () => {
  setHeaderState();
  setProgress();
  setDatePin();
};

onScroll();
window.addEventListener("scroll", onScroll, { passive: true });

if (yearNode) yearNode.textContent = String(new Date().getFullYear());

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

const showReveals = (root = document) => {
  root.querySelectorAll(".reveal").forEach((node) => node.classList.add("is-in"));
};

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
  showReveals();
}

const revealHashTarget = () => {
  const id = location.hash.slice(1);
  if (!id) return;
  const section = document.getElementById(id);
  if (section) showReveals(section);
};

revealHashTarget();
window.addEventListener("hashchange", revealHashTarget);

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener("click", () => {
    const id = link.getAttribute("href").slice(1);
    const section = document.getElementById(id);
    if (section) showReveals(section);
  });
});

if (!reduceMotion) {
  const layers = [...document.querySelectorAll("[data-parallax]")];
  window.addEventListener("scroll", () => {
    layers.forEach((layer) => {
      const speed = Number(layer.dataset.parallax) || 8;
      const rect = layer.getBoundingClientRect();
      const offset = (rect.top - window.innerHeight / 2) / 40;
      layer.style.transform = layer.classList.contains("tilt-photo")
        ? "rotate(2.4deg) translateY(" + (28 + offset * speed) + "px)"
        : "translateY(" + (offset * speed) + "px)";
    });
  }, { passive: true });
}

if (cursor && finePointer && !reduceMotion) {
  window.addEventListener("pointermove", (event) => {
    cursor.style.left = event.clientX + "px";
    cursor.style.top = event.clientY + "px";
  });

  document.querySelectorAll("a, button, input, textarea").forEach((node) => {
    node.addEventListener("pointerenter", () => cursor.classList.add("is-on"));
    node.addEventListener("pointerleave", () => cursor.classList.remove("is-on"));
  });
}

contactForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!contactForm.reportValidity()) return;

  const name = document.getElementById("name").value.trim();
  const contact = document.getElementById("userContact").value.trim();
  const message = document.getElementById("message").value.trim();
  const subject = "Заявка на интенсив в Адыгее";
  const body = [
    "Здравствуйте! Хочу узнать подробнее об интенсиве.",
    "",
    "Имя: " + name,
    "Телефон или Telegram: " + contact,
    "Вопрос: " + (message || "Нет дополнительных вопросов"),
    "",
    "Интенсив: 17–22 ноября",
    "Стоимость: 50 000 рублей"
  ].join("\n");

  formStatus.style.display = "block";
  formStatus.textContent = "Открываем почтовую программу. Проверьте письмо и нажмите «Отправить».";
  window.location.href =
    "mailto:" + ORGANIZER_EMAIL +
    "?subject=" + encodeURIComponent(subject) +
    "&body=" + encodeURIComponent(body);
});
