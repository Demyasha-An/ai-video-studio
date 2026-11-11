import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { palette, safe } from "../theme";

export type HookPunchHeadlineProps = {
  lines?: string[];
  /** Индекс строки, выделенной акцентом (-1 — без выделения). */
  highlightIndex?: number;
  kicker?: string;
  /** Интервал между строками, кадры. */
  staggerFrames?: number;
  /** Насколько вырастает кадр за всю длительность (медленный зум). */
  zoomAmount?: number;
  fontSize?: number;
  accent?: string;
};

/** Хук-заголовок: строки «влетают» с punch-масштабом, весь кадр непрерывно медленно приближается. */
export const HookPunchHeadline: React.FC<HookPunchHeadlineProps> = ({
  lines = ["Квартира", "за полцены?", "Это реально"],
  highlightIndex = 1,
  kicker = "торги по банкротству",
  staggerFrames = 7,
  zoomAmount = 0.08,
  fontSize = 128,
  accent = palette.accent,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const zoom = interpolate(frame, [0, durationInFrames], [1, 1 + zoomAmount], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const kickerIn = spring({ frame, fps, config: { damping: 200 }, durationInFrames: 12 });

  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(circle at 50% 42%, ${palette.bg1} 0%, ${palette.bg0} 72%)`,
        justifyContent: "center",
        alignItems: "center",
        paddingLeft: safe.side,
        paddingRight: safe.side,
      }}
    >
      <div style={{ transform: `scale(${zoom})`, display: "flex", flexDirection: "column", alignItems: "center" }}>
        {kicker ? (
          <div
            style={{
              fontFamily: "Arial, sans-serif",
              fontWeight: 700,
              fontSize: 40,
              letterSpacing: "6px",
              textTransform: "uppercase",
              color: accent,
              marginBottom: 40,
              opacity: kickerIn,
            }}
          >
            {kicker}
          </div>
        ) : null}
        {lines.map((line, i) => {
          const s = spring({
            frame: frame - 4 - i * staggerFrames,
            fps,
            config: { damping: 13, stiffness: 170 },
          });
          const scale = interpolate(s, [0, 1], [1.5, 1]);
          const hl = i === highlightIndex;
          return (
            <div
              key={i}
              style={{
                fontFamily: "Arial Black, Arial, sans-serif",
                fontSize,
                lineHeight: 1.05,
                letterSpacing: "-3px",
                textAlign: "center",
                color: hl ? palette.dark : palette.text,
                background: hl ? accent : "transparent",
                padding: hl ? "4px 28px 12px" : "4px 0",
                borderRadius: 18,
                margin: "8px 0",
                opacity: Math.min(1, s * 1.4),
                transform: `translateY(${(1 - s) * 140}px) scale(${scale})`,
                textShadow: hl ? "none" : "0 8px 30px rgba(0,0,0,0.5)",
              }}
            >
              {line}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
