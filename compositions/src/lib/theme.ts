/**
 * Тема студии: одна палитра и одна кривая easing на ролик.
 * Безопасные зоны 9:16: ≥120 px по вертикали, ≥60 px по горизонтали.
 */
export const palette = {
  bg0: "#070C18",
  bg1: "#15223D",
  text: "#FFFFFF",
  textMuted: "#B7C2D4",
  accent: "#FFB020",
  accent2: "#5A6B8C",
  dark: "#111111",
} as const;

export const safe = {
  top: 120,
  bottom: 220, // ниже — интерфейс платформ (кнопки, подписи)
  side: 60,
} as const;

export const FPS = 30;
export const WIDTH = 1080;
export const HEIGHT = 1920;
