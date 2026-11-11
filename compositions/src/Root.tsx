import React from "react";
import { Composition } from "remotion";
import { PriceCompare, priceCompareDefaults } from "./compositions/PriceCompare";
import { FPS, HEIGHT, WIDTH } from "./lib/theme";
import { CaptionBar } from "./lib/library/caption-bar";
import { VerticalSafeLayout } from "./lib/library/vertical-safe-layout";
import { PriceFallChart } from "./lib/library/price-fall-chart";
import { ChecklistFeatures } from "./lib/library/checklist-features";
import { DiscountBadge } from "./lib/library/discount-badge";
import { HookPunchHeadline } from "./lib/library/hook-punch-headline";
import { CtaSubscribeBadge } from "./lib/library/cta-subscribe-badge";
import { PriceCompareBars } from "./lib/library/price-compare-bars";
import { DiscountRing } from "./lib/library/discount-ring";
import { NumberPunch } from "./lib/library/number-punch";
import { MinimalPriceCard } from "./lib/library/minimal-price-card";
import { RestatePriceReveal } from "./lib/library/restate-price-reveal";
import { PremiumSocialFrame } from "./lib/library/premium-social-frame";

const base = { fps: FPS, width: WIDTH, height: HEIGHT } as const;

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="PriceCompare"
        component={PriceCompare}
        durationInFrames={7 * FPS}
        {...base}
        defaultProps={priceCompareDefaults}
      />

      {/* Библиотека компонентов (src/lib/library) — демо-композиции 1080×1920@30 */}
      <Composition
        id="CaptionBar"
        component={CaptionBar}
        durationInFrames={3 * FPS}
        {...base}
        defaultProps={{ text: "Квартиру можно купить на 35% дешевле рынка", startFrame: 0, endFrame: 3 * FPS }}
      />
      <Composition
        id="VerticalSafeLayout"
        component={VerticalSafeLayout}
        durationInFrames={4 * FPS}
        {...base}
        defaultProps={{ title: "Торги по банкротству", caption: "Здесь идут субтитры озвучки", debug: true }}
      />
      <Composition
        id="PriceFallChart"
        component={PriceFallChart}
        durationInFrames={5 * FPS}
        {...base}
        defaultProps={{
          title: "Как падает цена на торгах",
          stages: [
            { label: "1-е торги", price: 12500000 },
            { label: "2-е торги", price: 11250000 },
            { label: "Публичное предложение", price: 6900000 },
          ],
        }}
      />
      <Composition
        id="ChecklistFeatures"
        component={ChecklistFeatures}
        durationInFrames={4 * FPS}
        {...base}
        defaultProps={{
          title: "Что проверить перед торгами",
          items: ["Выписка из ЕГРН", "Обременения и аресты", "Прописанные жильцы", "Долги за ЖКУ", "Отчёт об оценке"],
        }}
      />
      <Composition
        id="DiscountBadge"
        component={DiscountBadge}
        durationInFrames={3 * FPS}
        {...base}
        defaultProps={{ text: "−50%", caption: "от рыночной цены" }}
      />
      <Composition
        id="HookPunchHeadline"
        component={HookPunchHeadline}
        durationInFrames={3 * FPS}
        {...base}
        defaultProps={{ lines: ["Квартира", "за полцены?", "Это реально"], highlightIndex: 1 }}
      />
      <Composition
        id="CtaSubscribeBadge"
        component={CtaSubscribeBadge}
        durationInFrames={3 * FPS}
        {...base}
        defaultProps={{ text: "Подпишись", subtext: "новые лоты каждый день" }}
      />
      <Composition
        id="PriceCompareBars"
        component={PriceCompareBars}
        durationInFrames={4 * FPS}
        {...base}
        defaultProps={{ marketValue: 9800000, auctionValue: 6370000 }}
      />
      <Composition
        id="DiscountRing"
        component={DiscountRing}
        durationInFrames={3 * FPS}
        {...base}
        defaultProps={{ percent: 35 }}
      />
      <Composition
        id="NumberPunch"
        component={NumberPunch}
        durationInFrames={3 * FPS}
        {...base}
        defaultProps={{ parts: ["−", "3", "5", "%"] }}
      />
      <Composition
        id="MinimalPriceCard"
        component={MinimalPriceCard}
        durationInFrames={4 * FPS}
        {...base}
        defaultProps={{ oldPrice: 9800000, newPrice: 6370000 }}
      />
      <Composition
        id="RestatePriceReveal"
        component={RestatePriceReveal}
        durationInFrames={4 * FPS}
        {...base}
        defaultProps={{ price: 6370000, area: 54 }}
      />
      <Composition
        id="PremiumSocialFrame"
        component={PremiumSocialFrame}
        durationInFrames={4 * FPS}
        {...base}
        defaultProps={{ value: "−35%", loopSec: 4 }}
      />
    </>
  );
};
