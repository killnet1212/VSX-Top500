/* ============================================================
   VSX Top500 — страница «Первый день в VS Code» (first-day.html)
   Пошаговый путь новичка: установка → папка → первое расширение →
   терминал → настройки → Git. Прогресс отмеченных шагов хранится
   в localStorage, клавиши переписываются под Win/Mac.
   ============================================================ */

(() => {
  "use strict";

  const t = (key, vars) => window.I18N.t(key, vars);
  const lang = () => window.I18N.lang;
  const esc = (s) =>
    String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const PLAT = window.VSXPlatform || { k: (s) => s, apply: () => {} };

  const PROGRESS_KEY = "vsx_first_day_v1";

  // ---------- Шаги ----------
  // keys — сочетания для Windows (переписываются на Mac модулем platform.js),
  // cmds — команды, которые копируются одной кнопкой.
  const STEPS = [
    {
      id: "install",
      icon: "📥",
      title: { ru: "Установить VS Code", en: "Install VS Code" },
      time: { ru: "5 минут", en: "5 minutes" },
      text: {
        ru: "Скачайте установщик с официального сайта и запустите его. На Windows оставьте включённой галочку «Add to PATH» (иначе команда code в терминале не появится), на macOS перетащите приложение в папку Applications. После установки VS Code можно открыть из любой папки командой code.",
        en: "Download the installer from the official site and run it. On Windows keep “Add to PATH” checked (otherwise the code command won't exist in the terminal); on macOS drag the app into Applications. Afterwards you can open VS Code from any folder with the code command.",
      },
      cmds: [{ label: "code .", note: { ru: "открыть текущую папку", en: "open the current folder" } }],
      link: { href: "https://code.visualstudio.com/download", label: { ru: "Скачать с code.visualstudio.com", en: "Download from code.visualstudio.com" } },
    },
    {
      id: "folder",
      icon: "📁",
      title: { ru: "Открыть папку, а не файл", en: "Open a folder, not a file" },
      time: { ru: "1 минута", en: "1 minute" },
      text: {
        ru: "VS Code работает проектами: откройте папку целиком — тогда заработают поиск по всем файлам, Git, настройки проекта и расширения. Создайте папку для учебного проекта и откройте её. Дальше всегда открывайте папку, а не отдельные файлы.",
        en: "VS Code works per project: open the whole folder and you get search across all files, Git, project settings and extensions. Create a folder for a practice project and open it. From now on always open folders, not single files.",
      },
      keys: ["Ctrl + K", "Ctrl + O"],
    },
    {
      id: "interface",
      icon: "🧭",
      title: { ru: "Разобраться с интерфейсом", en: "Get around the interface" },
      time: { ru: "5 минут", en: "5 minutes" },
      text: {
        ru: "Слева — панель с проводником, поиском, Git и расширениями. Сверху — редактор с вкладками, снизу — терминал. Главное окно ввода — командная палитра: она умеет всё, поэтому не нужно запоминать меню. Не помните, где настройка — начните печатать её название в палитре.",
        en: "On the left is the panel with Explorer, Search, Source Control and Extensions. On top — the editor with tabs, at the bottom — the terminal. The main input box is the Command Palette: it can do everything, so you don't need to memorise menus. Can't find a setting? Start typing its name in the palette.",
      },
      keys: ["Ctrl + Shift + P", "Ctrl + P", "Ctrl + Shift + E"],
    },
    {
      id: "first-ext",
      icon: "🧩",
      title: { ru: "Поставить первое расширение", en: "Install your first extension" },
      time: { ru: "3 минуты", en: "3 minutes" },
      text: {
        ru: "Откройте панель расширений, найдите Error Lens и нажмите Install — ошибки начнут подсвечиваться прямо в строке кода. Это самое заметное расширение для старта: редактор сразу начинает «говорить» с вами. Дальше поставьте Prettier, чтобы код форматировался сам при сохранении.",
        en: "Open the Extensions panel, find Error Lens and click Install — errors start highlighting right in the code line. It is the most noticeable starter extension: the editor immediately starts talking to you. Next add Prettier so code formats itself on save.",
      },
      keys: ["Ctrl + Shift + X"],
      cmds: [
        { label: "code --install-extension usernamehw.errorlens", note: { ru: "ошибки прямо в строке", en: "errors right in the line" } },
        { label: "code --install-extension esbenp.prettier-vscode", note: { ru: "автоформатирование", en: "automatic formatting" } },
      ],
      link: { href: "index.html#rating", label: { ru: "Найти расширения в рейтинге", en: "Find extensions in the rating" } },
    },
    {
      id: "terminal",
      icon: "🖥️",
      title: { ru: "Научиться терминалу внутри редактора", en: "Use the built-in terminal" },
      time: { ru: "3 минуты", en: "3 minutes" },
      text: {
        ru: "Терминал открывается прямо в VS Code и уже находится в папке вашего проекта — не нужно никуда переходить. Проверьте, что видно содержимое папки: в Windows это команда dir, на macOS и Linux — ls. Дальше любой запуск, установка пакета или git работают именно здесь.",
        en: "The terminal opens inside VS Code and already sits in your project folder — no need to cd anywhere. Check that you see the folder contents: dir on Windows, ls on macOS and Linux. From now on every run, package install and git command happens here.",
      },
      keys: ["Ctrl + `", "Ctrl + Shift + 5"],
      cmds: [
        { label: "dir", note: { ru: "Windows", en: "Windows" } },
        { label: "ls", note: { ru: "macOS и Linux", en: "macOS and Linux" } },
      ],
    },
    {
      id: "settings",
      icon: "⚙️",
      title: { ru: "Настроить редактор под себя", en: "Tune the editor for yourself" },
      time: { ru: "5 минут", en: "5 minutes" },
      text: {
        ru: "Откройте настройки и сделайте три вещи: включите автосохранение, форматирование при сохранении и convenient размер шрифта. Все настройки живут в файле settings.json — его удобно переносить между компьютерами. Готовый базовый конфиг можно скопировать на странице «Настройки».",
        en: "Open Settings and do three things: turn on autosave, format-on-save and a comfortable font size. Every setting lives in settings.json, which is easy to move between machines. A ready base config can be copied from the “Setup” page.",
      },
      keys: ["Ctrl + ,", "Ctrl + Shift + P → Open User Settings (JSON)"],
      link: { href: "settings.html", label: { ru: "Готовые settings.json", en: "Ready-made settings.json" } },
    },
    {
      id: "theme",
      icon: "🎨",
      title: { ru: "Выбрать тему и шрифт", en: "Pick a theme and a font" },
      time: { ru: "5 минут", en: "5 minutes" },
      text: {
        ru: "Тема — это не красота, а усталость глаз к вечеру. Переберите три-четыре варианта за минуту и оставьте ту, где вам спокойно читать. Если код «слипается», поставьте шрифт с лигатурами — JetBrains Mono или Fira Code, и включите их в настройках.",
        en: "A theme is not about beauty but about tired eyes by the evening. Try three or four variants in a minute and keep the one that is calm to read. If code looks glued together, install a ligature font — JetBrains Mono or Fira Code — and enable ligatures in settings.",
      },
      keys: ["Ctrl + K", "Ctrl + T"],
      cmds: [
        { label: "code --install-extension zhuangtongfa.material-theme", note: { ru: "One Dark Pro", en: "One Dark Pro" } },
        { label: "code --install-extension catppuccin.catppuccin-vsc", note: { ru: "Catppuccin", en: "Catppuccin" } },
      ],
      link: { href: "settings.html#themesSection", label: { ru: "Проверенные темы с превью", en: "Proven themes with previews" } },
    },
    {
      id: "git",
      icon: "🔧",
      title: { ru: "Первый коммит в Git", en: "Your first Git commit" },
      time: { ru: "7 минут", en: "7 minutes" },
      text: {
        ru: "Git страхует вашу работу: в любой момент можно вернуться к вчерашней версии. Инициализируйте репозиторий в панели Source Control, введите имя и e-mail, добавьте файлы и сделайте коммит. VS Code покажет изменения прямо в редакторе — по цветным полоскам на полях.",
        en: "Git protects your work: you can always jump back to yesterday's version. Initialise a repository in the Source Control panel, set your name and e-mail, stage files and commit. VS Code shows changes right in the editor as coloured bars in the gutter.",
      },
      keys: ["Ctrl + Shift + G"],
      cmds: [
        { label: "git init", note: { ru: "создать репозиторий", en: "create a repository" } },
        { label: "git add .", note: { ru: "добавить файлы", en: "stage files" } },
        { label: 'git commit -m "first commit"', note: { ru: "сохранить точку возврата", en: "save a restore point" } },
      ],
    },
    {
      id: "hotkeys",
      icon: "⌨️",
      title: { ru: "Выучить пять горячих клавиш", en: "Learn five hotkeys" },
      time: { ru: "10 минут", en: "10 minutes" },
      text: {
        ru: "Пять сочетаний закрывают большую часть повседневной работы: командная палитра, переход к файлу, мультикурсор, поиск по проекту и переименование symbol'а во всём проекте. Повторите их на маленьком проекте десять раз — и дальше будете идти быстрее, чем через меню мышкой.",
        en: "Five shortcuts cover most daily work: the command palette, quick open, multi-cursor, project search and rename symbol across the project. Repeat them ten times on a small project and you will keep moving faster than through menus with the mouse.",
      },
      keys: ["Ctrl + Shift + P", "Ctrl + P", "Ctrl + D", "Ctrl + Shift + F", "F2"],
      link: { href: "lifehacks.html", label: { ru: "Все лайфхаки и шпаргалка", en: "All lifehacks and the cheatsheet" } },
    },
    {
      id: "sync",
      icon: "☁️",
      title: { ru: "Включить синхронизацию настроек", en: "Turn on Settings Sync" },
      time: { ru: "4 минуты", en: "4 minutes" },
      text: {
        ru: "Settings Sync хранит ваши настройки, расширения, темы и клавиши в аккаунте GitHub или Microsoft. Новый компьютер за десять минут становится таким же привычным, как старый — и ничего не нужно настраивать заново.",
        en: "Settings Sync keeps your settings, extensions, themes and keys in a GitHub or Microsoft account. A new machine becomes as familiar as the old one in ten minutes — nothing to configure from scratch.",
      },
      cmds: [{ label: "Ctrl+Shift+P → Turn on Settings Sync", note: { ru: "кнопка в меню шестерёнки", en: "button in the gear menu" } }],
    },
    {
      id: "next",
      icon: "🚀",
      title: { ru: "Забрать готовый набор под свою задачу", en: "Grab a ready kit for your task" },
      time: { ru: "5 минут", en: "5 minutes" },
      text: {
        ru: "Дальше не собирайте расширения по одному: возьмите готовый набор под свою задачу — веб, Python, игры, ИИ — и добавьте пару штук под себя. И держите правило: чем меньше расширений включено, тем быстрее редактор.",
        en: "From here, don't collect extensions one by one: take a ready kit for your task — web, Python, games, AI — and add a couple of personal ones. Keep the rule: the fewer enabled extensions, the faster the editor.",
      },
      link: { href: "kits.html", label: { ru: "Открыть наборы расширений", en: "Open extension kits" } },
    },
  ];

  // ---------- Progress ----------
  function readDone() {
    try {
      return new Set(JSON.parse(localStorage.getItem(PROGRESS_KEY) || "[]"));
    } catch {
      return new Set();
    }
  }
  function writeDone(set) {
    try {
      localStorage.setItem(PROGRESS_KEY, JSON.stringify([...set]));
    } catch {
      /* quota — ignore */
    }
  }
  let done = readDone();

  // ---------- DOM ----------
  const stepsEl = document.getElementById("firstSteps");
  const fillEl = document.getElementById("firstProgressFill");
  const textEl = document.getElementById("firstProgressText");
  const resetBtn = document.getElementById("firstReset");

  // ---------- Clipboard ----------
  async function copyText(text) {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return;
      }
    } catch {
      /* fall through to legacy path */
    }
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.cssText = "position:fixed;opacity:0";
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand("copy");
    } finally {
      ta.remove();
    }
  }

  // ---------- Toast ----------
  let toastEl;
  function toast(text) {
    if (!toastEl) {
      toastEl = document.createElement("div");
      toastEl.className = "toast";
      document.body.appendChild(toastEl);
    }
    toastEl.textContent = text;
    toastEl.classList.add("show");
    clearTimeout(toastEl._t);
    toastEl._t = setTimeout(() => toastEl.classList.remove("show"), 1800);
  }

  // ---------- Render ----------
  function renderProgress() {
    const total = STEPS.length;
    const n = STEPS.filter((s) => done.has(s.id)).length;
    const pct = total ? Math.round((n / total) * 100) : 0;
    fillEl.style.width = pct + "%";
    textEl.textContent = t("first.progress", { n, total, pct });
    textEl.setAttribute("role", "status");
  }

  function render() {
    const lg = lang();
    stepsEl.innerHTML = "";
    const frag = document.createDocumentFragment();

    STEPS.forEach((s, i) => {
      const isDone = done.has(s.id);
      const card = document.createElement("article");
      card.className = "step-card" + (isDone ? " done" : "");
      card.dataset.step = s.id;

      const keysHtml = (s.keys || [])
        .map((key) => `<kbd>${esc(PLAT.k(key))}</kbd>`)
        .join("");
      const cmdsHtml = (s.cmds || [])
        .map(
          (c) => `<div class="step-cmd"><code>${esc(c.label)}</code>${c.note ? `<span class="muted">${esc(c.note[lg] || c.note.ru)}</span>` : ""}
            <button class="step-copy" type="button" data-copy-cmd="${esc(c.label)}" title="${esc(t("first.copyCmd"))}" aria-label="${esc(t("first.copyCmd"))}">
              <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
            </button></div>`
        )
        .join("");
      const linkHtml = s.link
        ? `<a class="step-link" href="${esc(s.link.href)}">${esc(s.link.label[lg] || s.link.label.ru)}
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><path d="M15 3h6v6"/><path d="M10 14 21 3"/></svg></a>`
        : "";

      card.innerHTML = `
        <button class="step-check" type="button" data-step-toggle="${esc(s.id)}" aria-pressed="${isDone}"
          title="${esc(t("first.markDone"))}" aria-label="${esc(t("first.markDone"))}">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>
        </button>
        <div class="step-body">
          <div class="step-top">
            <span class="step-num">${i + 1}</span>
            <span class="step-icon" aria-hidden="true">${s.icon}</span>
            <h2 class="step-title">${esc(s.title[lg] || s.title.ru)}</h2>
            <span class="step-time">${esc(s.time[lg] || s.time.ru)}</span>
          </div>
          <p class="step-text">${esc(PLAT.k(s.text[lg] || s.text.ru))}</p>
          ${keysHtml ? `<div class="step-keys">${keysHtml}</div>` : ""}
          ${cmdsHtml ? `<div class="step-cmds">${cmdsHtml}</div>` : ""}
          ${linkHtml}
        </div>`;
      frag.appendChild(card);
    });

    stepsEl.appendChild(frag);
    PLAT.apply(stepsEl);
    renderProgress();
  }

  // ---------- Events ----------
  stepsEl.addEventListener("click", (ev) => {
    const toggle = ev.target.closest("[data-step-toggle]");
    if (toggle) {
      const id = toggle.dataset.stepToggle;
      if (done.has(id)) done.delete(id);
      else done.add(id);
      writeDone(done);
      const card = toggle.closest(".step-card");
      const on = done.has(id);
      toggle.setAttribute("aria-pressed", String(on));
      if (card) card.classList.toggle("done", on);
      renderProgress();
      return;
    }
    const copy = ev.target.closest("[data-copy-cmd]");
    if (copy) copyText(copy.dataset.copyCmd).then(() => toast(t("toast.copied")));
  });

  resetBtn.addEventListener("click", () => {
    done = new Set();
    writeDone(done);
    render();
    toast(t("first.resetDone"));
  });

  window.addEventListener("langchange", render);
  window.addEventListener("platformchange", render);
  document.getElementById("scrollTop").addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

  // ---------- Init ----------
  render();
})();
