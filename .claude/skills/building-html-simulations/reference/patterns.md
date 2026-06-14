# Code Patterns — copy-paste building blocks

Framework-free, GitHub-Pages-safe. Drop into a single HTML file.

## Contents
- HiDPI canvas setup (crisp on retina/phones)
- Fixed-timestep render loop
- Pointer drag (mouse + touch)
- Slider bound to a live parameter
- Pause when offscreen / tab hidden
- Field rendering with ImageData
- three.js minimal scene
- p5.js sketch skeleton

## HiDPI canvas setup
Without this, canvas is blurry on retina. Re-run on resize.

```js
function fitCanvas(canvas, ctx) {
  const dpr = Math.min(window.devicePixelRatio || 1, 2); // cap at 2
  const { clientWidth: w, clientHeight: h } = canvas;
  canvas.width = Math.round(w * dpr);
  canvas.height = Math.round(h * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0); // draw in CSS pixels
  return { w, h };
}
```

## Fixed-timestep render loop
Frame-rate-independent, stable physics. Update in fixed `dt`, draw once.

```js
const DT = 1 / 120;        // physics step (s)
let acc = 0, last = performance.now() / 1000;

function frame(nowMs) {
  const now = nowMs / 1000;
  acc += Math.min(now - last, 0.25); // clamp after tab-switch stalls
  last = now;
  while (acc >= DT) { update(DT); acc -= DT; }
  draw();
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
```

## Pointer drag (mouse + touch in one path)
```js
let dragging = false;
function toCanvas(e) {
  const r = canvas.getBoundingClientRect();
  return { x: e.clientX - r.left, y: e.clientY - r.top }; // CSS-pixel space
}
canvas.addEventListener("pointerdown", e => { dragging = true; canvas.setPointerCapture(e.pointerId); onDrag(toCanvas(e)); });
canvas.addEventListener("pointermove", e => { if (dragging) onDrag(toCanvas(e)); });
canvas.addEventListener("pointerup",   () => { dragging = false; });
```

## Slider bound to a live parameter
```js
const params = { speed: 1, damping: 0.99 };
function bind(id, key) {
  const el = document.getElementById(id);
  el.addEventListener("input", () => (params[key] = +el.value));
}
bind("speed", "speed");
```

## Pause when offscreen / tab hidden
```js
let running = true, raf = null;
function start() { if (!raf) raf = requestAnimationFrame(frame); }
function stop()  { cancelAnimationFrame(raf); raf = null; }
new IntersectionObserver(([e]) => (e.isIntersecting ? start() : stop()))
  .observe(canvas);
document.addEventListener("visibilitychange", () =>
  document.hidden ? stop() : start());
```

## Field rendering with ImageData
For per-pixel fields (waves, reaction-diffusion) draw into a typed array, then blit.

```js
const img = ctx.createImageData(W, H);
function draw() {
  for (let i = 0, p = 0; i < W * H; i++, p += 4) {
    const v = field[i];                 // 0..1
    img.data[p] = img.data[p + 1] = img.data[p + 2] = v * 255;
    img.data[p + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
}
```

## three.js minimal scene (CDN)
```html
<script type="importmap">
{ "imports": { "three": "https://unpkg.com/three@0.160.0/build/three.module.js" } }
</script>
<script type="module">
  import * as THREE from "three";
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setSize(innerWidth, innerHeight);
  document.body.appendChild(renderer.domElement);
  const scene = new THREE.Scene();
  const cam = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 0.1, 100);
  cam.position.z = 4;
  const mesh = new THREE.Mesh(
    new THREE.TorusKnotGeometry(1, 0.3, 128, 32),
    new THREE.MeshStandardMaterial({ color: 0xe8c547 })
  );
  scene.add(mesh, new THREE.HemisphereLight(0xffffff, 0x222222, 1.2));
  (function loop() {
    mesh.rotation.x += 0.01; mesh.rotation.y += 0.013;
    renderer.render(scene, cam);
    requestAnimationFrame(loop);
  })();
</script>
```

## p5.js sketch skeleton (CDN)
```html
<script src="https://cdn.jsdelivr.net/npm/p5@1.9.0/lib/p5.min.js"></script>
<script>
  let particles = [];
  function setup() { createCanvas(windowWidth, windowHeight); pixelDensity(min(displayDensity(), 2)); }
  function draw() { background(11); for (const p of particles) { /* update + ellipse(p.x, p.y, 4) */ } }
  function mousePressed() { particles.push({ x: mouseX, y: mouseY }); }
  function windowResized() { resizeCanvas(windowWidth, windowHeight); }
</script>
```
