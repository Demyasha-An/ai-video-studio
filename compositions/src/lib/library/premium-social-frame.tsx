import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { HEIGHT, palette, safe } from "../theme";

export type PremiumSocialFrameProps = {
  handle?: string;
  kicker?: string;
  /** Крупный числовой акцент. */
  value?: string;
  caption?: string;
  /** Длина петли, секунды (4 с); кадр N и N+loop выглядят одинаково. */
  loopSec?: number;
  accent?: string;
};

/** Премиальная вертикальная рамка: прогресс сверху, safe-зоны, крупный числовой акцент. Бесшовная петля 4 с. */
export const PremiumSocialFrame: React.FC<PremiumSocialFrameProps> = ({
  handle = "@neirostudio",
  kicker = "Экономия на торгах",
  value = "−35%",
  caption = "столько в среднем сэкономили покупатели",
  loopSec = 4,
  accent = palette.accent,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const loop = Math.max(1, Math.round(loopSec * fps));
  const f = frame % loop;
  const phase = f / loop;

  const progress = interpolate(f, [0, loop - 1], [0, 1], { extrapolateRight: "clamp" });
  const enter = spring({ frame: f, fps, config: { damping: 200 }, durationInFrames: 16 });
  const valueIn = spring({ frame: f - 6, fps, config: { damping: 13, stiffness: 160 } });
  const exit = interpolate(f, [loop - 12, loop - 1], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const vis = enter * exit;
  const angle = 150 + 20 * Math.sin(phase * Math.PI * 2);
  const glowX = 50 + 18 * Math.cos(phase * Math.PI * 2);
  const breathe = 1 + 0.015 * Math.sin(phase * Math.PI * 2);

  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(circle at ${glowX}% 46%, rgba(255,176,32,0.16) 0%, rgba(255,176,32,0) 45%), linear-gradient(${angle}deg, ${palette.bg1} 0%, ${palette.bg0} 72%)`,
      }}
    >
      {/* Рамка по safe-зонам */}
      <div
        style={{
          position: "absolute",
          top: safe.top,
          bottom: safe.bottom,
          left: safe.side,
          right: safe.side,
          border: "2px solid rgba(255,255,255,0.12)",
          borderRadius: 36,
        }}
      />
      {/* Прогресс */}
      <div
        style={{
          position: "absolute",
          top: safe.top + 36,
          left: safe.side + 40,
          right: safe.side + 40,
          height: 6,
          borderRadius: 3,
          background: "rgba(255,255,255,0.14)",
          overflow: "hidden",
        }}
      >
        <div style={{ width: `${progress * 100}%`, height: "100%", background: accent }} />
      </div>
      <div
        style={{
          position: "absolute",
          top: safe.top + 72,
          left: safe.side + 40,
          right: safe.side + 40,
          display: "flex",
          justifyContent: "space-between",
          fontFamily: "Arial, sans-serif",
          fontSize: 32,
          color: palette.textMuted,
          opacity: vis,
        }}
      >
        <span style={{ fontWeight: 700, color: palette.text }}>{handle}</span>
        <span>торги · недвижимость</span>
      </div>

      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", paddingLeft: safe.side + 40, paddingRight: safe.side + 40 }}>
        <div
          style={{
            fontFamily: "Arial, sans-serif",
            fontWeight: 700,
            fontSize: 44,
            letterSpacing: "5px",
            textTransform: "uppercase",
            color: accent,
            opacity: vis,
            transform: `translateY(${(1 - enter) * 20}px)`,
            textAlign: "center",
          }}
        >
          {kicker}
        </div>
        <div
          style={{
            marginTop: 20,
            fontFamily: "Arial Black, Arial, sans-serif",
            fontSize: 300,
            lineHeight: 1,
            letterSpacing: "-10px",
            color: palette.text,
            fontVariantNumeric: "tabular-nums",
            opacity: Math.min(1, valueIn * 1.3) * exit,
            transform: `scale(${interpolate(valueIn, [0, 1], [0.6, 1]) * breathe})`,
            textShadow: "0 20px 60px rgba(0,0,0,0.5)",
          }}
        >
          {value}
        </div>
        <div style={{ width: 120, height: 6, background: accent, borderRadius: 3, margin: "40px 0", opacity: vis, transform: `scaleX(${enter})` }} />
        <div
          style={{
            fontFamily: "Arial, sans-serif",
            fontWeight: 700,
            fontSize: 48,
            lineHeight: 1.25,
            color: palette.text,
            textAlign: "center",
            opacity: vis,
          }}
        >
          {caption}
        </div>
      </AbsoluteFill>

      <div
        style={{
          position: "absolute",
          top: HEIGHT - safe.bottom - 70,
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
