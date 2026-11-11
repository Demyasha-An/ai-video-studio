/**
 * Сборка каталога видео-референсов video-studio.
 * Копирует кураторные MIT-компоненты из sources/ в templates/ и генерирует catalog.json + catalog.md.
 *
 * Правила лицензий:
 *  - MIT (opus / rendercomp / rve / studio) — код копируется, коммерческое использование разрешено.
 *  - NOT-STATED (ali-abassi, skillry) — ТОЛЬКО ссылка и описание, код не копируется.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url))); // reference-library
const SRC = path.join(ROOT, "sources");
const TPL = path.join(ROOT, "templates");

const LICENSES = {
  opus: { license: "MIT", commercial: true, source_url: "https://github.com/GovinduSasanka/opus-motion-library", note: "LICENSE в корне репозитория (c) 2026 Govindu Sasanka" },
  rendercomp: { license: "MIT", commercial: true, source_url: "https://github.com/RenderComp/free-remotion-templates", note: "LICENSE в корне репозитория + SPDX-заголовки в файлах" },
  rve: { license: "MIT", commercial: true, source_url: "https://github.com/reactvideoeditor/remotion-templates", note: "Грант MIT в README (раздел License); файла LICENSE нет — сохранена цитата в LICENSES.md" },
  studio: { license: "MIT", commercial: true, source_url: "https://github.com/", note: "Оригинальные компоненты video-studio (написаны для TestReels/библиотеки)" },
  mcanvas: { license: "MIT", commercial: true, source_url: "https://github.com/motion-canvas/examples", note: "Другой фреймворк (Motion Canvas) — только референс/идея, в Remotion-пайплайн не интегрируется" },
  ali: { license: "NOT-STATED", commercial: "verify", source_url: "https://github.com/ali-abassi/remotion-templates", note: "Лицензия не указана — только ознакомление, код в коммерческие видео не включать" },
  skillry: { license: "NOT-STATED", commercial: "verify", source_url: "https://skillry.dev/skills", note: "Бесплатные скиллы без заявленной лицензии — только ознакомление" },
  aicss: { license: "CC0 (free-работы)", commercial: true, source_url: "https://www.aicssanimations.com/inspiration", note: "Свободные работы — CC0 («use the prompts or the video however you like»); Premium-работы не используем; код не публикуется — только промпты" },
  artiphik: { license: "NOT-STATED", commercial: "verify", source_url: "https://artiphik.com/tools/motion-graphics-examples", note: "Таймкод-ссылки на чужие YouTube-ролики (Vox и др.) — контент принадлежит авторам; только просмотр/анализ" },
  lottie: { license: "LottieFiles (по элементу)", commercial: "verify", source_url: "https://lottiefiles.com/free-animations/infographic", note: "Лицензия указывается на странице каждой анимации; проверять перед коммерческим использованием" },
  animode: { license: "NOT-STATED", commercial: "verify", source_url: "https://www.animode.app/explore", note: "Галерея вдохновения; ремикс — их платный инструмент; лицензия на работы не заявлена" },
  kisto: { license: "NOT-STATED", commercial: "verify", source_url: "https://kisto.app/inspiration/motion-design", note: "Лента ссылок на авторов; контент принадлежит создателям — только мудборд" },
  digi: { license: "MIT", commercial: true, source_url: "https://github.com/digitalsamba/claude-code-video-toolkit", note: "MIT (c) Digital Samba; клон в sources/digitalsamba-video-toolkit; AI-ген части тулкита требуют облачный GPU — не используем" },
};

/** [src, refId/путь, primaryCategory, tags[], title, title_ru, desc_ru] */
const CURATED = [
  // ---------- Заголовки ----------
  ["rendercomp", "bounce-in-headline/BounceInHeadline.tsx", "titles", ["заголовок","spring","влет"], "Bounce-in Headline", "Пружинный влет заголовка", "Две строки заголовка влетают с spring-отскоком, затем стабилизируются. Основа хуковых сцен."],
  ["rendercomp", "gradient-text-sweep/GradientTextSweep.tsx", "titles", ["градиент","блик"], "Gradient Text Sweep", "Градиентный блик по тексту", "Крупный заголовок с бегущим градиентным блеском — премиальный вид для брендов."],
  ["rendercomp", "text-mask-reveal/TextMaskReveal.tsx", "titles", ["маска","видео в тексте"], "Text Mask Reveal", "Ревил видео/изображения внутри текста", "Внутри букв виден фон/видео — кинематографичный приём для главных заголовков."],
  ["rendercomp", "chapter-title/ChapterTitle.tsx", "titles", ["глава","серия"], "Chapter Title", "Титр главы/раздела", "Минималистичный титр с номером главы — для деления ролика на части."],
  ["rve", "title-split.tsx", "titles", ["сплит","две строки"], "Title Split", "Расщепляющийся заголовок", "Строки заголовка расходятся из центра, открывая подзаголовок."],
  ["rve", "cinematic-title-intro.tsx", "titles", ["кино","letterbox"], "Cinematic Title Intro", "Кинематографичный вводный титр", "Титр с letterbox-полосами и медленным появлением — атмосфера трейлера."],
  ["opus", "blur-in-title", "titles", ["блюр","мягко"], "Blur-in Title Card", "Заголовок из расфокуса", "Текст собирается из размытия в резкость — мягкий кинематографичный вход."],
  // ---------- Кинетическая типографика ----------
  ["rendercomp", "kinetic-word-stack/KineticWordStack.tsx", "kinetic", ["стопка","слова"], "Kinetic Word Stack", "Стопка кинетических слов", "Слова вылетают стопкой друг за другом — энергичная кинетическая типографика."],
  ["rendercomp", "scramble-text/ScrambleText.tsx", "kinetic", ["скрэмбл","хаос"], "Scramble Text", "Текст-скрэмбл", "Буквы перебираются случайными символами, собираясь в фразу — техно-эффект."],
  ["rendercomp", "wave-text/WaveText.tsx", "kinetic", ["волна"], "Wave Text", "Волновой текст", "Буквы качаются по синусоиде — игривый ритм для лёгких тем."],
  ["rendercomp", "typewriter/Typewriter.tsx", "kinetic", ["печать","каретка"], "Typewriter", "Печатная машинка", "Классический набор текста с мигающей кареткой."],
  ["rve", "popping-text.tsx", "kinetic", ["поп","слово за словом"], "Popping Text", "Выпрыгивающие слова", "Слова появляются по одному с поп-масштабом — синхрон с речью."],
  ["rve", "bubble-pop-text.tsx", "kinetic", ["пузыри"], "Bubble Pop Text", "Пузырьковый текст", "Буквы всплывают как пузыри с мягким отскоком."],
  ["opus", "blob-to-wordmark", "kinetic", ["жидкость","лого"], "Blob to Wordmark", "Капля собирается в надпись", "Жидкая форма морфится в текст — эффектный брендовый вход."],
  // ---------- Динамические субтитры ----------
  ["rve", "typewriter-subtitle.tsx", "captions", ["субтитры","печать"], "Typewriter Subtitle", "Субтитры-печаталка", "Субтитры набираются синхронно с речью — нижняя треть."],
  ["rve", "lower-third.tsx", "captions", ["нижняя треть","имя"], "Lower Third", "Классическая нижняя треть", "Плашка с именем/должностью въезжает слева — для спикеров."],
  ["rendercomp", "lower-third-glass-card/LowerThirdGlassCard.tsx", "captions", ["стекло","блюр"], "Lower Third Glass Card", "Стеклянная нижняя треть", "Плашка с glass-блюром — современный стиль для заголовков-подписей."],
  ["studio", "caption-bar.tsx", "captions", ["burn-in","reels"], "Caption Bar (safe-zone)", "Субтитровая плашка в безопасной зоне", "Наша реализация из TestReels: строка субтитров с fade на 9:16, y≈1540, тень для читаемости."],
  // ---------- Переходы ----------
  ["rendercomp", "transition-circle-wipe/TransitionCircleWipe.tsx", "transitions", ["круг","вайп"], "Circle Wipe", "Круговой вайп", "Сцена раскрывается кругом — энергичный переход между блоками."],
  ["rendercomp", "slide-wipe/SlideWipe.tsx", "transitions", ["слайд"], "Slide Wipe", "Слайд-вытеснение", "Следующая сцена вытесняет предыдущую сдвигом — чистый монтажный переход."],
  ["rendercomp", "ink-spread-transition/InkSpreadTransition.tsx", "transitions", ["чернила"], "Ink Spread", "Растекание чернил", "Чернильное пятно заливает кадр — арт-переход для сторителлинга."],
  ["rendercomp", "card-flip-transition/CardFlipTransition.tsx", "transitions", ["карта","флип"], "Card Flip", "Переворот карточки", "Сцены как две стороны карточки — 3D-переворот."],
  ["rendercomp", "pixel-mosaic-transition/PixelMosaicTransition.tsx", "transitions", ["пиксели","ретро"], "Pixel Mosaic", "Пиксельная мозаика", "Кадр рассыпается на пиксели и собирается в новый — ретро-гейм стиль."],
  ["rve", "zoom-through.tsx", "transitions", ["зум","врывание"], "Zoom Through", "Зум-насквозь", "Камера врывается сквозь кадр в следующую сцену — динамика Reels."],
  ["rve", "clock-wipe.tsx", "transitions", ["циферблат"], "Clock Wipe", "Вайп-циферблат", "Сектор часов раскрывает новую сцену — ретро-комикс переход."],
  ["rve", "cross-dissolve.tsx", "transitions", ["классика"], "Cross Dissolve", "Кросс-фейд", "Мягкое растворение одной сцены в другую — базовый переход."],
  ["opus", "match-cut", "transitions", ["матч-кат"], "Match Cut", "Матч-кат по форме", "Форма из финала сцены становится началом следующей — монтажная находка."],
  // ---------- Анимация фотографий ----------
  ["rve", "ken-burns.tsx", "photo", ["фото","панорама"], "Ken Burns", "Кен Бёрнс по фото", "Медленный зум и пан по статичному фото — оживление архивных кадров."],
  ["rve", "image-zoom-reveal.tsx", "photo", ["зум","ревил"], "Image Zoom Reveal", "Ревил через зум", "Изображение раскрывается из глубины с масштабированием."],
  ["rve", "photo-stack.tsx", "photo", ["стопка"], "Photo Stack", "Стопка фотографий", "Фото снимаются со стопки по очереди — для серий кадров."],
  ["rve", "polaroid-frame.tsx", "photo", ["полароид"], "Polaroid Frame", "Полароид-снимок", "Фото падает в рамку полароида с лёгким поворотом — уютный стиль."],
  ["rve", "image-carousel.tsx", "photo", ["карусель"], "Image Carousel", "Карусель изображений", "Горизонтальная лента фото с автопрокруткой."],
  ["opus", "film-look", "photo", ["плёнка","грейдинг"], "Film Look", "Плёночный грейдинг", "Стек плёночной обработки: зерно, гало, виньетка — фотография как кадр кино."],
  ["opus", "duotone", "photo", ["дуотон"], "Duotone Recolour", "Дуотон перекраска", "Фото перекрашивается в фирменные два цвета — стильный брендинг."],
  // ---------- Параллакс и масштабирование ----------
  ["rendercomp", "parallax-pan/ParallaxPan.tsx", "parallax", ["слои","пан"], "Parallax Pan", "Параллакс-панорама", "Слои двигаются с разной скоростью — глубина из плоского фото."],
  ["rve", "parallax-pan.tsx", "parallax", ["слои"], "Parallax Pan (RVE)", "Параллакс-пан (второй вариант)", "Многослойный параллакс с горизонтальным ведением камеры."],
  ["rve", "zoom-pulse.tsx", "parallax", ["пульс"], "Zoom Pulse", "Пульсирующий зум", "Ритмичный зум-пульс под бит — держит внимание в Reels."],
  ["opus", "orbit-parallax", "parallax", ["орбита"], "Orbit Parallax", "Орбитальный параллакс", "Камера облетает многослойную сцену — 2.5D глубина."],
  ["mcanvas", "smooth-parallax", "parallax", ["motion canvas","слои"], "Smooth Parallax (Motion Canvas)", "Гладкий параллакс (референс)", "Эталонный разбор плавного параллакса в Motion Canvas — идея для многослойных сцен."],
  // ---------- Цифры и статистика ----------
  ["rendercomp", "kpi-counter/KpiCounter.tsx", "stats", ["kpi","счётчик"], "KPI Counter", "Счётчик KPI", "Число разгоняется до значения с подпрыгом и подписью — для метрик и цен."],
  ["rendercomp", "racing-chart/RacingChart.tsx", "stats", ["гонка","бары"], "Racing Chart", "Гонка баров", "Полосы догоняют друг друга — динамичное сравнение."],
  ["rve", "stat-counter.tsx", "stats", ["счётчик"], "Stat Counter", "Счётчик статистики", "Цифра + подпись с count-up анимацией и пружиной."],
  ["rve", "countdown-timer.tsx", "stats", ["таймер"], "Countdown Timer", "Таймер обратного отсчёта", "Крупный отсчёт с кольцом прогресса — дедлайны и офферы."],
  ["rve", "progress-bars.tsx", "stats", ["прогресс"], "Progress Bars", "Прогресс-бары", "Набор полос заполняется по очереди — наглядные проценты."],
  ["opus", "bar-race", "stats", ["гонка","рейтинг"], "Bar Chart Race", "Гоночная диаграмма", "Рейтинги перетекают со временем — виральная инфографика."],
  ["opus", "big-stat-slide", "stats", ["цифра"], "Big Stat Slide", "Гигантская цифра", "Одна огромная метрика на слайде с влетом — акцент на числе."],
  // ---------- Инфографика ----------
  ["rendercomp", "bar-chart-anim/BarChartAnim.tsx", "infographic", ["бары"], "Bar Chart Anim", "Анимированные бары", "Столбчатая диаграмма вырастает по категориям с подписями."],
  ["rendercomp", "line-chart-anim/LineChartAnim.tsx", "infographic", ["линия","тренд"], "Line Chart Anim", "Линейный тренд", "График рисуется линией с точками данных — тренды и прогнозы."],
  ["rve", "donut-chart.tsx", "infographic", ["донат"], "Donut Chart", "Кольцевая диаграмма", "Донат-чарт с заливкой секторов и легендой."],
  ["rve", "area-chart.tsx", "infographic", ["заливка"], "Area Chart", "Диаграмма-область", "График с заливкой под линией — рост показателя."],
  ["rve", "comparison-chart.tsx", "infographic", ["сравнение"], "Comparison Chart", "Диаграмма сравнения", "Две сущности сравниваются по параметрам — «до/после»."],
  ["rve", "progress-steps.tsx", "infographic", ["шаги"], "Progress Steps", "Шаги процесса", "Пронумерованные шаги подсвечиваются последовательно — инструкции."],
  ["rendercomp", "pourover-drip-fill-gauge/PouroverDripFillGauge.tsx", "infographic", ["гейдж","капли"], "Drip Fill Gauge", "Гейдж с наполнением", "Ёмкость наполняется каплями до процента — необычный индикатор."],
  ["opus", "donut-breakdown", "infographic", ["состав"], "Donut Breakdown", "Разбор доната", "Кольцо распадается на составляющие — структура расходов/причин."],
  // ---------- Карты и гео ----------
  ["opus", "flight-arcs", "maps", ["маршрут","дуги"], "Flight Arcs", "Дуги перелётов", "Великокруговые дуги между городами с точками — маршруты и логистика."],
  ["opus", "pin-drop-cluster", "maps", ["пины"], "Pin Drop + Clustering", "Пины и кластеры", "Пины падают на карту и кластеризуются — география объектов."],
  ["opus", "choropleth-fill", "maps", ["регионы"], "Choropleth Fill", "Хороплет по регионам", "Регионы закрашиваются по значению метрики — районирование."],
  ["opus", "city-zoom-label", "maps", ["город"], "City Zoom + Label", "Зум до города", "Приближение от страны к городу с плашкой-подписью — локальные истории."],
  // ---------- Кинематографичные эффекты ----------
  ["rendercomp", "camera-shake/CameraShake.tsx", "cinematic", ["тряска"], "Camera Shake", "Тряска камеры", "Импульсная тряска для ударов и акцентов."],
  ["rve", "film-burn.tsx", "cinematic", ["плёнка","прожиг"], "Film Burn", "Прожиг плёнки", "Кадр прожигается светом — винтажная склейка сцен."],
  ["rve", "letterbox-reveal.tsx", "cinematic", ["letterbox"], "Letterbox Reveal", "Ревил letterbox", "Чёрные полосы открывают кадр — киношный вход в сцену."],
  ["rve", "vignette-pulse.tsx", "cinematic", ["виньетка"], "Vignette Pulse", "Пульсирующая виньетка", "Затемнение краёв дышит — фокус на центре кадра."],
  ["rve", "noise-grain.tsx", "cinematic", ["зерно"], "Noise Grain", "Плёночное зерно", "Живое зерно поверх видео — фактура плёнки."],
  ["rve", "spotlight-reveal.tsx", "cinematic", ["прожектор"], "Spotlight Reveal", "Ревил прожектором", "Световое пятно раскрывает контент из темноты — сценический эффект."],
  ["rve", "matrix-rain.tsx", "cinematic", ["матрица","код"], "Matrix Rain", "Дождь «Матрицы»", "Падающие символы — технологичные и крипто-темы."],
  ["opus", "rack-focus", "cinematic", ["фокус"], "Rack Focus", "Перевод фокуса", "Резкость переходит между планами — управляет вниманием."],
  ["opus", "crash-zoom", "cinematic", ["врывание"], "Crash Zoom", "Крэш-зум", "Резкий влёт камеры в объект — комиксная энергия."],
  ["opus", "aurora", "cinematic", ["фон","северное сияние"], "Aurora Curtain", "Северное сияние", "Живой аврора-фон — кинематографичный бэкдроп."],
  // ---------- Рекламные ролики ----------
  ["rendercomp", "end-card/EndCard.tsx", "ads", ["финал","лого"], "End Card", "Финальная карточка", "Логотип + слоган + CTA в финале ролика."],
  ["rendercomp", "neon-sign/NeonSign.tsx", "ads", ["неон"], "Neon Sign", "Неоновая вывеска", "Текст зажигается неоном с мерцанием — бары, вечерние офферы."],
  ["rendercomp", "logo-blur-reveal/LogoBlurReveal.tsx", "ads", ["лого"], "Logo Blur Reveal", "Лого из блюра", "Логотип собирается из размытия — чистый брендовый момент."],
  ["rendercomp", "logo-stroke-draw/LogoStrokeDraw.tsx", "ads", ["лого","обводка"], "Logo Stroke Draw", "Лого-росчерк", "Контур логотипа рисуется линией и заливается."],
  ["rve", "subscribe-reminder.tsx", "ads", ["подписка"], "Subscribe Reminder", "Напоминание о подписке", "Анимированная плашка подписки с кнопкой — финал YouTube."],
  ["opus", "flash-deal-timer-card", "ads", ["оффер","скидка"], "Flash Deal Card", "Карточка флеш-оффера", "Таймер + шкала остатка товара — срочность распродажи."],
  ["opus", "feature-callout-orbit", "ads", ["продукт"], "Feature Callouts", "Выноски характеристик", "Подписи-выноски облетают продукт — обзорные ролики."],
  // ---------- Reels / Shorts / TikTok ----------
  ["rendercomp", "social-reel/SocialReel.tsx", "reels", ["reels","соцсети"], "Social Reel", "Соцсеть-рил", "Вертикальный шаблон с зонами под интерфейс платформы."],
  ["rendercomp", "split-screen/SplitScreen.tsx", "reels", ["сплит"], "Split Screen", "Разделённый экран", "Два кадра рядом — реакции и сравнения в вертикали."],
  ["rve", "picture-in-picture.tsx", "reels", ["pip"], "Picture in Picture", "Картинка в картинке", "Малое окно поверх основного кадра — комментаторский стиль."],
  ["rve", "notification-pop.tsx", "reels", ["уведомление"], "Notification Pop", "Всплывающее уведомление", "Push-уведомление выезжает сверху — нативная соцмеханика."],
  ["studio", "vertical-safe-layout.tsx", "reels", ["9:16","безопасные зоны"], "Vertical Safe Layout", "Сетка безопасных зон 9:16", "Наша раскладка Reels-кадра: прогресс-бар, центр контента, субтитры — учёт интерфейса платформ."],
  // ---------- Презентации недвижимости ----------
  ["studio", "price-fall-chart.tsx", "realestate", ["цена","торги"], "Price Fall Chart", "График падения цены", "Наша сцена из TestReels: три этапа торгов и падающая кривая цены."],
  ["studio", "checklist-features.tsx", "realestate", ["чек-лист"], "Checklist Features", "Чек-лист преимуществ", "Пункты с галочками появляются по очереди — требования и выгоды."],
  ["studio", "discount-badge.tsx", "realestate", ["скидка","бейдж"], "Discount Badge", "Бейдж скидки", "Поворотный бейдж −50% с пружиной — акцент на выгоде."],
  ["rve", "image-comparison-slider.tsx", "realestate", ["до/после"], "Image Comparison Slider", "Слайдер до/после", "Шторка сравнения двух фото — ремонт и стадия стройки."],
  ["rve", "masonry-gallery.tsx", "realestate", ["галерея"], "Masonry Gallery", "Галерея-плитка", "Плиточная галерея фото с анимацией появления — подборка объектов."],
  ["opus", "city-skyline", "realestate", ["город","фон"], "City Skyline", "Городской скайлайн", "Живой горизонт города от заката к ночи — урбанистический фон."],
  // ---------- Хуки первых 3 секунд ----------
  ["studio", "hook-punch-headline.tsx", "hooks", ["хук","панч"], "Hook Punch Headline", "Хук-панч заголовком", "Наша сцена из TestReels: ударный влет заголовка с continuous zoom — цепляет в первые секунды."],
  ["rendercomp", "shatter-reveal/ShatterReveal.tsx", "hooks", ["осколки"], "Shatter Reveal", "Разбитие на осколки", "Кадр разбивается на осколки и открывает контент — драматичный хук."],
  ["rendercomp", "glitch-text/GlitchText.tsx", "hooks", ["глитч"], "Glitch Text", "Глитч-текст", "Текст дёргается RGB-сдвигами — техно-интрига."],
  ["rve", "glitch-text.tsx", "hooks", ["глитч"], "Glitch Text (RVE)", "Глитч-текст (второй вариант)", "Вариант с канальными сдвигами и рваными полосами."],
  ["rendercomp", "fireworks-burst/FireworksBurst.tsx", "hooks", ["фейерверк"], "Fireworks Burst", "Фейерверк", "Взрыв частиц-салют — праздничный старт ролика."],
  ["opus", "channel-intro-sting", "hooks", ["стинг","3 секунды"], "Channel Intro Sting", "Интро-стинг 3 с", "Компактное 3-секундное интро канала — готовый хук."],
  ["rve", "countdown-intro.tsx", "hooks", ["отсчёт"], "Countdown Intro", "Интро-отсчёт", "3-2-1 перед стартом — интрига и удержание."],
  // ---------- Финальные CTA ----------
  ["studio", "cta-subscribe-badge.tsx", "cta", ["cta","подписка"], "CTA Subscribe Badge", "CTA-кнопка «Подпишись»", "Наша сцена из TestReels: янтарная плашка с пружинным панчем."],
  ["rve", "end-card.tsx", "cta", ["финал"], "End Card (RVE)", "Финальная карточка (RVE)", "Завершающая сцена с лого, текстом и CTA."],
  ["rendercomp", "logo-bounce-drop/LogoBounceDrop.tsx", "cta", ["лого","падение"], "Logo Bounce Drop", "Лого с падением", "Логотип падает с отскоком — бодрое завершение."],
  ["opus", "confetti-burst", "cta", ["конфетти"], "Confetti Burst", "Взрыв конфетти", "Конфетти на финальном CTA — празднование действия."],
  ["rendercomp", "starfield/Starfield.tsx", "cinematic", ["звёзды","фон"], "Starfield", "Звёздное небо", "Параллакс-полёт сквозь звёзды — футуристичный фон."],
];

const SRC_PATHS = {
  rendercomp: (p) => path.join(SRC, "free-remotion-templates", "src", "components", p),
  rve: (p) => path.join(SRC, "remotion-templates", "templates", p),
  opus: (p) => {
    // ищем файл компонента по id в src/motions/**/
    const hits = findOpus(p);
    return hits[0] || path.join(SRC, "opus-motion-library", "src", "motions", p);
  },
  studio: (p) => null, // копируем из compositions/src/lib/library (создаются отдельно)
  mcanvas: () => null,
};

let opusFiles = null;
function findOpus(id) {
  if (!opusFiles) {
    const base = path.join(SRC, "opus-motion-library", "src", "motions");
    const out = [];
    const walk = (d) => {
      for (const e of fs.readdirSync(d, { withFileTypes: true })) {
        const p = path.join(d, e.name);
        if (e.isDirectory()) walk(p);
        else if (e.name.endsWith(".tsx") || e.name.endsWith(".ts")) out.push(p);
      }
    };
    walk(base);
    opusFiles = out;
  }
  // id в каталоге Opus совпадает с именем каталога компонента: <cat>/<id>/...
  const byDir = opusFiles.filter((p) => p.toLowerCase().split(path.sep).includes(id.toLowerCase()));
  if (byDir.length) return byDir;
  return opusFiles.filter((p) => p.toLowerCase().includes(id.toLowerCase()));
}

const PREF = { opus: "OML", rendercomp: "RCE", rve: "RVE", studio: "VSL", mcanvas: "MC" };
const counters = {};
const entries = [];
const missing = [];

for (const [src, ref, cat, tags, title, titleRu, desc] of CURATED) {
  const catCode = cat.slice(0, 4).toUpperCase();
  const key = `${src}-${cat}`;
  counters[key] = (counters[key] || 0) + 1;
  const id = `${PREF[src]}-${catCode}-${String(counters[key]).padStart(3, "0")}`;
  const L = LICENSES[src];

  let codePath = null;
  if (src === "rendercomp") {
    const dest = path.join(TPL, "rendercomp", `${ref.split("/")[1]}`);
    codePath = path.relative(ROOT, dest).replaceAll("\\", "/");
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(SRC_PATHS.rendercomp(ref), dest);
  } else if (src === "rve") {
    const dest = path.join(TPL, "rve", ref);
    codePath = path.relative(ROOT, dest).replaceAll("\\", "/");
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(SRC_PATHS.rve(ref), dest);
  } else if (src === "opus") {
    const hit = findOpus(ref)[0];
    if (hit) codePath = path.relative(ROOT, hit).replaceAll("\\", "/");
    else missing.push([id, ref]);
  } else if (src === "studio") {
    codePath = `../compositions/src/lib/library/${ref}`;
  } else if (src === "mcanvas") {
    codePath = `sources-url: https://github.com/motion-canvas/examples (npm run smooth-parallax)`;
  }

  entries.push({
    id,
    source: src,
    source_url: L.source_url,
    license: L.license,
    commercial: L.commercial,
    license_note: L.note,
    ref_id: ref,
    category: cat,
    tags,
    title,
    title_ru: titleRu,
    description: desc,
    code_path: codePath,
    demo: `demos/demo-player.html?id=${id}`,
    added: "2026-11-07",
  });
}

// =======================================================================
// СОВРЕМЕННЫЕ РЕФЕРЕНСЫ (расширение 2026-11-07): инфографика, данные, финансы,
// кинетика, редакционная графика, минимализм, 3D, UI, недвижимость, Reels.
// Новые поля: style, timing, free, has_code, modern.
// =======================================================================

const MODERN_CATEGORIES = [
  ["ainfo", "Animated Infographics — анимированная инфографика"],
  ["dataviz", "Data Visualization — визуализация данных"],
  ["financial", "Financial Graphics — финансовая графика"],
  ["amaps", "Animated Maps — анимированные карты"],
  ["ktypo", "Kinetic Typography — движущийся текст"],
  ["editorial", "Editorial Motion — документальная графика"],
  ["explainer", "Explainer Motion — объясняющие анимации"],
  ["minimalism", "Modern Minimalism — современный минимализм"],
  ["threed", "3D Motion — объёмная графика"],
  ["uimotion", "UI Motion — анимации интерфейсов"],
  ["restatemotion", "Real Estate Motion — графика для недвижимости"],
  ["premiumsocial", "Premium Social Video — оформление современных Reels"],
];

/** Современные референсы: [src, ref, cat, tags, title, title_ru, desc, style, timing] */
const MODERN = [
  // --- Opus data (MIT, код локально) ---
  ["opus", "funnel-conversion", "ainfo", ["воронка","конверсия"], "Funnel Conversion", "Воронка конверсии", "Ступени воронки сужаются с анимированными значениями на каждом этапе.", "плоская инфографика, ограниченная палитра", "4–6 с, ступени по 0.6–0.8 с"],
  ["opus", "sankey-flow", "dataviz", ["санкеи","потоки"], "Sankey Flow", "Диаграмма Санкея", "Потоки между узлами перетекают лентами — структура бюджета или трафика.", "ленточные потоки, полупрозрачность", "5–8 с, каскадное раскрытие"],
  ["opus", "heatmap-calendar", "dataviz", ["хитмап","календарь"], "Heatmap Calendar", "Календарный хитмап", "Сетка дней заливается по активности — GitHub-стиль.", "минимализм, сетка", "3–5 с, волна заливки"],
  ["opus", "treemap-split", "dataviz", ["тайлмап","доли"], "Treemap Split", "Трипл-карта долей", "Область делится на блоки по долям с подписями.", "плоские блоки, плотная сетка", "4–6 с"],
  ["opus", "waterfall-bridge", "financial", ["водопад","p&l"], "Waterfall Bridge", "Водопадный график", "Столбцы-мостики показывают вклад факторов в итог — P&L, смета.", "финансовый минимализм", "5–7 с, столбец за столбцом"],
  ["opus", "radar-compare", "dataviz", ["радар","сравнение"], "Radar Compare", "Лепестковая диаграмма", "Два многоугольника наполняются по осям — сравнение параметров.", "техничная графика", "4–6 с"],
  ["opus", "gauge-kpi-dial", "financial", ["гейдж","kpi"], "Gauge KPI Dial", "Спидометр KPI", "Стрелка доезжает до значения по дуге с делениями.", "dashboard-стиль", "2–3 с на стрелку"],
  ["opus", "network-graph", "dataviz", ["сеть","граф"], "Network Graph", "Сетевой граф", "Узлы и связи вырастают из центра — инфраструктура, соцграфы.", "схематичный, тонкие линии", "4–7 с, волна узлов"],
  ["opus", "gantt-timeline", "ainfo", ["гантт","проект"], "Gantt Timeline", "Диаграмма Ганта", "Полосы задач протягиваются по оси времени с зависимостями.", "проектный минимализм", "5–8 с"],
  ["opus", "timeline-ruler", "editorial", ["хронология","события"], "Timeline Ruler", "Линейка времени с событиями", "Ось с карточками событий въезжают по датам — документальный монтаж.", "editorial, крупные даты", "6–10 с, событие за событием"],
  ["opus", "progress-rings-stats", "ainfo", ["кольца","проценты"], "Progress Rings Stats", "Кольца прогресса", "Несколько колец заполняются до процентов с подписями.", "минимализм, тонкие кольца", "3–4 с"],
  ["opus", "dot-tally", "dataviz", ["точки","люди"], "Dot Tally", "Точечная диаграмма людей", "Каждая точка — человек/единица; подсветка нужной доли волной.", "инфографика «людьми»", "3–5 с, волна подсветки"],
  ["opus", "comparison-dumbbell", "financial", ["сравнение","до/после"], "Comparison Dumbbell", "Гантельное сравнение", "Две точки на оси соединяются штангой — было/стало.", "финансовый минимализм", "3–5 с"],
  ["opus", "cause-effect-chain", "explainer", ["причина","следствие"], "Cause & Effect Chain", "Цепочка причина → следствие", "Блоки связаны стрелками и загораются последовательно.", "схематичный explainer", "5–8 с"],
  ["opus", "chip-stack-bars", "financial", ["стек","бары"], "Chip Stack Bars", "Стопки фишек", "Столбцы из стопок-фишек растут — объёмы и накопления.", "тактильная 2.5D", "4–6 с"],
  ["opus", "budget-envelope-split", "financial", ["бюджет"], "Budget Envelope Split", "Разделение бюджета", "Конверт бюджета делится на части по статьям.", "иллюстративный финанс", "5–7 с"],
  // --- VSL оригиналы (MIT, код в compositions/src/lib/library) ---
  ["studio", "price-compare-bars.tsx", "financial", ["сравнение цен","бары","торги"], "Price Compare Bars", "Сравнение двух цен (современно)", "Две горизонтальные полосы: рыночная цена и цена торгов, count-up цифр, дельта −35%. Тестовый референс темы «8 млн дешевле на торгах».", "минимализм, крупная цифра, tabular-nums", "4 с: полосы 0.3–1.8 с, дельта 2.2 с"],
  ["studio", "discount-ring.tsx", "ainfo", ["скидка","кольцо","процент"], "Discount Ring", "Кольцо процента скидки", "Кольцо заполняется до −35% с count-up в центре и подписью-дисклеймером.", "минимализм, одноцветное кольцо", "3 с: кольцо 0.3–2.0 с"],
  ["studio", "number-punch.tsx", "ktypo", ["цифра","панч","типографика"], "Number Punch", "Панч-цифры", "Крупные цифры бьют в кадр с глитч-фейдом и сдвигом масштаба — эффектный вход цены.", "кинетическая типографика, резкий панч", "2–3 с, удары по 0.25 с"],
  ["studio", "minimal-price-card.tsx", "minimalism", ["карточка","цена"], "Minimal Price Card", "Минималистичная карточка цены", "Карточка со старой/новой ценой, тонкая линия-зачёркивание, аккуратная дельта.", "швейцарский минимализм", "3–4 с"],
  ["studio", "restate-price-reveal.tsx", "restatemotion", ["недвижимость","цена"], "Real Estate Price Reveal", "Ревил цены объекта", "Фото-заглушка объекта + выезжающая плашка с ценой торгов и площадью.", "премиальная недвижимость, стекло", "4 с"],
  ["studio", "premium-social-frame.tsx", "premiumsocial", ["reels","рамка"], "Premium Social Frame", "Рамка премиального Reels", "Вертикальный кадр с прогрессом, безопасными зонами и крупным числовым акцентом — оформление современных Reels.", "премиум, тёмный фон, янтарный акцент", "цикл 4 с"],
  // --- Ссылки-референсы (без копирования материалов) ---
  ["aicss", "kinetic-bauhaus", "ktypo", ["CC0","css","баухаус"], "AI CSS: Kinetic Typography (107 работ)", "Кинетическая типографика (коллекция CC0)", "Галерея 430 CSS/JS-анимаций; раздел кинетики — 107 работ. Свободные работы CC0: «use the prompts or the video however you like»; промпты открыты — можно перегенерировать самому.", "варьируется (генератив)", "варьируется"],
  ["aicss", "dataviz-picks", "dataviz", ["CC0","css"], "AI CSS: Data Visualization (подборка)", "Визуализация данных (коллекция CC0)", "Свободные работы по data-viz в той же галерее; коммерчески пригодны (CC0), код не публикуется — только промпты и видео.", "генератив-минимализм", "варьируется"],
  ["aicss", "threed-picks", "threed", ["CC0","three.js"], "AI CSS: 3D Motion Design (104 работы)", "3D-графика (коллекция CC0)", "Раздел 3D: three.js-сцены (Bauhaus Geometry, Mandelbrot Zoom и др.); CC0-часть свободна для коммерции.", "3D, неон, глубина", "варьируется"],
  ["artiphik", "infographic-moments", "editorial", ["vox","таймкоды"], "Artiphik: Infographic moments (77)", "Инфографика редакционных видео", "212 таймкодов моментов из Vox/Johnny Harris/Cleo Abram и др.; клик открывает YouTube в точную секунду. Только ссылки на оригиналы — копировать кадры нельзя.", "editorial motion (Vox-стиль)", "по 2–8 с на момент"],
  ["artiphik", "chart-moments", "dataviz", ["диаграммы","таймкоды"], "Artiphik: Chart moments (36)", "Диаграммы в редакционной графике", "36 моментов с графиками из документальных каналов; референс композиции и тайминга.", "editorial, аннотированные графики", "по 3–6 с"],
  ["artiphik", "map-moments", "amaps", ["карты","таймкоды"], "Artiphik: Map moments (22)", "Карты в редакционной графике", "22 картографических приёма (маршруты, подсветки стран) с таймкодами.", "editorial maps", "по 3–8 с"],
  ["artiphik", "typography-moments", "ktypo", ["титры","таймкоды"], "Artiphik: Typography moments (56)", "Типографика редакционных видео", "56 моментов кинетической типографики из документалистов.", "editorial type", "по 1–4 с"],
  ["lottie", "infographic-free", "ainfo", ["lottie","json"], "LottieFiles: Free infographic (161)", "Бесплатные Lottie-инфографики", "161 бесплатная анимация (GIF/MP4/Lottie JSON): Growth Chart, Pie Chart, Dynamic Bar Graph и др. Лицензия — по элементу на странице item (lottiefiles.com/page/license); перед коммерческим использованием проверять конкретный файл.", "разнообразный (авторский)", "варьируется"],
  ["lottie", "free-charts", "dataviz", ["lottie","графики"], "LottieFiles: Growth/Line/Pie charts", "Графики Growth/Line/Pie (Lottie)", "Популярные бесплатные графики с JSON-исходниками на источнике; лицензия по-элементно.", "флэт-иллюстрация", "2–4 с"],
  ["animode", "explore-picks", "explainer", ["remix","генерация"], "Animode Explore (галерея)", "Галерея Explainer-работ", "Комьюнити-работы: revenue charts, S&P line, lower thirds, pie market share. Просмотр свободен; ремикс — их платный инструмент (не используем). Референс композиции/стиля.", "чистый SaaS-минимализм", "3–8 с"],
  ["animode", "maps-picks", "amaps", ["маршруты"], "Animode: Map tracing works", "Трассировка маршрутов на картах", "Europe route tracing, SE Asia highlights — референс для маршрутных объяснений.", "линейная карта, обводки", "4–7 с"],
  ["kisto", "motion-feed", "premiumsocial", ["мудборд","студии"], "Kisto: Motion design feed", "Лента современного motion-дизайна", "Ежедневная подборка работ студий (The Mill, SEHSUCHT, DixonBaxi…) со ссылками на авторов. Reference-only: moodboard для стиля и тайминга.", "премиум, разный", "варьируется"],
  ["kisto", "kinetic-feed", "ktypo", ["титры","бродкаст"], "Kisto: Kinetic Typography feed", "Бродкаст-кинетика", "Раздел кинетической типографики из 200+ источников — эталоны бродкаст-титров.", "бродкаст, плотный монтаж", "1–5 с"],
  // --- digitalsamba/claude-code-video-toolkit: 7 кастомных Remotion-переходов (MIT, клон локально) ---
  ["digi", "glitch.tsx", "transitions", ["глитч","цифровой"], "Glitch Transition (DGT)", "Глитч-переход (Digital Samba)", "Кадр рвётся цифровыми помехами с RGB-каналами и рваными полосами в момент смены сцены.", "техно/глитч, резкий", "8–14 кадров на переход"],
  ["digi", "rgb-split.tsx", "transitions", ["rgb","сдвиг каналов"], "RGB Split (DGT)", "Разделение RGB-каналов", "Каналы расходятся в стороны и схлопываются обратно — кислотный переход.", "неон/кислота", "6–10 кадров"],
  ["digi", "pixelate.tsx", "transitions", ["пиксели"], "Pixelate (DGT)", "Пиксельный переход", "Кадр мозаично огрубляется и проявляется в новую сцену.", "ретро-гейм", "10–16 кадров"],
  ["digi", "zoom-blur.tsx", "transitions", ["зум","блюр"], "Zoom Blur (DGT)", "Зум с размытием", "Камера врывается в следующую сцену через радиальное размытие.", "динамика Reels", "8–12 кадров"],
  ["digi", "light-leak.tsx", "transitions", ["свет","плёнка"], "Light Leak (DGT)", "Световой засвет", "Тёплый световой поток перекрывает стык кадров — плёночная склейка.", "винтаж/плёнка", "12–20 кадров"],
  ["digi", "checkerboard.tsx", "transitions", ["шахматка"], "Checkerboard (DGT)", "Шахматный переход", "Плитки шахматного поля закрывают и открывают кадр.", "графичный, игра", "12–18 кадров"],
  ["digi", "clock-wipe.tsx", "transitions", ["циферблат","вайп"], "Clock Wipe (DGT)", "Часовой вайп (DGT)", "Сектор по кругу раскрывает новую сцену — бродкаст-классика.", "бродкаст/ретро", "10–16 кадров"],
];

// --- reference-only источники (без копирования кода) ---
const REF_ONLY = [
  {
    id: "ALI-REF-001", source: "ali", title: "Remotion Templates for AI Agents (1000+)", title_ru: "Библиотека 1000 Remotion-шаблонов для агентов",
    description: "Поисковая библиотека из ~1000 шаблонов в 100 семействах с превью, agent-catalog.json и SKILL.md. ЛИЦЕНЗИЯ НЕ УКАЗАНА — использовать только для вдохновения; перед коммерческим использованием связаться с автором.",
    category: "titles", tags: ["референс","каталог","без лицензии"], commercial: "verify",
    source_url: "https://github.com/ali-abassi/remotion-templates",
  },
  {
    id: "SKILLRY-REF-001", source: "skillry", title: "Skillry free video skills (42 free)", title_ru: "Бесплатные видео-скиллы Skillry",
    description: "Маркетплейс скиллов: 42 бесплатных, из них 359 видео-скиллов всего (Plush Crew Launch Video, Paper Cutout Story Video, LaunchMotion-паки). ЛИЦЕНЗИЯ НА СТРАНИЦАХ НЕ РАСКРЫТА (только ToS) — код/ассеты в коммерческие видео не включать без проверки ToS.",
    category: "ads", tags: ["референс","скиллы","без лицензии"], commercial: "verify",
    source_url: "https://skillry.dev/skills",
  },
];

// --- Современные референсы ---
const MOD_PREFIX = { opus: "OML", studio: "VSL", aicss: "ACS", artiphik: "ART", lottie: "LTF", animode: "ANM", kisto: "KIS", digi: "DGT" };
const modCounters = {};
const modEntries = [];
for (const [src, ref, cat, tags, title, titleRu, desc, style, timing] of MODERN) {
  const catCode = cat.slice(0, 5).toUpperCase();
  const key = `${src}-${cat}`;
  modCounters[key] = (modCounters[key] || 0) + 1;
  const id = `${MOD_PREFIX[src]}-${catCode}-${String(modCounters[key]).padStart(3, "0")}`;
  const L = LICENSES[src];

  let codePath = null;
  let hasCode = false;
  if (src === "opus") {
    const hit = findOpus(ref)[0];
    if (hit) { codePath = path.relative(ROOT, hit).replaceAll("\\", "/"); hasCode = true; }
    else missing.push([id, ref]);
  } else if (src === "studio") {
    codePath = `../compositions/src/lib/library/${ref}`;
    hasCode = true;
  } else if (src === "digi") {
    const hit = path.join(SRC, "digitalsamba-video-toolkit", "lib", "transitions", "presentations", ref);
    if (fs.existsSync(hit)) { codePath = path.relative(ROOT, hit).replaceAll("\\", "/"); hasCode = true; }
    else missing.push([id, ref]);
  }
  // aicss: CC0 видео+промпты, но не код; lottie: JSON у автора (не скачивали); artiphik/animode/kisto — reference-only

  modEntries.push({
    id,
    source: src,
    source_url: L.source_url,
    license: L.license,
    commercial: L.commercial,
    license_note: L.note,
    ref_id: ref,
    category: cat,
    tags,
    title,
    title_ru: titleRu,
    description: desc,
    style,
    timing,
    code_path: codePath,
    has_code: hasCode,
    free: true,
    modern: true,
    demo: `demos/demo-player.html?id=${id}`,
    added: "2026-11-07",
  });
}

const catalog = {
  name: "video-studio reference library",
  version: "2.0.0",
  built: "2026-11-07",
  categories: [
    ["titles", "Анимированные заголовки"], ["kinetic", "Кинетическая типографика"], ["captions", "Динамические субтитры"],
    ["transitions", "Переходы между сценами"], ["photo", "Анимация фотографий"], ["parallax", "Параллакс и масштабирование"],
    ["stats", "Анимация цифр и статистики"], ["infographic", "Инфографика"], ["maps", "Карты и гео"],
    ["cinematic", "Кинематографичные эффекты"], ["ads", "Рекламные ролики"], ["reels", "Reels / Shorts / TikTok"],
    ["realestate", "Презентации недвижимости"], ["hooks", "Хуки первых 3 секунд"], ["cta", "Финальные призывы к действию"],
    ...MODERN_CATEGORIES,
  ],
  modern_categories: MODERN_CATEGORIES.map(([slug]) => slug),
  licensing_summary: {
    mit_commercial_ok: ["opus", "rendercomp", "rve", "studio"],
    cc0_free: ["aicss (свободные работы; Premium не используем)"],
    reference_only: [
      "mcanvas (MIT, но другой фреймворк — идеи)",
      "ali (лицензия не указана)", "skillry (лицензия не указана)",
      "artiphik (чужие YouTube-ролики, только таймкод-ссылки)",
      "lottie (лицензия по элементу — проверять)",
      "animode (галерея вдохновения, ремикс платный)",
      "kisto (лента ссылок на авторов)",
    ],
    rule: "NOT-STATED / verify: не копировать код/ассеты/кадры в коммерческие видео; использовать для анализа приёмов и самостоятельного воспроизведения.",
  },
  items: [...entries, ...REF_ONLY, ...modEntries],
};

// --- обогащение старых записей единой схемой ---
for (const it of catalog.items) {
  if (it.free === undefined) it.free = true;
  if (it.modern === undefined) it.modern = false;
  if (it.has_code === undefined) {
    it.has_code = Boolean(it.code_path) && !String(it.code_path).startsWith("sources-url");
  }
  if (it.style === undefined) it.style = "";
  if (it.timing === undefined) it.timing = "";
}

fs.writeFileSync(path.join(ROOT, "catalog.json"), JSON.stringify(catalog, null, 1), "utf-8");

// catalog.md
const byCat = {};
for (const it of catalog.items) (byCat[it.category] ||= []).push(it);
let md = `# Каталог видео-референсов (${catalog.items.length} позиций)\n\nСобран 2026-11-07. Полные данные: \`catalog.json\`. Галерея: \`gallery/index.html\`.\n\n`;
for (const [slug, ru] of catalog.categories) {
  md += `## ${ru} (${slug})\n\n`;
  for (const it of byCat[slug] || []) {
    md += `- **${it.id}** — ${it.title_ru} / ${it.title} · ${it.license}${it.commercial === true ? " · коммерч. ✅" : it.commercial === "verify" ? " · ⚠️ только ознакомление" : ""} · демо: \`${it.demo}\`\n`;
  }
  md += "\n";
}
fs.writeFileSync(path.join(ROOT, "catalog.md"), md, "utf-8");

const modernN = modEntries.length;
const codeN = catalog.items.filter((i) => i.has_code).length;
const commN = catalog.items.filter((i) => i.commercial === true).length;
console.log(`catalog.json v2: всего ${catalog.items.length} (базовых ${entries.length + REF_ONLY.length} + современных ${modernN}) | с кодом: ${codeN} | коммерч. OK: ${commN}`);
console.log("missing opus refs:", missing.length ? missing : "нет");
console.log("categories:", Object.entries(byCat).map(([k, v]) => `${k}:${v.length}`).join(", "));
