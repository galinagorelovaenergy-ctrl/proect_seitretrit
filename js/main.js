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
const stringPlucks = new WeakMap();

const questions = [...testCard.querySelectorAll(".test-q")];

const stringPath = (amp, phase) => {
  const left = 10;
  const right = 390;
  const mid = 20;
  const segs = 12;
  let d = "M " + left + " " + mid;
  for (let i = 1; i <= segs; i += 1) {
    const t = i / segs;
    const x = left + (right - left) * t;
    const y = mid + Math.sin(phase + t * Math.PI * 2) * amp * Math.sin(Math.PI * t);
    d += " L " + x.toFixed(1) + " " + y.toFixed(1);
  }
  return d;
};

const restPath = stringPath(0, 0);

const pluckString = (button) => {
  const path = button.querySelector(".test-string-wire");
  if (!path) return;
  const tension = Number(button.dataset.tension) || 0;
  if (testReduce) {
    path.setAttribute("d", restPath);
    return;
  }
  const prev = stringPlucks.get(path);
  if (prev) cancelAnimationFrame(prev);
  const amp = 5 + tension * 5.5;
  const freq = 9 + tension * 3.2;
  const start = performance.now();
  const tick = (now) => {
    const t = (now - start) / 1000;
    const decay = Math.exp(-t * (2.4 + (3 - tension) * 0.45));
    if (decay < 0.02 || t > 1.8) {
      path.setAttribute("d", restPath);
      stringPlucks.delete(path);
      return;
    }
    path.setAttribute("d", stringPath(amp * decay, t * freq));
    stringPlucks.set(path, requestAnimationFrame(tick));
  };
  stringPlucks.set(path, requestAnimationFrame(tick));
};

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
    button.className = "test-string";
    button.dataset.tension = String(value);
    button.setAttribute("aria-pressed", "false");
    button.innerHTML =
      "<span class=\"test-string-label\">" + label + "</span>" +
      "<svg viewBox=\"0 0 400 40\" aria-hidden=\"true\" focusable=\"false\">" +
      "<path class=\"test-string-wire\" d=\"" + restPath + "\"></path>" +
      "</svg>";
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
  button.parentElement.querySelectorAll(".test-string").forEach((item) => {
    const on = item === button;
    item.classList.toggle("is-picked", on);
    item.setAttribute("aria-pressed", String(on));
  });
  pluckString(button);
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
  testCard.querySelectorAll(".test-string").forEach((button) => {
    button.classList.remove("is-picked");
    button.setAttribute("aria-pressed", "false");
    const path = button.querySelector(".test-string-wire");
    if (path) path.setAttribute("d", restPath);
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

const showFuture = (step) => {
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
  showReleaseForm();
  showFuture("release");
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

contactForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (sendingApplication) return;
  if (!contactForm.reportValidity()) return;

  const honey = contactForm.querySelector("[name='_gotcha']");
  if (honey && honey.value.trim()) {
    setFormStatus("", "Заявка отправлена. Мы перезвоним в указанное время.");
    return;
  }

  const name = document.getElementById("name").value.trim();
  const phone = document.getElementById("userPhone").value.trim();
  const callbackTime = document.getElementById("callbackTime").value.trim();
  const message = document.getElementById("message").value.trim();
  const subject = "Заявка на интенсив в Адыгее";
  const payload = {
    _subject: subject,
    _template: "table",
    _captcha: "false",
    name,
    phone,
    callbackTime,
    message: message || "Нет дополнительных вопросов",
    program: "Ретрит Нового Состояния, 17–22 ноября, Адыгея, 50 000 ₽",
    test: testSummary || "—",
    practice: practiceSummary || "—",
    future: futureSummary || "—"
  };

  sendingApplication = true;
  setFormStatus("is-wait", "Отправляем заявку…");

  const ctrl = new AbortController();
  const timer = window.setTimeout(() => ctrl.abort(), 15000);
  try {
    const data = new FormData();
    Object.keys(payload).forEach((key) => data.append(key, payload[key]));
    const response = await fetch("https://formsubmit.co/ajax/" + ORGANIZER_EMAIL, {
      method: "POST",
      body: data,
      signal: ctrl.signal
    });
    const result = await response.json().catch(() => ({}));
    const note = String(result.message || result.error || "");
    if (!response.ok) throw new Error(note || "send-failed");
    if (/activ/i.test(note) || /confirm/i.test(note)) {
      setFormStatus(
        "",
        "На zoodiana@yandex.ru пришло письмо для активации отправки. Откройте его один раз — после этого заявки будут приходить сами."
      );
    } else {
      setFormStatus("", "Заявка отправлена. Мы перезвоним в указанное время.");
      contactForm.reset();
    }
  } catch (error) {
    setFormStatus(
      "is-err",
      "Не удалось отправить автоматически. Напишите, пожалуйста, на zoodiana@yandex.ru — имя, телефон и удобное время для звонка."
    );
  } finally {
    window.clearTimeout(timer);
    sendingApplication = false;
  }
});
