import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { palette, safe } from "../theme";

export type CtaSubscribeBadgeProps = {
  text?: string;
  subtext?: string;
  /** Кадр появления плашки. */
  startFrame?: number;
  /** Период мягкой пульсации после появления, кадры (0 — без пульсации). */
  pulsePeriod?: number;
  accent?: string;
};

/** CTA-плашка «Подпишись»: янтарная пилюля со spring-punch, затем мягкая пульсация и блик. */
export const CtaSubscribeBadge: React.FC<CtaSubscribeBadgeProps> = ({
  text = "Подпишись",
  subtext = "новые лоты каждый день",
  startFrame = 6,
  pulsePeriod = 36,
  accent = palette.accent,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const f = frame - startFrame;

  const punch = spring({ frame: f, fps, config: { damping: 8, stiffness: 180, mass: 0.8 } });
  const settled = f > 24;
  const pulse = settled && pulsePeriod > 0 ? 1 + 0.035 * Math.sin(((f - 24) / pulsePeriod) * Math.PI * 2) : 1;
  const shine = interpolate(f, [18, 40], [-40, 140], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const subIn = spring({ frame: f - 12, fps, config: { damping: 200 }, durationInFrames: 14 });

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
          position: "relative",
          overflow: "hidden",
          padding: "40px 90px 46px",
          borderRadius: 999,
          background: accent,
          boxShadow: "0 24px 70px rgba(255,176,32,0.35)",
          transform: `scale(${(f < 0 ? 0 : punch) * pulse})`,
          display: "flex",
          alignItems: "center",
          gap: 30,
        }}
      >
        <svg width={64} height={64} viewBox="0 0 64 64">
          <path
            d="M32 8 a6 6 0 0 1 6 6 v2 a16 16 0 0 1 10 15 v11 l6 6 v2 H10 v-2 l6 -6 V31 a16 16 0 0 1 10 -15 v-2 a6 6 0 0 1 6 -6 Z M25 52 h14 a7 7 0 0 1 -14 0 Z"
            fill={palette.dark}
          />
        </svg>
        <div
          style={{
            fontFamily: "Arial Black, Arial, sans-serif",
            fontSize: 92,
            letterSpacing: "-2px",
            color: palette.dark,
            lineHeight: 1,
          }}
        >
          {text}
        </div>
        <div
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: `${shine}%`,
            width: "18%",
            background: "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.55) 50%, rgba(255,255,255,0) 100%)",
            transform: "skewX(-20deg)",
          }}
        />
      </div>
      <div
        style={{
          marginTop: 50,
          fontFamily: "Arial, sans-serif",
          fontWeight: 700,
          fontSize: 46,
          color: palette.textMuted,
          textAlign: "center",
          opacity: subIn,
          transform: `translateY(${(1 - subIn) * 16}px)`,
        }}
      >
        {subtext}
      </div>
    </AbsoluteFill>
  );
};
