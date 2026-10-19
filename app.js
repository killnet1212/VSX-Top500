/* ============================================================
   VSX Top500 — Top 500 VS Code extensions, refreshed daily.
   Data source: Visual Studio Marketplace public gallery API.
   i18n: RU / EN via window.I18N (i18n.js).
   ============================================================ */

(() => {
  "use strict";

  const t = (key, vars) => window.I18N.t(key, vars);
  const lang = () => window.I18N.lang;
  const loc = () => window.I18N.LOCALE();

  // ---------- Config ----------
  const API_URL = "https://marketplace.visualstudio.com/_apis/public/gallery/extensionquery";
  const API_VERSION = "7.1-preview.1";
  const TOP_N = 500;
  const CACHE_KEY = "vsx_top500_cache_v3";
  const PREV_KEY = "vsx_top500_prev_v3";
  const RETRY_ON_ERROR_MS = 5 * 60 * 1000;

  // Query flags: IncludeVersions(1) | IncludeFiles(2) | IncludeCategoryAndTags(4) |
  // IncludeVersionProperties(16) | IncludeStatistics(256) | IncludeLatestVersionOnly(512)
  const FLAGS = 1 | 2 | 4 | 16 | 256 | 512;

  // ---------- Локализованные названия категорий Marketplace ----------
  const CATEGORY_RU = {
    "AI": "ИИ",
    "Azure": "Azure",
    "Chat": "Чат",
    "Data Science": "Наука о данных",
    "Debuggers": "Отладчики",
    "Education": "Обучение",
    "Extension Packs": "Наборы расширений",
    "Formatters": "Форматирование",
    "Keymaps": "Раскладки клавиш",
    "Language Packs": "Языковые пакеты",
    "Linters": "Линтеры",
    "Machine Learning": "Машинное обучение",
    "Notebooks": "Ноутбуки",
    "Other": "Другое",
    "Others": "Другое",
    "Programming Languages": "Языки программирования",
    "SCM Providers": "Контроль версий",
    "Snippets": "Сниппеты",
    "Testing": "Тестирование",
    "Themes": "Темы",
    "Visualization": "Визуализация",
  };
  const catName = (c) => (lang() === "ru" ? CATEGORY_RU[c] || c || t("cat.other") : c || t("cat.other"));

  // ---------- Тематические подборки (навигация) ----------
  // Каждая подборка ищет совпадения по названию, описанию, тегам, категориям и издателю.
  const kw = (...words) => {
    const lower = words.map((w) => w.toLowerCase());
    return (e) => {
      const hay = `${e.name} ${e.short} ${e.tags.join(" ")} ${e.categories.join(" ")} ${e.id}`.toLowerCase();
      return lower.some((w) => hay.includes(w));
    };
  };
  // ---------- «Лучшие» подборки: кураторские списки и правила ----------
  // Известные «маст-хэв» расширения, полезные любому программисту
  const PROG_ESSENTIALS = new Set([
    "eamodio.gitlens", "esbenp.prettier-vscode", "dbaeumer.vscode-eslint",
    "usernamehw.errorlens", "formulahendry.code-runner", "aaron-bond.better-comments",
    "christian-kohler.path-intellisense", "christian-kohler.npm-intellisense",
    "ritwickdey.liveserver", "streetsidesoftware.code-spell-checker",
    "editorconfig.editorconfig", "visualstudioexptteam.vscodeintellicode",
    "github.copilot", "github.copilot-chat", "wayou.vscode-todo-highlight",
    "oderwat.indent-rainbow", "wix.vscode-import-cost", "ms-vscode-remote.remote-ssh",
    "ms-vscode-remote.remote-containers", "ms-vscode-remote.remote-wsl",
    "ms-vsliveshare.vsliveshare", "gruntfuggly.todo-tree", "mhutchie.git-graph",
    "donjayamanne.githistory", "vscodevim.vim", "ms-azuretools.vscode-docker",
    "sonarsource.sonarlint-vscode", "github.vscode-pull-request-github",
    "github.vscode-github-actions", "humao.rest-client", "rangav.vscode-thunder-client",
    "alefragnani.bookmarks", "alefragnani.project-manager", "mikestead.dotenv",
    "naumovs.color-highlight",
  ]);
  const pid = (e) => (e.publisherId || "").toLowerCase();
  const isProgBest = (e) => PROG_ESSENTIALS.has(e.id.toLowerCase());

  // Лучшие для Python: официальные расширения Microsoft, Jupyter и инструменты,
  // посвящённые Python (по названию/id, а не по общим тегам — Code Runner
  // и подобные мультиязычные расширения сюда не попадают)
  const PY_EXTRA_IDS = new Set(["charliermarsh.ruff", "astral-sh.ruff"]);
  const PY_WORDS = ["python", "pylance", "django", "flask", "jupyter", "pytest", "conda", "anaconda", "fastapi", "питон"];
  const isPythonBest = (e) => {
    const id = e.id.toLowerCase();
    const name = e.name.toLowerCase();
    return (
      pid(e) === "ms-python" ||
      id.startsWith("ms-toolsai.jupyter") ||
      PY_EXTRA_IDS.has(id) ||
      PY_WORDS.some((w) => name.includes(w) || id.includes(w))
    );
  };

  // Создание игр: движки Unity / Godot / Unreal, шейдеры, спрайты, C# для Unity.
  // Границы слов — чтобы «community» не считалось за «unity», а glsl/hlsl
  // проверяются только в названии (иначе форматтеры вроде Clang-Format лишние).
  const GAME_RE = /\b(unity|godot|unreal|gamedev|gdscript|shader|sprite|tilemap|tileset|monogame|shadertoy|webgl|three\.js|babylon|phaser|cocos|pixi|raylib|love2d|game|gaming|minecraft|arcade|pixel)\b|игр|гейм/i;
  const SHADER_NAME_RE = /\bglsl\b|\bhlsl\b/i;
  const isGameDev = (e) => {
    const id = e.id.toLowerCase();
    if (
      pid(e) === "visualstudiotoolsforunity" ||
      id.startsWith("geequlim.godot-tools") ||
      id === "ms-dotnettools.csharp" ||
      id === "ms-dotnettools.csdevkit"
    ) {
      return true;
    }
    const hay = `${e.name} ${e.short} ${e.tags.join(" ")} ${e.categories.join(" ")} ${e.id}`;
    return GAME_RE.test(hay) || SHADER_NAME_RE.test(e.name);
  };

  const COLLECTIONS = [
    { id: "all", icon: "🏆", label: { ru: "Все расширения", en: "All extensions" } },
    { id: "python", icon: "🐍", label: { ru: "Лучшие для Python", en: "Best for Python" }, match: isPythonBest },
    { id: "prog", icon: "🧑💻", label: { ru: "Для программистов", en: "For programmers" }, match: isProgBest },
    { id: "games", icon: "🎮", label: { ru: "Создание игр", en: "Game development" }, match: isGameDev },
    { id: "ai", icon: "🤖", label: { ru: "ИИ и нейросети", en: "AI & neural nets" }, match: kw("ai", "artificial intelligence", "machine learning", "copilot", "gpt", "llm", "chatgpt", "openai", "gemini", "claude", "deepseek", "нейросет", "искусственн") },
    { id: "web", icon: "🌐", label: { ru: "Веб-разработка", en: "Web development" }, match: kw("web", "html", "css", "react", "vue", "angular", "svelte", "tailwind", "next.js", "node", "javascript", "typescript", "веб") },
    { id: "data", icon: "📊", label: { ru: "Данные и базы", en: "Data & databases" }, match: kw("sql", "database", "postgres", "mysql", "mongodb", "redis", "data", "pandas", "csv", "json", "graphql", "данн", "баз") },
    { id: "devops", icon: "☁️", label: { ru: "DevOps и контейнеры", en: "DevOps & containers" }, match: kw("docker", "kubernetes", "devops", "aws", "azure", "terraform", "ansible", "remote", "ssh", "wsl", "container") },
    { id: "themes", icon: "🎨", label: { ru: "Темы и оформление", en: "Themes & styling" }, match: kw("theme", "icon", "color", "font", "material", "тема", "темн") },
    { id: "docs", icon: "📝", label: { ru: "Markdown и документация", en: "Markdown & docs" }, match: kw("markdown", "mermaid", "docs", "diagram", "latex", "pdf", "drawio") },
    { id: "testing", icon: "🧪", label: { ru: "Тестирование и отладка", en: "Testing & debugging" }, match: kw("test", "jest", "mocha", "cypress", "playwright", "selenium", "coverage", "debug", "линтер", "linter") },
    { id: "format", icon: "🧹", label: { ru: "Форматирование и линтеры", en: "Formatting & linters" }, match: kw("prettier", "eslint", "formatter", "beautify", "lint", "format", "stylelint", "black", "ruff") },
    { id: "autocomplete", icon: "✨", label: { ru: "Автодополнение и подсказки", en: "Autocomplete & hints" }, match: kw("intellisense", "autocomplete", "autocompletion", "snippet", "tabnine", "codeium", "автодополн", "подсказк") },
    { id: "langs", icon: "🧩", label: { ru: "Другие языки", en: "Other languages" }, match: kw("java", "c++", "c#", "golang", "rust", "php", "ruby", "kotlin", "swift", "dart", "lua", "scala", "elixir") },
    { id: "git", icon: "🔧", label: { ru: "Git и качество кода", en: "Git & code quality" }, match: kw("git", "github", "gitlab", "prettier", "eslint", "format", "lint") },
    { id: "sponsors", icon: "❤️", label: { ru: "Спонсоры", en: "Sponsors" }, match: (e) => !!e.sponsor },
    { id: "ru", icon: "🇷🇺", label: { ru: "Русификация", en: "Russian UI" }, match: kw("russian", "русск", "ru-ru") },
  ];

  // ---------- DOM ----------
  const $ = (sel, root = document) => root.querySelector(sel);
  const grid = $("#grid");
  const cardTpl = $("#cardTpl");
  const searchInput = $("#searchInput");
  const categorySelect = $("#categorySelect");
  const sortSelect = $("#sortSelect");
  const resultCount = $("#resultCount");
  const lastUpdated = $("#lastUpdated");
  const updateStatus = $("#updateStatus");
  const pulseDot = $(".pulse-dot");
  const errorBox = $("#errorBox");
  const errorText = $("#errorText");
  const emptyBox = $("#emptyBox");
  const modal = $("#modal");
  const modalContent = $("#modalContent");
  const refreshBtn = $("#refreshBtn");
  const collectionsEl = $("#collections");
  const translateStatus = $("#translateStatus");
  const favBtn = $("#favBtn");
  const trendingGrid = $("#trendingGrid");
  const weeklyCard = $("#weeklyCard");

  // ---------- State ----------
  let extensions = [];
  let prevRanks = new Map();
  let view = "grid";
  let activeModalId = null;
  let activeCollection = "all";
  let lastFetchedAt = null;
  let lastFromCache = false;
  let statusState = { kind: "loading", key: "status.loading", vars: {} };
  const descNodes = new Map(); // short (EN) → Set<карточек> — для обновления по мере перевода

  // ---------- Перевод описаний ----------
  const TR = window.VSXTranslate || {
    get: () => null,
    needTranslate: () => false,
    autoTranslate: () => {},
    stats: () => ({ done: 0, total: 0, active: false }),
    onProgress: () => {},
  };

  const descText = (e) => (lang() === "ru" ? TR.get(e.short) || e.short : e.short);

  function applyTranslation(text) {
    const tr = TR.get(text);
    if (!tr) return;
    const set = descNodes.get(text);
    if (set) {
      set.forEach((node) => {
        const d = $(".card-desc", node);
        if (d) d.textContent = tr;
      });
    }
    if (activeModalId) {
      const e = extensions.find((x) => x.id === activeModalId);
      if (e && e.short === text) {
        const mShort = modalContent.querySelector(".m-short");
        if (mShort) mShort.textContent = tr;
      }
    }
  }

  function updateTranslateStatus(st) {
    const s = st || TR.stats();
    if (lang() !== "ru" || !s.active || !s.total) {
      translateStatus.hidden = true;
      return;
    }
    translateStatus.hidden = false;
    translateStatus.textContent = t("translate.progress", { done: Math.min(s.done, s.total), total: s.total });
  }

  function startTranslation() {
    if (lang() !== "ru") {
      updateTranslateStatus();
      return;
    }
    const texts = [...new Set(extensions.map((e) => e.short).filter(Boolean))];
    TR.onProgress(updateTranslateStatus);
    TR.autoTranslate(texts, applyTranslation);
    updateTranslateStatus();
  }

  // ---------- Helpers ----------
  const fmtNum = (n) => {
    if (n == null || isNaN(n)) return "—";
    const ru = lang() === "ru";
    if (n >= 1e9) return (n / 1e9).toFixed(2).replace(/\.?0+$/, "") + (ru ? " млрд" : "B");
    if (n >= 1e6) return (n / 1e6).toFixed(1).replace(/\.?0+$/, "") + (ru ? " млн" : "M");
    if (n >= 1e3) return (n / 1e3).toFixed(1).replace(/\.?0+$/, "") + (ru ? " тыс." : "K");
    return String(Math.round(n));
  };
  const fmtFull = (n) => (n == null ? "—" : Math.round(n).toLocaleString(loc()));
  // Длинные номера версий (v2026.11.202615014) сокращаем до читаемого вида.
  const shortVer = (v) => {
    if (!v) return "—";
    return v.length > 12 ? v.slice(0, 10) + "…" : v;
  };
  const fmtDate = (iso) =>
    iso ? new Date(iso).toLocaleDateString(loc(), { day: "numeric", month: "long", year: "numeric" }) : "—";
  const fmtDateTime = (iso) =>
    iso ? new Date(iso).toLocaleString(loc(), { day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" }) : "—";
  const relTime = (iso) => {
    if (!iso) return "—";
    const diff = Date.now() - new Date(iso).getTime();
    const d = Math.floor(diff / 86400000);
    if (d === 0) return t("time.today");
    if (d === 1) return t("time.yesterday");
    if (d < 30) return t("time.daysAgo", { n: d });
    if (d < 365) return t("time.monthsAgo", { n: Math.floor(d / 30) });
    return t("time.yearsAgo", { n: Math.floor(d / 365) });
  };
  const todayKey = () => {
    const d = new Date(); // local date — must match the local-midnight scheduler
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  };
  const stars = (r) => {
    const full = Math.round(r || 0);
    return "★".repeat(full) + "☆".repeat(5 - full);
  };

  // ---------- Fetching ----------
  async function fetchTop() {
    const body = {
      filters: [
        {
          criteria: [
            { filterType: 8, value: "Microsoft.VisualStudio.Code" }, // target
            { filterType: 12, value: "4096" }, // exclude unpublished / flags
          ],
          pageNumber: 1,
          pageSize: TOP_N,
          sortBy: 4, // InstallCount
          sortOrder: 2, // Descending
        },
      ],
      assetTypes: [],
      flags: FLAGS,
    };

    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: `application/json;api-version=${API_VERSION}`,
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    const list = json.results?.[0]?.extensions || [];
    if (!list.length) throw new Error("Empty response from Marketplace");
    return list.map(normalize);
  }

  // ---------- Offline copy (top500.json in the site folder) ----------
  const OFFLINE_FILE = "top500.json";

  async function fetchOfflineCopy() {
    const res = await fetch(OFFLINE_FILE + "?t=" + Date.now(), { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    // The file may hold either the raw normalized array or the cache payload { day, fetchedAt, data }
    if (Array.isArray(json)) return { data: json, fetchedAt: null };
    if (Array.isArray(json.data)) return { data: json.data, fetchedAt: json.fetchedAt || null };
    throw new Error("Bad top500.json format");
  }

  // Save the current dataset as a downloadable top500.json — put it next to index.html for offline use.
  function downloadOfflineSnapshot() {
    if (!extensions.length) {
      toast(t("offline.noData"));
      return;
    }
    const payload = { day: todayKey(), fetchedAt: new Date().toISOString(), count: extensions.length, data: extensions };
    const blob = new Blob([JSON.stringify(payload)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = OFFLINE_FILE;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
    toast(t("offline.saved"));
  }

  function readCache() {
    try {
      const c = JSON.parse(localStorage.getItem(CACHE_KEY) || "null");
      return c && Array.isArray(c.data) ? c : null;
    } catch {
      return null;
    }
  }
  function writeCache(data) {
    const payload = { day: todayKey(), fetchedAt: new Date().toISOString(), data };
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(payload));
    } catch {
      /* quota — ignore */
    }
    return payload;
  }
  function loadPrevRanks() {
    try {
      const p = JSON.parse(localStorage.getItem(PREV_KEY) || "null");
      prevRanks = new Map(p?.ranks || []);
    } catch {
      prevRanks = new Map();
    }
  }

  async function loadData({ force = false } = {}) {
    setStatus("loading", "status.loading");
    errorBox.hidden = true;
    renderSkeleton();

    const cache = readCache();
    const fresh = cache && cache.day === todayKey();

    if (fresh && !force) {
      applyData(cache.data, cache.fetchedAt, true);
      return;
    }

    try {
      const data = await fetchTop();
      // Remember previous day's ranks for delta badges (only if the cache is from another day)
      if (cache?.data?.length && cache.day !== todayKey()) {
        localStorage.setItem(
          PREV_KEY,
          JSON.stringify({ day: cache.day, ranks: cache.data.map((e) => [e.id, e.rank]) })
        );
      }
      const payload = writeCache(data);
      loadPrevRanks();
      applyData(data, payload.fetchedAt, false);
    } catch (err) {
      console.error(err);
      if (cache?.data?.length) {
        applyData(cache.data, cache.fetchedAt, true);
        setStatus("error", "status.updateFail", { msg: err.message, date: fmtDateTime(cache.fetchedAt) });
      } else {
        // No cache — try the local offline copy next to index.html
        try {
          const off = await fetchOfflineCopy();
          if (off.data.length) {
            writeCache(off.data);
            loadPrevRanks();
            applyData(off.data, off.fetchedAt || new Date().toISOString(), true);
            setStatus("offline", "status.offline");
            return;
          }
        } catch (offErr) {
          console.warn("No offline copy:", offErr.message);
        }
        grid.innerHTML = "";
        errorText.textContent = " " + t("error.offline", { msg: err.message });
        errorBox.hidden = false;
        setStatus("error", "status.error");
      }
      setTimeout(() => loadData(), RETRY_ON_ERROR_MS);
    }
  }

  function applyData(data, fetchedAt, fromCache) {
    extensions = data;
    lastFetchedAt = fetchedAt;
    lastFromCache = fromCache;
    loadPrevRanks();
    buildCategoryOptions();
    renderCollections();
    animateStats();
    render();
    renderTrending();
    renderWeekly();
    startTranslation();
    lastUpdated.textContent = t("meta.dataFrom", { date: fmtDateTime(fetchedAt) }) + (fromCache ? t("meta.cache") : "");
    setStatus("ok", "status.ok", { date: fmtDateTime(fetchedAt) });
    handleHash();

    // Экспорт для ассистента (живой рейтинг, liveAnswer).
    window.__VSX_TOP = () => extensions;
  }

  function setStatus(kind, key, vars = {}) {
    statusState = { kind, key, vars };
    updateStatus.textContent = t(key, vars);
    pulseDot.className = "pulse-dot" + (kind === "loading" ? " loading" : kind === "error" ? " error" : "");
    refreshBtn.classList.toggle("spinning", kind === "loading");
  }

  // ---------- Daily scheduler ----------
  function msUntilMidnight() {
    const now = new Date();
    const next = new Date(now);
    next.setHours(24, 0, 0, 0);
    return next - now;
  }
  function scheduleMidnightRefresh() {
    setTimeout(() => {
      loadData({ force: true });
      scheduleMidnightRefresh();
    }, msUntilMidnight() + 1000);
  }
  function tickCountdown() {
    const el = $("#statNext");
    if (!el) return;
    const ms = msUntilMidnight();
    const h = Math.floor(ms / 3600000);
    const m = Math.floor((ms % 3600000) / 60000);
    const s = Math.floor((ms % 60000) / 1000);
    el.textContent = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }
  // Also re-check when the tab becomes visible again (e.g. laptop woke up after midnight)
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      const c = readCache();
      if (!c || c.day !== todayKey()) loadData({ force: true });
    }
  });

  // ---------- Stats ----------
  function animateCount(el, to, { decimals = 0, suffix = "" } = {}) {
    if (!el) return; // element missing in HTML — skip the animation instead of breaking render()
    const from = parseFloat(el.dataset.count || "0") || 0;
    const start = performance.now();
    const dur = 1400;
    const ease = (t) => 1 - Math.pow(1 - t, 4);
    const step = (now) => {
      const t = Math.min(1, (now - start) / dur);
      const val = from + (to - from) * ease(t);
      el.textContent = (decimals ? val.toFixed(decimals) : fmtNum(val)) + suffix;
      if (t < 1) requestAnimationFrame(step);
      else el.dataset.count = String(to);
    };
    requestAnimationFrame(step);
  }
  function animateStats() {
    const installs = extensions.reduce((s, e) => s + (e.installs || 0), 0);
    const rated = extensions.filter((e) => e.rating);
    const avg = rated.reduce((s, e) => s + e.rating, 0) / (rated.length || 1);
    const pubs = new Set(extensions.map((e) => e.publisherId)).size;
    animateCount($("#statInstalls"), installs);
    animateCount($("#statRating"), avg, { decimals: 2, suffix: " ★" });
    animateCount($("#statPublishers"), pubs);
  }

  // ---------- Filtering / sorting ----------
  function collectionById(id) {
    return COLLECTIONS.find((c) => c.id === id) || COLLECTIONS[0];
  }

  function collectionCount(col) {
    if (!col.match) return extensions.length;
    return extensions.filter(col.match).length;
  }

  function renderCollections() {
    collectionsEl.innerHTML = "";
    COLLECTIONS.forEach((col) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "collection-chip" + (col.id === activeCollection ? " active" : "");
      btn.setAttribute("role", "tab");
      btn.setAttribute("aria-selected", col.id === activeCollection ? "true" : "false");
      btn.dataset.collection = col.id;
      btn.innerHTML = `<span class="collection-icon">${col.icon}</span> ${esc(col.label[lang()] || col.label.ru)} <span class="collection-count">${collectionCount(col)}</span>`;
      collectionsEl.appendChild(btn);
    });
  }

  function buildCategoryOptions() {
    const counts = new Map();
    extensions.forEach((e) => e.categories.forEach((c) => counts.set(c, (counts.get(c) || 0) + 1)));
    const current = categorySelect.value;
    categorySelect.innerHTML = `<option value="">${esc(t("toolbar.allCats"))}</option>`;
    [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .forEach(([c, n]) => {
        const o = document.createElement("option");
        o.value = c;
        o.textContent = `${catName(c)} (${n})`;
        categorySelect.appendChild(o);
      });
    categorySelect.value = current;
  }

  function getVisible() {
    // Поиск: каждое слово запроса должно найтись в «стоге» (AND),
    // при этом учитываются переведённые описания и названия категорий.
    const qWords = searchInput.value.trim().toLowerCase().split(/\s+/).filter(Boolean);
    const cat = categorySelect.value;
    const col = collectionById(activeCollection);
    const pub = (typeof location !== "undefined") ? parseHashParam(location.hash, "publisher") : null;
    let list = extensions.filter((e) => {
      if (col.match && !col.match(e)) return false;
      if (pub && e.publisherId !== pub && e.publisher !== pub) return false;
      if (cat && !e.categories.includes(cat)) return false;
      if (!qWords.length) return true;
      const hay = `${e.name} ${e.publisher} ${e.id} ${e.short} ${descText(e)} ${e.tags.join(" ")} ${e.categories
        .map(catName)
        .join(" ")}`.toLowerCase();
      return qWords.every((w) => hay.includes(w));
    });
    const sorters = {
      installs: (a, b) => (b.installs || 0) - (a.installs || 0),
      rating: (a, b) => (b.weightedRating || 0) - (a.weightedRating || 0),
      ratings: (a, b) => (b.ratingCount || 0) - (a.ratingCount || 0),
      trending: (a, b) => (b.trendingWeekly || 0) - (a.trendingWeekly || 0),
      trendingMonth: (a, b) => (b.trendingMonthly || 0) - (a.trendingMonthly || 0),
      updated: (a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated),
      published: (a, b) => new Date(b.published) - new Date(a.published),
      name: (a, b) => a.name.localeCompare(b.name, lang()),
    };
    return list.sort(sorters[sortSelect.value] || sorters.installs);
  }

  // ---------- Rendering ----------
  function renderSkeleton() {
    grid.innerHTML = "";
    for (let i = 0; i < 12; i++) {
      const el = document.createElement("article");
      el.className = "card skeleton";
      el.style.setProperty("--i", i);
      el.innerHTML = `
        <div class="card-head">
          <div class="card-icon sk"></div>
          <div class="card-titles" style="flex:1">
            <div class="sk" style="height:16px;width:60%;margin-bottom:8px"></div>
            <div class="sk" style="height:12px;width:40%"></div>
          </div>
        </div>
        <div class="sk" style="height:12px;width:100%"></div>
        <div class="sk" style="height:12px;width:80%"></div>
        <div class="card-foot"><span class="sk" style="height:26px;width:90px"></span><span class="sk" style="height:26px;width:70px"></span></div>`;
      grid.appendChild(el);
    }
  }

  function deltaBadge(e) {
    if (!prevRanks.size) return null;
    const prev = prevRanks.get(e.id);
    if (prev == null) return { cls: "new", text: t("delta.new") };
    const d = prev - e.rank;
    if (d > 0) return { cls: "up", text: `▲ ${d}` };
    if (d < 0) return { cls: "down", text: `▼ ${-d}` };
    return { cls: "", text: "" };
  }

  // ---------- Плюсы и минусы (автосводка по данным Marketplace) ----------
  const isFresh = (iso, days) => !!iso && Date.now() - new Date(iso).getTime() < days * 86400000;

  function prosCons(e) {
    const pros = [];
    const cons = [];
    if (e.installs >= 100000) pros.push(t("pro.installs", { n: fmtNum(e.installs) }));
    if (e.rating >= 4.5 && e.ratingCount >= 100)
      pros.push(t("pro.rating", { r: e.rating.toFixed(1), c: fmtNum(e.ratingCount) }));
    if (e.verified) pros.push(t("pro.verified"));
    if (isFresh(e.lastUpdated, 120)) pros.push(t("pro.fresh"));
    if ((e.trendingWeekly || 0) > 0.5) pros.push(t("pro.trend"));
    if (e.repo) pros.push(t("pro.repo"));
    if (e.languages.length) pros.push(t("pro.langs", { list: e.languages.join(", ") }));

    if (!e.ratingCount || e.ratingCount < 50) cons.push(t("con.fewRatings", { c: fmtNum(e.ratingCount || 0) }));
    if (e.rating && e.rating < 4) cons.push(t("con.lowRating", { r: e.rating.toFixed(1) }));
    if (e.lastUpdated && !isFresh(e.lastUpdated, 400)) cons.push(t("con.stale", { date: fmtDate(e.lastUpdated) }));
    if (!e.repo) cons.push(t("con.noRepo"));
    if (e.installs != null && e.installs < 100000) cons.push(t("con.niche"));
    if (e.preRelease) cons.push(t("con.pre"));

    return { pros: pros.slice(0, 5), cons: cons.slice(0, 5) };
  }

  function render() {
    const list = getVisible();
    grid.innerHTML = "";
    descNodes.clear();
    grid.classList.toggle("list", view === "list");
    emptyBox.hidden = list.length > 0;
    resultCount.textContent = t("meta.shown", { a: list.length, b: extensions.length });

    const frag = document.createDocumentFragment();
    const showCount = Math.min(visibleCount, list.length);
    list.forEach((e, i) => {
      if (i >= visibleCount) return;
      const node = cardTpl.content.firstElementChild.cloneNode(true);
      node.style.setProperty("--i", Math.min(i, 30));
      node.dataset.id = e.id;
      if (e.brandColor) node.style.setProperty("--brand", e.brandColor);

      const rank = $(".card-rank", node);
      rank.textContent = `#${e.rank}`;
      if (e.rank <= 3) rank.classList.add(`r${e.rank}`);

      const img = $(".card-icon img", node);
      img.src = e.icon;
      img.alt = e.name;
      img.onerror = () => { img.remove(); };

      $(".card-title", node).textContent = e.name;
      $(".card-publisher", node).innerHTML =
        esc(e.publisher) + (e.verified ? ` <span class="verified" title="${esc(t("card.verified"))}">✓</span>` : "");
      $(".card-desc", node).textContent = descText(e);
      if (e.short) {
        let set = descNodes.get(e.short);
        if (!set) {
          set = new Set();
          descNodes.set(e.short, set);
        }
        set.add(node);
      }
      $(".chip-installs", node).innerHTML = `⬇ ${fmtNum(e.installs)}`;
      $(".chip-rating", node).innerHTML = e.rating
        ? `★ ${e.rating.toFixed(1)} <span class="muted">(${fmtNum(e.ratingCount)})</span>`
        : "★ —";
      $(".chip-cat", node).textContent = catName(e.categories[0]);

      const sponsorChip = $(".chip-sponsor", node);
      if (e.sponsor) {
        sponsorChip.hidden = false;
        sponsorChip.textContent = `❤ ${t("card.sponsor")}`;
        sponsorChip.title = t("card.sponsorTitle");
      } else {
        sponsorChip.remove();
      }

      const delta = deltaBadge(e);
      const dEl = $(".card-delta", node);
      if (delta && delta.text) {
        dEl.textContent = delta.text;
        dEl.classList.add(delta.cls);
      } else dEl.remove();

      // Кнопка «скопировать команду установки» — не открывает карточку
      const copyBtn = $(".card-copy", node);
      if (copyBtn) {
        copyBtn.title = t("card.copyCmd");
        copyBtn.setAttribute("aria-label", t("card.copyCmd"));
        copyBtn.addEventListener("click", (ev) => {
          ev.stopPropagation();
          copyText(`code --install-extension ${e.id}`).then(() => toast(t("toast.copied")));
        });
        copyBtn.addEventListener("keydown", (ev) => ev.stopPropagation());
      }

      // Звёздочка избранного
      const favBtn = document.createElement("button");
      favBtn.className = "card-fav" + (isFav(e.id) ? " fav-active" : "");
      favBtn.type = "button";
      favBtn.dataset.favId = e.id;
      favBtn.title = t("fav.toggle");
      favBtn.setAttribute("aria-label", t("fav.toggle"));
      favBtn.innerHTML = isFav(e.id) ? "★" : "☆";
      favBtn.addEventListener("click", (ev) => {
        ev.stopPropagation();
        toggleFav(e.id);
        favBtn.classList.toggle("fav-active", isFav(e.id));
        favBtn.textContent = isFav(e.id) ? "★" : "☆";
      });
      favBtn.addEventListener("keydown", (ev) => ev.stopPropagation());
      node.appendChild(favBtn);

      // Кнопка «Сравнить» — выбираем два расширения, открывается таблица
      const cmpBtn = document.createElement("button");
      cmpBtn.className = "card-compare" + (compareList.includes(e.id) ? " compare-active" : "");
      cmpBtn.type = "button";
      cmpBtn.dataset.compare = e.id;
      cmpBtn.title = t("modal.compare");
      cmpBtn.setAttribute("aria-label", t("modal.compare"));
      cmpBtn.setAttribute("aria-pressed", String(compareList.includes(e.id)));
      cmpBtn.innerHTML = "⇄";
      cmpBtn.addEventListener("click", (ev) => {
        ev.stopPropagation();
        toggleCompare(e.id);
        cmpBtn.classList.toggle("compare-active", compareList.includes(e.id));
      });
      cmpBtn.addEventListener("keydown", (ev) => ev.stopPropagation());
      node.appendChild(cmpBtn);

      // Кнопка «Скачать скриншот»
      const ssBtn = document.createElement("button");
      ssBtn.className = "card-screenshot-btn";
      ssBtn.type = "button";
      ssBtn.title = t("card.screenshot");
      ssBtn.setAttribute("aria-label", t("card.screenshot"));
      ssBtn.textContent = "📷";
      ssBtn.addEventListener("click", (ev) => {
        ev.stopPropagation();
        if (window.VSXShot) window.VSXShot.download(e);
        else toast(t("toast.screenshotFailed"));
      });
      ssBtn.addEventListener("keydown", (ev) => ev.stopPropagation());
      node.appendChild(ssBtn);

      node.addEventListener("click", () => openModal(e.id));
      node.addEventListener("keydown", (ev) => {
        if (ev.key === "Enter" || ev.key === " ") {
          ev.preventDefault();
          openModal(e.id);
        }
      });
      node.addEventListener("pointermove", (ev) => {
        const r = node.getBoundingClientRect();
        node.style.setProperty("--mx", `${ev.clientX - r.left}px`);
        node.style.setProperty("--my", `${ev.clientY - r.top}px`);
      });
      frag.appendChild(node);
    });
    grid.appendChild(frag);

    // Кнопка "Показать ещё"
    let showMore = document.getElementById("showMoreBtn");
    if (showCount < list.length) {
      if (!showMore) {
        showMore = document.createElement("button");
        showMore.id = "showMoreBtn";
        showMore.className = "btn btn-primary";
        showMore.type = "button";
        showMore.textContent = t("showMore");
        showMore.addEventListener("click", () => {
          visibleCount += PAGE_SIZE;
          render();
        });
        grid.parentNode.insertBefore(showMore, grid.nextSibling);
      }
    } else if (showMore) {
      showMore.remove();
    }
  }

  // ---------- «Растут быстрее всех» + «Расширение недели» ----------
  // Недельный тренд Marketplace (trendingweekly) — это уже готовый сигнал
  // «кого ставят активнее всего прямо сейчас».
  function trendingList(n = 10) {
    return [...extensions]
      .filter((e) => (e.trendingWeekly || 0) > 0)
      .sort((a, b) => (b.trendingWeekly || 0) - (a.trendingWeekly || 0))
      .slice(0, n);
  }

  function renderTrending() {
    if (!trendingGrid) return;
    const list = trendingList(10);
    trendingGrid.innerHTML = "";
    if (!list.length) {
      trendingGrid.innerHTML = `<p class="muted">${esc(t("trending.empty"))}</p>`;
      return;
    }
    const frag = document.createDocumentFragment();
    list.forEach((e, i) => {
      const card = document.createElement("button");
      card.type = "button";
      card.className = "trend-card";
      card.dataset.id = e.id;
      card.style.setProperty("--i", i);
      if (e.brandColor) card.style.setProperty("--brand", e.brandColor);
      card.innerHTML = `
        <span class="trend-pos">${i + 1}</span>
        <span class="trend-icon">${e.icon ? `<img src="${esc(e.icon)}" alt="" loading="lazy" />` : ""}</span>
        <span class="trend-text">
          <b>${esc(e.name)}</b>
          <span class="muted">${esc(e.publisher)} · ${esc(t("trending.installs", { n: fmtNum(e.installs) }))}</span>
        </span>
        <span class="trend-value">+${(e.trendingWeekly || 0).toFixed(2)}</span>`;
      card.addEventListener("click", () => openModal(e.id));
      frag.appendChild(card);
    });
    trendingGrid.appendChild(frag);
  }

  // Номер недели по ISO — детерминированный выбор «расширения недели»:
  // весь мир в одну неделю видит один и тот же выпуск.
  function weekNumber(d = new Date()) {
    const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    const day = date.getUTCDay() || 7;
    date.setUTCDate(date.getUTCDate() + 4 - day);
    const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
    return Math.ceil(((date - yearStart) / 86400000 + 1) / 7);
  }

  function weeklyPick() {
    const pool = trendingList(30);
    if (!pool.length) return null;
    return pool[weekNumber() % pool.length];
  }

  function renderWeekly() {
    if (!weeklyCard) return;
    const e = weeklyPick();
    if (!e) {
      weeklyCard.hidden = true;
      return;
    }
    const pc = prosCons(e);
    const week = weekNumber();
    weeklyCard.hidden = false;
    weeklyCard.innerHTML = `
      <div class="weekly-head">
        <span class="weekly-badge">⭐ ${esc(t("weekly.badge"))} · ${esc(t("weekly.issue", { n: week }))}</span>
      </div>
      <div class="weekly-main">
        <span class="weekly-icon">${e.icon ? `<img src="${esc(e.icon)}" alt="" loading="lazy" />` : ""}</span>
        <div class="weekly-titles">
          <h3>${esc(e.name)}</h3>
          <div class="muted">${esc(e.publisher)} · ${esc(t("weekly.rank", { n: e.rank }))}</div>
          <p>${esc(descText(e))}</p>
          <ul class="weekly-pros">${pc.pros.slice(0, 3).map((p) => `<li>${esc(p)}</li>`).join("")}</ul>
          <div class="weekly-actions">
            <button class="btn btn-primary" type="button" data-copy="code --install-extension ${esc(e.id)}">${esc(t("weekly.copyCmd"))}</button>
            <button class="btn btn-ghost" type="button" data-open-ext="${esc(e.id)}">${esc(t("weekly.openCard"))}</button>
            <a class="btn btn-ghost" href="${esc(e.marketplaceUrl)}" target="_blank" rel="noopener">${esc(t("modal.marketplace"))}</a>
          </div>
        </div>
      </div>`;
  }

  // ---------- Modal ----------
  function openModal(id) {
    const e = extensions.find((x) => x.id === id);
    if (!e) return;
    activeModalId = id;
    const delta = deltaBadge(e);

    const link = (url, label) =>
      url ? `<a href="${esc(url)}" target="_blank" rel="noopener">${esc(label || url)}</a>` : "—";

    modalContent.innerHTML = `
      <div class="m-head">
        <div class="m-icon">${e.icon ? `<img src="${esc(e.icon)}" alt="">` : ""}</div>
        <div class="m-titles">
          <div class="m-rank">${t("modal.rank", { n: e.rank })} ${delta?.text ? `· <span class="card-delta ${delta.cls}" style="position:static">${delta.text}</span> ${t("modal.deltaDay")}` : ""}</div>
          <h2 class="m-title" id="modalTitle">${esc(e.name)}</h2>
          <div class="m-publisher">${esc(e.publisher)} ${e.verified ? `<span class="verified" title="${esc(t("card.verified"))}">✓</span>` : ""} <span class="muted">· ${esc(e.id)}</span>
            ${e.sponsor ? `<span class="chip chip-sponsor" title="${esc(t("card.sponsorTitle"))}">❤ ${esc(t("card.sponsor"))}</span>` : ""}
          </div>
          <p class="m-short">${esc(descText(e))}</p>
          <p class="m-shots" hidden></p>
          <div class="m-actions">
            <a class="btn btn-primary" href="${esc(e.marketplaceUrl)}" target="_blank" rel="noopener">${esc(t("modal.marketplace"))}</a>
            <a class="btn install-desktop-only" href="vscode:extension/${esc(e.id)}">${esc(t("modal.install"))}</a>
            ${e.sponsor ? `<a class="btn btn-sponsor" href="${esc(e.sponsor)}" target="_blank" rel="noopener">${esc(t("modal.sponsorBtn"))}</a>` : ""}
            ${e.repo ? `<a class="btn btn-ghost" href="${esc(e.repo)}" target="_blank" rel="noopener">${esc(t("modal.repo"))}</a>` : ""}
            <button class="btn btn-ghost m-compare-btn" type="button" data-compare="${esc(e.id)}">${esc(t("modal.compare"))}</button>
            <button class="btn btn-ghost m-screenshot-btn" type="button" data-screenshot="${esc(e.id)}">📷 ${esc(t("modal.screenshot"))}</button>
          </div>
        </div>
      </div>

      <div class="install-cmd">
        <code>code --install-extension ${esc(e.id)}</code>
        <button type="button" data-copy="code --install-extension ${esc(e.id)}">${esc(t("modal.copy"))}</button>
      </div>

      <div class="m-stats">
        <div class="m-stat"><b>${fmtNum(e.installs)}</b><span>${esc(t("modal.stat.installs"))}</span></div>
        <div class="m-stat"><b>${fmtNum(e.downloads)}</b><span>${esc(t("modal.stat.downloads"))}</span></div>
        <div class="m-stat"><b class="stars" title="${e.rating ? e.rating.toFixed(2) : "—"}">${stars(e.rating)}</b><span>${e.rating ? e.rating.toFixed(2) : "—"} · ${fmtNum(e.ratingCount)} ${esc(t("modal.stat.ratings"))}</span></div>
        <div class="m-stat"><b>${e.trendingWeekly != null ? e.trendingWeekly.toFixed(2) : "—"}</b><span>${esc(t("modal.stat.trend"))}</span></div>
        <div class="m-stat"><b title="${esc(e.version)}">v${esc(shortVer(e.version))}</b><span>${e.preRelease ? esc(t("modal.stat.prerelease")) : esc(t("modal.stat.version"))}</span></div>
        <div class="m-stat"><b>${relTime(e.lastUpdated)}</b><span>${esc(t("modal.stat.updated"))}</span></div>
      </div>

      ${(() => {
        const pc = prosCons(e);
        const prosHtml = pc.pros.length ? pc.pros.map((p) => `<li>${esc(p)}</li>`).join("") : `<li class="muted">—</li>`;
        const consHtml = pc.cons.length ? pc.cons.map((c) => `<li>${esc(c)}</li>`).join("") : `<li class="muted">${esc(t("pc.noCons"))}</li>`;
        return `
        <div class="m-proscons">
          <div class="pc-card pros">
            <h4>✅ ${esc(t("pc.pros"))}</h4>
            <ul>${prosHtml}</ul>
          </div>
          <div class="pc-card cons">
            <h4>⚠️ ${esc(t("pc.cons"))}</h4>
            <ul>${consHtml}</ul>
          </div>
        </div>`;
      })()}

      <div class="m-tabs" role="tablist">
        <button class="m-tab active" data-tab="readme" type="button">${esc(t("modal.tab.readme"))}</button>
        <button class="m-tab" data-tab="info" type="button">${esc(t("modal.tab.info"))}</button>
        <button class="m-tab" data-tab="tags" type="button">${esc(t("modal.tab.tags"))}</button>
        ${e.changelogUrl ? `<button class="m-tab" data-tab="changelog" type="button">${esc(t("modal.tab.changelog"))}</button>` : ""}
      </div>

      <div class="m-pane active" data-pane="readme"><div class="readme-loading">${esc(t("modal.loadingReadme"))}</div></div>

      <div class="m-pane" data-pane="info">
        <dl class="kv">
          <dt>${esc(t("kv.id"))}</dt><dd><code>${esc(e.id)}</code></dd>
          <dt>${esc(t("kv.publisher"))}</dt><dd>${esc(e.publisher)} ${e.domain ? `· ${link(e.domain, e.domain.replace(/^https?:\/\//, ""))}` : ""}</dd>
          <dt>${esc(t("kv.version"))}</dt><dd>v${esc(e.version)} ${e.preRelease ? "(pre-release)" : ""} · ${fmtDate(e.versionDate || e.lastUpdated)}</dd>
          <dt>${esc(t("kv.lastUpdate"))}</dt><dd>${fmtDate(e.lastUpdated)} (${relTime(e.lastUpdated)})</dd>
          <dt>${esc(t("kv.published"))}</dt><dd>${fmtDate(e.published)}</dd>
          <dt>${esc(t("kv.installs"))}</dt><dd>${fmtFull(e.installs)}</dd>
          <dt>${esc(t("kv.downloads"))}</dt><dd>${fmtFull(e.downloads)}</dd>
          <dt>${esc(t("kv.rating"))}</dt><dd>${e.rating ? esc(t("kv.ratingVal", { rating: e.rating.toFixed(2), weighted: e.weightedRating?.toFixed(2) ?? "—", count: fmtFull(e.ratingCount) })) : esc(t("kv.ratingNone"))}</dd>
          <dt>${esc(t("kv.trend"))}</dt><dd>${e.trendingWeekly?.toFixed(3) ?? "—"} / ${e.trendingMonthly?.toFixed(3) ?? "—"}</dd>
          <dt>${esc(t("kv.engine"))}</dt><dd><code>${esc(e.engine || "—")}</code></dd>
          <dt>${esc(t("kv.kind"))}</dt><dd>${esc(e.kind || "—")}</dd>
          <dt>${esc(t("kv.price"))}</dt><dd>${esc(e.pricing)}</dd>
          ${e.sponsor ? `<dt>${esc(t("kv.sponsor"))}</dt><dd>${link(e.sponsor, t("modal.sponsorBtn"))}</dd>` : ""}
          ${e.languages.length ? `<dt>${esc(t("kv.langs"))}</dt><dd>${esc(e.languages.join(", "))}</dd>` : ""}
          ${e.deps.length ? `<dt>${esc(t("kv.deps"))}</dt><dd>${e.deps.map((d) => `<code>${esc(d)}</code>`).join(" ")}</dd>` : ""}
          ${e.pack.length ? `<dt>${esc(t("kv.pack"))}</dt><dd>${e.pack.map((d) => `<code>${esc(d)}</code>`).join(" ")}</dd>` : ""}
          <dt>${esc(t("kv.repo"))}</dt><dd>${link(e.repo)}</dd>
          <dt>${esc(t("kv.support"))}</dt><dd>${link(e.support)}</dd>
          <dt>${esc(t("kv.docs"))}</dt><dd>${link(e.learn)}</dd>
          <dt>${esc(t("kv.license"))}</dt><dd>${link(e.licenseUrl, t("kv.licenseOpen"))}</dd>
          <dt>${esc(t("kv.vsix"))}</dt><dd>${link(e.vsixUrl, t("kv.vsixLink"))}</dd>
          <dt>${esc(t("kv.marketplace"))}</dt><dd>${link(e.marketplaceUrl)}</dd>
        </dl>
      </div>

      <div class="m-pane" data-pane="tags">
        <h3 style="margin-top:0">${esc(t("modal.categories"))}</h3>
        <div class="tag-list">${e.categories.map((c) => `<span class="tag">${esc(catName(c))}</span>`).join("") || "—"}</div>
        <h3>${esc(t("modal.tags"))}</h3>
        <div class="tag-list">${e.tags.map((tg) => `<span class="tag">${esc(tg)}</span>`).join("") || "—"}</div>
      </div>

      ${e.changelogUrl ? `<div class="m-pane" data-pane="changelog"><div class="readme-loading">${esc(t("modal.loadingChangelog"))}</div></div>` : ""}
    `;

    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    modal.querySelector(".modal-dialog").scrollTop = 0;

    loadMarkdown(e.readmeUrl, modalContent.querySelector('[data-pane="readme"]'), e);
    if (e.changelogUrl) {
      const pane = modalContent.querySelector('[data-pane="changelog"]');
      pane.dataset.lazyUrl = e.changelogUrl;
    }
    renderHistoryTab(e);
  }

  // ---------- История позиций (history.json) ----------
  // Файл пишет update-top500.js (или GitHub Actions) раз в сутки:
  // { days: ["2026-10-01", …], ranks: { "publisher.name": [12, 11, …] } }
  let historyPromise = null;
  function loadHistory() {
    if (!historyPromise) {
      historyPromise = fetch("history.json?t=" + Date.now(), { cache: "no-store" })
        .then((r) => (r.ok ? r.json() : null))
        .catch(() => null);
    }
    return historyPromise;
  }

  function sparkline(series, days) {
    const W = 320;
    const H = 90;
    const P = 6;
    const vals = series.map((v) => (v == null ? null : Number(v)));
    const nums = vals.filter((v) => v != null && !isNaN(v));
    if (nums.length < 2) return "";
    const min = Math.min(...nums);
    const max = Math.max(...nums);
    const span = Math.max(1, max - min);
    const x = (i) => P + (i * (W - 2 * P)) / Math.max(1, vals.length - 1);
    // Место #1 — наверху, поэтому шкала перевёрнута
    const y = (v) => P + ((v - min) / span) * (H - 2 * P);
    const pts = [];
    vals.forEach((v, i) => {
      if (v != null && !isNaN(v)) pts.push(`${x(i).toFixed(1)},${y(v).toFixed(1)}`);
    });
    const first = nums[0];
    const last = nums[nums.length - 1];
    const improved = first - last; // положительное = позиция улучшилась
    const cls = improved > 0 ? "up" : improved < 0 ? "down" : "";
    const lastX = x(vals.length - 1).toFixed(1);
    const lastY = y(last).toFixed(1);
    const from = days && days[0] ? fmtDate(days[0]) : "";
    const to = days && days.length ? fmtDate(days[days.length - 1]) : "";
    return `
      <p class="spark-summary ${cls}">
        ${esc(t("history.summary", { first, last, delta: improved === 0 ? t("history.flat") : (improved > 0 ? `▲ ${improved}` : `▼ ${-improved}`) }))}
      </p>
      <svg class="spark" viewBox="0 0 ${W} ${H}" width="100%" height="${H}" role="img" aria-label="${esc(t("history.title"))}">
        <polyline fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" points="${pts.join(" ")}" />
        <circle cx="${lastX}" cy="${lastY}" r="3.5" fill="currentColor" />
      </svg>
      <div class="spark-axis muted"><span>${esc(from)}</span><span>${esc(t("history.bestWorst", { best: min, worst: max }))}</span><span>${esc(to)}</span></div>`;
  }

  async function renderHistoryTab(e) {
    let hist = null;
    try {
      hist = await loadHistory();
    } catch {
      return;
    }
    if (!hist || activeModalId !== e.id) return;
    const series = hist.ranks && hist.ranks[e.id];
    if (!Array.isArray(series) || series.filter((v) => v != null).length < 3) return;

    const tabs = modalContent.querySelector(".m-tabs");
    const chart = sparkline(series, hist.days);
    if (!tabs || !chart) return;
    const tab = document.createElement("button");
    tab.className = "m-tab";
    tab.type = "button";
    tab.dataset.tab = "history";
    tab.textContent = t("modal.tab.history");
    tabs.appendChild(tab);
    const pane = document.createElement("div");
    pane.className = "m-pane";
    pane.dataset.pane = "history";
    pane.innerHTML = `<h3 style="margin-top:0">${esc(t("history.title"))}</h3>${chart}<p class="muted">${esc(t("history.note"))}</p>`;
    modalContent.appendChild(pane);
  }

  async function loadMarkdown(url, pane, e) {
    if (!url) {
      pane.innerHTML = `<p class="muted">${esc(t("modal.noReadme"))}</p>`;
      return;
    }
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const md = await res.text();
      if (activeModalId !== e.id) return; // modal changed meanwhile
      const base = url.substring(0, url.lastIndexOf("/") + 1);
      const html = window.marked.parse(md, { gfm: true, breaks: false });
      const clean = window.DOMPurify.sanitize(html, { ADD_ATTR: ["target"] });
      pane.innerHTML = `<div class="readme">${clean}</div>`;
      // Fix relative links/images and open links in new tab
      pane.querySelectorAll("a[href]").forEach((a) => {
        a.target = "_blank";
        a.rel = "noopener";
        const href = a.getAttribute("href");
        if (href && !/^(https?:|mailto:|#|vscode:)/.test(href) && e.repo) {
          a.href = e.repo.replace(/\.git$/, "") + "/blob/HEAD/" + href.replace(/^\.?\//, "");
        }
      });
      pane.querySelectorAll("img[src]").forEach((img) => {
        const src = img.getAttribute("src");
        if (src && !/^(https?:|data:)/.test(src)) {
          img.src = e.repo
            ? e.repo.replace(/\.git$/, "").replace("github.com", "raw.githubusercontent.com") + "/HEAD/" + src.replace(/^\.?\//, "")
            : base + src;
        }
        img.loading = "lazy";
      });
      // Бейдж «в описании есть скриншоты» (первая вкладка README)
      const shots = pane.querySelectorAll("img").length;
      if (shots > 0 && pane.dataset.pane === "readme") {
        const badge = modalContent.querySelector(".m-shots");
        if (badge) {
          badge.hidden = false;
          badge.textContent = t("modal.screens", { n: shots });
        }
      }
    } catch (err) {
      pane.innerHTML = `<p class="muted">${esc(t("modal.loadFail", { msg: err.message }))} <a href="${esc(e.marketplaceUrl)}" target="_blank" rel="noopener" style="color:var(--accent-2)">${esc(t("modal.openInMarketplace"))}</a></p>`;
    }
  }

  function closeModal() {
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    activeModalId = null;
  }

  modal.addEventListener("click", (ev) => {
    if (ev.target.closest("[data-close]")) closeModal();
    const tab = ev.target.closest(".m-tab");
    if (tab) {
      modalContent.querySelectorAll(".m-tab").forEach((t) => t.classList.toggle("active", t === tab));
      modalContent.querySelectorAll(".m-pane").forEach((p) => {
        const on = p.dataset.pane === tab.dataset.tab;
        p.classList.toggle("active", on);
        if (on && p.dataset.lazyUrl) {
          const e = extensions.find((x) => x.id === activeModalId);
          loadMarkdown(p.dataset.lazyUrl, p, e);
          delete p.dataset.lazyUrl;
        }
      });
    }
    const copy = ev.target.closest("[data-copy]");
    if (copy) copyText(copy.dataset.copy).then(() => toast(t("toast.copied")));
    const copyLink = ev.target.closest("[data-copy-link]");
    if (copyLink) copyText(copyLink.dataset.copyLink).then(() => toast(t("fav.linkCopied")));
    const importBtn = ev.target.closest("[data-import-list]");
    if (importBtn) {
      const ids = parseListHash(importBtn.dataset.importList);
      const added = importFavorites(ids);
      toast(t("fav.imported", { n: added }));
      render();
      openFavModal();
    }
    const comp = ev.target.closest(".m-compare-btn");
    if (comp) toggleCompare(comp.dataset.compare);
    const ss = ev.target.closest(".m-screenshot-btn");
    if (ss && window.VSXShot) {
      const ext = extensions.find((x) => x.id === ss.datasetScreenshot);
      if (ext) {
        window.VSXShot.download(ext).then(() => toast(t("toast.screenshotDone")));
      }
    }
  });
  document.addEventListener("keydown", (ev) => {
    if (ev.key === "Escape" && modal.classList.contains("open")) closeModal();
  });

  // ---------- Clipboard ----------
  // copyText, toast — из common.js

  // ---------- Events ----------
  let searchTimer;
  searchInput.addEventListener("input", () => {
    clearTimeout(searchTimer);
    visibleCount = PAGE_SIZE;
    searchTimer = setTimeout(render, 120);
  });
  categorySelect.addEventListener("change", () => { visibleCount = PAGE_SIZE; render(); });
  sortSelect.addEventListener("change", render);
  document.querySelectorAll(".view-btn").forEach((b) =>
    b.addEventListener("click", () => {
      view = b.dataset.view;
      document.querySelectorAll(".view-btn").forEach((x) => x.classList.toggle("active", x === b));
      render();
    })
  );
  refreshBtn.addEventListener("click", () => loadData({ force: true }));
  $("#retryBtn").addEventListener("click", () => loadData({ force: true }));
  $("#scrollTop").addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

  // Кнопки шапки
  if (favBtn) favBtn.addEventListener("click", openFavModal);
  const pickerBtn = $("#pickerBtn");
  if (pickerBtn) pickerBtn.addEventListener("click", openKitPicker);
  const offlineBtn = $("#offlineBtn");
  if (offlineBtn) offlineBtn.addEventListener("click", downloadOfflineSnapshot);

  // Навигация по подборкам
  collectionsEl.addEventListener("click", (ev) => {
    const chip = ev.target.closest(".collection-chip");
    if (!chip) return;
    activeCollection = chip.dataset.collection;
    visibleCount = PAGE_SIZE;
    renderCollections();
    render();
  });

  // ---------- Смена языка ----------
  window.addEventListener("langchange", () => {
    $("#heroNum").textContent = TOP_N;
    const aboutP1 = $("#aboutP1");
    if (aboutP1) aboutP1.innerHTML = t("about.p1", { n: TOP_N });
    updateStatus.textContent = t(statusState.key, statusState.vars);
    if (lastFetchedAt) {
      lastUpdated.textContent =
        t("meta.dataFrom", { date: fmtDateTime(lastFetchedAt) }) + (lastFromCache ? t("meta.cache") : "");
    }
    if (extensions.length) {
      buildCategoryOptions();
      renderCollections();
      render();
      renderTrending();
      renderWeekly();
      animateStats();
      startTranslation();
    }
    if (activeModalId) openModal(activeModalId);
  });

  // Reveal-on-scroll
  const io = new IntersectionObserver(
    (entries) => entries.forEach((en) => en.isIntersecting && en.target.classList.add("in")),
    { threshold: 0.15 }
  );
  document.querySelectorAll(".reveal").forEach((el) => io.observe(el));

  // ---------- Trending / weekly click handlers ----------
  if (weeklyCard) {
    weeklyCard.addEventListener("click", (ev) => {
      const copy = ev.target.closest("[data-copy]");
      if (copy) {
        copyText(copy.dataset.copy).then(() => toast(t("toast.copied")));
        return;
      }
      const ext = ev.target.closest("[data-open-ext]");
      if (ext) openModal(ext.dataset.openExt);
    });
  }

  // ---------- Burger menu ----------
  const burgerBtn = $("#burgerBtn");
  const mobileNav = $("#mobileNav");
  const mobileNavOverlay = $("#mobileNavOverlay");
  const mobileNavClose = $("#mobileNavClose");

  function toggleMobileNav(open) {
    return window.toggleMobileNav(burgerBtn, mobileNav, mobileNavOverlay, open);
  }
  if (burgerBtn) burgerBtn.addEventListener("click", () => toggleMobileNav());
  if (mobileNavClose) mobileNavClose.addEventListener("click", () => toggleMobileNav(false));
  if (mobileNavOverlay) mobileNavOverlay.addEventListener("click", () => toggleMobileNav(false));
  if (mobileNav) mobileNav.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => toggleMobileNav(false)));

  // ---------- Favorites (Мои расширения) ----------
  const FAV_KEY = "vsx_favorites";
  function readFavs() {
    try { return new Set(JSON.parse(localStorage.getItem(FAV_KEY) || "[]")); } catch { return new Set(); }
  }
  function writeFavs(s) {
    try { localStorage.setItem(FAV_KEY, JSON.stringify([...s])); } catch {}
  }
  let favorites = readFavs();
  const isFav = (id) => { const l = id.toLowerCase(); return [...favorites].some(x => x.toLowerCase() === l); };

  function toggleFav(id) {
    const lid = id.toLowerCase();
    const has = [...favorites].some(x => x.toLowerCase() === lid);
    if (has) favorites.delete([...favorites].find(x => x.toLowerCase() === lid)); else favorites.add(id);
    writeFavs(favorites);
    // Update all star buttons for this id
    document.querySelectorAll(`[data-fav-id="${CSS.escape(id)}"]`).forEach((btn) => {
      const currentHas = [...favorites].some(x => x.toLowerCase() === lid);
      btn.classList.toggle("fav-active", currentHas);
    });
  }

  function openFavModal() {
    const ids = [...favorites];
    const lg = lang();
    if (!ids.length) {
      modalContent.innerHTML = `<h2 id="modalTitle">${esc(t("fav.title"))}</h2><p class="muted">${esc(t("fav.empty"))}</p>`;
      modal.classList.add("open");
      modal.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
      return;
    }
    const items = ids.map((id) => extensions.find((x) => x.id.toLowerCase() === id)).filter(Boolean);
    const allCmd = items.map((e) => `code --install-extension ${e.id}`).join("\n");
    const rows = items.map((e) => `<li class="fav-item"><b>${esc(e.name)}</b> <code>${esc(e.id)}</code>
      <button class="fav-remove" type="button" data-fav-remove="${esc(e.id)}">✕</button></li>`).join("");
    // Ссылка для пересылки: `#list=publisher.name,publisher.name`
    const shareUrl = `${location.origin}${location.pathname}#list=${items.map((e) => e.id).join(",")}`;
    modalContent.innerHTML = `
      <h2 id="modalTitle">${esc(t("fav.title"))} (${items.length})</h2>
      <ul class="fav-list">${rows}</ul>
      <div class="install-cmd" style="margin-top:16px"><code style="white-space:pre-wrap">${esc(allCmd)}</code>
        <button type="button" data-copy="${esc(allCmd)}">${esc(t("modal.copy"))}</button></div>
      <div class="fav-share" style="margin-top:12px">
        <button class="btn btn-ghost" type="button" data-copy-link="${esc(shareUrl)}">${esc(t("fav.copyLink"))}</button>
        <button class="btn btn-ghost" type="button" data-import-list="${esc(shareUrl)}">${esc(t("fav.importList"))}</button>
      </div>`;
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    modalContent.querySelectorAll("[data-fav-remove]").forEach((btn) => {
      btn.addEventListener("click", () => { toggleFav(btn.dataset.favRemove); openFavModal(); render(); });
    });
  }

  // ---------- Пересылаемый список ----------
  // Формат ссылки: …/index.html#list=publisher.name,publisher.name
  function parseListHash(raw) {
    const s = String(raw || "");
    const i = s.indexOf("#list=");
    const frag = i >= 0 ? s.slice(i + 6) : s.replace(/^#?list=/, "");
    return [...new Set(frag.split(",").map((x) => x.trim().toLowerCase()).filter(Boolean))].slice(0, 200);
  }

  function importFavorites(ids) {
    let added = 0;
    ids.forEach((id) => {
      if (!favorites.has(id)) {
        favorites.add(id);
        added++;
      }
    });
    if (added) writeFavs(favorites);
    return added;
  }

  function openSharedList(ids) {
    const found = ids.map((id) => extensions.find((x) => x.id.toLowerCase() === id.toLowerCase())).filter(Boolean);
    const missing = ids.filter((id) => !found.some((e) => e.id.toLowerCase() === id.toLowerCase()));
    const allCmd = ids.map((id) => `code --install-extension ${id}`).join("\n");
    const rows = found
      .map(
        (e) => `<li class="fav-item"><b>${esc(e.name)}</b> <code>${esc(e.id)}</code>
          <span class="muted">${esc(t("fav.rankShort", { n: e.rank }))}</span></li>`
      )
      .join("");
    modalContent.innerHTML = `
      <h2 id="modalTitle">${esc(t("fav.sharedTitle"))}</h2>
      <p class="muted">${esc(t("fav.sharedSub", { n: ids.length }))}</p>
      <ul class="fav-list">${rows}</ul>
      ${missing.length ? `<p class="muted">${esc(t("fav.sharedMissing", { n: missing.length, list: missing.slice(0, 6).join(", ") }))}</p>` : ""}
      <div class="install-cmd" style="margin-top:16px"><code style="white-space:pre-wrap">${esc(allCmd)}</code>
        <button type="button" data-copy="${esc(allCmd)}">${esc(t("modal.copy"))}</button></div>
      <div class="fav-share" style="margin-top:12px">
        <button class="btn btn-primary" type="button" data-import-list="${esc("#list=" + ids.join(","))}">${esc(t("fav.addToMine"))}</button>
        <button class="btn btn-ghost" type="button" data-copy-link="${esc(location.origin + location.pathname + "#list=" + ids.join(","))}">${esc(t("fav.copyLink"))}</button>
      </div>`;
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  // ---------- Compare ----------
  let compareList = []; // id расширений, выбранных для сравнения (не больше двух)

  function syncCompareButtons() {
    document.querySelectorAll("[data-compare]").forEach((btn) => {
      const on = compareList.includes(btn.dataset.compare);
      btn.classList.toggle("compare-active", on);
      btn.setAttribute("aria-pressed", String(on));
    });
  }

  function toggleCompare(id) {
    const idx = compareList.indexOf(id);
    if (idx >= 0) {
      compareList.splice(idx, 1);
      syncCompareButtons();
      toast(t("toast.compareRemoved"));
      return;
    }
    if (compareList.length >= 2) compareList = [compareList[compareList.length - 1]];
    compareList.push(id);
    syncCompareButtons();
    if (compareList.length === 2) {
      const [a, b] = compareList;
      compareList = [];
      openCompare(a, b);
      syncCompareButtons();
    } else {
      toast(t("toast.compareHint"));
    }
  }

  // Числовая строка сравнения: лучшее значение подсвечиваем.
  function numRow(label, aVal, bVal, fmt, higherWins = true) {
    const a = aVal == null ? -Infinity : aVal;
    const b = bVal == null ? -Infinity : bVal;
    const aWins = higherWins ? a > b : a < b && a !== -Infinity;
    const bWins = higherWins ? b > a : b < a && b !== -Infinity;
    return {
      label,
      a: `<span class="${aWins ? "cmp-win" : ""}">${esc(fmt(aVal))}</span>`,
      b: `<span class="${bWins ? "cmp-win" : ""}">${esc(fmt(bVal))}</span>`,
    };
  }

  // Строка сравнения без численного сравнения — просто значения.
  function strRow(label, aVal, bVal) {
    return { label, a: esc(aVal), b: esc(bVal) };
  }

  function openCompare(idA, idB) {
    const a = extensions.find((x) => x.id === idA);
    const b = extensions.find((x) => x.id === idB);
    if (!a || !b) return;
    const yesNo = (v) => (v ? t("cmp.yes") : t("cmp.no"));
    const rows = [
      numRow(t("kv.installs"), a.installs, b.installs, fmtFull),
      numRow(t("kv.rating"), a.rating, b.rating, (v) => (v ? `${v.toFixed(2)} ★` : "—")),
      numRow(t("kv.ratingCount"), a.ratingCount, b.ratingCount, fmtFull),
      numRow(t("kv.trendWeek"), a.trendingWeekly, b.trendingWeekly, (v) => (v == null ? "—" : v.toFixed(3))),
      numRow(t("kv.trendMonth"), a.trendingMonthly, b.trendingMonthly, (v) => (v == null ? "—" : v.toFixed(3))),
      strRow(t("cmp.rank"), `#${a.rank}`, `#${b.rank}`),
      strRow(t("kv.lastUpdate"), `${fmtDate(a.lastUpdated)} (${relTime(a.lastUpdated)})`, `${fmtDate(b.lastUpdated)} (${relTime(b.lastUpdated)})`),
      strRow(t("kv.published"), fmtDate(a.published), fmtDate(b.published)),
      strRow(t("kv.version"), a.version || "—", b.version || "—"),
      strRow(t("kv.publisher"), a.publisher, b.publisher),
      strRow(t("cmp.cat"), a.categories.map(catName).join(", ") || "—", b.categories.map(catName).join(", ") || "—"),
      strRow(t("kv.price"), a.pricing, b.pricing),
      strRow(t("cmp.verified"), yesNo(a.verified), yesNo(b.verified)),
      strRow(t("cmp.repo"), yesNo(a.repo), yesNo(b.repo)),
      strRow(t("cmp.fresh"), yesNo(isFresh(a.lastUpdated, 120)), yesNo(isFresh(b.lastUpdated, 120))),
      strRow(t("kv.engine"), a.engine || "—", b.engine || "—"),
    ];
    const table = `<table class="compare-table"><thead><tr><th></th><th>${esc(a.name)}</th><th>${esc(b.name)}</th></tr></thead><tbody>${rows
      .map((r) => `<tr><td>${esc(r.label)}</td><td>${r.a}</td><td>${r.b}</td></tr>`)
      .join("")}</tbody></table>`;

    const side = (e) => `
      <div class="cmp-side">
        <div class="m-icon">${e.icon ? `<img src="${esc(e.icon)}" alt="">` : ""}</div>
        <b>${esc(e.name)}</b>
        <span class="muted">${esc(e.publisher)}</span>
        <p class="muted cmp-desc">${esc(descText(e))}</p>
        <div class="cmp-side-actions">
          <button class="btn btn-ghost" type="button" data-copy="code --install-extension ${esc(e.id)}">${esc(t("cmp.copyCmd"))}</button>
          <a class="btn btn-ghost" href="${esc(e.marketplaceUrl)}" target="_blank" rel="noopener">Marketplace</a>
        </div>
      </div>`;

    modalContent.innerHTML = `
      <h2 id="modalTitle">${esc(t("compare.title"))}</h2>
      <div class="compare-sides">${side(a)}<span class="cmp-vs">vs</span>${side(b)}</div>
      ${table}
      <p class="muted cmp-note">${esc(t("compare.note"))}</p>`;
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    modal.querySelector(".modal-dialog").scrollTop = 0;
  }

  // ---------- Kit picker (3 questions) ----------
  // Отвечают все три вопроса: тема → язык → опыт. На выходе — конкретный
  // список расширений с командами, а не ссылка «посмотри раздел».
  const KITS_SRC = () => window.VSX_KITS || [];
  const LANG_SRC = () => window.VSX_LANG_KITS || {};
  const LEVEL_SRC = () => window.VSX_LEVEL_KITS || {};

  function buildKit(ans) {
    const base = KITS_SRC().find((k) => k.id === (ans["1"] || "start")) || KITS_SRC()[0];
    const langKit = LANG_SRC()[ans["2"]] || null;
    const levelKit = LEVEL_SRC()[ans["3"]] || null;
    const seen = new Set();
    const plugins = [];
    const push = (p, from) => {
      const id = p.id.toLowerCase();
      if (seen.has(id)) return;
      seen.add(id);
      plugins.push({ ...p, from });
    };
    (base?.plugins || []).forEach((p) => push(p, "kit"));
    (langKit?.plugins || []).forEach((p) => push(p, "lang"));
    (levelKit?.plugins || []).forEach((p) => push(p, "level"));
    return { base, langKit, levelKit, plugins: plugins.slice(0, 14) };
  }

  function openKitPicker() {
    const lg = lang();
    const langs = [
      ["js", "JavaScript / TypeScript"],
      ["python", "Python"],
      ["csharp", "C#"],
      ["cpp", "C / C++"],
      ["java", "Java"],
      ["go", "Go"],
      ["rust", "Rust"],
      ["php", "PHP"],
      ["other", t("picker.q2.other")],
    ];
    modalContent.innerHTML = `
      <h2 id="modalTitle">${esc(t("picker.title"))}</h2>
      <p class="muted">${esc(t("picker.sub"))}</p>
      <div class="picker-steps" id="pickerSteps">
        <div class="picker-step" data-step="1">
          <h3><span class="picker-q">1</span> ${esc(t("picker.q1"))}</h3>
          <div class="picker-opts">
            <button class="btn picker-opt" type="button" data-q="1" data-v="web">🌐 ${esc(t("picker.q1.web"))}</button>
            <button class="btn picker-opt" type="button" data-q="1" data-v="python">🐍 ${esc(t("picker.q1.python"))}</button>
            <button class="btn picker-opt" type="button" data-q="1" data-v="gamedev">🎮 ${esc(t("picker.q1.games"))}</button>
            <button class="btn picker-opt" type="button" data-q="1" data-v="ai">🤖 ${esc(t("picker.q1.ai"))}</button>
            <button class="btn picker-opt" type="button" data-q="1" data-v="git">🔧 ${esc(t("picker.q1.git"))}</button>
            <button class="btn picker-opt" type="button" data-q="1" data-v="start">🐣 ${esc(t("picker.q1.start"))}</button>
          </div>
        </div>
        <div class="picker-step" data-step="2">
          <h3><span class="picker-q">2</span> ${esc(t("picker.q2"))}</h3>
          <div class="picker-opts">
            ${langs.map(([v, label]) => `<button class="btn picker-opt" type="button" data-q="2" data-v="${esc(v)}">${esc(label)}</button>`).join("")}
          </div>
        </div>
        <div class="picker-step" data-step="3">
          <h3><span class="picker-q">3</span> ${esc(t("picker.q3"))}</h3>
          <div class="picker-opts">
            <button class="btn picker-opt" type="button" data-q="3" data-v="newbie">🐣 ${esc(t("picker.q3.newbie"))}</button>
            <button class="btn picker-opt" type="button" data-q="3" data-v="mid">🔧 ${esc(t("picker.q3.mid"))}</button>
            <button class="btn picker-opt" type="button" data-q="3" data-v="pro">🚀 ${esc(t("picker.q3.pro"))}</button>
          </div>
        </div>
        <div class="picker-result" id="pickerResult" hidden></div>
      </div>`;
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";

    const answers = {};
    modalContent.querySelectorAll(".picker-opt").forEach((btn) => {
      btn.addEventListener("click", () => {
        const q = btn.dataset.q;
        answers[q] = btn.dataset.v;
        const step = btn.closest(".picker-step");
        step.querySelectorAll(".picker-opt").forEach((b) => b.classList.toggle("active", b === btn));
        if (answers["1"] && answers["2"] && answers["3"]) showKitResult(answers);
        else {
          const resultEl = document.getElementById("pickerResult");
          resultEl.hidden = false;
          resultEl.innerHTML = `<p class="muted">${esc(t("picker.waiting", { n: 3 - Object.keys(answers).length }))}</p>`;
        }
      });
    });

    function showKitResult(ans) {
      const built = buildKit(ans);
      const resultEl = document.getElementById("pickerResult");
      if (!built.plugins.length) {
        resultEl.hidden = false;
        resultEl.innerHTML = `<p class="muted">${esc(t("picker.noData"))}</p>`;
        return;
      }
      const lgNow = lang();
      const allCmd = built.plugins.map((p) => `code --install-extension ${p.id}`).join("\n");
      const shareUrl = `${location.origin}${location.pathname}#list=${built.plugins.map((p) => p.id).join(",")}`;
      const fromLabel = {
        kit: built.base ? built.base.title[lgNow] || built.base.title.ru : "",
        lang: built.langKit ? built.langKit.label : "",
        level: built.levelKit ? built.levelKit.label[lgNow] || built.levelKit.label.ru : "",
      };
      const items = built.plugins
        .map(
          (p) => `<li class="kit-plugin"><div class="kit-plugin-text"><b>${esc(p.name)}</b> <code>${esc(p.id)}</code>
            <span>${esc(p.desc[lgNow] || p.desc.ru)}</span>
            <span class="picker-tag">${esc(fromLabel[p.from] || "")}</span></div>
            <button class="kit-copy-one" type="button" data-copy="code --install-extension ${esc(p.id)}" title="${esc(t("kits.copyOne"))}" aria-label="${esc(t("kits.copyOne"))}">⧉</button></li>`
        )
        .join("");

      resultEl.hidden = false;
      resultEl.innerHTML = `
        <div class="picker-kit-match">
          <h3>🎁 ${esc(t("picker.result"))} · ${esc(t("picker.count", { n: built.plugins.length }))}</h3>
          <p class="muted">${esc(t("picker.resultHint"))}</p>
          <ul class="kit-list">${items}</ul>
          <div class="install-cmd" style="margin-top:12px"><code style="white-space:pre-wrap">${esc(allCmd)}</code>
            <button type="button" data-copy="${esc(allCmd)}">${esc(t("kits.copyAll"))}</button></div>
          <div class="fav-share" style="margin-top:12px">
            <button class="btn btn-primary" type="button" data-import-list="${esc("#list=" + built.plugins.map((p) => p.id).join(","))}">${esc(t("fav.addToMine"))}</button>
            <button class="btn btn-ghost" type="button" data-copy-link="${esc(shareUrl)}">${esc(t("fav.copyLink"))}</button>
            ${built.base ? `<a class="btn btn-ghost" href="kits.html#${esc(built.base.id)}">${esc(t("picker.openKit"))}</a>` : ""}
          </div>
          ${ans["1"] === "ai" ? `<p class="muted" style="margin-top:10px">${esc(t("picker.aiNote"))}</p>` : ""}
        </div>`;
      resultEl.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }

  // ---------- Show more (pagination) ----------
  const PAGE_SIZE = 60;
  let visibleCount = PAGE_SIZE;

  // ---------- URL hash: #ext=publisher.name, #list=id1,id2 или #rating&publisher=X ----------
  function parseHashParam(hash, key) {
    const m = hash.match(new RegExp("[&?]" + key + "=([^&]+)", "i"));
    return m ? decodeURIComponent(m[1]) : null;
  }

  function handleHash() {
    const h = location.hash;
    const listMatch = h.match(/^#list=(.+)$/i);
    if (listMatch && extensions.length) {
      openSharedList(parseListHash(h));
      return;
    }
    const extMatch = h.match(/^#ext=(.+)$/i);
    if (extMatch && extensions.length) {
      const id = extMatch[1].toLowerCase();
      const e = extensions.find((x) => x.id.toLowerCase() === id);
      if (e) {
        // scroll to rating section and open modal
        const ratingSec = document.getElementById("rating");
        if (ratingSec) ratingSec.scrollIntoView({ behavior: "smooth" });
        setTimeout(() => openModal(e.id), 300);
      }
    }
    // Фильтр по разработчику: #rating&publisher=Microsoft
    if (h.includes("publisher=") && extensions.length) {
      const ratingSec = document.getElementById("rating");
      if (ratingSec) ratingSec.scrollIntoView({ behavior: "smooth" });
      render();
    }
  }
  window.addEventListener("hashchange", handleHash);

  // ---------- Init ----------
  $("#heroNum").textContent = TOP_N;
  loadPrevRanks();
  loadData();
  scheduleMidnightRefresh();
  tickCountdown();
  setInterval(tickCountdown, 1000);
})();
