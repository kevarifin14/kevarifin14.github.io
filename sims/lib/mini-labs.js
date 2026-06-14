(function () {
  "use strict";

  const canvas = document.getElementById("c");
  const ctx = canvas.getContext("2d");
  const ro = document.getElementById("ro");
  const aInput = document.getElementById("paramA");
  const bInput = document.getElementById("paramB");
  const speedInput = document.getElementById("speed");
  const aLabel = document.getElementById("paramALabel");
  const bLabel = document.getElementById("paramBLabel");
  const P = Sim.palette;
  const slug = document.body.dataset.sim;
  const TAU = Math.PI * 2;

  let view = { w: 0, h: 0 };
  let rng = Sim.rng(100);
  let state = {};
  let sim;
  const params = { a: 1, b: 1, speed: 1 };

  function clamp(x, lo, hi) { return Math.max(lo, Math.min(hi, x)); }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function randn() {
    const u = Math.max(1e-6, rng()), v = Math.max(1e-6, rng());
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(TAU * v);
  }
  function clear() {
    ctx.fillStyle = "#0e0e10";
    ctx.fillRect(0, 0, view.w, view.h);
  }
  function axes(x, y, w, h) {
    ctx.strokeStyle = "#232326";
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, w, h);
    ctx.strokeStyle = "rgba(255,255,255,0.12)";
    ctx.beginPath();
    ctx.moveTo(x, y + h / 2); ctx.lineTo(x + w, y + h / 2);
    ctx.moveTo(x + w / 2, y); ctx.lineTo(x + w / 2, y + h);
    ctx.stroke();
  }
  function barChart(values, x, y, w, h, color) {
    const max = Math.max(1e-6, ...values);
    const bw = w / values.length;
    ctx.fillStyle = color || P.accent;
    values.forEach((v, i) => {
      const bh = v / max * h;
      ctx.fillRect(x + i * bw + 1, y + h - bh, Math.max(1, bw - 2), bh);
    });
  }
  function line(points, x, y, w, h, color, maxY) {
    if (!points.length) return;
    const max = maxY || Math.max(1, ...points.map((p) => Math.abs(p)));
    ctx.strokeStyle = color || P.accent;
    ctx.lineWidth = 2;
    ctx.beginPath();
    points.forEach((v, i) => {
      const px = x + i / Math.max(1, points.length - 1) * w;
      const py = y + h - clamp(v / max, 0, 1) * h;
      i ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
    });
    ctx.stroke();
  }
  function setReadout(html) { ro.innerHTML = html; }

  function makePoints(n, clusters) {
    const centers = clusters || [[-0.6, -0.4], [0.55, -0.1], [0.05, 0.58]];
    return Array.from({ length: n }, (_, i) => {
      const c = centers[i % centers.length];
      return { x: c[0] + randn() * 0.22, y: c[1] + randn() * 0.2, label: c[0] + c[1] > 0 ? 1 : -1, group: 0 };
    });
  }

  const labs = {
    "sorting-race": {
      labels: ["Items", "Disorder"], ranges: [[24, 96, 4, 56], [0, 1, 0.01, 0.72]],
      reset() {
        const n = Math.round(params.a);
        state.arrays = [0, 1, 2].map(() => Array.from({ length: n }, (_, i) => i + 1));
        for (const arr of state.arrays) for (let i = 0; i < n * params.b; i++) {
          const a = Math.floor(rng() * n), b = Math.floor(rng() * n);
          [arr[a], arr[b]] = [arr[b], arr[a]];
        }
        state.i = [0, 1, 1]; state.j = [0, 0, 0]; state.pass = [0, 1, 1]; state.done = [false, false, false]; state.ops = [0, 0, 0];
      },
      step() {
        const [sel, ins, bub] = state.arrays;
        if (!state.done[0]) {
          const i = state.i[0], j = state.j[0]; let min = state.pass[0] || i;
          if (j < sel.length) { if (sel[j] < sel[min]) min = j; state.pass[0] = min; state.j[0]++; state.ops[0]++; }
          else { [sel[i], sel[min]] = [sel[min], sel[i]]; state.i[0]++; state.j[0] = state.i[0]; state.pass[0] = state.i[0]; if (state.i[0] >= sel.length - 1) state.done[0] = true; }
        }
        if (!state.done[1]) {
          const j = state.j[1];
          if (j > 0 && ins[j - 1] > ins[j]) { [ins[j - 1], ins[j]] = [ins[j], ins[j - 1]]; state.j[1]--; }
          else { state.i[1]++; state.j[1] = state.i[1]; }
          state.ops[1]++; if (state.i[1] >= ins.length) state.done[1] = true;
        }
        if (!state.done[2]) {
          const j = state.j[2];
          if (bub[j] > bub[j + 1]) [bub[j], bub[j + 1]] = [bub[j + 1], bub[j]];
          state.j[2]++; state.ops[2]++;
          if (state.j[2] >= bub.length - state.i[2]) { state.i[2]++; state.j[2] = 0; }
          if (state.i[2] >= bub.length) state.done[2] = true;
        }
      },
      render() {
        clear();
        const names = ["selection", "insertion", "bubble"];
        const h = (view.h - 50) / 3;
        state.arrays.forEach((arr, row) => {
          ctx.fillStyle = "#8a8a8f"; ctx.font = "12px ui-monospace, monospace"; ctx.fillText(names[row] + " ops " + state.ops[row], 22, 22 + row * h);
          barChart(arr, 22, 30 + row * h, view.w - 44, h - 16, row === 1 ? "#4fa3ff" : row === 2 ? "#ff6a3d" : "#e8c547");
        });
        setReadout("done <strong>" + state.done.filter(Boolean).length + "/3</strong> · operations <strong>" + state.ops.join(" / ") + "</strong>");
      },
    },
    "percolation": {
      labels: ["Open probability", "Brush"], ranges: [[0.1, 0.8, 0.01, 0.55], [1, 6, 1, 3]],
      reset() {
        state.n = 36; state.grid = Array.from({ length: state.n * state.n }, () => rng() < params.a);
        state.grid[1] = true; state.tick = 0;
      },
      step() { for (let i = 0; i < state.n * state.n * 0.02; i++) state.grid[Math.floor(rng() * state.grid.length)] = true; state.tick++; },
      pointer(p) {
        const n = state.n, s = Math.min((view.w - 36) / n, (view.h - 36) / n), ox = (view.w - s * n) / 2, oy = (view.h - s * n) / 2;
        const cx = Math.floor((p.x - ox) / s), cy = Math.floor((p.y - oy) / s), r = Math.round(params.b);
        for (let y = cy - r; y <= cy + r; y++) for (let x = cx - r; x <= cx + r; x++) if (x >= 0 && y >= 0 && x < n && y < n) state.grid[y * n + x] = true;
      },
      flow() {
        const n = state.n, wet = new Set(), q = [];
        for (let x = 0; x < n; x++) if (state.grid[x]) { wet.add(x); q.push(x); }
        while (q.length) {
          const i = q.shift(), x = i % n, y = Math.floor(i / n);
          [[1,0],[-1,0],[0,1],[0,-1]].forEach(([dx, dy]) => {
            const nx = x + dx, ny = y + dy, ni = ny * n + nx;
            if (nx >= 0 && ny >= 0 && nx < n && ny < n && state.grid[ni] && !wet.has(ni)) { wet.add(ni); q.push(ni); }
          });
        }
        return wet;
      },
      render() {
        clear(); const n = state.n, wet = this.flow();
        const s = Math.min((view.w - 36) / n, (view.h - 36) / n), ox = (view.w - s * n) / 2, oy = (view.h - s * n) / 2;
        for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
          const i = y * n + x; ctx.fillStyle = wet.has(i) ? "#4fa3ff" : state.grid[i] ? "#e8c547" : "#232326";
          ctx.fillRect(ox + x * s, oy + y * s, s - 1, s - 1);
        }
        const perc = Array.from(wet).some((i) => Math.floor(i / n) === n - 1);
        const open = state.grid.filter(Boolean).length / state.grid.length;
        setReadout("percolates <strong>" + (perc ? "yes" : "no") + "</strong> · open fraction <strong>" + open.toFixed(2) + "</strong>");
      },
    },
    "csp-map-coloring": {
      labels: ["Colors", "Steps per click"], ranges: [[2, 4, 1, 3], [1, 12, 1, 4]],
      reset() {
        state.regions = ["WA", "NT", "SA", "Q", "NSW", "V", "T"];
        state.edges = [[0,1],[0,2],[1,2],[1,3],[2,3],[2,4],[2,5],[3,4],[4,5]];
        state.colors = Array(7).fill(-1); state.pos = [[.18,.45],[.42,.25],[.43,.52],[.68,.38],[.65,.64],[.52,.78],[.78,.82]];
        state.stack = [0]; state.steps = 0; state.done = false;
      },
      conflicts() { return state.edges.filter(([a, b]) => state.colors[a] >= 0 && state.colors[a] === state.colors[b]).length; },
      step() {
        if (state.done) return;
        const k = state.stack.length - 1; if (k < 0) { state.done = true; return; }
        const node = state.stack[k]; state.colors[node]++;
        if (state.colors[node] >= params.a) { state.colors[node] = -1; state.stack.pop(); state.steps++; return; }
        if (!this.conflicts()) { if (state.stack.length === state.regions.length) state.done = true; else state.stack.push(state.stack.length); }
        state.steps++;
      },
      render() {
        clear(); const colors = ["#4fa3ff", "#e8c547", "#ff6a3d", "#50c878"];
        ctx.lineWidth = 2; ctx.strokeStyle = "#8a8a8f";
        state.edges.forEach(([a, b]) => { const A = state.pos[a], B = state.pos[b]; ctx.beginPath(); ctx.moveTo(A[0]*view.w,A[1]*view.h); ctx.lineTo(B[0]*view.w,B[1]*view.h); ctx.stroke(); });
        state.pos.forEach((p, i) => { ctx.fillStyle = state.colors[i] < 0 ? "#232326" : colors[state.colors[i]]; ctx.beginPath(); ctx.arc(p[0]*view.w,p[1]*view.h,28,0,TAU); ctx.fill(); ctx.strokeStyle="#0e0e10"; ctx.stroke(); ctx.fillStyle="#ededed"; ctx.textAlign="center"; ctx.fillText(state.regions[i],p[0]*view.w,p[1]*view.h+4); });
        setReadout("steps <strong>" + state.steps + "</strong> · conflicts <strong>" + this.conflicts() + "</strong> · solved <strong>" + (state.done && !this.conflicts() ? "yes" : "no") + "</strong>");
      },
    },
    "neural-boundary": {
      labels: ["Hidden bend", "Regularization"], ranges: [[0.2, 3, 0.05, 1.4], [0, 1, 0.01, 0.2]],
      reset() { state.points = makePoints(70, [[-0.5,-0.45],[0.5,0.5],[-0.45,0.45],[0.45,-0.45]]); state.t = 0; },
      score(x, y) {
        const bend = params.a, reg = params.b;
        return Math.tanh(bend * (x + y + .15)) - Math.tanh(bend * (x - y - .15)) - reg * (x*x + y*y - .5);
      },
      step() { state.t++; },
      pointer(p) {
        const x = (p.x / view.w) * 2 - 1, y = (p.y / view.h) * 2 - 1;
        state.points.push({ x, y, label: this.score(x, y) > 0 ? 1 : -1 }); if (state.points.length > 120) state.points.shift();
      },
      render() {
        clear(); const cell = 12;
        for (let y = 0; y < view.h; y += cell) for (let x = 0; x < view.w; x += cell) {
          const sx = x / view.w * 2 - 1, sy = y / view.h * 2 - 1, sc = this.score(sx, sy);
          ctx.fillStyle = sc > 0 ? "rgba(79,163,255,.22)" : "rgba(232,197,71,.20)"; ctx.fillRect(x, y, cell + 1, cell + 1);
        }
        state.points.forEach((p) => { ctx.fillStyle = p.label > 0 ? "#4fa3ff" : "#e8c547"; ctx.beginPath(); ctx.arc((p.x+1)/2*view.w,(p.y+1)/2*view.h,5,0,TAU); ctx.fill(); });
        setReadout("points <strong>" + state.points.length + "</strong> · bend <strong>" + params.a.toFixed(2) + "</strong> · click adds a labeled sample");
      },
    },
    "kmeans": {
      labels: ["Clusters", "Spread"], ranges: [[2, 7, 1, 4], [0.08, 0.42, 0.01, 0.22]],
      reset() { state.points = makePoints(110); state.centers = Array.from({ length: params.a }, (_, i) => ({ x: Math.cos(i / params.a * TAU) * .55, y: Math.sin(i / params.a * TAU) * .45 })); state.iter = 0; },
      step() {
        state.points.forEach((p) => { let best = 0, bd = Infinity; state.centers.forEach((c, i) => { const d = (p.x-c.x)**2 + (p.y-c.y)**2; if (d < bd) { bd = d; best = i; } }); p.group = best; });
        state.centers.forEach((c, i) => { const pts = state.points.filter((p) => p.group === i); if (pts.length) { c.x = pts.reduce((s,p)=>s+p.x,0)/pts.length; c.y = pts.reduce((s,p)=>s+p.y,0)/pts.length; } });
        state.iter++;
      },
      pointer(p) { state.points.push({ x: p.x / view.w * 2 - 1, y: p.y / view.h * 2 - 1, group: 0 }); },
      render() {
        clear(); const cols = ["#4fa3ff","#e8c547","#ff6a3d","#50c878","#b084ff","#ff7ab6","#7bdff2"];
        state.points.forEach((p) => { ctx.fillStyle = cols[p.group % cols.length]; ctx.beginPath(); ctx.arc((p.x+1)/2*view.w,(p.y+1)/2*view.h,4,0,TAU); ctx.fill(); });
        state.centers.forEach((c,i)=>{ ctx.strokeStyle="#ededed"; ctx.lineWidth=3; const x=(c.x+1)/2*view.w,y=(c.y+1)/2*view.h; ctx.beginPath(); ctx.moveTo(x-8,y);ctx.lineTo(x+8,y);ctx.moveTo(x,y-8);ctx.lineTo(x,y+8);ctx.stroke(); });
        const inertia = state.points.reduce((s,p)=>s+(p.x-state.centers[p.group].x)**2+(p.y-state.centers[p.group].y)**2,0);
        setReadout("iteration <strong>" + state.iter + "</strong> · inertia <strong>" + inertia.toFixed(2) + "</strong> · points <strong>" + state.points.length + "</strong>");
      },
    },
    "coupon-collector": {
      labels: ["Coupon types", "Draw batch"], ranges: [[4, 36, 1, 18], [1, 40, 1, 8]],
      reset() { state.have = Array(params.a).fill(0); state.draws = 0; state.runs = []; },
      step() { for (let i = 0; i < params.b; i++) { state.have[Math.floor(rng() * params.a)]++; state.draws++; } if (state.have.every(Boolean)) { state.runs.push(state.draws); state.have = Array(params.a).fill(0); state.draws = 0; } },
      render() { clear(); barChart(state.have, 28, 36, view.w - 56, view.h * .5, "#4fa3ff"); line(state.runs.slice(-80), 28, view.h*.66, view.w-56, view.h*.24, "#e8c547"); setReadout("current draw <strong>" + state.draws + "</strong> · complete runs <strong>" + state.runs.length + "</strong> · last completion <strong>" + (state.runs.at(-1) || "-") + "</strong>"); },
    },
    "birthday-paradox": {
      labels: ["Room size", "Trials per step"], ranges: [[2, 80, 1, 23], [10, 400, 10, 80]],
      reset() { state.trials = 0; state.hits = 0; state.curve = []; },
      step() {
        for (let t = 0; t < params.b; t++) { const seen = new Set(); let hit = false; for (let i = 0; i < params.a; i++) { const d = Math.floor(rng()*365); if (seen.has(d)) hit = true; seen.add(d); } state.trials++; if (hit) state.hits++; }
        state.curve.push(state.hits / Math.max(1, state.trials)); if (state.curve.length > 160) state.curve.shift();
      },
      render() { clear(); axes(42, 34, view.w-84, view.h-92); line(state.curve,42,34,view.w-84,view.h-92,"#4fa3ff",1); const exact=1-Array.from({length:params.a},(_,i)=>(365-i)/365).reduce((a,b)=>a*b,1); setReadout("sim probability <strong>" + (state.hits/Math.max(1,state.trials)*100).toFixed(1) + "%</strong> · exact <strong>" + (exact*100).toFixed(1) + "%</strong> · trials <strong>" + state.trials + "</strong>"); },
    },
    "bootstrap": {
      labels: ["Sample size", "Bootstrap draws"], ranges: [[8, 80, 1, 28], [20, 500, 10, 120]],
      reset() { state.sample = Array.from({length: params.a}, () => 60 + randn()*11 + (rng()<.15 ? 24 : 0)); state.means = []; },
      step() { for (let b=0;b<params.b;b++){ let s=0; for(let i=0;i<state.sample.length;i++) s += state.sample[Math.floor(rng()*state.sample.length)]; state.means.push(s/state.sample.length); } if(state.means.length>1200) state.means.splice(0,state.means.length-1200); },
      render() { clear(); const bins=Array(34).fill(0), min=35,max=100; state.means.forEach(m=>{ const k=clamp(Math.floor((m-min)/(max-min)*bins.length),0,bins.length-1); bins[k]++; }); barChart(bins,42,42,view.w-84,view.h-108,"#e8c547"); const sorted=[...state.means].sort((a,b)=>a-b), lo=sorted[Math.floor(sorted.length*.025)]||0, hi=sorted[Math.floor(sorted.length*.975)]||0; setReadout("bootstrap means <strong>" + state.means.length + "</strong> · 95% interval <strong>" + lo.toFixed(1) + " to " + hi.toFixed(1) + "</strong>"); },
    },
    "mm1-queue": {
      labels: ["Arrival rate", "Service rate"], ranges: [[0.2, 1.8, 0.01, 0.85], [0.3, 2.2, 0.01, 1.15]],
      reset() { state.q=0; state.t=0; state.nextA=0; state.nextS=Infinity; state.hist=[]; state.busy=false; },
      step() {
        const lam=params.a, mu=params.b; if(state.nextA<=state.t) state.nextA=state.t- Math.log(Math.max(1e-6,rng()))/lam;
        if(state.busy && state.nextS<=state.t){ state.q=Math.max(0,state.q-1); state.busy=state.q>0; state.nextS=state.busy?state.t- Math.log(Math.max(1e-6,rng()))/mu:Infinity; }
        if(state.nextA<=state.t+0.03){ state.q++; if(!state.busy){ state.busy=true; state.nextS=state.t- Math.log(Math.max(1e-6,rng()))/mu; } state.nextA=state.t- Math.log(Math.max(1e-6,rng()))/lam; }
        state.t+=0.03; state.hist.push(state.q); if(state.hist.length>220) state.hist.shift();
      },
      render() { clear(); line(state.hist,42,42,view.w-84,view.h-104,"#4fa3ff",Math.max(8,...state.hist)); setReadout("queue length <strong>" + state.q + "</strong> · utilization rho <strong>" + (params.a/params.b).toFixed(2) + "</strong> · " + (params.a<params.b ? "stable-ish" : "overloaded")); },
    },
    "gambler-ruin": {
      labels: ["Win probability", "Goal wealth"], ranges: [[0.35, 0.65, 0.01, 0.48], [10, 80, 1, 40]],
      reset() { state.paths=[]; state.wins=0; state.ruins=0; for(let i=0;i<28;i++) state.paths.push({w:Math.floor(params.b/2), hist:[]}); },
      step() { state.paths.forEach(p=>{ if(p.w<=0||p.w>=params.b){ p.w=Math.floor(params.b/2); p.hist=[]; } p.w += rng()<params.a?1:-1; if(p.w<=0) state.ruins++; if(p.w>=params.b) state.wins++; p.hist.push(p.w); if(p.hist.length>120)p.hist.shift(); }); },
      render() { clear(); axes(36,32,view.w-72,view.h-88); state.paths.forEach((p,i)=>line(p.hist,36,32,view.w-72,view.h-88,i%2?"rgba(79,163,255,.35)":"rgba(232,197,71,.35)",params.b)); setReadout("wins <strong>" + state.wins + "</strong> · ruins <strong>" + state.ruins + "</strong> · win p <strong>" + params.a.toFixed(2) + "</strong>"); },
    },
    "heat-equation": {
      labels: ["Diffusivity", "Brush heat"], ranges: [[0.04, 0.35, 0.01, 0.18], [0.2, 1, 0.01, 0.75]],
      reset() { state.n=96; state.u=new Float32Array(state.n); state.v=new Float32Array(state.n); for(let i=42;i<55;i++) state.u[i]=1; },
      step() { const n=state.n,a=params.a; for(let i=0;i<n;i++){ const l=state.u[Math.max(0,i-1)], c=state.u[i], r=state.u[Math.min(n-1,i+1)]; state.v[i]=c+a*(l-2*c+r); } [state.u,state.v]=[state.v,state.u]; },
      pointer(p) { const i=clamp(Math.floor(p.x/view.w*state.n),0,state.n-1); for(let k=-4;k<=4;k++) if(state.u[i+k]!=null) state.u[i+k]=params.b; },
      render() { clear(); const h=view.h-70,w=view.w-50,x=25,y=30; state.u.forEach((v,i)=>{ ctx.fillStyle="rgb("+Math.round(255*v)+","+Math.round(80+140*v)+","+Math.round(40+50*(1-v))+")"; ctx.fillRect(x+i/state.n*w,y+h-v*h,w/state.n+1,v*h); }); setReadout("peak heat <strong>" + Math.max(...state.u).toFixed(2) + "</strong> · diffusivity <strong>" + params.a.toFixed(2) + "</strong> · drag to add heat"); },
    },
    "orbital-transfer": {
      labels: ["Target orbit", "Progress"], ranges: [[1.25, 3.2, 0.01, 2.1], [0, 1, 0.01, 0.35]],
      reset() { state.t=0; },
      step() { params.b=(params.b+0.01)%1; bInput.value=params.b.toFixed(2); document.getElementById("paramBValue").textContent=params.b.toFixed(2); },
      render() { clear(); const cx=view.w/2,cy=view.h/2,R=Math.min(view.w,view.h)*.15,r2=R*params.a; ctx.strokeStyle="#232326"; ctx.lineWidth=2; ctx.beginPath();ctx.arc(cx,cy,R,0,TAU);ctx.stroke(); ctx.beginPath();ctx.arc(cx,cy,r2,0,TAU);ctx.stroke(); ctx.strokeStyle="#e8c547"; ctx.beginPath(); ctx.ellipse(cx+R*(params.a-1)/2,cy,R*(1+params.a)/2,R*.65,0,0,TAU); ctx.stroke(); const ang=params.b*Math.PI; const rr=R*(1+params.a)/2; ctx.fillStyle="#4fa3ff"; ctx.beginPath();ctx.arc(cx+Math.cos(ang)*rr+R*(params.a-1)/2,cy+Math.sin(ang)*R*.65,6,0,TAU);ctx.fill(); const dv=Math.abs(Math.sqrt(2*params.a/(1+params.a))-1)+Math.abs(1/Math.sqrt(params.a)-Math.sqrt(2/(params.a*(1+params.a)))); setReadout("target radius <strong>" + params.a.toFixed(2) + "x</strong> · normalized delta-v <strong>" + dv.toFixed(3) + "</strong>"); },
    },
    "robot-arm-ik": {
      labels: ["Link ratio", "Elbow"], ranges: [[0.45, 1.25, 0.01, 0.82], [-1, 1, 1, 1]],
      reset() { state.target={x:.55,y:.18}; },
      pointer(p){ state.target={x:p.x/view.w*2-1,y:p.y/view.h*2-1}; },
      step(){ state.target.x=Math.cos(Date.now()/700)*.65; state.target.y=Math.sin(Date.now()/900)*.45; },
      render(){ clear(); const cx=view.w/2,cy=view.h/2,L1=Math.min(view.w,view.h)*.23,L2=L1*params.a,tx=cx+state.target.x*view.w*.35,ty=cy+state.target.y*view.h*.35; const dx=tx-cx,dy=ty-cy,d=clamp(Math.hypot(dx,dy),Math.abs(L1-L2)+1,L1+L2-1),base=Math.atan2(dy,dx),cos2=clamp((d*d+L1*L1-L2*L2)/(2*d*L1),-1,1),a1=base+params.b*Math.acos(cos2),ex=cx+Math.cos(a1)*L1,ey=cy+Math.sin(a1)*L1; ctx.strokeStyle="rgba(255,255,255,.1)";ctx.beginPath();ctx.arc(cx,cy,L1+L2,0,TAU);ctx.stroke();ctx.strokeStyle="#e8c547";ctx.lineWidth=8;ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(ex,ey);ctx.lineTo(tx,ty);ctx.stroke();ctx.fillStyle="#4fa3ff";ctx.beginPath();ctx.arc(tx,ty,7,0,TAU);ctx.fill(); setReadout("target distance <strong>"+(d/L1).toFixed(2)+"</strong> · link ratio <strong>"+params.a.toFixed(2)+"</strong> · drag target"); },
    },
    "network-cascade": {
      labels: ["Threshold", "Connectivity"], ranges: [[0.1, 0.8, 0.01, 0.34], [2, 8, 1, 4]],
      reset(){ state.nodes=Array.from({length:36},(_,i)=>({x:.1+rng()*.8,y:.12+rng()*.76,on:i<2})); state.edges=[]; for(let i=0;i<36;i++)for(let j=i+1;j<36;j++){ const d=Math.hypot(state.nodes[i].x-state.nodes[j].x,state.nodes[i].y-state.nodes[j].y); if(d<params.b/18) state.edges.push([i,j]); } state.step=0; },
      step(){ const next=state.nodes.map(n=>n.on); state.nodes.forEach((n,i)=>{ const nb=state.edges.filter(e=>e[0]===i||e[1]===i).map(e=>e[0]===i?e[1]:e[0]); if(!n.on&&nb.length&&nb.filter(j=>state.nodes[j].on).length/nb.length>=params.a) next[i]=true; }); next.forEach((v,i)=>state.nodes[i].on=v); state.step++; },
      pointer(p){ let best=0,bd=99; state.nodes.forEach((n,i)=>{ const d=(p.x/view.w-n.x)**2+(p.y/view.h-n.y)**2;if(d<bd){bd=d;best=i;}}); state.nodes[best].on=true; },
      render(){ clear(); ctx.strokeStyle="rgba(255,255,255,.12)"; state.edges.forEach(([a,b])=>{ const A=state.nodes[a],B=state.nodes[b]; ctx.beginPath();ctx.moveTo(A.x*view.w,A.y*view.h);ctx.lineTo(B.x*view.w,B.y*view.h);ctx.stroke(); }); state.nodes.forEach(n=>{ctx.fillStyle=n.on?"#e8c547":"#232326";ctx.beginPath();ctx.arc(n.x*view.w,n.y*view.h,7,0,TAU);ctx.fill();}); setReadout("adopted <strong>"+state.nodes.filter(n=>n.on).length+"/"+state.nodes.length+"</strong> · threshold <strong>"+params.a.toFixed(2)+"</strong> · click seeds"); },
    },
    "congestion-pricing": {
      labels: ["Demand", "Toll"], ranges: [[0.2, 1, 0.01, 0.72], [0, 1.6, 0.01, 0.45]],
      reset(){ state.hist=[]; },
      step(){ const d=params.a, toll=params.b; let x=.5; for(let i=0;i<30;i++){ const c1=0.25+1.6*x*d+toll, c2=0.75+0.45*(1-x)*d; x=clamp(x+(c2-c1)*.12,0,1); } state.x=x; state.hist.push(x); if(state.hist.length>160)state.hist.shift(); },
      render(){ clear(); const x=state.x??.5; ctx.fillStyle="#4fa3ff";ctx.fillRect(80,view.h*.32,(view.w-160)*x,34);ctx.fillStyle="#e8c547";ctx.fillRect(80,view.h*.55,(view.w-160)*(1-x),34); line(state.hist,80,view.h*.72,view.w-160,view.h*.18,"#ff6a3d",1); const social=x*(.25+1.6*x*params.a)+(1-x)*(.75+.45*(1-x)*params.a); setReadout("tolled route share <strong>"+(x*100).toFixed(0)+"%</strong> · social cost <strong>"+social.toFixed(2)+"</strong> · toll <strong>"+params.b.toFixed(2)+"</strong>"); },
    },
  };

  const lab = labs[slug] || labs["sorting-race"];

  function setRange(input, range) {
    input.min = range[0]; input.max = range[1]; input.step = range[2]; input.value = range[3];
  }
  function configure() {
    aLabel.textContent = lab.labels[0];
    bLabel.textContent = lab.labels[1];
    setRange(aInput, lab.ranges[0]);
    setRange(bInput, lab.ranges[1]);
    params.a = Number(aInput.value);
    params.b = Number(bInput.value);
    params.speed = Number(speedInput.value);
  }
  function reset() {
    rng = Sim.rng(100 + slug.length * 19);
    lab.reset();
    if (sim) sim.renderOnce();
  }
  function update(dt) {
    const steps = Math.max(1, Math.round(params.speed * 3));
    for (let i = 0; i < steps; i++) {
      if (lab.step) lab.step(dt);
    }
  }
  function render() {
    if (lab.render) lab.render();
  }
  function resize() {
    view = Sim.fitCanvas(canvas, ctx);
    if (sim) sim.renderOnce();
  }

  configure();
  window.addEventListener("resize", resize);
  resize();
  reset();
  sim = Sim.loop({ update, render, stage: canvas.parentElement });

  Sim.bind("paramA", params, "a", (v) => {
    params.a = Number(v);
    reset();
    return Number(v).toFixed(lab.ranges[0][2] < 1 ? 2 : 0);
  });
  Sim.bind("paramB", params, "b", (v) => {
    params.b = Number(v);
    reset();
    return Number(v).toFixed(lab.ranges[1][2] < 1 ? 2 : 0);
  });
  Sim.bind("speed", params, "speed", (v) => Number(v).toFixed(1));
  Sim.pointer(canvas, {
    down(p) { if (lab.pointer) { lab.pointer(p); sim.renderOnce(); } },
    move(p) { if (p.down && lab.pointer) { lab.pointer(p); sim.renderOnce(); } },
  });
  document.getElementById("step").addEventListener("click", () => { if (lab.step) for (let i = 0; i < Math.max(1, Math.round(params.b || 1)); i++) lab.step(1 / 60); sim.renderOnce(); });
  document.getElementById("shuffle").addEventListener("click", reset);
  document.getElementById("toggle").addEventListener("click", function () { sim.toggle(); this.textContent = sim.running ? "Pause" : "Play"; });
  document.getElementById("reset").addEventListener("click", reset);
})();
