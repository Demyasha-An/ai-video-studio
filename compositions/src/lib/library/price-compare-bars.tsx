import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { HEIGHT, palette, safe, WIDTH } from "../theme";

export type PriceCompareBarsProps = {
  title?: string;
  marketLabel?: string;
  marketValue?: number;
  auctionLabel?: string;
  auctionValue?: number;
  suffix?: string;
  /** Подпись дельты; если не задана — считается из значений (например «−35%»). */
  delta?: string;
  /** Начало/конец роста полос, секунды. */
  barsStartSec?: number;
  barsEndSec?: number;
  /** Момент появления дельты, секунды. */
  deltaAtSec?: number;
  accent?: string;
};

const fmt = (n: number) => Math.round(n).toLocaleString("ru-RU").replace(/[\u00a0\u202f]/g, " ");
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

/** Две горизонтальные полосы (рынок vs торги) с count-up и дельтой. Тайминг: полосы 0.3–1.8 с, дельта 2.2 с, всего 4 с. */
export const PriceCompareBars: React.FC<PriceCompareBarsProps> = ({
  title = "Рынок против торгов",
  marketLabel = "Рыночная цена",
  marketValue = 9800000,
  auctionLabel = "Цена на торгах",
  auctionValue = 6370000,
  suffix = " ₽",
  delta,
  barsStartSec = 0.3,
  barsEndSec = 1.8,
  deltaAtSec = 2.2,
  accent = palette.accent,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const t = easeOutCubic(
    interpolate(frame, [barsStartSec * fps, barsEndSec * fps], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }),
  );
  const max = Math.max(marketValue, auctionValue);
  const trackW = WIDTH - safe.side * 2;
  const titleIn = spring({ frame, fps, config: { damping: 200 }, durationInFrames: 14 });
  const deltaIn = spring({ frame: frame - deltaAtSec * fps, fps, config: { damping: 12, stiffness: 170 } });
  const pct = Math.round(((auctionValue - marketValue) / marketValue) * 100);
  const deltaText = delta ?? `${pct < 0 ? "−" : "+"}${Math.abs(pct)}%`;

  const rows = [
    { label: marketLabel, value: marketValue, color: palette.accent2, valueColor: palette.text },
    { label: auctionLabel, value: auctionValue, color: accent, valueColor: accent },
  ];

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(160deg, ${palette.bg1} 0%, ${palette.bg0} 70%)`,
        paddingLeft: safe.side,
        paddingRight: safe.side,
        justifyContent: "center",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: safe.top + 120,
          left: safe.side,
          right: safe.side,
          fontFamily: "Arial Black, Arial, sans-serif",
          fontSize: 76,
          lineHeight: 1.1,
          color: palette.text,
          textAlign: "center",
          opacity: titleIn,
          transform: `translateY(${(1 - titleIn) * 20}px)`,
        }}
      >
        {title}
      </div>

      {rows.map((r, i) => {
        const rowIn = spring({ frame: frame - i * 4, fps, config: { damping: 200 }, durationInFrames: 12 });
        return (
          <div key={i} style={{ marginBottom: 90, opacity: rowIn }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
                marginBottom: 22,
              }}
            >
              <div style={{ fontFamily: "Arial, sans-serif", fontSize: 44, color: palette.textMuted }}>{r.label}</div>
              <div
                style={{
                  fontFamily: "Arial Black, Arial, sans-serif",
                  fontSize: 64,
                  color: r.valueColor,
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {fmt(r.value * t)}
                {suffix}
              </div>
            </div>
            <div
              style={{
                width: trackW,
                height: 64,
                borderRadius: 16,
                background: "rgba(255,255,255,0.08)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: (trackW * r.value * t) / max,
                  height: "100%",
                  borderRadius: 16,
                  background: r.color,
                }}
              />
            </div>
          </div>
        );
      })}

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          marginTop: 20,
          opacity: Math.min(1, deltaIn * 1.4),
          transform: `scale(${interpolate(deltaIn, [0, 1], [1.6, 1])})`,
        }}
      >
        <div
          style={{
            padding: "20px 56px",
            borderRadius: 999,
            background: accent,
            color: palette.dark,
            fontFamily: "Arial Black, Arial, sans-serif",
            fontSize: 110,
            lineHeight: 1,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {deltaText}
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          top: HEIGHT - safe.bottom - 40,
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
