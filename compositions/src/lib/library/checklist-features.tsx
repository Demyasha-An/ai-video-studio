import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { palette, safe } from "../theme";

export type ChecklistFeaturesProps = {
  title?: string;
  items?: string[];
  /** Кадр появления первого пункта. */
  startFrame?: number;
  /** Интервал между пунктами, кадры. */
  staggerFrames?: number;
  accent?: string;
};

/** Чек-лист: пункты появляются один за другим, галочка дорисовывается через strokeDashoffset. */
export const ChecklistFeatures: React.FC<ChecklistFeaturesProps> = ({
  title = "Что проверить перед торгами",
  items = ["Выписка из ЕГРН", "Обременения и аресты", "Прописанные жильцы", "Долги за ЖКУ", "Отчёт об оценке"],
  startFrame = 14,
  staggerFrames = 12,
  accent = palette.accent,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const titleIn = spring({ frame, fps, config: { damping: 200 }, durationInFrames: 16 });
  const checkLen = 60;

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(160deg, ${palette.bg1} 0%, ${palette.bg0} 70%)`,
        paddingTop: safe.top + 80,
        paddingBottom: safe.bottom + 40,
        paddingLeft: safe.side + 20,
        paddingRight: safe.side + 20,
        justifyContent: "center",
      }}
    >
      <div
        style={{
          fontFamily: "Arial Black, Arial, sans-serif",
          fontSize: 68,
          lineHeight: 1.1,
          color: palette.text,
          marginBottom: 70,
          opacity: titleIn,
          transform: `translateY(${(1 - titleIn) * 20}px)`,
        }}
      >
        {title}
      </div>
      {items.map((item, i) => {
        const at = startFrame + i * staggerFrames;
        const row = spring({ frame: frame - at, fps, config: { damping: 200 }, durationInFrames: 14 });
        const box = spring({ frame: frame - at - 4, fps, config: { damping: 11, stiffness: 180 } });
        const draw = interpolate(frame, [at + 6, at + 16], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        return (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 36,
              marginBottom: 44,
              opacity: row,
              transform: `translateX(${(1 - row) * -60}px)`,
            }}
          >
            <div
              style={{
                flexShrink: 0,
                width: 84,
                height: 84,
                borderRadius: 22,
                background: accent,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                transform: `scale(${box})`,
              }}
            >
              <svg width={56} height={56} viewBox="0 0 56 56">
                <path
                  d="M 12 29 L 24 41 L 45 16"
                  fill="none"
                  stroke={palette.dark}
                  strokeWidth={8}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray={checkLen}
                  strokeDashoffset={checkLen * (1 - draw)}
                />
              </svg>
            </div>
            <div
              style={{
                fontFamily: "Arial, sans-serif",
                fontWeight: 700,
                fontSize: 54,
                lineHeight: 1.15,
                color: palette.text,
              }}
            >
              {item}
            </div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
