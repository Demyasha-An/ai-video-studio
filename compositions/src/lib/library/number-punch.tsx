import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { palette, safe } from "../theme";

export type NumberPunchProps = {
  /** Части числа, каждая «влетает» отдельным ударом. */
  parts?: string[];
  kicker?: string;
  caption?: string;
  /** Интервал между ударами, секунды (≈0.25). */
  hitIntervalSec?: number;
  /** Кадр первого удара. */
  startFrame?: number;
  fontSize?: number;
  accent?: string;
};

/** Детерминированный псевдослучайный шум 0..1 для глитча (без Math.random). */
const noise = (n: number) => {
  const x = Math.sin(n * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
};

/** Крупные цифры «впечатываются» в кадр: удары каждые ~0.25 с, glitch-fade (RGB-сдвиг, мерцание) и сдвиг масштаба. */
export const NumberPunch: React.FC<NumberPunchProps> = ({
  parts = ["−", "3", "5", "%"],
  kicker = "скидка на торгах",
  caption = "от рыночной стоимости",
  hitIntervalSec = 0.25,
  startFrame = 6,
  fontSize = 300,
  accent = palette.accent,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const interval = hitIntervalSec * fps;
  const hitFrames = parts.map((_, i) => startFrame + Math.round(i * interval));
  const lastHit = hitFrames[hitFrames.length - 1];

  // Сдвиг масштаба всей группы: каждый удар даёт короткий толчок
  const groupBump = hitFrames.reduce((acc, hf) => {
    const d = frame - hf;
    if (d < 0 || d > 8) return acc;
    return acc + interpolate(d, [0, 2, 8], [0, 0.05, 0], { extrapolateRight: "clamp" });
  }, 0);
  const settle = interpolate(frame, [lastHit, lastHit + 60], [1, 1.04], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const shakeX = groupBump > 0 ? (noise(frame) - 0.5) * 18 * (groupBump / 0.05) : 0;

  const kickerIn = spring({ frame, fps, config: { damping: 200 }, durationInFrames: 12 });
  const captionIn = spring({ frame: frame - lastHit - 6, fps, config: { damping: 200 }, durationInFrames: 14 });

  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(circle at 50% 48%, ${palette.bg1} 0%, ${palette.bg0} 70%)`,
        justifyContent: "center",
        alignItems: "center",
        paddingLeft: safe.side,
        paddingRight: safe.side,
      }}
    >
      <div
        style={{
          fontFamily: "Arial, sans-serif",
          fontWeight: 700,
          fontSize: 44,
          letterSpacing: "6px",
          textTransform: "uppercase",
          color: palette.textMuted,
          marginBottom: 30,
          opacity: kickerIn,
        }}
      >
        {kicker}
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          transform: `translateX(${shakeX}px) scale(${(1 + groupBump) * settle})`,
        }}
      >
        {parts.map((p, i) => {
          const d = frame - hitFrames[i];
          const slam = spring({ frame: d, fps, config: { damping: 15, stiffness: 320, mass: 0.7 } });
          const scale = interpolate(slam, [0, 1], [2.4, 1]);
          const glitch = d >= 0 ? interpolate(d, [0, 7], [1, 0], { extrapolateRight: "clamp" }) : 0;
          const flicker = glitch > 0 ? (noise(d + i * 7) > 0.35 ? 1 : 0.35) : 1;
          const opacity = d < 0 ? 0 : Math.min(1, slam * 2) * flicker;
          const off = glitch * 22;
          const jitterY = glitch * (noise(d * 3 + i) - 0.5) * 30;
          return (
            <span
              key={i}
              style={{
                display: "inline-block",
                fontFamily: "Arial Black, Arial, sans-serif",
                fontSize,
                lineHeight: 1,
                letterSpacing: "-6px",
                color: i === parts.length - 1 ? accent : palette.text,
                fontVariantNumeric: "tabular-nums",
                opacity,
                transform: `translateY(${jitterY}px) scale(${scale})`,
                textShadow:
                  off > 0.5
                    ? `${off}px 0 rgba(255,40,80,0.85), ${-off}px 0 rgba(40,220,255,0.85)`
                    : "0 12px 40px rgba(0,0,0,0.45)",
              }}
            >
              {p}
            </span>
          );
        })}
      </div>
      <div
        style={{
          marginTop: 40,
          fontFamily: "Arial, sans-serif",
          fontWeight: 700,
          fontSize: 50,
          color: palette.text,
          textAlign: "center",
          opacity: captionIn,
          transform: `translateY(${(1 - captionIn) * 16}px)`,
        }}
      >
        {caption}
      </div>
    </AbsoluteFill>
  );
};
