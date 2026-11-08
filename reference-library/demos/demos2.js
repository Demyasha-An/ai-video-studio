/* video-reference-library · движок живых демо (часть 2)
   INFO, MAPS, CINE, ADS, REEL, REAL, HOOK, CTA + reference-карточки. */
"use strict";

/* =======================================================================
   INFO — инфографика
======================================================================= */
D("RCE-INFO-001", 4, (s, t) => { // bar chart
  bg(s, BG);
  const st = once(s, () => {
    const g = el("div", { position: "absolute", left: "40px", right: "40px", bottom: "110px", top: "140px", display: "flex", alignItems: "flex-end", gap: "18px" });
    const bars = [65, 90, 40, 75].map((v, i) => {
      const col = el("div", { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", height: "100%" });
      const b = el("div", { width: "100%", height: "0%", borderRadius: "10px 10px 4px 4px", background: i === 1 ? AMBER : TEAL });
      const lab = el("div", { fontSize: "14px", color: MUTED, marginTop: "6px" }, ["Q1", "Q2", "Q3", "Q4"][i]);
      col.appendChild(b); col.appendChild(lab); g.appendChild(col); return b;
    });
    s.appendChild(g); return { bars };
  });
  st.bars.forEach((b, i) => { b.style.height = `${E.out(seg(t, 0.3 + i * 0.2, 1.5 + i * 0.2)) * [65, 90, 40, 75][i]}%`; });
});
D("RCE-INFO-002", 4, (s, t) => { // line chart
  bg(s, BG);
  const st = once(s, () => {
    const svg = elNS("svg", { position: "absolute", left: "30px", right: "30px", top: "170px", bottom: "170px", width: "300px", height: "300px", viewBox: "0 0 300 300" });
    const line = elNS("polyline", { fill: "none", stroke: TEAL, strokeWidth: 6, strokeLinecap: "round" });
    const area = elNS("polygon", { fill: "rgba(45,212,191,0.15)", stroke: "none" });
    svg.appendChild(area); svg.appendChild(line); s.appendChild(svg); return { line, area };
  });
  const pts = [[0, 240], [60, 200], [120, 215], [180, 140], [240, 90], [300, 50]];
  const p = E.out(seg(t, 0.3, 2.2));
  const shown = pts.slice(0, Math.max(2, Math.ceil(p * pts.length)));
  st.line.setAttribute("points", shown.map(([x, y]) => `${x},${y}`).join(" "));
  st.area.setAttribute("points", `0,300 ${shown.map(([x, y]) => `${x},${y}`).join(" ")} ${shown[shown.length - 1][0]},300`);
});
function elNS(tag, style) { const n = document.createElementNS("http://www.w3.org/2000/svg", tag); Object.assign(n.style, style); return n; }
D("RVE-INFO-001", 4, (s, t) => { // donut chart
  center(s); bg(s, BG);
  const st = once(s, () => ({ ring: el("div", { width: "220px", height: "220px", borderRadius: "50%", background: `conic-gradient(${AMBER} 0deg, ${TEAL} 0deg, ${TEAL} 0deg, rgba(255,255,255,0.1) 0deg)`, display: "flex", alignItems: "center", justifyContent: "center" }) }));
  const hole = once(s, () => { const h = el("div", { width: "140px", height: "140px", borderRadius: "50%", background: "#0A1120", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" });
    h.appendChild(el("div", { fontWeight: 900, fontSize: "44px", color: WHITE }, "68%"));
    h.appendChild(el("div", { fontSize: "14px", color: MUTED }, "экономия"));
    st.ring.appendChild(h); return h; });
  const p = E.out(seg(t, 0.3, 2.0));
  st.ring.style.background = `conic-gradient(${AMBER} 0deg, ${AMBER} ${p * 140}deg, ${TEAL} ${p * 140}deg, ${TEAL} ${p * 245}deg, rgba(255,255,255,0.1) ${p * 245}deg)`;
});
D("RVE-INFO-002", 4, (s, t) => { // area chart
  bg(s, BG);
  const st = once(s, () => {
    const svg = elNS("svg", { position: "absolute", left: "20px", top: "200px", width: "320px", height: "260px", viewBox: "0 0 320 260" });
    const area = elNS("polygon", { fill: "rgba(255,176,32,0.2)" });
    const line = elNS("polyline", { fill: "none", stroke: AMBER, strokeWidth: 5 });
    svg.appendChild(area); svg.appendChild(line); s.appendChild(svg); return { area, line };
  });
  const pts = [[0, 210], [45, 170], [90, 190], [135, 120], [180, 140], [225, 70], [270, 95], [320, 30]];
  const p = E.out(seg(t, 0.3, 2.4));
  const shown = pts.slice(0, Math.max(2, Math.ceil(p * pts.length)));
  const str = shown.map(([x, y]) => `${x},${y}`).join(" ");
  st.line.setAttribute("points", str);
  st.area.setAttribute("points", `0,260 ${str} ${shown[shown.length - 1][0]},260`);
});
D("RVE-INFO-003", 4, (s, t) => { // comparison chart
  bg(s, BG);
  const st = once(s, () => ({ rows: [["Рыночная цена", "10 000 000 ₽", 1.0], ["Торги банкротов", "5 200 000 ₽", 0.52]].map(([lab, val, w], i) => {
    const row = el("div", { margin: "26px 36px" });
    row.appendChild(el("div", { fontSize: "17px", color: MUTED, marginBottom: "6px" }, lab));
    const track = el("div", { position: "relative", height: "44px", borderRadius: "10px", background: "rgba(255,255,255,0.07)" });
    const bar = el("div", { height: "100%", width: "0%", borderRadius: "10px", background: i ? AMBER : "#5A6B8C", display: "flex", alignItems: "center", paddingLeft: "14px", fontWeight: 800, color: i ? "#111" : "#fff", fontSize: "17px" });
    track.appendChild(bar); row.appendChild(track); s.appendChild(row); return bar;
  }) }));
  const p = E.out(seg(t, 0.4, 2.0));
  st.rows[0].style.width = `${p * 100}%`; st.rows[1].style.width = `${p * 52}%`;
  st.rows[1].textContent = seg(t, 1.4, 1.8) > 0.5 ? "5 200 000 ₽" : "";
  st.rows[0].textContent = seg(t, 1.2, 1.6) > 0.5 ? "10 000 000 ₽" : "";
});
D("RVE-INFO-004", 4, (s, t) => { // progress steps
  center(s); bg(s, BG);
  const st = once(s, () => ({ dots: [0, 1, 2].map((i) => {
    const step = el("div", { display: "flex", alignItems: "center", margin: "16px 0" });
    const d = el("div", { width: "46px", height: "46px", borderRadius: "50%", background: "rgba(255,255,255,0.1)", color: MUTED, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: "20px" }, String(i + 1));
    step.appendChild(d);
    step.appendChild(el("div", { marginLeft: "16px", fontWeight: 700, fontSize: "22px", color: WHITE }, ["Заявка", "Задаток", "Торги"][i]));
    s.appendChild(step); return d;
  }) }));
  st.dots.forEach((d, i) => {
    const p = seg(t, 0.4 + i * 0.8, 0.9 + i * 0.8);
    d.style.background = p >= 1 ? TEAL : "rgba(255,255,255,0.1)"; d.style.color = p >= 1 ? "#04231F" : MUTED;
    d.style.transform = `scale(${1 + Math.sin(clamp(p) * Math.PI) * 0.25})`;
  });
});
D("RCE-INFO-003", 4, (s, t) => { // drip fill gauge
  center(s); bg(s, BG);
  const st = once(s, () => {
    const jar = el("div", { position: "relative", width: "150px", height: "260px", borderRadius: "18px", border: "3px solid rgba(255,255,255,0.25)", overflow: "hidden" });
    const water = el("div", { position: "absolute", left: 0, right: 0, bottom: 0, height: "0%", background: `linear-gradient(180deg,${TEAL},#178F84)` });
    jar.appendChild(water); s.appendChild(jar); return { water };
  });
  const p = E.io(seg(t, 0.3, 3.0));
  st.water.style.height = `${p * 68}%`;
  const drop = once(s, () => { const d = el("div", { position: "absolute", width: "10px", height: "14px", borderRadius: "50% 50% 60% 60%", background: TEAL, top: "60px" }); s.appendChild(d); return d; });
  const dp = (t * 1.4) % 1;
  drop.style.top = px(60 + dp * 120); drop.style.opacity = 1 - dp;
});
D("OML-INFO-001", 4, (s, t) => { // donut breakdown
  center(s); bg(s, BG);
  const st = once(s, () => ({ ring: el("div", { width: "240px", height: "240px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }) }));
  const p = E.out(seg(t, 0.3, 2.2));
  const a1 = p * 150, a2 = p * 210;
  st.ring.style.background = `conic-gradient(${AMBER} 0 ${a1}deg, ${TEAL} ${a1}deg ${a1 + (210 - 150) * 0}deg, ${TEAL} ${a1 + (a2 - a1) * 0.5}deg, #8A93FF ${a1 + (a2 - a1) * 0.5}deg ${a2}deg, rgba(255,255,255,0.08) ${a2}deg)`;
  const hole = st.ring.firstChild || (() => { const h = el("div", { width: "150px", height: "150px", borderRadius: "50%", background: "#0A1120" }); st.ring.appendChild(h); return h; })();
});

/* =======================================================================
   MAPS — карты
======================================================================= */
D("OML-MAPS-001", 4, (s, t) => { // flight arcs
  bg(s, "linear-gradient(180deg,#0E1A30,#070C18)");
  const st = once(s, () => {
    const svg = elNS("svg", { position: "absolute", inset: 0, width: "360px", height: "640px", viewBox: "0 0 360 640" });
    const cities = [[80, 220], [280, 180], [180, 380], [300, 420]];
    cities.forEach(([x, y]) => svg.appendChild(elNS("circle", { fill: WHITE, cx: x, cy: y, r: 5 })));
    const arc = elNS("path", { fill: "none", stroke: AMBER, strokeWidth: 3 });
    svg.appendChild(arc); s.appendChild(svg); return { arc, cities };
  });
  const p = E.io(seg(t, 0.4, 2.6));
  const [a, b] = [st.cities[0], st.cities[1]];
  const mx = (a[0] + b[0]) / 2, my = Math.min(a[1], b[1]) - 90;
  const pt = (tt) => { const x = (1 - tt) * (1 - tt) * a[0] + 2 * (1 - tt) * tt * mx + tt * tt * b[0]; const y = (1 - tt) * (1 - tt) * a[1] + 2 * (1 - tt) * tt * my + tt * tt * b[1]; return `${x},${y}`; };
  let dstr = `M ${a[0]} ${a[1]} Q ${mx} ${my} ${b[0]} ${b[1]}`;
  st.arc.setAttribute("d", dstr);
  st.arc.setAttribute("stroke-dasharray", `${p * 500} 500`);
});
D("OML-MAPS-002", 4, (s, t) => { // pin drop cluster
  bg(s, "linear-gradient(180deg,#0E1A30,#070C18)");
  const st = once(s, () => ({ pins: Array.from({ length: 9 }, (_, i) => {
    const pin = el("div", { position: "absolute", left: px(50 + rnd(i) * 250), top: px(150 + rnd(i + 40) * 330), width: "26px", height: "26px", borderRadius: "50% 50% 50% 0", background: AMBER, transform: "rotate(-45deg)", opacity: 0 });
    pin.style.boxShadow = "0 6px 16px rgba(0,0,0,0.5)";
    s.appendChild(pin); return pin;
  }) }));
  st.pins.forEach((p, i) => {
    const k = spr(seg(t, 0.3 + i * 0.22, 0.8 + i * 0.22));
    p.style.opacity = clamp(k * 2); p.style.transform = `rotate(-45deg) translateY(${(1 - k) * -60}px)`;
  });
});
D("OML-MAPS-003", 4, (s, t) => { // choropleth
  bg(s, "linear-gradient(180deg,#0E1A30,#070C18)");
  const st = once(s, () => {
    const g = el("div", { position: "absolute", left: "40px", right: "40px", top: "160px", bottom: "160px", display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "6px" });
    const cells = Array.from({ length: 16 }, (_, i) => { const c = el("div", { background: "rgba(255,255,255,0.06)", borderRadius: "6px" }); g.appendChild(c); return c; });
    s.appendChild(g); return { cells };
  });
  st.cells.forEach((c, i) => {
    const p = E.out(seg(t, 0.3 + rnd(i) * 1.2, 1.4 + rnd(i) * 1.4));
    c.style.background = `rgba(255,176,32,${p * 0.75})`;
  });
});
D("OML-MAPS-004", 4, (s, t) => { // city zoom label
  bg(s, "linear-gradient(180deg,#0E1A30,#070C18)");
  const st = once(s, () => ({
    map: el("div", { position: "absolute", inset: "0", background: "repeating-linear-gradient(45deg, rgba(255,255,255,0.04) 0 2px, transparent 2px 40px), repeating-linear-gradient(-45deg, rgba(255,255,255,0.04) 0 2px, transparent 2px 40px)" }),
    label: el("div", { position: "absolute", left: "50%", top: "50%", transform: "translate(-50%,-50%)", background: "rgba(255,255,255,0.12)", padding: "10px 20px", borderRadius: "12px", fontWeight: 800, color: WHITE, opacity: 0 }, "Казань"),
    pin: el("div", { position: "absolute", left: "50%", top: "50%", width: "18px", height: "18px", margin: "-9px", borderRadius: "50%", background: AMBER, boxShadow: "0 0 24px rgba(255,176,32,0.9)" }),
  }));
  const z = E.io(seg(t, 0.3, 2.2));
  st.map.style.transform = `scale(${1 + z * 2.2})`;
  st.label.style.opacity = seg(t, 1.6, 2.2);
  st.pin.style.transform = `scale(${1 + z * 1.5})`;
});

/* =======================================================================
   CINE — кинематографичные эффекты
======================================================================= */
D("RCE-CINE-001", 4, (s, t) => { // camera shake
  center(s); bg(s, BG);
  const st = once(s, () => ({ a: bigLine("УДАР", 90, WHITE) }));
  const imp = Math.max(0, 1 - ((t % 1.6) / 0.35));
  s.style.transform = `translate(${rnd(Math.floor(t * 60)) * 14 * imp - 7 * imp}px, ${rnd(Math.floor(t * 60) + 5) * 10 * imp - 5 * imp}px)`;
  st.a.style.color = imp > 0.4 ? AMBER : WHITE;
});
D("RVE-CINE-001", 4, (s, t) => { // film burn
  bg(s, PHOTO);
  const st = once(s, () => ({ burn: el("div", { position: "absolute", inset: 0, background: `radial-gradient(circle at 50% 55%, rgba(255,240,200,1), rgba(255,120,20,0.8) 40%, rgba(0,0,0,0) 75%)`, opacity: 0, mixBlendMode: "screen" }) }));
  const p = (t % 2.6) / 2.6;
  st.burn.style.opacity = Math.sin(clamp(p) * Math.PI);
  st.burn.style.transform = `scale(${0.6 + p * 2})`;
});
D("RVE-CINE-002", 4, (s, t) => { // letterbox reveal
  bg(s, PHOTO);
  const st = once(s, () => ({ top: el("div", { position: "absolute", left: 0, right: 0, top: 0, background: "#000" }), bot: el("div", { position: "absolute", left: 0, right: 0, bottom: 0, background: "#000" }) }));
  const open = E.io(seg(t, 0.3, 1.6)) * 230 + 60;
  st.top.style.height = px(open); st.bot.style.height = px(open);
  const close = seg(t, 3.4, 4.0);
  st.top.style.height = px(open + close * 260); st.bot.style.height = px(open + close * 260);
});
D("RVE-CINE-003", 4, (s, t) => { // vignette pulse
  bg(s, PHOTO);
  const st = once(s, () => ({ v: el("div", { position: "absolute", inset: 0, background: "radial-gradient(circle at 50% 50%, transparent 40%, rgba(0,0,0,0.9) 100%)" }) }));
  const pulse = 0.6 + Math.sin(t * 2.2) * 0.3;
  st.v.style.opacity = pulse;
});
D("RVE-CINE-004", 4, (s, t) => { // noise grain
  bg(s, PHOTO);
  const st = once(s, () => ({ g: el("div", { position: "absolute", inset: -10, opacity: 0.22, background: "repeating-conic-gradient(#000 0% 25%, transparent 0% 50%) 0 0/4px 4px" }) }));
  st.g.style.transform = `translate(${rnd(Math.floor(t * 30)) * 6 - 3}px, ${rnd(Math.floor(t * 30) + 3) * 6 - 3}px)`;
});
D("RVE-CINE-005", 4, (s, t) => { // spotlight reveal
  bg(s, "#02040A");
  const st = once(s, () => ({ txt: bigLine("РЕВЕЛАЦИЯ", 52, WHITE, { position: "absolute", top: "295px", left: 0, right: 0, textAlign: "center", opacity: 0 }) }));
  const light = once(s, () => { const l = el("div", { position: "absolute", inset: 0, background: `radial-gradient(circle 160px at 50% 50%, rgba(255,240,210,0.95), transparent 75%)`, mixBlendMode: "screen" }); s.appendChild(l); return l; });
  const a = t / 4 * Math.PI * 2;
  light.style.background = `radial-gradient(circle 160px at ${50 + Math.cos(a) * 22}% ${50 + Math.sin(a) * 16}%, rgba(255,240,210,0.95), transparent 75%)`;
  st.txt.style.opacity = seg(t, 1.2, 2.0) * (t > 3.2 ? 0.2 : 1);
});
D("RVE-CINE-006", 4, (s, t) => { // matrix rain
  bg(s, "#020604");
  const st = once(s, () => ({ cols: Array.from({ length: 12 }, (_, i) => {
    const c = el("div", { position: "absolute", top: "-40px", left: px(i * 30 + 4), fontFamily: "monospace", fontSize: "22px", color: TEAL, whiteSpace: "pre", textShadow: "0 0 8px rgba(45,212,191,0.8)" });
    s.appendChild(c); return c;
  }) }));
  st.cols.forEach((c, i) => {
    const speed = 140 + rnd(i) * 220;
    const y = (t * speed + rnd(i) * 640) % 760 - 40;
    let str = "";
    for (let k = 0; k < 8; k++) str += String.fromCharCode(0x30A0 + Math.floor(rnd(i * 31 + k + Math.floor(t * 8)) * 90)) + "\n";
    c.style.transform = `translateY(${y}px)`; c.textContent = str;
  });
});
D("OML-CINE-001", 4, (s, t) => { // rack focus
  bg(s, "linear-gradient(180deg,#1A2742,#0B1322)");
  const st = once(s, () => ({
    near: el("div", { position: "absolute", left: "50px", bottom: "140px", width: "180px", height: "120px", borderRadius: "14px", background: "rgba(255,176,32,0.35)" }),
    far: el("div", { position: "absolute", left: "140px", top: "150px", width: "120px", height: "90px", borderRadius: "14px", background: "rgba(45,212,191,0.35)" }),
  }));
  const p = (Math.sin(t / 4 * Math.PI * 2) + 1) / 2;
  st.near.style.filter = `blur(${(1 - p) * 8}px)`; st.far.style.filter = `blur(${p * 8}px)`;
});
D("OML-CINE-002", 4, (s, t) => { // crash zoom
  center(s); bg(s, BG);
  const st = once(s, () => ({ a: bigLine("СРОЧНО", 76, WHITE) }));
  const cycle = (t % 2) / 2;
  st.a.style.transform = `scale(${1 + E.out(seg(cycle, 0, 0.18)) * 1.6})`;
  s.style.filter = seg(cycle, 0, 0.18) < 1 ? "contrast(1.15)" : "none";
});
D("OML-CINE-003", 4, (s, t) => { // dolly zoom
  bg(s, "linear-gradient(180deg,#1A2742,#0B1322)");
  const st = once(s, () => ({
    far: el("div", { position: "absolute", left: "70px", top: "190px", right: "70px", height: "280px", background: "rgba(255,255,255,0.06)", borderRadius: "20px" }),
    near: el("div", { position: "absolute", left: "140px", top: "280px", width: "90px", height: "160px", background: "rgba(255,176,32,0.5)", borderRadius: "12px" }),
  }));
  const p = (Math.sin(t / 4 * Math.PI * 2) + 1) / 2;
  st.far.style.transform = `scale(${1 + p * 1.2})`;
  st.near.style.transform = `scale(${1.4 - p * 0.7})`;
});
D("RCE-CINE-002", 4, (s, t) => { // starfield
  bg(s, "#02040A");
  const st = once(s, () => ({ stars: Array.from({ length: 70 }, (_, i) => {
    const d = el("div", { position: "absolute", width: "2px", height: "2px", borderRadius: "50%", background: WHITE, left: px(rnd(i) * 360), top: px(rnd(i + 100) * 640) });
    s.appendChild(d); return d;
  }) }));
  st.stars.forEach((d, i) => {
    const speed = 20 + rnd(i) * 160;
    const y = (rnd(i + 100) * 640 + t * speed) % 640;
    d.style.top = px(y);
    d.style.opacity = 0.3 + rnd(i + 7) * 0.7;
  });
});

/* =======================================================================
   ADS — реклама
======================================================================= */
D("RCE-ADS-001", 4, (s, t) => { // end card
  center(s); bg(s, BG);
  const st = once(s, () => {
    const logo = el("div", { width: "110px", height: "110px", borderRadius: "26px", background: AMBER, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: "44px", color: "#111" }, "ВС");
    const tag = el("div", { fontWeight: 800, fontSize: "30px", color: WHITE, marginTop: "20px", textAlign: "center" }, "ВашаСделка");
    const cta = el("div", { marginTop: "14px", padding: "10px 26px", borderRadius: "14px", border: "2px solid rgba(255,255,255,0.3)", color: MUTED, fontSize: "18px", textAlign: "center" }, "vashasdelka.ru");
    const w = el("div", { textAlign: "center" }); w.appendChild(logo); w.appendChild(tag); w.appendChild(cta); s.appendChild(w);
    return { logo, tag, cta };
  });
  st.logo.style.transform = `scale(${spr(seg(t, 0.2, 0.9))})`;
  st.tag.style.opacity = seg(t, 0.8, 1.4); st.tag.style.transform = `translateY(${(1 - E.out(seg(t, 0.8, 1.4))) * 20}px)`;
  st.cta.style.opacity = seg(t, 1.4, 2.0);
});
D("RCE-ADS-002", 4, (s, t) => { // neon sign
  center(s); bg(s, "#050208");
  const st = once(s, () => ({ a: el("div", { fontFamily: "Georgia, serif", fontSize: "64px", color: "#FFD9E8", textShadow: "0 0 6px #FF2D95, 0 0 24px #FF2D95, 0 0 60px #FF2D95" }, "ОТКРЫТО") }));
  const flick = rnd(Math.floor(t * 20)) > 0.08 ? 1 : 0.35;
  st.a.style.opacity = flick;
  st.a.style.transform = `scale(${spr(seg(t, 0.2, 0.9))})`;
});
D("RCE-ADS-003", 4, (s, t) => { // logo blur reveal
  center(s); bg(s, BG);
  const st = once(s, () => ({ a: bigLine("ЛОГОТИП", 64, WHITE) }));
  const p = E.out(seg(t, 0.3, 1.5));
  st.a.style.filter = `blur(${(1 - p) * 20}px)`; st.a.style.opacity = p;
});
D("RCE-ADS-004", 4, (s, t) => { // logo stroke draw
  center(s); bg(s, BG);
  const st = once(s, () => {
    const svg = elNS("svg", { width: "240px", height: "160px", viewBox: "0 0 240 160" });
    const path = elNS("path", { d: "M 20 120 L 20 40 L 90 120 L 90 40 M 130 40 C 130 40 130 120 130 120 C 130 120 210 120 210 120", fill: "none", stroke: AMBER, strokeWidth: 8, strokeLinecap: "round" });
    svg.appendChild(path); s.appendChild(svg); return { path };
  });
  const p = E.io(seg(t, 0.3, 2.0));
  st.path.setAttribute("stroke-dasharray", `${p * 600} 600`);
  st.path.style.filter = p >= 1 ? `drop-shadow(0 0 14px ${AMBER})` : "none";
});
D("RVE-ADS-001", 4, (s, t) => { // subscribe reminder
  bg(s, BG);
  const st = once(s, () => {
    const w = el("div", { position: "absolute", bottom: "150px", left: "30px", right: "30px", background: "rgba(255,255,255,0.1)", borderRadius: "18px", padding: "18px", display: "flex", alignItems: "center", gap: "14px" });
    const av = el("div", { width: "56px", height: "56px", borderRadius: "50%", background: AMBER, flexShrink: 0 });
    const col = el("div", { flex: 1 }); col.appendChild(el("div", { fontWeight: 800, fontSize: "20px", color: WHITE }, "ВашаСделка"));
    col.appendChild(el("div", { fontSize: "15px", color: MUTED }, "120 тыс. подписчиков"));
    const btn = el("div", { background: AMBER, color: "#111", fontWeight: 900, fontSize: "17px", padding: "10px 18px", borderRadius: "24px" }, "ПОДПИСАТЬСЯ");
    w.appendChild(av); w.appendChild(col); w.appendChild(btn); s.appendChild(w); return { w, btn };
  });
  const p = spr(seg(t, 0.4, 1.3));
  st.w.style.transform = `translateY(${(1 - p) * 120}px)`; st.w.style.opacity = clamp(p * 2);
  const done = seg(t, 2.2, 2.6) >= 1;
  st.btn.textContent = done ? "ВЫ ПОДПИСАНЫ ✓" : "ПОДПИСАТЬСЯ";
  st.btn.style.background = done ? TEAL : AMBER;
});
D("OML-ADS-001", 4, (s, t) => { // flash deal card
  center(s); bg(s, BG);
  const st = once(s, () => {
    const card = el("div", { width: "280px", borderRadius: "22px", background: "rgba(255,255,255,0.08)", padding: "22px", textAlign: "center", border: "1px solid rgba(255,255,255,0.15)" });
    card.appendChild(el("div", { fontWeight: 900, fontSize: "34px", color: AMBER }, "−50%"));
    card.appendChild(el("div", { fontSize: "17px", color: WHITE, margin: "6px 0 14px" }, "только до конца дня"));
    const timer = el("div", { fontWeight: 900, fontSize: "30px", color: WHITE, fontVariantNumeric: "tabular-nums" });
    const track = el("div", { height: "10px", borderRadius: "5px", background: "rgba(255,255,255,0.12)", marginTop: "14px", overflow: "hidden" });
    const stock = el("div", { height: "100%", width: "100%", background: "#FF5E62" });
    track.appendChild(stock);
    card.appendChild(timer); card.appendChild(track); s.appendChild(card); return { timer, stock };
  });
  const left = Math.max(0, 3 - (t / 4) * 3);
  st.timer.textContent = `00:0${Math.floor(left)}`;
  st.stock.style.width = `${left / 3 * 100}%`;
});
D("OML-ADS-002", 4, (s, t) => { // feature callouts
  center(s); bg(s, BG);
  const st = once(s, () => ({
    box: el("div", { width: "170px", height: "170px", borderRadius: "24px", background: "rgba(255,255,255,0.12)", position: "relative" }),
    calls: ["✓ 1080×1920", "✓ 30 FPS", "✓ H.264"].map((txt, i) => {
      const c = el("div", { position: "absolute", padding: "8px 14px", borderRadius: "12px", background: "rgba(0,0,0,0.6)", color: WHITE, fontSize: "15px", fontWeight: 700, whiteSpace: "nowrap", opacity: 0 }, txt);
      s.appendChild(c); return c;
    }),
  }));
  st.box.style.transform = `scale(${spr(seg(t, 0.2, 0.9))})`;
  const pos = [[-90, -40], [190, 30], [-60, 190]];
  st.calls.forEach((c, i) => {
    const p = spr(seg(t, 0.6 + i * 0.5, 1.2 + i * 0.5));
    c.style.opacity = clamp(p * 2);
    c.style.left = px(95 + pos[i][0]); c.style.top = px(235 + pos[i][1]);
  });
});

/* =======================================================================
   REEL — Reels / Shorts / TikTok
======================================================================= */
D("RCE-REEL-001", 4, (s, t) => { // social reel
  bg(s, BG);
  const st = once(s, () => ({
    bar: el("div", { position: "absolute", top: "26px", left: "20px", right: "20px", height: "5px", borderRadius: "3px", background: "rgba(255,255,255,0.15)" }),
    head: bigLine("REELS-КАДР", 44, WHITE, { position: "absolute", top: "250px", left: 0, right: 0, textAlign: "center" }),
    cap: el("div", { position: "absolute", bottom: "130px", left: "24px", right: "24px", fontWeight: 800, fontSize: "24px", color: WHITE, textAlign: "center", textShadow: "0 2px 10px #000" }, "зона субтитров"),
    ui: el("div", { position: "absolute", right: "14px", bottom: "150px", fontSize: "22px", color: MUTED, textAlign: "center", lineHeight: "1.8" }, "♥\n💬\n↗"),
  }));
  st.bar.appendChild(el("div", { height: "100%", width: `${t / 4 * 100}%`, borderRadius: "3px", background: AMBER }));
  st.head.style.transform = `scale(${spr(seg(t, 0.2, 0.9))})`;
});
D("RCE-REEL-002", 4, (s, t) => { // split screen
  bg(s, BG);
  const st = once(s, () => ({
    a: el("div", { position: "absolute", left: 0, right: 0, top: 0, bottom: "50%", background: "linear-gradient(135deg,#31435F,#1B2540)", display: "flex", alignItems: "center", justifyContent: "center" }),
    b: el("div", { position: "absolute", left: 0, right: 0, top: "50%", bottom: 0, background: "linear-gradient(135deg,#20304F,#101A2E)", display: "flex", alignItems: "center", justifyContent: "center" }),
  }));
  st.a.appendChild(bigLine("ДО", 44, MUTED));
  st.b.appendChild(bigLine("ПОСЛЕ", 44, AMBER));
  const p = E.out(seg(t, 0.2, 1.0));
  st.a.style.transform = `translateY(${(1 - p) * -80}px)`; st.b.style.transform = `translateY(${(1 - p) * 80}px)`;
});
D("RVE-REEL-001", 4, (s, t) => { // pip
  bg(s, PHOTO);
  const st = once(s, () => ({ pip: el("div", { position: "absolute", right: "24px", bottom: "150px", width: "120px", height: "170px", borderRadius: "16px", background: "linear-gradient(135deg,#1B2540,#0B1322)", border: "2px solid rgba(255,255,255,0.3)", boxShadow: "0 10px 30px rgba(0,0,0,0.6)" }) }));
  const p = spr(seg(t, 0.3, 1.1));
  st.pip.style.transform = `scale(${p})`; st.pip.style.opacity = clamp(p * 2);
});
D("RVE-REEL-002", 4, (s, t) => { // notification pop
  bg(s, "linear-gradient(180deg,#2A3B5A,#0D1526)");
  const st = once(s, () => {
    const n = el("div", { position: "absolute", top: "70px", left: "24px", right: "24px", background: "rgba(20,28,48,0.95)", borderRadius: "18px", padding: "14px 16px", display: "flex", gap: "12px", alignItems: "center", boxShadow: "0 14px 34px rgba(0,0,0,0.5)" });
    n.appendChild(el("div", { width: "40px", height: "40px", borderRadius: "10px", background: AMBER, flexShrink: 0 }));
    const c = el("div", {}); c.appendChild(el("div", { fontWeight: 800, fontSize: "16px", color: WHITE }, "Новый объект на торгах"));
    c.appendChild(el("div", { fontSize: "13px", color: MUTED }, "сейчас · 2 мин назад"));
    n.appendChild(c); s.appendChild(n); return { n };
  });
  const cyc = t % 2.4;
  const p = spr(seg(cyc, 0.2, 0.9)) * (1 - seg(cyc, 1.9, 2.3));
  st.n.style.transform = `translateY(${(1 - p) * -140}px)`;
});
D("VSL-REEL-001", 4, (s, t) => { // vertical safe layout
  bg(s, BG);
  const st = once(s, () => ({
    bar: el("div", { position: "absolute", top: "56px", left: "30px", right: "30px", height: "5px", borderRadius: "3px", background: "rgba(255,255,255,0.12)" }),
    zone: el("div", { position: "absolute", top: "150px", bottom: "210px", left: "0", right: "0", border: "2px dashed rgba(45,212,191,0.35)", borderRadius: "14px", display: "flex", alignItems: "center", justifyContent: "center" }),
    cap: el("div", { position: "absolute", top: "505px", left: "20px", right: "20px", fontWeight: 800, fontSize: "22px", color: WHITE, textAlign: "center" }, "зона субтитров (safe)"),
  }));
  st.zone.appendChild(el("div", { fontWeight: 700, fontSize: "18px", color: MUTED }, "контент 300–1500 px"));
  st.bar.appendChild(el("div", { height: "100%", width: `${t / 4 * 100}%`, background: AMBER, borderRadius: "3px" }));
});

/* =======================================================================
   REAL — недвижимость
======================================================================= */
D("VSL-REAL-001", 4, (s, t) => { // price fall chart
  bg(s, BG);
  const st = once(s, () => {
    const svg = elNS("svg", { position: "absolute", left: "20px", right: "20px", top: "200px", width: "320px", height: "240px", viewBox: "0 0 320 240" });
    const line = elNS("polyline", { fill: "none", stroke: TEAL, strokeWidth: 7, strokeLinecap: "round" });
    svg.appendChild(line); s.appendChild(svg);
    const rows = ["1 Аукцион", "2 Повторные −10%", "3 Публичное предложение"].map((txt, i) => {
      const r = el("div", { position: "absolute", left: "24px", right: "24px", top: px(60 + i * 44), background: "rgba(255,255,255,0.09)", borderLeft: "5px solid #FFB020", borderRadius: "10px", padding: "8px 12px", fontWeight: 800, fontSize: "16px", color: WHITE, opacity: 0 });
      r.textContent = txt; s.appendChild(r); return r;
    });
    return { line, rows };
  });
  st.rows.forEach((r, i) => {
    const p = spr(seg(t, 0.25 + i * 0.55, 0.75 + i * 0.55));
    r.style.opacity = clamp(p * 2); r.style.transform = `translateX(${(1 - p) * 80}px)`;
  });
  const p = E.io(seg(t, 2.2, 3.6));
  const pts = [[0, 30], [64, 46], [128, 86], [192, 150], [256, 205], [320, 230]];
  const shown = pts.slice(0, Math.max(2, Math.ceil(p * pts.length)));
  st.line.setAttribute("points", shown.map(([x, y]) => `${x},${y}`).join(" "));
});
D("VSL-REAL-002", 4, (s, t) => { // checklist features
  center(s); bg(s, BG);
  const st = once(s, () => ({ items: ["Электронная подпись", "Задаток", "Заявка на площадке"].map((txt, i) => {
    const row = el("div", { width: "280px", margin: "12px 0", background: "rgba(255,255,255,0.09)", border: "1px solid rgba(255,255,255,0.16)", borderRadius: "16px", padding: "14px 18px", display: "flex", alignItems: "center", gap: "14px", opacity: 0 });
    const chk = el("div", { width: "36px", height: "36px", borderRadius: "10px", background: TEAL, color: "#04231F", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: "22px" }, "✓");
    row.appendChild(chk); row.appendChild(el("div", { fontWeight: 800, fontSize: "22px", color: WHITE }, txt));
    s.appendChild(row); return row;
  }) }));
  st.items.forEach((r, i) => {
    const p = spr(seg(t, 0.3 + i * 0.7, 1.0 + i * 0.7));
    r.style.opacity = clamp(p * 2); r.style.transform = `translateY(${(1 - p) * 50}px)`;
  });
});
D("VSL-REAL-003", 4, (s, t) => { // discount badge
  center(s); bg(s, BG);
  const st = once(s, () => ({ b: el("div", { background: AMBER, color: "#111", fontWeight: 900, fontSize: "44px", padding: "12px 30px", borderRadius: "16px", boxShadow: "0 12px 40px rgba(255,176,32,0.35)" }, "−50%") }));
  st.b.style.transform = `rotate(8deg) scale(${spr(seg(t, 0.3, 1.0))})`;
});
D("RVE-REAL-001", 4, (s, t) => { // comparison slider
  bg(s, BG);
  const st = once(s, () => {
    const w = el("div", { position: "absolute", left: "30px", right: "30px", top: "190px", bottom: "190px", borderRadius: "18px", overflow: "hidden", position: "absolute" });
    const after = el("div", { position: "absolute", inset: 0, background: "linear-gradient(135deg,#3E6349,#5B8C6B)" });
    const before = el("div", { position: "absolute", inset: 0, background: "linear-gradient(135deg,#634A3E,#8C5B5B)" });
    const handle = el("div", { position: "absolute", top: 0, bottom: 0, width: "4px", background: WHITE, left: "50%" });
    w.appendChild(after); w.appendChild(before); w.appendChild(handle);
    s.appendChild(w); return { before, handle, w };
  });
  const x = 20 + (Math.sin(t / 4 * Math.PI * 2) * 0.5 + 0.5) * 60;
  st.before.style.clipPath = `inset(0 ${100 - x}% 0 0)`;
  st.handle.style.left = `${x}%`;
});
D("RVE-REAL-002", 4, (s, t) => { // masonry gallery
  bg(s, BG);
  const st = once(s, () => {
    const g = el("div", { position: "absolute", left: "24px", right: "24px", top: "140px", bottom: "140px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" });
    const hts = [180, 130, 140, 190];
    const cells = hts.map((h, i) => { const c = el("div", { background: `linear-gradient(135deg, rgba(255,255,255,0.${8 + i}), rgba(90,107,140,0.9))`, borderRadius: "12px", height: px(h), opacity: 0 }); g.appendChild(c); return c; });
    s.appendChild(g); return { cells };
  });
  st.cells.forEach((c, i) => {
    const p = spr(seg(t, 0.25 + i * 0.3, 0.85 + i * 0.3));
    c.style.opacity = clamp(p * 2); c.style.transform = `translateY(${(1 - p) * 40}px)`;
  });
});
D("OML-REAL-001", 4, (s, t) => { // city skyline
  bg(s, "linear-gradient(180deg,#31435F 0%,#8C5B5B 40%,#16203A 100%)");
  const st = once(s, () => {
    const sky = el("div", { position: "absolute", left: 0, right: 0, bottom: 0, height: "300px" });
    const bl = [];
    for (let i = 0; i < 14; i++) {
      const w = 20 + rnd(i) * 30, h = 60 + rnd(i + 9) * 180;
      const b = el("div", { position: "absolute", bottom: 0, left: px(i * 26), width: px(w), height: px(h), background: "#0A1120" });
      for (let k = 0; k < 6; k++) { if (rnd(i * 9 + k) > 0.5) { const win = el("div", { position: "absolute", left: px(3 + (k % 2) * 9), top: px(8 + Math.floor(k / 2) * 16), width: "5px", height: "7px", background: AMBER, opacity: 0.8 }); b.appendChild(win); } }
      sky.appendChild(b); bl.push(b);
    }
    s.appendChild(sky); return { sky };
  });
  const dusk = seg(t, 0, 4);
  s.style.background = `linear-gradient(180deg, rgba(49,67,95,${1 - dusk}) 0%, rgba(140,91,91,${0.4 + dusk * 0.3}) 40%, #16203A 100%)`;
});

/* =======================================================================
   HOOK — хуки первых 3 секунд
======================================================================= */
D("VSL-HOOK-001", 4, (s, t) => { // hook punch headline
  center(s); bg(s, BG);
  const st = once(s, () => ({
    a: bigLine("КВАРТИРА", 56, WHITE, { textAlign: "center" }),
    b: bigLine("ЗА ПОЛЦЕНЫ", 56, AMBER, { textAlign: "center" }),
    badge: el("div", { position: "absolute", right: "40px", top: "150px", background: AMBER, color: "#111", fontWeight: 900, fontSize: "30px", padding: "8px 18px", borderRadius: "12px", transform: "rotate(8deg)", opacity: 0 }, "−50%"),
  }));
  const w = once(s, () => { const r = el("div", { textAlign: "center" }); r.appendChild(st.a); r.appendChild(st.b); s.appendChild(r); return r; });
  const zoom = 1 + t / 4 * 0.08;
  w.style.transform = `scale(${spr(seg(t, 0.15, 0.8)) * zoom})`;
  st.badge.style.opacity = clamp(spr(seg(t, 0.9, 1.5)) * 2);
  st.badge.style.transform = `rotate(8deg) scale(${spr(seg(t, 0.9, 1.5))})`;
});
D("RCE-HOOK-001", 4, (s, t) => { // shatter reveal
  bg(s, PHOTO);
  const st = once(s, () => ({ shards: Array.from({ length: 12 }, (_, i) => {
    const d = el("div", { position: "absolute", left: px(rnd(i) * 330 - 20), top: px(rnd(i + 50) * 610 - 20), width: px(60 + rnd(i + 3) * 60), height: px(50 + rnd(i + 7) * 70), background: "rgba(255,255,255,0.14)", clipPath: "polygon(0 0, 100% 20%, 70% 100%, 10% 80%)", opacity: 1 });
    s.appendChild(d); return d;
  }) }));
  const p = seg(t, 1.8, 2.6);
  st.shards.forEach((d, i) => {
    d.style.transform = `translate(${E.out(p) * (rnd(i) - 0.5) * 500}px, ${E.out(p) * (rnd(i + 20) - 0.5) * 700}px) rotate(${p * (rnd(i + 30) - 0.5) * 240}deg)`;
    d.style.opacity = 1 - p;
  });
});
D("RCE-HOOK-002", 4, (s, t) => { // glitch text
  center(s); bg(s, BG);
  const st = once(s, () => ({ a: bigLine("ИНТРИГА", 66, WHITE, { position: "relative" }) }));
  const g = rnd(Math.floor(t * 18)) > 0.75;
  st.a.style.transform = g ? `translate(${rnd(Math.floor(t * 90)) * 10 - 5}px, 0)` : "none";
  st.a.style.textShadow = g ? `-4px 0 rgba(255,45,149,0.8), 4px 0 rgba(45,212,191,0.8)` : "none";
  st.a.style.clipPath = g ? `inset(${rnd(Math.floor(t * 45)) * 40}% 0 ${rnd(Math.floor(t * 77)) * 40}% 0)` : "none";
});
D("RVE-HOOK-001", 4, (s, t) => { // glitch text rve
  center(s); bg(s, BG);
  const st = once(s, () => ({ a: bigLine("ЗА 3 ДНЯ", 62, WHITE, { position: "relative" }) }));
  const cyc = (t * 2) % 1;
  const g = cyc < 0.12;
  st.a.style.transform = g ? `translateX(${(rnd(Math.floor(t * 30)) - 0.5) * 16}px)` : "none";
  st.a.style.textShadow = g ? "6px 0 #FF2D95, -6px 0 #2DD4BF" : "0 0 30px rgba(255,255,255,0.2)";
});
D("RCE-HOOK-003", 4, (s, t) => { // fireworks burst
  bg(s, "#050208");
  const st = once(s, () => ({ parts: Array.from({ length: 40 }, (_, i) => {
    const d = el("div", { position: "absolute", left: "180px", top: "280px", width: "8px", height: "8px", borderRadius: "50%", background: i % 3 ? AMBER : TEAL, opacity: 0 });
    s.appendChild(d); return d;
  }) }));
  const cyc = (t % 2) / 2;
  st.parts.forEach((d, i) => {
    const a = rnd(i) * Math.PI * 2, r = E.out(cyc) * (60 + rnd(i + 5) * 140);
    d.style.transform = `translate(${Math.cos(a) * r}px, ${Math.sin(a) * r + cyc * cyc * 90}px)`;
    d.style.opacity = 1 - cyc;
  });
});
D("OML-HOOK-001", 4, (s, t) => { // channel intro sting
  center(s); bg(s, "#000");
  const st = once(s, () => ({ a: bigLine("СТУДИЯ", 72, WHITE, { letterSpacing: "10px" }) }));
  const p = seg(t, 0.2, 1.6);
  st.a.style.opacity = p * (1 - seg(t, 3.2, 3.8));
  st.a.style.transform = `scale(${0.8 + E.out(p) * 0.2})`;
  st.a.style.letterSpacing = px(10 + (1 - E.out(p)) * 40);
});
D("RVE-HOOK-002", 4, (s, t) => { // countdown intro
  center(s); bg(s, "#000");
  const st = once(s, () => ({ a: bigLine("3", 140, WHITE) }));
  const seq = ["3", "2", "1", "СМОТРИ"];
  const idx = Math.min(3, Math.floor(t / 4 * 4));
  st.a.textContent = seq[idx];
  const lp = (t / 4 * 4) % 1;
  st.a.style.transform = `scale(${1 + (1 - lp) * 0.4})`; st.a.style.opacity = 0.3 + lp * 0.7;
  st.a.style.color = idx === 3 ? AMBER : WHITE;
});

/* =======================================================================
   CTA — призывы к действию
======================================================================= */
D("VSL-CTA-001", 4, (s, t) => { // cta subscribe badge
  center(s); bg(s, BG);
  const st = once(s, () => ({ b: el("div", { background: AMBER, color: "#111", fontWeight: 900, fontSize: "46px", letterSpacing: "3px", padding: "16px 44px", borderRadius: "20px", boxShadow: "0 16px 60px rgba(255,176,32,0.45)" }, "ПОДПИШИСЬ") }));
  st.b.style.transform = `scale(${spr(seg(t, 0.4, 1.2))})`;
  const pulse = 1 + Math.sin(Math.max(0, t - 1.6) * 5) * 0.03;
  st.b.style.transform = `scale(${spr(seg(t, 0.4, 1.2)) * pulse})`;
});
D("RVE-CTA-001", 4, (s, t) => { // end card rve
  center(s); bg(s, "linear-gradient(180deg,#20304F,#0B1322)");
  const st = once(s, () => {
    const w = el("div", { textAlign: "center" });
    w.appendChild(bigLine("СМОТРЕТЬ ПОЛНЫЙ", 34, WHITE));
    w.appendChild(bigLine("РАЗБОР", 54, AMBER));
    const btn = el("div", { margin: "22px auto 0", width: "fit-content", padding: "12px 30px", borderRadius: "26px", background: AMBER, color: "#111", fontWeight: 900, fontSize: "20px" }, "Ссылка в описании");
    w.appendChild(btn); s.appendChild(w); return { w };
  });
  const p = spr(seg(t, 0.25, 1.0));
  st.w.style.opacity = clamp(p * 2); st.w.style.transform = `scale(${0.94 + p * 0.06})`;
});
D("RCE-CTA-001", 4, (s, t) => { // logo bounce drop
  center(s); bg(s, BG);
  const st = once(s, () => ({ l: el("div", { width: "120px", height: "120px", borderRadius: "28px", background: TEAL, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: "46px", color: "#04231F" }, "ВС") }));
  const fall = seg(t, 0.2, 0.75);
  const y = (1 - spr(fall)) * -420;
  st.l.style.transform = `translateY(${fall < 1 ? y : 0}px) scale(${fall >= 1 ? 1 + Math.sin((t - 0.75) * 12) * 0.06 * Math.exp(-(t - 0.75) * 5) : 1})`;
});
D("OML-CTA-001", 4, (s, t) => { // confetti burst
  center(s); bg(s, BG);
  const st = once(s, () => ({ a: bigLine("ПОЕХАЛИ!", 64, WHITE), conf: Array.from({ length: 36 }, (_, i) => {
    const d = el("div", { position: "absolute", width: "10px", height: "14px", background: [AMBER, TEAL, "#8A93FF", "#FF5E62"][i % 4], opacity: 0 });
    s.appendChild(d); return d;
  }) }));
  const w = once(s, () => { s.appendChild(st.a); return st.a; });
  st.a.style.transform = `scale(${spr(seg(t, 0.25, 0.95))})`;
  const cyc = (t % 2.4) / 2.4;
  st.conf.forEach((d, i) => {
    const x0 = 60 + rnd(i) * 240;
    d.style.left = px(x0 + Math.sin(cyc * 6 + i) * 20);
    d.style.top = px(-20 + cyc * 700 + rnd(i + 50) * 80);
    d.style.opacity = (1 - cyc) * 0.9;
    d.style.transform = `rotate(${cyc * 360 * (rnd(i + 3) > 0.5 ? 1 : -1)}deg)`;
  });
});

/* ---------- reference-only карточки (без кода) ---------- */
D("ALI-REF-001", 4, (s, t) => { refCard(s, t, "ALI-REF-001", "1000 шаблонов · лицензия не указана", "⚠️ только ссылка и описание — код не используется"); });
D("SKILLRY-REF-001", 4, (s, t) => { refCard(s, t, "SKILLRY-REF-001", "42 бесплатных скилла · лицензия не раскрыта", "⚠️ только ссылка и описание — код не используется"); });
function refCard(s, t, id, sub, warn) {
  center(s); bg(s, "linear-gradient(180deg,#231A2E,#120D18)");
  const st = once(s, () => {
    const w = el("div", { textAlign: "center", padding: "0 30px" });
    w.appendChild(el("div", { fontSize: "44px" }, "🔗"));
    w.appendChild(el("div", { fontWeight: 900, fontSize: "24px", color: WHITE, marginTop: "10px" }, id));
    w.appendChild(el("div", { fontSize: "16px", color: MUTED, marginTop: "8px" }, sub));
    w.appendChild(el("div", { marginTop: "14px", fontSize: "13px", color: "#FF9A9A" }, warn));
    s.appendChild(w); return { w };
  });
  st.w.style.opacity = 0.75 + Math.sin(t * 2) * 0.15;
}
