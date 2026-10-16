// Subtle animation over the Sydney painting: canopy sway, harbour shimmer,
// and drifting cloud light. The static <img> stays
// underneath as the fallback; nothing runs for prefers-reduced-motion.

const frame = document.querySelector('.art-frame');
const img = frame?.querySelector('img');
const fx = frame?.querySelector('canvas.fx');
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (frame && img && fx && !reduced) start();

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const i = new Image();
    i.decoding = 'async';
    i.onload = () => resolve(i);
    i.onerror = reject;
    i.src = src;
  });
}

async function start() {
  const gl = fx.getContext('webgl', { premultipliedAlpha: false, antialias: false });
  if (!gl) return;
  const base = frame.dataset.base || '';
  let art, mask;
  try {
    [art, mask] = await Promise.all([loadImage(img.currentSrc || img.src), loadImage(`${base}/sydney-mask.webp`)]);
  } catch {
    return;
  }

  const vs = `
    attribute vec2 p;
    varying vec2 v;
    void main() { v = p * 0.5 + 0.5; v.y = 1.0 - v.y; gl_Position = vec4(p, 0.0, 1.0); }`;
  const fs = `
    precision mediump float;
    varying vec2 v;
    uniform sampler2D art;
    uniform sampler2D mask;
    uniform float t;
    uniform vec2 scale;   // object-fit: cover mapping
    uniform vec2 offset;

    float hash(vec2 q) { return fract(sin(dot(q, vec2(127.1, 311.7))) * 43758.5453); }
    float noise(vec2 q) {
      vec2 i = floor(q), f = fract(q);
      f = f * f * (3.0 - 2.0 * f);
      return mix(mix(hash(i), hash(i + vec2(1, 0)), f.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x), f.y);
    }

    void main() {
      vec2 uv = v * scale + offset;
      vec3 m = texture2D(mask, uv).rgb;

      // Breeze: slow gusts that sway the jacaranda and greenery, stronger up high.
      float gust = 0.55 + 0.45 * sin(t * 0.23) * sin(t * 0.11 + 1.3);
      float sway = noise(vec2(uv.x * 3.0 + t * 0.35, uv.y * 4.0 - t * 0.2)) - 0.5;
      vec2 d = vec2(sin(t * 1.1 + uv.y * 14.0 + sway * 6.0) * 0.0026, cos(t * 0.8 + uv.x * 11.0) * 0.0012);
      // No sway on the distant shoreline around the harbour, where it reads as shimmer.
      float far = smoothstep(0.30, 0.36, uv.y) * (1.0 - smoothstep(0.54, 0.60, uv.y));
      d *= m.b * gust * (1.25 - uv.y * 0.6) * (1.0 - far);

      // Harbour: horizontal ripples moving across the water.
      float rip = noise(vec2(uv.x * 55.0 - t * 0.35, uv.y * 260.0 + t * 0.6)) - 0.5;
      d.x += rip * 0.0012 * m.g;
      d.y += (noise(vec2(uv.x * 30.0 + t * 0.2, uv.y * 140.0)) - 0.5) * 0.0004 * m.g;

      // Sky: clouds drift very slowly.
      d.x += (noise(vec2(uv.x * 2.0 + t * 0.03, uv.y * 3.0)) - 0.5) * 0.006 * m.r;
      d.x -= sin(t * 0.04) * 0.004 * m.r;

      vec3 col = texture2D(art, uv + d).rgb;

      // Glints on the water.
      float g = noise(vec2(uv.x * 420.0 + t * 0.9, uv.y * 900.0));
      col += vec3(1.0, 0.97, 0.88) * pow(g, 20.0) * 0.35 * m.g;

      // Soft warm light that drifts across the scene, like moving cloud shadow.
      float light = noise(vec2(uv.x * 1.6 - t * 0.04, uv.y * 1.2 + t * 0.015));
      col *= 0.965 + 0.07 * light;
      col += vec3(1.0, 0.9, 0.7) * 0.03 * smoothstep(0.35, 0.95, light) * (1.0 - uv.y);

      gl_FragColor = vec4(col, 1.0);
    }`;

  const prog = gl.createProgram();
  for (const [type, src] of [[gl.VERTEX_SHADER, vs], [gl.FRAGMENT_SHADER, fs]]) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) return;
    gl.attachShader(prog, s);
  }
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
  gl.useProgram(prog);

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, 'p');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

  const texture = (unit, image) => {
    const tx = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0 + unit);
    gl.bindTexture(gl.TEXTURE_2D, tx);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
  };
  texture(0, art);
  texture(1, mask);
  gl.uniform1i(gl.getUniformLocation(prog, 'art'), 0);
  gl.uniform1i(gl.getUniformLocation(prog, 'mask'), 1);
  const uT = gl.getUniformLocation(prog, 't');
  const uScale = gl.getUniformLocation(prog, 'scale');
  const uOffset = gl.getUniformLocation(prog, 'offset');

  let W = 0, H = 0, dpr = 1;

  // Match the <img>'s object-fit: cover crop so the canvas lines up exactly.
  function resize() {
    const r = frame.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = r.width; H = r.height;
    fx.width = Math.round(W * dpr); fx.height = Math.round(H * dpr);
    gl.viewport(0, 0, fx.width, fx.height);
    const ia = art.width / art.height, ca = W / H;
    const pos = getComputedStyle(img).objectPosition.split(' ').map((s) => parseFloat(s) / 100);
    let sx = 1, sy = 1;
    if (ca > ia) sy = ia / ca; else sx = ca / ia;
    gl.uniform2f(uScale, sx, sy);
    gl.uniform2f(uOffset, (1 - sx) * (pos[0] ?? 0.5), (1 - sy) * (pos[1] ?? 0.5));
  }

  let visible = true, last = performance.now(), raf = 0;
  const t0 = last;
  function frameLoop(now) {
    last = now;
    const t = (now - t0) / 1000;
    gl.uniform1f(uT, t);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    raf = visible ? requestAnimationFrame(frameLoop) : 0;
  }

  resize();
  new ResizeObserver(resize).observe(frame);
  new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    if (visible && !raf) { last = performance.now(); raf = requestAnimationFrame(frameLoop); }
  }).observe(frame);
  frame.classList.add('is-live');
  raf = requestAnimationFrame(frameLoop);
}
