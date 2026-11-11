import React from "react";
import { AbsoluteFill, Img, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { HEIGHT, palette, safe, WIDTH } from "../theme";

export type RestatePriceRevealProps = {
  /** Фото объекта (staticFile(...) или URL). Без него — градиентный плейсхолдер со зданием. */
  imageSrc?: string;
  tag?: string;
  title?: string;
  address?: string;
  price?: number;
  area?: number;
  suffix?: string;
  /** Кадр начала выезда стеклянной плашки. */
  plateAt?: number;
  accent?: string;
};

const fmt = (n: number) => Math.round(n).toLocaleString("ru-RU").replace(/[\u00a0\u202f]/g, " ");
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

/** Плейсхолдер фото: небо-градиент и геометрический силуэт дома с окнами. */
const BuildingPlaceholder: React.FC = () => {
  const cols = 6;
  const rows = 12;
  return (
    <AbsoluteFill style={{ background: "linear-gradient(180deg, #2B4A7A 0%, #C98B5E 62%, #3A2A2A 100%)" }}>
      <div
        style={{
          position: "absolute",
          left: 190,
          width: 700,
          top: 380,
          bottom: 0,
          background: "linear-gradient(90deg, #1C2436 0%, #2A3550 55%, #1A2133 100%)",
          display: "grid",
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gridTemplateRows: `repeat(${rows}, 1fr)`,
          gap: 26,
          padding: 40,
        }}
      >
        {new Array(cols * rows).fill(0).map((_, i) => {
          const lit = Math.sin(i * 7.31) > 0.25;
          return <div key={i} style={{ background: lit ? "rgba(255,200,120,0.75)" : "rgba(255,255,255,0.08)" }} />;
        })}
      </div>
      <div style={{ position: "absolute", left: 0, width: 220, top: 900, bottom: 0, background: "#151B29" }} />
      <div style={{ position: "absolute", right: 0, width: 200, top: 760, bottom: 0, background: "#131826" }} />
    </AbsoluteFill>
  );
};

/** Фото объекта (или плейсхолдер) с медленным наездом и выезжающей стеклянной плашкой: цена на торгах и площадь. 4 с. */
export const RestatePriceReveal: React.FC<RestatePriceRevealProps> = ({
  imageSrc,
  tag = "Торги · лот № 214",
  title = "2-комнатная квартира",
  address = "Москва, ул. Профсоюзная",
  price = 6370000,
  area = 54,
  suffix = " ₽",
  plateAt = 18,
  accent = palette.accent,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const zoom = interpolate(frame, [0, durationInFrames], [1.0, 1.1], { extrapolateRight: "clamp" });
  const plate = spring({ frame: frame - plateAt, fps, config: { damping: 200 }, durationInFrames: 22 });
  const tagIn = spring({ frame: frame - 4, fps, config: { damping: 200 }, durationInFrames: 14 });
  const count = easeOutCubic(
    interpolate(frame, [plateAt + 8, plateAt + 44], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
  );
  const perM2 = area > 0 ? price / area : 0;
  const plateH = 500;

  return (
    <AbsoluteFill style={{ background: palette.bg0, overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `scale(${zoom})` }}>
        {imageSrc ? (
          <Img src={imageSrc} style={{ width: WIDTH, height: HEIGHT, objectFit: "cover" }} />
        ) : (
          <BuildingPlaceholder />
        )}
      </AbsoluteFill>
      <AbsoluteFill
        style={{ background: "linear-gradient(180deg, rgba(7,12,24,0.55) 0%, rgba(7,12,24,0) 30%, rgba(7,12,24,0.6) 100%)" }}
      />

      <div
        style={{
          position: "absolute",
          top: safe.top + 30,
          left: safe.side,
          padding: "14px 28px",
          borderRadius: 999,
          background: accent,
          color: palette.dark,
          fontFamily: "Arial, sans-serif",
          fontWeight: 700,
          fontSize: 36,
          opacity: tagIn,
          transform: `translateX(${(1 - tagIn) * -40}px)`,
        }}
      >
        {tag}
      </div>

      <div
        style={{
          position: "absolute",
          left: safe.side,
          right: safe.side,
          top: HEIGHT - safe.bottom - plateH,
          height: plateH,
          borderRadius: 40,
          padding: "48px 52px",
          boxSizing: "border-box",
          background: "rgba(255,255,255,0.14)",
          border: "2px solid rgba(255,255,255,0.28)",
          backdropFilter: "blur(28px) saturate(140%)",
          WebkitBackdropFilter: "blur(28px) saturate(140%)",
          boxShadow: "0 30px 80px rgba(0,0,0,0.35)",
          color: palette.text,
          fontFamily: "Arial, sans-serif",
          opacity: plate,
          transform: `translateY(${(1 - plate) * (plateH + safe.bottom)}px)`,
        }}
      >
        <div style={{ fontSize: 50, fontWeight: 700, lineHeight: 1.15 }}>{title}</div>
        <div style={{ fontSize: 32, color: "rgba(255,255,255,0.78)", marginTop: 10 }}>{address}</div>
        <div style={{ height: 2, background: "rgba(255,255,255,0.25)", margin: "34px 0 28px" }} />
        <div style={{ fontSize: 30, color: "rgba(255,255,255,0.78)" }}>Цена на торгах</div>
        <div
          style={{
            fontFamily: "Arial Black, Arial, sans-serif",
            fontSize: 104,
            lineHeight: 1.05,
            letterSpacing: "-3px",
            color: accent,
            fontVariantNumeric: "tabular-nums",
            textShadow: "0 4px 20px rgba(0,0,0,0.35)",
          }}
        >
          {fmt(price * count)}
          {suffix}
        </div>
        <div style={{ display: "flex", gap: 48, marginTop: 26, fontSize: 38, fontWeight: 700 }}>
          <div>
            {area} м²
          </div>
          <div style={{ color: "rgba(255,255,255,0.78)", fontVariantNumeric: "tabular-nums" }}>
            {fmt(perM2)}
            {suffix}/м²
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
