/* ============================================================
   VSX Top500 — i18n module (RU / EN). Общий для всех страниц.
   Использование:
     I18N.t("key", {var: value})         — получить строку
     <el data-i18n="key">                — textContent
     <el data-i18n-html="key">           — innerHTML
     <el data-i18n-placeholder="key">    — placeholder
     <el data-i18n-title="key">          — title
     <el data-i18n-aria="key">           — aria-label
     <button data-lang-btn="ru|en">      — переключатель языка
   ============================================================ */

(() => {
  "use strict";

  const STORAGE_KEY = "vsx_lang";

  const DICT = {
    ru: {
      // ---------- Общее / шапка ----------
      "page.title": "Топ‑500 расширений VS Code — обновляется ежедневно",
      "page.desc": "Рейтинг 500 самых популярных расширений Visual Studio Code с ежедневным обновлением, подборками (ИИ, Python, игры и другие) и подробной информацией на русском и английском.",
      "nav.home": "Главная",
      "nav.rating": "Рейтинг",
      "nav.firstDay": "Первый день",
      "nav.kits": "Наборы",
      "nav.lessons": "Уроки",
      "nav.lifehacks": "Лайфхаки",
      "nav.prompts": "Промпты",
      "nav.settings": "Настройки",
      "nav.avoid": "Не ставить",
      "nav.publishers": "Разработчики",
      "nav.about": "О сайте",
      "nav.refresh": "Обновить",
      "nav.refreshTitle": "Принудительно обновить данные",
      "nav.langLabel": "Язык сайта",
      "nav.favs": "Мои",
      "nav.favsTitle": "Мои расширения — избранное",
      "nav.picker": "Подбор",
      "nav.pickerTitle": "Подобрать набор за 3 вопроса",
      "nav.generator": "Генератор",
      "nav.generatorTitle": "Создать extensions.json для .vscode",
      "nav.back": "Главное меню",
      "nav.backTitle": "Вернуться на главную — рейтинг и подборки",
      "theme.toLight": "Включить светлую тему",
      "theme.toDark": "Включить тёмную тему",

      // ---------- Hero ----------
      "hero.loading": "Загружаем данные…",
      "hero.titleA": "Топ‑",
      "hero.titleB": " расширений",
      "hero.titleC": "для Visual Studio Code",
      "hero.sub": "Рейтинг строится по живым данным Visual Studio Marketplace и автоматически обновляется раз в сутки. Выбирайте подборку — ИИ, Python, игры и другие. Нажмите на карточку — откроется подробная информация. Расширения с бейджем «Спонсор» можно поддержать.",
      "stat.installs": "установок суммарно",
      "stat.rating": "средний рейтинг",
      "stat.publishers": "издателей в топе",
      "stat.next": "до следующего обновления",

      // ---------- Подборки / тулбар ----------
      "collections.title": "Подборки",
      "collections.sub": "Быстрый переход к расширениям по темам: лучшие для Python, для программистов, создание игр, ИИ, веб и другие",
      "toolbar.search": "Поиск по названию, издателю, тегам…",
      "toolbar.allCats": "Все категории",
      "toolbar.sortLabel": "Сортировка",
      "sort.installs": "По установкам",
      "sort.rating": "По рейтингу",
      "sort.ratings": "По числу оценок",
      "sort.trending": "По росту за неделю",
      "sort.trendingMonth": "По росту за месяц",
      "sort.updated": "По дате обновления",
      "sort.published": "По дате публикации",
      "sort.name": "По алфавиту",
      "view.grid": "Сетка",
      "view.list": "Список",

      // ---------- Статусы / мета ----------
      "status.loading": "Загружаем данные Marketplace…",
      "status.error": "Ошибка загрузки",
      "status.updateFail": "Не удалось обновить ({msg}). Показаны данные от {date}.",
      "status.ok": "Обновлено {date} · следующее обновление в полночь",
      "error.title": "Не удалось загрузить данные Marketplace.",
      "error.check": "{msg}. Проверьте подключение к интернету.",
      "error.retry": "Повторить",
      "empty.text": "Ничего не найдено. Попробуйте изменить запрос или фильтры.",
      "meta.dataFrom": "Данные от {date}",
      "meta.cache": " (кеш на сегодня)",
      "meta.shown": "Показано {a} из {b}",
      "translate.progress": "Переводим описания… {done}/{total}",

      // ---------- Карточка ----------
      "card.sponsor": "Спонсор",
      "card.sponsorTitle": "Автор принимает поддержку — откройте карточку, чтобы перейти на страницу спонсорства",
      "card.verified": "Проверенный издатель",
      "card.copyCmd": "Скопировать команду установки",
      "card.screenshot": "Скачать скриншот карточки",
      "delta.new": "NEW",

      // ---------- Плюсы и минусы ----------
      "pc.pros": "Плюсы",
      "pc.cons": "Минусы",
      "pc.noCons": "Явных минусов по данным не видно",
      "pro.installs": "{n} установок — выбирают многие",
      "pro.rating": "Рейтинг {r}/5 по {c} оценкам",
      "pro.verified": "Проверенный издатель",
      "pro.fresh": "Недавно обновлялось — проект живой",
      "pro.trend": "Быстро набирает популярность",
      "pro.repo": "Открытый исходный код",
      "pro.langs": "Есть локализации: {list}",
      "con.fewRatings": "Мало оценок ({c}) — рейтингу пока сложно доверять",
      "con.lowRating": "Рейтинг ниже 4 ({r}) — почитайте отзывы",
      "con.stale": "Давно не обновлялось ({date})",
      "con.noRepo": "Нет публичного репозитория",
      "con.niche": "Нишевое — установок немного",
      "con.pre": "Есть pre-release — возможны сбои",
      "modal.screens": "📷 В описании есть скриншоты ({n})",

      // ---------- О сайте ----------
      "about.title1": "Как формируется рейтинг",
      "about.p1": "Данные запрашиваются напрямую из публичного API Visual Studio Marketplace: топ-{n} расширений по числу установок. Результат кешируется в браузере на текущие сутки, а в полночь рейтинг автоматически перестраивается — так вы видите изменения позиций день ко дню.",
      "about.title2": "Подборки, два языка и бейдж «Спонсор»",
      "about.p2": "В навигации над рейтингом собраны тематические подборки: ИИ и нейросети, Python, игры, веб-разработка, данные, DevOps и другие. Сайт работает на русском и английском, а расширения с кнопкой поддержки автора помечены бейджем «Спонсор» — как в VS Code.",
      "about.title3": "Работа без интернета",
      "about.p3": "Скачайте свежий снимок рейтинга и положите файл top500.json рядом с index.html — сайт откроется и покажет рейтинг даже без подключения к сети.",
      "offline.download": "Скачать top500.json",
      "offline.saved": "top500.json скачан — положите его рядом с index.html",
      "offline.noData": "Сначала дождитесь загрузки рейтинга",
      "status.offline": "Офлайн-режим: данные из top500.json",
      "error.offline": "{msg}. Нет кеша и нет файла top500.json — откройте сайт с интернетом и скачайте его в разделе «О сайте».",

      // ---------- Футер ----------
      "footer.note": "Данные: Visual Studio Marketplace. Сайт не аффилирован с Microsoft.",
      "footer.top": "Наверх ↑",

      // ---------- Модальное окно ----------
      "modal.rank": "МЕСТО #{n}",
      "modal.deltaDay": "за сутки",
      "modal.marketplace": "Открыть в Marketplace",
      "modal.install": "Установить в VS Code",
      "modal.repo": "Репозиторий",
      "modal.sponsorBtn": "Поддержать автора ❤",
      "modal.copy": "Копировать",
      "modal.compare": "Сравнить",
      "modal.screenshot": "Скриншот",
      "toast.copied": "Команда скопирована",
      "toast.screenshotDone": "Скриншот сохранён",
      "toast.screenshotFailed": "Скриншот недоступен",
      "toast.compareHint": "Расширение добавлено. Нажмите «Сравнить» на другом расширении.",
      "toast.compareDone": "Сравнение открыто",
      "modal.stat.installs": "установок",
      "modal.stat.downloads": "скачиваний",
      "modal.stat.ratings": "оценок",
      "modal.stat.trend": "тренд за неделю",
      "modal.stat.version": "версия",
      "modal.stat.prerelease": "pre-release",
      "modal.stat.updated": "обновлено",
      "modal.tab.readme": "Описание (README)",
      "modal.tab.info": "Подробности",
      "modal.tab.tags": "Категории и теги",
      "modal.tab.changelog": "Changelog",
      "modal.categories": "Категории",
      "modal.tags": "Теги",
      "modal.loadingReadme": "Загружаем README…",
      "modal.loadingChangelog": "Загружаем changelog…",
      "modal.noReadme": "Описание недоступно.",
      "modal.loadFail": "Не удалось загрузить содержимое ({msg}).",
      "modal.openInMarketplace": "Открыть в Marketplace",
      "kv.id": "Идентификатор",
      "kv.publisher": "Издатель",
      "kv.version": "Текущая версия",
      "kv.lastUpdate": "Последнее обновление",
      "kv.published": "Первая публикация",
      "kv.installs": "Установок (точно)",
      "kv.downloads": "Скачиваний",
      "kv.rating": "Рейтинг",
      "kv.ratingNone": "нет оценок",
      "kv.ratingVal": "{rating} / 5 (взвешенный {weighted}) · {count} оценок",
      "kv.trend": "Тренд (неделя / месяц)",
      "kv.engine": "Требуемая версия VS Code",
      "kv.kind": "Тип расширения",
      "kv.price": "Цена",
      "kv.langs": "Локализации",
      "kv.deps": "Зависимости",
      "kv.pack": "Extension Pack",
      "kv.repo": "Репозиторий",
      "kv.support": "Поддержка",
      "kv.docs": "Документация",
      "kv.license": "Лицензия",
      "kv.licenseOpen": "Открыть текст лицензии",
      "kv.vsix": "Скачать VSIX",
      "kv.vsixLink": "Скачать .vsix",
      "kv.marketplace": "Marketplace",
      "kv.sponsor": "Спонсорство",

      // ---------- Время ----------
      "time.today": "сегодня",
      "time.yesterday": "вчера",
      "time.daysAgo": "{n} дн. назад",
      "time.monthsAgo": "{n} мес. назад",
      "time.yearsAgo": "{n} г. назад",

      // ---------- Прочее ----------
      "cat.other": "Другое",

      // ---------- Страница «Уроки» ----------
      "lessons.pageTitle": "Уроки по VS Code — лучшие расширения на видео",
      "lessons.h1": "Уроки по VS Code и лучшим расширениям",
      "lessons.sub": "Лучшие видео-туториалы про расширения Visual Studio Code — с обложками с YouTube, темами и прямыми ссылками, а не просто списком ссылок.",
      "lessons.filter.all": "Все",
      "lessons.filter.ru": "На русском",
      "lessons.filter.en": "На английском",
      "lessons.watch": "Смотреть на YouTube",
      "lessons.empty": "Нет уроков по этому фильтру.",
      "lessons.count": "Найдено уроков: {n}",
      "lessons.views": "{v} просмотров",
      "lessons.topic.basics": "Основы",
      "lessons.topic.extensions": "Обзор расширений",
      "lessons.topic.productivity": "Продуктивность",
      "lessons.topic.setup": "Настройка редактора",
      "lessons.tip": "Совет: включите субтитры — у многих видео есть перевод на русский.",

      // ---------- Страница «Лайфхаки» ----------
      "lifehacks.pageTitle": "Лайфхаки VS Code — советы и горячие клавиши",
      "lifehacks.h1": "Лайфхаки VS Code",
      "lifehacks.sub": "Советы, трюки и горячие клавиши, которые ускоряют работу в Visual Studio Code. Мы держим их на отдельной странице, чтобы они не мешали на главной.",
      "lifehacks.filter.all": "Все",
      "lifehacks.cat.hotkeys": "Горячие клавиши",
      "lifehacks.cat.edit": "Редактирование",
      "lifehacks.cat.nav": "Навигация",
      "lifehacks.cat.prod": "Продуктивность",
      "lifehacks.cat.git": "Git и терминал",
      "lifehacks.search": "Поиск по лайфхакам…",
      "lifehacks.count": "Советов: {n}",
      "lifehacks.empty": "Ничего не найдено. Попробуйте другой запрос.",
      "lifehacks.print": "🖨️ Шпаргалка для печати",
      "lifehacks.cheatsheetTitle": "VS Code — шпаргалка по горячим клавишам",
      "lifehacks.cheatsheetSub": "Сочетания для {platform}. Распечатайте и держите рядом с клавиатурой — через неделю основное запомнится само.",
      "lifehacks.cheatsheetFoot": "vsxtop500 · данные Visual Studio Marketplace · полный список клавиш: Ctrl+K Ctrl+S внутри VS Code",

      // ---------- Страница «Промпты» ----------
      "prompts.pageTitle": "Лучшие промпты для VS Code — для новичков и профи",
      "prompts.h1": "Лучшие промпты для VS Code",
      "prompts.sub": "Готовые промпты для GitHub Copilot, ChatGPT и других ИИ-ассистентов: для новичков, для знающих и для тех, кто давно в VS Code. Копируйте, подставляйте свой код и получайте результат.",
      "prompts.tip": "Совет: вставляйте промпты в Copilot Chat (Ctrl+Alt+I), ChatGPT или Koda — они работают в любом ассистенте.",
      "prompts.search": "Поиск по промптам…",
      "prompts.count": "Промптов: {n}",
      "prompts.empty": "Ничего не найдено. Попробуйте другой запрос или уровень.",
      "prompts.level.all": "Все уровни",
      "prompts.level.novice": "Новичкам",
      "prompts.level.skilled": "Знающим",
      "prompts.level.pro": "Ветеранам VS Code",
      "prompts.copy": "Копировать",
      "prompts.copyTitle": "Скопировать промпт в буфер обмена",
      "prompts.copied": "Промпт скопирован ✓",
      "prompts.cat.code": "Код",
      "prompts.cat.refactor": "Рефакторинг",
      "prompts.cat.tests": "Тесты",
      "prompts.cat.debug": "Отладка",
      "prompts.cat.docs": "Документация",
      "prompts.cat.learn": "Обучение",
      "prompts.cat.prod": "Продуктивность",
      "prompts.cat.ai": "ИИ и Copilot",
      "prompts.how.title": "Как пользоваться промптами",
      "prompts.how.t1": "Замените плейсхолдеры",
      "prompts.how.p1": "Квадратные скобки [ ] — это плейсхолдеры: подставьте свой код, текст ошибки, стек или цель.",
      "prompts.how.t2": "Дайте контекст",
      "prompts.how.p2": "Версия языка, фреймворк, что уже пробовали — чем точнее вводные, тем полезнее ответ.",
      "prompts.how.t3": "Уточняйте итерациями",
      "prompts.how.p3": "Попросите короче, подробнее или с примерами. Промпт — это диалог, а не заклинание.",

      // ---------- Страница «Наборы» ----------
      "kits.pageTitle": "Готовые наборы расширений VS Code — установка в один клик",
      "kits.h1": "Готовые наборы расширений",
      "kits.sub": "Проверенные наборы из 5–10 расширений для старта: новичкам, веб, Python, ИИ, игры, Git. Скопируйте все команды установки одной кнопкой — и вставьте в терминал.",
      "kits.tip": "Терминал открывается по Ctrl+` прямо в VS Code. Расширения подхватятся сразу после установки.",
      "kits.copyAll": "Скопировать все команды",
      "kits.copiedAll": "Все команды скопированы ✓",
      "kits.copyOne": "Скопировать команду",
      "kits.count": "Наборов: {n}",
      "kits.plugins": "расширений: {n}",
      "kits.how": "Как установить набор",
      "kits.howP1": "Скопируйте команды и вставьте их в терминал — VS Code установит расширения по очереди.",
      "kits.howP2": "Или найдите каждое расширение в рейтинге по имени и установите из карточки.",
      "kits.openRating": "Найти в рейтинге",

      // ---------- Страница «Настройки» ----------
      "settings.pageTitle": "Настройки VS Code — settings.json, горячие клавиши и темы",
      "settings.h1": "Настройки, клавиши и темы",
      "settings.sub": "Плагины — только часть полезного. Готовые settings.json, свои горячие клавиши и проверенные темы — копируйте и вставляйте.",
      "settings.tip": "Открыть settings.json: Ctrl+Shift+P → Open User Settings (JSON). Клавиши: Open Keyboard Shortcuts (JSON).",
      "settings.copy": "Копировать",
      "settings.copied": "Скопировано ✓",
      "settings.sectionJson": "Готовые settings.json",
      "settings.sectionKeys": "Свои горячие клавиши",
      "settings.sectionThemes": "Темы",
      "settings.themesHint": "Сменить тему: Ctrl+K Ctrl+T",
      "settings.themeLight": "есть светлый вариант",
      "settings.previewHint": "Превью нарисовано по реальной палитре каждой темы.",

      // ---------- Страница «Не ставить» ----------
      "avoid.pageTitle": "Какие расширения не стоит ставить в VS Code — антипаттерны",
      "avoid.h1": "Плагины, которые не стоит ставить",
      "avoid.sub": "Тормозят редактор, дублируют встроенные функции или конфликтуют между собой. Разбираем типичные антипаттерны — и что использовать вместо них.",
      "avoid.tip": "Правило простое: меньше расширений — быстрее редактор. Оставляйте только то, чем пользуетесь каждый день.",
      "avoid.why": "Почему плохо",
      "avoid.instead": "Что вместо",
      "avoid.count": "Пунктов: {n}",

      // ---------- Страница «Разработчики» ----------
      "pubs.pageTitle": "Разработчики VS Code — каталог создателей расширений",
      "pubs.h1": "Разработчики VS Code",
      "pubs.sub": "Каталог создателей расширений: Microsoft, GitHub, Salesforce, Red Hat и другие. Логотипы, статистика, проверенные издатели с галочкой.",
      "pubs.count": "Разработчиков: {n}",
      "pubs.showMore": "Показать ещё ({n})",
      "pubs.loadFailed": "Не удалось загрузить данные. Откройте сайт с интернетом.",
      "pubs.filter.all": "Все",
      "pubs.filter.verified": "Проверенные",
      "pubs.filter.popular": "Популярные (5+)",
      "pubs.stats.ext": "расшир.",
      "pubs.stats.installs": "установок",
      "pubs.openList": "Смотреть плагины",
      "pubs.modal.copy": "Скопировать команду установки",
      "pubs.modal.open": "Открыть карточку",
      "pubs.modal.installAll": "Скопировать все команды",
      "pubs.modal.viewAll": "Показать на главной",
      "pubs.modal.top": "Показаны топ-{n} расширений по установкам.",
      "pubs.modal.allCopied": "Все команды скопированы — вставьте в терминал",

      // ---------- ИИ-ассистент ----------
      "ai.fabTitle": "Открыть ИИ-ассистента",
      "ai.title": "VSX Ассистент",
      "ai.subtitle": "Подскажу по VS Code, расширениям и промптам",
      "ai.close": "Закрыть ассистента",
      "ai.placeholder": "Например: как установить расширение?",
      "ai.send": "Отправить",
      "ai.hello": "Привет! Я VSX Ассистент 🤖 Спросите меня про VS Code: как установить расширение, что выбрать для Python, где горячие клавиши или лучшие промпты. Отвечаю офлайн — быстро и без API-ключей.",
      "ai.quickTitle": "Спросите меня:",
      "ai.notFound": "Не нашёл готового ответа 🤔 Попробуйте спросить иначе — например, про установку расширений, горячие клавиши, настройки, Python или промпты.",
      "ai.note": "Отвечаю офлайн по базе знаний сайта",
      "ai.thanks": "Рад помочь! Если что-то ещё — спрашивайте 🙌",
      "ai.helloReply": "Привет! 👋 Чем помочь? Спросите про расширения, горячие клавиши, настройку VS Code или промпты.",
      "ai.trendingTitle": "Что сейчас растёт в рейтинге",
      "ai.liveNote": "Данные из сегодняшнего топ-500, обновлено только что",
      "ai.liveNoteTrend": "Растущие расширения этой недели из топ-500",
      "ai.openRating": "Открыть полный рейтинг",
      "ai.openCollections": "Открыть подборки",
      "ai.chipTrending": "Что сейчас растёт",

      // ---------- Избранное ----------
      "fav.title": "Мои расширения",
      "fav.empty": "Вы ещё ничего не добавили в избранное. Нажмите ☆ на карточке, чтобы добавить.",
      "fav.toggle": "В избранное",
      "fav.compareHint": "Выберите ещё одно расширение для сравнения",

      // ---------- Показать ещё ----------
      "showMore": "Показать ещё",

      // ---------- Сравнение ----------
      "compare.title": "Сравнение расширений",

      // ---------- Подбор набора ----------
      "picker.title": "Подбор набора расширений",
      "picker.sub": "Ответьте на 3 вопроса — получите готовый набор.",
      "picker.q1": "Чем вы занимаетесь?",
      "picker.q1.web": "🌐 Веб-разработка",
      "picker.q1.python": "🐍 Python",
      "picker.q1.games": "🎮 Создание игр",
      "picker.q1.ai": "🤖 ИИ и данные",
      "picker.q1.start": "🐣 Только начинаю",
      "picker.q2": "Какой язык используете?",
      "picker.q2.other": "Другой",
      "picker.q3": "Ваш уровень опыта?",
      "picker.q3.newbie": "🐣 Новичок",
      "picker.q3.mid": "🔧 Средний",
      "picker.q3.pro": "🚀 Профи",
      "picker.result": "Ваш набор готов!",
      "picker.resultHint": "Рекомендуемый набор подобран на основе ваших ответов. Скопируйте команды в терминал VS Code.",
      "picker.openKit": "Открыть набор",
      "picker.openCollections": "Смотреть подборки",
      "picker.q1.git": "🔧 Git и командная работа",
      "picker.waiting": "Отвечено {n} из 3 — остался подбор.",
      "picker.noData": "Не удалось собрать набор: данные ещё не загрузились.",
      "picker.count": "расширений: {n}",
      "picker.aiNote": "Важно: держите включённым только один ИИ-ассистент — несколько сразу конфликтуют и тормозят редактор.",

      // ---------- Генератор extensions.json ----------
      "gen.pageTitle": "Генератор extensions.json — подборка для .vscode",
      "gen.h1": "Генератор extensions.json",
      "gen.sub": "Отметьте нужные расширения — получите готовый файл .vscode/extensions.json. VS Code сам предложит команде установить нужные плагины.",
      "gen.tip": "Файл кладите в папку <code>.vscode/</code> в корне проекта.",
      "gen.search": "Поиск расширений…",
      "gen.all": "Все",
      "gen.selectVisible": "Выбрать видимые",
      "gen.clearAll": "Сбросить",
      "gen.fromFavs": "Из избранного",
      "gen.download": "Скачать extensions.json",
      "gen.copyJson": "Скопировать JSON",
      "gen.copyCmds": "Скопировать команды",
      "gen.previewTitle": "Предпросмотр .vscode/extensions.json",
      "gen.show": "Показать",
      "gen.hide": "Скрыть",
      "gen.empty": "Ничего не найдено.",
      "gen.downloaded": "Файл extensions.json скачан",
      "gen.copiedJson": "JSON скопирован в буфер",
      "gen.copiedCmds": "Команды установки скопированы",
      "gen.favsAdded": "Расширения из избранного добавлены",

      // ---------- Платформа (Win/Mac) ----------
      "platform.label": "Платформа — от этого зависят сочетания клавиш",
      "platform.winTitle": "Сочетания клавиш для Windows и Linux",
      "platform.macTitle": "Сочетания клавиш для macOS",

      // ---------- Растут быстрее всех ----------
      "trending.title": "Растут быстрее всех на этой неделе",
      "trending.sub": "Кого ставят активнее всего прямо сейчас. Считается по недельному тренду Visual Studio Marketplace.",
      "trending.empty": "Данные о недельном росте пока не загрузились.",
      "trending.installs": "{n} установок",

      // ---------- Расширение недели ----------
      "weekly.badge": "Расширение недели",
      "weekly.issue": "выпуск №{n}",
      "weekly.rank": "место #{n} в рейтинге",
      "weekly.copyCmd": "Скопировать команду установки",
      "weekly.openCard": "Открыть карточку",

      // ---------- Избранное: пересылка списка ----------
      "fav.copyCmds": "Скопировать команды для моего списка",
      "fav.copyLink": "Скопировать ссылку со списком",
      "fav.linkCopied": "Ссылка скопирована — можно отправлять другу",
      "fav.importList": "Добавить этот список в мои",
      "fav.addToMine": "Добавить в мои расширения",
      "fav.imported": "Добавлено в избранное: {n}",
      "fav.sharedTitle": "Список расширений по ссылке",
      "fav.sharedSub": "В списке {n} расширений. Скопируйте команды и вставьте в терминал — установятся все сразу.",
      "fav.sharedMissing": "Ещё {n} расширений нет в сегодняшнем топ-500, но команды установки для них подошли: {list}",
      "fav.rankShort": "место #{n}",

      // ---------- Сравнение ----------
      "compare.note": "Сравниваем только по открытым данным Marketplace. Смотрите не только на установки: важны свежесть обновления, рейтинг и открытый код.",
      "toast.compareRemoved": "Убрал из сравнения",
      "cmp.yes": "да",
      "cmp.no": "нет",
      "cmp.rank": "Место в топ-500",
      "cmp.cat": "Категории",
      "cmp.verified": "Проверенный издатель",
      "cmp.repo": "Открытый код",
      "cmp.fresh": "Обновлялось за 4 месяца",
      "cmp.copyCmd": "Команда установки",
      "kv.ratingCount": "Число оценок",
      "kv.trendWeek": "Рост за неделю",
      "kv.trendMonth": "Рост за месяц",

      // ---------- История позиций ----------
      "modal.tab.history": "Динамика позиции",
      "history.title": "Позиция в топ-500 за последнее время",
      "history.summary": "Было #{first} → стало #{last} · {delta}",
      "history.flat": "без изменений",
      "history.bestWorst": "лучшая #{best} · худшая #{worst}",
      "history.note": "История накапливается автоматически: файл history.json обновляется раз в сутки вместе с рейтингом.",

      // ---------- Страница «Первый день» ----------
      "first.pageTitle": "Первый день в VS Code — пошаговый старт для новичка",
      "first.h1": "Первый день в VS Code",
      "first.sub": "Спокойный путь от «только что скачал» до «работаю и ничего не мешает»: установка, папка проекта, первое расширение, терминал, настройки и Git. Отмечайте шаги — прогресс сохраняется в этом браузере.",
      "first.tip": "Переключите Win/Mac в шапке — все сочетания клавиш перепишутся под ваш компьютер.",
      "first.progress": "Выполнено {n} из {total} ({pct}%)",
      "first.markDone": "Отметить шаг выполненным",
      "first.copyCmd": "Скопировать команду",
      "first.reset": "Сбросить прогресс",
      "first.resetDone": "Прогресс сброшен",
      "first.toKits": "Дальше: готовые наборы",
    },

    en: {
      // ---------- Common / header ----------
      "page.title": "Top 500 VS Code extensions — updated daily",
      "page.desc": "Ranking of the 500 most popular Visual Studio Code extensions, refreshed daily, with collections (AI, Python, games and more) and detailed info in Russian and English.",
      "nav.home": "Home",
      "nav.rating": "Rating",
      "nav.firstDay": "First day",
      "nav.kits": "Kits",
      "nav.lessons": "Lessons",
      "nav.lifehacks": "Lifehacks",
      "nav.prompts": "Prompts",
      "nav.settings": "Setup",
      "nav.avoid": "Avoid",
      "nav.publishers": "Publishers",
      "nav.about": "About",
      "nav.refresh": "Refresh",
      "nav.refreshTitle": "Force refresh data",
      "nav.langLabel": "Site language",
      "nav.favs": "Favorites",
      "nav.favsTitle": "My extensions — favorites",
      "nav.picker": "Picker",
      "nav.pickerTitle": "Pick a kit in 3 questions",
      "nav.back": "Main menu",
      "nav.backTitle": "Go back to home — rating and collections",
      "theme.toLight": "Switch to light theme",
      "theme.toDark": "Switch to dark theme",

      // ---------- Hero ----------
      "hero.loading": "Loading data…",
      "hero.titleA": "Top‑",
      "hero.titleB": " extensions",
      "hero.titleC": "for Visual Studio Code",
      "hero.sub": "The rating is built from live Visual Studio Marketplace data and refreshes automatically once a day. Pick a collection — AI, Python, games and more. Click a card to see details. Extensions with the “Sponsor” badge can be supported.",
      "stat.installs": "total installs",
      "stat.rating": "average rating",
      "stat.publishers": "publishers in top",
      "stat.next": "until next update",

      // ---------- Collections / toolbar ----------
      "collections.title": "Collections",
      "collections.sub": "Quick jump to extensions by topic: best for Python, for programmers, game development, AI, web and more",
      "toolbar.search": "Search by name, publisher, tags…",
      "toolbar.allCats": "All categories",
      "toolbar.sortLabel": "Sorting",
      "sort.installs": "By installs",
      "sort.rating": "By rating",
      "sort.ratings": "By number of ratings",
      "sort.trending": "Trending this week",
      "sort.trendingMonth": "Trending this month",
      "sort.updated": "Recently updated",
      "sort.published": "Recently published",
      "sort.name": "By name",
      "view.grid": "Grid",
      "view.list": "List",

      // ---------- Status / meta ----------
      "status.loading": "Loading Marketplace data…",
      "status.error": "Loading error",
      "status.updateFail": "Update failed ({msg}). Showing data from {date}.",
      "status.ok": "Updated {date} · next update at midnight",
      "error.title": "Failed to load Marketplace data.",
      "error.check": "{msg}. Check your internet connection.",
      "error.retry": "Retry",
      "empty.text": "Nothing found. Try changing the query or filters.",
      "meta.dataFrom": "Data from {date}",
      "meta.cache": " (cached today)",
      "meta.shown": "Showing {a} of {b}",
      "translate.progress": "Translating descriptions… {done}/{total}",

      // ---------- Card ----------
      "card.sponsor": "Sponsor",
      "card.sponsorTitle": "The author accepts sponsorship — open the card to visit the sponsor page",
      "card.verified": "Verified publisher",
      "card.copyCmd": "Copy the install command",
      "card.screenshot": "Download card screenshot",
      "delta.new": "NEW",

      // ---------- Pros & cons ----------
      "pc.pros": "Pros",
      "pc.cons": "Cons",
      "pc.noCons": "No obvious downsides in the data",
      "pro.installs": "{n} installs — many developers choose it",
      "pro.rating": "Rated {r}/5 by {c} users",
      "pro.verified": "Verified publisher",
      "pro.fresh": "Recently updated — the project is alive",
      "pro.trend": "Trending up fast",
      "pro.repo": "Open source",
      "pro.langs": "Localisations: {list}",
      "con.fewRatings": "Few ratings ({c}) — the score isn't reliable yet",
      "con.lowRating": "Rating below 4 ({r}) — read the reviews",
      "con.stale": "Not updated for a while ({date})",
      "con.noRepo": "No public repository",
      "con.niche": "Niche — not many installs",
      "con.pre": "Has a pre-release — may be unstable",
      "modal.screens": "📷 The description contains screenshots ({n})",

      // ---------- About ----------
      "about.title1": "How the rating is built",
      "about.p1": "Data comes straight from the public Visual Studio Marketplace API: the top {n} extensions by install count. The result is cached in your browser for the current day, and at midnight the rating rebuilds automatically — so you can watch positions change day by day.",
      "about.title2": "Collections, two languages and the “Sponsor” badge",
      "about.p2": "The navigation above the rating holds topic collections: AI, Python, games, web development, data, DevOps and more. The site works in Russian and English, and extensions that accept author support are marked with the “Sponsor” badge — just like in VS Code.",
      "about.title3": "Working offline",
      "about.p3": "Download a fresh snapshot of the rating and put top500.json next to index.html — the site will open and show the rating even without an internet connection.",
      "offline.download": "Download top500.json",
      "offline.saved": "top500.json downloaded — put it next to index.html",
      "offline.noData": "Wait for the rating to load first",
      "status.offline": "Offline mode: data from top500.json",
      "error.offline": "{msg}. No cache and no top500.json file — open the site online and download it in the “About” section.",

      // ---------- Footer ----------
      "footer.note": "Data: Visual Studio Marketplace. Not affiliated with Microsoft.",
      "footer.top": "Back to top ↑",

      // ---------- Modal ----------
      "modal.rank": "RANK #{n}",
      "modal.deltaDay": "per day",
      "modal.marketplace": "Open in Marketplace",
      "modal.install": "Install in VS Code",
      "modal.repo": "Repository",
      "modal.sponsorBtn": "Sponsor ❤",
      "modal.copy": "Copy",
      "modal.compare": "Compare",
      "modal.screenshot": "Screenshot",
      "toast.copied": "Command copied",
      "toast.screenshotDone": "Screenshot saved",
      "toast.screenshotFailed": "Screenshot unavailable",
      "toast.compareHint": "Added. Click \"Compare\" on another extension.",
      "toast.compareDone": "Comparison opened",
      "modal.stat.installs": "installs",
      "modal.stat.downloads": "downloads",
      "modal.stat.ratings": "ratings",
      "modal.stat.trend": "weekly trend",
      "modal.stat.version": "version",
      "modal.stat.prerelease": "pre-release",
      "modal.stat.updated": "updated",
      "modal.tab.readme": "Description (README)",
      "modal.tab.info": "Details",
      "modal.tab.tags": "Categories & tags",
      "modal.tab.changelog": "Changelog",
      "modal.categories": "Categories",
      "modal.tags": "Tags",
      "modal.loadingReadme": "Loading README…",
      "modal.loadingChangelog": "Loading changelog…",
      "modal.noReadme": "Description is not available.",
      "modal.loadFail": "Failed to load content ({msg}).",
      "modal.openInMarketplace": "Open in Marketplace",
      "kv.id": "Identifier",
      "kv.publisher": "Publisher",
      "kv.version": "Current version",
      "kv.lastUpdate": "Last update",
      "kv.published": "First published",
      "kv.installs": "Installs (exact)",
      "kv.downloads": "Downloads",
      "kv.rating": "Rating",
      "kv.ratingNone": "no ratings",
      "kv.ratingVal": "{rating} / 5 (weighted {weighted}) · {count} ratings",
      "kv.trend": "Trend (week / month)",
      "kv.engine": "Required VS Code version",
      "kv.kind": "Extension kind",
      "kv.price": "Price",
      "kv.langs": "Localizations",
      "kv.deps": "Dependencies",
      "kv.pack": "Extension pack",
      "kv.repo": "Repository",
      "kv.support": "Support",
      "kv.docs": "Documentation",
      "kv.license": "License",
      "kv.licenseOpen": "Open license text",
      "kv.vsix": "Download VSIX",
      "kv.vsixLink": "Download .vsix",
      "kv.marketplace": "Marketplace",
      "kv.sponsor": "Sponsorship",

      // ---------- Time ----------
      "time.today": "today",
      "time.yesterday": "yesterday",
      "time.daysAgo": "{n} days ago",
      "time.monthsAgo": "{n} mo ago",
      "time.yearsAgo": "{n} yr ago",

      // ---------- Misc ----------
      "cat.other": "Other",

      // ---------- Lessons page ----------
      "lessons.pageTitle": "VS Code lessons — the best extensions on video",
      "lessons.h1": "VS Code lessons and the best extensions",
      "lessons.sub": "The best video tutorials about Visual Studio Code extensions — with YouTube thumbnails, topics and direct links instead of a plain list of URLs.",
      "lessons.filter.all": "All",
      "lessons.filter.ru": "In Russian",
      "lessons.filter.en": "In English",
      "lessons.watch": "Watch on YouTube",
      "lessons.empty": "No lessons for this filter.",
      "lessons.count": "Lessons found: {n}",
      "lessons.views": "{v} views",
      "lessons.topic.basics": "Basics",
      "lessons.topic.extensions": "Extension overview",
      "lessons.topic.productivity": "Productivity",
      "lessons.topic.setup": "Editor setup",
      "lessons.tip": "Tip: turn on subtitles — many videos come with auto-translation.",

      // ---------- Lifehacks page ----------
      "lifehacks.pageTitle": "VS Code lifehacks — tips and hotkeys",
      "lifehacks.h1": "VS Code lifehacks",
      "lifehacks.sub": "Tips, tricks and hotkeys that speed up your work in Visual Studio Code. We keep them on a separate page so they don't clutter the main rating.",
      "lifehacks.filter.all": "All",
      "lifehacks.cat.hotkeys": "Hotkeys",
      "lifehacks.cat.edit": "Editing",
      "lifehacks.cat.nav": "Navigation",
      "lifehacks.cat.prod": "Productivity",
      "lifehacks.cat.git": "Git & terminal",
      "lifehacks.search": "Search lifehacks…",
      "lifehacks.count": "Tips: {n}",
      "lifehacks.empty": "Nothing found. Try another query.",
      "lifehacks.print": "🖨️ Printable cheatsheet",
      "lifehacks.cheatsheetTitle": "VS Code — hotkey cheatsheet",
      "lifehacks.cheatsheetSub": "Shortcuts for {platform}. Print it and keep it next to the keyboard — after a week you'll remember the main ones.",
      "lifehacks.cheatsheetFoot": "vsxtop500 · data from Visual Studio Marketplace · full list: Ctrl+K Ctrl+S inside VS Code",

      // ---------- Prompts page ----------
      "prompts.pageTitle": "Best VS Code prompts — for beginners and pros",
      "prompts.h1": "The best prompts for VS Code",
      "prompts.sub": "Ready-made prompts for GitHub Copilot, ChatGPT and other AI assistants: for beginners, advanced users and VS Code veterans. Copy one, paste your code, get results.",
      "prompts.tip": "Tip: paste prompts into Copilot Chat (Ctrl+Alt+I), ChatGPT or Koda — they work with any assistant.",
      "prompts.search": "Search prompts…",
      "prompts.count": "Prompts: {n}",
      "prompts.empty": "Nothing found. Try another query or level.",
      "prompts.level.all": "All levels",
      "prompts.level.novice": "For beginners",
      "prompts.level.skilled": "For advanced",
      "prompts.level.pro": "VS Code veterans",
      "prompts.copy": "Copy",
      "prompts.copyTitle": "Copy prompt to clipboard",
      "prompts.copied": "Prompt copied ✓",
      "prompts.cat.code": "Code",
      "prompts.cat.refactor": "Refactoring",
      "prompts.cat.tests": "Tests",
      "prompts.cat.debug": "Debugging",
      "prompts.cat.docs": "Docs",
      "prompts.cat.learn": "Learning",
      "prompts.cat.prod": "Productivity",
      "prompts.cat.ai": "AI & Copilot",
      "prompts.how.title": "How to use the prompts",
      "prompts.how.t1": "Replace the placeholders",
      "prompts.how.p1": "Square brackets [ ] are placeholders: put in your code, error text, stack trace or goal.",
      "prompts.how.t2": "Give context",
      "prompts.how.p2": "Language version, framework, what you have already tried — better input means better answers.",
      "prompts.how.t3": "Refine in iterations",
      "prompts.how.p3": "Ask for shorter, more detailed or example-driven answers. A prompt is a dialogue, not a spell.",

      // ---------- Kits page ----------
      "kits.pageTitle": "Ready-made VS Code extension kits — install in one click",
      "kits.h1": "Ready-made extension kits",
      "kits.sub": "Curated kits of 5–10 extensions to get started: beginners, web, Python, AI, games, Git. Copy all install commands with one button and paste them into the terminal.",
      "kits.tip": "The terminal opens with Ctrl+` right inside VS Code. Extensions are picked up right after installation.",
      "kits.copyAll": "Copy all commands",
      "kits.copiedAll": "All commands copied ✓",
      "kits.copyOne": "Copy the command",
      "kits.count": "Kits: {n}",
      "kits.plugins": "extensions: {n}",
      "kits.how": "How to install a kit",
      "kits.howP1": "Copy the commands and paste them into the terminal — VS Code installs the extensions one by one.",
      "kits.howP2": "Or find each extension in the rating by name and install it from the card.",
      "kits.openRating": "Find in the rating",

      // ---------- Settings page ----------
      "settings.pageTitle": "VS Code setup — settings.json, hotkeys and themes",
      "settings.h1": "Settings, keys and themes",
      "settings.sub": "Extensions are only part of the story. Ready-made settings.json files, custom hotkeys and proven themes — copy and paste.",
      "settings.tip": "Open settings.json: Ctrl+Shift+P → Open User Settings (JSON). Keys: Open Keyboard Shortcuts (JSON).",
      "settings.copy": "Copy",
      "settings.copied": "Copied ✓",
      "settings.sectionJson": "Ready-made settings.json",
      "settings.sectionKeys": "Custom hotkeys",
      "settings.sectionThemes": "Themes",
      "settings.themesHint": "Switch a theme: Ctrl+K Ctrl+T",
      "settings.themeLight": "light variant available",
      "settings.previewHint": "Each preview is drawn from the theme's real palette.",

      // ---------- Avoid page ----------
      "avoid.pageTitle": "VS Code extensions you should not install — anti-patterns",
      "avoid.h1": "Extensions you should not install",
      "avoid.sub": "They slow the editor down, duplicate built-in features or conflict with each other. A tour of typical anti-patterns — and what to use instead.",
      "avoid.tip": "The rule is simple: fewer extensions — a faster editor. Keep only what you use every day.",
      "avoid.why": "Why it's bad",
      "avoid.instead": "What to use instead",
      "avoid.count": "Items: {n}",

      // ---------- Publishers page ----------
      "pubs.pageTitle": "VS Code Publishers — catalog of extension authors",
      "pubs.h1": "VS Code Publishers",
      "pubs.sub": "Catalog of extension authors: Microsoft, GitHub, Salesforce, Red Hat and more. Logos, stats, verified publishers with a checkmark.",
      "pubs.count": "Publishers: {n}",
      "pubs.showMore": "Show more ({n})",
      "pubs.loadFailed": "Failed to load data. Open the site with internet access.",
      "pubs.filter.all": "All",
      "pubs.filter.verified": "Verified",
      "pubs.filter.popular": "Popular (5+)",
      "pubs.stats.ext": "ext.",
      "pubs.stats.installs": "installs",
      "pubs.openList": "View plugins",
      "pubs.modal.copy": "Copy install command",
      "pubs.modal.open": "Open card",
      "pubs.modal.installAll": "Copy all commands",
      "pubs.modal.viewAll": "Show on the main page",
      "pubs.modal.top": "Showing the top-{n} extensions by installs.",
      "pubs.modal.allCopied": "All commands copied — paste them into a terminal",

      // ---------- AI assistant ----------
      "ai.fabTitle": "Open AI assistant",
      "ai.title": "VSX Assistant",
      "ai.subtitle": "I'll help with VS Code, extensions and prompts",
      "ai.close": "Close assistant",
      "ai.placeholder": "E.g. how do I install an extension?",
      "ai.send": "Send",
      "ai.hello": "Hi! I'm the VSX Assistant 🤖 Ask me about VS Code: how to install an extension, what to pick for Python, where the hotkeys are or the best prompts. I answer offline — fast and without API keys.",
      "ai.quickTitle": "Ask me:",
      "ai.notFound": "I couldn't find a ready answer 🤔 Try rephrasing — for example, about installing extensions, hotkeys, settings, Python or prompts.",
      "ai.note": "I answer offline from the site's knowledge base",
      "ai.thanks": "Glad to help! Ask away if you need anything else 🙌",
      "ai.helloReply": "Hi! 👋 How can I help? Ask about extensions, hotkeys, VS Code setup or prompts.",
      "ai.trendingTitle": "What's trending in the rating now",
      "ai.liveNote": "Data from today's top 500, refreshed just now",
      "ai.liveNoteTrend": "Fast-growing extensions this week from the top 500",
      "ai.openRating": "Open full rating",
      "ai.openCollections": "Open collections",
      "ai.chipTrending": "What's trending",

      // ---------- Favorites ----------
      "fav.title": "My Extensions",
      "fav.empty": "You haven't added anything yet. Click ☆ on a card to add it.",
      "fav.toggle": "Add to favorites",
      "fav.compareHint": "Select another extension to compare",

      // ---------- Show more ----------
      "showMore": "Show more",

      // ---------- Compare ----------
      "compare.title": "Extension comparison",

      // ---------- Kit picker ----------
      "picker.title": "Extension kit picker",
      "picker.sub": "Answer 3 questions — get a ready-made kit.",
      "picker.q1": "What do you do?",
      "picker.q1.web": "🌐 Web development",
      "picker.q1.python": "🐍 Python",
      "picker.q1.games": "🎮 Game development",
      "picker.q1.ai": "🤖 AI & data",
      "picker.q1.start": "🐣 Just starting",
      "picker.q2": "What language do you use?",
      "picker.q2.other": "Other",
      "picker.q3": "What's your experience level?",
      "picker.q3.newbie": "🐣 Beginner",
      "picker.q3.mid": "🔧 Intermediate",
      "picker.q3.pro": "🚀 Pro",
      "picker.result": "Your kit is ready!",
      "picker.resultHint": "A recommended kit has been selected based on your answers. Copy the commands to the VS Code terminal.",
      "picker.openKit": "Open kit",
      "picker.openCollections": "View collections",
      "picker.q1.git": "🔧 Git & teamwork",
      "picker.waiting": "{n} of 3 answered — just picking the kit.",
      "picker.noData": "Couldn't build the kit — data hasn't loaded yet.",
      "picker.count": "extensions: {n}",
      "picker.aiNote": "Tip: keep only one AI assistant enabled — multiple ones conflict and slow down the editor.",

      // ---------- Generator ----------
      "gen.pageTitle": "extensions.json generator — for .vscode",
      "gen.h1": "extensions.json generator",
      "gen.sub": "Select extensions — get a ready-made .vscode/extensions.json file. VS Code will automatically suggest installing the needed plugins.",
      "gen.tip": "Place the file in the <code>.vscode/</code> folder at the root of your project.",
      "gen.search": "Search extensions…",
      "gen.all": "All",
      "gen.selectVisible": "Select visible",
      "gen.clearAll": "Clear all",
      "gen.fromFavs": "From favorites",
      "gen.download": "Download extensions.json",
      "gen.copyJson": "Copy JSON",
      "gen.copyCmds": "Copy commands",
      "gen.previewTitle": "Preview .vscode/extensions.json",
      "gen.show": "Show",
      "gen.hide": "Hide",
      "gen.empty": "Nothing found.",
      "gen.downloaded": "extensions.json downloaded",
      "gen.copiedJson": "JSON copied to clipboard",
      "gen.copiedCmds": "Install commands copied",
      "gen.favsAdded": "Favorites added",

      // ---------- Platform (Win/Mac) ----------
      "platform.label": "Platform — shortcuts depend on this",
      "platform.winTitle": "Shortcuts for Windows and Linux",
      "platform.macTitle": "Shortcuts for macOS",

      // ---------- Trending ----------
      "trending.title": "Fastest-growing this week",
      "trending.sub": "Extensions being installed more actively right now. Based on the weekly trend from the Visual Studio Marketplace.",
      "trending.empty": "Weekly trend data hasn't loaded yet.",
      "trending.installs": "{n} installs",

      // ---------- Extension of the week ----------
      "weekly.badge": "Extension of the week",
      "weekly.issue": "issue #{n}",
      "weekly.rank": "ranked #{n} in the rating",
      "weekly.copyCmd": "Copy install command",
      "weekly.openCard": "Open card",

      // ---------- Favorites: shareable list ----------
      "fav.copyCmds": "Copy commands for my list",
      "fav.copyLink": "Copy link with list",
      "fav.linkCopied": "Link copied — send it to a friend",
      "fav.importList": "Add this list to mine",
      "fav.addToMine": "Add to my extensions",
      "fav.imported": "Added to favorites: {n}",
      "fav.sharedTitle": "Extension list from a link",
      "fav.sharedSub": "The list contains {n} extensions. Copy the commands and paste them into the terminal — they'll all install at once.",
      "fav.sharedMissing": "Another {n} extensions aren't in today's top-500, but install commands are ready: {list}",
      "fav.rankShort": "ranked #{n}",

      // ---------- Compare ----------
      "compare.note": "We compare only with public Marketplace data. Don't focus only on installs: freshness, rating and open source matter too.",
      "toast.compareRemoved": "Removed from comparison",
      "cmp.yes": "yes",
      "cmp.no": "no",
      "cmp.rank": "Top-500 rank",
      "cmp.cat": "Categories",
      "cmp.verified": "Verified publisher",
      "cmp.repo": "Open source",
      "cmp.fresh": "Updated within 4 months",
      "cmp.copyCmd": "Install command",
      "kv.ratingCount": "Number of ratings",
      "kv.trendWeek": "Weekly growth",
      "kv.trendMonth": "Monthly growth",

      // ---------- History sparkline ----------
      "modal.tab.history": "Position history",
      "history.title": "Position in the top-500 over time",
      "history.summary": "Was #{first} → now #{last} · {delta}",
      "history.flat": "unchanged",
      "history.bestWorst": "best #{best} · worst #{worst}",
      "history.note": "History is accumulated automatically: history.json is updated daily along with the rating.",

      // ---------- First day page ----------
      "first.pageTitle": "First day in VS Code — step-by-step beginner guide",
      "first.h1": "First day in VS Code",
      "first.sub": "A calm path from “just downloaded” to “working smoothly”: installation, opening a folder, first extension, terminal, settings and Git. Check off steps — progress is saved in this browser.",
      "first.tip": "Toggle Win/Mac in the header — all shortcut keys will adapt to your computer.",
      "first.progress": "{n} of {total} done ({pct}%)",
      "first.markDone": "Mark step as done",
      "first.copyCmd": "Copy command",
      "first.reset": "Reset progress",
      "first.resetDone": "Progress reset",
      "first.toKits": "Next: ready-made kits",
    },
  };

  // ---------- Текущий язык ----------
  let lang = (() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === "ru" || saved === "en") return saved;
    } catch {
      /* localStorage may be unavailable */
    }
    return (navigator.language || "ru").toLowerCase().startsWith("ru") ? "ru" : "en";
  })();

  const t = (key, vars) => {
    let s = (DICT[lang] && DICT[lang][key]) ?? DICT.ru[key] ?? key;
    if (vars) {
      for (const [k, v] of Object.entries(vars)) s = s.split(`{${k}}`).join(String(v));
    }
    return s;
  };

  const LOCALE = () => (lang === "ru" ? "ru-RU" : "en-US");

  // ---------- Применение переводов к статичной разметке ----------
  function apply(root = document) {
    root.querySelectorAll("[data-i18n]").forEach((el) => {
      el.textContent = t(el.dataset.i18n);
    });
    root.querySelectorAll("[data-i18n-html]").forEach((el) => {
      el.innerHTML = t(el.dataset.i18nHtml);
    });
    root.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
      el.placeholder = t(el.dataset.i18nPlaceholder);
    });
    root.querySelectorAll("[data-i18n-title]").forEach((el) => {
      el.title = t(el.dataset.i18nTitle);
    });
    root.querySelectorAll("[data-i18n-aria]").forEach((el) => {
      el.setAttribute("aria-label", t(el.dataset.i18nAria));
    });
    const titleEl = document.querySelector("title[data-i18n]");
    if (titleEl) document.title = t(titleEl.dataset.i18n);
    document.documentElement.lang = lang;
  }

  function setLang(next) {
    if (next !== "ru" && next !== "en") return;
    lang = next;
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      /* ignore */
    }
    apply();
    window.dispatchEvent(new CustomEvent("langchange", { detail: { lang } }));
  }

  let togglesBound = false;
  function bindToggles() {
    if (togglesBound) return;
    togglesBound = true;
    document.querySelectorAll("[data-lang-btn]").forEach((btn) => {
      btn.addEventListener("click", () => setLang(btn.dataset.langBtn));
    });
    window.addEventListener("langchange", () => {
      document.querySelectorAll("[data-lang-btn]").forEach((btn) => {
        btn.classList.toggle("active", btn.dataset.langBtn === lang);
      });
    });
  }
  function syncToggles() {
    document.querySelectorAll("[data-lang-btn]").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.langBtn === lang);
    });
  }

  function init() {
    apply();
    bindToggles();
    syncToggles();
  }

  window.I18N = {
    t,
    apply,
    setLang,
    LOCALE,
    get lang() {
      return lang;
    },
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
