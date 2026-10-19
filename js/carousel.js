"use strict";

(() => {
const ADYGEA_ITEMS = [
  { src: "img/adygea-pause.jpg", alt: "Пауза на склоне Адыгеи", title: "Пауза", subtitle: "хребет" },
  { src: "img/adygea-path.jpg", alt: "Тропа в горах Адыгеи", title: "Тропа", subtitle: "тропа" },
  { src: "img/adygea-about.jpg", alt: "Пруд с лотосами в Адыгее", title: "Пруд", subtitle: "лотосы" },
  { src: "img/adygea-pond.jpg", alt: "Лотосы на воде", title: "Вода", subtitle: "тишина" },
  { src: "img/adygea-lotus.jpg", alt: "Цветок лотоса в Адыгее", title: "Цветок", subtitle: "лотос" },
  { src: "img/adygea-practice.jpg", alt: "Склоны Адыгеи", title: "Склон", subtitle: "лес" },
  { src: "img/adygea-place.jpg", alt: "Плато и пихты Адыгеи", title: "Место", subtitle: "плато" },
  { src: "img/adygea-hero.jpg", alt: "Сосны Адыгеи", title: "Сосны", subtitle: "лес" }
];

const PRESETS = {
  cylinder: {
    axis: "y",
    tilt: -5,
    perspective: 2500,
    curve: 1,
    spread: 1,
    inward: false,
    billboard: false,
    backfaces: true,
    window: 0
  }
};

const INTRO_LENGTH = { assemble: 1500, rise: 1400, spin: 1800, none: 0 };
const TILES = 1;
const OVERLAP = 0;
const DRAG_THRESHOLD = 5;
const SPRING = 118;
const SETTLE_SPEED = 9;
const TO_RAD = Math.PI / 180;

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const wrap = (degrees) => ((((degrees + 180) % 360) + 360) % 360) - 180;
const easeOut = (t) => 1 - Math.pow(1 - t, 4);
const easeOutQuint = (t) => 1 - Math.pow(1 - t, 5);

const rotateX = (p, degrees) => {
  const r = degrees * TO_RAD;
  const c = Math.cos(r);
  const s = Math.sin(r);
  return [p[0], p[1] * c - p[2] * s, p[1] * s + p[2] * c];
};

const rotateY = (p, degrees) => {
  const r = degrees * TO_RAD;
  const c = Math.cos(r);
  const s = Math.sin(r);
  return [p[0] * c + p[2] * s, p[1], -p[0] * s + p[2] * c];
};

const prefersReducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const loadImage = (src) =>
  new Promise((resolve) => {
    const image = new Image();
    image.decoding = "async";
    image.onload = () => (image.decode ? image.decode().then(resolve, resolve) : resolve());
    image.onerror = resolve;
    image.src = src;
  });

const makeTiles = (along, axis, curveValue, inward, radius) => {
  const total = curveValue > 0.001 ? TILES : 1;
  const length = along / total;
  const bend = curveValue > 0.001 ? radius / curveValue : 0;
  return Array.from({ length: total }, (_, index) => {
    const start = index * length - (index > 0 ? OVERLAP / 2 : 0);
    const end = (index + 1) * length + (index < total - 1 ? OVERLAP / 2 : 0);
    const center = (start + end) / 2 - along / 2;
    const alpha = bend ? center / bend : 0;
    const shift = bend ? bend * Math.sin(alpha) : center;
    const sink = bend ? bend * (1 - Math.cos(alpha)) : 0;
    const depth = inward ? sink : -sink;
    const turn = ((inward ? -alpha : alpha) * 180) / Math.PI;
    const move =
      axis === "x"
        ? "translate3d(0px, " + shift + "px, " + depth + "px) rotateX(" + -turn + "deg)"
        : "translate3d(" + shift + "px, 0px, " + depth + "px) rotateY(" + turn + "deg)";
    return { index, total, start, end, size: end - start, move };
  });
};

const appendTile = (card, item, tile, back, along, axis, cardW, cardH, radiusCss) => {
  const strip = back ? tile.total - 1 - tile.index : tile.index;
  const first = strip === 0;
  const last = strip === tile.total - 1;
  const frameRadius =
    axis === "x"
      ? (first ? radiusCss : "0") + " " + (first ? radiusCss : "0") + " " + (last ? radiusCss : "0") + " " + (last ? radiusCss : "0")
      : (first ? radiusCss : "0") + " " + (last ? radiusCss : "0") + " " + (last ? radiusCss : "0") + " " + (first ? radiusCss : "0");
  const offset = back ? along - tile.end : tile.start;
  const size = tile.size;
  const tileEl = document.createElement("div");
  tileEl.className = "circular-carousel__tile";
  tileEl.setAttribute("aria-hidden", "true");
  if (axis === "x") {
    tileEl.style.left = -cardW / 2 + "px";
    tileEl.style.top = -size / 2 + "px";
    tileEl.style.width = cardW + "px";
    tileEl.style.height = size + "px";
  } else {
    tileEl.style.left = -size / 2 + "px";
    tileEl.style.top = -cardH / 2 + "px";
    tileEl.style.width = size + "px";
    tileEl.style.height = cardH + "px";
  }
  const flip = back ? (axis === "x" ? " rotateX(180deg)" : " rotateY(180deg)") : "";
  tileEl.style.transform = tile.move + flip;

  const frame = document.createElement("div");
  frame.className = "circular-carousel__frame";
  frame.style.height = (axis === "x" ? size : cardH) + "px";
  frame.style.borderRadius = frameRadius;

  const photo = document.createElement("img");
  photo.className = "circular-carousel__photo";
  photo.src = item.src;
  photo.alt = "";
  photo.draggable = false;
  photo.decoding = "async";
  if (axis === "x") {
    photo.style.left = "-1px";
    photo.style.top = (-offset - 1) + "px";
    photo.style.width = (cardW + 2) + "px";
    photo.style.height = (cardH + 2) + "px";
  } else {
    photo.style.left = (-offset - 1) + "px";
    photo.style.top = "-1px";
    photo.style.width = (cardW + 2) + "px";
    photo.style.height = (cardH + 2) + "px";
  }

  frame.appendChild(photo);
  if (back) {
    const inner = document.createElement("div");
    inner.className = "circular-carousel__inner";
    frame.appendChild(inner);
  }
  const shade = document.createElement("div");
  shade.className = "circular-carousel__shade";
  frame.appendChild(shade);
  tileEl.appendChild(frame);
  card.appendChild(tileEl);
};

const mountCircularCarousel = (root, options) => {
  const items = options.items && options.items.length ? options.items : ADYGEA_ITEMS;
  const reduced = prefersReducedMotion();
  const layout = PRESETS[options.preset] || PRESETS.cylinder;
  const axis = layout.axis;
  const count = items.length;
  const step = 360 / count;
  const tiltValue = options.tilt ?? layout.tilt;
  const curveValue = layout.billboard ? 0 : clamp(options.curve ?? layout.curve, 0, 1);
  const cardW = Math.max(40, options.cardWidth || 220);
  const cardH = cardW / clamp(options.aspectRatio || 0.72, 0.2, 5);
  const along = axis === "x" ? cardH : cardW;
  const n = Math.max(count, 3);
  const pitch = (along + (options.gap ?? 25)) * layout.spread;
  const chord = pitch / (2 * Math.sin(Math.PI / n));
  const arc = (n * pitch) / (2 * Math.PI);
  const radius = Math.max(chord + (arc - chord) * curveValue, along * 0.6);
  const tiles = makeTiles(along, axis, curveValue, layout.inward, radius);
  const dragSign = layout.inward ? -1 : 1;
  const directionSign = ((options.direction === "right" ? 1 : -1) * dragSign);
  const settings = {
    count,
    step,
    radius,
    layout,
    axis,
    tilt: tiltValue,
    perspective: layout.inward ? radius : (options.perspective ?? layout.perspective),
    cardW,
    cardH,
    intro: reduced ? "none" : (options.intro in INTRO_LENGTH ? options.intro : "rise"),
    autoplay: reduced ? "off" : (options.autoplay || "drift"),
    speed: options.speed ?? 14,
    interval: Math.max(0.5, options.interval ?? 3),
    draggable: options.draggable !== false,
    momentum: clamp(options.momentum ?? 0.6, 0, 1),
    snap: options.snap !== false,
    pauseOnHover: options.pauseOnHover !== false,
    parallax: reduced ? 0 : clamp(options.parallax ?? 0.3, 0, 1),
    stretch: reduced ? 0 : clamp(options.stretch ?? 0.5, 0, 1),
    depthFade: clamp(options.depthFade ?? 0.55, 0, 1),
    reduced
  };

  root.classList.add("circular-carousel");
  root.style.setProperty("--cc-fade", options.fadeColor || "#0b0908");
  root.style.setProperty("--cc-radius", Math.max(0, options.cornerRadius ?? 8) + "px");
  root.style.setProperty("--cc-inner", (1 - clamp(options.innerShade ?? 0.6, 0, 1)).toFixed(3));
  root.setAttribute("role", "region");
  root.setAttribute("aria-roledescription", "карусель");
  root.setAttribute("aria-label", options.label || "Фотографии Адыгеи");
  root.tabIndex = 0;
  root.dataset.axis = axis;
  root.dataset.shape = options.preset || "cylinder";
  if (settings.draggable) root.dataset.draggable = "";

  root.innerHTML = "";
  const view = document.createElement("div");
  view.className = "circular-carousel__view";
  const stage = document.createElement("div");
  stage.className = "circular-carousel__stage";
  const camera = document.createElement("div");
  camera.className = "circular-carousel__camera";
  const ring = document.createElement("div");
  ring.className = "circular-carousel__ring";
  const cardRefs = [];
  const radiusCss = "var(--cc-radius)";

  items.forEach((item, index) => {
    const card = document.createElement("div");
    card.className = "circular-carousel__card";
    card.dataset.ccIndex = String(index);
    card.setAttribute("role", "group");
    card.setAttribute("aria-roledescription", "слайд");
    card.setAttribute("aria-label", (item.title || item.alt) + ", " + (index + 1) + " из " + count);
    tiles.forEach((tile) => appendTile(card, item, tile, false, along, axis, cardW, cardH, radiusCss));
    if (layout.backfaces) {
      tiles.forEach((tile) => appendTile(card, item, tile, true, along, axis, cardW, cardH, radiusCss));
    }
    ring.appendChild(card);
    cardRefs.push(card);
  });

  camera.appendChild(ring);
  stage.appendChild(camera);
  view.appendChild(stage);
  root.appendChild(view);

  const live = document.createElement("div");
  live.className = "circular-carousel__live";
  live.setAttribute("aria-live", "polite");
  live.setAttribute("aria-atomic", "true");
  root.appendChild(live);

  const state = {
    angle: 0,
    velocity: 0,
    target: null,
    dir: directionSign,
    press: null,
    drag: false,
    hover: false,
    pointer: { inside: false, x: 0, y: 0 },
    yaw: 0,
    pitch: 0,
    intro: null,
    introDone: false,
    holdUntil: 0,
    stepAt: 0,
    suppressClick: false,
    wheelTimer: 0,
    fit: 1,
    shift: 0,
    drop: 0,
    last: 0
  };

  let active = 0;
  let ready = false;
  let raf = 0;
  let visible = true;

  const nearest = (angle) => Math.round(angle / settings.step) * settings.step;

  const announce = () => {
    const current = items[active] || items[0];
    live.textContent = (current.title || current.alt) + ", " + (active + 1) + " из " + count;
  };

  const measure = () => {
    const rect = root.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const width = rect.width * 0.94;
    const height = rect.height * 0.92;
    const P = settings.perspective;
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;
    const corners = [
      [-settings.cardW / 2, -settings.cardH / 2],
      [settings.cardW / 2, -settings.cardH / 2],
      [-settings.cardW / 2, settings.cardH / 2],
      [settings.cardW / 2, settings.cardH / 2]
    ];
    const limit = settings.layout.window ? settings.layout.window * settings.step : 148;
    for (let a = -limit; a <= limit; a += limit / 24) {
      for (const [cx, cy] of corners) {
        let p = rotateX(rotateY([cx, cy, settings.radius], a), settings.tilt);
        p = [p[0], p[1], p[2] - settings.radius];
        if (p[2] >= P * 0.95) continue;
        const k = P / (P - p[2]);
        minX = Math.min(minX, p[0] * k);
        maxX = Math.max(maxX, p[0] * k);
        minY = Math.min(minY, p[1] * k);
        maxY = Math.max(maxY, p[1] * k);
      }
    }
    const spanX = Math.max(maxX - minX, 1);
    const spanY = Math.max(maxY - minY, 1);
    const fit = Math.min(1, width / spanX, height / spanY);
    state.fit = fit;
    state.shift = -((minY + maxY) / 2) * fit;
    state.drop = (rect.height / fit) * 0.55 + settings.cardH;
    stage.style.perspective = P + "px";
    stage.style.transform = "translate3d(0, " + state.shift + "px, 0) scale(" + fit + ")";
  };

  const introCard = (elapsed, landing) => {
    if (!state.intro) return { radius: 1, lift: 0 };
    const type = state.intro.type;
    const reach = Math.abs(wrap(landing + state.angle));
    if (type === "rise") {
      const delay = (reach / 180) * 480;
      const p = easeOutQuint(clamp((elapsed - delay) / 900, 0, 1));
      return { radius: 1, lift: (1 - p) * state.drop };
    }
    if (type === "assemble") {
      const delay = (reach / 180) * 420;
      const p = easeOut(clamp((elapsed - delay) / 1080, 0, 1));
      return { radius: 1 + 0.6 * (1 - p), lift: 0 };
    }
    if (type === "spin") {
      const p = easeOut(clamp(elapsed / INTRO_LENGTH.spin, 0, 1));
      return { radius: 1 + 0.28 * (1 - p), lift: 0 };
    }
    return { radius: 1, lift: 0 };
  };

  const advance = (dt, now) => {
    if (!state.introDone && ready) {
      if (!state.intro) {
        if (settings.intro === "none") state.introDone = true;
        else state.intro = { type: settings.intro, start: now };
      }
      if (state.intro && now - state.intro.start >= INTRO_LENGTH[state.intro.type]) {
        state.intro = null;
        state.introDone = true;
      }
    }

    const paused = (settings.pauseOnHover && state.hover) || state.drag || now < state.holdUntil;
    const cruise = settings.autoplay === "drift" && !paused && !state.intro ? settings.speed * state.dir : 0;
    let busy = Boolean(state.intro) || state.drag;

    if (state.drag || state.intro) {
      state.velocity = state.drag ? state.velocity : 0;
    } else if (state.target !== null) {
      let remaining = dt;
      const damping = 2 * Math.sqrt(SPRING);
      while (remaining > 0) {
        const h = Math.min(remaining, 1 / 240);
        const accel = SPRING * (state.target - state.angle) - damping * state.velocity;
        state.velocity += accel * h;
        state.angle += state.velocity * h;
        remaining -= h;
      }
      if (Math.abs(state.target - state.angle) < 0.004 && Math.abs(state.velocity) < 0.03) {
        state.angle = state.target;
        state.velocity = 0;
        state.target = null;
      }
      busy = true;
    } else {
      const tau = 0.18 + settings.momentum * 1.5;
      state.velocity += (cruise - state.velocity) * (1 - Math.exp(-dt / tau));
      state.angle += state.velocity * dt;
      if (cruise === 0 && settings.snap && Math.abs(state.velocity) < SETTLE_SPEED) {
        state.target = nearest(state.angle);
      }
      busy = busy || cruise !== 0 || Math.abs(state.velocity) > 0.01 || state.target !== null;
    }

    if (now < state.holdUntil) busy = true;

    const ease = 1 - Math.exp(-dt / 0.35);
    const aimYaw = state.pointer.inside ? state.pointer.x * settings.parallax * 9 : 0;
    const aimPitch = state.pointer.inside ? -state.pointer.y * settings.parallax * 6 : 0;
    state.yaw += (aimYaw - state.yaw) * ease;
    state.pitch += (aimPitch - state.pitch) * ease;
    if (Math.abs(aimYaw - state.yaw) > 0.01 || Math.abs(aimPitch - state.pitch) > 0.01) busy = true;
    return busy;
  };

  const render = (now) => {
    const elapsed = state.intro ? now - state.intro.start : 0;
    const swell = 1 + settings.stretch * 0.12 * Math.min(1, Math.abs(state.velocity) / 420);
    let spinOffset = 0;
    if (state.intro && state.intro.type === "spin") {
      const p = easeOut(clamp(elapsed / INTRO_LENGTH.spin, 0, 1));
      spinOffset = -300 * state.dir * (1 - p);
    }
    const angle = state.angle + spinOffset;
    const R = settings.radius * swell;
    camera.style.transform =
      "translate3d(0, 0, " + -R + "px) rotateX(" + (settings.tilt + state.pitch) + "deg) rotateY(" + state.yaw + "deg)";
    ring.style.transform = "rotateY(" + angle + "deg)";

    for (let index = 0; index < settings.count; index += 1) {
      const card = cardRefs[index];
      if (!card) continue;
      const base = index * settings.step;
      const mod = introCard(elapsed, base);
      const r = R * mod.radius;
      let transform = "rotateY(" + base + "deg) translateZ(" + r + "px)";
      if (mod.lift) transform += " translateY(" + mod.lift + "px)";
      card.style.transform = transform;
      const world = wrap(base + angle);
      const facing = Math.cos(world * TO_RAD);
      const fade = settings.depthFade * Math.pow((1 - facing) / 2, 1.25);
      card.style.setProperty("--cc-depth", fade.toFixed(3));
    }

    const index = ((Math.round(-state.angle / settings.step) % settings.count) + settings.count) % settings.count || 0;
    if (index !== active) {
      active = index;
      announce();
    }
  };

  const wake = () => {
    if (!raf && visible && !document.hidden) raf = requestAnimationFrame(frame);
  };

  const frame = (now) => {
    raf = 0;
    const dt = state.last ? Math.min((now - state.last) / 1000, 0.05) : 1 / 60;
    state.last = now;
    const busy = advance(dt, now);
    render(now);
    if (busy && visible && !document.hidden) raf = requestAnimationFrame(frame);
    else state.last = 0;
  };

  const focusIndex = (index) => {
    let target = -index * settings.step;
    target += 360 * Math.round((state.angle - target) / 360);
    state.target = target;
    state.holdUntil = performance.now() + 2800;
    wake();
  };

  const stepBy = (delta) => {
    const base = state.target ?? Math.round(state.angle / settings.step) * settings.step;
    state.target = base - delta * settings.step;
    state.holdUntil = performance.now() + 2800;
    wake();
  };

  const updatePointer = (event) => {
    const rect = root.getBoundingClientRect();
    state.pointer.x = clamp(((event.clientX - rect.left) / rect.width) * 2 - 1, -1, 1);
    state.pointer.y = clamp(((event.clientY - rect.top) / rect.height) * 2 - 1, -1, 1);
  };

  const handlePointerDown = (event) => {
    state.suppressClick = false;
    if (!settings.draggable || event.button !== 0) return;
    state.press = {
      id: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      angle: state.angle,
      moved: false,
      origin: 0,
      samples: [{ time: performance.now(), angle: state.angle }]
    };
  };

  const handlePointerMove = (event) => {
    if (event.pointerType === "mouse") {
      state.pointer.inside = true;
      updatePointer(event);
    }
    const press = state.press;
    if (!press || press.id !== event.pointerId) {
      wake();
      return;
    }
    const delta = event.clientX - press.x;
    const cross = event.clientY - press.y;
    if (!press.moved) {
      if (Math.abs(delta) < DRAG_THRESHOLD) return;
      if (Math.abs(cross) > Math.abs(delta) * 1.2 && event.pointerType !== "mouse") {
        state.press = null;
        return;
      }
      press.moved = true;
      press.origin = delta;
      state.drag = true;
      state.target = null;
      state.velocity = 0;
      root.dataset.dragging = "";
      try {
        root.setPointerCapture(event.pointerId);
      } catch (error) {}
    }
    const perPixel = 180 / (Math.PI * settings.radius * state.fit);
    state.angle = press.angle + (delta - press.origin) * perPixel;
    const now = performance.now();
    press.samples.push({ time: now, angle: state.angle });
    while (press.samples.length > 2 && now - press.samples[0].time > 110) press.samples.shift();
    wake();
  };

  const releasePointer = (event) => {
    const press = state.press;
    if (!press || press.id !== event.pointerId) return;
    state.press = null;
    if (!press.moved) return;
    state.drag = false;
    delete root.dataset.dragging;
    state.suppressClick = true;
    const first = press.samples[0];
    const last = press.samples[press.samples.length - 1];
    const span = (last.time - first.time) / 1000;
    const velocity = span > 0.008 ? clamp((last.angle - first.angle) / span, -1400, 1400) : 0;
    state.velocity = velocity;
    if (Math.abs(velocity) > 60) state.dir = Math.sign(velocity);
    const coasting = settings.autoplay === "drift" && !(settings.pauseOnHover && state.hover && event.pointerType === "mouse");
    if (settings.snap && !coasting) {
      const tau = 0.18 + settings.momentum * 1.5;
      state.target = Math.round((state.angle + velocity * tau * 0.55) / settings.step) * settings.step;
    }
    wake();
  };

  root.addEventListener("pointerdown", handlePointerDown);
  root.addEventListener("pointermove", handlePointerMove);
  root.addEventListener("pointerup", releasePointer);
  root.addEventListener("pointercancel", releasePointer);
  root.addEventListener("pointerenter", (event) => {
    if (event.pointerType !== "mouse") return;
    state.hover = true;
    wake();
  });
  root.addEventListener("pointerleave", (event) => {
    if (event.pointerType === "mouse") {
      state.hover = false;
      state.pointer.inside = false;
    }
    wake();
  });
  root.addEventListener("click", (event) => {
    if (state.suppressClick) {
      state.suppressClick = false;
      return;
    }
    if (options.focusOnClick === false) return;
    const card = event.target.closest("[data-cc-index]");
    if (!card) return;
    focusIndex(Number(card.getAttribute("data-cc-index")));
  });
  root.addEventListener("keydown", (event) => {
    if (event.key === "ArrowRight") stepBy(1);
    else if (event.key === "ArrowLeft") stepBy(-1);
    else if (event.key === "Home") focusIndex(0);
    else if (event.key === "End") focusIndex(count - 1);
    else return;
    event.preventDefault();
  });
  root.addEventListener("wheel", (event) => {
    if (!settings.draggable) return;
    const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : 0;
    if (!delta) return;
    event.preventDefault();
    const perPixel = 180 / (Math.PI * settings.radius * state.fit);
    state.target = null;
    state.angle -= delta * perPixel;
    state.velocity = -delta * perPixel * 30;
    state.holdUntil = performance.now() + 1600;
    clearTimeout(state.wheelTimer);
    state.wheelTimer = setTimeout(() => {
      if (settings.snap) state.target = nearest(state.angle + state.velocity * 0.12);
      wake();
    }, 140);
    wake();
  }, { passive: false });

  const resize = new ResizeObserver(() => {
    measure();
    wake();
  });
  resize.observe(root);

  const io = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible) wake();
    else {
      cancelAnimationFrame(raf);
      raf = 0;
      state.last = 0;
    }
  });
  io.observe(root);

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      cancelAnimationFrame(raf);
      raf = 0;
      state.last = 0;
    } else wake();
  });

  const start = () => {
    ready = true;
    root.dataset.ready = "";
    measure();
    render(performance.now());
    announce();
    wake();
  };

  const timeout = new Promise((resolve) => setTimeout(resolve, 2400));
  Promise.race([Promise.all(items.map((item) => loadImage(item.src))), timeout]).then(start);

  return { wake, focusIndex };
};

const heroCarousel = document.getElementById("heroCarousel");
if (heroCarousel) {
  const narrow = window.matchMedia("(max-width: 980px)").matches;
  const compact = window.matchMedia("(max-width: 640px)").matches;
  mountCircularCarousel(heroCarousel, {
    items: ADYGEA_ITEMS,
    preset: "cylinder",
    intro: "rise",
    cardWidth: compact ? 148 : narrow ? 176 : 220,
    aspectRatio: 0.72,
    speed: 14,
    captions: false,
    gap: compact ? 18 : 25,
    tilt: -5,
    curve: 1,
    perspective: 2500,
    autoplay: "drift",
    interval: 3,
    direction: "left",
    momentum: 0.6,
    snap: true,
    pauseOnHover: true,
    focusOnClick: true,
    draggable: true,
    parallax: 0.3,
    stretch: 0.5,
    fadeColor: "#0b0908",
    depthFade: 0.55,
    innerShade: 0.6,
    cornerRadius: 8,
    label: "Фотографии Адыгеи"
  });
}
})();
