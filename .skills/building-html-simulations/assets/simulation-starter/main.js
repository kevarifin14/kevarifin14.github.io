(function () {
  const canvas = document.getElementById("simulation");
  const ctx = canvas.getContext("2d");

  const controls = {
    toggleRun: document.getElementById("toggleRun"),
    reset: document.getElementById("reset"),
    randomize: document.getElementById("randomize"),
    count: document.getElementById("count"),
    force: document.getElementById("force"),
    damping: document.getElementById("damping"),
    trails: document.getElementById("trails"),
    countValue: document.getElementById("countValue"),
    forceValue: document.getElementById("forceValue"),
    dampingValue: document.getElementById("dampingValue"),
    particleReadout: document.getElementById("particleReadout"),
    energyReadout: document.getElementById("energyReadout")
  };

  const size = { width: 960, height: 640, dpr: 1 };
  const pointer = { active: false, down: false, x: 0, y: 0 };
  const state = {
    running: !window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    lastTime: 0,
    seed: 7,
    time: 0,
    energy: 0,
    particles: []
  };

  function mulberry32(seed) {
    return function random() {
      let t = seed += 0x6d2b79f5;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    size.width = Math.max(1, rect.width);
    size.height = Math.max(1, rect.height);
    size.dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(size.width * size.dpr);
    canvas.height = Math.round(size.height * size.dpr);
    ctx.setTransform(size.dpr, 0, 0, size.dpr, 0, 0);
  }

  function reset(seed = state.seed) {
    state.seed = seed;
    state.time = 0;
    state.energy = 0;
    state.particles = [];

    const random = mulberry32(seed);
    const count = Number(controls.count.value);
    const radius = Math.min(size.width, size.height) * 0.28;
    const centerX = size.width / 2;
    const centerY = size.height / 2;

    for (let i = 0; i < count; i += 1) {
      const angle = random() * Math.PI * 2;
      const distance = Math.sqrt(random()) * radius;
      const speed = 28 + random() * 68;

      state.particles.push({
        x: centerX + Math.cos(angle) * distance,
        y: centerY + Math.sin(angle) * distance,
        vx: -Math.sin(angle) * speed + (random() - 0.5) * 26,
        vy: Math.cos(angle) * speed + (random() - 0.5) * 26,
        r: 2.8 + random() * 3.2,
        hue: 172 + random() * 54
      });
    }

    syncReadouts();
  }

  function syncReadouts() {
    controls.countValue.textContent = controls.count.value;
    controls.forceValue.textContent = Number(controls.force.value).toFixed(2);
    controls.dampingValue.textContent = Number(controls.damping.value).toFixed(3);
    controls.particleReadout.textContent = String(state.particles.length);
    controls.energyReadout.textContent = state.energy.toFixed(2);
    controls.toggleRun.textContent = state.running ? "Pause" : "Play";
  }

  function applyPreset(name) {
    if (name === "orbit") {
      controls.force.value = "0.62";
      controls.damping.value = "0.94";
      controls.trails.checked = true;
      reset(7);
    }

    if (name === "drift") {
      controls.force.value = "0.18";
      controls.damping.value = "0.985";
      controls.trails.checked = true;
      reset(19);
    }

    if (name === "collapse") {
      controls.force.value = "1.06";
      controls.damping.value = "0.88";
      controls.trails.checked = false;
      reset(31);
    }

    syncReadouts();
  }

  function update(dt) {
    const centerX = size.width / 2;
    const centerY = size.height / 2;
    const attraction = Number(controls.force.value) * 58;
    const damping = Math.pow(Number(controls.damping.value), dt * 60);
    let energy = 0;

    state.time += dt;

    for (const particle of state.particles) {
      const dx = centerX - particle.x;
      const dy = centerY - particle.y;
      const distance = Math.hypot(dx, dy) + 0.001;
      const spin = 18 + Math.sin(state.time * 0.75) * 8;

      particle.vx += (dx / distance) * attraction * dt;
      particle.vy += (dy / distance) * attraction * dt;
      particle.vx += (-dy / distance) * spin * dt;
      particle.vy += (dx / distance) * spin * dt;

      if (pointer.active) {
        const px = pointer.x - particle.x;
        const py = pointer.y - particle.y;
        const pd = Math.hypot(px, py) + 16;
        const pull = pointer.down ? 1200 : 320;
        const local = pull / Math.max(pd, 30);
        particle.vx += (px / pd) * local * dt;
        particle.vy += (py / pd) * local * dt;
      }

      particle.vx *= damping;
      particle.vy *= damping;
      particle.x += particle.vx * dt;
      particle.y += particle.vy * dt;

      if (particle.x < particle.r || particle.x > size.width - particle.r) {
        particle.x = Math.min(size.width - particle.r, Math.max(particle.r, particle.x));
        particle.vx *= -0.72;
      }

      if (particle.y < particle.r || particle.y > size.height - particle.r) {
        particle.y = Math.min(size.height - particle.r, Math.max(particle.r, particle.y));
        particle.vy *= -0.72;
      }

      energy += Math.hypot(particle.vx, particle.vy);
    }

    state.energy = energy / Math.max(1, state.particles.length);
  }

  function drawGrid() {
    ctx.save();
    ctx.strokeStyle = "rgba(23, 32, 51, 0.08)";
    ctx.lineWidth = 1;

    for (let x = 0; x <= size.width; x += 48) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, size.height);
      ctx.stroke();
    }

    for (let y = 0; y <= size.height; y += 48) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(size.width, y);
      ctx.stroke();
    }

    ctx.restore();
  }

  function render() {
    if (controls.trails.checked) {
      ctx.fillStyle = "rgba(246, 248, 251, 0.18)";
      ctx.fillRect(0, 0, size.width, size.height);
    } else {
      ctx.clearRect(0, 0, size.width, size.height);
    }

    drawGrid();

    const centerX = size.width / 2;
    const centerY = size.height / 2;

    ctx.save();
    ctx.fillStyle = "rgba(217, 119, 6, 0.9)";
    ctx.beginPath();
    ctx.arc(centerX, centerY, 7, 0, Math.PI * 2);
    ctx.fill();

    if (pointer.active) {
      ctx.strokeStyle = pointer.down ? "rgba(190, 18, 60, 0.55)" : "rgba(15, 118, 110, 0.35)";
      ctx.lineWidth = pointer.down ? 3 : 2;
      ctx.beginPath();
      ctx.arc(pointer.x, pointer.y, pointer.down ? 44 : 30, 0, Math.PI * 2);
      ctx.stroke();
    }

    for (const particle of state.particles) {
      ctx.fillStyle = `hsla(${particle.hue}, 58%, 44%, 0.9)`;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.r, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
    syncReadouts();
  }

  function frame(now) {
    if (!state.lastTime) state.lastTime = now;
    const dt = Math.min(0.034, Math.max(0, (now - state.lastTime) / 1000));
    state.lastTime = now;

    if (state.running) update(dt);
    render();
    requestAnimationFrame(frame);
  }

  function setPointer(event) {
    const rect = canvas.getBoundingClientRect();
    pointer.x = event.clientX - rect.left;
    pointer.y = event.clientY - rect.top;
  }

  controls.toggleRun.addEventListener("click", () => {
    state.running = !state.running;
    syncReadouts();
  });

  controls.reset.addEventListener("click", () => reset());
  controls.randomize.addEventListener("click", () => reset(Math.floor(Math.random() * 100000)));
  controls.count.addEventListener("input", () => reset());
  controls.force.addEventListener("input", syncReadouts);
  controls.damping.addEventListener("input", syncReadouts);

  document.querySelectorAll(".preset").forEach((button) => {
    button.addEventListener("click", () => applyPreset(button.dataset.preset));
  });

  canvas.addEventListener("pointerenter", (event) => {
    pointer.active = true;
    setPointer(event);
  });

  canvas.addEventListener("pointermove", setPointer);

  canvas.addEventListener("pointerdown", (event) => {
    pointer.down = true;
    pointer.active = true;
    canvas.setPointerCapture(event.pointerId);
    setPointer(event);
  });

  canvas.addEventListener("pointerup", (event) => {
    pointer.down = false;
    if (canvas.hasPointerCapture(event.pointerId)) {
      canvas.releasePointerCapture(event.pointerId);
    }
  });

  canvas.addEventListener("pointerleave", () => {
    pointer.active = pointer.down;
  });

  window.addEventListener("resize", () => {
    resizeCanvas();
    reset();
  });

  resizeCanvas();
  reset();
  requestAnimationFrame(frame);
})();
