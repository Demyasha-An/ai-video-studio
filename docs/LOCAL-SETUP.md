# AI Video Studio — нейростудия (локальная установка)

Этот файл — состояние конкретной машины после установки. Технический runbook: `docs/AGENT-SETUP.md`.

## Что это

Конвейер вертикальных роликов (Reels/Shorts/TikTok): сценарий → озвучка → анимация → монтаж → QC.
Три яруса рендера: драфт (ffmpeg filtergraph, секунды) → натив (Manim, без браузера) → финал (Remotion).

## Железо

| | |
|---|---|
| GPU | NVIDIA GeForce RTX 3050 8 GB, драйвер 621.14 (CUDA 12.8) |
| CPU | Intel Core i3-12100F |
| RAM | 16 GB |
| Диск | `D:\NeiroStudio` (D: ~195 GB свободно) |

Аппаратные энкодеры: `h264_nvenc` ✅ · `h264_amf` ❌ (нет AMD) · `h264_qsv` ❌ (F-серия без iGPU).

## Установленные окружения

| Каталог | Python | Манифест | Что внутри |
|---|---|---|---|
| `.venvs/tts-ru` | 3.13 | `requirements-tts.txt` | torch 2.11.0+cu128, silero-stress, omegaconf, scipy, soundfile, numpy, pymorphy3, edge-tts |
| `.venvs/whisper` | 3.13 | `requirements-whisper.txt` | faster-whisper 1.2.1, ctranslate2 4.9.0, av 14.2.0, nvidia-cublas-cu12 / nvidia-cudnn-cu12 (для CUDA-ASR) |
| `.venvs/manim` | 3.13 | `requirements-manim.txt` | manim 0.22.1 (Cairo, без LaTeX) |
| `compositions/` | Node 26.13 | `package.json` | remotion 4.0.542, react 19.2 |

Манифесты — точные пины (`uv pip freeze`). Пересоздать окружения с нуля:

```bash
uv venv .venvs/tts-ru --python 3.13
uv pip install --python .venvs/tts-ru/Scripts/python.exe -r requirements-tts.txt
# то же для whisper и manim
```

Системный Python 3.15.2 **не используется** — под него нет колёс ctranslate2/manimpango.
`uv` 0.13.7, Python 3.13.18 — в `%USERPROFILE%\AppData\Roaming\uv`.

## Пути в агентах

Субагенты и `/video` в `~/.config/opencode/` используют `D:/NeiroStudio`.
Резервная копия предыдущей (сломанной, со ссылками на несуществующий `D:/opencode/ai-video-studio`):
`~/.config/opencode.backup-2026-11-11T17-34-50`.

## Озвучка (`tools/voice-ru.py`)

```bash
# дефолт: Silero v5_ru локально на CUDA
.venvs/tts-ru/Scripts/python.exe tools/voice-ru.py \
  --text-file scripts/<slug>.md --section "Текст озвучки" \
  --out audio/voice/<slug>.wav --fit 5,5,5,5
# движки: --engine silero|azure|edge|piper, --voice xenia|baya|kseniya|aidar|eugene
.venvs/tts-ru/Scripts/python.exe tools/voice-ru.py --list-voices
```

Что делает скрипт сам: берёт только нужный раздел Markdown (`--section`), предупреждает о
незаменённых плейсхолдерах `[...]` **до** синтеза; числа/сокращения/проценты/рубли/время/разряды —
в слова с согласованием рода и падежа (`pymorphy3`, без него — без угадывания); ударения
(`silero-stress`) + словарь `config/pronunciation.json` (формат `сл+ово`); паузы между блоками;
подгонку блоков под таймкод сценария (`--fit`, atempo без сдвига питча, предупреждение при
выходе за ±25%); мастеринг двумя проходами loudnorm + контрольная подстройка по ebur128 →
**−14.0 LUFS / −1.5 dBTP / 48 kHz stereo**; JSON-отчёт с фактическими длительностями блоков.

Проверка ударений: файл `<slug>-blockNN.txt` рядом с wav. ASR-сверка:
`.venvs/whisper/Scripts/python.exe tools/transcribe.py <audio> <out.srt> <out.json>` —
по умолчанию `auto`: GPU float16, если ctranslate2 видит карту, иначе CPU int8.
Принудительно: `WHISPER_DEVICE=cuda|cpu`. Первый в жизни CUDA-прогон компилирует движки cuDNN
(~40 с, кэш остаётся в `%LOCALAPPDATA%\NVIDIA\ComputeCache`), дальше 24-секундный ролик:
**4.2 с на GPU против 7.9 с на CPU**. Для этого в venv стоят колёса `nvidia-cublas-cu12` /
`nvidia-cudnn-cu12`, а `transcribe.py` добавляет их `bin/` в PATH перед импортом faster-whisper
(иначе `Library cublas64_12.dll is not found`).

## Рендер

```bash
# драфт (секунды, без браузера)
node tools/draft-render.mjs tools/draft-refcompare.spec.json renders/out.mp4 --nvenc
#   --nvenc | --amf | --qsv | --crf N ; без флага — libx264
#   читает UTF-8 с BOM (PowerShell 5.1 Set-Content), кириллица в путях и тексте — ок

# натив (Manim)
.venvs/manim/Scripts/python.exe -m manim render -ql tools/manim-test.py PriceCompare --media_dir media

# финал (Remotion)
cd compositions && npx remotion render PriceCompare ../renders/pricecompare.mp4
```

Замеры (1080×1920@30, 30 с): NVENC 5.35 с / 3.8 МБ · libx264 5.67 с / 1.17 МБ.
На коротких сценах libx264 не хуже и даёт файл втрое меньше; NVENC — для длинных итераций.

Remotion по умолчанию рендерит через GPU: `remotion.config.ts` ставит
`setChromiumOpenGlRenderer("angle")` + `setConcurrency(8)`. Замер (210 кадров):
13.4 с → 9.6 с. `--gl=swangle` (софтверная эмуляция) в 2–4 раза медленнее — не использовать.
Кодирует всё равно libx264: у Remotion нет NVENC-выхода.

## Что осталось от исходного замысла и где расхождения

- **`code_path` в `reference-library/catalog.json` — починено.** Исходники MIT-библиотек положены в
  `reference-library/sources/` (~92 МБ; `opus-motion-library`, `free-remotion-templates` ← rendercomp,
  `remotion-templates` ← reactvideoeditor, `digitalsamba-video-toolkit` — только 7 переходов + LICENSE),
  `node tools/build-catalog.mjs` копирует RCE/RVE в `templates/` и пересобирает каталог
  («missing opus refs: нет»). 13 компонентов VSL лежат в `compositions/src/lib/library/`.
  Единственная запись без кода — `MC-PARA-001` (Motion Canvas, `has_code=false`, только ссылка).
  Восстановить исходники с нуля: `git clone --depth 1` четырёх репозиториев из `LICENSES.md`
  в указанные имена каталогов (digitalsamba — 7 файлов через raw.githubusercontent.com).
- **В git едет только скопированное, не клоны.** У клонов в `sources/` собственный `.git`, поэтому
  наш репозиторий их не видит; `sources/.gitignore` игнорирует `sources/` целиком (кроме самого
  `.gitignore` и LICENSE digitalsamba). Все `code_path` каталога указывают на `templates/`:
  `build-catalog.mjs` копирует туда файлы Opus/Digi так же, как уже копировал RCE/RVE.
  Лицензии продублированы в `templates/{opus,rendercomp,digi}/LICENSE`. Итог: 113 файлов в
  `templates/`, 0 битых `code_path` в свежем клоне без `sources/`.
- **Библиотека: 142 позиции** (в текстах скиллов было 135 — поправлено).
- **Композиции Remotion** в репозитории отсутствовали — создан минимальный проект с `PriceCompare`
  и переиспользуемым `StatCounter`, чтобы финальный ярус был рабочим.
- **Manim** установлен и проверен (1080×1920, кириллица, count-up без LaTeX).
- **`tools/fonts/`** — Arial скопирован локально (`arial.ttf`, `arialbd.ttf`), в git не попадает (.gitignore).

## Известные ограничения

- edge-tts (Microsoft) нестабилен: `NoAudioReceived` прилетает на любой голос. В `voice-ru.py`
  зашиты 10 попыток с ротацией голосов (проверено: Dariya падает, Dmitry/Svetlana работают).
  Это fallback, не основной движок.
- Manim рендерит в 15 fps по умолчанию при `-ql`; для 30 fps — `-qh`/конфиг `fps=30`.
- Тяжёлое колесо torch (2.6 ГБ) качается нестабильно — если `uv` падает на TLS, качать `curl -C -` и
  ставить локально (см. `docs/AGENT-SETUP.md` §2.6).
