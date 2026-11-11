import { Config } from "@remotion/cli/config";

// 9:16 1080×1920 — стандарт студии. Финал: H.264 CRF 19 + AAC 192k.
Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
Config.setCodec("h264");
Config.setCrf(19);
Config.setPixelFormat("yuv420p");
