/* ============================================================
   VSX Top500 — ИИ-ассистент (виджет на всех страницах).
   Офлайн-помощник: отвечает по базе знаний сайта — установка
   расширений, подборки, горячие клавиши, настройки, промпты.
   Работает без API-ключей и интернет-запросов.
   Подключается на страницах: index, lessons, lifehacks, prompts.
   ============================================================ */

(() => {
  "use strict";

  const t = (key, vars) => window.I18N.t(key, vars);
  const lang = () => window.I18N.lang;
  const esc = (s) =>
    String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const PLAT = window.VSXPlatform || { k: (s) => s };

  // ---------- Живой рейтинг ----------
  // На главной данные уже есть в памяти страницы (app.js отдаёт их через
  // __VSX_TOP). На остальных страницах читаем top500.json рядом с сайтом.
  let liveCache = null;
  let livePromise = null;

  function liveExtensions() {
    if (typeof window.__VSX_TOP === "function") {
      const inMemory = window.__VSX_TOP();
      if (inMemory && inMemory.length) return Promise.resolve(inMemory);
    }
    if (liveCache && liveCache.length) return Promise.resolve(liveCache);
    if (!livePromise) {
      livePromise = fetch("top500.json")
        .then((r) => (r.ok ? r.json() : []))
        .then((j) => {
          liveCache = Array.isArray(j) ? j : Array.isArray(j && j.data) ? j.data : [];
          return liveCache;
        })
        .catch(() => []);
    }
    return livePromise;
  }

  const fmtInstalls = (n) => {
    if (n == null || isNaN(n)) return "—";
    if (n >= 1e6) return (n / 1e6).toFixed(1).replace(/\.?0+$/, "") + "M";
    if (n >= 1e3) return (n / 1e3).toFixed(1).replace(/\.?0+$/, "") + "K";
    return String(Math.round(n));
  };

  // Темы, по которым ассистент может выдать живой срез рейтинга.
  const LIVE_TOPICS = [
    { id: "python", icon: "🐍", title: { ru: "Топ для Python", en: "Top for Python" }, re: /python|питон|пайтон|pylance|django|flask|jupyter|pandas/ , kw: ["python", "pylance", "jupyter", "django", "flask", "pytest", "ruff", "conda", "pandas"] },
    { id: "web", icon: "🌐", title: { ru: "Топ для веба", en: "Top for web development" }, re: /веб|web|html|css|react|vue|angular|tailwind|javascript|typescript|front|фронт/ , kw: ["html", "css", "react", "vue", "angular", "svelte", "tailwind", "javascript", "typescript", "prettier", "eslint", "node"] },
    { id: "ai", icon: "🤖", title: { ru: "Топ ИИ-ассистентов", en: "Top AI assistants" }, re: /\bai\b|ии|нейросет|copilot|chatgpt|gpt|claude|llm|искусственн/ , kw: ["copilot", "gpt", "ai", "llm", "chatgpt", "claude", "codeium", "continue", "tabnine", "gemini"] },
    { id: "git", icon: "🔧", title: { ru: "Топ для Git", en: "Top for Git" }, re: /\bgit\b|гит|github|gitlab|коммит|commit|ветк|branch/ , kw: ["git", "github", "gitlab", "diff", "blame", "commit"] },
    { id: "games", icon: "🎮", title: { ru: "Топ для разработки игр", en: "Top for game development" }, re: /игр|гейм|game|unity|godot|unreal|shader/ , kw: ["unity", "godot", "unreal", "game", "gamedev", "shader", "sprite", "gdscript"] },
    { id: "themes", icon: "🎨", title: { ru: "Топ тем и оформления", en: "Top themes and styling" }, re: /тем|theme|оформлен|иконк|color|цвет/ , kw: ["theme", "icon", "color", "material", "dracula", "catppuccin"] },
    { id: "debug", icon: "🧪", title: { ru: "Топ для отладки и тестов", en: "Top for debugging and tests" }, re: /тест|test|отладк|debug|jest|playwright|cypress/ , kw: ["test", "jest", "mocha", "cypress", "playwright", "coverage", "debug"] },
    { id: "devops", icon: "☁️", title: { ru: "Топ для DevOps", en: "Top for DevOps" }, re: /docker|kubernetes|devops|aws|azure|terraform|wsl|ssh|контейнер|удалён/ , kw: ["docker", "kubernetes", "devops", "aws", "azure", "terraform", "remote", "ssh", "container", "wsl"] },
    { id: "langs", icon: "🧩", title: { ru: "Топ для других языков", en: "Top for other languages" }, re: /\brust\b|\bgolang\b|\bgo\b|java|kotlin|swift|php|ruby|scala|dart\b/ , kw: ["java", "c++", "c#", "golang", "rust", "php", "ruby", "kotlin", "swift", "dart", "lua"] },
  ];

  const LIST_ASK = /топ|топ-|лучш|посовет|что поставить|что установить|рейтинг|раст|тренд|популяр|сравн|top|best|recommend|rating|trending|popular/i;

  function liveMatches(e, words) {
    const hay = `${e.name} ${e.short} ${(e.tags || []).join(" ")} ${(e.categories || []).join(" ")} ${e.id}`.toLowerCase();
    return words.some((w) => hay.includes(w));
  }

  // Живой ответ: конкретные расширения из сегодняшнего топ-500.
  async function liveAnswer(qn) {
    const topic = LIVE_TOPICS.find((tp) => tp.re.test(qn));
    const wantTrend = /раст|тренд|популярн|новин|trending|growing|fastest/i.test(qn);
    if (!topic && !wantTrend) return null;

    const data = await liveExtensions();
    if (!data || !data.length) return null;

    const lg = lang();
    let list = [];
    let title = "";

    if (topic) {
      list = data.filter((e) => liveMatches(e, topic.kw));
      title = topic.title[lg] || topic.title.ru;
      if (wantTrend) list.sort((a, b) => (b.trendingWeekly || 0) - (a.trendingWeekly || 0));
      else list.sort((a, b) => (b.installs || 0) - (a.installs || 0));
    } else {
      list = [...data].sort((a, b) => (b.trendingWeekly || 0) - (a.trendingWeekly || 0)).slice(0, 20);
      title = t("ai.trendingTitle");
    }
    list = list.slice(0, 6);
    if (!list.length) return null;

    const items = list
      .map(
        (e) => `<li><a class="ai-ext" href="index.html#ext=${esc(e.id)}"><b>${esc(e.name)}</b>
          <span class="muted">#${e.rank} · ${esc(fmtInstalls(e.installs))} ⬇${e.rating ? " · ★" + e.rating.toFixed(1) : ""}</span></a></li>`
      )
      .join("");

    const note = wantTrend ? t("ai.liveNoteTrend") : t("ai.liveNote");
    return (
      `<div class="ai-msg-title"><span>${topic ? topic.icon : "📈"}</span> ${esc(title)}</div>` +
      `<ul class="ai-ext-list">${items}</ul>` +
      `<div class="ai-links"><a class="ai-link" href="index.html#rating">${esc(t("ai.openRating"))}</a>` +
      `<a class="ai-link" href="index.html#collectionsSection">${esc(t("ai.openCollections"))}</a></div>` +
      `<div class="ai-msg-body muted">${esc(note)}</div>`
    );
  }


  // ---------- База знаний ----------
  // keys — слова и фразы для поиска (RU + EN, ищутся одновременно),
  // body — ответ, поддерживает **жирный** и `код`; links — кнопки-ссылки.
  const KB = [
    {
      id: "install",
      icon: "📦",
      keys: [
        "установ", "поставить", "как скачать расширение", "добавить расширение",
        "install", "setup", "how to add extension",
      ],
      title: { ru: "Как установить расширение", en: "How to install an extension" },
      body: {
        ru: "Три способа — выберите удобный:\n• На этом сайте: откройте карточку расширения и нажмите **«Установить в VS Code»** или скопируйте команду.\n• В VS Code: панель Extensions (`Ctrl+Shift+X`) → поиск по названию → **Install**.\n• Из терминала: `code --install-extension publisher.name`.",
        en: "Three ways — pick the one you like:\n• On this site: open an extension card and click **“Install in VS Code”** or copy the command.\n• In VS Code: the Extensions panel (`Ctrl+Shift+X`) → search by name → **Install**.\n• From a terminal: `code --install-extension publisher.name`.",
      },
      links: [
        { href: "index.html#rating", label: { ru: "Открыть рейтинг", en: "Open the rating" } },
      ],
    },
    {
      id: "best",
      icon: "🏆",
      keys: [
        "лучшие расширения", "какие расширения", "топ расширени", "что выбрать", "популярные расширения",
        "посоветуй расширени", "выбрать расширени", "best extensions", "top extensions", "which extension",
      ],
      title: { ru: "Как выбрать лучшие расширения", en: "How to pick the best extensions" },
      body: {
        ru: "Загляните в **подборки** на главной: «Лучшие для Python», «Для программистов», «ИИ и нейросети», «Создание игр» и другие. Внутри можно отсортировать по рейтингу или росту за неделю, а в карточке — статистика, README и команда установки.",
        en: "Check the **collections** on the home page: “Best for Python”, “For programmers”, “AI & neural nets”, “Game development” and more. You can sort by rating or weekly growth, and each card has stats, the README and an install command.",
      },
      links: [
        { href: "index.html#collectionsSection", label: { ru: "Подборки", en: "Collections" } },
        { href: "index.html#rating", label: { ru: "Рейтинг", en: "Rating" } },
      ],
    },
    {
      id: "hotkeys",
      icon: "⌨️",
      keys: [
        "горячие клавиши", "хоткеи", "сочетания клавиш", "клавиш", "hotkeys", "shortcuts", "keyboard",
      ],
      title: { ru: "Горячие клавиши VS Code", en: "VS Code hotkeys" },
      body: {
        ru: "Самые нужные: `Ctrl+P` — быстрый переход к файлу, `Ctrl+Shift+P` — все команды, `Ctrl+D` — выделить следующее вхождение, `Alt+клик` — мультикурсор, `F2` — переименовать во всём проекте. Терминал — **Ctrl + `** (клавиша с тильдой).\nПолный список с примерами — на странице «Лайфхаки».",
        en: "The essentials: `Ctrl+P` — quick open a file, `Ctrl+Shift+P` — all commands, `Ctrl+D` — select next occurrence, `Alt+click` — multi-cursor, `F2` — rename across the project. The terminal — **Ctrl + `** (the tilde key).\nThe full list with examples is on the “Lifehacks” page.",
      },
      links: [
        { href: "lifehacks.html", label: { ru: "Все лайфхаки", en: "All lifehacks" } },
      ],
    },
    {
      id: "lifehacks",
      icon: "💡",
      keys: [
        "лайфхак", "совет", "трюк", "фишк", "профили", "синхронизац", "сниппет", "emmet",
        "tips", "tricks", "profiles", "settings sync", "snippets",
      ],
      title: { ru: "Лайфхаки и трюки", en: "Lifehacks and tricks" },
      body: {
        ru: "На странице «Лайфхаки» — 20 советов: мультикурсор, Emmet, профили для работы и учёбы, синхронизация настроек через GitHub, свои сниппеты, Timeline, встроенный терминал и другое. Там же поиск по советам.",
        en: "The “Lifehacks” page has 20 tips: multi-cursor, Emmet, profiles for work and study, GitHub settings sync, custom snippets, Timeline, the built-in terminal and more. There's also a search over the tips.",
      },
      links: [
        { href: "lifehacks.html", label: { ru: "Открыть лайфхаки", en: "Open lifehacks" } },
      ],
    },
    {
      id: "prompts",
      icon: "✨",
      keys: [
        "промпт", "промт", "промты", "промпты", "prompt", "copilot chat", "запрос для ии",
      ],
      title: { ru: "Лучшие промпты", en: "The best prompts" },
      body: {
        ru: "На странице «Промпты» — готовые промпты для Copilot, ChatGPT и Koda: **для новичков**, **для знающих** и **для ветеранов VS Code**. Каждый копируется одной кнопкой, остаётся подставить свой код. Там же — советы, как усиливать промпты.",
        en: "The “Prompts” page has ready-made prompts for Copilot, ChatGPT and Koda: **for beginners**, **for advanced users** and **for VS Code veterans**. Each one copies with a single button — just paste your code. There are also tips on making prompts stronger.",
      },
      links: [
        { href: "prompts.html", label: { ru: "Открыть промпты", en: "Open prompts" } },
      ],
    },
    {
      id: "kits",
      icon: "🎁",
      keys: [
        "набор", "готовый набор", "пачка", "стартовый", "с чего начать", "что поставить сразу", "комплект",
        "kit", "bundle", "starter pack", "where to start",
      ],
      title: { ru: "Готовые наборы расширений", en: "Ready-made extension kits" },
      body: {
        ru: "На странице «Наборы» — комплекты из 5–10 расширений: новичкам, веб, Python, ИИ, игры и Git. Нажмите **«Скопировать все команды»** — и вставьте их в терминал (`Ctrl+` `). Расширения установятся по очереди.",
        en: "The “Kits” page has bundles of 5–10 extensions: beginners, web, Python, AI, games and Git. Click **“Copy all commands”** and paste them into the terminal (`Ctrl+` `). The extensions install one by one.",
      },
      links: [
        { href: "kits.html", label: { ru: "Открыть наборы", en: "Open kits" } },
      ],
    },
    {
      id: "avoid",
      icon: "🚫",
      keys: [
        "не стоит ставить", "не ставить", "вредные", "тормозит", "конфликт", "дубли", "антипаттерн", "лишние",
        "avoid", "should not install", "conflict", "slow", "duplicate",
      ],
      title: { ru: "Плагины, которые не стоит ставить", en: "Extensions you should not install" },
      body: {
        ru: "На странице «Не ставить» — типичные антипаттерны: **дубли встроенных функций**, **заброшенные расширения**, **несколько форматтеров или ИИ-ассистентов сразу**, **тяжёлые мега-паки**. Для каждого — объяснение и то, что использовать вместо.",
        en: "The “Avoid” page covers typical anti-patterns: **duplicates of built-in features**, **abandoned extensions**, **several formatters or AI assistants at once**, **heavy mega-packs**. Each comes with an explanation and what to use instead.",
      },
      links: [
        { href: "avoid.html", label: { ru: "Открыть страницу", en: "Open the page" } },
      ],
    },
    {
      id: "python",
      icon: "🐍",
      keys: [
        "python", "питон", "пайтон", "pylance", "jupyter", "django", "flask",
      ],
      title: { ru: "Расширения для Python", en: "Extensions for Python" },
      body: {
        ru: "Минимальный набор: **Python** (`ms-python.python`) + **Pylance** — поддержка языка и IntelliSense. Для ноутбуков — **Jupyter**, для строгого стиля — **Ruff**. Все они есть в подборке «Лучшие для Python» на главной.",
        en: "The minimal setup: **Python** (`ms-python.python`) + **Pylance** for language support and IntelliSense. For notebooks — **Jupyter**, for strict style — **Ruff**. All of them are in the “Best for Python” collection on the home page.",
      },
      links: [
        { href: "index.html#collectionsSection", label: { ru: "Подборка для Python", en: "Python collection" } },
      ],
    },
    {
      id: "ai-ext",
      icon: "🤖",
      keys: [
        "ии", "нейросет", "copilot", "gpt", "ai", "chatgpt", "claude", "искусственный интеллект", "ассистент",
      ],
      title: { ru: "ИИ-расширения для VS Code", en: "AI extensions for VS Code" },
      body: {
        ru: "В подборке «ИИ и нейросети» собраны Copilot, Copilot Chat и другие ассистенты: автодополнение, чат по коду, генерация тестов. Откройте подборку на главной — там актуальный рейтинг по установкам.",
        en: "The “AI & neural nets” collection gathers Copilot, Copilot Chat and other assistants: autocomplete, code chat, test generation. Open the collection on the home page for a live install-count ranking.",
      },
      links: [
        { href: "index.html#collectionsSection", label: { ru: "Подборка ИИ", en: "AI collection" } },
      ],
    },
    {
      id: "sponsor",
      icon: "❤️",
      keys: [
        "спонсор", "поддержать автора", "донат", "донейт", "sponsor", "donate", "support author",
      ],
      title: { ru: "Бейдж «Спонсор»", en: "The “Sponsor” badge" },
      body: {
        ru: "Расширения с бейджем **❤ Спонсор** принимают поддержку авторов. Откройте карточку — там кнопка «Поддержать автора», она ведёт на страницу спонсорства (например, GitHub Sponsors). На позицию в рейтинге это не влияет — рейтинг строится только по данным Marketplace.",
        en: "Extensions with the **❤ Sponsor** badge accept author support. Open a card — there's a “Sponsor” button leading to the sponsorship page (e.g. GitHub Sponsors). It does not affect the ranking — the rating is built solely from Marketplace data.",
      },
      links: [
        { href: "index.html#rating", label: { ru: "Найти спонсоров", en: "Find sponsors" } },
      ],
    },
    {
      id: "rating",
      icon: "📊",
      keys: [
        "рейтинг", "как обновляется", "обновление", "marketplace", "откуда данные", "топ-500", "топ 500",
        "rating", "how is it updated", "where is the data",
      ],
      title: { ru: "Как обновляется рейтинг", en: "How the rating is updated" },
      body: {
        ru: "Рейтинг берётся из публичного API Visual Studio Marketplace — топ-500 расширений по числу установок. Данные кешируются в браузере на сутки и автоматически пересобираются в полночь; вручную — кнопкой **«Обновить»**. Стрелки ▲▼ на карточках показывают изменение позиции за сутки.",
        en: "The rating comes from the public Visual Studio Marketplace API — the top 500 extensions by install count. Data is cached in your browser for a day and rebuilds automatically at midnight; manually — via the **“Refresh”** button. The ▲▼ arrows on cards show day-over-day position changes.",
      },
      links: [
        { href: "index.html#about", label: { ru: "Подробнее о рейтинге", en: "More about the rating" } },
      ],
    },
    {
      id: "settings",
      icon: "⚙️",
      keys: [
        "настройк", "конфиг", "settings.json", "шрифт", "профил", "тема сайта",
        "settings", "config", "font", "profile",
      ],
      title: { ru: "Настройки VS Code", en: "VS Code settings" },
      body: {
        ru: "Настройки меняются через интерфейс (`Ctrl+,`) или файлом: `Ctrl+Shift+P` → **Open User Settings (JSON)**. На странице «Настройки» — готовые settings.json (базовый, веб, Python), примеры keybindings.json и проверенные темы — всё копируется одной кнопкой.",
        en: "Change settings via the UI (`Ctrl+,`) or as a file: `Ctrl+Shift+P` → **Open User Settings (JSON)**. The “Setup” page has ready-made settings.json files (base, web, Python), keybindings.json examples and proven themes — all copied with one button.",
      },
      links: [
        { href: "settings.html", label: { ru: "Готовые настройки", en: "Ready-made settings" } },
        { href: "lifehacks.html", label: { ru: "Советы по настройке", en: "Setup tips" } },
      ],
    },
    {
      id: "git",
      icon: "🔧",
      keys: [
        "git", "гит", "коммит", "commit", "ветк", "branch", "github", "контроль версий", "version control",
      ],
      title: { ru: "Git в VS Code", en: "Git in VS Code" },
      body: {
        ru: "Панель Source Control (`Ctrl+Shift+G`) — коммиты, ветки и диффы без терминала. Для наглядной истории поставьте **GitLens** или **Git Graph** — они есть в подборке «Git и качество кода». История конкретного файла — в панели Timeline.",
        en: "The Source Control panel (`Ctrl+Shift+G`) gives you commits, branches and diffs without a terminal. For a visual history install **GitLens** or **Git Graph** — both are in the “Git & code quality” collection. A single file's history lives in the Timeline panel.",
      },
      links: [
        { href: "index.html#collectionsSection", label: { ru: "Подборка Git", en: "Git collection" } },
        { href: "lifehacks.html", label: { ru: "Timeline и терминал", en: "Timeline & terminal" } },
      ],
    },
    {
      id: "lessons",
      icon: "🎬",
      keys: [
        "урок", "видео", "курс", "обучение", "туториал", "lesson", "tutorial", "youtube", "video", "course",
      ],
      title: { ru: "Видео-уроки", en: "Video lessons" },
      body: {
        ru: "На странице «Уроки» — подборка видео про VS Code и расширения на русском и английском, с обложками и темами. Совет: включите субтитры — у многих видео есть автоперевод.",
        en: "The “Lessons” page has a collection of videos about VS Code and extensions in Russian and English, with thumbnails and topics. Tip: turn on subtitles — many videos have auto-translation.",
      },
      links: [
        { href: "lessons.html", label: { ru: "Смотреть уроки", en: "Watch lessons" } },
      ],
    },
    {
      id: "site",
      icon: "🧭",
      keys: [
        "что умеет", "разделы", "помощь", "навигац", "что здесь", "куда нажать", "help", "sections", "what can you do",
      ],
      title: { ru: "Что есть на сайте", en: "What's on the site" },
      body: {
        ru: "• **Рейтинг** — топ-500 расширений с подборками и поиском.\n• **Наборы** — готовые комплекты расширений для старта.\n• **Уроки** — видео-туториалы.\n• **Лайфхаки** — советы и горячие клавиши.\n• **Промпты** — готовые промпты для ИИ-ассистентов.\n• **Настройки** — settings.json, клавиши и темы.\n• **Не ставить** — антипаттерны и чего избегать.\nСпросите меня про любой раздел — подскажу, где что лежит.",
        en: "• **Rating** — the top 500 extensions with collections and search.\n• **Kits** — ready-made extension bundles to get started.\n• **Lessons** — video tutorials.\n• **Lifehacks** — tips and hotkeys.\n• **Prompts** — ready-made prompts for AI assistants.\n• **Setup** — settings.json, keys and themes.\n• **Avoid** — anti-patterns to stay away from.\nAsk me about any section — I'll point you to it.",
      },
      links: [
        { href: "index.html#rating", label: { ru: "Рейтинг", en: "Rating" } },
        { href: "kits.html", label: { ru: "Наборы", en: "Kits" } },
        { href: "prompts.html", label: { ru: "Промпты", en: "Prompts" } },
      ],
    },
    {
      id: "languages",
      icon: "🧩",
      keys: [
        "java", "c++", "rust", "golang", "php", "kotlin", "swift", "другой язык", "язык программирования", "language",
      ],
      title: { ru: "Расширения для других языков", en: "Extensions for other languages" },
      body: {
        ru: "На главной есть подборка **«Другие языки»**: Java, C++, Rust, Go, PHP и другие. Для точного набора ищите по названию языка в поиске рейтинга — например, `Rust` или `Kotlin`.",
        en: "The home page has an **“Other languages”** collection: Java, C++, Rust, Go, PHP and more. For an exact set, search the rating by language name — e.g. `Rust` or `Kotlin`.",
      },
      links: [
        { href: "index.html#rating", label: { ru: "Поиск в рейтинге", en: "Search the rating" } },
      ],
    },
    {
      id: "theme",
      icon: "🎨",
      keys: [
        "тем", "theme", "оформление", "иконк", "цвет", "шрифт лигатур", "color", "icons",
      ],
      title: { ru: "Темы и оформление", en: "Themes and styling" },
      body: {
        ru: "Подборка **«Темы и оформление»** на главной: темы, иконки, подсветка цветов. Сменить тему — `Ctrl+K Ctrl+T`. Для лигатур в шрифте попробуйте **Fira Code** или **JetBrains Mono**.",
        en: "The **“Themes & styling”** collection on the home page: themes, icons, colour highlighting. Switch a theme with `Ctrl+K Ctrl+T`. For font ligatures try **Fira Code** or **JetBrains Mono**.",
      },
      links: [
        { href: "index.html#collectionsSection", label: { ru: "Подборка тем", en: "Themes collection" } },
      ],
    },
    // ---------- Живые рекомендации ----------
    {
      id: "rec-python",
      icon: "🐍",
      keys: [
        "посоветуй расширение для python", "лучшие для python", "что поставить для python",
        "расширение для python", "python best", "python extension",
      ],
      title: { ru: "Лучшие расширения для Python", en: "Best extensions for Python" },
      body: {
        ru: "Минимальный старт: **Python** + **Pylance** — поддержка языка и IntelliSense. Дополнительно — **Ruff** (линтер), **Jupyter** (ноутбуки). Команды:\n\n`code --install-extension ms-python.python`\n`code --install-extension ms-python.vscode-pylance`\n`code --install-extension ms-toolsai.jupyter`\n`code --install-extension charliermarsh.ruff`",
        en: "Minimal start: **Python** + **Pylance** for language support and IntelliSense. Plus — **Ruff** (linter), **Jupyter** (notebooks). Commands:\n\n`code --install-extension ms-python.python`\n`code --install-extension ms-python.vscode-pylance`\n`code --install-extension ms-toolsai.jupyter`\n`code --install-extension charliermarsh.ruff`",
      },
      links: [
        { href: "index.html#rating", label: { ru: "Смотреть весь рейтинг", en: "View full rating" } },
      ],
    },
    {
      id: "rec-web",
      icon: "🌐",
      keys: [
        "посоветуй расширение для веб", "лучшие для веб", "расширение для html css javascript",
        "web best", "web development extension", "html css js",
      ],
      title: { ru: "Лучшие расширения для веб-разработки", en: "Best extensions for web development" },
      body: {
        ru: "Стандартный набор: **Prettier** (форматтер), **ESLint** (линтер), **Live Server** (автоперезагрузка), **Tailwind CSS IntelliSense**. Команды:\n\n`code --install-extension esbenp.prettier-vscode`\n`code --install-extension dbaeumer.vscode-eslint`\n`code --install-extension ritwickdey.liveserver`\n`code --install-extension bradlc.vscode-tailwindcss`",
        en: "Standard set: **Prettier** (formatter), **ESLint** (linter), **Live Server** (auto-reload), **Tailwind CSS IntelliSense**. Commands:\n\n`code --install-extension esbenp.prettier-vscode`\n`code --install-extension dbaeumer.vscode-eslint`\n`code --install-extension ritwickdey.liveserver`\n`code --install-extension bradlc.vscode-tailwindcss`",
      },
      links: [
        { href: "index.html#rating", label: { ru: "Смотреть весь рейтинг", en: "View full rating" } },
      ],
    },
    {
      id: "rec-git",
      icon: "🔧",
      keys: [
        "посоветуй расширение для git", "лучшие для git", "расширение для контроля версий",
        "git best", "git extension", "version control",
      ],
      title: { ru: "Лучшие расширения для Git", en: "Best extensions for Git" },
      body: {
        ru: "Самые полезные: **GitLens** (история каждой строки), **Git Graph** (граф веток), **GitHub Pull Requests** (ревью из редактора). Команды:\n\n`code --install-extension eamodio.gitlens`\n`code --install-extension mhutchie.git-graph`\n`code --install-extension github.vscode-pull-request-github`",
        en: "Most useful: **GitLens** (history per line), **Git Graph** (branch graph), **GitHub Pull Requests** (review from editor). Commands:\n\n`code --install-extension eamodio.gitlens`\n`code --install-extension mhutchie.git-graph`\n`code --install-extension github.vscode-pull-request-github`",
      },
      links: [
        { href: "index.html#rating", label: { ru: "Смотреть весь рейтинг", en: "View full rating" } },
      ],
    },
    {
      id: "rec-ai",
      icon: "🤖",
      keys: [
        "посоветуй расширение для ии", "лучшие ии", "расширение для нейросетей",
        "ai best", "ai assistant extension", "copilot alternative",
      ],
      title: { ru: "Лучшие ИИ-расширения", en: "Best AI extensions" },
      body: {
        ru: "Топ-выбор: **GitHub Copilot** (автодополнение от GitHub), **Continue** (открытый, свои модели), **Codeium** (бесплатный). Совет: держите включённым только один — они конфликтуют.\n\n`code --install-extension github.copilot`\n`code --install-extension continue.continue`\n`code --install-extension codeium.codeium`",
        en: "Top pick: **GitHub Copilot** (autocomplete from GitHub), **Continue** (open-source, your own models), **Codeium** (free). Tip: keep only one enabled — they conflict.\n\n`code --install-extension github.copilot`\n`code --install-extension continue.continue`\n`code --install-extension codeium.codeium`",
      },
      links: [
        { href: "index.html#rating", label: { ru: "Смотреть весь рейтинг", en: "View full rating" } },
      ],
    },
    {
      id: "rec-start",
      icon: "🐣",
      keys: [
        "посоветуй расширение для новичка", "что поставить сразу", "стартовый набор",
        "beginner extension", "starter pack", "what to install first",
      ],
      title: { ru: "Стартовый набор расширений", en: "Starter extension pack" },
      body: {
        ru: "Десять расширений, которые сделают редактор удобным с первого дня:\n\n• **Error Lens** — ошибки прямо в строке\n• **Code Runner** — запуск кода одной кнопкой\n• **GitLens** — история каждой строки\n• **Code Spell Checker** — проверка орфографии\n• **EditorConfig** — единый стиль отступов\n• **Path Intellisense** — автодополнение путей\n• **Better Comments** — цветные пометки\n• **Indent Rainbow** — подсветка отступов\n• **Live Server** — автоперезагрузка\n• **Todo Highlight** — подсветка TODO\n\nИли откройте готовый набор на странице «Наборы».",
        en: "Ten extensions that make the editor comfortable from day one:\n\n• **Error Lens** — errors right in the line\n• **Code Runner** — run code with one button\n• **GitLens** — history for every line\n• **Code Spell Checker** — spell checking\n• **EditorConfig** — consistent indentation\n• **Path Intellisense** — path autocomplete\n• **Better Comments** — color-coded notes\n• **Indent Rainbow** — indent highlighting\n• **Live Server** — live reload\n• **Todo Highlight** — TODO highlighting\n\nOr open a ready kit on the \"Kits\" page.",
      },
      links: [
        { href: "kits.html", label: { ru: "Открыть наборы", en: "Open kits" } },
      ],
    },
  ];

  // Быстрые вопросы (чипы) — id статей базы знаний.
  const QUICK = ["install", "kits", "hotkeys", "prompts", "python", "avoid", "rec-start"];

  const byId = (id) => KB.find((a) => a.id === id);

  // ---------- Поиск по базе ----------
  const STOP = new Set([
    "как", "что", "где", "мне", "можно", "ли", "в", "на", "и", "или", "для", "у", "с", "по", "это", "а",
    "the", "a", "an", "to", "is", "how", "what", "can", "i", "my", "in", "of", "do", "does", "where", "me",
  ]);

  const norm = (s) =>
    String(s)
      .toLowerCase()
      .replace(/ё/g, "е")
      .replace(/[^a-zа-я0-9\s+#]/g, " ")
      .replace(/\s+/g, " ")
      .trim();

  const tokenize = (qn) => qn.split(" ").filter((w) => w && !STOP.has(w));

  function scoreArticle(qn, toks, a) {
    let s = 0;
    for (const key of a.keys) {
      const k = norm(key);
      if (!k) continue;
      if (k.includes(" ")) {
        if (qn.includes(k)) {
          s += 6;
          continue;
        }
        const parts = k.split(" ").filter((w) => w.length >= 3 && !STOP.has(w));
        if (
          parts.length &&
          parts.every((p) => toks.some((tk) => tk.startsWith(p) || (p.length >= 4 && tk.length >= 4 && p.startsWith(tk))))
        ) {
          s += 3;
        }
      } else {
        let best = 0;
        for (const tk of toks) {
          if (tk === k) best = Math.max(best, 3);
          else if (k.length >= 4 && tk.length >= 4 && (tk.startsWith(k) || k.startsWith(tk))) best = Math.max(best, 2);
        }
        s += best;
      }
    }
    const titleWords = norm(a.title.ru + " " + a.title.en)
      .split(" ")
      .filter((w) => w.length >= 4 && !STOP.has(w));
    for (const tk of toks) {
      if (titleWords.some((w) => w.startsWith(tk) || tk.startsWith(w))) s += 1;
    }
    // Подстрочный бонус: если запрос целиком встречается в заголовке или в тексте ответа
    const titleFull = norm(a.title.ru + " " + a.title.en);
    if (toks.length > 1 && titleFull.includes(qn)) s += 4;
    const bodyFull = norm(a.body.ru + " " + a.body.en);
    if (toks.length > 1 && bodyFull.includes(qn)) s += 2;
    return s;
  }

  function search(q) {
    const qn = norm(q);
    const toks = tokenize(qn);
    if (!qn) return [];
    return KB.map((a) => ({ a, s: scoreArticle(qn, toks, a) }))
      .filter((x) => x.s > 0)
      .sort((x, y) => y.s - x.s);
  }

  function specialIntent(qn) {
    if (qn.length <= 30 && /(^|\s)(привет|здравствуй|хай|ку|hi|hello|hey|добрый (день|вечер)|доброе утро)/.test(qn))
      return "greeting";
    if (qn.length <= 30 && /(спасибо|благодарю|спс|thanks|thank you)/.test(qn)) return "thanks";
    return null;
  }

  // ---------- Форматирование ответа ----------
  // **жирный** → <b>, `код` → <code>, переносы строк → <br>
  function fmt(text) {
    let s = esc(text);
    s = s.replace(/\*\*([^*]+)\*\*/g, "<b>$1</b>");
    s = s.replace(/`([^`]+)`/g, "<code>$1</code>");
    s = s.replace(/\n/g, "<br>");
    return s;
  }

  // ---------- Виджет ----------
  const root = document.createElement("div");
  root.className = "ai-root";
  root.innerHTML = `
    <button class="ai-fab" type="button" data-ai-open aria-expanded="false">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="8" width="16" height="12" rx="4"/><path d="M12 8V4"/><circle cx="12" cy="3" r="1.4"/><path d="M9 13h.01M15 13h.01"/><path d="M9.5 16.5c.8.6 1.7.9 2.5.9s1.7-.3 2.5-.9"/></svg>
      <span class="ai-fab-dot" aria-hidden="true"></span>
    </button>
    <section class="ai-panel" role="dialog" aria-modal="false">
      <header class="ai-head">
        <span class="ai-head-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="8" width="16" height="12" rx="4"/><path d="M12 8V4"/><circle cx="12" cy="3" r="1.4"/><path d="M9 13h.01M15 13h.01"/><path d="M9.5 16.5c.8.6 1.7.9 2.5.9s1.7-.3 2.5-.9"/></svg>
        </span>
        <div class="ai-head-titles">
          <h3 data-ai-title></h3>
          <p data-ai-subtitle></p>
        </div>
        <button class="ai-close" type="button" data-ai-close>✕</button>
      </header>
      <div class="ai-messages" role="log" aria-live="polite"></div>
      <div class="ai-chips"></div>
      <form class="ai-form">
        <input type="text" maxlength="300" autocomplete="off" />
        <button class="ai-send" type="submit">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 2 11 13"/><path d="M22 2 15 22l-4-9-9-4 20-7z"/></svg>
        </button>
      </form>
      <div class="ai-note"></div>
    </section>`;
  document.body.appendChild(root);

  const fab = root.querySelector(".ai-fab");
  const panel = root.querySelector(".ai-panel");
  const messagesEl = root.querySelector(".ai-messages");
  const chipsEl = root.querySelector(".ai-chips");
  const form = root.querySelector(".ai-form");
  const input = form.querySelector("input");
  const noteEl = root.querySelector(".ai-note");
  const titleEl = root.querySelector("[data-ai-title]");
  const subtitleEl = root.querySelector("[data-ai-subtitle]");
  const closeBtn = root.querySelector("[data-ai-close]");

  let opened = false;
  let greeted = false;

  function applyUiStrings() {
    fab.title = t("ai.fabTitle");
    fab.setAttribute("aria-label", t("ai.fabTitle"));
    closeBtn.setAttribute("aria-label", t("ai.close"));
    titleEl.textContent = t("ai.title");
    subtitleEl.textContent = t("ai.subtitle");
    input.placeholder = t("ai.placeholder");
    noteEl.textContent = t("ai.note");
  }

  function scrollBottom() {
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function addUserMessage(text) {
    const div = document.createElement("div");
    div.className = "ai-msg user";
    div.textContent = text;
    messagesEl.appendChild(div);
    scrollBottom();
  }

  function addBotText(html) {
    const div = document.createElement("div");
    div.className = "ai-msg bot";
    div.innerHTML = html;
    messagesEl.appendChild(div);
    scrollBottom();
  }

  function addArticle(article, related = []) {
    const lg = lang();
    const links = article.links
      .map((l) => `<a class="ai-link" href="${esc(l.href)}">${esc(l.label[lg] || l.label.ru)}</a>`)
      .join("");
    const relatedHtml = related.length
      ? `<div class="ai-related"><span>${esc(t("ai.quickTitle"))}</span>${related
          .map((r) => `<button class="ai-chip" type="button" data-ai-article="${r.id}">${esc(r.title[lg] || r.title.ru)}</button>`)
          .join("")}</div>`
      : "";
    addBotText(
      `<div class="ai-msg-title"><span>${article.icon}</span> ${esc(article.title[lg] || article.title.ru)}</div>` +
        `<div class="ai-msg-body">${fmt(article.body[lg] || article.body.ru)}</div>` +
        (links ? `<div class="ai-links">${links}</div>` : "") +
        relatedHtml
    );
  }

  function showTyping() {
    const div = document.createElement("div");
    div.className = "ai-msg bot ai-typing";
    div.innerHTML = "<span></span><span></span><span></span>";
    messagesEl.appendChild(div);
    scrollBottom();
    return div;
  }

  function handle(q) {
    const qn = norm(q);
    if (!qn) return;

    const typing = showTyping();
    setTimeout(() => {
      typing.remove();

      const intent = specialIntent(qn);
      if (intent === "greeting") {
        addBotText(esc(t("ai.helloReply")));
        return;
      }
      if (intent === "thanks") {
        addBotText(esc(t("ai.thanks")));
        return;
      }

      const found = search(q);
      const kbOk = found.length && found[0].s >= 3;
      const kbStrong = found.length && found[0].s >= 6;
      // Про живой рейтинг спрашивают либо прямо («что растёт на этой неделе»),
      // либо по теме + просьбе посоветовать («топ для python»).
      const topicHit = LIVE_TOPICS.some((tp) => tp.re.test(qn)) || /раст|тренд|trending|growing|неделе/i.test(qn);
      const wantLive = (topicHit && LIST_ASK.test(qn)) || !kbOk;

      const showKb = () => {
        if (!kbOk) {
          addBotText(esc(t("ai.notFound")));
          return;
        }
        const top = found[0];
        const related = found
          .slice(1, 3)
          .filter((x) => x.s >= Math.max(3, top.s * 0.5))
          .map((x) => x.a);
        addArticle(top.a, related);
      };

      if (!wantLive) {
        showKb();
        return;
      }
      liveAnswer(qn)
        .then((html) => {
          if (html) {
            addBotText(html);
            if (kbStrong) addArticle(found[0].a, found.slice(1, 3).filter((x) => x.s >= found[0].s * 0.5).map((x) => x.a));
          } else {
            showKb();
          }
        })
        .catch(() => showKb());
    }, 420);
  }

  function renderChips() {
    const lg = lang();
    chipsEl.innerHTML = "";
    // Обычные чипы — статьи базы, отдельные — «привет» и живой рейтинг.
    const items = QUICK.map((id) => {
      const a = byId(id);
      const title = a ? a.title[lg] || a.title.ru : id;
      return { label: title, query: title };
    });
    items.push({ label: t("ai.hello"), query: "привет", plain: true });
    items.push({ label: t("ai.chipTrending"), query: "что сейчас растёт", plain: true });
    items.forEach((it) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "ai-chip";
      btn.textContent = it.label;
      btn.addEventListener("click", () => {
        if (!opened) togglePanel(true);
        ask(it.query, it.plain);
      });
      chipsEl.appendChild(btn);
    });
  }

  function ask(q, plain) {
    input.value = "";
    addUserMessage(q);
    handle(q, plain);
  }

  function togglePanel(next) {
    opened = typeof next === "boolean" ? next : !opened;
    panel.classList.toggle("open", opened);
    fab.setAttribute("aria-expanded", String(opened));
    fab.classList.toggle("active", opened);
    if (opened) {
      if (!greeted) {
        greeted = true;
        addBotText(esc(t("ai.hello")));
      }
      input.focus();
      scrollBottom();
    }
  }

  // ---------- События ----------
  fab.addEventListener("click", () => togglePanel());
  closeBtn.addEventListener("click", () => togglePanel(false));

  form.addEventListener("submit", (ev) => {
    ev.preventDefault();
    const q = input.value.trim();
    if (!q) return;
    input.value = "";
    addUserMessage(q);
    handle(q);
  });

  messagesEl.addEventListener("click", (ev) => {
    const chip = ev.target.closest("[data-ai-article]");
    if (!chip) return;
    const a = byId(chip.dataset.aiArticle);
    if (a) addArticle(a);
  });

  document.addEventListener("keydown", (ev) => {
    if (ev.key === "Escape" && opened) togglePanel(false);
  });

  window.addEventListener("langchange", () => {
    applyUiStrings();
    renderChips();
    // сообщения ассистента — контент на языке в момент ответа:
    // сбрасываем чат, чтобы всё было на одном языке
    messagesEl.innerHTML = "";
    greeted = false;
    if (opened) {
      greeted = true;
      addBotText(esc(t("ai.hello")));
    }
  });

  // ---------- Init ----------
  applyUiStrings();
  renderChips();

  // Отладочный доступ (используется smoke-тестами проекта).
  window.__VSX_AI = { KB, search, byId };
})();
