# AGENT-SETUP — runbook установки для AI-агента

Этот файл — исполняемая инструкция для кодинг-агента (ZCode, OpenCode, Claude Code, Codex — любой, кто умеет Bash + файлы). Пользователь говорит агенту: «Установи ai-video-studio по docs/AGENT-SETUP.md» — агент выполняет шаги по порядку и в конце выдаёт отчёт-верификацию.

**Репозиторий = сама студия.** Клонируйте в любой каталог (далее `{{STUDIO_DIR}}` = путь к клона).

---

## Шаг 0. Диагностика окружения

```bash
node --version          # нужен >= 20 (для Remotion и draft-render)
ffmpeg -version | head -1   # нужен >= 6 (протестировано на 9.x)
python --version || python3 --version   # опционально: faster-whisper, manim
git --version
```

Все проверки записать. Что отсутствует — установить и сообщить пользователю:
- **Node.js** — https://nodejs.org (или `winget install OpenJS.NodeJS.LTS`).
- **FFmpeg** — `winget install Gyan.FFmpeg` (Windows) / `apt install ffmpeg` (Debian) / `brew install ffmpeg` (macOS). Нужен в PATH.
- **Python 3.12+** — опционален (ASR-проверка субтитров и Manim-ярус).

**GPU**: драфт-рендер ускоряется аппаратным энкодером — `--nvenc` (NVIDIA), `--amf` (AMD), `--qsv` (Intel).
Проверка: `ffmpeg -hide_banner -encoders | grep -E "h264_(nvenc|amf|qsv)"`.
Замеры на RTX 3050 (сцена 30 с, 1080×1920): NVENC 5.35 с / 3.8 МБ, libx264 5.67 с / 1.17 МБ.
На коротких сценах разница ничтожна и libx264 даёт файл втрое меньше — NVENC для длинных итераций,
финальный монтаж всегда libx264.

Остальные ярусы и GPU:

| Ярус | GPU? | Как |
|---|---|---|
| Озвучка (Silero) | да | torch+cu128, `--device cuda` (по умолчанию `auto`) |
| ASR (faster-whisper) | да | `WHISPER_DEVICE=auto`: float16 на GPU, если ctranslate2 видит карту. Нужны колёса `nvidia-cublas-cu12` + `nvidia-cudnn-cu12` в том же venv — без них `Library cublas64_12.dll is not found` |
| Remotion (финал) | да, отрисовка | `setChromiumOpenGlRenderer("angle")` + `setConcurrency(8)` в `compositions/remotion.config.ts` (210 кадров: 13.4 с → 9.6 с). Кодирование — libx264 |
| Драфт (ffmpeg) | только энкодер | фильтры/композитинг на CPU; NVENC грузит ~50% энкодера и ~15% GPU |
| Manim | нет | Cairo-рендерер, CPU |

---

## Шаг 1. Куда ставить компоненты

Репозиторий клонирован в `{{STUDIO_DIR}}`. Компоненты копируются в конфиг-каталоги CLI:

| Компонент | ZCode | OpenCode |
|---|---|---|
| Субагенты (6 шт.) | `~/.zcode/agents/` | `~/.config/opencode/agent/` |
| Команда `/video` | `~/.zcode/commands/` | `~/.config/opencode/command/` |
| Скиллы (2 шт.) | `~/.zcode/skills/` | `~/.config/opencode/skills/` + `~/.agents/skills/` (универсально) |

Каталоги создать при отсутствии. Пути Windows: `~` = `C:\Users\<user>`; OpenCode использует `~/.config/opencode/` на всех ОС.

---

## Шаг 2. Установка компонент (выполнять из `{{STUDIO_DIR}}`)

### 2.1 Подстановка путей
Во всех копируемых `.md`-файлах заменить плейсхолдер `{{STUDIO_DIR}}` на фактический абсолютный путь каталога репозитория (POSIX-слэши или двойные бэкслеши — агент выбирает формат, принятый в целевом CLI).

### 2.2 ZCode
```bash
mkdir -p ~/.zcode/agents ~/.zcode/commands ~/.zcode/skills
cp agents/*.md ~/.zcode/agents/          # затем заменить {{STUDIO_DIR}} в каждой копии
cp commands/video.md ~/.zcode/commands/
cp -r skills/video-style-reference skills/modern-motion-reference ~/.zcode/skills/
```
Затем в каждой скопированной agents/*.md и commands/video.md выполнить замену `{{STUDIO_DIR}}`.

### 2.3 OpenCode
```bash
mkdir -p ~/.config/opencode/agent ~/.config/opencode/command ~/.config/opencode/skills
cp agents/*.md ~/.config/opencode/agent/
cp commands/video.md ~/.config/opencode/command/
cp -r skills/video-style-reference skills/modern-motion-reference ~/.config/opencode/skills/
cp -r skills/video-style-reference skills/modern-motion-reference ~/.agents/skills/ 2>/dev/null || true
```
Затем в копиях для OpenCode:
- в каждом agent-файле **добавить в frontmatter строку `mode: subagent`** (формат OpenCode);
- заменить `{{STUDIO_DIR}}`;
- вызвать **video-director** в OpenCode можно через упоминание агента; конвейер выполняется в главной сессии (правило «не делегировать конвейер субагенту» уже вписано в тексты).

### 2.4 MCP (опционально, монтаж через протокол)
Серверы `kinocut` и `ffmpeg-skill` — сторонние, устанавливаются по желанию:
- ZCode: `~/.zcode/cli/config.json` → `"mcp": {"servers": {...}}`, запуск: kinocut — `uvx --from kinocut kino --mcp`, ffmpeg-skill — `python <skill>/mcp/server.py`.
- OpenCode: ключ `"mcp"` в `opencode.jsonc`.
Шаблон лежит в `docs/mcp-template.json`. **ElevenLabs** — платный, по умолчанию отключён; активировать только по явному разрешению пользователя.

### 2.5 Шрифты для драфт-рендера (Windows)
FFmpeg 9 парсер не принимает `C\:/...` в fontfile — шрифты копируются внутрь проекта (путь без двоеточий):
```bash
mkdir -p tools/fonts
cp /c/Windows/Fonts/arialbd.ttf tools/fonts/   # Git Bash
cp /c/Windows/Fonts/arial.ttf tools/fonts/
```
Linux/macOS: ничего не нужно — draft-render сам найдёт DejaVu (`/usr/share/fonts/...`). Шрифты Arial — собственность Microsoft, в репозиторий не входят.

### 2.6 Python-окружения (нужны для озвучки и ASR)

**ВАЖНО: системный Python 3.15 не подходит.** Для `ctranslate2` (ядро faster-whisper) и
`manimpango`/`pycairo` (Manim) колёс под cp315 нет — максимум cp313. Ставим Python 3.13 рядом:

```bash
# uv (устанавливает и Python 3.13)
winget install --id astral-sh.uv -e
# winget не обновляет PATH текущей сессии: до перезапуска терминала звать полным путём
#   ~/AppData/Local/Microsoft/WinGet/Packages/astral-sh.uv_*/uv.exe
uv python install 3.13
```

```bash
# Озвучка: Silero v5_ru + silero-stress (+ edge-tts и pymorphy3 как fallback/согласование)
uv venv .venvs/tts-ru --python 3.13
uv pip install --python .venvs/tts-ru/Scripts/python.exe torch --index-url https://download.pytorch.org/whl/cu128
uv pip install --python .venvs/tts-ru/Scripts/python.exe silero-stress omegaconf scipy soundfile numpy pymorphy3 edge-tts
# torch ставится для конкретной CUDA; CPU-вариант: pip install torch (без --index-url)
# omegaconf и scipy — необъявленные зависимости silero-модели из torch.hub (без них ImportError)

# ASR-проверка субтитров (faster-whisper)
uv venv .venvs/whisper --python 3.13
uv pip install --python .venvs/whisper/Scripts/python.exe faster-whisper "av==14.2.0"
# ВАЖНО: av<15 — ffmpeg 9-совместимость с faster-whisper 1.2.1
# CUDA-ASR (иначе "Library cublas64_12.dll is not found" при device=cuda):
uv pip install --python .venvs/whisper/Scripts/python.exe nvidia-cublas-cu12 nvidia-cudnn-cu12

# Manim-ярус (без LaTeX для текстовых сцен)
uv venv .venvs/manim --python 3.13
uv pip install --python .venvs/manim/Scripts/python.exe manim
```

Проверка GPU-озвучки: `.venvs/tts-ru/Scripts/python.exe -c "import torch; print(torch.cuda.is_available(), torch.cuda.get_device_name(0))"`.

**torch cu128 весит 2.6 ГБ на диске.** Если `uv pip install` рвётся на `download-r2.pytorch.org`
(TLS handshake / timeout — бывает на нестабильном канале), скачайте колесо отдельно и поставьте локально:

```bash
curl.exe -L --retry 8 --retry-all-errors -C - -o torch.whl \
  "https://download.pytorch.org/whl/cu128/torch-2.11.0%2Bcu128-cp313-cp313-win_amd64.whl"
uv pip install --python .venvs/tts-ru/Scripts/python.exe ./torch.whl
```

### 2.7 Remotion-финальный ярус
Проект лежит в `{{STUDIO_DIR}}/compositions/` (package.json, tsconfig, remotion.config.ts, `src/Root.tsx`):
```bash
cd compositions
npm install                      # ~245 пакетов, 45 с
npx tsc --noEmit                 # typecheck
npx remotion render PriceCompare ../renders/pricecompare.mp4
```
Chromium скачивается Remotion'ом при первом рендере. Драфт-ярус работает и без него.

---

## Шаг 3. Верификация (обязательная, по пунктам)

1. `node tools/draft-render.mjs tools/draft-refcompare.spec.json renders/verify.mp4 --nvenc` → exit 0, длительность 4.0 с, 1080×1920.
2. `cd reference-library && node tools/search.mjs "скидка"` → ≥ 1 результат.
3. `python -m http.server 4173 --bind 127.0.0.1` из `reference-library/` → http://127.0.0.1:4173/gallery/index.html отвечает 200 (после проверки сервер остановить).
4. Озвучка: `.venvs/tts-ru/Scripts/python.exe tools/voice-ru.py --text "Проверка связи." --out audio/voice/smoke.wav --device cuda` → JSON-отчёт, `smoke-full.wav` 48 kHz stereo, ebur128 ≈ −14 LUFS, `smoke-block01.txt` с расставленными ударениями.
5. ASR: `.venvs/whisper/Scripts/python.exe tools/transcribe.py audio/voice/smoke-full.wav renders/smoke.srt renders/smoke.json` → в stderr строка `whisper small on cuda/float16` (если GPU нет — `cpu/int8`), SRT с текстом.
6. Manim: `.venvs/manim/Scripts/python.exe -m manim render -ql tools/manim-test.py PriceCompare --media_dir media` → mp4 1080×1920.
7. Remotion: `cd compositions && npx tsc --noEmit && npx remotion render PriceCompare ../renders/pricecompare.mp4` → mp4 1080×1920@30.
8. Новый сеанс CLI: команда `/video` видна в меню команд; субагенты `video-scriptwriter`, `motion-designer`, `voice-producer`, `video-editor`, `video-quality-controller` появились в списке агентов.
9. Smoke-тест оркестрации: попросить агента-сценариста создать мини-сценарий; убедиться, что субагент получил роль и вернул артефакт.

## Отчёт агенту-установщику
В конце вернуть: таблицу проверок (шаг 0 и шаг 3), установленные пути компонентов, список пропущенных опций (MCP/Python/Remotion) и причину, следующее действие пользователя (перезапустить сессию CLI).
