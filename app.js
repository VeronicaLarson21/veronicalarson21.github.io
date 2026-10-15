const canvas = document.getElementById("pizza");
const ctx = canvas.getContext("2d");
const form = document.getElementById("controls");
const statusEl = document.getElementById("status");

const SIZE = canvas.width;
const CENTER = SIZE / 2;
const RADIUS = 360;
const TAU = Math.PI * 2;

const CRUST_WIDTH = { thin: 30, regular: 48, thick: 74 };

const SAUCES = {
  tomato: ["#D2432B", "#A92A17"],
  white: ["#F6ECCF", "#E6D5A8"],
  pesto: ["#86A64A", "#5F7F2E"],
};

// Drawing order matters: later toppings sit on top of earlier ones.
const TOPPING_ORDER = ["pepperoni", "sausage", "mushroom", "pineapple", "onion", "pepper", "olive", "basil"];
const TOPPING_COUNT = { pepperoni: 15, sausage: 16, mushroom: 14, pineapple: 14, onion: 16, pepper: 16, olive: 22, basil: 10 };
const TOPPING_SPACING = { pepperoni: 70, sausage: 52, mushroom: 56, pineapple: 46, onion: 50, pepper: 52, olive: 34, basil: 56 };
const TOPPING_LABEL = { pepperoni: "pepperoni", sausage: "sausage", mushroom: "mushrooms", pineapple: "pineapple", onion: "onion", pepper: "green pepper", olive: "olives", basil: "basil" };

const state = {
  crust: "regular",
  sauce: "tomato",
  cheese: "regular",
  toppings: new Set(),
  amount: 1,
  slices: 8,
  seed: Math.floor(Math.random() * 1e9),
};

/* ---------- seeded randomness (keeps toppings in place between redraws) ---------- */

function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hash(str) {
  let h = 2166136261;
  for (const ch of str) {
    h ^= ch.charCodeAt(0);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

// Each layer gets its own random stream so toggling one topping never moves another.
const rngFor = (name) => mulberry32(state.seed ^ hash(name));
const between = (rand, min, max) => min + (max - min) * rand();

/* ---------- pizza layers ---------- */

function circle(x, y, r) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, TAU);
}

function drawCrust(width) {
  ctx.save();
  ctx.shadowColor = "rgba(20, 33, 61, 0.35)";
  ctx.shadowBlur = 26;
  ctx.shadowOffsetY = 10;
  const g = ctx.createRadialGradient(CENTER, CENTER, RADIUS - width, CENTER, CENTER, RADIUS);
  g.addColorStop(0, "#E3AE68");
  g.addColorStop(0.7, "#D69A4E");
  g.addColorStop(1, "#B97A32");
  ctx.fillStyle = g;
  circle(CENTER, CENTER, RADIUS);
  ctx.fill();
  ctx.restore();

  // baked blisters on the rim
  const rand = rngFor("crust");
  ctx.fillStyle = "rgba(120, 60, 15, 0.28)";
  for (let i = 0; i < 46; i++) {
    const a = rand() * TAU;
    const d = RADIUS - width + 6 + rand() * (width - 12);
    const r = between(rand, 4, 9);
    ctx.beginPath();
    ctx.ellipse(CENTER + Math.cos(a) * d, CENTER + Math.sin(a) * d, r, r * 0.7, a, 0, TAU);
    ctx.fill();
  }
}

function drawSauce(width) {
  const r = RADIUS - width + 2;
  const [inner, outer] = SAUCES[state.sauce];
  const g = ctx.createRadialGradient(CENTER, CENTER, 0, CENTER, CENTER, r);
  g.addColorStop(0, inner);
  g.addColorStop(1, outer);
  ctx.fillStyle = g;
  circle(CENTER, CENTER, r);
  ctx.fill();
  return r;
}

function drawCheese(sauceRadius) {
  if (state.cheese === "none") return;
  const extra = state.cheese === "extra";
  const rand = rngFor("cheese");
  const limit = sauceRadius - 10;

  ctx.save();
  circle(CENTER, CENTER, limit);
  ctx.clip();

  const blobs = extra ? 120 : 70;
  for (let i = 0; i < blobs; i++) {
    const a = rand() * TAU;
    const d = Math.sqrt(rand()) * (limit + 20);
    const x = CENTER + Math.cos(a) * d;
    const y = CENTER + Math.sin(a) * d;
    const r = between(rand, 26, 48);
    const squash = between(rand, 0.7, 1);
    const rot = rand() * TAU;

    ctx.fillStyle = extra ? "rgba(250, 217, 120, 0.95)" : "rgba(250, 217, 120, 0.82)";
    ctx.beginPath();
    ctx.ellipse(x, y, r, r * squash, rot, 0, TAU);
    ctx.fill();

    ctx.fillStyle = "rgba(255, 240, 185, 0.5)";
    ctx.beginPath();
    ctx.ellipse(x - r * 0.15, y - r * 0.15, r * 0.55, r * 0.4 * squash, rot, 0, TAU);
    ctx.fill();
  }

  // browned spots
  ctx.fillStyle = "rgba(196, 120, 40, 0.35)";
  for (let i = 0; i < 14; i++) {
    const a = rand() * TAU;
    const d = Math.sqrt(rand()) * limit;
    circle(CENTER + Math.cos(a) * d, CENTER + Math.sin(a) * d, between(rand, 4, 9));
    ctx.fill();
  }
  ctx.restore();
}

/* ---------- toppings ---------- */

const DRAW_TOPPING = {
  pepperoni() {
    ctx.fillStyle = "#B5291D";
    ctx.strokeStyle = "#8A1B12";
    ctx.lineWidth = 3;
    circle(0, 0, 34);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "rgba(120, 20, 15, 0.6)";
    for (const [x, y] of [[-12, -8], [10, -14], [14, 8], [-6, 14], [0, -1]]) {
      circle(x, y, 3);
      ctx.fill();
    }
    ctx.strokeStyle = "rgba(255, 160, 130, 0.45)";
    ctx.lineWidth = 4;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.arc(0, 0, 25, -2.6, -1.6);
    ctx.stroke();
  },

  sausage() {
    for (const [x, y, r] of [[-9, -6, 13], [9, -4, 12], [0, 10, 12]]) {
      ctx.fillStyle = "#7B4A2C";
      circle(x, y, r);
      ctx.fill();
      ctx.fillStyle = "#5A331B";
      circle(x + 3, y - 3, 2.5);
      ctx.fill();
      circle(x - 4, y + 4, 2);
      ctx.fill();
    }
  },

  mushroom() {
    ctx.beginPath();
    ctx.moveTo(-26, 4);
    ctx.bezierCurveTo(-28, -22, 28, -22, 26, 4);
    ctx.lineTo(10, 4);
    ctx.lineTo(10, 24);
    ctx.lineTo(-10, 24);
    ctx.lineTo(-10, 4);
    ctx.closePath();
    ctx.fillStyle = "#EADFCB";
    ctx.strokeStyle = "#9B8667";
    ctx.lineWidth = 3;
    ctx.lineJoin = "round";
    ctx.fill();
    ctx.stroke();
  },

  pineapple() {
    ctx.beginPath();
    ctx.roundRect(-18, -14, 36, 28, 6);
    ctx.fillStyle = "#F4CE45";
    ctx.strokeStyle = "#D3A322";
    ctx.lineWidth = 3;
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = "rgba(211, 163, 34, 0.55)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-8, -8);
    ctx.lineTo(-8, 8);
    ctx.moveTo(6, -8);
    ctx.lineTo(6, 8);
    ctx.stroke();
  },

  onion() {
    ctx.lineCap = "round";
    ctx.strokeStyle = "rgba(244, 228, 250, 0.95)";
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(0, 0, 24, 0, Math.PI * 1.5);
    ctx.stroke();
    ctx.strokeStyle = "rgba(220, 190, 235, 0.9)";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(0, 0, 14, 0.3, Math.PI * 1.2);
    ctx.stroke();
  },

  pepper() {
    ctx.lineCap = "round";
    ctx.strokeStyle = "#3F8A32";
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.arc(0, 0, 26, 0, Math.PI * 0.8);
    ctx.stroke();
    ctx.strokeStyle = "#7CC15A";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, 26, 0.05, Math.PI * 0.75);
    ctx.stroke();
  },

  olive() {
    ctx.strokeStyle = "#2A2420";
    ctx.lineWidth = 9;
    circle(0, 0, 10);
    ctx.stroke();
  },

  basil() {
    ctx.beginPath();
    ctx.moveTo(-26, 0);
    ctx.bezierCurveTo(-12, -24, 14, -22, 28, 0);
    ctx.bezierCurveTo(14, 22, -12, 24, -26, 0);
    ctx.fillStyle = "#2E7D32";
    ctx.strokeStyle = "#1E5A22";
    ctx.lineWidth = 2;
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = "rgba(190, 230, 150, 0.8)";
    ctx.beginPath();
    ctx.moveTo(-24, 0);
    ctx.lineTo(24, 0);
    ctx.stroke();
  },
};

function scatter(rand, count, radius, spacing) {
  const points = [];
  let tries = 0;
  while (points.length < count && tries < count * 40) {
    tries++;
    const a = rand() * TAU;
    const d = Math.sqrt(rand()) * radius;
    const p = {
      x: CENTER + Math.cos(a) * d,
      y: CENTER + Math.sin(a) * d,
      rot: rand() * TAU,
      scale: 0.85 + rand() * 0.3,
    };
    if (points.every((q) => Math.hypot(q.x - p.x, q.y - p.y) > spacing)) points.push(p);
  }
  return points;
}

function drawToppings(area) {
  for (const name of TOPPING_ORDER) {
    if (!state.toppings.has(name)) continue;
    const count = Math.round(TOPPING_COUNT[name] * state.amount);
    const points = scatter(rngFor(name), count, area, TOPPING_SPACING[name]);
    for (const p of points) {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.scale(p.scale, p.scale);
      DRAW_TOPPING[name]();
      ctx.restore();
    }
  }
}

function drawSlices() {
  const n = state.slices;
  if (!n) return;
  ctx.save();
  ctx.strokeStyle = "rgba(50, 25, 8, 0.45)";
  ctx.lineWidth = 3;
  ctx.lineCap = "round";
  for (let i = 0; i < n; i++) {
    const a = (i / n) * TAU - Math.PI / 2;
    ctx.beginPath();
    ctx.moveTo(CENTER, CENTER);
    ctx.lineTo(CENTER + Math.cos(a) * RADIUS, CENTER + Math.sin(a) * RADIUS);
    ctx.stroke();
  }
  ctx.restore();
}

/* ---------- render ---------- */

function describe() {
  const list = TOPPING_ORDER.filter((t) => state.toppings.has(t)).map((t) => TOPPING_LABEL[t]);
  const cheese = state.cheese === "none" ? "no cheese" : `${state.cheese} cheese`;
  const toppings = list.length ? list.join(", ") : "no toppings";
  return `Pizza with ${state.crust} crust, ${state.sauce} sauce, ${cheese} and ${toppings}`;
}

function draw() {
  ctx.clearRect(0, 0, SIZE, SIZE);
  const width = CRUST_WIDTH[state.crust];
  drawCrust(width);
  const sauceRadius = drawSauce(width);
  drawCheese(sauceRadius);
  drawToppings(sauceRadius - 40);
  drawSlices();
  canvas.setAttribute("aria-label", describe());
}

function readForm() {
  const data = new FormData(form);
  state.crust = data.get("crust");
  state.sauce = data.get("sauce");
  state.cheese = data.get("cheese");
  state.slices = parseInt(data.get("slices"), 10);
  state.amount = parseFloat(data.get("amount"));
  state.toppings = new Set(data.getAll("topping"));
}

/* ---------- events ---------- */

form.addEventListener("input", () => {
  readForm();
  draw();
  statusEl.textContent = "";
});

document.getElementById("shuffle").addEventListener("click", () => {
  state.seed = Math.floor(Math.random() * 1e9);
  draw();
});

document.getElementById("download").addEventListener("click", () => {
  canvas.toBlob((blob) => {
    if (!blob) {
      statusEl.textContent = "Couldn't create the image. Try again.";
      return;
    }
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "my-pizza.png";
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    statusEl.textContent = "Downloaded my-pizza.png";
  }, "image/png");
});

form.addEventListener("submit", (e) => e.preventDefault());

readForm();
draw();
