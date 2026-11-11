/**
 * draft-render.mjs — браузерless драфт-рендер video-studio.
 * Спецификация сцены (JSON) → ffmpeg filtergraph → MP4 за секунды.
 *
 * Использование:
 *   node tools/draft-render.mjs <spec.json> <out.mp4> [--nvenc|--amf|--qsv] [--crf 20]
 *
 * Спецификация (см. tools/draft-refcompare.spec.json):
 * {
 *   width, height, fps, duration,
 *   background: { c0, c1 },                    // градиент
 *   elements: [
 *     { type:"label", text, x, y, size, color, in, fade?, align?:"center" },
 *     { type:"count", value, x, y, size, color, in, dur, suffix?, prefix?, align? }, // count-up число
 *     { type:"bar",   x, y, w, h, color, in, dur, scale? },  // растущая полоса (scale = конечная доля w)
 *     { type:"progress" },                        // прогресс-бар сверху (весь таймлайн)
 *     { type:"text",  text, ... }                 // статичный текст = label
 *   ],
 *   audio?: "path/to/voice.wav"
 * }
 *
 * Грабли ffmpeg 9 (учтены): значения с ':'/'%' в тексте — только через textfile=;
 * шрифты — пути без двоеточий (tools/arialbd.ttf); запятые в inline-выражениях экранируются '\,'.
 * © video-studio, MIT.
 */
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const args = process.argv.slice(2);
const specPath = args[0];
const outPath = args[1];
const useNvenc = args.includes("--nvenc");
const useAmf = args.includes("--amf");
const useQsv = args.includes("--qsv");
const crfIdx = args.indexOf("--crf");
const crf = crfIdx >= 0 ? args[crfIdx + 1] : "20";
if (!specPath || !outPath) {
  console.error("usage: node tools/draft-render.mjs <spec.json> <out.mp4> [--nvenc|--amf|--qsv] [--crf N]");
  process.exit(1);
}

const spec = JSON.parse(fs.readFileSync(specPath, "utf-8").replace(/^\uFEFF/, ""));
const W = spec.width, H = spec.height, FPS = spec.fps ?? 30, D = spec.duration;
const ROOT = process.cwd();

// Кроссплатформенный шрифт: относительный путь (ffmpeg 9 парсер рвёт ':' в fontfile)
function pickFont(bold) {
  const candidates = [
    process.env.DRAFT_FONT,
    `tools/fonts/${bold ? "arialbd" : "arial"}.ttf`,
    `tools/fonts/DejaVuSans${bold ? "-Bold" : ""}.ttf`,
    bold ? "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf" : "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
    bold ? "/usr/share/fonts/TTF/DejaVuSans-Bold.ttf" : "/usr/share/fonts/TTF/DejaVuSans.ttf",
  ].filter(Boolean);
  for (const c of candidates) { try { if (fs.existsSync(c)) return c.replaceAll("\\", "/"); } catch {} }
  return `tools/fonts/${bold ? "arialbd" : "arial"}.ttf`; // пусть ffmpeg покажет понятную ошибку
}
const FONT_B = pickFont(true);
const FONT_R = pickFont(false);

// временные textfile'ы — slug-безопасно, в отдельной папке
fs.mkdirSync(path.join(ROOT, "renders"), { recursive: true });
const tmpDir = fs.mkdtempSync(path.join(ROOT, "renders", "draft-tmp-"));
let tfCount = 0;

const ease = (el) => {
  // ease-out cubic в выражениях ffmpeg; in/dur по умолчанию
  const i = el.in ?? 0, d = el.dur ?? 0.8;
  return `1-pow(1-min(max((t-${i})/${d}\\,0)\\,1)\\,3)`;
};
const num = (v) => v; // координаты уже в px

function writeTextfile(content) {
  tfCount += 1;
  const p = path.join(tmpDir, `t${tfCount}.txt`);
  fs.writeFileSync(p, content, "utf-8");
  // ПУТЬ БЕЗ ДВОЕТОЧИЙ: ffmpeg 9 парсер рвёт значение на 'D:' — только относительные пути
  return path.relative(ROOT, p).replaceAll("\\", "/");
}

function hex(c) { return c.replace("#", "0x"); }

function textFilter(el, out, idx) {
  const font = el.bold === false ? FONT_R : FONT_B;
  const size = el.size ?? 44;
  const color = hex(el.color ?? "#FFFFFF");
  const x = el.align === "center" ? "(w-text_w)/2" : (el.x ?? 80);
  const y = el.y ?? 80;
  let textExpr = "";
  if (el.type === "count") {
    const i = el.in ?? 0, d = el.dur ?? 1.0;
    const val = `trunc(${el.value}*min(max((t-${i})/${d}\\,0)\\,1))`;
    // суффикс/префикс — экранируем только литеральный %, eif-шаблон не трогаем
    const p = (el.prefix ?? "").replaceAll("%", "\\%");
    const s = (el.suffix ?? "").replaceAll("%", "\\%");
    textExpr = `${p}%{eif:${val}:d}${s}`;
  } else {
    textExpr = (el.text ?? "").replaceAll("%", "\\%");
  }
  const tf = writeTextfile(textExpr);
  const inA = el.in ? `min(max((t-${el.in})/0.25\\,0)\\,1)` : "1";
  const fade = el.fade ?? 0;
  const outA = fade ? `*(1-min(max((t-${D - fade})/${fade}\\,0)\\,1))` : "";
  return `drawtext=fontfile=${font}:textfile=${tf}:fontcolor=${color}:fontsize=${size}:x=${x}:y=${y}:alpha='${inA}${outA}'${out}`;
}

function barFilter(el, out) {
  const w = Math.round((el.w ?? 900) * (el.scale ?? 1));
  const g = ease(el);
  return `drawbox=x=${el.x ?? 70}:y=${el.y ?? 500}:w='${w}*${g}':h=${el.h ?? 110}:color=${hex(el.color ?? "#5A6B8C")}@1:t=fill${out}`;
}

function progressFilter(out) {
  const g = `min(t/${D}\\,1)`;
  return `drawbox=x=30:y=46:w=${W - 60}:h=5:color=0xFFFFFF@0.12:t=fill,drawbox=x=30:y=46:w='${W - 60}*${g}':h=5:color=0xFFB020@1:t=fill${out}`;
}

const chains = [];
let prev = "base";
chains.push(`gradients=s=${W}x${H}:c0=${hex(spec.background?.c0 ?? "#15223D")}:c1=${hex(spec.background?.c1 ?? "#070C18")}:duration=${D}:speed=0.01[base]`);

let idx = 0;
for (const el of spec.elements ?? []) {
  const out = `[e${idx}]`;
  const prevL = `[${prev}]`;
  let f = null;
  if (el.type === "bar") f = barFilter(el, out);
  else if (el.type === "count" || el.type === "label" || el.type === "text") f = textFilter(el, out, idx);
  else if (el.type === "progress") f = progressFilter(out);
  if (f) chains.push(`${prevL}${f}`);
  prev = `e${idx}`;
  idx += 1;
}
chains.push(`[${prev}]format=yuv420p[vout]`);
const graph = chains.join(";\n");

// график + параметры
const filterArg = graph;
const encArgs = useNvenc
  ? ["-c:v", "h264_nvenc", "-preset", "p4", "-rc", "vbr", "-cq", crf, "-b:v", "0", "-spatial-aq", "1"]
  : useAmf
  ? ["-c:v", "h264_amf", "-quality", "speed", "-b:v", "10M"]
  : useQsv
  ? ["-c:v", "h264_qsv", "-preset", "veryfast", "-global_quality", crf]
  : ["-c:v", "libx264", "-preset", "veryfast", "-crf", crf];
const encName = useNvenc ? "h264_nvenc" : useAmf ? "h264_amf" : useQsv ? "h264_qsv" : "libx264";

const inputArgs = ["-f", "lavfi", "-i", `gradients=duration=${D}`];
if (spec.audio) inputArgs.push("-i", spec.audio);

const mapArgs = ["-map", "[vout]"];
if (spec.audio) mapArgs.push("-map", "1:a", "-shortest");

const out = execFileSync("ffmpeg", [
  "-y", "-v", "error",
  "-filter_complex", filterArg,
  ...inputArgs,
  ...mapArgs,
  "-r", String(FPS),
  ...encArgs,
  "-pix_fmt", "yuv420p",
  "-c:a", "aac", "-b:a", "192k",
  outPath,
], { stdio: ["ignore", "ignore", "pipe"], cwd: ROOT, shell: false });

fs.rmSync(tmpDir, { recursive: true, force: true });
console.log(`[draft] ${outPath} — OK (${spec.elements?.length ?? 0} элементов, ${D}s, ${encName})`);
