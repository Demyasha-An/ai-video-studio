/* video-reference-library · движок живых демо (часть 3 — современные референсы)
   Данные: funnel/sankey/heatmap/treemap/waterfall/radar/gauge/network/gantt/timeline/
   rings/dot-tally/dumbbell/cause-effect/chip-stack/budget + VSL финанс/минимализм
   + карточки reference-only источников. © video-studio, MIT. */
"use strict";

/* ---------- общие для части 3 ---------- */
const GRID = "repeating-linear-gradient(90deg, rgba(255,255,255,0.05) 0 1px, transparent 1px 60px)";
function dataBg(s) { bg(s, `linear-gradient(180deg,#101A2E,#070C18)`); }
function chip(s, x, y, w, h, color, r = 6) {
  const n = el("div", { position: "absolute", left: px(x), top: px(y), width: px(w), height: px(h), background: color, borderRadius: px(r) });
  s.appendChild(n); return n;
}
function num(elx, v, suffix = "") { elx.textContent = Math.round(v).toLocaleString("ru-RU") + suffix; }

/* =======================================================================
   OML data — MIT (код в sources/opus-motion-library/src/motions/data/)
======================================================================= */
D("OML-AINFO-001", 4, (s, t) => { // funnel conversion
  dataBg(s);
  const st = once(s, () => ({ rows: [1.0, 0.72, 0.45, 0.22].map((w, i) => {
    const r = el("div", { position: "absolute", left: px(180 - (180 * w) / 2 * 0.9), width: px(180 * w * 0.9), top: px(160 + i * 80), height: "56px", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "17px", color: i === 3 ? "#111" : WHITE });
    r.style.background = [TEAL, "#5A8DEE", "#8A93FF", AMBER][i];
    s.appendChild(r); return r;
  }) }));
  const labels = ["Заявка", "Осмотр", "Задаток", "Выигрыш"];
  st.rows.forEach((r, i) => {
    const p = spr(seg(t, 0.25 + i * 0.45, 0.85 + i * 0.45));
    r.style.opacity = clamp(p * 2); r.style.transform = `scaleX(${p})`;
    r.textContent = p > 0.6 ? `${labels[i]} · ${[100, 72, 45, 22][i]}%` : "";
  });
});
D("OML-DATAV-001", 4, (s, t) => { // sankey flow
  dataBg(s);
  const st = once(s, () => {
    const svg = elNS("svg", { position: "absolute", inset: 0, width: "360px", height: "640px", viewBox: "0 0 360 640" });
    s.appendChild(svg); return { svg };
  });
  const bands = [[60, 90, 180, 140], [60, 150, 180, 300], [60, 210, 180, 420]];
  bands.forEach(([x1, y1, x2, y2], i) => {
    const p = E.io(seg(t, 0.3 + i * 0.35, 1.4 + i * 0.35));
    const path = elNS("path", { fill: ["rgba(255,176,32,0.4)", "rgba(45,212,191,0.4)", "rgba(138,147,255,0.4)"][i], stroke: "none" });
    const c = p * 1.0;
    path.setAttribute("d", `M ${x1} ${y1} C ${(x1 + x2) / 2} ${y1}, ${(x1 + x2) / 2} ${y2}, ${x2} ${y2} L ${x2} ${y2 + 46} C ${(x1 + x2) / 2} ${y2 + 46}, ${(x1 + x2) / 2} ${y1 + 46}, ${x1} ${y1 + 46} Z`);
    path.style.opacity = clamp(p * 2);
    st.svg.appendChild(path);
  });
  const p2 = seg(t, 2.2, 3.0);
  [[180, 130, "Продажи"], [180, 290, "Аренда"], [180, 410, "Прочее"]].forEach(([x, y, txt]) => {
    const lab = once(s, () => { const w = el("div", { position: "absolute", fontWeight: 700, fontSize: "15px", color: WHITE, opacity: 0 }); s.appendChild(w); return w; });
    lab.style.left = px(x + 10); lab.style.top = px(y); lab.textContent = txt; lab.style.opacity = p2;
  });
});
D("OML-DATAV-002", 4, (s, t) => { // heatmap calendar
  dataBg(s);
  const st = once(s, () => {
    const g = el("div", { position: "absolute", left: "40px", top: "180px", right: "40px", display: "grid", gridTemplateColumns: "repeat(12,1fr)", gap: "5px" });
    const cells = Array.from({ length: 12 * 7 }, (_, i) => { const c = el("div", { width: "100%", aspectRatio: "1", borderRadius: "3px", background: "rgba(255,255,255,0.06)" }); g.appendChild(c); return c; });
    s.appendChild(g); return { cells };
  });
  st.cells.forEach((c, i) => {
    const v = rnd(i);
    const p = E.out(seg(t, 0.2 + (i % 12) * 0.06, 0.7 + (i % 12) * 0.06));
    c.style.background = `rgba(${45 + v * 40}, ${180 + v * 40}, ${140}, ${p * (0.25 + v * 0.75)})`;
  });
});
D("OML-DATAV-003", 4, (s, t) => { // treemap split
  dataBg(s);
  const st = once(s, () => {
    const w = el("div", { position: "absolute", left: "36px", right: "36px", top: "200px", bottom: "200px", display: "flex", gap: "6px" });
    const colA = el("div", { flex: 3, display: "flex", flexDirection: "column", gap: "6px" });
    const colB = el("div", { flex: 2, display: "flex", flexDirection: "column", gap: "6px" });
    const a1 = el("div", { flex: 2, background: AMBER, borderRadius: "8px" });
    const a2 = el("div", { flex: 1, background: "rgba(255,176,32,0.5)", borderRadius: "8px" });
    const b1 = el("div", { flex: 1, background: TEAL, borderRadius: "8px" });
    const b2 = el("div", { flex: 2, background: "rgba(45,212,191,0.45)", borderRadius: "8px" });
    colA.appendChild(a1); colA.appendChild(a2); colB.appendChild(b1); colB.appendChild(b2);
    w.appendChild(colA); w.appendChild(colB); s.appendChild(w);
    return { a: [a1, a2, b1, b2] };
  });
  st.a.forEach((n, i) => {
    const p = spr(seg(t, 0.25 + i * 0.3, 0.95 + i * 0.3));
    n.style.transform = `scale(${0.6 + p * 0.4})`; n.style.opacity = clamp(p * 2);
  });
});
D("OML-FINAN-001", 4, (s, t) => { // waterfall bridge
  dataBg(s);
  const st = once(s, () => ({ bars: [[40, 90, TEAL], [115, 70, "#FF7A7A"], [190, 40, TEAL], [265, 110, AMBER]].map(([x, h, c]) => chip(s, x, 430 - h, 55, h, c, 8)) }));
  const vals = [[0, 90], [1, 70], [2, 40], [3, 110]];
  st.bars.forEach((b, i) => {
    const p = spr(seg(t, 0.3 + i * 0.5, 0.9 + i * 0.5));
    const [, h] = vals[i];
    b.style.height = px(h * p); b.style.top = px(430 - h * p);
  });
  const lab = once(s, () => { const l = el("div", { position: "absolute", left: 0, right: 0, top: "150px", textAlign: "center", fontWeight: 900, fontSize: "26px", color: WHITE, opacity: 0 }, "Цена → скидка → сборы → итог"); s.appendChild(l); return l; });
  lab.style.opacity = seg(t, 2.4, 3.0);
});
D("OML-DATAV-004", 4, (s, t) => { // radar compare
  dataBg(s);
  const st = once(s, () => {
    const svg = elNS("svg", { position: "absolute", left: "50%", top: "50%", width: "320px", height: "320px", transform: "translate(-50%,-50%)", viewBox: "0 0 320 320" });
    s.appendChild(svg); return { svg };
  });
  const cx = 160, cy = 160, R = 110;
  for (let k = 1; k <= 4; k++) {
    const ring = elNS("polygon", { fill: "none", stroke: "rgba(255,255,255,0.12)", strokeWidth: 1 });
    ring.setAttribute("points", [0, 1, 2, 3, 4, 5].map((i) => { const a = (i / 6) * Math.PI * 2 - Math.PI / 2; return `${cx + Math.cos(a) * R * k / 4},${cy + Math.sin(a) * R * k / 4}`; }).join(" "));
    st.svg.appendChild(ring);
  }
  const poly = (vals, color, phase) => {
    const p = E.out(seg(t, phase, phase + 1.2));
    const pts = vals.map((v, i) => { const a = (i / vals.length) * Math.PI * 2 - Math.PI / 2; return `${cx + Math.cos(a) * R * v * p},${cy + Math.sin(a) * R * v * p}`; }).join(" ");
    const n = elNS("polygon", { fill: color.replace("1)", `${0.25})`), stroke: color.replace("1)", "1)"), strokeWidth: 3 });
    n.setAttribute("points", pts); st.svg.appendChild(n);
  };
  poly([0.9, 0.6, 0.75, 0.5, 0.8, 0.65], "rgba(255,176,32,1)", 0.4);
  poly([0.6, 0.8, 0.5, 0.85, 0.55, 0.7], "rgba(45,212,191,1)", 1.0);
});
D("OML-FINAN-002", 4, (s, t) => { // gauge kpi dial
  center(s); dataBg(s);
  const st = once(s, () => {
    const g = el("div", { position: "relative", width: "260px", height: "150px", overflow: "hidden" });
    const arc = el("div", { width: "220px", height: "220px", borderRadius: "50%", border: "22px solid rgba(255,255,255,0.09)", position: "absolute", left: "20px", top: "0", clipPath: "inset(0 0 50% 0)" });
    const fill = el("div", { width: "220px", height: "220px", borderRadius: "50%", border: "22px solid transparent", borderTopColor: AMBER, borderRightColor: AMBER, position: "absolute", left: "20px", top: "0", clipPath: "inset(0 0 50% 0)", transform: "rotate(0deg)" });
    const val = el("div", { position: "absolute", left: 0, right: 0, bottom: "8px", textAlign: "center", fontWeight: 900, fontSize: "52px", color: WHITE }, "0%");
    g.appendChild(arc); g.appendChild(fill); g.appendChild(val); s.appendChild(g);
    return { fill, val };
  });
  const p = E.out(seg(t, 0.3, 1.9));
  st.fill.style.transform = `rotate(${p * 126}deg)`;
  num(st.val, p * 68, "%");
});
D("OML-DATAV-005", 4, (s, t) => { // network graph
  dataBg(s);
  const st = once(s, () => {
    const svg = elNS("svg", { position: "absolute", inset: 0, width: "360px", height: "640px", viewBox: "0 0 360 640" });
    const nodes = [[180, 300], [90, 200], [280, 210], [70, 400], [290, 390], [180, 140]];
    const edges = [[0, 1], [0, 2], [0, 3], [0, 4], [0, 5], [1, 2]];
    const lines = edges.map(([a, b]) => { const l = elNS("line", { stroke: "rgba(255,255,255,0.25)", strokeWidth: 2 }); svg.appendChild(l); return l; });
    const dots = nodes.map(([x, y], i) => { const d = elNS("circle", { fill: i === 0 ? AMBER : TEAL, cx: x, cy: y, r: i === 0 ? 16 : 9 }); svg.appendChild(d); return d; });
    s.appendChild(svg); return { lines, dots, nodes, edges };
  });
  const p = E.out(seg(t, 0.3, 1.8));
  st.lines.forEach((l, i) => {
    const [a, b] = st.edges[i], A = st.nodes[a], B = st.nodes[b];
    l.setAttribute("x1", A[0]); l.setAttribute("y1", A[1]);
    l.setAttribute("x2", A[0] + (B[0] - A[0]) * p); l.setAttribute("y2", A[1] + (B[1] - A[1]) * p);
    l.style.opacity = p;
  });
  st.dots.forEach((d, i) => {
    const dp = spr(seg(t, 0.5 + i * 0.25, 1.0 + i * 0.25));
    d.setAttribute("r", (i === 0 ? 16 : 9) * dp);
  });
});
D("OML-AINFO-002", 4, (s, t) => { // gantt timeline
  dataBg(s);
  const st = once(s, () => ({ rows: [[0.0, 0.35, "Оценка"], [0.25, 0.55, "Задаток"], [0.5, 0.8, "Торги"], [0.75, 1.0, "Оформление"]].map(([a, b, lab], i) => {
    const r = el("div", { position: "absolute", left: px(50 + a * 270), width: px((b - a) * 270), top: px(190 + i * 66), height: "34px", borderRadius: "8px", background: [TEAL, "#5A8DEE", AMBER, "#8A93FF"][i], display: "flex", alignItems: "center", paddingLeft: "10px", fontWeight: 700, fontSize: "14px", color: i === 2 ? "#111" : WHITE });
    s.appendChild(r); return r;
  }) }));
  const names = ["Оценка", "Задаток", "Торги", "Оформление"];
  st.rows.forEach((r, i) => {
    const p = E.out(seg(t, 0.3 + i * 0.4, 1.1 + i * 0.4));
    r.style.transformOrigin = "left"; r.style.transform = `scaleX(${p})`;
    r.textContent = p > 0.5 ? names[i] : "";
  });
});
D("OML-EDITO-001", 4, (s, t) => { // timeline ruler with events
  dataBg(s);
  const st = once(s, () => {
    const line = chip(s, 30, 330, 300, 3, "rgba(255,255,255,0.25)", 2);
    const events = [[0.08, "2019", "объект в залоге"], [0.38, "2024", "банкротство"], [0.68, "2025", "публичное предложение"]].map(([x, year, txt], i) => {
      const dot = chip(s, 30 + x * 300 - 7, 325, 14, 14, AMBER, "50%");
      const card = el("div", { position: "absolute", left: px(30 + x * 300 - 55), top: px(i % 2 ? 360 : 240), width: "130px", background: "rgba(255,255,255,0.08)", borderRadius: "10px", padding: "8px 10px", opacity: 0 });
      card.appendChild(el("div", { fontWeight: 900, fontSize: "18px", color: AMBER }, year));
      card.appendChild(el("div", { fontSize: "13px", color: WHITE }, txt));
      s.appendChild(card); return { dot, card };
    });
    return { line, events };
  });
  const lp = E.out(seg(t, 0.2, 0.8));
  st.line.style.width = px(lp * 300);
  st.events.forEach((e, i) => {
    const p = spr(seg(t, 0.5 + i * 0.7, 1.1 + i * 0.7));
    e.card.style.opacity = clamp(p * 2); e.card.style.transform = `translateY(${(1 - p) * 24}px)`;
    e.dot.style.transform = `scale(${p})`;
  });
});
D("OML-AINFO-003", 4, (s, t) => { // progress rings stats
  center(s); dataBg(s);
  const st = once(s, () => ({ rings: [[62, "финансы", 0], [45, "юристы", 1], [88, "объекты", 2]].map(([v, lab, i]) => {
    const d = el("div", { width: "130px", height: "130px", borderRadius: "50%", background: `conic-gradient(${[AMBER, TEAL, "#8A93FF"][i]} 0deg, rgba(255,255,255,0.08) 0deg)`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 -14px" });
    const hole = el("div", { width: "96px", height: "96px", borderRadius: "50%", background: "#0A1120", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" });
    const numEl = el("div", { fontWeight: 900, fontSize: "26px", color: WHITE }, "0%");
    hole.appendChild(numEl); hole.appendChild(el("div", { fontSize: "11px", color: MUTED }, lab));
    d.appendChild(hole); s.appendChild(d); return { d, numEl, v };
  }) }));
  st.rings.forEach((r, i) => {
    const p = E.out(seg(t, 0.3 + i * 0.3, 1.7 + i * 0.3));
    r.d.style.background = `conic-gradient(${[AMBER, TEAL, "#8A93FF"][i]} ${p * 3.6 * r.v}deg, rgba(255,255,255,0.08) 0deg)`;
    num(r.numEl, p * r.v, "%");
  });
});
D("OML-DATAV-006", 4, (s, t) => { // dot tally
  dataBg(s);
  const st = once(s, () => {
    const g = el("div", { position: "absolute", left: "56px", right: "56px", top: "230px", display: "grid", gridTemplateColumns: "repeat(10,1fr)", gap: "8px" });
    const dots = Array.from({ length: 50 }, (_, i) => { const d = el("div", { width: "100%", aspectRatio: "1", borderRadius: "50%", background: "rgba(255,255,255,0.15)" }); g.appendChild(d); return d; });
    s.appendChild(g); return { dots };
  });
  st.dots.forEach((d, i) => {
    const p = seg(t, 0.4 + rnd(i) * 1.6, 0.9 + rnd(i) * 1.8);
    if (i < 17) d.style.background = `rgba(255,176,32,${p})`;
  });
  const lab = once(s, () => { const l = el("div", { position: "absolute", left: 0, right: 0, top: "470px", textAlign: "center", fontWeight: 800, fontSize: "24px", color: WHITE, opacity: 0 }, "17 из 50 — с торгов дешевле"); s.appendChild(l); return l; });
  lab.style.opacity = seg(t, 2.2, 2.8);
});
D("OML-FINAN-003", 4, (s, t) => { // comparison dumbbell
  dataBg(s);
  const st = once(s, () => {
    const rows = [["2019", 0.25, 0.8], ["2022", 0.35, 0.65], ["2025", 0.3, 0.55]].map(([y, a, b], i) => {
      const track = chip(s, 60, 220 + i * 90, 240, 3, "rgba(255,255,255,0.2)", 2);
      const d1 = chip(s, 0, 214 + i * 90, 16, 16, TEAL, "50%");
      const d2 = chip(s, 0, 214 + i * 90, 16, 16, AMBER, "50%");
      const lab = el("div", { position: "absolute", left: "20px", top: px(210 + i * 90), fontWeight: 800, fontSize: "16px", color: MUTED }, y);
      s.appendChild(d1); s.appendChild(d2); s.appendChild(lab);
      return { d1, d2, a, b };
    });
    return { rows };
  });
  st.rows.forEach((r, i) => {
    const p = E.out(seg(t, 0.4 + i * 0.4, 1.2 + i * 0.4));
    r.d1.style.left = px(60 + r.a * 240 * p - 8);
    r.d2.style.left = px(60 + r.b * 240 * p - 8);
  });
});
D("OML-EXPLA-001", 4, (s, t) => { // cause effect chain
  center(s); dataBg(s);
  const st = once(s, () => ({ blocks: ["Долг", "Суд", "Торги", "Скидка"].map((txt, i) => {
    const b = el("div", { padding: "12px 20px", borderRadius: "12px", background: "rgba(255,255,255,0.1)", border: "2px solid rgba(255,255,255,0.15)", fontWeight: 800, fontSize: "20px", color: WHITE, display: "inline-block", margin: "0 6px", opacity: 0 }, txt);
    const row = once(s, () => { const r = el("div", { display: "flex", alignItems: "center" }); s.appendChild(r); return r; });
    row.appendChild(b);
    if (i < 3) row.appendChild(el("div", { color: AMBER, fontSize: "22px", fontWeight: 900, opacity: 0.6 }, "→"));
    return b;
  }) }));
  st.blocks.forEach((b, i) => {
    const p = spr(seg(t, 0.35 + i * 0.6, 0.95 + i * 0.6));
    b.style.opacity = clamp(p * 2); b.style.transform = `scale(${0.7 + p * 0.3})`;
  });
});
D("OML-FINAN-004", 4, (s, t) => { // chip stack bars
  dataBg(s);
  const st = once(s, () => ({ cols: [0.9, 0.55, 0.75].map((v, ci) => {
    const chips = [];
    for (let k = 0; k < 8; k++) {
      const c = chip(s, 70 + ci * 90, 420 - k * 26, 56, 20, k === 7 ? AMBER : "rgba(90,141,238,0.85)", 4);
      chips.push(c);
    }
    return { chips, v };
  }) }));
  st.cols.forEach(({ chips, v }, ci) => {
    const visible = Math.round(E.out(seg(t, 0.3 + ci * 0.45, 1.7 + ci * 0.45)) * 8 * v);
    chips.forEach((c, k) => { c.style.opacity = k < visible ? 1 : 0.12; });
  });
});
D("OML-FINAN-005", 4, (s, t) => { // budget envelope split
  center(s); dataBg(s);
  const st = once(s, () => ({ env: el("div", { width: "250px", height: "160px", background: "rgba(255,255,255,0.1)", border: "2px solid rgba(255,255,255,0.2)", borderRadius: "14px", position: "relative", overflow: "hidden" }) }));
  const parts = once(s, () => {
    const cols = [[0.5, AMBER, "Кредиты 50%"], [0.3, TEAL, "ЖКХ 30%"], [0.2, "#8A93FF", "Прочее 20%"]];
    const w = el("div", { position: "absolute", inset: "0", display: "flex" });
    cols.forEach(([f, c, lab], i) => {
      const p = el("div", { width: `${f * 100}%`, background: c, display: "flex", alignItems: "flex-end", justifyContent: "center", fontSize: "12px", fontWeight: 800, color: i === 0 ? "#111" : WHITE, paddingBottom: "8px", transform: `scaleY(0)`, transformOrigin: "bottom" }, lab);
      w.appendChild(p); return p;
    });
    st.env.appendChild(w); return { w, cols: [...w.children] };
  });
  const p = E.out(seg(t, 0.4, 1.6));
  parts.cols.forEach((c) => { c.style.transform = `scaleY(${p})`; });
});

/* =======================================================================
   VSL оригиналы — современные тестовые референсы (MIT)
======================================================================= */
D("VSL-FINAN-001", 4, (s, t) => { // price compare bars
  dataBg(s);
  const st = once(s, () => ({
    r1: { track: chip(s, 40, 260, 280, 44, "rgba(255,255,255,0.08)", 10), bar: chip(s, 40, 260, 0, 44, "#5A6B8C", 10), lab: el("div", { position: "absolute", left: "52px", top: px(228), fontSize: "15px", color: MUTED, fontWeight: 700 }, "Рыночная цена") },
    r2: { track: chip(s, 40, 360, 280, 44, "rgba(255,255,255,0.08)", 10), bar: chip(s, 40, 360, 0, 44, AMBER, 10), lab: el("div", { position: "absolute", left: "52px", top: px(328), fontSize: "15px", color: MUTED, fontWeight: 700 }, "На торгах") },
    v1: el("div", { position: "absolute", right: "52px", top: px(268), fontWeight: 900, fontSize: "24px", color: WHITE }, ""),
    v2: el("div", { position: "absolute", right: "52px", top: px(368), fontWeight: 900, fontSize: "24px", color: "#111", opacity: 0 }, ""),
    delta: el("div", { position: "absolute", left: 0, right: 0, top: px(470), textAlign: "center", fontWeight: 900, fontSize: "44px", color: AMBER, opacity: 0 }, "−35%"),
  }));
  [st.r1.lab, st.r2.lab, st.v1, st.v2, st.delta].forEach((n) => s.appendChild(n));
  const p1 = E.out(seg(t, 0.3, 1.4)), p2 = E.out(seg(t, 0.8, 1.9));
  st.r1.bar.style.width = px(p1 * 280);
  st.r2.bar.style.width = px(p2 * 280 * 0.65);
  num(st.v1, p1 * 8000000, " ₽");
  if (p2 > 0.05) { st.v2.style.opacity = 1; st.v2.style.color = "#111"; num(st.v2, p2 * 5200000, " ₽"); }
  st.delta.style.opacity = seg(t, 2.3, 2.8);
  const note = once(s, () => { const n = el("div", { position: "absolute", bottom: "40px", left: 0, right: 0, textAlign: "center", fontSize: "12px", color: MUTED, opacity: 0.7 }, "иллюстрация, условные данные"); s.appendChild(n); return n; });
});
D("VSL-AINFO-001", 4, (s, t) => { // discount ring
  center(s); dataBg(s);
  const st = once(s, () => ({ ring: el("div", { width: "250px", height: "250px", borderRadius: "50%", background: "conic-gradient(#FFB020 0deg, rgba(255,255,255,0.08) 0deg)", display: "flex", alignItems: "center", justifyContent: "center" }) }));
  const hole = once(s, () => { const h = el("div", { width: "180px", height: "180px", borderRadius: "50%", background: "#0A1120", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" });
    const v = el("div", { fontWeight: 900, fontSize: "64px", color: WHITE }, "−0%");
    h.appendChild(v); h.appendChild(el("div", { fontSize: "13px", color: MUTED }, "от рыночной цены"));
    st.ring.appendChild(h); return { v };
  });
  const p = E.out(seg(t, 0.3, 2.0));
  st.ring.style.background = `conic-gradient(from -63deg, #FFB020 ${p * 126}deg, rgba(255,255,255,0.08) 0deg)`;
  hole.v.textContent = `−${Math.round(p * 35)}%`;
  const note = once(s, () => { const n = el("div", { position: "absolute", bottom: "40px", left: 0, right: 0, textAlign: "center", fontSize: "12px", color: MUTED, opacity: 0.7 }, "иллюстрация, условные данные"); s.appendChild(n); return n; });
});
D("VSL-KTYPO-001", 4, (s, t) => { // number punch
  center(s); dataBg(s);
  const st = once(s, () => ({ a: el("div", { fontWeight: 900, fontSize: "110px", color: WHITE, fontVariantNumeric: "tabular-nums" }, "") }));
  const seq = [["8 000 000", 0.25], ["8 000 000 ₽?", 0.9], ["5 200 000 ₽", 1.6]];
  let out = "", color = WHITE, scale = 1;
  for (const [txt, at] of seq) {
    if (t >= at) { out = txt; const k = clamp((t - at) / 0.22); scale = 1.25 - E.out(k) * 0.25; color = txt === "5 200 000 ₽" ? AMBER : WHITE; }
  }
  st.a.textContent = out;
  st.a.style.transform = `scale(${scale})`;
  st.a.style.color = color;
  st.a.style.textShadow = scale > 1.05 ? "0 0 40px rgba(255,176,32,0.4)" : "none";
  const note = once(s, () => { const n = el("div", { position: "absolute", bottom: "40px", left: 0, right: 0, textAlign: "center", fontSize: "12px", color: MUTED, opacity: 0.7 }, "иллюстрация, условные данные"); s.appendChild(n); return n; });
});
D("VSL-MINIM-001", 4, (s, t) => { // minimal price card
  center(s); dataBg(s);
  const st = once(s, () => {
    const card = el("div", { width: "280px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.14)", borderRadius: "20px", padding: "26px", textAlign: "left" });
    card.appendChild(el("div", { fontSize: "13px", letterSpacing: "2px", color: MUTED, textTransform: "uppercase" }, "2-к квартира · 54 м²"));
    const oldP = el("div", { fontWeight: 700, fontSize: "26px", color: MUTED, marginTop: "12px", position: "relative", width: "fit-content" }, "8 000 000 ₽");
    const strike = el("div", { position: "absolute", left: 0, top: "50%", height: "2px", background: "#FF7A7A", width: "0px" });
    oldP.appendChild(strike);
    const newP = el("div", { fontWeight: 900, fontSize: "40px", color: WHITE, marginTop: "4px" }, "");
    const delta = el("div", { fontWeight: 800, fontSize: "16px", color: TEAL, marginTop: "10px", opacity: 0 }, "−2 800 000 ₽ на торгах");
    card.appendChild(oldP); card.appendChild(newP); card.appendChild(delta);
    s.appendChild(card);
    return { card, strike, newP, delta };
  });
  st.card.style.opacity = seg(t, 0.2, 0.6); st.card.style.transform = `translateY(${(1 - E.out(seg(t, 0.2, 0.7))) * 30}px)`;
  st.strike.style.width = px(E.out(seg(t, 1.0, 1.6)) * 150);
  const p = E.out(seg(t, 1.4, 2.4));
  num(st.newP, p * 5200000, " ₽");
  st.delta.style.opacity = seg(t, 2.6, 3.1);
});
D("VSL-RESTA-001", 4, (s, t) => { // real estate price reveal
  bg(s, "linear-gradient(135deg,#5B6B8C 0%,#3E4A63 100%)");
  const st = once(s, () => ({
    tag: el("div", { position: "absolute", top: "90px", left: "30px", background: "rgba(0,0,0,0.55)", color: WHITE, fontWeight: 800, fontSize: "16px", padding: "8px 14px", borderRadius: "10px", opacity: 0 }, "2-к · 54 м² · Казань"),
    plate: el("div", { position: "absolute", left: "30px", right: "30px", bottom: "130px", background: "rgba(10,15,28,0.82)", backdropFilter: "blur(8px)", borderRadius: "18px", padding: "18px 20px", transform: "translateY(140px)" }),
  }));
  st.plate.appendChild(el("div", { fontSize: "13px", color: MUTED, letterSpacing: "1px" }, "СТАРТОВАЯ ЦЕНА НА ТОРГАХ"));
  const v = el("div", { fontWeight: 900, fontSize: "42px", color: AMBER }, "");
  st.plate.appendChild(v);
  s.appendChild(st.tag); s.appendChild(st.plate);
  const tp = spr(seg(t, 0.3, 1.0));
  st.tag.style.opacity = clamp(tp * 2);
  const pp = spr(seg(t, 0.7, 1.5));
  st.plate.style.transform = `translateY(${(1 - pp) * 140}px)`;
  num(v, E.out(seg(t, 1.4, 2.6)) * 5200000, " ₽");
  const note = once(s, () => { const n = el("div", { position: "absolute", bottom: "40px", left: 0, right: 0, textAlign: "center", fontSize: "12px", color: "rgba(255,255,255,0.65)" }, "иллюстрация, условные данные"); s.appendChild(n); return n; });
});
D("VSL-PREMI-001", 4, (s, t) => { // premium social frame
  bg(s, "linear-gradient(180deg,#15223D,#070C18)");
  const st = once(s, () => ({
    bar: chip(s, 30, 46, 300, 4, "rgba(255,255,255,0.12)", 2),
    kicker: el("div", { position: "absolute", top: "150px", left: "34px", fontSize: "13px", letterSpacing: "3px", color: TEAL, fontWeight: 800 }, "ИНВЕСТИЦИИ · №07"),
    num: el("div", { position: "absolute", top: "260px", left: "34px", fontWeight: 900, fontSize: "120px", color: WHITE, lineHeight: "1" }, "−35%"),
    sub: el("div", { position: "absolute", top: "400px", left: "34px", right: "60px", fontWeight: 700, fontSize: "26px", color: MUTED }, "к цене рынка — публичное предложение"),
    rule: chip(s, 34, 500, 0, 3, AMBER, 2),
  }));
  const fill = chip(s, 30, 46, 0, 4, AMBER, 2);
  fill.style.width = px(t / 4 * 300);
  st.kicker.style.opacity = seg(t, 0.2, 0.6);
  st.num.style.opacity = spr(seg(t, 0.4, 1.1)) * 1;
  st.num.style.transform = `scale(${spr(seg(t, 0.4, 1.1))})`;
  st.sub.style.opacity = seg(t, 1.0, 1.6);
  st.rule.style.width = px(E.out(seg(t, 1.4, 2.2)) * 120);
});

/* ---------- карточки reference-only источников ---------- */
function srcCard(s, t, id, emoji, srcName, title, sub) {
  center(s); bg(s, "linear-gradient(180deg,#1B2233,#0B101C)");
  const st = once(s, () => {
    const w = el("div", { textAlign: "center", padding: "0 28px" });
    w.appendChild(el("div", { fontSize: "40px" }, emoji));
    w.appendChild(el("div", { fontSize: "11px", letterSpacing: "3px", color: TEAL, fontWeight: 800, marginTop: "8px" }, srcName));
    w.appendChild(el("div", { fontWeight: 900, fontSize: "21px", color: WHITE, marginTop: "8px" }, title));
    w.appendChild(el("div", { fontSize: "13px", color: MUTED, marginTop: "10px", lineHeight: "1.5" }, sub));
    w.appendChild(el("div", { marginTop: "12px", fontSize: "12px", color: "#FF9A9A" }, "⚠️ reference-only · ссылка и описание"));
    s.appendChild(w); return { w };
  });
  st.w.style.opacity = 0.8 + Math.sin(t * 2) * 0.15;
}
D("ACS-KTYPO-001", 4, (s, t) => srcCard(s, t, "ACS", "🎨", "AI CSS ANIMATIONS", "Kinetic Typography", "107 работ · свободные — CC0 · промпты открыты"));
D("ACS-DATAV-001", 4, (s, t) => srcCard(s, t, "ACS", "📊", "AI CSS ANIMATIONS", "Data Visualization", "подборка CC0 · коммерчески пригодна"));
D("ACS-THREE-001", 4, (s, t) => srcCard(s, t, "ACS", "🧊", "AI CSS ANIMATIONS", "3D Motion Design", "104 three.js-работы · CC0-часть свободна"));
D("ART-EDITO-001", 4, (s, t) => srcCard(s, t, "ART", "📰", "ARTIPHIK", "Infographic moments (77)", "таймкоды Vox/Johnny Harris/Cleo Abram"));
D("ART-DATAV-001", 4, (s, t) => srcCard(s, t, "ART", "📈", "ARTIPHIK", "Chart moments (36)", "диаграммы редакционных видео"));
D("ART-AMAPS-001", 4, (s, t) => srcCard(s, t, "ART", "🗺️", "ARTIPHIK", "Map moments (22)", "маршруты и подсветки стран"));
D("ART-KTYPO-001", 4, (s, t) => srcCard(s, t, "ART", "🔤", "ARTIPHIK", "Typography moments (56)", "кинетика документалистов"));
D("LTF-AINFO-001", 4, (s, t) => srcCard(s, t, "LTF", "🔵", "LOTTIEFILES", "Free infographic (161)", "GIF/MP4/JSON · лицензия по элементу"));
D("LTF-DATAV-001", 4, (s, t) => srcCard(s, t, "LTF", "📉", "LOTTIEFILES", "Growth/Line/Pie charts", "JSON у автора · проверять лицензию"));
D("ANM-EXPLA-001", 4, (s, t) => srcCard(s, t, "ANM", "💡", "ANIMODE", "Explore gallery", "charts · lower thirds · market share"));
D("ANM-AMAPS-001", 4, (s, t) => srcCard(s, t, "ANM", "🧭", "ANIMODE", "Map tracing works", "Europe route · SE Asia highlights"));
D("KIS-PREMI-001", 4, (s, t) => srcCard(s, t, "KIS", "🎬", "KISTO", "Motion design feed", "The Mill · SEHSUCHT · DixonBaxi"));
D("KIS-KTYPO-001", 4, (s, t) => srcCard(s, t, "KIS", "🔤", "KISTO", "Kinetic Typography feed", "бродкаст-эталоны"));

/* ---------- digitalsamba (DGT): кастомные переходы (MIT, код локально) ---------- */
function transBase(s, t) { // две сцены для демонстрации
  bg(s, BG);
  const st = once(s, () => {
    const a = el("div", { position: "absolute", inset: "0", display: "flex", alignItems: "center", justifyContent: "center" });
    a.appendChild(bigLine("СЦЕНА A", 54, WHITE));
    const b = el("div", { position: "absolute", inset: "0", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(180deg,#20304F,#0B1322)" });
    b.appendChild(bigLine("СЦЕНА B", 54, AMBER));
    s.appendChild(a); s.appendChild(b); return { a, b };
  });
  return st;
}
D("DGT-TRANS-001", 4, (s, t) => { // glitch
  const st = transBase(s, t);
  const p = seg(t, 1.6, 2.2);
  const g = p > 0 && p < 1 && rnd(Math.floor(t * 30)) > 0.35;
  st.b.style.opacity = p > 0.5 ? 1 : 0;
  st.b.style.transform = g ? `translate(${rnd(Math.floor(t * 60)) * 14 - 7}px,0)` : "none";
  st.b.style.filter = g ? "contrast(1.3)" : "none";
  st.b.style.textShadow = g ? "-5px 0 rgba(255,45,149,0.9), 5px 0 rgba(45,212,191,0.9)" : "none";
  st.b.style.clipPath = g ? `inset(${rnd(Math.floor(t * 45)) * 30}% 0 ${rnd(Math.floor(t * 77)) * 30}% 0)` : "none";
});
D("DGT-TRANS-002", 4, (s, t) => { // rgb split
  const st = transBase(s, t);
  const p = E.io(seg(t, 1.6, 2.3));
  st.b.style.opacity = p;
  st.a.style.filter = p > 0 && p < 1 ? `drop-shadow(${(1 - p) * -18}px 0 rgba(255,45,149,0.8)) drop-shadow(${(1 - p) * 18}px 0 rgba(45,212,191,0.8))` : "none";
});
D("DGT-TRANS-003", 4, (s, t) => { // pixelate
  const st = transBase(s, t);
  const p = seg(t, 1.6, 2.4);
  const k = Math.sin(p * Math.PI);
  st.a.style.filter = k > 0.05 ? `blur(${k * 6}px) saturate(${1 + k * 2}) contrast(${1 + k * 0.5})` : "none";
  const m = once(s, () => { const m = el("div", { position: "absolute", inset: 0, opacity: 0, background: "repeating-conic-gradient(#0B1322 0% 25%, #1B2A47 0% 50%) 0 0/24px 24px" }); s.appendChild(m); return m; });
  m.style.opacity = k * 0.85;
  st.b.style.opacity = p > 0.5 ? 1 : 0;
});
D("DGT-TRANS-004", 4, (s, t) => { // zoom blur
  const st = transBase(s, t);
  const p = seg(t, 1.6, 2.3);
  const k = Math.sin(p * Math.PI);
  const sc = 1 + k * 2.4;
  st.a.style.transform = `scale(${sc})`;
  st.a.style.filter = k > 0.05 ? `blur(${k * 14}px)` : "none";
  st.b.style.opacity = p > 0.45 ? seg(p, 0.45, 1) : 0;
  st.b.style.transform = `scale(${1 + (1 - seg(p, 0.45, 1)) * 0.6})`;
});
D("DGT-TRANS-005", 4, (s, t) => { // light leak
  const st = transBase(s, t);
  const p = seg(t, 1.6, 2.5);
  const k = Math.sin(p * Math.PI);
  const leak = once(s, () => { const l = el("div", { position: "absolute", inset: 0, opacity: 0, background: "linear-gradient(105deg, rgba(255,220,150,0) 20%, rgba(255,200,110,0.95) 50%, rgba(255,160,80,0) 80%)", mixBlendMode: "screen" }); s.appendChild(l); return l; });
  leak.style.opacity = k;
  leak.style.transform = `translateX(${(p - 0.5) * 220}px)`;
  st.b.style.opacity = p > 0.5 ? 1 : 0;
});
D("DGT-TRANS-006", 4, (s, t) => { // checkerboard
  const st = transBase(s, t);
  const p = seg(t, 1.5, 2.5);
  const cells = once(s, () => {
    const wrap = el("div", { position: "absolute", inset: 0, display: "grid", gridTemplateColumns: "repeat(6,1fr)", gridTemplateRows: "repeat(11,1fr)" });
    const cs = [];
    for (let i = 0; i < 66; i++) { const c = el("div", { background: "#0B1322", opacity: 0 }); wrap.appendChild(c); cs.push(c); }
    s.appendChild(wrap); return cs;
  });
  cells.forEach((c, i) => {
    const col = i % 6, row = Math.floor(i / 6);
    const delay = (col + row) * 0.05;
    const local = seg(t, 1.5 + delay, 1.9 + delay);
    const flip = (row + col) % 2 === 0;
    c.style.opacity = local > 0.5 ? (flip ? 1 : 0) : (flip ? 0 : 1);
    c.style.opacity = local >= 1 ? 0 : c.style.opacity;
    if (t > 2.9) c.style.opacity = 0;
  });
  st.b.style.opacity = seg(t, 2.2, 2.6);
});
D("DGT-TRANS-007", 4, (s, t) => { // clock wipe (DGT)
  const st = transBase(s, t);
  const sector = once(s, () => { const w = el("div", { position: "absolute", inset: 0 }); s.appendChild(w); return w; });
  const p = seg(t, 1.6, 2.4);
  sector.style.background = `conic-gradient(#0B1322 0deg ${p * 360}deg, transparent ${p * 360}deg)`;
  st.b.style.opacity = p > 0.35 ? 1 : 0;
});
