import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { palette, safe, WIDTH } from "../theme";

export type CaptionBarProps = {
  text: string;
  /** Кадр появления строки (локальный кадр Sequence). */
  startFrame?: number;
  /** Кадр исчезновения строки. */
  endFrame?: number;
  /** Вертикальный центр строки, px (по умолчанию ≈1540 — над зоной интерфейса). */
  y?: number;
  fontSize?: number;
  fadeFrames?: number;
  /** Рисовать фон-градиент (для превью); для оверлея поверх видео — false. */
  withBackdrop?: boolean;
};

/** Строка субтитров 9:16: плавный fade-in/out, лёгкий подъём, тень и подложка для читаемости. */
export const CaptionBar: React.FC<CaptionBarProps> = ({
  text,
  startFrame = 0,
  endFrame = 90,
  y = 1540,
  fontSize = 54,
  fadeFrames = 8,
  withBackdrop = true,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enter = spring({ frame: frame - startFrame, fps, config: { damping: 200 }, durationInFrames: fadeFrames + 4 });
  const exit = interpolate(frame, [endFrame - fadeFrames, endFrame], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const visible = frame >= startFrame && frame < endFrame;
  const opacity = visible ? enter * exit : 0;

  return (
    <AbsoluteFill
      style={{
        background: withBackdrop ? `linear-gradient(160deg, ${palette.bg1} 0%, ${palette.bg0} 70%)` : "transparent",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: safe.side,
          right: safe.side,
          top: y,
          transform: `translateY(-50%) translateY(${(1 - enter) * 14}px)`,
          display: "flex",
          justifyContent: "center",
          opacity,
        }}
      >
        <div
          style={{
            maxWidth: WIDTH - safe.side * 2,
            padding: "18px 32px",
            borderRadius: 18,
            background: "rgba(7,12,24,0.55)",
            fontFamily: "Arial, sans-serif",
            fontWeight: 700,
            fontSize,
            lineHeight: 1.22,
            color: palette.text,
            textAlign: "center",
            textShadow: "0 3px 10px rgba(0,0,0,0.85), 0 0 2px rgba(0,0,0,0.9)",
          }}
        >
          {text}
        </div>
      </div>
    </AbsoluteFill>
  );
};
