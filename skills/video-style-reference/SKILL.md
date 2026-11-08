---
name: video-style-reference
description: Поиск и применение референсов анимаций из библиотеки video-reference-library (100 позиций, 15 категорий). Используй при выборе визуального стиля ролика, когда пользователь называет ID из галереи, просит «что-то вроде...» или когда Video Director подбирает визуальные варианты для сценария.
---

# Video Style Reference — поиск и применение референсов анимаций

Библиотека: `{{STUDIO_DIR}}\video-reference-library\`
Галерея (запуск): `python -m http.server 4173 --bind 127.0.0.1` из каталога библиотеки → http://127.0.0.1:4173/gallery/index.html

## Каталог и поиск

Главный файл — `catalog.json` (100 позиций). Инструмент поиска:

```bash
cd {{STUDIO_DIR}}\video-reference-library
node tools/search.mjs "глитч"                 # по ключевым словам (ru/en, по ID/названию/описанию/тегам)
node tools/search.mjs --cat maps              # по категории
node tools/search.mjs --cat stats --lic mit счётчик   # категория + только MIT
node tools/search.mjs --ids RCE-STAT-001,RVE-TRAN-001 # выбор по ID
```

Категории: `titles, kinetic, captions, transitions, photo, parallax, stats, infographic, maps, cinematic, ads, reels, realestate, hooks, cta`.

Поля записи: `id` (уникальный, формат `<SRC>-<CAT>-NNN`), `title_ru`, `description`, `category`, `tags`, `license`, `commercial` (true = MIT, можно в коммерческие видео; "verify" = только ознакомление), `source_url`, `code_path`, `demo` (живое превью в галерее).

## Лицензии — жёсткое правило

- **MIT (opus/rendercomp/rve/studio)** — код можно копировать и использовать в коммерческих видео.
- **NOT-STATED (ALI-*, SKILLRY-*) и MC-PARA-001** — НЕ копировать код/ассеты в коммерческие видео. Только идея/референс: смотрим демо, делаем свою реализацию.

## Передача выбранных ID дальше

Формат для Motion Designer (в задание):

```
Референсы:
- RCE-STAT-001 (Счётчик KPI) — сцена 2, счётчик цены
- RVE-TRAN-001 (Зум-насквозь) — переходы между сценами
Код: video-reference-library/templates/... (см. code_path в catalog.json)
```

Пользователь может прислать `selection.json` из галереи (кнопка «Скачать selection.json») — в нём массив `selected_ids` и полные записи.

## Живое превью для пользователя

- Галерея: поиск, фильтры по категории/лицензии, фуллскрин, мультивыбор.
- Прямая ссылка на демо: `http://127.0.0.1:4173/gallery/demos/demo-player.html?id=<ID>`
- Если сервер не запущен — запусти его (см. выше) и дай пользователю ссылку.

## Демо ≠ код

Демо в галерее — HTML/CSS/JS-реплики эффектов (движок `demos/demos.js` + `demos2.js`). В Remotion эффект портируется по образцу `code_path` (MIT) или по демо (для reference-only). Готовые Remotion-порты части референсов лежат в `compositions/src/lib/library/` (VSL-*: hook-punch-headline, stat-counter, zoom-through, caption-bar, price-fall-chart, checklist-features, discount-badge, vertical-safe-layout, cta-subscribe-badge).

## Как добавить новый референс

Добавь запись в `CURATED` в `tools/build-catalog.mjs`, при необходимости демо-функцию в `demos/demos.js` (или `demos2.js`), затем: `node tools/build-catalog.mjs && node tools/build-gallery.mjs`.
