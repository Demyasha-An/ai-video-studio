import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { HEIGHT, palette, safe, WIDTH } from "../theme";

export type PriceFallStage = { label: string; price: number };

export type PriceFallChartProps = {
  title?: string;
  stages?: PriceFallStage[];
  suffix?: string;
  /** Кадр начала отрисовки кривой. */
  drawStart?: number;
  /** Длительность отрисовки кривой, кадры. */
  drawFrames?: number;
  accent?: string;
};

const fmt = (n: number) => Math.round(n).toLocaleString("ru-RU").replace(/[\u00a0\u202f]/g, " ");
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

const defaultStages: PriceFallStage[] = [
  { label: "1-е торги", price: 12500000 },
  { label: "2-е торги", price: 11250000 },
  { label: "Публичное предложение", price: 6900000 },
];

/** Три этапа торгов: кривая цены рисуется через strokeDashoffset, точки и подписи появляются по мере прохода линии. */
export const PriceFallChart: React.FC<PriceFallChartProps> = ({
  title = "Как падает цена на торгах",
  stages = defaultStages,
  suffix = " ₽",
  drawStart = 12,
  drawFrames = 60,
  accent = palette.accent,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const chartW = WIDTH - safe.side * 2; // 960
  const chartH = 760;
  const padX = 90;
  const padTop = 170;
  const padBottom = 170;
  const chartTop = 470;

  const max = Math.max(...stages.map((s) => s.price));
  const min = Math.min(...stages.map((s) => s.price));
  const lo = min * 0.75;
  const pts = stages.map((s, i) => {
    const x = padX + (i * (chartW - padX * 2)) / Math.max(1, stages.length - 1);
    const y = padTop + ((max - s.price) / (max - lo || 1)) * (chartH - padTop - padBottom);
    return { x, y };
  });

  const segLens = pts.slice(1).map((p, i) => Math.hypot(p.x - pts[i].x, p.y - pts[i].y));
  const total = segLens.reduce((a, b) => a + b, 0);
  const cumulative = [0, ...segLens.map((_, i) => segLens.slice(0, i + 1).reduce((a, b) => a + b, 0))];

  const t = easeOutCubic(
    interpolate(frame, [drawStart, drawStart + drawFrames], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }),
  );
  const drawn = t * total;
  const d = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const areaD = `${d} L ${pts[pts.length - 1].x} ${chartH - padBottom + 60} L ${pts[0].x} ${chartH - padBottom + 60} Z`;

  const titleIn = spring({ frame, fps, config: { damping: 200 }, durationInFrames: 16 });
  const first = stages[0].price;
  const last = stages[stages.length - 1].price;
  const deltaPct = Math.round(((last - first) / first) * 100);
  const deltaIn = spring({ frame: frame - (drawStart + drawFrames + 6), fps, config: { damping: 14 } });

  return (
    <AbsoluteFill style={{ background: `linear-gradient(160deg, ${palette.bg1} 0%, ${palette.bg0} 70%)` }}>
      <div
        style={{
          position: "absolute",
          top: safe.top + 80,
          left: safe.side,
          right: safe.side,
          fontFamily: "Arial Black, Arial, sans-serif",
          fontSize: 70,
          lineHeight: 1.1,
          color: palette.text,
          textAlign: "center",
          opacity: titleIn,
          transform: `translateY(${(1 - titleIn) * 20}px)`,
        }}
      >
        {title}
      </div>

      <svg
        width={chartW}
        height={chartH}
        style={{ position: "absolute", left: safe.side, top: chartTop, overflow: "visible" }}
      >
        <defs>
          <linearGradient id="pfc-area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={accent} stopOpacity={0.28} />
            <stop offset="100%" stopColor={accent} stopOpacity={0} />
          </linearGradient>
          <clipPath id="pfc-clip">
            <rect x={0} y={0} width={pts[0].x + t * (pts[pts.length - 1].x - pts[0].x)} height={chartH} />
          </clipPath>
        </defs>
        {[0, 1, 2, 3].map((i) => (
          <line
            key={i}
            x1={0}
            x2={chartW}
            y1={padTop + (i * (chartH - padTop - padBottom + 60)) / 3}
            y2={padTop + (i * (chartH - padTop - padBottom + 60)) / 3}
            stroke="rgba(255,255,255,0.08)"
            strokeWidth={2}
          />
        ))}
        <path d={areaD} fill="url(#pfc-area)" clipPath="url(#pfc-clip)" />
        <path
          d={d}
          fill="none"
          stroke={accent}
          strokeWidth={10}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={total}
          strokeDashoffset={total - drawn}
        />
        {pts.map((p, i) => {
          const reachFrame = drawStart + drawFrames * (1 - Math.cbrt(1 - cumulative[i] / (total || 1)));
          const pop = spring({ frame: frame - reachFrame, fps, config: { damping: 12, stiffness: 160 } });
          const above = i < pts.length - 1;
          const anchor = i === 0 ? "start" : i === pts.length - 1 ? "end" : "middle";
          const lx = i === 0 ? p.x - 40 : i === pts.length - 1 ? p.x + 40 : p.x;
          return (
            <g key={i} opacity={Math.min(1, pop * 1.5)}>
              <circle cx={p.x} cy={p.y} r={22 * pop} fill={palette.bg0} stroke={accent} strokeWidth={8} />
              <text
                x={lx}
                y={above ? p.y - 54 : p.y + 82}
                textAnchor={anchor}
                fontFamily="Arial Black, Arial, sans-serif"
                fontSize={44}
                fill={i === pts.length - 1 ? accent : palette.text}
                style={{ fontVariantNumeric: "tabular-nums" }}
              >
                {fmt(stages[i].price)}
                {suffix}
              </text>
              <text
                x={lx}
                y={above ? p.y - 110 : p.y + 130}
                textAnchor={anchor}
                fontFamily="Arial, sans-serif"
                fontSize={32}
                fill={palette.textMuted}
              >
                {stages[i].label}
              </text>
            </g>
          );
        })}
      </svg>

      <div
        style={{
          position: "absolute",
          top: chartTop + chartH + 80,
          left: safe.side,
          right: safe.side,
          display: "flex",
          justifyContent: "center",
          opacity: deltaIn,
          transform: `scale(${0.7 + 0.3 * deltaIn})`,
        }}
      >
        <div
          style={{
            padding: "18px 44px",
            borderRadius: 999,
            background: accent,
            color: palette.dark,
            fontFamily: "Arial Black, Arial, sans-serif",
            fontSize: 64,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {deltaPct < 0 ? "−" : "+"}
          {Math.abs(deltaPct)}%
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          top: HEIGHT - safe.bottom - 40,
          left: safe.side,
          right: safe.side,
          textAlign: "center",
          fontFamily: "Arial, sans-serif",
          fontSize: 24,
          color: "rgba(183,194,212,0.6)",
        }}
      >
        иллюстрация, условные данные
      </div>
    </AbsoluteFill>
  );
};
