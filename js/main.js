"use strict";

const header = document.getElementById("header");
const menuToggle = document.getElementById("menuToggle");
const mobileNav = document.getElementById("mobileNav");
const yearNode = document.getElementById("currentYear");
const contactForm = document.getElementById("contactForm");
const formStatus = document.getElementById("formStatus");
const cursor = document.getElementById("cursor");
const progress = document.getElementById("progress");
const datePins = [...document.querySelectorAll(".dates [data-day]")];
const ORGANIZER_EMAIL = "zoodiana@yandex.ru";
const WHATSAPP_NUMBER = "79287720636";

const openWhatsApp = (text) => {
  const url = "https://wa.me/" + WHATSAPP_NUMBER + "?text=" + encodeURIComponent(text);
  const popup = window.open(url, "_blank", "noopener,noreferrer");
  if (!popup) window.location.href = url;
};
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
  datePins.forEach((pin, i) => {
    const on = i === index;
    pin.classList.toggle("is-on", on);
    pin.querySelector("[data-elastic]")?._elastic?.set({
      color: on ? "#efe6d4" : "#c07a3a",
      theme: on ? "dark" : "light"
    });
  });
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

const printPlace = document.querySelector(".place-photo");
if (printPlace) {
  if (reduceMotion) {
    printPlace.classList.add("is-printed");
  } else if ("IntersectionObserver" in window) {
    const printObserver = new IntersectionObserver((entries, current) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-printed");
        current.unobserve(entry.target);
      });
    }, { threshold: 0.16, rootMargin: "40px 0px" });
    printObserver.observe(printPlace);
  } else {
    printPlace.classList.add("is-printed");
  }
}

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
      const narrow = window.matchMedia("(max-width: 980px)").matches;
      if (narrow) {
        layer.style.transform = layer.classList.contains("tilt-photo")
          ? "rotate(.6deg)"
          : "none";
        return;
      }
      if (layer.classList.contains("tilt-photo")) {
        layer.style.transform = "rotate(2.4deg) translateY(" + (28 + offset * speed) + "px)";
      } else {
        layer.style.transform = "translateY(" + (offset * speed) + "px)";
      }
    });
  }, { passive: true });
}

if (cursor && finePointer && !reduceMotion) {
  window.addEventListener("pointermove", (event) => {
    cursor.style.left = event.clientX + "px";
    cursor.style.top = event.clientY + "px";
  });

  document.addEventListener("pointerover", (event) => {
    if (event.target.closest("a, button, input, textarea, label")) {
      cursor.classList.add("is-on");
    }
  });

  document.addEventListener("pointerout", (event) => {
    if (event.target.closest("a, button, input, textarea, label")) {
      cursor.classList.remove("is-on");
    }
  });
}

const hostButtons = [...document.querySelectorAll("[data-host][role='tab']")];
const hostBios = [...document.querySelectorAll(".host-bio")];

const showHost = (id) => {
  hostButtons.forEach((button) => {
    const on = button.dataset.host === id;
    button.classList.toggle("is-on", on);
    button.setAttribute("aria-selected", String(on));
    button._specular?.setPreset(on ? "copper" : "ghost");
  });
  hostBios.forEach((bio) => {
    const on = bio.dataset.host === id;
    bio.hidden = !on;
    bio.classList.toggle("is-on", on);
  });
};

hostButtons.forEach((button) => {
  button.addEventListener("click", () => showHost(button.dataset.host));
});

const TEST_ANSWERS = ["Почти никогда", "Иногда", "Часто", "Почти всегда"];
const TEST_LEVELS = [
  {
    max: 4,
    mark: "тихий фон",
    title: "Тихий фон напряжения",
    lead: "Похоже, вы уже умеете замечать паузы. Напряжение есть, но оно не держит весь день.",
    tips: [
      "Сохраните короткий ритуал замедления: несколько минут без экрана утром или вечером.",
      "Замечайте, в какой части тела появляется зажим — этого уже достаточно, чтобы он слабел.",
      "Если хочется углубить это состояние, пять дней в другой обстановке дают больше пространства для тишины."
    ]
  },
  {
    max: 9,
    mark: "привычный фон",
    title: "Привычное напряжение",
    lead: "Тело и мысли уже сигналят, но вы всё ещё держите ритм. Фон стал привычным — и потому его легко не замечать.",
    tips: [
      "В середине дня остановитесь на три минуты: плечи вниз, внимание к дыханию, без телефона.",
      "Вечером запишите один пункт, который можно не решать до утра.",
      "Смена места и мягкие практики помогают увидеть, где напряжение стало автоматическим."
    ]
  },
  {
    max: 15,
    mark: "высокая плотность",
    title: "Жизнь на пределе",
    lead: "Похоже, вы давно живёте в режиме «надо». Это не диагноз — только наблюдение о плотности дней.",
    tips: [
      "Начните с малого: десять минут без экрана, лёжа или сидя, и отметьте, где тело держит.",
      "Если есть сильная тревога, бессонница или жалобы на здоровье, сначала поговорите со специалистом.",
      "Если откликается идея остановиться в другой обстановке, напишите нам и уточните, подходит ли формат."
    ]
  }
];

const testCard = document.getElementById("tensionTest");
const testSection = document.getElementById("test");
const testSteps = document.getElementById("testSteps");
const testResult = document.getElementById("testResult");
const testCount = document.getElementById("testCount");
const testTips = document.getElementById("testTips");
let testScores = [null, null, null, null, null];
let testStep = 0;
let testSummary = "";
let testBusy = false;
const testReduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const questions = [...testCard.querySelectorAll(".test-q")];

const paintTestBlot = () => {
  const filled = testScores.filter((value) => value !== null);
  const sum = filled.reduce((total, value) => total + Number(value), 0);
  const t = sum / (questions.length * 3);
  testSection.style.setProperty("--veil", t.toFixed(3));
  testCard.style.setProperty("--blot", t.toFixed(3));
};

questions.forEach((question, index) => {
  const box = question.querySelector(".test-opts");
  TEST_ANSWERS.forEach((label, value) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "orb orb-mini";
    button.dataset.tension = String(value);
    button.style.setProperty("--heat", String(value / 3));
    button.setAttribute("aria-pressed", "false");
    button.innerHTML = "<i></i><span>" + label + "</span>";
    button.addEventListener("click", () => chooseTestAnswer(index, value, button));
    box.appendChild(button);
  });
});

const showTestStep = () => {
  questions.forEach((question, index) => {
    const on = index === testStep && !testSummary;
    const wasOn = question.classList.contains("is-on");
    if (wasOn && !on && !testReduce) {
      question.classList.remove("is-on");
      question.classList.add("is-leaving");
      window.setTimeout(() => question.classList.remove("is-leaving"), 480);
      return;
    }
    question.classList.toggle("is-on", on);
    if (!on) question.classList.remove("is-leaving");
  });
  testCount.textContent = "вопрос " + (testStep + 1) + " из " + questions.length;
  testCard.querySelectorAll(".test-track i").forEach((dot, index) => {
    dot.classList.toggle("is-on", index === testStep && !testSummary);
    dot.classList.toggle("is-done", index < testStep || Boolean(testSummary));
  });
  paintTestBlot();
};

const chooseTestAnswer = (index, value, button) => {
  if (testBusy || index !== testStep) return;
  testScores[index] = value;
  button.parentElement.querySelectorAll(".orb").forEach((item) => {
    const on = item === button;
    item.classList.toggle("is-on", on);
    item.setAttribute("aria-pressed", String(on));
  });
  paintTestBlot();
  testBusy = true;
  window.setTimeout(() => {
    testBusy = false;
    if (index < questions.length - 1) {
      testStep = index + 1;
      showTestStep();
      return;
    }
    finishTest();
  }, testReduce ? 80 : 620);
};

const finishTest = () => {
  const total = testScores.reduce((sum, value) => sum + Number(value), 0);
  const level = TEST_LEVELS.find((item) => total <= item.max);
  testSummary = level.title + " (" + total + " из 15)";

  document.getElementById("testLevelMark").textContent = level.mark;
  document.getElementById("testLevel").textContent = level.title;
  document.getElementById("testLead").textContent = level.lead;
  testTips.innerHTML = level.tips.map((tip) => "<li>" + tip + "</li>").join("");

  testSteps.hidden = true;
  testCount.hidden = true;
  testResult.hidden = false;
  testCard.classList.add("is-settled");
  showTestStep();
};

document.getElementById("testRestart").addEventListener("click", () => {
  testScores = [null, null, null, null, null];
  testStep = 0;
  testSummary = "";
  testBusy = false;
  testSteps.hidden = false;
  testCount.hidden = false;
  testResult.hidden = true;
  testCard.classList.remove("is-settled");
  testCard.querySelectorAll(".test-opts .orb").forEach((button) => {
    button.classList.remove("is-on");
    button.setAttribute("aria-pressed", "false");
  });
  testSection.style.setProperty("--veil", "0");
  testCard.style.setProperty("--blot", "0");
  showTestStep();
});

showTestStep();

const practiceRoot = document.getElementById("groundPractice");
const practiceBeforeBox = document.getElementById("practiceBefore");
const practiceAfterBox = document.getElementById("practiceAfter");
let practiceBefore = null;
let practiceAfter = null;
let practiceSummary = "";

const showPractice = (step) => {
  practiceRoot.querySelectorAll("[data-practice]").forEach((panel) => {
    const on = panel.dataset.practice === step;
    panel.hidden = !on;
    panel.classList.toggle("is-on", on);
  });
};

const fillPracticeScale = (box, onPick) => {
  box.innerHTML = "";
  for (let value = 1; value <= 10; value += 1) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "orb orb-mini";
    button.style.setProperty("--heat", String((value - 1) / 9));
    button.innerHTML = "<i></i><span>" + value + "</span>";
    button.setAttribute("aria-label", "Напряжение " + value + " из 10");
    button.addEventListener("click", () => {
      box.querySelectorAll(".orb").forEach((item) => item.classList.toggle("is-on", item === button));
      onPick(value);
    });
    box.appendChild(button);
  }
};

const practiceNote = (before, after) => {
  const diff = after - before;
  if (diff <= -2) return "Фон стал заметно тише. Запомните это ощущение опоры — к нему можно возвращаться в обычном дне.";
  if (diff < 0) return "Стало чуть легче. Даже небольшой сдвиг уже наблюдение, а не оценка «получилось / нет».";
  if (diff === 0) return "Цифра та же. Иногда внимание просто проявляет то, что уже было, — и это тоже результат.";
  return "Тело могло отозваться сильнее. Это тоже внимание, не ошибка и не ухудшение.";
};

const finishPractice = () => {
  practiceSummary = "до " + practiceBefore + ", после " + practiceAfter;
  document.getElementById("practiceTitle").textContent = "Фон до и после";
  document.getElementById("practiceCompare").innerHTML =
    "<div class=\"practice-score\"><b>" + practiceBefore + "</b><span>до практики</span></div>" +
    "<div class=\"practice-score\"><b>" + practiceAfter + "</b><span>после практики</span></div>";
  document.getElementById("practiceNote").textContent = practiceNote(practiceBefore, practiceAfter);
  showPractice("result");
};

practiceRoot.querySelectorAll("[data-next]").forEach((button) => {
  button.addEventListener("click", () => showPractice(button.dataset.next));
});

fillPracticeScale(practiceBeforeBox, (value) => {
  practiceBefore = value;
  window.setTimeout(() => showPractice("feet"), 220);
});

fillPracticeScale(practiceAfterBox, (value) => {
  practiceAfter = value;
  window.setTimeout(finishPractice, 220);
});

document.getElementById("practiceRestart").addEventListener("click", () => {
  practiceBefore = null;
  practiceAfter = null;
  practiceSummary = "";
  practiceRoot.querySelectorAll(".orb-mini").forEach((button) => button.classList.remove("is-on"));
  showPractice("intro");
});

const FUTURE_INTENTS = ["тишина", "опора", "ясность", "лёгкость", "тепло", "цельность"];
const futureRoot = document.getElementById("futurePractice");
const futureIntents = document.getElementById("futureIntents");
const futureForm = document.getElementById("futureForm");
const futureWish = document.getElementById("futureWish");
const releaseForm = document.getElementById("releaseForm");
const releaseText = document.getElementById("releaseText");
const releaseStage = document.getElementById("releaseStage");
const releasePaper = document.getElementById("releasePaper");
let futureIntent = "";
let futureWishText = "";
let futureRelease = "";
let futureSummary = "";
let paperHandle = null;
const futureStage = document.querySelector(".future-stage");
const futureOrbWrap = document.getElementById("futureOrbWrap");
const futureBallRoot = document.getElementById("futureBall");
const orbFallback = document.getElementById("orbFallback");
const orbWish = document.getElementById("orbWish");
const wishSheet = document.getElementById("wishSheet");
const wishSheetBody = document.getElementById("wishSheetBody");
const WISH_COLORS = ["#F25BD0", "#9fe3df", "#FFD36E", "#9478FF", "#c07a3a"];
let crystalBall = null;
let fallbackBall = null;
let chargeRaf = 0;
let chargeStarted = 0;

const hexToRgb = (hex) => {
  const n = parseInt(String(hex).replace("#", ""), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};

const mountFallbackBall = (canvas) => {
  if (!canvas) return null;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  const state = {
    fill: 0.32,
    color: hexToRgb("#F25BD0"),
    glow: 0.9,
    crackle: 0.85,
    flares: 0.65,
    surge: 0,
    t: 0
  };
  const dust = Array.from({ length: 240 }, () => {
    const angle = Math.random() * Math.PI * 2;
    const radius = Math.pow(Math.random(), 0.55);
    return {
      a: angle,
      r: radius,
      y: (Math.random() * 2 - 1) * 0.85,
      s: 0.7 + Math.random() * 2.2,
      sp: 0.12 + Math.random() * 0.5,
      ph: Math.random() * Math.PI * 2,
      tone: Math.random()
    };
  });
  let raf = 0;
  let last = performance.now();
  const resize = () => {
    const box = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.max(1, Math.round(box.width * dpr));
    canvas.height = Math.max(1, Math.round(box.height * dpr));
  };
  const draw = (now) => {
    raf = requestAnimationFrame(draw);
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    state.t += dt;
    state.surge *= Math.exp(-dt / 0.7);
    const { width, height } = canvas;
    const cx = width / 2;
    const cy = height / 2;
    const R = Math.min(cx, cy) * 0.98;
    const [cr, cg, cb] = state.color;
    ctx.clearRect(0, 0, width, height);
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.clip();
    const haze = ctx.createRadialGradient(cx, cy + R * 0.28, R * 0.08, cx, cy, R);
    haze.addColorStop(0, `rgba(${cr}, ${cg}, ${cb}, ${0.18 + state.fill * 0.28})`);
    haze.addColorStop(0.55, `rgba(${Math.max(0, cr - 40)}, ${Math.min(255, cg + 30)}, ${Math.min(255, cb + 40)}, ${0.1 + state.fill * 0.16})`);
    haze.addColorStop(1, "rgba(7, 9, 13, 0)");
    ctx.fillStyle = haze;
    ctx.fillRect(0, 0, width, height);
    dust.forEach((p) => {
      const rise = ((state.t * p.sp + p.ph) % 1);
      const bowl = Math.pow((p.y + 1) * 0.5, 1.15 + (0.5 - state.fill) * 1.4);
      const y = (bowl * 2 - 1) - (rise - 0.5) * 0.22;
      const sway = Math.sin(state.t * 0.7 + p.ph) * 0.04;
      const x = Math.cos(p.a + sway) * p.r * Math.sqrt(Math.max(0, 1 - y * y));
      const px = cx + x * R;
      const py = cy - y * R;
      const inside = x * x + y * y;
      if (inside > 0.96) return;
      const twinkle = 0.45 + 0.55 * (0.5 + 0.5 * Math.sin(state.t * 3 + p.ph));
      const size = p.s * (0.6 + state.fill * 0.8) * (width / 420);
      ctx.fillStyle = p.tone > 0.7
        ? `rgba(255, 236, 196, ${0.35 + twinkle * 0.45})`
        : `rgba(${cr}, ${cg}, ${cb}, ${0.28 + twinkle * 0.5})`;
      ctx.fillRect(px, py, size, size);
    });
    const rim = 2 + state.crackle * 4 + state.surge * 6;
    ctx.strokeStyle = `rgba(${Math.min(255, cr + 80)}, ${Math.min(255, cg + 40)}, ${Math.min(255, cb + 40)}, ${0.7 + state.glow * 0.2})`;
    ctx.lineWidth = Math.max(1.4, R * 0.012);
    ctx.beginPath();
    for (let i = 0; i <= 220; i++) {
      const th = (i / 220) * Math.PI * 2;
      const wave = Math.sin(th * 7 + state.t * 2.2) * 0.35 + Math.sin(th * 13 + state.t * 3.1) * 0.2;
      const off = (rim + wave * rim * 1.8) * (0.4 + state.crackle);
      const rr = R - 2 + off;
      const x = cx + Math.cos(th) * rr;
      const y = cy + Math.sin(th) * rr;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.stroke();
    ctx.restore();
    const glow = ctx.createRadialGradient(cx, cy, R * 0.82, cx, cy, R * 1.08);
    glow.addColorStop(0, "rgba(255,255,255,0)");
    glow.addColorStop(0.7, `rgba(${cr}, ${cg}, ${cb}, ${0.12 + state.glow * 0.08})`);
    glow.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, width, height);
  };
  resize();
  raf = requestAnimationFrame(draw);
  window.addEventListener("resize", resize);
  return {
    set(partial = {}) {
      if (partial.fill != null) state.fill = partial.fill;
      if (partial.glow != null) state.glow = partial.glow;
      if (partial.crackle != null) state.crackle = partial.crackle;
      if (partial.flares != null) state.flares = partial.flares;
      if (partial.color) state.color = hexToRgb(partial.color);
    },
    kick() {
      state.surge = 1.2;
    },
    dispose() {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    }
  };
};

const ballOptions = () => {
  const compact = window.matchMedia("(max-width: 640px)").matches;
  return {
    preset: "plasma",
    color: "#F25BD0",
    size: 1,
    crackle: 0.85,
    fill: 0.32,
    interactive: true,
    hoverStrength: 0.7,
    strands: 6,
    flares: 0.65,
    glow: 0.9,
    sparks: 0.6,
    particleCount: compact ? 7000 : 12000,
    motion: "rise",
    particleShape: "square",
    depth: 0.6,
    sway: 0.5,
    twinkle: 0.5,
    haze: 0.7,
    dustSpeed: 1,
    speed: 1,
    intro: true,
    paused: false
  };
};

const parkForeignWebGL = () => {
  document.querySelectorAll("canvas").forEach((canvas) => {
    if (canvas.closest("#futureBall, #futureOrbWrap, #releasePaper, .flying-button")) return;
    try {
      const gl = canvas.getContext("webgl2") || canvas.getContext("webgl");
      gl?.getExtension("WEBGL_lose_context")?.loseContext();
    } catch (_) {}
  });
};

const setBall = (partial) => {
  fallbackBall?.set(partial);
  crystalBall?.set(partial);
};

const kickBall = () => {
  fallbackBall?.kick();
  crystalBall?.kick(0, 0.15, 1.15);
};

const mountFutureBall = () => {
  if (!fallbackBall) fallbackBall = mountFallbackBall(orbFallback);
  if (crystalBall || !futureBallRoot) return;
  if (typeof window.mountCrystalizedBall !== "function") return;
  parkForeignWebGL();
  try {
    crystalBall = window.mountCrystalizedBall(futureBallRoot, ballOptions());
  } catch (_) {
    crystalBall = null;
  }
  if (crystalBall && orbFallback) orbFallback.style.opacity = "0";
};

const whenBallReady = (fn) => {
  if (typeof window.mountCrystalizedBall === "function") fn();
  else window.addEventListener("crystal-ball-ready", fn, { once: true });
};

fallbackBall = mountFallbackBall(orbFallback);
whenBallReady(() => {
  const section = document.getElementById("future");
  if (!section) {
    mountFutureBall();
    return;
  }
  const io = new IntersectionObserver((entries) => {
    if (entries.some((entry) => entry.isIntersecting)) {
      mountFutureBall();
      io.disconnect();
    }
  }, { rootMargin: "240px" });
  io.observe(section);
});

const mixHex = (a, b, t) => {
  const parse = (hex) => {
    const n = parseInt(String(hex).slice(1), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  };
  const A = parse(a);
  const B = parse(b);
  const m = (i) => Math.round(A[i] + (B[i] - A[i]) * t);
  return "#" + [m(0), m(1), m(2)].map((v) => v.toString(16).padStart(2, "0")).join("");
};

const stopCharge = () => {
  if (chargeRaf) cancelAnimationFrame(chargeRaf);
  chargeRaf = 0;
};

const startCharge = () => {
  stopCharge();
  futureOrbWrap?.classList.add("is-lit");
  chargeStarted = performance.now();
  const tick = (now) => {
    const t = (now - chargeStarted) / 1000;
    const fill = 0.32 + 0.52 * (1 - Math.exp(-t / 1.35));
    const cycle = t / 1.8;
    const i = Math.floor(cycle) % WISH_COLORS.length;
    const n = (i + 1) % WISH_COLORS.length;
    const u = cycle - Math.floor(cycle);
    setBall({
      fill: Math.min(0.86, fill),
      color: mixHex(WISH_COLORS[i], WISH_COLORS[n], u),
      glow: 0.85 + 0.35 * Math.sin(t * 1.4),
      crackle: 0.7 + 0.35 * (0.5 + 0.5 * Math.sin(t * 0.9)),
      flares: 0.55 + 0.3 * (0.5 + 0.5 * Math.sin(t * 1.1))
    });
    chargeRaf = requestAnimationFrame(tick);
  };
  chargeRaf = requestAnimationFrame(tick);
};

const resetBallRitual = () => {
  stopCharge();
  futureStage?.classList.remove("is-ritual");
  futureOrbWrap?.classList.remove("is-lit");
  if (orbWish) {
    orbWish.classList.remove("is-on");
    orbWish.innerHTML = "";
  }
  if (wishSheet) {
    wishSheet.hidden = true;
    wishSheet.classList.remove("is-fly");
    wishSheet.style.transform = "";
  }
  setBall({
    fill: 0.32,
    color: "#F25BD0",
    glow: 0.9,
    crackle: 0.85,
    flares: 0.65
  });
};

const fillOrbWish = (text) => {
  if (!orbWish) return;
  orbWish.innerHTML = "";
  const line = document.createElement("span");
  line.className = "orb-wish-line";
  let index = 0;
  String(text).split(/(\s+)/).forEach((chunk) => {
    if (!chunk) return;
    if (/^\s+$/.test(chunk)) {
      const space = document.createElement("span");
      space.className = "orb-space";
      space.style.setProperty("--i", String(index++));
      space.innerHTML = "&nbsp;";
      line.appendChild(space);
      return;
    }
    const word = document.createElement("span");
    word.className = "orb-word";
    [...chunk].forEach((ch) => {
      const span = document.createElement("span");
      span.textContent = ch;
      span.style.setProperty("--i", String(index++));
      word.appendChild(span);
    });
    line.appendChild(word);
  });
  orbWish.appendChild(line);
  orbWish.classList.add("is-on");
};

const flyWishIntoBall = (text) => {
  const target = futureOrbWrap || futureBallRoot;
  if (!wishSheet || !wishSheetBody || !futureWish || !target) {
    fillOrbWish(text);
    kickBall();
    startCharge();
    return;
  }
  wishSheetBody.textContent = text;
  wishSheet.hidden = false;
  wishSheet.classList.remove("is-fly");
  wishSheet.style.visibility = "hidden";
  wishSheet.style.transform = "translate(0, 0)";
  const sheetW = wishSheet.offsetWidth;
  const sheetH = wishSheet.offsetHeight;
  const from = futureWish.getBoundingClientRect();
  const to = target.getBoundingClientRect();
  const startX = from.left + from.width / 2 - sheetW / 2;
  const startY = from.top + Math.min(20, from.height / 6);
  const targetX = to.left + to.width / 2 - sheetW / 2;
  const targetY = to.top + to.height / 2 - sheetH / 2;
  wishSheet.style.visibility = "";
  wishSheet.style.transform = `translate(${startX}px, ${startY}px) rotate(-4deg)`;
  const finish = () => {
    wishSheet.hidden = true;
    wishSheet.classList.remove("is-fly");
    fillOrbWish(text);
    kickBall();
    startCharge();
  };
  if (reduceMotion) {
    finish();
    return;
  }
  window.requestAnimationFrame(() => {
    wishSheet.classList.add("is-fly");
    wishSheet.style.transform = `translate(${targetX}px, ${targetY}px) scale(0.16) rotate(12deg)`;
  });
  window.setTimeout(finish, 1180);
};

const showFuture = (step) => {
  futureStage?.classList.toggle("is-ritual", step === "charge");
  futureRoot.querySelectorAll("[data-future]").forEach((panel) => {
    const on = panel.dataset.future === step;
    panel.hidden = !on;
    panel.classList.toggle("is-on", on);
  });
};

futureRoot.querySelectorAll("[data-future-next]").forEach((button) => {
  button.addEventListener("click", () => showFuture(button.dataset.futureNext));
});

FUTURE_INTENTS.forEach((label) => {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "signal";
  button.textContent = label;
  button.addEventListener("click", () => {
    futureIntent = label;
    futureIntents.querySelectorAll(".signal").forEach((item) => item.classList.toggle("is-on", item === button));
    window.setTimeout(() => showFuture("phrase"), 180);
  });
  futureIntents.appendChild(button);
});

const wrapPaperLines = (ctx, text, maxWidth) => {
  const words = String(text).split(/\s+/);
  const lines = [];
  let line = "";
  words.forEach((word) => {
    const next = line ? line + " " + word : word;
    if (ctx.measureText(next).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  });
  if (line) lines.push(line);
  return lines;
};

const drawReleaseSheet = async (text) => {
  if (document.fonts && document.fonts.load) {
    await document.fonts.load("600 44px Caveat");
  }
  const size = 800;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#f4f0e8";
  ctx.fillRect(0, 0, size, size);
  const grain = ctx.getImageData(0, 0, size, size);
  for (let i = 0; i < grain.data.length; i += 4) {
    const n = (Math.random() - 0.5) * 16;
    grain.data[i] += n;
    grain.data[i + 1] += n;
    grain.data[i + 2] += n;
  }
  ctx.putImageData(grain, 0, 0);
  ctx.strokeStyle = "rgba(176, 140, 90, .22)";
  ctx.lineWidth = 1;
  for (let y = 168; y < 740; y += 44) {
    ctx.beginPath();
    ctx.moveTo(72, y);
    ctx.lineTo(728, y);
    ctx.stroke();
  }
  ctx.strokeStyle = "rgba(184, 67, 50, .2)";
  ctx.beginPath();
  ctx.moveTo(108, 52);
  ctx.lineTo(108, 760);
  ctx.stroke();
  ctx.fillStyle = "rgba(192, 122, 58, .82)";
  ctx.font = "500 22px Geologica, sans-serif";
  ctx.fillText("уже пора отпустить", 128, 92);
  ctx.fillStyle = "#3a241c";
  ctx.font = "600 44px Caveat, cursive";
  wrapPaperLines(ctx, text, 560).slice(0, 11).forEach((line, index) => {
    ctx.save();
    ctx.translate(128, 176 + index * 44);
    ctx.rotate((index % 2 ? -1 : 1) * 0.012);
    ctx.fillText(line, 0, 0);
    ctx.restore();
  });
  return canvas.toDataURL("image/png");
};

const disposePaper = () => {
  if (paperHandle && paperHandle.dispose) paperHandle.dispose();
  paperHandle = null;
  releasePaper.innerHTML = "";
};

const showReleaseForm = () => {
  disposePaper();
  releaseForm.hidden = false;
  releaseStage.hidden = true;
  const hint = document.getElementById("releaseHint");
  if (hint) hint.textContent = "Зажмите лист, чтобы скатать в комок. Отпустите — комок рассыплется в пыль.";
};

futureForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!futureForm.reportValidity()) return;
  const wish = futureWish.value.trim();
  if (!wish || !futureIntent) return;
  futureWishText = wish;
  mountFutureBall();
  showFuture("charge");
  futureOrbWrap?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" });
  window.setTimeout(() => flyWishIntoBall(wish), reduceMotion ? 0 : 380);
});

releaseForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!releaseForm.reportValidity()) return;
  const note = releaseText.value.trim();
  if (!note) return;
  futureRelease = note;
  releaseForm.hidden = true;
  releaseStage.hidden = false;
  disposePaper();
  const src = await drawReleaseSheet(note);
  if (typeof window.mountPaperCrumple === "function") {
    const hint = document.getElementById("releaseHint");
    paperHandle = window.mountPaperCrumple(releasePaper, {
      src,
      alt: "Лист с тем, что пора отпустить",
      width: 400,
      height: 400,
      sceneHeight: window.matchMedia("(max-width: 640px)").matches ? 300 : 360,
      releaseBehavior: "dissolve",
      crumpleAmount: 0.92,
      crumpleDuration: 0.62,
      releaseDuration: 0.4,
      foldCount: 6,
      foldSharpness: 0.6,
      wrinkleDepth: 0.65,
      creaseStrength: 0.18,
      paperColor: "#f4f0e8",
      paperTexture: 0.08,
      draggable: true,
      returnToOrigin: true,
      imageFit: "contain",
      roughness: 0.92,
      lightIntensity: 1.8,
      lightAngle: -35,
      shadow: true,
      shadowOpacity: 0.16,
      dragRotation: 10,
      dragRadius: 180,
      rotation: 0,
      seed: 7,
      detail: window.matchMedia("(max-width: 980px)").matches ? 48 : 64,
      dissolveDuration: 2.4,
      dissolveThreshold: 0.38,
      onDissolveStart() {
        if (hint) hint.textContent = "Ком рассыпается. То, что написано, уходит в пыль.";
      },
      onDissolved() {
        if (hint) hint.textContent = "Отпущено. Можно собрать карточку или написать иначе.";
      }
    });
  }
});

document.getElementById("releaseRewrite").addEventListener("click", showReleaseForm);

document.getElementById("releaseToCard").addEventListener("click", () => {
  futureSummary = "намерение — " + futureIntent +
    ". Когда я вернусь домой, мне хотелось бы " + futureWishText +
    ". Уже пора отпустить: " + futureRelease;
  document.getElementById("futureCardIntent").textContent = "намерение · " + futureIntent;
  document.getElementById("futureCardWish").textContent = futureWishText;
  document.getElementById("futureCardRelease").textContent = "отпускаю: " + futureRelease;
  showFuture("card");
});

document.getElementById("futureRestart").addEventListener("click", () => {
  futureIntent = "";
  futureWishText = "";
  futureRelease = "";
  futureSummary = "";
  futureWish.value = "";
  releaseText.value = "";
  showReleaseForm();
  resetBallRitual();
  futureIntents.querySelectorAll(".signal").forEach((item) => item.classList.remove("is-on"));
  showFuture("intro");
});

document.getElementById("futureToContact").addEventListener("click", () => {
  const field = document.getElementById("message");
  if (field && futureSummary && !field.value.trim()) {
    field.value = futureSummary;
  }
});

const setFormStatus = (kind, text) => {
  formStatus.style.display = "block";
  formStatus.classList.remove("is-wait", "is-err");
  if (kind) formStatus.classList.add(kind);
  formStatus.textContent = text;
};

let sendingApplication = false;

const sendApplication = async () => {
  if (sendingApplication) return false;
  if (!contactForm.reportValidity()) return false;

  const honey = contactForm.querySelector("[name='_gotcha']");
  if (honey && honey.value.trim()) {
    setFormStatus("", "Заявка отправлена. Мы перезвоним в указанное время.");
    return true;
  }

  const name = document.getElementById("name").value.trim();
  const phone = document.getElementById("userPhone").value.trim();
  const callbackTime = document.getElementById("callbackTime").value.trim();
  const message = document.getElementById("message").value.trim();
  const body = [
    "Здравствуйте! Заявка с сайта «Новая точка энергии».",
    "",
    "Имя: " + name,
    "Телефон: " + phone,
    "Удобное время для звонка: " + callbackTime,
    "Вопрос: " + (message || "Нет дополнительных вопросов"),
    "",
    "Интенсив: 17–22 ноября, Адыгея",
    "Стоимость: 50 000 рублей",
    testSummary ? "Тест на напряжение: " + testSummary : "",
    practiceSummary ? "Практика опоры: " + practiceSummary : "",
    futureSummary ? "Запрос из будущего: " + futureSummary : ""
  ].filter(Boolean).join("\n");

  sendingApplication = true;
  setFormStatus("is-wait", "Открываем WhatsApp с текстом заявки…");
  try {
    openWhatsApp(body);
    setFormStatus("", "Открылся WhatsApp. Проверьте текст и нажмите «Отправить» — заявка придёт на +7 928 772-06-36.");
    return true;
  } catch (error) {
    setFormStatus(
      "is-err",
      "Не удалось открыть WhatsApp. Напишите, пожалуйста, на +7 928 772-06-36 или на zoodiana@yandex.ru."
    );
    return false;
  } finally {
    sendingApplication = false;
  }
};

contactForm.addEventListener("submit", (event) => {
  event.preventDefault();
  sendApplication();
});

const submitFly = document.getElementById("submitFly");
if (submitFly) {
  submitFly.addEventListener("click", (event) => {
    if (!event.target.closest(".flying-button__craft")) return;
    event.preventDefault();
    event.stopPropagation();
    sendApplication();
  }, true);
}
