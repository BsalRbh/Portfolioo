// Tempo Dash — game engine. Pure canvas, no dependencies.
// Top-down three-lane road; the world scrolls down while the tempo drives up.
// All game units are "logical pixels" in a world 420 wide; the canvas is
// scaled to fit its box (and the device pixel ratio).

import { STOPS } from "./stops";

export type Hud = {
  score: number;
  distance: number; // metres
  charge: number; // 0–100
  momos: number;
  passengers: number;
  nextStop: string;
  speed: number; // km/h, for show
};

export type GameOver = Hud & { reason: string };

export type Callbacks = {
  onHud: (h: Hud) => void;
  onToast: (text: string) => void;
  onStop: (stopIndex: number) => void;
  onHonk: () => void;
  onGameOver: (g: GameOver) => void;
};

/* ───────── world layout ───────── */
const W = 420;
const SIDE = 60; // sidewalk + buildings on each side
const ROAD_L = SIDE;
const LANE_W = (W - SIDE * 2) / 3; // 100
const laneX = (lane: number) => ROAD_L + LANE_W * lane + LANE_W / 2;
const METRES_PER_UNIT = 0.1;

const C = {
  asphalt: "#3a393b",
  asphaltPatch: "#333234",
  dash: "#e9e4d6",
  kerb: "#8d8880",
  pavement: "#a7a198",
  tempo: "#2f8a4c",
  tempoDark: "#226a39",
  cream: "#f4f1ea",
  glass: "#cfe7f0",
  ink: "#1d1410",
};
const FLAG = ["#2f6fb5", "#f4f1ea", "#c8372d", "#3e8f4e", "#e8b931"];
const BUILDING = ["#a9492c", "#e3d7bf", "#9fb8c8", "#a8c39c", "#d8a7a0", "#c9b28a", "#b9b4c9"];
const KURTA = ["#c8372d", "#2f6fb5", "#e8b931", "#7a3e8f", "#3e8f4e", "#e07b39"];

type Kind = "cow" | "microbus" | "bike" | "pothole" | "dog" | "walker" | "momo" | "battery" | "stop" | "flags";

type Ent = {
  kind: Kind;
  x: number;
  y: number;
  w: number;
  h: number;
  vx: number; // lateral speed
  fwd: number; // own forward speed (subtracted from world speed)
  lane: number;
  t: number; // age / phase
  hue: number; // variant index
  scared?: boolean;
  done?: boolean; // stop: passengers already picked up
  stop?: number; // stop index
  heading?: number; // cow facing angle
};

const REASONS: Partial<Record<Kind | "battery-dead", string>> = {
  cow: "You hit a holy cow. The whole street is staring.",
  microbus: "Microbus wins. Microbus always wins.",
  bike: "Clipped a motorbike. Both of you blame each other.",
  dog: "You bumped a street dog. He's fine. You're not.",
  walker: "A pedestrian?! Traffic police took your licence.",
  "battery-dead": "Battery dead. Time to push it home.",
};

function mulberry(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export class TempoEngine {
  private ctx: CanvasRenderingContext2D;
  private cb: Callbacks;
  private font: string;
  private H = 700;
  private scale = 1;
  private raf = 0;
  private last = 0;
  private hudTimer = 0;

  state: "ready" | "running" | "paused" | "over" = "ready";

  // run state
  private travel = 0;
  private speed = 280;
  private charge = 100;
  private momos = 0;
  private passengers = 0;
  private nextStop = 0;
  private lane = 1;
  private px = laneX(1);
  private shake = 0;
  private honkT = 0;
  private honkCool = 0;
  private slowT = 0;
  private brakeT = 0;
  private ents: Ent[] = [];
  private spawnAt = 300;
  private stopAt = 900;
  private batteryAt = 3200;
  private flagsAt = 1600;
  private hinted = new Set<string>();

  constructor(private canvas: HTMLCanvasElement, cb: Callbacks, fontFamily: string) {
    this.ctx = canvas.getContext("2d")!;
    this.cb = cb;
    this.font = fontFamily;
    this.resize();
    this.reset();
    this.draw();
  }

  /* ───────── lifecycle ───────── */

  resize() {
    const r = this.canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = Math.round(r.width * dpr);
    this.canvas.height = Math.round(r.height * dpr);
    this.scale = (r.width / W) * dpr;
    this.H = r.height / (r.width / W);
    if (this.state !== "running") this.draw();
  }

  reset() {
    this.travel = 0;
    this.speed = 280;
    this.charge = 100;
    this.momos = 0;
    this.passengers = 0;
    this.nextStop = 0;
    this.lane = 1;
    this.px = laneX(1);
    this.shake = 0;
    this.honkT = 0;
    this.honkCool = 0;
    this.slowT = 0;
    this.ents = [];
    this.spawnAt = 420;
    this.stopAt = 1100;
    this.batteryAt = 3600;
    this.flagsAt = 1500;
    this.emitHud();
  }

  start() {
    if (this.state === "over") this.reset();
    this.state = "running";
    this.last = performance.now();
    cancelAnimationFrame(this.raf);
    this.raf = requestAnimationFrame(this.loop);
  }

  pause() {
    if (this.state !== "running") return;
    this.state = "paused";
    cancelAnimationFrame(this.raf);
    this.draw();
  }

  destroy() {
    cancelAnimationFrame(this.raf);
  }

  /* ───────── controls ───────── */

  left() {
    if (this.state === "running") this.lane = Math.max(0, this.lane - 1);
  }
  right() {
    if (this.state === "running") this.lane = Math.min(2, this.lane + 1);
  }
  /** Hold ↓ to brake: keeps the speed down while the key repeats. */
  brake() {
    if (this.state === "running") this.brakeT = 0.18;
  }
  honk() {
    if (this.state !== "running" || this.honkCool > 0) return;
    this.honkCool = 0.6;
    this.honkT = 0.35;
    this.cb.onHonk();
    let cowNear = false;
    for (const e of this.ents) {
      const ahead = e.y < this.playerY() && e.y > this.playerY() - 420;
      if (!ahead) continue;
      if ((e.kind === "walker" || e.kind === "dog") && !e.scared) {
        e.scared = true;
        e.vx = (e.x < W / 2 ? -1 : 1) * 320;
      }
      if (e.kind === "cow") cowNear = true;
    }
    if (cowNear && !this.hinted.has("cow-honk")) {
      this.hinted.add("cow-honk");
      this.cb.onToast("The cow heard you. The cow does not care.");
    }
  }

  /* ───────── loop ───────── */

  private loop = (now: number) => {
    const dt = Math.min(0.05, (now - this.last) / 1000);
    this.last = now;
    this.update(dt);
    this.draw();
    if (this.state === "running") this.raf = requestAnimationFrame(this.loop);
  };

  private playerY() {
    return this.H - 130;
  }

  private update(dt: number) {
    // speed ramps with distance; potholes slow you briefly
    const target = 280 + Math.min(360, this.travel * 0.011);
    this.slowT = Math.max(0, this.slowT - dt);
    this.brakeT = Math.max(0, this.brakeT - dt);
    const want = this.slowT > 0 ? target * 0.55 : this.brakeT > 0 ? target * 0.45 : target;
    this.speed += (want - this.speed) * Math.min(1, dt * 2.5);
    const d = this.speed * dt;
    this.travel += d;

    this.px += (laneX(this.lane) - this.px) * Math.min(1, dt * 14);
    this.shake = Math.max(0, this.shake - dt * 3);
    this.honkT = Math.max(0, this.honkT - dt);
    this.honkCool = Math.max(0, this.honkCool - dt);

    // electric tempo: battery drains with distance
    this.charge -= d * 0.0058;
    if (this.charge <= 0) {
      this.charge = 0;
      return this.end("battery-dead");
    }
    if (this.charge < 25 && !this.hinted.has("low")) {
      this.hinted.add("low");
      this.cb.onToast("Battery low! Grab a charging point ⚡");
    }

    this.spawn();

    // move entities
    for (const e of this.ents) {
      e.t += dt;
      e.y += (this.speed - e.fwd) * dt;
      e.x += e.vx * dt;
      if (e.kind === "bike" && Math.random() < dt * 0.25) {
        // weave into a neighbouring lane
        const to = Math.max(0, Math.min(2, e.lane + (Math.random() < 0.5 ? -1 : 1)));
        e.lane = to;
      }
      if (e.kind === "bike") e.x += (laneX(e.lane) - e.x) * Math.min(1, dt * 3);
      if (e.kind === "cow" && Math.random() < dt * 0.08) e.heading = (e.heading ?? 0) + (Math.random() - 0.5);
    }
    this.ents = this.ents.filter((e) => e.y < this.H + 200 && e.x > -80 && e.x < W + 80);

    this.collide();
    this.hudTimer += dt;
    if (this.hudTimer > 0.1) {
      this.hudTimer = 0;
      this.emitHud();
    }
  }

  private lanesBusy(): Set<number> {
    const busy = new Set<number>();
    for (const e of this.ents) {
      if (["cow", "microbus", "bike", "pothole"].includes(e.kind) && e.y > -260 && e.y < 220) busy.add(e.lane);
      if (e.kind === "stop" && !e.done && e.y < this.playerY()) busy.add(0); // keep the stop lane clear
    }
    return busy;
  }

  private spawn() {
    const T = this.travel;

    if (T >= this.stopAt) {
      const idx = this.nextStop % STOPS.length;
      this.ents.push({ kind: "stop", x: laneX(0), y: -300, w: LANE_W, h: 260, vx: 0, fwd: 0, lane: 0, t: 0, hue: 0, stop: idx });
      this.stopAt = T + 2300;
      if (!this.hinted.has("stop")) {
        this.hinted.add("stop");
        this.cb.onToast(`Bus stop ahead: ${STOPS[idx].place}! Drive through it in the left lane.`);
      }
    }

    if (T >= this.flagsAt) {
      this.ents.push({ kind: "flags", x: W / 2, y: -40, w: W, h: 20, vx: 0, fwd: 0, lane: -1, t: 0, hue: Math.floor(Math.random() * 5) });
      this.flagsAt = T + 2600 + Math.random() * 2000;
    }

    if (T >= this.batteryAt) {
      const busy = this.lanesBusy();
      const free = [0, 1, 2].filter((l) => !busy.has(l));
      const lane = free[Math.floor(Math.random() * free.length)] ?? 1;
      this.ents.push({ kind: "battery", x: laneX(lane), y: -60, w: 22, h: 30, vx: 0, fwd: 0, lane, t: 0, hue: 0 });
      this.batteryAt = T + 3200 + Math.random() * 1400;
    }

    if (T < this.spawnAt) return;
    const gap = Math.max(150, 290 - T * 0.0035);
    this.spawnAt = T + gap * (0.75 + Math.random() * 0.6);

    const busy = this.lanesBusy();
    const open = [0, 1, 2].filter((l) => !busy.has(l));
    if (open.length <= 1) return; // never wall off the road
    const blocks = Math.random() < Math.min(0.55, 0.15 + T * 0.00004) ? 2 : 1;
    const lanes = open.sort(() => Math.random() - 0.5).slice(0, Math.min(blocks, open.length - 1));

    for (const lane of lanes) {
      const r = Math.random();
      const level = Math.min(1, T / 9000);
      let kind: Kind;
      if (r < 0.22) kind = "cow";
      else if (r < 0.42) kind = "microbus";
      else if (r < 0.58 + level * 0.1) kind = "bike";
      else kind = "pothole";
      this.ents.push(this.make(kind, lane));
    }

    // crossers: a pedestrian or a dog stepping off the pavement (honk them away)
    if (Math.random() < 0.12 + Math.min(0.12, T * 0.00002)) {
      const fromLeft = Math.random() < 0.5;
      const kind: Kind = Math.random() < 0.6 ? "walker" : "dog";
      this.ents.push({
        kind,
        x: fromLeft ? ROAD_L - 14 : W - ROAD_L + 14,
        y: -40,
        w: kind === "walker" ? 22 : 16,
        h: kind === "walker" ? 22 : 28,
        vx: (fromLeft ? 1 : -1) * (kind === "walker" ? 46 : 64),
        fwd: 0,
        lane: -1,
        t: 0,
        hue: Math.floor(Math.random() * KURTA.length),
      });
      if (!this.hinted.has("cross")) {
        this.hinted.add("cross");
        this.cb.onToast("Someone's crossing — honk! (Space / tap)");
      }
    }

    // momos in a free lane
    const stillOpen = [0, 1, 2].filter((l) => !lanes.includes(l) && !busy.has(l));
    if (stillOpen.length && Math.random() < 0.55) {
      const lane = stillOpen[Math.floor(Math.random() * stillOpen.length)];
      const n = 2 + Math.floor(Math.random() * 3);
      for (let i = 0; i < n; i++)
        this.ents.push({ kind: "momo", x: laneX(lane), y: -40 - i * 46, w: 18, h: 16, vx: 0, fwd: 0, lane, t: 0, hue: 0 });
    }
  }

  private make(kind: Kind, lane: number): Ent {
    const base = { x: laneX(lane), y: -120, vx: 0, fwd: 0, lane, t: 0, hue: Math.floor(Math.random() * 6) };
    switch (kind) {
      case "cow":
        return { ...base, kind, w: 34, h: 58, heading: (Math.random() - 0.5) * 1.2 };
      case "microbus":
        return { ...base, kind, w: 50, h: 94, fwd: 110 + Math.random() * 40, y: -160 };
      case "bike":
        return { ...base, kind, w: 18, h: 36, fwd: 150 + Math.random() * 80 };
      default:
        return { ...base, kind: "pothole", w: 40, h: 24, x: laneX(lane) + (Math.random() - 0.5) * 30 };
    }
  }

  private collide() {
    const py = this.playerY();
    const pw = 38 * 0.82;
    const ph = 64 * 0.82;
    for (const e of this.ents) {
      if (e.kind === "flags") continue;
      if (e.kind === "stop") {
        const inZone = py > e.y && py < e.y + e.h;
        if (inZone && !e.done && Math.abs(this.px - laneX(0)) < 30) {
          e.done = true;
          this.passengers += 3;
          const idx = e.stop ?? 0;
          this.nextStop++;
          this.cb.onStop(idx);
        }
        continue;
      }
      const hit = Math.abs(e.x - this.px) < (e.w * 0.8 + pw) / 2 && Math.abs(e.y - py) < (e.h * 0.8 + ph) / 2;
      if (!hit) continue;
      if (e.kind === "momo") {
        this.momos++;
        e.y = this.H + 999;
      } else if (e.kind === "battery") {
        this.charge = Math.min(100, this.charge + 45);
        this.cb.onToast("Charged up ⚡ +45%");
        e.y = this.H + 999;
      } else if (e.kind === "pothole") {
        if (!e.done) {
          e.done = true;
          this.slowT = 0.9;
          this.shake = 1;
          this.charge = Math.max(0, this.charge - 4);
          if (!this.hinted.has("pothole")) {
            this.hinted.add("pothole");
            this.cb.onToast("Pothole! Classic Kathmandu.");
          }
        }
      } else if ((e.kind === "walker" || e.kind === "dog") && e.scared) {
        continue;
      } else {
        return this.end(e.kind);
      }
    }
  }

  private score() {
    return Math.floor(this.travel / 10) + this.momos * 10 + this.passengers * 40;
  }

  private hud(): Hud {
    return {
      score: this.score(),
      distance: Math.floor(this.travel * METRES_PER_UNIT),
      charge: Math.round(this.charge),
      momos: this.momos,
      passengers: this.passengers,
      nextStop: STOPS[this.nextStop % STOPS.length].place,
      speed: Math.round(this.speed / 9),
    };
  }

  private emitHud() {
    this.cb.onHud(this.hud());
  }

  private end(kind: Kind | "battery-dead") {
    this.state = "over";
    this.shake = 1.4;
    cancelAnimationFrame(this.raf);
    this.emitHud();
    this.cb.onGameOver({ ...this.hud(), reason: REASONS[kind] ?? "Crash!" });
    // let the shake settle on the final frame
    const settle = (n: number) => {
      this.shake = Math.max(0, this.shake - 0.15);
      this.draw();
      if (n > 0 && this.shake > 0) requestAnimationFrame(() => settle(n - 1));
    };
    settle(12);
  }

  /* ───────── drawing ───────── */

  private draw() {
    const ctx = this.ctx;
    const H = this.H;
    ctx.setTransform(this.scale, 0, 0, this.scale, 0, 0);
    const sx = this.shake ? (Math.random() - 0.5) * 6 * this.shake : 0;
    const sy = this.shake ? (Math.random() - 0.5) * 6 * this.shake : 0;
    ctx.translate(sx, sy);

    this.drawStreet(H);

    // ground-level things first, then vehicles and people, then overhead flags
    const order: Kind[] = ["stop", "pothole", "momo", "battery", "walker", "dog", "cow", "bike", "microbus"];
    for (const k of order) for (const e of this.ents) if (e.kind === k) this.drawEnt(e);
    this.drawTempo(this.px, this.playerY());
    for (const e of this.ents) if (e.kind === "flags") this.drawFlags(e);

    ctx.setTransform(1, 0, 0, 1, 0, 0);
  }

  private drawStreet(H: number) {
    const ctx = this.ctx;
    // road
    ctx.fillStyle = C.asphalt;
    ctx.fillRect(ROAD_L, -10, W - SIDE * 2, H + 20);
    // asphalt patches (deterministic, scroll with the road)
    const SEG = 130;
    const k0 = Math.floor(this.travel / SEG) - 1;
    const k1 = Math.floor((this.travel + H) / SEG) + 1;
    for (let k = k0; k <= k1; k++) {
      const top = this.travel - (k + 1) * SEG + H;
      const rnd = mulberry(k * 7919 + 3);
      if (rnd() < 0.35) {
        ctx.fillStyle = C.asphaltPatch;
        ctx.fillRect(ROAD_L + rnd() * 220, top + rnd() * 80, 30 + rnd() * 40, 16 + rnd() * 30);
      }
      // buildings on both sides, seen from above: rooftops with water tanks
      for (const side of [0, 1]) {
        const r = mulberry(k * 104729 + side * 31 + 11);
        const x0 = side === 0 ? 0 : W - SIDE + 14;
        const bw = SIDE - 14;
        let y = top;
        while (y < top + SEG) {
          const bh = 34 + r() * 46;
          const h = Math.min(bh, top + SEG - y);
          ctx.fillStyle = BUILDING[Math.floor(r() * BUILDING.length)];
          ctx.fillRect(x0, y, bw, h - 3);
          ctx.fillStyle = "rgba(0,0,0,.12)";
          ctx.fillRect(x0, y + h - 6, bw, 3);
          if (r() < 0.55 && h > 24) {
            // black water tank
            ctx.fillStyle = "#1d1d1f";
            ctx.beginPath();
            ctx.arc(x0 + 10 + r() * (bw - 20), y + 8 + r() * (h - 20), 6.5, 0, Math.PI * 2);
            ctx.fill();
          }
          if (r() < 0.25 && h > 28) {
            // solar panel
            ctx.fillStyle = "#2b3d63";
            ctx.fillRect(x0 + 6, y + 6, 16, 10);
          }
          y += h;
        }
      }
    }
    // pavements + kerbs
    ctx.fillStyle = C.pavement;
    ctx.fillRect(SIDE - 14, -10, 14, H + 20);
    ctx.fillRect(W - SIDE, -10, 14, H + 20);
    ctx.fillStyle = C.kerb;
    ctx.fillRect(SIDE - 3, -10, 3, H + 20);
    ctx.fillRect(W - SIDE, -10, 3, H + 20);
    // lane dashes
    ctx.fillStyle = C.dash;
    const off = this.travel % 60;
    for (const l of [1, 2]) {
      const x = ROAD_L + LANE_W * l - 1.5;
      for (let y = -60 + off; y < H + 60; y += 60) ctx.fillRect(x, y, 3, 30);
    }
  }

  private drawEnt(e: Ent) {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(e.x, e.y);
    switch (e.kind) {
      case "pothole": {
        ctx.fillStyle = "#4a4749";
        ctx.beginPath();
        ctx.ellipse(0, 0, e.w / 2 + 3, e.h / 2 + 3, 0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#1c1b1d";
        ctx.beginPath();
        ctx.ellipse(0, 1, e.w / 2, e.h / 2, 0.2, 0, Math.PI * 2);
        ctx.fill();
        break;
      }
      case "momo": {
        const b = Math.sin(e.t * 6) * 1.5;
        ctx.fillStyle = "rgba(0,0,0,.25)";
        ctx.beginPath();
        ctx.ellipse(0, 7, 9, 3, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#f6efdf";
        ctx.beginPath();
        ctx.ellipse(0, b, 10, 8, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#cdbf9f";
        ctx.lineWidth = 1;
        for (let i = -1; i <= 1; i++) {
          ctx.beginPath();
          ctx.moveTo(i * 4, b - 6);
          ctx.quadraticCurveTo(i * 2, b - 1, 0, b + 1);
          ctx.stroke();
        }
        break;
      }
      case "battery": {
        const glow = 0.5 + Math.sin(e.t * 5) * 0.2;
        ctx.fillStyle = `rgba(120,230,140,${glow * 0.4})`;
        ctx.beginPath();
        ctx.arc(0, 0, 22, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#1f2a22";
        ctx.fillRect(-10, -14, 20, 28);
        ctx.fillRect(-4, -17, 8, 4);
        ctx.fillStyle = "#7de08f";
        ctx.beginPath();
        ctx.moveTo(2, -10);
        ctx.lineTo(-5, 2);
        ctx.lineTo(0, 2);
        ctx.lineTo(-2, 10);
        ctx.lineTo(5, -2);
        ctx.lineTo(0, -2);
        ctx.closePath();
        ctx.fill();
        break;
      }
      case "cow": {
        ctx.rotate(e.heading ?? 0);
        ctx.fillStyle = "rgba(0,0,0,.25)";
        ctx.beginPath();
        ctx.ellipse(3, 4, 18, 30, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#efe8da";
        ctx.beginPath();
        ctx.ellipse(0, 4, 16, 26, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#7a5a40";
        ctx.beginPath();
        ctx.ellipse(-6, 8, 6, 8, 0.4, 0, Math.PI * 2);
        ctx.ellipse(7, -4, 5, 6, -0.3, 0, Math.PI * 2);
        ctx.fill();
        // head + horns (facing up)
        ctx.fillStyle = "#e6dccb";
        ctx.beginPath();
        ctx.ellipse(0, -26, 8, 10, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#cbbd9c";
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(-6, -32);
        ctx.quadraticCurveTo(-12, -40, -8, -44);
        ctx.moveTo(6, -32);
        ctx.quadraticCurveTo(12, -40, 8, -44);
        ctx.stroke();
        // tail flick
        ctx.strokeStyle = "#cfc4ae";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, 30);
        ctx.quadraticCurveTo(Math.sin(e.t * 4) * 8, 38, Math.sin(e.t * 4) * 4, 44);
        ctx.stroke();
        break;
      }
      case "microbus": {
        ctx.fillStyle = "rgba(0,0,0,.3)";
        ctx.fillRect(-22, -42, 50, 94);
        ctx.fillStyle = "#ecebe6";
        this.round(-25, -47, 50, 94, 9);
        ctx.fillStyle = "#2f5fa8";
        ctx.fillRect(-25, -10, 4, 40);
        ctx.fillRect(21, -10, 4, 40);
        ctx.fillStyle = "#283447";
        this.round(-20, -42, 40, 16, 5); // windscreen
        ctx.fillStyle = "#d9d7d0";
        ctx.fillRect(-18, -16, 36, 54); // roof
        ctx.fillStyle = "#b8b5ad";
        ctx.fillRect(-14, 0, 28, 3);
        ctx.fillRect(-14, 18, 28, 3);
        break;
      }
      case "bike": {
        ctx.fillStyle = "rgba(0,0,0,.3)";
        ctx.fillRect(-6, -14, 14, 34);
        ctx.fillStyle = "#26262a";
        this.round(-6, -18, 12, 36, 5);
        ctx.fillStyle = ["#c8372d", "#2f6fb5", "#e8b931", "#f4f1ea", "#3e8f4e", "#7a3e8f"][e.hue];
        ctx.beginPath();
        ctx.arc(0, 0, 8, 0, Math.PI * 2);
        ctx.fill(); // helmet
        ctx.fillStyle = "#3a3a3e";
        ctx.fillRect(-10, -12, 20, 3); // handlebar
        break;
      }
      case "walker": {
        const step = Math.sin(e.t * (e.scared ? 22 : 9)) * 4;
        ctx.fillStyle = "rgba(0,0,0,.25)";
        ctx.beginPath();
        ctx.ellipse(2, 3, 12, 8, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#3a2a20";
        ctx.fillRect(-6, -2 + step, 4, 8);
        ctx.fillRect(2, -2 - step, 4, 8);
        ctx.fillStyle = KURTA[e.hue];
        ctx.beginPath();
        ctx.ellipse(0, 0, 11, 7, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#2a1a12";
        ctx.beginPath();
        ctx.arc(0, -1, 5.5, 0, Math.PI * 2);
        ctx.fill();
        if (e.scared) this.say("!", 0, -16);
        break;
      }
      case "dog": {
        const wag = Math.sin(e.t * (e.scared ? 30 : 12)) * 0.6;
        ctx.rotate(e.vx > 0 ? Math.PI / 2 : -Math.PI / 2);
        ctx.fillStyle = "#8a6a4a";
        ctx.beginPath();
        ctx.ellipse(0, 0, 7, 13, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(0, -13, 5.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#8a6a4a";
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(0, 12);
        ctx.lineTo(Math.sin(wag) * 6, 19);
        ctx.stroke();
        if (e.scared) {
          ctx.rotate(e.vx > 0 ? -Math.PI / 2 : Math.PI / 2);
          this.say("woof", 0, -18);
        }
        break;
      }
      case "stop": {
        // painted stop bay on the left lane + sign on the pavement + waiting passengers
        ctx.translate(-e.x, -e.y);
        ctx.fillStyle = e.done ? "rgba(62,143,78,.28)" : "rgba(232,185,49,.22)";
        ctx.fillRect(ROAD_L, e.y, LANE_W, e.h);
        ctx.strokeStyle = e.done ? "#3e8f4e" : "#e8b931";
        ctx.lineWidth = 3;
        ctx.setLineDash([12, 8]);
        ctx.strokeRect(ROAD_L + 3, e.y + 3, LANE_W - 6, e.h - 6);
        ctx.setLineDash([]);
        ctx.fillStyle = e.done ? "#3e8f4e" : "#e8b931";
        ctx.font = `bold 14px ${this.font}`;
        ctx.textAlign = "center";
        ctx.fillText(e.done ? "✓ PICKED UP" : "BUS STOP", ROAD_L + LANE_W / 2, e.y + e.h / 2 + 5);
        // sign board on the left pavement
        const stop = STOPS[e.stop ?? 0];
        const sy = e.y + 40;
        ctx.fillStyle = "#1d1410";
        ctx.fillRect(SIDE - 9, sy, 3, 60);
        ctx.fillStyle = "#f3ecda";
        this.round(4, sy - 6, SIDE - 4, 42, 4);
        ctx.strokeStyle = "#b3261e";
        ctx.lineWidth = 2;
        ctx.strokeRect(6, sy - 4, SIDE - 8, 38);
        ctx.fillStyle = "#b3261e";
        ctx.font = `13px ${this.font}`;
        ctx.fillText(stop.ne, 4 + (SIDE - 4) / 2, sy + 12);
        ctx.fillStyle = "#1d3c72";
        ctx.font = `bold 9px ${this.font}`;
        ctx.fillText(stop.place.toUpperCase(), 4 + (SIDE - 4) / 2, sy + 27);
        // passengers waiting (or gone)
        if (!e.done) {
          for (let i = 0; i < 3; i++) {
            const bob = Math.sin(e.t * 5 + i) * 1.5;
            ctx.fillStyle = KURTA[(i * 2 + (e.stop ?? 0)) % KURTA.length];
            ctx.beginPath();
            ctx.ellipse(SIDE - 8, sy + 80 + i * 26 + bob, 8, 5.5, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "#2a1a12";
            ctx.beginPath();
            ctx.arc(SIDE - 8, sy + 79 + i * 26 + bob, 4, 0, Math.PI * 2);
            ctx.fill();
          }
        }
        break;
      }
    }
    ctx.restore();
  }

  private drawTempo(x: number, y: number) {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(x, y);
    const tilt = (laneX(this.lane) - x) * -0.004;
    ctx.rotate(tilt);
    // honk waves
    if (this.honkT > 0) {
      const p = 1 - this.honkT / 0.35;
      ctx.strokeStyle = `rgba(232,185,49,${1 - p})`;
      ctx.lineWidth = 3;
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.arc(0, -40, 16 + p * 40 + i * 12, -Math.PI * 0.8, -Math.PI * 0.2);
        ctx.stroke();
      }
    }
    // shadow
    ctx.fillStyle = "rgba(0,0,0,.35)";
    this.round(-17, -28, 40, 66, 12);
    // body: three-wheeler — narrow nose, wide cabin
    ctx.fillStyle = C.tempo;
    ctx.beginPath();
    ctx.moveTo(-9, -34);
    ctx.quadraticCurveTo(0, -40, 9, -34);
    ctx.lineTo(19, -12);
    ctx.lineTo(19, 30);
    ctx.quadraticCurveTo(19, 34, 15, 34);
    ctx.lineTo(-15, 34);
    ctx.quadraticCurveTo(-19, 34, -19, 30);
    ctx.lineTo(-19, -12);
    ctx.closePath();
    ctx.fill();
    // windscreen + roof
    ctx.fillStyle = C.glass;
    ctx.beginPath();
    ctx.moveTo(-12, -16);
    ctx.lineTo(12, -16);
    ctx.lineTo(8, -26);
    ctx.lineTo(-8, -26);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = C.cream;
    this.round(-16, -12, 32, 40, 5);
    ctx.fillStyle = C.tempoDark;
    ctx.fillRect(-16, 2, 32, 3);
    // "SAFA" on the roof
    ctx.fillStyle = C.tempo;
    ctx.font = `bold 8px ${this.font}`;
    ctx.textAlign = "center";
    ctx.fillText("SAFA", 0, 17);
    // headlight
    ctx.fillStyle = "#ffe08a";
    ctx.beginPath();
    ctx.arc(0, -35, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  private drawFlags(e: Ent) {
    const ctx = this.ctx;
    const y = e.y;
    const sag = 26;
    ctx.strokeStyle = "rgba(30,20,15,.7)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-10, y);
    ctx.quadraticCurveTo(W / 2, y + sag * 2, W + 10, y);
    ctx.stroke();
    const n = 18;
    for (let i = 1; i < n; i++) {
      const t = i / n;
      const fx = (1 - t) ** 2 * -10 + 2 * t * (1 - t) * (W / 2) + t * t * (W + 10);
      const fy = (1 - t) ** 2 * y + 2 * t * (1 - t) * (y + sag * 2) + t * t * y;
      const flap = Math.sin(e.t * 6 + i) * 2;
      ctx.fillStyle = "rgba(0,0,0,.18)";
      ctx.fillRect(fx - 6 + 6, fy + 10, 12, 14);
      ctx.fillStyle = FLAG[(i + e.hue) % 5];
      ctx.fillRect(fx - 6 + flap, fy, 12, 14);
    }
  }

  private say(text: string, x: number, y: number) {
    const ctx = this.ctx;
    ctx.font = `bold 11px ${this.font}`;
    ctx.textAlign = "center";
    ctx.fillStyle = "#fff6d8";
    ctx.fillText(text, x, y);
  }

  private round(x: number, y: number, w: number, h: number, r: number) {
    const ctx = this.ctx;
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, r);
    ctx.fill();
  }
}
