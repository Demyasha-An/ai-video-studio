/* video-reference-library · движок живых демо (часть 1)
   Каждый демо — чистая функция времени: строит DOM один раз, потом обновляет стили.
   © video-studio, MIT. Реплики референсов: opus/rendercomp/rve (MIT). */
"use strict";

const DEMOS = {};
const LOOP = {};

/* ---------- helpers ---------- */
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const seg = (t, a, b) => clamp((t - a) / (b - a));
const E = {
  out: (x) => 1 - Math.pow(1 - x, 3),
  in: (x) => x * x * x,
  io: (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2),
  back: (x) => { const c = 1.70158; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); },
};
// пружина с перелётом
const spr = (x) => (x <= 0 ? 0 : 1 - Math.exp(-5.5 * x) * Math.cos(11 * x) - Math.exp(-5.5 * x) * 0.25 * Math.sin(11 * x));
// детерминированный псевдорандом
const rnd = (i) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

function el(tag, style, text) {
  const n = document.createElement(tag);
  Object.assign(n.style, style);
  if (text != null) n.textContent = text;
  return n;
}
function once(s, fn) { if (!s._st) { s.innerHTML = ""; s._st = fn(s); } return s._st; }
function bg(s, g) { s.style.background = g; }
const BG = "linear-gradient(180deg,#15223D 0%,#070C18 100%)";
const AMBER = "#FFB020", TEAL = "#2DD4BF", WHITE = "#FFFFFF", MUTED = "#B7C2D4";
const FONT = "Arial, sans-serif";
const px = (v) => `${v}px`;

// типичная сцена: центрирование
const center = (s) => { s.style.display = "flex"; s.style.alignItems = "center"; s.style.justifyContent = "center"; };

function D(id, loop, fn) { DEMOS[id] = fn; LOOP[id] = loop; }

/* титры: большая строка */
function bigLine(text, size, color, extra = {}) {
  return el("div", { fontFamily: FONT, fontWeight: 900, fontSize: px(size), color, letterSpacing: "2px", ...extra }, text);
}

/* =======================================================================
   TITLES — анимированные заголовки
======================================================================= */
D("RCE-TITL-001", 4, (s, t) => { // bounce-in headline
  center(s); bg(s, BG);
  const st = once(s, () => ({
    a: bigLine("ПРОДАЖИ", 64, WHITE, { position: "absolute", top: "240px" }),
    b: bigLine("РОСТ ×2", 78, AMBER, { position: "absolute", top: "330px" }),
  }));
  st.a.style.transform = `scale(${spr(seg(t, 0.2, 0.9))})`;
  st.b.style.transform = `scale(${spr(seg(t, 0.7, 1.4))})`;
  st.a.style.opacity = st.b.style.opacity = seg(t, 0.2, 0.35);
  st.s = s;
});

D("RCE-TITL-002", 4, (s, t) => { // gradient text sweep
  center(s); bg(s, BG);
  const st = once(s, () => ({ a: bigLine("PREMIUM", 72, WHITE, { position: "absolute", top: "290px" }) }));
  const sweep = (t % 4) / 4;
  st.a.style.background = `linear-gradient(110deg, #FFFFFF ${sweep * 200 - 60}%, ${AMBER} ${sweep * 200}%, #FFFFFF ${sweep * 200 + 60}%)`;
  st.a.style.webkitBackgroundClip = "text"; st.a.style.backgroundClip = "text"; st.a.style.color = "transparent";
  st.a.style.transform = `scale(${spr(seg(t, 0.1, 0.8))})`;
});

D("RCE-TITL-003", 4, (s, t) => { // text mask reveal (градиент внутри букв, влет слева)
  center(s); bg(s, BG);
  const st = once(s, () => {
    const a = bigLine("ГОРОД", 96, "transparent", {
      position: "absolute", top: "275px", left: 0, right: 0, textAlign: "center",
      background: "linear-gradient(120deg,#FFB020,#FF5E62,#FFB020)",
      webkitBackgroundClip: "text", backgroundClip: "text",
    });
    s.appendChild(a); return { a };
  });
  const p = E.out(seg(t, 0.2, 1.8));
  st.a.style.clipPath = `inset(0 ${100 - p * 100}% 0 0)`;
});

D("RCE-TITL-004", 4, (s, t) => { // chapter title
  center(s); bg(s, BG);
  const st = once(s, () => {
    const wrap = el("div", { textAlign: "center" });
    wrap.appendChild(el("div", { fontFamily: FONT, fontWeight: 700, fontSize: "22px", letterSpacing: "6px", color: MUTED }, "ГЛАВА 02"));
    wrap.appendChild(el("div", { height: "2px", width: "120px", margin: "14px auto", background: AMBER }));
    wrap.appendChild(bigLine("ПОДГОТОВКА", 52, WHITE));
    return { wrap, line: wrap.children[1] };
  });
  const p = spr(seg(t, 0.2, 1.0));
  st.wrap.style.opacity = p; st.wrap.style.transform = `translateY(${(1 - p) * 30}px)`;
  st.line.style.width = px(E.out(seg(t, 0.5, 1.4)) * 120);
});

D("RVE-TITL-001", 4, (s, t) => { // title split
  center(s); bg(s, BG);
  const st = once(s, () => ({
    a: bigLine("ТОРГИ", 70, WHITE, { position: "absolute", top: "270px", left: "0", right: "0", textAlign: "center" }),
    b: bigLine("ПО БАНКРОТСТВУ", 46, TEAL, { position: "absolute", top: "350px", left: "0", right: "0", textAlign: "center" }),
  }));
  const p = E.out(seg(t, 0.2, 1.2));
  st.a.style.transform = `translateY(${(1 - p) * -60}px)`; st.a.style.opacity = p;
  st.b.style.transform = `translateY(${(1 - p) * 60}px)`; st.b.style.opacity = seg(t, 0.6, 1.4);
});

D("RVE-TITL-002", 4, (s, t) => { // cinematic title intro
  bg(s, "#000");
  const st = once(s, () => ({
    top: el("div", { position: "absolute", left: 0, right: 0, top: 0, height: "90px", background: "#000", zIndex: 3 }),
    bot: el("div", { position: "absolute", left: 0, right: 0, bottom: 0, height: "90px", background: "#000", zIndex: 3 }),
    t: bigLine("КИНОФОНД", 58, WHITE, { position: "absolute", top: "290px", left: 0, right: 0, textAlign: "center", letterSpacing: "8px" }),
  }));
  const open = E.io(seg(t, 0.2, 1.2));
  st.top.style.height = px(320 - open * 230); st.bot.style.height = px(320 - open * 230);
  st.t.style.opacity = seg(t, 1.0, 2.2) * (1 - seg(t, 3.4, 3.9));
  st.t.style.letterSpacing = px(8 + (1 - E.out(seg(t, 1.0, 3.0))) * 26);
});

D("OML-TITL-001", 4, (s, t) => { // blur-in title
  center(s); bg(s, BG);
  const st = once(s, () => ({ a: bigLine("ОЦЕНКА", 80, WHITE, { position: "absolute", top: "280px", left: 0, right: 0, textAlign: "center" }) }));
  const p = E.out(seg(t, 0.3, 1.6));
  st.a.style.filter = `blur(${(1 - p) * 22}px)`; st.a.style.opacity = clamp(p * 1.5);
  st.a.style.transform = `scale(${0.92 + p * 0.08})`;
});

/* =======================================================================
   KINE — кинетическая типографика
======================================================================= */
D("RCE-KINE-001", 4, (s, t) => { // kinetic word stack
  center(s); bg(s, BG);
  const words = ["КУПИТЬ", "ДЕШЕВЛЕ", "МОЖНО", "НА ТОРГАХ"];
  const st = once(s, () => ({ w: words.map((w, i) => bigLine(w, 56, i === 3 ? AMBER : WHITE, { position: "absolute", top: px(210 + i * 62), left: "0", right: "0", textAlign: "center" })) }));
  st.w.forEach((n, i) => {
    const p = spr(seg(t, 0.2 + i * 0.45, 0.8 + i * 0.45));
    n.style.transform = `translateX(${(1 - p) * 140}px)`; n.style.opacity = clamp(p * 2);
  });
});

D("RCE-KINE-002", 4, (s, t) => { // scramble text
  center(s); bg(s, BG);
  const target = "БАНКРОТСТВО";
  const chars = "#$%&@?!*+=<>";
  const st = once(s, () => ({ a: bigLine("", 54, TEAL, { position: "absolute", top: "300px", left: 0, right: 0, textAlign: "center" }) }));
  const reveal = Math.floor(E.out(seg(t, 0.3, 2.4)) * target.length);
  let out = target.slice(0, reveal);
  for (let i = reveal; i < target.length; i++) out += chars[Math.floor(rnd(i + Math.floor(t * 18)) * chars.length)];
  st.a.textContent = out;
});

D("RCE-KINE-003", 4, (s, t) => { // wave text
  center(s); bg(s, BG);
  const word = "ВОЛНА";
  const st = once(s, () => ({ l: [...word].map((ch) => bigLine(ch, 84, WHITE, { display: "inline-block", margin: "0 4px" })) }));
  const row = once(s, () => { const r = el("div", { display: "flex" }); st.l.forEach((n) => r.appendChild(n)); s.appendChild(r); return r; });
  st.l.forEach((n, i) => { n.style.transform = `translateY(${Math.sin(t * 6 - i * 0.7) * 18}px)`; });
});

D("RCE-KINE-004", 4, (s, t) => { // typewriter
  center(s); bg(s, BG);
  const text = "Суд продаёт имущество должника...";
  const st = once(s, () => ({ a: el("div", { fontFamily: FONT, fontSize: "34px", color: WHITE, position: "absolute", top: "280px", left: "40px", right: "40px", whiteSpace: "pre-wrap" }) }));
  const caret = once(s, () => { const c = el("span", { color: AMBER, fontWeight: 900 }, "▌"); st.a.appendChild(c); return c; });
  const n = Math.floor(seg(t, 0.4, 2.6) * text.length);
  st.a.firstChild && st.a.removeChild(st.a.firstChild);
  st.a.insertBefore(document.createTextNode(text.slice(0, n)), caret);
});

D("RVE-KINE-001", 4, (s, t) => { // popping text
  center(s); bg(s, BG);
  const words = ["ЭТАП", "ПЕРВЫЙ:", "АУКЦИОН"];
  const st = once(s, () => ({ w: words.map((w) => bigLine(w, 60, WHITE, { display: "inline-block", margin: "0 10px" })) }));
  const row = once(s, () => { const r = el("div", { display: "flex" }); st.w.forEach((n) => r.appendChild(n)); s.appendChild(r); return r; });
  st.w.forEach((n, i) => {
    const p = spr(seg(t, 0.3 + i * 0.5, 0.9 + i * 0.5));
    n.style.transform = `scale(${p})`; n.style.color = i === 2 ? AMBER : WHITE;
  });
});

D("RVE-KINE-002", 4, (s, t) => { // bubble pop text
  center(s); bg(s, BG);
  const word = "ЖИРАФЫ";
  const st = once(s, () => ({ l: [...word].map((ch, i) => {
    const n = bigLine(ch, 70, i % 2 ? TEAL : WHITE, { display: "inline-block", margin: "0 3px" });
    return n;
  }) }));
  const row = once(s, () => { const r = el("div", { display: "flex", alignItems: "flex-end", height: "120px" }); st.l.forEach((n) => r.appendChild(n)); s.appendChild(r); return r; });
  st.l.forEach((n, i) => {
    const p = spr(seg(t, 0.25 + i * 0.22, 0.85 + i * 0.22));
    n.style.transform = `scale(${p}) translateY(${(1 - p) * 30}px)`; n.style.opacity = clamp(p * 3);
  });
});

D("OML-KINE-001", 4, (s, t) => { // blob to wordmark
  center(s); bg(s, BG);
  const st = once(s, () => ({
    blob: el("div", { position: "absolute", width: "130px", height: "130px", borderRadius: "46% 54% 60% 40%/50% 45% 55% 50%", background: AMBER, filter: "blur(1px)" }),
    word: bigLine("ОПУС", 76, WHITE, { position: "absolute", opacity: 0 }),
  }));
  const p = E.io(seg(t, 0.4, 1.8));
  const scale = 1.6 - p * 0.9;
  st.blob.style.transform = `scale(${scale}) rotate(${p * 90}deg)`;
  st.blob.style.opacity = 1 - clamp(p * 1.6);
  st.word.style.opacity = clamp((p - 0.55) * 2.6);
  st.word.style.transform = `scale(${0.9 + clamp((p - 0.55) * 2) * 0.1})`;
});

/* =======================================================================
   CAPT — субтитры
======================================================================= */
D("RVE-CAPT-001", 4, (s, t) => { // typewriter subtitle
  bg(s, BG);
  const text = "Квартира за полцены — реально";
  const st = once(s, () => ({ a: el("div", { position: "absolute", bottom: "120px", left: "30px", right: "30px", fontFamily: FONT, fontWeight: 800, fontSize: "30px", color: WHITE, textAlign: "center", textShadow: "0 2px 12px #000" }) }));
  st.a.textContent = text.slice(0, Math.floor(seg(t, 0.3, 2.4) * text.length)) + (t % 0.8 < 0.4 ? "▌" : "");
});

D("RVE-CAPT-002", 4, (s, t) => { // lower third
  bg(s, BG);
  const st = once(s, () => {
    const w = el("div", { position: "absolute", bottom: "140px", left: "0", display: "flex", alignItems: "center" });
    const bar = el("div", { width: "8px", height: "74px", background: AMBER });
    const box = el("div", { background: "rgba(255,255,255,0.12)", padding: "12px 22px" });
    box.appendChild(el("div", { fontWeight: 800, fontSize: "26px", color: WHITE }, "Анна Смирнова"));
    box.appendChild(el("div", { fontSize: "17px", color: MUTED }, "арбитражный управляющий"));
    w.appendChild(bar); w.appendChild(box); return { w };
  });
  const p = E.out(seg(t, 0.3, 1.1));
  st.w.style.transform = `translateX(${(1 - p) * -400}px)`;
});

D("RCE-CAPT-001", 4, (s, t) => { // glass lower third
  bg(s, "linear-gradient(180deg,#2A3B5A 0%,#0D1526 100%)");
  const st = once(s, () => {
    const w = el("div", { position: "absolute", bottom: "130px", left: "40px", right: "40px", background: "rgba(255,255,255,0.14)", backdropFilter: "blur(6px)", borderRadius: "18px", padding: "16px 20px" });
    w.appendChild(el("div", { fontWeight: 800, fontSize: "24px", color: WHITE }, "Торги #412"));
    w.appendChild(el("div", { fontSize: "16px", color: MUTED }, "публичное предложение · шаг 3"));
    return { w };
  });
  const p = spr(seg(t, 0.3, 1.2));
  st.w.style.opacity = clamp(p * 2); st.w.style.transform = `translateY(${(1 - p) * 40}px)`;
});

D("VSL-CAPT-001", 4, (s, t) => { // caption bar safe zone
  bg(s, BG);
  const chunks = [[0.3, 2.0, "Квартира за полцены — реально"], [2.2, 3.6, "Это торги по банкротству"]];
  const cur = chunks.find(([a, b]) => t >= a && t < b);
  const st = once(s, () => ({ a: el("div", { position: "absolute", top: "500px", left: "20px", right: "20px", fontFamily: FONT, fontWeight: 800, fontSize: "27px", color: WHITE, textAlign: "center", textShadow: "0 4px 14px #000" }) }));
  if (cur) {
    const [a, b, txt] = cur;
    const loc = t - a, dur = b - a;
    st.a.style.opacity = clamp(seg(loc, 0, 0.12)) * (1 - clamp(seg(loc, dur - 0.12, dur)));
    st.a.textContent = txt;
  } else st.a.style.opacity = 0;
});

/* =======================================================================
   TRAN — переходы
======================================================================= */
function sceneLabels(s, t) { // две «сцены» для демонстрации перехода
  const first = t < 2;
  center(s);
  return first;
}
D("RCE-TRAN-001", 4, (s, t) => { // circle wipe
  bg(s, BG);
  const st = once(s, () => {
    const a = el("div", { position: "absolute", inset: "0", display: "flex", alignItems: "center", justifyContent: "center" });
    a.appendChild(bigLine("СЦЕНА A", 54, WHITE));
    const b = el("div", { position: "absolute", inset: "0", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(180deg,#20304F,#0B1322)" });
    b.appendChild(bigLine("СЦЕНА B", 54, AMBER));
    const mask = el("div", { position: "absolute", inset: "0" });
    b.appendChild(mask); s.appendChild(a); s.appendChild(b);
    return { b, mask };
  });
  const p = seg(t, 1.6, 2.4);
  st.mask.style.clipPath = `circle(${p * 130}% at 50% 50%)`;
  st.mask.style.background = "transparent";
});
D("RCE-TRAN-002", 4, (s, t) => { // slide wipe
  bg(s, BG);
  const st = once(s, () => {
    const a = el("div", { position: "absolute", inset: "0", display: "flex", alignItems: "center", justifyContent: "center" });
    a.appendChild(bigLine("СЦЕНА A", 54, WHITE));
    const b = el("div", { position: "absolute", inset: "0", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(180deg,#20304F,#0B1322)" });
    b.appendChild(bigLine("СЦЕНА B", 54, AMBER));
    s.appendChild(a); s.appendChild(b); return { b };
  });
  st.b.style.transform = `translateX(${(1 - E.io(seg(t, 1.6, 2.4))) * 100}%)`;
});
D("RCE-TRAN-003", 4, (s, t) => { // ink spread
  bg(s, BG);
  const st = once(s, () => {
    const a = el("div", { position: "absolute", inset: "0", display: "flex", alignItems: "center", justifyContent: "center" });
    a.appendChild(bigLine("СЦЕНА A", 54, WHITE));
    const ink = el("div", { position: "absolute", left: "50%", top: "50%", width: "40px", height: "40px", borderRadius: "50%", background: "#05070E", transform: "translate(-50%,-50%)", filter: "blur(6px)" });
    s.appendChild(a); s.appendChild(ink); return { ink };
  });
  const p = E.io(seg(t, 1.6, 2.5));
  st.ink.style.width = st.ink.style.height = px(40 + p * 900);
  const after = t > 2.45;
  st.ink.style.opacity = after ? 0 : 1;
  if (after) { s.firstChild && (s.firstChild.style.opacity = 0); }
});
D("RCE-TRAN-004", 4, (s, t) => { // card flip
  bg(s, BG);
  const st = once(s, () => {
    const card = el("div", { position: "absolute", left: "40px", right: "40px", top: "200px", bottom: "200px", borderRadius: "24px", transformStyle: "preserve-3d" });
    const f = el("div", { position: "absolute", inset: "0", borderRadius: "24px", background: "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center" });
    f.appendChild(bigLine("АВЕРС", 50, WHITE));
    const bk = el("div", { position: "absolute", inset: "0", borderRadius: "24px", background: AMBER, display: "flex", alignItems: "center", justifyContent: "center", transform: "rotateY(180deg)" });
    bk.appendChild(bigLine("РЕВЕРС", 50, "#111"));
    card.appendChild(f); card.appendChild(bk);
    s.style.perspective = "900px"; s.appendChild(card); return { card };
  });
  st.card.style.transform = `rotateY(${E.io(seg(t, 1.5, 2.6)) * 180}deg)`;
});
D("RCE-TRAN-005", 4, (s, t) => { // pixel mosaic
  bg(s, BG);
  const st = once(s, () => {
    const grid = el("div", { position: "absolute", inset: "0", display: "grid", gridTemplateColumns: "repeat(9,1fr)", gridTemplateRows: "repeat(16,1fr)" });
    const cells = [];
    for (let i = 0; i < 144; i++) { const c = el("div", { background: "linear-gradient(180deg,#20304F,#0B1322)" }); grid.appendChild(c); cells.push(c); }
    s.appendChild(grid); return { cells };
  });
  const p = seg(t, 1.5, 2.5);
  st.cells.forEach((c, i) => { const th = rnd(i); c.style.opacity = p > th ? 0 : 1; c.style.background = p > th ? "#070C18" : "linear-gradient(180deg,#20304F,#0B1322)"; });
});
D("RVE-TRAN-001", 4, (s, t) => { // zoom through
  bg(s, BG);
  const st = once(s, () => {
    const scene = el("div", { position: "absolute", inset: "0", display: "flex", alignItems: "center", justifyContent: "center" });
    scene.appendChild(bigLine("ВПЕРЁД", 56, WHITE));
    const ball = el("div", { position: "absolute", left: "50%", top: "50%", width: "36px", height: "36px", marginLeft: "-18px", marginTop: "-18px", borderRadius: "50%", background: AMBER });
    s.appendChild(scene); s.appendChild(ball); return { scene, ball };
  });
  const p = seg(t, 1.7, 2.5);
  const sc = p < 0.5 ? 1 + E.io(p / 0.5) * 7 : 8 - E.io((p - 0.5) / 0.5) * 7;
  st.scene.style.transform = `scale(${sc})`;
  st.scene.style.opacity = p > 0.5 ? seg(p, 0.5, 1) : 1;
  st.ball.style.transform = `scale(${p > 0 ? 1 + Math.sin(p * Math.PI) * 26 : 1})`;
  st.ball.style.opacity = Math.sin(p * Math.PI);
});
D("RVE-TRAN-002", 4, (s, t) => { // clock wipe (conic-сектор раскрывает сцену B)
  bg(s, BG);
  const st = once(s, () => {
    const a = el("div", { position: "absolute", inset: "0", display: "flex", alignItems: "center", justifyContent: "center" });
    a.appendChild(bigLine("СЦЕНА A", 54, WHITE));
    const b = el("div", { position: "absolute", inset: "0", background: "linear-gradient(180deg,#20304F,#0B1322)", display: "flex", alignItems: "center", justifyContent: "center" });
    b.appendChild(bigLine("СЦЕНА B", 54, AMBER));
    const sector = el("div", { position: "absolute", inset: "0" });
    s.appendChild(a); s.appendChild(sector); s.appendChild(b);
    return { sector, b };
  });
  const p = seg(t, 1.6, 2.5);
  st.sector.style.background = `conic-gradient(from 0deg, ${"rgba(0,0,0,0)"} 0deg, ${"rgba(0,0,0,0)"} ${p * 360}deg, #070C18 ${p * 360}deg)`;
  st.b.style.clipPath = `circle(${p * 100}% at 50% 50%)`;
});
D("RVE-TRAN-003", 4, (s, t) => { // cross dissolve
  bg(s, BG);
  const st = once(s, () => {
    const a = el("div", { position: "absolute", inset: "0", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(180deg,#15223D,#070C18)" });
    a.appendChild(bigLine("СЦЕНА A", 54, WHITE));
    const b = el("div", { position: "absolute", inset: "0", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(180deg,#20304F,#0B1322)" });
    b.appendChild(bigLine("СЦЕНА B", 54, AMBER));
    s.appendChild(a); s.appendChild(b); return { b };
  });
  st.b.style.opacity = seg(t, 1.7, 2.5);
});
D("OML-TRAN-001", 4, (s, t) => { // match cut
  bg(s, BG);
  const st = once(s, () => {
    const c1 = el("div", { position: "absolute", left: "50%", top: "50%", width: "120px", height: "120px", marginLeft: "-60px", marginTop: "-60px", borderRadius: "50%", background: TEAL });
    const t1 = bigLine("КРУГ → КРУГ", 34, WHITE, { position: "absolute", bottom: "150px", left: 0, right: 0, textAlign: "center" });
    s.appendChild(c1); s.appendChild(t1); return { c1 };
  });
  const p = E.io(seg(t, 1.7, 2.6));
  st.c1.style.width = st.c1.style.height = px(120 + Math.sin(p * Math.PI) * 260);
  st.c1.style.background = p > 0.5 ? AMBER : TEAL;
});

/* =======================================================================
   PHOT — фотографии (используем CSS-градиенты как «фото»)
======================================================================= */
const PHOTO = "linear-gradient(135deg,#5B6B8C 0%,#8C7A5B 55%,#3E4A63 100%)";
D("RVE-PHOT-001", 4, (s, t) => { // ken burns
  bg(s, "#000");
  const st = once(s, () => {
    const ph = el("div", { position: "absolute", inset: "0", background: PHOTO });
    ph.appendChild(el("div", { position: "absolute", left: "20%", top: "30%", width: "90px", height: "220px", background: "rgba(0,0,0,0.35)", borderRadius: "8px" }));
    s.appendChild(ph); return { ph };
  });
  const z = 1 + t / 4 * 0.25;
  st.ph.style.transform = `scale(${z}) translateX(${t / 4 * -30}px)`;
});
D("RVE-PHOT-002", 4, (s, t) => { // image zoom reveal
  bg(s, "#000");
  const st = once(s, () => ({ ph: el("div", { position: "absolute", left: "30px", right: "30px", top: "170px", bottom: "170px", background: PHOTO, borderRadius: "20px" }) }));
  const p = E.out(seg(t, 0.2, 1.6));
  st.ph.style.transform = `scale(${0.6 + p * 0.4})`; st.ph.style.opacity = p; st.ph.style.filter = `blur(${(1 - p) * 10}px)`;
});
D("RVE-PHOT-003", 4, (s, t) => { // photo stack
  bg(s, BG);
  const st = once(s, () => ({
    ph: [0, 1, 2].map((i) => el("div", { position: "absolute", left: "60px", right: "60px", top: "220px", bottom: "220px", background: i === 2 ? PHOTO : "linear-gradient(135deg,#42506B,#2C364D)", borderRadius: "16px", boxShadow: "0 12px 30px rgba(0,0,0,0.5)" })),
  }));
  st.ph.forEach((n, i) => {
    const p = spr(seg(t, 0.3 + i * 0.7, 1.0 + i * 0.7));
    n.style.transform = `translate(${(2 - i) * (1 - p) * 40}px, ${(2 - i) * (1 - p) * 30}px) rotate(${(i - 1) * (1 - p) * 14 + (i - 1) * 3}deg)`;
    n.style.zIndex = 3 - i;
  });
});
D("RVE-PHOT-004", 4, (s, t) => { // polaroid
  bg(s, BG);
  const st = once(s, () => {
    const card = el("div", { position: "absolute", left: "80px", right: "80px", top: "180px", height: "360px", background: "#fff", borderRadius: "10px", padding: "12px 12px 56px", boxShadow: "0 16px 40px rgba(0,0,0,0.5)" });
    const ph = el("div", { width: "100%", height: "100%", background: PHOTO });
    card.appendChild(ph);
    s.appendChild(card); return { card };
  });
  const p = spr(seg(t, 0.3, 1.2));
  st.card.style.transform = `rotate(${(1 - p) * -16 + -2}deg) translateY(${(1 - p) * 120}px)`; st.card.style.opacity = clamp(p * 2);
});
D("RVE-PHOT-005", 4, (s, t) => { // image carousel
  bg(s, BG);
  const st = once(s, () => {
    const row = el("div", { position: "absolute", top: "230px", left: 0, right: 0, height: "240px", display: "flex", gap: "14px", padding: "0 30px" });
    const imgs = [PHOTO, "linear-gradient(135deg,#6B5B8C,#3E4A63)", "linear-gradient(135deg,#5B8C6B,#3E6349)", "linear-gradient(135deg,#8C5B5B,#634A3E)"].map((g) => el("div", { minWidth: "200px", height: "240px", background: g, borderRadius: "16px" }));
    imgs.forEach((n) => row.appendChild(n)); s.appendChild(row); return { row };
  });
  st.row.style.transform = `translateX(${-(t / 4) * 214}px)`;
});
D("OML-PHOT-001", 4, (s, t) => { // film look
  bg(s, PHOTO);
  const st = once(s, () => ({ grain: el("div", { position: "absolute", inset: 0, opacity: 0.18, background: "repeating-conic-gradient(#000 0% 25%, #fff 0% 50%) 0 0/3px 3px", mixBlendMode: "overlay" }) }));
  st.grain.style.transform = `translate(${rnd(Math.floor(t * 24)) * 4 - 2}px, ${rnd(Math.floor(t * 24) + 9) * 4 - 2}px)`;
  s.style.filter = `saturate(${0.8 + Math.sin(t) * 0.1}) contrast(1.06)`;
});
D("OML-PHOT-002", 4, (s, t) => { // duotone
  bg(s, PHOTO);
  const st = once(s, () => ({ ov: el("div", { position: "absolute", inset: 0, mixBlendMode: "color" }) }));
  const hue = t / 4;
  st.ov.style.background = `linear-gradient(120deg, rgb(${20 + hue * 40}, ${40 + hue * 160}, 90), rgb(10, 20, ${60 + hue * 120}))`;
});

/* =======================================================================
   PARA — параллакс
======================================================================= */
D("RCE-PARA-001", 4, (s, t) => { // parallax pan
  bg(s, "linear-gradient(180deg,#1A2742,#0B1322)");
  const st = once(s, () => ({
    far: el("div", { position: "absolute", inset: 0, background: "radial-gradient(circle 200px at 70% 30%, rgba(255,176,32,0.25), transparent 70%)" }),
    mid: el("div", { position: "absolute", left: "-20%", right: "-20%", top: "55%", height: "45%", background: "linear-gradient(180deg,#233252,#16203A)" }),
    near: el("div", { position: "absolute", left: "-20%", right: "-20%", top: "75%", height: "25%", background: "#0D1424" }),
  }));
  const dx = Math.sin(t / 4 * Math.PI * 2) * 40;
  st.mid.style.transform = `translateX(${dx * 0.5}px)`;
  st.near.style.transform = `translateX(${dx}px)`;
});
D("RVE-PARA-001", 4, (s, t) => { // parallax pan RVE
  bg(s, "linear-gradient(180deg,#1A2742,#0B1322)");
  const st = once(s, () => ({
    l1: el("div", { position: "absolute", left: "-10%", top: "40%", width: "60%", height: "60%", background: "rgba(255,255,255,0.06)", borderRadius: "24px" }),
    l2: el("div", { position: "absolute", left: "30%", top: "50%", width: "55%", height: "55%", background: "rgba(255,255,255,0.10)", borderRadius: "24px" }),
    l3: el("div", { position: "absolute", left: "55%", top: "60%", width: "50%", height: "50%", background: "rgba(255,176,32,0.25)", borderRadius: "24px" }),
  }));
  const dx = E.io(seg(t, 0.4, 3.6)) * -120;
  st.l1.style.transform = `translateX(${dx * 0.3}px)`; st.l2.style.transform = `translateX(${dx * 0.6}px)`; st.l3.style.transform = `translateX(${dx}px)`;
});
D("RVE-PARA-002", 4, (s, t) => { // zoom pulse
  center(s); bg(s, BG);
  const st = once(s, () => ({ a: bigLine("БИТ", 96, WHITE) }));
  const beat = (t % 0.75) / 0.75;
  st.a.style.transform = `scale(${1 + Math.max(0, 1 - beat * 3) * 0.12})`;
  s.style.background = `radial-gradient(circle at 50% 50%, rgba(255,176,32,${0.22 * (1 - beat)}) 0%, #070C18 70%)`;
});
D("OML-PARA-001", 4, (s, t) => { // orbit parallax
  bg(s, "linear-gradient(180deg,#101A2E,#070C18)");
  const st = once(s, () => ({
    ring: el("div", { position: "absolute", left: "50%", top: "50%", width: "300px", height: "300px", margin: "-150px", borderRadius: "50%", border: "2px dashed rgba(255,255,255,0.2)" }),
    dot: el("div", { position: "absolute", left: "50%", top: "50%", width: "34px", height: "34px", marginLeft: "-17px", marginTop: "-17px", borderRadius: "50%", background: AMBER }),
    core: el("div", { position: "absolute", left: "50%", top: "50%", width: "90px", height: "90px", margin: "-45px", borderRadius: "50%", background: "rgba(45,212,191,0.9)" }),
  }));
  const a = t / 4 * Math.PI * 2;
  const rx = 150 * Math.cos(a), ry = 60 * Math.sin(a);
  st.dot.style.transform = `translate(${rx}px, ${ry}px) scale(${1 + ry / 220})`;
});
D("MC-PARA-001", 4, (s, t) => { // smooth parallax (motion canvas ref)
  bg(s, "linear-gradient(180deg,#223354,#0B1322)");
  const st = once(s, () => ({
    sky: el("div", { position: "absolute", inset: 0, background: "radial-gradient(circle 140px at 50% 25%, rgba(255,255,255,0.15), transparent 70%)" }),
    hills: [0.35, 0.55, 0.8].map((o, i) => el("div", { position: "absolute", left: "-30%", right: "-30%", top: px(340 + i * 70), height: "60%", borderRadius: "50% 50% 0 0", background: `rgba(${30 + i * 12},${40 + i * 16},${70 + i * 18},0.9)` })),
  }));
  const dx = Math.sin(t / 4 * Math.PI * 2) * 60;
  st.hills.forEach((n, i) => { n.style.transform = `translateX(${dx * (0.25 + i * 0.3)}px)`; });
});

/* =======================================================================
   STAT — цифры и статистика
======================================================================= */
D("RCE-STAT-001", 4, (s, t) => { // kpi counter
  center(s); bg(s, BG);
  const st = once(s, () => {
    const wrap = el("div", { textAlign: "center" });
    const num = el("div", { fontWeight: 900, fontSize: "110px", color: AMBER, fontVariantNumeric: "tabular-nums" }, "0");
    const lab = el("div", { fontWeight: 800, fontSize: "26px", color: WHITE }, "сделок за месяц");
    wrap.appendChild(num); wrap.appendChild(lab); s.appendChild(wrap); return { num, lab };
  });
  const p = E.out(seg(t, 0.3, 1.8));
  st.num.textContent = Math.round(p * 128).toLocaleString("ru-RU");
  st.lab.style.opacity = seg(t, 1.4, 2.0);
});
D("RCE-STAT-002", 4, (s, t) => { // racing chart
  bg(s, BG);
  const st = once(s, () => ({ bars: [0.9, 0.65, 0.8, 0.5].map((_, i) => {
    const row = el("div", { display: "flex", alignItems: "center", margin: "12px 30px" });
    row.appendChild(el("div", { width: "70px", fontWeight: 700, fontSize: "16px", color: MUTED }, ["Москва", "СПб", "Казань", "Сочи"][i]));
    const track = el("div", { flex: 1, height: "26px", borderRadius: "13px", background: "rgba(255,255,255,0.08)", overflow: "hidden" });
    const bar = el("div", { height: "100%", width: "0%", borderRadius: "13px", background: i === 0 ? AMBER : TEAL });
    track.appendChild(bar); row.appendChild(track); s.appendChild(row); return bar;
  }) }));
  const base = E.out(seg(t, 0.3, 2.8));
  [1.0, 0.55, 0.75, 0.4].forEach((v, i) => {
    st.bars[i].style.width = `${base * v * 100}%`;
  });
});
D("RVE-STAT-001", 4, (s, t) => { // stat counter
  center(s); bg(s, BG);
  const st = once(s, () => {
    const num = el("div", { fontWeight: 900, fontSize: "120px", color: WHITE, fontVariantNumeric: "tabular-nums", textAlign: "center" }, "0 ₽");
    const lab = el("div", { fontWeight: 700, fontSize: "26px", color: MUTED, textAlign: "center", marginTop: "8px" }, "стартовая цена");
    const w = el("div", { textAlign: "center" }); w.appendChild(num); w.appendChild(lab); s.appendChild(w); return { num, lab, w };
  });
  const p = spr(seg(t, 0.3, 1.7));
  st.num.style.transform = `scale(${0.8 + p * 0.2})`;
  st.num.textContent = `${Math.round(p * 4200000).toLocaleString("ru-RU")} ₽`;
  st.lab.style.opacity = seg(t, 1.2, 1.8);
});
D("RVE-STAT-002", 4, (s, t) => { // countdown timer
  center(s); bg(s, BG);
  const st = once(s, () => ({ num: bigLine("3", 130, AMBER) }));
  const left = 3 - Math.floor(t / 4 * 3.2);
  st.num.textContent = Math.max(left, 0) || "СТАРТ";
  st.num.style.transform = `scale(${1 + (1 - (t / 4 * 3.2) % 1) * 0.15})`;
});
D("RVE-STAT-003", 4, (s, t) => { // progress bars
  center(s); bg(s, BG);
  const st = once(s, () => ({ bars: [72, 45, 91].map((v) => {
    const w = el("div", { width: "280px", margin: "14px 0" });
    const lab = el("div", { fontSize: "15px", color: MUTED, marginBottom: "4px" }, `${v}%`);
    const track = el("div", { height: "14px", borderRadius: "7px", background: "rgba(255,255,255,0.1)" });
    const bar = el("div", { height: "100%", width: "0%", borderRadius: "7px", background: `linear-gradient(90deg,${TEAL},${AMBER})` });
    track.appendChild(bar); w.appendChild(lab); w.appendChild(track); s.appendChild(w); return bar;
  }) }));
  st.bars.forEach((b, i) => { b.style.width = `${E.out(seg(t, 0.3 + i * 0.25, 1.6 + i * 0.25)) * [72, 45, 91][i]}%`; });
});
D("OML-STAT-001", 4, (s, t) => { // bar race
  bg(s, BG);
  const st = once(s, () => ({ rows: ["Публичное предложение", "Повторные торги", "Аукцион"].map((n, i) => {
    const row = el("div", { margin: "22px 30px" });
    row.appendChild(el("div", { fontSize: "15px", color: MUTED, marginBottom: "4px" }, n));
    const b = el("div", { height: "30px", borderRadius: "8px", width: "0%", background: [AMBER, TEAL, "#8A93FF"][i] });
    row.appendChild(b); s.appendChild(row); return b;
  }) }));
  const p = E.io(seg(t, 0.3, 3.4));
  const widths = [22, 45, 90].map((v) => v + p * (100 - v) * 0.3);
  st.rows.forEach((b, i) => { b.style.width = `${p * widths[i]}%`; });
});
D("OML-STAT-002", 4, (s, t) => { // big stat slide
  center(s); bg(s, BG);
  const st = once(s, () => ({ a: bigLine("−50%", 150, AMBER), b: el("div", { fontWeight: 700, fontSize: "24px", color: WHITE, marginTop: "10px", textAlign: "center" }, "от рыночной цены") }));
  const w = once(s, () => { const r = el("div", { textAlign: "center" }); r.appendChild(st.a); r.appendChild(st.b); s.appendChild(r); return r; });
  const p = spr(seg(t, 0.3, 1.3));
  w.style.transform = `translateX(${(1 - E.out(seg(t, 0.2, 1.0))) * 200}px)`;
  st.a.style.transform = `scale(${p})`;
});
