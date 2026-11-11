import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { palette, safe } from "../theme";

export type DiscountBadgeProps = {
  text?: string;
  caption?: string;
  /** Итоговый угол поворота, градусы. */
  rotation?: number;
  /** Кадр появления бейджа. */
  startFrame?: number;
  size?: number;
  accent?: string;
};

/** Повёрнутый круглый бейдж «−50%»: spring-«шлепок» с перелётом, медленно вращающийся пунктирный обод. */
export const DiscountBadge: React.FC<DiscountBadgeProps> = ({
  text = "−50%",
  caption = "от рыночной цены",
  rotation = -12,
  startFrame = 6,
  size = 640,
  accent = palette.accent,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const f = frame - startFrame;

  const pop = spring({ frame: f, fps, config: { damping: 9, stiffness: 140, mass: 0.9 } });
  const angle = interpolate(pop, [0, 1], [rotation - 40, rotation]);
  const ringSpin = frame * 0.6;
  const captionIn = spring({ frame: f - 14, fps, config: { damping: 200 }, durationInFrames: 14 });

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
          width: size,
          height: size,
          transform: `scale(${f < 0 ? 0 : pop}) rotate(${angle}deg)`,
        }}
      >
        <svg
          width={size}
          height={size}
          style={{ position: "absolute", inset: 0, transform: `rotate(${ringSpin}deg)` }}
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={size / 2 - 8}
            fill="none"
            stroke={accent}
            strokeWidth={6}
            strokeDasharray="18 16"
          />
        </svg>
        <div
          style={{
            position: "absolute",
            inset: 34,
            borderRadius: "50%",
            background: accent,
            boxShadow: "0 30px 80px rgba(0,0,0,0.45)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            fontFamily: "Arial Black, Arial, sans-serif",
            fontSize: size * 0.3,
            letterSpacing: "-4px",
            color: palette.dark,
          }}
        >
          {text}
        </div>
      </div>
      <div
        style={{
          marginTop: 70,
          fontFamily: "Arial, sans-serif",
          fontWeight: 700,
          fontSize: 54,
          color: palette.text,
          textAlign: "center",
          opacity: captionIn,
          transform: `translateY(${(1 - captionIn) * 20}px)`,
        }}
      >
        {caption}
      </div>
    </AbsoluteFill>
  );
};
