# Бенчмарки рендеров

Машина: AMD Ryzen 5 3500U (4C/8T), 14 GB RAM, AMD Vega 8 iGPU, Windows, FFmpeg 9.0.1, Node 24.
Сцена: «сравнение цен» — градиентный фон, 2 растущие полосы, 2 count-up числа, заголовок −35%, прогресс-бар. 120 кадров @30fps, 1080×1920.

## Полный цикл одной сцены

| Пайплайн | Время | Относительно |
|---|---|---|
| Remotion (headless Chrome) + x264 | 27.9 с | 1× |
| draft-render.mjs (ffmpeg filtergraph) + x264 veryfast | **4.3 с** | **6.5×** |
| draft-render.mjs + h264_amf (GPU) | **2.7 с** | **10.3×** |
| Manim CE (Cairo) @15fps | 33.2 с | — |

## Расшифровка времени Remotion-рендера (270 кадров, 9 с)

| Этап | Время | Доля |
|---|---|---|
| webpack bundle (каждый вызов CLI) | 10.1 с | ~40% |
| Chrome-растеризация + encode | ~14 с | ~58% |

Выводы: (1) `--concurrency=6` на 8-поточном CPU выигрыша не даёт — дефолт оптимален; (2) для нескольких композиций выгоден один bundle (API `@remotion/bundler`); (3) энкодер Remotion — Rust (`@remotion/compositor-*`), переписывать нечего.

## Аппаратные энкодеры

`h264_amf` (AMD) протестирован и работает: перекодирование 9-с ролика 3.9 с. Включается флагом `--amf` в draft-render или `-c:v h264_amf -quality speed` напрямую. Для финальных файлов качество/битрейт у x264 CRF 19 лучше — AMF рекомендован для драфтов и длинных экспортов.

## Методика

`renders/bench-log.txt`, замеры `time` по wall-clock, тёплый кэш webpack, каждая конфигурация — отдельный вызов. Сцена-эталон: `tools/draft-refcompare.spec.json` (draft) и композиция `RefCompare` (Remotion), `tools/manim-test.py` (Manim).
