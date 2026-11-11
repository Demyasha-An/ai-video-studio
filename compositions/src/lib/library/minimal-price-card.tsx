import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { palette, safe, WIDTH } from "../theme";

export type MinimalPriceCardProps = {
  label?: string;
  oldPrice?: number;
  newPrice?: number;
  suffix?: string;
  /** Подпись дельты; если не задана — считается из цен. */
  delta?: string;
  note?: string;
  /** Кадр начала прорисовки линии зачёркивания. */
  strikeAt?: number;
  accent?: string;
};

const fmt = (n: number) => Math.round(n).toLocaleString("ru-RU").replace(/[\u00a0\u202f]/g, " ");

/** Карточка цены в духе швейцарского минимализма: старая цена зачёркивается тонкой линией, новая проявляется, аккуратная дельта. */
export const MinimalPriceCard: React.FC<MinimalPriceCardProps> = ({
  label = "Лот № 214 · 2-комн. квартира",
  oldPrice = 9800000,
  newPrice = 6370000,
  suffix = " ₽",
  delta,
  note = "Начальная цена на торгах",
  strikeAt = 22,
  accent = "#E2401C",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const ease = { damping: 200 };

  const card = spring({ frame, fps, config: ease, durationInFrames: 18 });
  const oldIn = spring({ frame: frame - 6, fps, config: ease, durationInFrames: 14 });
  const strike = interpolate(frame, [strikeAt, strikeAt + 14], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: (t) => 1 - Math.pow(1 - t, 3),
  });
  const newIn = spring({ frame: frame - strikeAt - 10, fps, config: ease, durationInFrames: 16 });
  const deltaIn = spring({ frame: frame - strikeAt - 24, fps, config: ease, durationInFrames: 14 });
  const pct = Math.round(((newPrice - oldPrice) / oldPrice) * 100);
  const deltaText = delta ?? `${pct < 0 ? "−" : "+"}${Math.abs(pct)}%`;
  const ink = "#111111";
  const grey = "#8A8A8A";
  const cardW = WIDTH - safe.side * 2 - 40;

  return (
    <AbsoluteFill
      style={{
        background: "#EDEBE6",
        justifyContent: "center",
        alignItems: "center",
        paddingLeft: safe.side,
        paddingRight: safe.side,
      }}
    >
      <div
        style={{
          width: cardW,
          background: "#FFFFFF",
          padding: "72px 64px 64px",
          boxShadow: "0 30px 80px rgba(0,0,0,0.08)",
          opacity: card,
          transform: `translateY(${(1 - card) * 40}px)`,
          fontFamily: "Helvetica, Arial, sans-serif",
          color: ink,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: 30, letterSpacing: "3px", textTransform: "uppercase", color: grey }}>Торги</div>
          <div style={{ width: 22, height: 22, background: accent }} />
        </div>
        <div style={{ height: 2, background: ink, margin: "28px 0 44px" }} />
        <div style={{ fontSize: 40, lineHeight: 1.25, fontWeight: 700 }}>{label}</div>

        <div style={{ marginTop: 70, fontSize: 30, color: grey }}>Рыночная цена</div>
        <div style={{ position: "relative", display: "inline-block", marginTop: 8, opacity: oldIn }}>
          <div style={{ fontSize: 72, color: grey, fontVariantNumeric: "tabular-nums", letterSpacing: "-1px" }}>
            {fmt(oldPrice)}
            {suffix}
          </div>
          <div
            style={{
              position: "absolute",
              left: -6,
              right: -6,
              top: "52%",
              height: 3,
              background: accent,
              transformOrigin: "left center",
              transform: `scaleX(${strike})`,
            }}
          />
        </div>

        <div style={{ marginTop: 50, fontSize: 30, color: grey, opacity: newIn }}>{note}</div>
        <div
          style={{
            marginTop: 8,
            fontSize: 132,
            fontWeight: 700,
            letterSpacing: "-4px",
            lineHeight: 1,
            fontVariantNumeric: "tabular-nums",
            opacity: newIn,
            transform: `translateY(${(1 - newIn) * 24}px)`,
          }}
        >
          {fmt(newPrice)}
          <span style={{ fontSize: 72, letterSpacing: 0 }}>{suffix}</span>
        </div>

        <div style={{ height: 1, background: "#D8D8D8", margin: "56px 0 30px" }} />
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            opacity: deltaIn,
          }}
        >
          <div style={{ fontSize: 30, color: grey }}>Разница</div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 24 }}>
            <div style={{ fontSize: 34, color: grey, fontVariantNumeric: "tabular-nums" }}>
              {fmt(newPrice - oldPrice).replace("-", "−")}
              {suffix}
            </div>
            <div style={{ fontSize: 56, fontWeight: 700, color: accent, fontVariantNumeric: "tabular-nums" }}>
              {deltaText}
            </div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
