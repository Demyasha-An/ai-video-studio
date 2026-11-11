import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { FPS, HEIGHT, palette, safe, WIDTH } from "../theme";

export type StatCounterProps = {
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  durationInSeconds?: number;
  accent?: string;
};

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

/** Счётчик KPI: число «набегает» с easing-out, подпись появляется первой. */
export const StatCounter: React.FC<StatCounterProps> = ({
  label,
  value,
  prefix = "",
  suffix = "",
  durationInSeconds = 1.4,
  accent = palette.accent,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const labelIn = spring({ frame, fps, config: { damping: 200 }, durationInFrames: 14 });
  const counterFrames = Math.round(durationInSeconds * FPS);
  const t = interpolate(frame, [8, 8 + counterFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const shown = Math.round(value * easeOutCubic(t));
  const formatted = shown.toLocaleString("ru-RU").replace(/\u00a0/g, " ");

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
          fontFamily: "Arial, sans-serif",
          fontSize: 46,
          color: palette.textMuted,
          opacity: labelIn,
          transform: `translateY(${(1 - labelIn) * 18}px)`,
          marginBottom: 26,
          textAlign: "center",
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: "Arial Black, Arial, sans-serif",
          fontSize: 148,
          lineHeight: 1,
          color: accent,
          letterSpacing: "-2px",
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {prefix}
        {formatted}
        {suffix}
      </div>
      <div
        style={{
          marginTop: 40,
          width: Math.min(WIDTH - safe.side * 2, 840),
          height: 8,
          borderRadius: 4,
          background: "rgba(255,255,255,0.12)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${easeOutCubic(t) * 100}%`,
            height: "100%",
            background: accent,
          }}
        />
      </div>
      <div
        style={{
          position: "absolute",
          bottom: HEIGHT - safe.bottom + 40,
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
