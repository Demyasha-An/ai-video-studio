import React from "react";
import { AbsoluteFill, Sequence, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { HEIGHT, palette, safe, WIDTH } from "../lib/theme";
import { StatCounter } from "../lib/library/stat-counter";

export type PriceCompareProps = {
  title: string;
  marketLabel: string;
  marketValue: number;
  auctionLabel: string;
  auctionValue: number;
  delta: string;
};

/** Демо-композиция: сравнение цен (драфт-аналог tools/draft-refcompare.spec.json). */
export const PriceCompare: React.FC<PriceCompareProps> = ({
  title,
  marketLabel,
  marketValue,
  auctionLabel,
  auctionValue,
  delta,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const intro = spring({ frame, fps, config: { damping: 200 }, durationInFrames: 18 });
  const outro = interpolate(frame, [durationInFrames - 12, durationInFrames - 2], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ background: palette.bg0 }}>
      <AbsoluteFill style={{ opacity: intro * outro }}>
        <div
          style={{
            position: "absolute",
            top: safe.top,
            left: safe.side,
            right: safe.side,
            fontFamily: "Arial Black, Arial, sans-serif",
            fontSize: 62,
            color: palette.text,
            textAlign: "center",
          }}
        >
          {title}
        </div>

        <Sequence from={10} durationInFrames={Math.round(2.4 * fps)} layout="none">
          <StatCounter label={marketLabel} value={marketValue} accent={palette.accent2} />
        </Sequence>

        <Sequence from={Math.round(2.6 * fps)} durationInFrames={Math.round(2.4 * fps)} layout="none">
          <StatCounter label={auctionLabel} value={auctionValue} accent={palette.accent} />
        </Sequence>

        <Sequence from={Math.round(5.1 * fps)} durationInFrames={Math.round(1.6 * fps)} layout="none">
          <AbsoluteFill
            style={{
              justifyContent: "center",
              alignItems: "center",
              fontFamily: "Arial Black, Arial, sans-serif",
              fontSize: 200,
              color: palette.accent,
            }}
          >
            {delta}
          </AbsoluteFill>
        </Sequence>

        <div
          style={{
            position: "absolute",
            top: 40,
            left: 30,
            right: 30,
            height: 5,
            background: "rgba(255,255,255,0.12)",
          }}
        >
          <div
            style={{
              width: `${(frame / Math.max(1, durationInFrames - 1)) * 100}%`,
              height: "100%",
              background: palette.accent,
            }}
          />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const priceCompareDefaults: PriceCompareProps = {
  title: "Рыночная цена против торгов",
  marketLabel: "Рыночная цена",
  marketValue: 8000000,
  auctionLabel: "На торгах",
  auctionValue: 5200000,
  delta: "−35%",
};

// размеры подсказка для редактора: WIDTH/HEIGHT используются в SafeArea проверках
export const _frame = { WIDTH, HEIGHT };
