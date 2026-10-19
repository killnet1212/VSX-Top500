/* ============================================================
   VSX Top500 — страница «Лайфхаки» (lifehacks.html)
   Советы, трюки и горячие клавиши VS Code. Отдельная страница,
   чтобы не перегружать главный рейтинг.
   ============================================================ */

(() => {
  "use strict";

  const t = (key, vars) => window.I18N.t(key, vars);
  const lang = () => window.I18N.lang;
  // esc — из common.js
  // Переключатель Windows/Mac (platform.js). В тестах модуля может не быть —
  // тогда клавиши остаются в записи для Windows.
  const PLAT = window.VSXPlatform || { k: (s) => s, apply: () => {} };

  // ---------- Лайфхаки ----------
  // cat: hotkeys | edit | nav | prod | git, keys — горячие клавиши (Windows/Linux)
  const HACKS = [
    {
      icon: "🖱️",
      cat: "hotkeys",
      title: { ru: "Мультикурсор за секунду", en: "Multi-cursor in a second" },
      text: {
        ru: "Alt+клик добавляет новый курсор в любом месте, а Ctrl+D выделяет следующее вхождение слова. Правь десятки строк одновременно, без копипасты.",
        en: "Alt+click adds a cursor anywhere, and Ctrl+D selects the next occurrence of a word. Edit dozens of lines at once, no copy-paste.",
      },
      keys: ["Alt + Клик", "Ctrl + D"],
    },
    {
      icon: "↕️",
      cat: "hotkeys",
      title: { ru: "Двигай и дублируй строки без мыши", en: "Move and copy lines without the mouse" },
      text: {
        ru: "Alt+↑/↓ перемещает строку (или выделенный блок) вверх-вниз, Shift+Alt+↑/↓ — мгновенно копирует её.",
        en: "Alt+↑/↓ moves the current line (or selection) up and down, Shift+Alt+↑/↓ duplicates it instantly.",
      },
      keys: ["Alt + ↑/↓", "Shift + Alt + ↑/↓"],
    },
    {
      icon: "✏️",
      cat: "hotkeys",
      title: { ru: "Переименование по всему проекту", en: "Rename across the whole project" },
      text: {
        ru: "F2 на переменной, функции или классе переименовывает их сразу во всех файлах проекта — забудь про поиск и замену.",
        en: "F2 on a variable, function or class renames it across every file in the project — forget find-and-replace.",
      },
      keys: ["F2"],
    },
    {
      icon: "⌨️",
      cat: "hotkeys",
      title: { ru: "Все горячие клавиши под рукой", en: "All hotkeys at your fingertips" },
      text: {
        ru: "Ctrl+K Ctrl+S открывает полный список горячих клавиш с поиском. Там же можно назначить свои сочетания для любимых команд.",
        en: "Ctrl+K Ctrl+S opens the full searchable hotkey list. You can also assign your own shortcuts there.",
      },
      keys: ["Ctrl + K", "Ctrl + S"],
    },
    {
      icon: "⚡",
      cat: "edit",
      title: { ru: "Emmet: HTML-каркас одной строкой", en: "Emmet: an HTML skeleton in one line" },
      text: {
        ru: "В HTML-файле набери ! и нажми Tab — получишь полный каркас страницы. А запись вида ul>li*5 раскроется в список из пяти пунктов.",
        en: "In an HTML file type ! and press Tab to get a full page skeleton. An expression like ul>li*5 expands into a five-item list.",
      },
      keys: ["! + Tab", "ul>li*5 + Tab"],
    },
    {
      icon: "📦",
      cat: "edit",
      title: { ru: "Свернуть и развернуть весь код", en: "Fold and unfold all code" },
      text: {
        ru: "Ctrl+K Ctrl+0 сворачивает все блоки, Ctrl+K Ctrl+J — разворачивает. Отличный способ быстро окинуть взглядом структуру большого файла.",
        en: "Ctrl+K Ctrl+0 folds all blocks, Ctrl+K Ctrl+J unfolds them. A great way to grasp the structure of a large file.",
      },
      keys: ["Ctrl + K", "Ctrl + 0", "Ctrl + J"],
    },
    {
      icon: "⤵️",
      cat: "edit",
      title: { ru: "Строка выше или ниже — на лету", en: "Insert a line above or below instantly" },
      text: {
        ru: "Ctrl+Shift+Enter вставляет новую строку выше текущей, Ctrl+Enter — ниже, и курсор сразу переезжает на неё. Не нужно прыгать в конец строки.",
        en: "Ctrl+Shift+Enter inserts a line above the current one, Ctrl+Enter — below, moving the cursor there. No need to jump to the end of the line.",
      },
      keys: ["Ctrl + Shift + Enter", "Ctrl + Enter"],
    },
    {
      icon: "💬",
      cat: "edit",
      title: { ru: "Комментарии одним нажатием", en: "Comments in one keystroke" },
      text: {
        ru: "Ctrl+/ комментирует строку или выделенный блок, Shift+Alt+A — блочный комментарий. Работает в любом языке, виджет комментария подбирается сам.",
        en: "Ctrl+/ comments the line or selection, Shift+Alt+A makes a block comment. Works in any language with the right comment syntax.",
      },
      keys: ["Ctrl + /", "Shift + Alt + A"],
    },
    {
      icon: "🔍",
      cat: "nav",
      title: { ru: "Ctrl+P: найди что угодно", en: "Ctrl+P: find anything" },
      text: {
        ru: "Ctrl+P — быстрый переход к файлу по имени. Добавь @ — и найдёшь символ в файле, :12 — прыгнешь сразу на строку 12.",
        en: "Ctrl+P is quick open by file name. Add @ to find a symbol in the file, or :12 to jump straight to line 12.",
      },
      keys: ["Ctrl + P", "@символ", ":12"],
    },
    {
      icon: "🗂️",
      cat: "nav",
      title: { ru: "Поиск и замена по всему проекту", en: "Search and replace across the project" },
      text: {
        ru: "Ctrl+Shift+F ищет по всем файлам с фильтрами и регулярками, Ctrl+Shift+H — то же самое, но сразу с заменой.",
        en: "Ctrl+Shift+F searches all files with filters and regex, Ctrl+Shift+H does the same but with replace.",
      },
      keys: ["Ctrl + Shift + F", "Ctrl + Shift + H"],
    },
    {
      icon: "🧭",
      cat: "nav",
      title: { ru: "Навигация назад и вперёд", en: "Navigate back and forward" },
      text: {
        ru: "Alt+← и Alt+→ перемещают по истории переходов, как в браузере. Незаменимо, когда прыгаешь по определениям в чужом коде.",
        en: "Alt+← and Alt+→ move through navigation history, just like in a browser. A lifesaver when jumping through definitions in unfamiliar code.",
      },
      keys: ["Alt + ←", "Alt + →"],
    },
    {
      icon: "🎛️",
      cat: "nav",
      title: { ru: "Командная палитра — пульт управления", en: "Command palette — the control center" },
      text: {
        ru: "Ctrl+Shift+P открывает все команды редактора. Не помнишь, где настройка — просто начни печатать её название.",
        en: "Ctrl+Shift+P opens every editor command. Can't find a setting? Just start typing its name.",
      },
      keys: ["Ctrl + Shift + P"],
    },
    {
      icon: "🧘",
      cat: "nav",
      title: { ru: "Zen-режим и чистая панель", en: "Zen mode and a clean panel" },
      text: {
        ru: "Ctrl+B прячет боковую панель, а Ctrl+K Z включает Zen-режим — только код, ничего лишнего. Выход — Esc Esc.",
        en: "Ctrl+B hides the sidebar, and Ctrl+K Z toggles Zen mode — just code, nothing else. Press Esc Esc to exit.",
      },
      keys: ["Ctrl + B", "Ctrl + K", "Z"],
    },
    {
      icon: "👤",
      cat: "prod",
      title: { ru: "Профили: работа, учёба, эксперименты", en: "Profiles: work, study, experiments" },
      text: {
        ru: "Профили VS Code хранят отдельные наборы расширений и настроек. Один профиль для работы, другой для учёбы — переключаются за секунду.",
        en: "VS Code profiles keep separate sets of extensions and settings. One profile for work, another for study — switch in a second.",
      },
      keys: ["Ctrl + Shift + P → Profiles"],
    },
    {
      icon: "☁️",
      cat: "prod",
      title: { ru: "Синхронизация настроек через GitHub", en: "Sync settings via GitHub" },
      text: {
        ru: "Включи Settings Sync (значок шестерёнки → Turn on Settings Sync) — и настройки, расширения, темы и горячие клавиши переедут на любой новый компьютер.",
        en: "Turn on Settings Sync (gear icon → Turn on Settings Sync) — settings, extensions, themes and hotkeys follow you to any new machine.",
      },
      keys: ["Settings Sync"],
    },
    {
      icon: "🧩",
      cat: "prod",
      title: { ru: "Свои сниппеты для частых кусков кода", en: "Custom snippets for recurring code" },
      text: {
        ru: "File → Preferences → Configure User Snippets — создай свой шаблон (например, консольный лог или компонент) и вставляй его по префиксу за два нажатия.",
        en: "File → Preferences → Configure User Snippets — create your own template (a console log, a component) and insert it by prefix in two keystrokes.",
      },
      keys: ["User Snippets"],
    },
    {
      icon: "📝",
      cat: "prod",
      title: { ru: "Настройки как текст — settings.json", en: "Settings as text — settings.json" },
      text: {
        ru: "Настройки VS Code можно редактировать файлом: Ctrl+Shift+P → Open User Settings (JSON). Удобно копировать конфиги между машинами и делиться ими.",
        en: "VS Code settings can be edited as a file: Ctrl+Shift+P → Open User Settings (JSON). Handy for copying and sharing configs between machines.",
      },
      keys: ["settings.json"],
    },
    {
      icon: "🖥️",
      cat: "git",
      title: { ru: "Встроенный терминал", en: "The built-in terminal" },
      text: {
        ru: "Ctrl+` открывает терминал прямо в редакторе, Ctrl+Shift+5 делит его на два. Не нужно переключаться между окнами во время сборки или запуска тестов.",
        en: "Ctrl+` opens a terminal right in the editor, Ctrl+Shift+5 splits it in two. No window switching while building or running tests.",
      },
      keys: ["Ctrl + `", "Ctrl + Shift + 5"],
    },
    {
      icon: "🕓",
      cat: "git",
      title: { ru: "Timeline: история файла под рукой", en: "Timeline: file history at hand" },
      text: {
        ru: "Панель Timeline в проводнике показывает историю изменений файла: кто, что и когда менял. Правый клик по записи — сравнение или восстановление версии.",
        en: "The Timeline panel in the explorer shows a file's change history: who changed what and when. Right-click an entry to diff or restore a version.",
      },
      keys: ["Explorer → Timeline"],
    },
  ];

  const FILTERS = [
    { id: "all", labelKey: "lifehacks.filter.all" },
    { id: "hotkeys", labelKey: "lifehacks.cat.hotkeys" },
    { id: "edit", labelKey: "lifehacks.cat.edit" },
    { id: "nav", labelKey: "lifehacks.cat.nav" },
    { id: "prod", labelKey: "lifehacks.cat.prod" },
    { id: "git", labelKey: "lifehacks.cat.git" },
  ];

  // ---------- DOM ----------
  const grid = document.getElementById("hacksGrid");
  const filtersEl = document.getElementById("hackFilters");
  const countEl = document.getElementById("hackCount");
  const emptyEl = document.getElementById("hacksEmpty");
  const searchInput = document.getElementById("hackSearch");

  let activeFilter = "all";

  // ---------- Filters ----------
  function renderFilters() {
    filtersEl.innerHTML = "";
    FILTERS.forEach((f) => {
      const n = f.id === "all" ? HACKS.length : HACKS.filter((h) => h.cat === f.id).length;
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "filter-chip" + (f.id === activeFilter ? " active" : "");
      btn.innerHTML = `${esc(t(f.labelKey))} <span class="filter-count">${n}</span>`;
      btn.addEventListener("click", () => {
        activeFilter = f.id;
        renderFilters();
        render();
      });
      filtersEl.appendChild(btn);
    });
  }

  // ---------- Render ----------
  function getVisible() {
    const q = searchInput.value.trim().toLowerCase();
    const lg = lang();
    return HACKS.filter((h) => {
      if (activeFilter !== "all" && h.cat !== activeFilter) return false;
      if (!q) return true;
      // Ищем и по «виндовой», и по «маковской» записи клавиш, чтобы запрос
      // «cmd» находил советы, записанные через Ctrl.
      const hay = `${h.title[lg]} ${h.text[lg]} ${PLAT.k(h.text[lg])} ${h.keys.join(" ")} ${h.keys.map(PLAT.k).join(" ")} ${t(
        "lifehacks.cat." + h.cat
      )}`.toLowerCase();
      return hay.includes(q);
    });
  }

  function render() {
    const list = getVisible();
    grid.innerHTML = "";
    emptyEl.hidden = list.length > 0;
    countEl.textContent = t("lifehacks.count", { n: list.length });

    const lg = lang();
    const frag = document.createDocumentFragment();
    list.forEach((h, i) => {
      const card = document.createElement("article");
      card.className = "hack-card";
      card.style.setProperty("--i", Math.min(i, 20));
      card.innerHTML = `
        <div class="hack-top">
          <span class="hack-icon" aria-hidden="true">${h.icon}</span>
          <span class="hack-cat">${esc(t("lifehacks.cat." + h.cat))}</span>
        </div>
        <h3 class="hack-title">${esc(h.title[lg])}</h3>
        <p class="hack-text">${esc(PLAT.k(h.text[lg]))}</p>
        ${h.keys.length ? `<div class="hack-keys">${h.keys.map((key) => `<kbd>${esc(PLAT.k(key))}</kbd>`).join("")}</div>` : ""}
      `;
      frag.appendChild(card);
    });
    grid.appendChild(frag);
    PLAT.apply(grid);
  }

  // ---------- Печатная шпаргалка ----------
  // Отдельный блок, который виден только при печати: все советы списком,
  // сгруппированные по категориям, без шапки, декора и поиска.
  const CAT_ORDER = ["hotkeys", "edit", "nav", "prod", "git"];

  function buildCheatsheet() {
    const old = document.getElementById("cheatsheet");
    if (old) old.remove();
    const lg = lang();
    const section = document.createElement("section");
    section.id = "cheatsheet";
    section.className = "cheatsheet";
    const groups = CAT_ORDER.filter((c) => HACKS.some((h) => h.cat === c))
      .map((c) => {
        const rows = HACKS.filter((h) => h.cat === c)
          .map(
            (h) => `<tr>
              <td><b>${esc(h.title[lg])}</b><div class="cs-note">${esc(h.text[lg])}</div></td>
              <td class="cs-keys">${h.keys.map((key) => `<kbd>${esc(PLAT.k(key))}</kbd>`).join(" ")}</td>
            </tr>`
          )
          .join("");
        return `<h2>${esc(t("lifehacks.cat." + c))}</h2><table class="cs-table"><tbody>${rows}</tbody></table>`;
      })
      .join("");
    section.innerHTML = `
      <h1>${esc(t("lifehacks.cheatsheetTitle"))}</h1>
      <p class="cs-sub">${esc(t("lifehacks.cheatsheetSub", { platform: PLAT.label ? PLAT.label() : "Windows / Linux" }))}</p>
      ${groups}
      <p class="cs-foot">${esc(t("lifehacks.cheatsheetFoot"))}</p>`;
    document.body.appendChild(section);
  }

  function printCheatsheet() {
    buildCheatsheet();
    window.print();
  }

  // ---------- Events ----------
  let searchTimer;
  searchInput.addEventListener("input", () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(render, 120);
  });

  window.addEventListener("langchange", () => {
    renderFilters();
    render();
    buildCheatsheet();
  });
  window.addEventListener("platformchange", () => {
    render();
    buildCheatsheet();
  });

  const printBtn = document.getElementById("printCheat");
  if (printBtn) printBtn.addEventListener("click", printCheatsheet);

  document.getElementById("scrollTop").addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

  // ---------- Init ----------
  renderFilters();
  render();
  buildCheatsheet();
})();
