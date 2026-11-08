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

**GPU**: если `ffmpeg -hide_banner -encoders | grep amf` показывает `h264_amf` (AMD) — драфт-рендер умеет ускоряться флагом `--amf`. NVENC/QSV также поддержаны через ffmpeg.

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

### 2.6 Python-окружения (опционально)
```bash
# ASR-проверка субтитров (faster-whisper):
uv venv .venvs/whisper && uv pip install --python .venvs/whisper/Scripts/python.exe faster-whisper "av==14.2.0"
# ВАЖНО: av<15 — ffmpeg 9-совместимость с faster-whisper 1.2.1

# Manim-ярус (без LaTeX для текстовых сцен):
uv venv .venvs/manim && uv pip install --python .venvs/manim/Scripts/python.exe manim
```

### 2.7 Remotion-финальный ярус
```bash
cd compositions 2>/dev/null || true   # если compositions перенесены; иначе пропустить
```
Remotion-проект (React/TS) устанавливается отдельно: `npm install remotion @remotion/cli react react-dom` в каталоге `compositions/` (см. docs/setup.md §Remotion). Драфт-ярус работает и без него.

---

## Шаг 3. Верификация (обязательная, по пунктам)

1. `node tools/draft-render.mjs tools/draft-refcompare.spec.json /tmp/verify.mp4 --amf` → exit 0, длительность 4.0 с.
2. `node tools/search.mjs "скидка"` (из `reference-library/`) → ≥ 1 результат.
3. `python -m http.server 4173 --bind 127.0.0.1` из `reference-library/` → http://127.0.0.1:4173/gallery/index.html отвечает 200 (после проверки сервер остановить).
4. Новый сеанс CLI: команда `/video` видна в меню команд; субагенты `video-scriptwriter`, `motion-designer`, `voice-producer`, `video-editor`, `video-quality-controller` появились в списке агентов.
5. Smoke-тест оркестрации: попросить агента-сценариста создать мини-сценарий; убедиться, что субагент получил роль и вернул артефакт.

## Отчёт агенту-установщику
В конце вернуть: таблицу проверок (шаг 0 и шаг 3), установленные пути компонентов, список пропущенных опций (MCP/Python/Remotion) и причину, следующее действие пользователя (перезапустить сессию CLI).
