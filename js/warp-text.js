"use strict";

(() => {
const LENS_MODES = { bulge: 0, pinch: 1, swirl: 2 };
const INTRO_MS = 1600;
const RIPPLE_LIFE = 1.6;
const MAX_CLICKS = 4;

const VERTEX = `#version 300 es
in vec2 aPosition;
in vec2 aUv;
out vec2 vUv;
void main() {
  vUv = aUv;
  gl_Position = vec4(aPosition, 0.0, 1.0);
}
`;

const FRAGMENT = `#version 300 es
precision highp float;

uniform sampler2D uTextTexture;
uniform vec2 uResolution;
uniform vec2 uPointer;
uniform float uPointerActive;
uniform float uTime;
uniform float uWarpStrength;
uniform float uWarpScale;
uniform float uSpeed;
uniform float uPointerInfluence;
uniform float uPointerStrength;
uniform float uRefraction;
uniform float uChromatic;
uniform float uRipple;
uniform float uMotion;
uniform float uLens;
uniform float uIntro;
uniform float uReveal;
uniform float uBackdrop;
uniform vec4 uClicks[4];

in vec2 vUv;
out vec4 fragColor;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);

  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));

  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

float fbm(vec2 p) {
  float value = 0.0;
  float amplitude = 0.5;
  for (int i = 0; i < 4; i++) {
    value += amplitude * noise(p);
    p *= 2.02;
    amplitude *= 0.5;
  }
  return value;
}

vec4 sampleText(vec2 uv) {
  if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) {
    return vec4(0.0);
  }
  return texture(uTextTexture, uv);
}

void main() {
  vec2 uv = vUv;
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  float time = uTime * uSpeed;
  float scale = max(uWarpScale, 0.001);

  vec2 drift = vec2(time * 0.055, -time * 0.045);
  float n1 = fbm(uv * scale * 3.1 + drift);
  float n2 = fbm((uv + 19.17) * scale * 3.4 - drift.yx);
  vec2 ambient = (vec2(n1, n2) - 0.5) * (uWarpStrength * 0.045 * uMotion + uIntro * 0.18);

  vec2 pointerDelta = uv - uPointer;
  vec2 aspectDelta = vec2(pointerDelta.x * aspect, pointerDelta.y);
  float dist = length(aspectDelta);
  float radius = max(uPointerInfluence, 0.001);
  float t = clamp(dist / radius, 0.0, 1.0);
  float lens = smoothstep(radius, 0.0, dist) * uPointerActive;
  float bulge = t * (1.0 - t) * (1.0 - t) * 6.75 * uPointerActive;
  vec2 dir = dist > 0.0001 ? vec2(aspectDelta.x / aspect, aspectDelta.y) / dist : vec2(0.0);

  float rippleWave = sin(dist * 28.0 - time * 4.2) * 0.5 + 0.5;
  float rippleRing = (rippleWave - 0.5) * uRipple;
  vec2 pointerWarp = dir * rippleRing * bulge * uPointerStrength * 0.016;

  if (uLens > 1.5) {
    float twist = (1.0 - t) * (1.0 - t) * uPointerActive * uPointerStrength * 2.4;
    float s = sin(twist);
    float c = cos(twist);
    vec2 turned = vec2(aspectDelta.x * c - aspectDelta.y * s, aspectDelta.x * s + aspectDelta.y * c);
    pointerWarp += vec2(turned.x / aspect, turned.y) - pointerDelta;
  } else {
    float side = uLens > 0.5 ? -1.0 : 1.0;
    pointerWarp -= dir * side * bulge * uPointerStrength * 0.045;
  }

  vec2 shock = vec2(0.0);
  float shockLight = 0.0;
  for (int i = 0; i < 4; i++) {
    vec4 click = uClicks[i];
    if (click.w <= 0.0) continue;
    vec2 clickDelta = uv - click.xy;
    vec2 clickAspect = vec2(clickDelta.x * aspect, clickDelta.y);
    float clickDist = length(clickAspect);
    float age = click.z;
    float offset = (clickDist - age * 0.9) / (0.06 + age * 0.06);
    float fade = 1.0 - smoothstep(0.0, 1.6, age);
    float energy = exp(-offset * offset) * fade * smoothstep(0.0, 0.08, age) * click.w;
    vec2 clickDir = clickDist > 0.0001 ? vec2(clickAspect.x / aspect, clickAspect.y) / clickDist : vec2(0.0);
    shock -= clickDir * offset * energy * 0.09;
    shockLight += energy;
  }

  vec2 bend = pointerWarp + shock;
  vec2 rest = uv + ambient;
  vec2 splitDir = ambient + bend;
  float splitLen = length(splitDir);
  splitDir = splitLen > 0.00001 ? splitDir / splitLen : vec2(0.7071, 0.7071);
  vec2 split = splitDir * uRefraction * 0.16 * (0.35 + lens * 1.65 + uIntro * 3.0);
  float dispersion = uChromatic * 0.5;

  vec3 ink = vec3(0.0);
  vec3 cover = vec3(0.0);
  vec3 weight = vec3(0.0);
  for (int i = 0; i < 7; i++) {
    float k = 1.0 - float(i) / 3.0;
    vec4 tap = sampleText(rest + bend * (1.0 + dispersion * k) + split * k);
    vec3 band = vec3(max(k, 0.0), 1.0 - abs(k), max(-k, 0.0));
    ink += tap.rgb * band;
    cover += tap.a * band;
    weight += band;
  }
  ink /= weight;
  cover /= weight;
  float a = max(max(cover.r, cover.g), cover.b);
  vec3 color = ink + (a - cover) * uBackdrop;
  color = min(color + (lens + shockLight * 0.5) * cover.g * 0.055, vec3(a));
  fragColor = vec4(color, a) * uReveal;
}
`;

const defaults = {
  warpStrength: 0.08,
  warpScale: 1.7,
  speed: 0.55,
  pointerInfluence: 0.42,
  pointerStrength: 0.38,
  refraction: 0.018,
  chromatic: 0.35,
  idleDrift: 0.2,
  lens: "bulge",
  ripple: true,
  clickRipple: true,
  intro: true
};

const smooth = (value) => value * value * (3 - 2 * value);

const compile = (gl, type, source) => {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) return shader;
  console.warn("WarpText shader", gl.getShaderInfoLog(shader));
  gl.deleteShader(shader);
  return null;
};

const linkProgram = (gl) => {
  const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX);
  const fragment = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT);
  const program = gl.createProgram();
  if (!vertex || !fragment || !program) return null;
  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.bindAttribLocation(program, 0, "aPosition");
  gl.bindAttribLocation(program, 1, "aUv");
  gl.linkProgram(program);
  gl.deleteShader(vertex);
  gl.deleteShader(fragment);
  if (gl.getProgramParameter(program, gl.LINK_STATUS)) return program;
  console.warn("WarpText program", gl.getProgramInfoLog(program));
  gl.deleteProgram(program);
  return null;
};

const getLuminance = (color) => {
  const probe = document.createElement("canvas");
  probe.width = 1;
  probe.height = 1;
  const ctx = probe.getContext("2d", { willReadFrequently: true });
  if (!ctx) return 1;
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, 1, 1);
  const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
};

const drawLine = (ctx, line, x, y, letterSpacing) => {
  if (!letterSpacing) {
    ctx.fillText(line, x, y);
    return;
  }
  const chars = Array.from(line);
  let cursor = x;
  chars.forEach((char, index) => {
    ctx.fillText(char, cursor, y);
    cursor += ctx.measureText(char).width + (index === chars.length - 1 ? 0 : letterSpacing);
  });
};

const rasterizeCopy = (container, copy, width, height, dpr) => {
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.floor(width * dpr));
  canvas.height = Math.max(1, Math.floor(height * dpr));
  const ctx = canvas.getContext("2d");
  if (!ctx) return { canvas, ink: "#efe6d4" };

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, width, height);
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  const root = container.getBoundingClientRect();
  const lines = [...copy.querySelectorAll(".line")];
  let ink = window.getComputedStyle(container).color || "#efe6d4";

  lines.forEach((el) => {
    const cs = getComputedStyle(el);
    const box = el.getBoundingClientRect();
    const spacing = cs.letterSpacing === "normal" ? 0 : parseFloat(cs.letterSpacing) || 0;
    const padL = parseFloat(cs.paddingLeft) || 0;
    ink = cs.color || ink;
    ctx.fillStyle = cs.color;
    ctx.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
    const x = box.left - root.left + padL;
    const y = box.top - root.top + box.height / 2;
    drawLine(ctx, el.textContent, x, y, spacing);
  });

  return { canvas, ink };
};

const mountWarpText = (root, options = {}) => {
  if (!root) return null;
  const props = { ...defaults, ...options };
  root.classList.add("warp-text");

  let copy = root.querySelector(".warp-text__copy");
  if (!copy) {
    copy = document.createElement("span");
    copy.className = "warp-text__copy";
    while (root.firstChild) copy.appendChild(root.firstChild);
    root.appendChild(copy);
  }

  const canvas = document.createElement("canvas");
  canvas.setAttribute("aria-hidden", "true");
  root.appendChild(canvas);

  const gl = canvas.getContext("webgl2", {
    alpha: true,
    antialias: true,
    premultipliedAlpha: false,
    preserveDrawingBuffer: false
  });
  if (!gl) {
    root.classList.add("is-failed");
    canvas.remove();
    return null;
  }

  const program = linkProgram(gl);
  if (!program) {
    root.classList.add("is-failed");
    canvas.remove();
    return null;
  }

  const vao = gl.createVertexArray();
  const buffer = gl.createBuffer();
  gl.bindVertexArray(vao);
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([
      -1, -1, 0, 0,
      1, -1, 1, 0,
      -1, 1, 0, 1,
      1, 1, 1, 1
    ]),
    gl.STATIC_DRAW
  );
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 16, 0);
  gl.enableVertexAttribArray(1);
  gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 16, 8);

  const texture = gl.createTexture();
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
  gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);

  gl.useProgram(program);
  const uni = (name) => gl.getUniformLocation(program, name);
  const u = {
    text: uni("uTextTexture"),
    resolution: uni("uResolution"),
    pointer: uni("uPointer"),
    pointerActive: uni("uPointerActive"),
    time: uni("uTime"),
    warpStrength: uni("uWarpStrength"),
    warpScale: uni("uWarpScale"),
    speed: uni("uSpeed"),
    pointerInfluence: uni("uPointerInfluence"),
    pointerStrength: uni("uPointerStrength"),
    refraction: uni("uRefraction"),
    chromatic: uni("uChromatic"),
    ripple: uni("uRipple"),
    motion: uni("uMotion"),
    lens: uni("uLens"),
    intro: uni("uIntro"),
    reveal: uni("uReveal"),
    backdrop: uni("uBackdrop"),
    clicks: uni("uClicks[0]")
  };
  gl.uniform1i(u.text, 0);

  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  gl.clearColor(0, 0, 0, 0);

  let disposed = false;
  let contextLost = false;
  let visible = true;
  let pageVisible = !document.hidden;
  let reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let rasterVersion = 0;
  let textReady = false;
  let introProgress = props.intro && !reduceMotion ? 0 : 1;
  let lastFrame = 0;
  let frame = 0;
  let raf = 0;
  let lastInk = "";
  const startTime = performance.now();
  const pointer = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5, active: 0, activeTarget: 0 };
  const clicks = new Float32Array(MAX_CLICKS * 4);
  for (let i = 0; i < MAX_CLICKS; i += 1) {
    clicks[i * 4] = 0.5;
    clicks[i * 4 + 1] = 0.5;
  }
  let clickSlot = 0;

  const renderOnce = () => {
    if (disposed || contextLost) return;
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(program);
    gl.bindVertexArray(vao);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  };

  const rasterize = async () => {
    const version = ++rasterVersion;
    if (document.fonts?.ready) {
      try {
        await document.fonts.ready;
      } catch (error) {
        void error;
      }
    }
    if (disposed || contextLost || version !== rasterVersion) return;
    const rect = root.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    lastInk = window.getComputedStyle(root).color;
    const raster = rasterizeCopy(root, copy, rect.width, rect.height, dpr);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, raster.canvas);
    gl.useProgram(program);
    gl.uniform1f(u.backdrop, getLuminance(raster.ink) < 0.5 ? 1 : 0);
    textReady = true;
    root.classList.add("is-live");
    renderOnce();
  };

  const resize = () => {
    if (disposed || contextLost) return;
    const rect = root.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.max(1, Math.floor(rect.width * dpr));
    canvas.height = Math.max(1, Math.floor(rect.height * dpr));
    canvas.style.width = rect.width + "px";
    canvas.style.height = rect.height + "px";
    gl.useProgram(program);
    gl.uniform2f(u.resolution, canvas.width, canvas.height);
    rasterize();
  };

  const onPointerMove = (event) => {
    if (event.pointerType === "touch") return;
    const rect = canvas.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;
    pointer.tx = (event.clientX - rect.left) / rect.width;
    pointer.ty = 1 - (event.clientY - rect.top) / rect.height;
    pointer.activeTarget = 1;
  };

  const onPointerLeave = () => {
    pointer.activeTarget = 0;
  };

  const onPointerDown = (event) => {
    if (!props.clickRipple) return;
    const rect = canvas.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;
    const i = clickSlot * 4;
    clickSlot = (clickSlot + 1) % MAX_CLICKS;
    clicks[i] = (event.clientX - rect.left) / rect.width;
    clicks[i + 1] = 1 - (event.clientY - rect.top) / rect.height;
    clicks[i + 2] = 0;
    clicks[i + 3] = reduceMotion ? 0.35 : 1;
  };

  const onContextLost = (event) => {
    event.preventDefault();
    contextLost = true;
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
    root.classList.remove("is-live");
    root.classList.add("is-failed");
  };

  const onVisibility = () => {
    pageVisible = !document.hidden;
    if (pageVisible && visible && !raf) raf = requestAnimationFrame(loop);
    if (!pageVisible && raf) {
      cancelAnimationFrame(raf);
      raf = 0;
    }
  };

  const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  const onReducedMotion = (event) => {
    reduceMotion = event.matches;
    if (reduceMotion) introProgress = 1;
  };

  const loop = (now) => {
    if (disposed || contextLost) return;

    const elapsed = (now - startTime) * 0.001;
    const delta = lastFrame ? Math.min(now - lastFrame, 50) : 16;
    lastFrame = now;
    frame += 1;

    if (textReady && introProgress < 1) introProgress = Math.min(1, introProgress + delta / INTRO_MS);
    const settle = 1 - introProgress;

    if (textReady && frame % 15 === 0 && window.getComputedStyle(root).color !== lastInk) rasterize();

    const drift = Math.min(Math.max(props.idleDrift, 0), 1);
    const engaged = pointer.activeTarget > 0;
    const idleX = 0.5 + Math.sin(elapsed * 0.33) * (0.08 + drift * 0.2);
    const idleY = 0.5 + Math.cos(elapsed * 0.27) * (0.06 + drift * 0.2);
    const follow = 1 - Math.exp(-delta / (engaged ? 130 : 470));

    pointer.x += ((engaged ? pointer.tx : idleX) - pointer.x) * follow;
    pointer.y += ((engaged ? pointer.ty : idleY) - pointer.y) * follow;
    pointer.active += ((engaged ? 1 : drift) - pointer.active) * (1 - Math.exp(-delta / 270));

    for (let i = 0; i < MAX_CLICKS; i += 1) {
      const w = i * 4 + 3;
      if (clicks[w] <= 0) continue;
      clicks[i * 4 + 2] += delta / 1000;
      if (clicks[i * 4 + 2] > RIPPLE_LIFE) clicks[w] = 0;
    }

    gl.useProgram(program);
    gl.uniform2f(u.pointer, pointer.x, pointer.y);
    gl.uniform1f(u.pointerActive, reduceMotion ? pointer.active * 0.35 : pointer.active);
    gl.uniform1f(u.time, reduceMotion ? 0 : elapsed);
    gl.uniform1f(u.warpStrength, props.warpStrength);
    gl.uniform1f(u.warpScale, props.warpScale);
    gl.uniform1f(u.speed, props.speed);
    gl.uniform1f(u.pointerInfluence, props.pointerInfluence);
    gl.uniform1f(u.pointerStrength, props.pointerStrength);
    gl.uniform1f(u.refraction, props.refraction);
    gl.uniform1f(u.chromatic, props.chromatic);
    gl.uniform1f(u.ripple, props.ripple ? 1 : 0);
    gl.uniform1f(u.motion, reduceMotion ? 0 : 1);
    gl.uniform1f(u.lens, LENS_MODES[props.lens] ?? 0);
    gl.uniform1f(u.intro, settle * settle * settle);
    gl.uniform1f(u.reveal, textReady ? smooth(Math.min(1, introProgress / 0.45)) : 0);
    if (u.clicks) gl.uniform4fv(u.clicks, clicks);

    renderOnce();
    raf = requestAnimationFrame(loop);
  };

  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(root);

  const intersectionObserver = new IntersectionObserver(
    ([entry]) => {
      visible = entry.isIntersecting;
      if (visible && pageVisible && !raf) raf = requestAnimationFrame(loop);
      if (!visible && raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    },
    { threshold: 0 }
  );
  intersectionObserver.observe(root);

  canvas.addEventListener("pointermove", onPointerMove);
  canvas.addEventListener("pointerleave", onPointerLeave);
  canvas.addEventListener("pointerdown", onPointerDown);
  canvas.addEventListener("webglcontextlost", onContextLost, false);
  document.addEventListener("visibilitychange", onVisibility);
  mediaQuery.addEventListener("change", onReducedMotion);

  resize();
  raf = requestAnimationFrame(loop);

  return {
    dispose() {
      disposed = true;
      if (raf) cancelAnimationFrame(raf);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerleave", onPointerLeave);
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("webglcontextlost", onContextLost);
      document.removeEventListener("visibilitychange", onVisibility);
      mediaQuery.removeEventListener("change", onReducedMotion);
      if (!contextLost) {
        gl.deleteTexture(texture);
        gl.deleteBuffer(buffer);
        gl.deleteVertexArray(vao);
        gl.deleteProgram(program);
        gl.getExtension("WEBGL_lose_context")?.loseContext();
      }
      canvas.remove();
      root.classList.remove("is-live");
    }
  };
};

const boot = () => {
  const root = document.getElementById("heroWarp");
  if (!root) return;
  mountWarpText(root, {
    warpStrength: 0.08,
    warpScale: 1.7,
    speed: 0.55,
    lens: "bulge",
    pointerInfluence: 0.42,
    pointerStrength: 0.38,
    refraction: 0.018,
    chromatic: 0.35,
    idleDrift: 0.2,
    ripple: true,
    clickRipple: true,
    intro: true
  });
};

window.mountWarpText = mountWarpText;
if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
else boot();
})();
