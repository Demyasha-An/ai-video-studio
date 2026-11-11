import { Config } from "@remotion/cli/config";

// 9:16 1080×1920 — стандарт студии. Финал: H.264 CRF 19 + AAC 192k.
Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
Config.setCodec("h264");
Config.setCrf(19);
Config.setPixelFormat("yuv420p");
// GPU (RTX 3050) for Chrome rendering: ANGLE/D3D11. Benchmark 2026-11-12 (210 frames):
// default 13.4 s → angle + concurrency 8: 9.6 s. swangle (CPU emulation) is 2–4× slower — don't use it.
Config.setChromiumOpenGlRenderer("angle");
Config.setConcurrency(8);
