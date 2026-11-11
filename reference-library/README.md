# video-reference-library

Библиотека визуальных референсов, анимаций и шаблонов для AI Video Studio.
**v2.1: 142 позиции · 27 категорий · 126 с кодом (MIT) · 130 коммерчески-OK · 21 внешний скилл от iart-ai и Barty-Bart.**
Современные референсы (`modern: true`, 42 шт.) + переходы Digital Samba (`DGT-TRANS-001..007`, код локально).

## Быстрый старт

```bash
# галерея (из этого каталога):
python -m http.server 4173 --bind 127.0.0.1
# открыть: http://127.0.0.1:4173/gallery/index.html
# быстрые фильтры: «Бесплатно» · «Есть код» · «Инфографика» · «Современные референсы»

# поиск по каталогу:
node tools/search.mjs "скидка кольцо"
node tools/search.mjs --cat financial
node tools/search.mjs --ids VSL-FINAN-001,OML-DATAV-001

# пересборка каталога/галереи (после изменений):
node tools/build-catalog.mjs && node tools/build-gallery.mjs

# ДРАФТ-РЕНДЕР без браузера (в 7–11 раз быстрее Remotion; из {{STUDIO_DIR}}):
node tools/draft-render.mjs tools/draft-refcompare.spec.json renders/draft.mp4 [--amf]
# примитивы: bar / count / label / text / progress; фон — градиент;Manim CE — .venvs/manim
```

## Что внутри

| Путь | Содержимое |
|---|---|
| `catalog.json` | главный каталог: id, название, описание, категория, теги, лицензия, source_url, code_path, демо |
| `catalog.md` | человекочитаемый обзор по категориям |
| `gallery/` | самодостаточная веб-галерея (поиск, фильтры, фуллскрин, копия ID, мультивыбор → selection.json) |
| `demos/` | движок живых демо: `demo-player.html?id=<ID>` + `demos.js`/`demos2.js` |
| `templates/rendercomp/`, `templates/rve/` | скопированные MIT-компоненты Remotion |
| `sources/` | мелкие клоны исходных репозиториев (в т.ч. Opus Motion Library — 616 motion, код referenced по месту) |
| `tools/` | `search.mjs` (поиск), `build-catalog.mjs` (сборка каталога), `build-gallery.mjs` (синк галереи) |
| `LICENSES.md` | сводка лицензий и правила коммерческого использования |

## Источники

**Базовые (v1):**
1. **Opus Motion Library** — MIT, 616 motion (Remotion+React). Клон в `sources/opus-motion-library/` (локально, вне git); используемые в каталоге файлы скопированы в `templates/opus/<категория>/`.
2. **RenderComp/free-remotion-templates** — MIT, 50 шаблонов; 24 в `templates/rendercomp/`.
3. **reactvideoeditor/remotion-templates** — MIT (грант в README), 81 шаблон; ~34 в `templates/rve/`.
4. **ali-abassi/remotion-templates** — ⚠️ лицензия не указана: только ссылка (ALI-REF-001).
5. **motion-canvas/examples** — MIT, другой фреймворк: референс-идея (MC-PARA-001).
6. **Skillry.dev** — ⚠️ лицензии не раскрыты: только ссылка (SKILLRY-REF-001).

**Современные (v2, 35 позиций):**
7. **Opus data-категория** — MIT, 16 отобранных data-графиков (funnel, sankey, heatmap, treemap, waterfall, radar, gauge, network, gantt, timeline, rings, dot-tally, dumbbell, cause-effect, chip-stack, budget) с локальным кодом.
8. **aicssanimations.com/inspiration** — CC0-работы (свободные), подборки кинетики/data-viz/3D; код не публикуется — промпты.
9. **artiphik.com** — 212 таймкодов editorial-графики (Vox и др.) — только ссылки (контент авторов).
10. **lottiefiles.com/free-animations/infographic** — 161 бесплатная Lottie-инфографика; лицензия по элементу — verify.
11. **animode.app/explore** — галерея вдохновения (remix — платный, не используем) — verify.
12. **kisto.app/inspiration/motion-design** — лента авторского motion-дизайна — verify (мудборд).
13. **iart-ai/*-skills** (через awesome-claude-video-skills) — MIT, 7 паков = 13 скиллов установлены в скиллы ZCode (вертикальные Reels, data-видео, explainer, карты, кинетика, lower-thirds); находки также в `catalog.json`.
14. **Barty-Bart/motion-graphics** — MIT, 6 скиллов установлены (explainer-стили, B-roll, SFX-метод).
15. **digitalsamba/claude-code-video-toolkit** — MIT, клон в `sources/`; 7 переходов в каталоге (DGT-*).

## Категории (27)
Базовые 15: Анимированные заголовки · Кинетическая типографика · Динамические субтитры · Переходы · Анимация фотографий · Параллакс · Цифры и статистика · Инфографика · Карты и гео · Кинематографичные эффекты · Реклама · Reels/Shorts/TikTok · Недвижимость · Хуки 0–3 с · Финальные CTA.
Современные 12: Animated Infographics · Data Visualization · Financial Graphics · Animated Maps · Kinetic Typography (modern) · Editorial Motion · Explainer Motion · Modern Minimalism · 3D Motion · UI Motion · Real Estate Motion · Premium Social Video.

## Жизненный цикл референса
Каталог → демо в галерее → выбор ID (пользователем или Video Director) → Motion Designer берёт `code_path` → порт в Remotion (`compositions/src/lib/library/`) → рендер → QC.

## Демо
Демо — HTML/CSS/JS-реплики эффектов (детерминированные функции времени), движок в `demos/demos.js` + `demos2.js`, один рендерер `demos/demo-player.html?id=<ID>`. Это превью, а не производственный код: производственный код — Remotion-компоненты из `templates/` и `code_path`.
