import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { HEIGHT, palette, safe, WIDTH } from "../theme";

export type VerticalSafeLayoutProps = {
  /** Короткий заголовок над слотом контента (необязательно). */
  title?: string;
  /** Текст в зоне субтитров (необязательно). */
  caption?: string;
  /** Показывать оверлей безопасных зон (для отладки). */
  debug?: boolean;
  accent?: string;
  /** Высота зоны субтитров над нижней безопасной границей, px. */
  captionZoneHeight?: number;
  children?: React.ReactNode;
};

/** Каркас кадра Reels: прогресс-бар сверху, слот контента по центру, зона субтитров, оверлей safe-зон. */
export const VerticalSafeLayout: React.FC<VerticalSafeLayoutProps> = ({
  title = "Торги по банкротству",
  caption = "Здесь идут субтитры озвучки",
  debug = false,
  accent = palette.accent,
  captionZoneHeight = 240,
  children,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const progress = interpolate(frame, [0, durationInFrames - 1], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const intro = spring({ frame, fps, config: { damping: 200 }, durationInFrames: 16 });

  const contentTop = safe.top + 60 + (title ? 90 : 0);
  const captionTop = HEIGHT - safe.bottom - captionZoneHeight;
  const contentBottom = HEIGHT - captionTop + 20;

  return (
    <AbsoluteFill style={{ background: `linear-gradient(160deg, ${palette.bg1} 0%, ${palette.bg0} 70%)` }}>
      {/* Прогресс-бар */}
      <div
        style={{
          position: "absolute",
          top: safe.top - 36,
          left: safe.side,
          right: safe.side,
          height: 8,
          borderRadius: 4,
          background: "rgba(255,255,255,0.14)",
          overflow: "hidden",
        }}
      >
        <div style={{ width: `${progress * 100}%`, height: "100%", background: accent, borderRadius: 4 }} />
      </div>

      {title ? (
        <div
          style={{
            position: "absolute",
            top: safe.top + 20,
            left: safe.side,
            right: safe.side,
            fontFamily: "Arial, sans-serif",
            fontWeight: 700,
            fontSize: 48,
            color: palette.textMuted,
            textAlign: "center",
            opacity: intro,
            transform: `translateY(${(1 - intro) * 16}px)`,
          }}
        >
          {title}
        </div>
      ) : null}

      {/* Слот контента */}
      <div
        style={{
          position: "absolute",
          top: contentTop,
          bottom: contentBottom,
          left: safe.side,
          right: safe.side,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          opacity: intro,
        }}
      >
        {children ?? (
          <div
            style={{
              width: "100%",
              height: "100%",
              borderRadius: 32,
              border: "3px dashed rgba(183,194,212,0.35)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              fontFamily: "Arial, sans-serif",
              fontSize: 44,
              color: "rgba(183,194,212,0.6)",
            }}
          >
            слот контента
          </div>
        )}
      </div>

      {/* Зона субтитров */}
      {caption ? (
        <div
          style={{
            position: "absolute",
            top: captionTop,
            height: captionZoneHeight,
            left: safe.side,
            right: safe.side,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div
            style={{
              fontFamily: "Arial, sans-serif",
              fontWeight: 700,
              fontSize: 52,
              lineHeight: 1.22,
              color: palette.text,
              textAlign: "center",
              textShadow: "0 3px 10px rgba(0,0,0,0.85)",
            }}
          >
            {caption}
          </div>
        </div>
      ) : null}

      {debug ? <SafeZoneOverlay captionTop={captionTop} captionZoneHeight={captionZoneHeight} /> : null}
    </AbsoluteFill>
  );
};

const SafeZoneOverlay: React.FC<{ captionTop: number; captionZoneHeight: number }> = ({
  captionTop,
  captionZoneHeight,
}) => {
  const danger = "rgba(255,60,60,0.22)";
  const label: React.CSSProperties = {
    position: "absolute",
    fontFamily: "Arial, sans-serif",
    fontSize: 22,
    color: "rgba(255,140,140,0.95)",
  };
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div style={{ position: "absolute", top: 0, left: 0, width: WIDTH, height: safe.top, background: danger }} />
      <div
        style={{ position: "absolute", bottom: 0, left: 0, width: WIDTH, height: safe.bottom, background: danger }}
      />
      <div style={{ position: "absolute", top: 0, bottom: 0, left: 0, width: safe.side, background: danger }} />
      <div style={{ position: "absolute", top: 0, bottom: 0, right: 0, width: safe.side, background: danger }} />
      <div
        style={{
          position: "absolute",
          top: captionTop,
          height: captionZoneHeight,
          left: safe.side,
          right: safe.side,
          border: "2px dashed rgba(90,200,255,0.8)",
        }}
      />
      <div style={{ ...label, top: safe.top - 30, left: safe.side + 8 }}>safe top {safe.top}</div>
      <div style={{ ...label, top: HEIGHT - safe.bottom + 8, left: safe.side + 8 }}>
        safe bottom {safe.bottom}
      </div>
      <div style={{ ...label, top: captionTop + 6, left: safe.side + 10, color: "rgba(120,210,255,0.95)" }}>
        зона субтитров
      </div>
    </AbsoluteFill>
  );
};
