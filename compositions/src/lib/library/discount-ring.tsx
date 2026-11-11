import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { HEIGHT, palette, safe } from "../theme";

export type DiscountRingProps = {
  /** Процент заполнения кольца и число в центре. */
  percent?: number;
  title?: string;
  label?: string;
  disclaimer?: string;
  /** Начало/конец заполнения кольца, секунды. */
  ringStartSec?: number;
  ringEndSec?: number;
  size?: number;
  accent?: string;
};

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

/** Кольцо заполняется до N% (0.3–2.0 с), в центре count-up, внизу мелкий дисклеймер. Всего 3 с. */
export const DiscountRing: React.FC<DiscountRingProps> = ({
  percent = 35,
  title = "Средняя экономия на торгах",
  label = "ниже рынка",
  disclaimer = "по выборке лотов, условные данные",
  ringStartSec = 0.3,
  ringEndSec = 2.0,
  size = 720,
  accent = palette.accent,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const t = easeOutCubic(
    interpolate(frame, [ringStartSec * fps, ringEndSec * fps], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }),
  );
  const stroke = 48;
  const r = size / 2 - stroke;
  const circ = 2 * Math.PI * r;
  const filled = (percent / 100) * circ * t;
  const intro = spring({ frame, fps, config: { damping: 200 }, durationInFrames: 14 });
  const labelIn = spring({ frame: frame - ringEndSec * fps, fps, config: { damping: 200 }, durationInFrames: 12 });

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(160deg, ${palette.bg1} 0%, ${palette.bg0} 70%)`,
        justifyContent: "center",
        alignItems: "center",
        paddingLeft: safe.side,
        paddingRight: safe.side,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: safe.top + 140,
          left: safe.side,
          right: safe.side,
          fontFamily: "Arial Black, Arial, sans-serif",
          fontSize: 70,
          lineHeight: 1.12,
          color: palette.text,
          textAlign: "center",
          opacity: intro,
          transform: `translateY(${(1 - intro) * 20}px)`,
        }}
      >
        {title}
      </div>

      <div style={{ position: "relative", width: size, height: size, opacity: intro, transform: `scale(${0.92 + 0.08 * intro})` }}>
        <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.09)" strokeWidth={stroke} />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={accent}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={`${filled} ${circ}`}
            opacity={filled > 0.5 ? 1 : 0}
          />
        </svg>
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div
            style={{
              fontFamily: "Arial Black, Arial, sans-serif",
              fontSize: 210,
              lineHeight: 1,
              letterSpacing: "-6px",
              color: palette.text,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {Math.round(percent * t)}%
          </div>
          <div
            style={{
              marginTop: 18,
              fontFamily: "Arial, sans-serif",
              fontWeight: 700,
              fontSize: 46,
              color: accent,
              opacity: labelIn,
            }}
          >
            {label}
          </div>
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          top: HEIGHT - safe.bottom - 60,
          left: safe.side,
          right: safe.side,
          textAlign: "center",
          fontFamily: "Arial, sans-serif",
          fontSize: 28,
          color: "rgba(183,194,212,0.65)",
          opacity: labelIn,
        }}
      >
        {disclaimer}
      </div>
    </AbsoluteFill>
  );
};
