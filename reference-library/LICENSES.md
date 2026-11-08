# Лицензии источников video-reference-library

Проверено 2026-11-07. Правило: `commercial: true` — можно в коммерческие видео; `verify` — только ознакомление.

## MIT — код можно копировать и использовать коммерчески

| Источник | Лицензия | Доказательство | Коммерческое |
|---|---|---|---|
| Opus Motion Library (GovinduSasanka/opus-motion-library) | MIT | `sources/opus-motion-library/LICENSE` — «MIT License, Copyright (c) 2026 Govindu Sasanka» | ✅ да |
| RenderComp free-remotion-templates | MIT | `sources/free-remotion-templates/LICENSE` + SPDX-заголовки в файлах | ✅ да |
| reactvideoeditor/remotion-templates | MIT (грант в README) | README, раздел License: «All templates in this repository are available under the MIT License. You can use them in personal and commercial projects…» (файла LICENSE в репо нет — грант текстом в README) | ✅ да |
| Компоненты video-studio (VSL-*) | MIT | Собственная разработка этой студии | ✅ да |

## Reference-only — код/ассеты НЕ включать в коммерческие видео

| Источник | Причина | Что разрешено |
|---|---|---|
| ali-abassi/remotion-templates (~1000 шаблонов) | Лицензия НЕ указана (нет LICENSE, нет гранта в README); сам репозиторий предупреждает о проверке происхождения | Ссылка, описание, идеи |
| Skillry.dev (бесплатные скиллы) | Лицензия на карточках/страницах скиллов не раскрыта (только общий ToS, © Skillry) | Ссылка, описание |
| Motion Canvas examples | MIT, но другой фреймворк — прямое использование в Remotion невозможно | Идеи/разборы приёмов (сами примеры MIT — при желании можно портировать самому) |
| aicssanimations.com/inspiration | Свободные работы — **CC0** («use the prompts or the video however you like»); Premium-работы не используем; код не публикуется — только промпты и видео | CC0-работы: идеи, промпты, видео; коммерчески пригодны |
| artiphik.com (212 таймкодов) | Контент принадлежит YouTube-каналам (Vox, Johnny Harris и др.); сайт лишь линкует оригиналы | Просмотр/анализ приёмов по таймкодам |
| lottiefiles.com/free-animations | Лицензия указывается на странице каждой анимации (lottiefiles.com/page/license) — по-элементно | Ссылки/описания; перед использованием конкретного файла — проверять его лицензию |
| animode.app/explore | Галерея вдохновения; лицензия на работы не заявлена; ремикс — их платный инструмент | Просмотр, анализ стиля |
| kisto.app/inspiration | Лента ссылок на авторов (The Mill, SEHSUCHT и др.); контент принадлежит создателям | Мудборд, анализ |

## Добавлено из awesome-claude-video-skills (2026-11-08)

| Источник | Лицензия | Что установлено |
|---|---|---|
| iart-ai/*-skills (7 паков: tiktok-video, data-animation, explainer-video, map-animation, kinetic-typography, lower-thirds) | **MIT** | 13 скиллов в `~/.agents/skills/` (short-form-video, chart-animation, diagram-animation, wrapped-video, whiteboard-animation, isometric-animation, animated-infographic, caption-animation, countdown-video, presentation-video, explainer-video, map-animation, kinetic-typography, lower-thirds); рендер Remotion/Manim; «deliver-and-verify loop» |
| Barty-Bart/motion-graphics | **MIT** + assets OFL (Geist) / ISC (Lucide) / CC0 (SFX) | 6 скиллов: explainer-default, explainer-engaging, explainer-high-energy, motion-broll, object-separation, sound-effects |
| digitalsamba/claude-code-video-toolkit | **MIT** | клон в `sources/digitalsamba-video-toolkit/`; 7 переходов добавлены в каталог (DGT-TRANS-001..007, код по месту); AI-ген части тулкита (Qwen3-TTS/FLUX/LTX-2 на облачном GPU) НЕ используем |

Пропущены по лицензиям/зависимостям: onetake (PolyForm Noncommercial — коммерция только через $79 Pro), vibe-motion/skills (заброшен, CC BY-NC ассеты), vox-director (MIT, но требует платный Atlas Cloud API), explainroo (MIT, но без русской TTS — используем как reference для стилей), manim_skill (тяжёлый LaTeX-стек), hyperframes (медленный в бенчмарке).

## Замечания по зависимостям
- Remotion сам по себе source-available: бесплатно для частных лиц и компаний ≤3 человек; для больших команд — лицензия remotion.dev/license. Это касается любого рендера в этой студии.
