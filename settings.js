/* ============================================================
   VSX Top500 — страница «Настройки» (settings.html)
   Готовые settings.json, примеры keybindings.json и проверенные
   темы оформления. Всё копируется одной кнопкой.
   ============================================================ */

(() => {
  "use strict";

  const t = (key, vars) => window.I18N.t(key, vars);
  const lang = () => window.I18N.lang;
  const esc = (s) =>
    String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  // Переключатель Windows/Mac (platform.js): переписывает сочетания в примерах.
  const PLAT = window.VSXPlatform || { k: (s) => s, json: (s) => s, apply: () => {} };

  // ---------- Готовые settings.json ----------
  const SETTINGS = [
    {
      id: "base",
      icon: "🧰",
      title: { ru: "Базовый — для любого проекта", en: "Base — for any project" },
      desc: {
        ru: "Читаемый шрифт, автосохранение, форматирование при сохранении и минимум отвлекающих элементов.",
        en: "A readable font, autosave, format-on-save and minimal distractions.",
      },
      json: `{
  "editor.fontSize": 15,
  "editor.fontFamily": "'JetBrains Mono', Consolas, monospace",
  "editor.fontLigatures": true,
  "editor.tabSize": 2,
  "editor.formatOnSave": true,
  "files.autoSave": "afterDelay",
  "editor.wordWrap": "on",
  "editor.minimap.enabled": false,
  "workbench.startupEditor": "none",
  "explorer.confirmDragAndDrop": false
}`,
    },
    {
      id: "web",
      icon: "🌐",
      title: { ru: "Веб-разработка", en: "Web development" },
      desc: {
        ru: "Prettier как форматтер по умолчанию, автофиксы ESLint при сохранении и Emmet для JSX.",
        en: "Prettier as the default formatter, ESLint autofixes on save and Emmet for JSX.",
      },
      json: `{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },
  "emmet.includeLanguages": { "javascript": "javascriptreact" },
  "javascript.updateImportsOnFileMove.enabled": "always",
  "typescript.updateImportsOnFileMove.enabled": "always",
  "html.autoClosingTags": true
}`,
    },
    {
      id: "python",
      icon: "🐍",
      title: { ru: "Python", en: "Python" },
      desc: {
        ru: "Ruff как линтер и форматтер, организация импортов и строгая проверка типов Pylance.",
        en: "Ruff as linter and formatter, import sorting and stricter Pylance type checking.",
      },
      json: `{
  "[python]": {
    "editor.defaultFormatter": "charliermarsh.ruff",
    "editor.formatOnSave": true,
    "editor.codeActionsOnSave": {
      "source.fixAll": "explicit",
      "source.organizeImports": "explicit"
    }
  },
  "python.analysis.typeCheckingMode": "basic",
  "python.analysis.autoImportCompletions": true,
  "jupyter.askForKernelRestart": false
}`,
    },
  ];

  // ---------- Примеры keybindings.json ----------
  const KEYS = [
    {
      id: "keys",
      icon: "⌨️",
      isKeys: true,
      title: { ru: "keybindings.json — стартовый набор", en: "keybindings.json — starter set" },
      desc: {
        ru: "Новый терминал, форматирование, дублирование строки и откат файла — на удобных сочетаниях.",
        en: "New terminal, formatting, line duplication and file revert — on convenient keys.",
      },
      json: `[
  { "key": "ctrl+alt+t", "command": "workbench.action.terminal.new" },
  { "key": "ctrl+alt+f", "command": "editor.action.formatDocument", "when": "editorTextFocus" },
  { "key": "ctrl+alt+d", "command": "editor.action.copyLinesDownAction", "when": "editorTextFocus" },
  { "key": "ctrl+alt+r", "command": "workbench.action.files.revert" }
]`,
    },
  ];

  // ---------- Темы ----------
  // bg/fg/accent* — реальные палитры тем: по ним рисуется мини-редактор
  // и набор цветных плашек, чтобы тему можно было выбрать глазами, а не по названию.
  const THEMES = [
    {
      id: "zhuangtongfa.material-theme",
      name: "One Dark Pro",
      desc: { ru: "Классика из Atom — спокойные цвета, тёмный фон", en: "An Atom classic — calm colours, dark background" },
      palette: { bg: "#282c34", panel: "#21252b", fg: "#abb2bf", a1: "#61afef", a2: "#98c379", a3: "#c678dd", a4: "#e06c75", a5: "#d19a66" },
    },
    {
      id: "dracula-theme.theme-dracula",
      name: "Dracula Official",
      desc: { ru: "Контрастная тёмная тема с яркими акцентами", en: "A contrasty dark theme with bright accents" },
      palette: { bg: "#282a36", panel: "#21222c", fg: "#f8f8f2", a1: "#8be9fd", a2: "#50fa7b", a3: "#bd93f9", a4: "#ff79c6", a5: "#f1fa8c" },
    },
    {
      id: "github.github-vscode-theme",
      name: "GitHub Theme",
      desc: { ru: "Как на GitHub — светлый и тёмный варианты", en: "Just like GitHub — light and dark variants" },
      light: true,
      palette: { bg: "#ffffff", panel: "#f6f8fa", fg: "#24292f", a1: "#0969da", a2: "#1a7f37", a3: "#8250df", a4: "#cf222e", a5: "#9a6700" },
    },
    {
      id: "catppuccin.catppuccin-vsc",
      name: "Catppuccin",
      desc: { ru: "Мягкая пастельная тема, четыре варианта", en: "A soft pastel theme with four flavours" },
      palette: { bg: "#1e1e2e", panel: "#181825", fg: "#cdd6f4", a1: "#89b4fa", a2: "#a6e3a1", a3: "#f5c2e7", a4: "#fab387", a5: "#94e2d5" },
    },
    {
      id: "enkia.tokyo-night",
      name: "Tokyo Night",
      desc: { ru: "Неоновые огни ночного Токио", en: "Neon lights of Tokyo at night" },
      palette: { bg: "#1a1b26", panel: "#16161e", fg: "#a9b1d6", a1: "#7aa2f7", a2: "#9ece6a", a3: "#bb9af7", a4: "#f7768e", a5: "#e0af68" },
    },
    {
      id: "sdras.night-owl",
      name: "Night Owl",
      desc: { ru: "Тема Сары Драс для тех, кто кодит ночью", en: "Sarah Drasner's theme for night coders" },
      palette: { bg: "#011627", panel: "#0e2a39", fg: "#d6deeb", a1: "#82aaff", a2: "#c5e478", a3: "#c792ea", a4: "#ef5350", a5: "#fac863" },
    },
  ];

  // ---------- DOM ----------
  const jsonGrid = document.getElementById("jsonGrid");
  const keysGrid = document.getElementById("keysGrid");
  const themesGrid = document.getElementById("themesGrid");

  // ---------- Render ----------
  function configCard(item) {
    const lg = lang();
    const card = document.createElement("article");
    card.className = "config-card";
    // keybindings.json: на Mac ctrl → cmd, чтобы пример был рабочим сразу.
    const shown = item.isKeys ? PLAT.json(item.json) : item.json;
    card.innerHTML = `
      <div class="config-head">
        <span class="config-icon" aria-hidden="true">${item.icon}</span>
        <div class="config-titles">
          <h3>${esc(item.title[lg] || item.title.ru)}</h3>
          <p>${esc(item.desc[lg] || item.desc.ru)}</p>
        </div>
      </div>
      <pre class="config-code"><code>${esc(shown)}</code></pre>
      <div class="config-foot">
        <button class="btn btn-primary config-copy" type="button">${esc(t("settings.copy"))}</button>
      </div>`;
    card.querySelector(".config-copy").addEventListener("click", () => {
      copyText(shown).then(() => toast(t("settings.copied")));
    });
    return card;
  }

  // Мини-редактор в палитре темы: цвета берутся из реальной палитры,
  // поэтому превью показывает характер темы, а не абстрактную картинку.
  function themePreview(p) {
    const code = [
      `<span style="color:${p.a3}">function</span> <span style="color:${p.a1}">install</span>(<span style="color:${p.a5}">id</span>) {`,
      `  <span style="color:${p.a4}">// проверка</span>`,
      `  <span style="color:${p.a3}">return</span> <span style="color:${p.a2}">"code --install-extension "</span> + id;`,
      `}`,
    ];
    const swatches = ["bg", "panel", "fg", "a1", "a2", "a3", "a4", "a5"]
      .map((k) => `<i style="background:${p[k]}" title="${esc(p[k])}"></i>`)
      .join("");
    return `
      <div class="theme-preview" style="background:${p.bg};border-color:${p.panel}" aria-hidden="true">
        <div class="tp-bar" style="background:${p.panel}">
          <span style="background:#ff5f57"></span><span style="background:#febc2e"></span><span style="background:#28c840"></span>
          <em style="color:${p.fg};opacity:.65">settings.json</em>
        </div>
        <pre class="tp-code" style="color:${p.fg}">${code.map((l) => `<span>${l}</span>`).join("")}</pre>
        <div class="tp-status" style="background:${p.a1}">main · UTF-8</div>
      </div>
      <div class="theme-swatches" aria-hidden="true">${swatches}</div>`;
  }

  function themeCard(th) {
    const lg = lang();
    const card = document.createElement("article");
    card.className = "theme-card";
    card.innerHTML = `
      ${th.palette ? themePreview(th.palette) : ""}
      <div class="theme-name">
        <span class="theme-dot" aria-hidden="true" style="background:${th.palette ? th.palette.a1 : "var(--accent)"}"></span>
        <b>${esc(th.name)}</b>
        ${th.light ? `<span class="chip">${esc(t("settings.themeLight"))}</span>` : ""}
      </div>
      <p>${esc(th.desc[lg] || th.desc.ru)}</p>
      <code class="theme-id">${esc(th.id)}</code>
      <div class="theme-actions">
        <button class="btn btn-ghost theme-copy" type="button">${esc(t("settings.copy"))}</button>
        <a class="btn btn-ghost" href="https://marketplace.visualstudio.com/items?itemName=${esc(th.id)}" target="_blank" rel="noopener">Marketplace</a>
      </div>`;
    card.querySelector(".theme-copy").addEventListener("click", () => {
      copyText(`code --install-extension ${th.id}`).then(() => toast(t("settings.copied")));
    });
    return card;
  }

  function render() {
    jsonGrid.innerHTML = "";
    SETTINGS.forEach((s) => jsonGrid.appendChild(configCard(s)));

    keysGrid.innerHTML = "";
    KEYS.forEach((k) => keysGrid.appendChild(configCard(k)));

    themesGrid.innerHTML = "";
    THEMES.forEach((th) => themesGrid.appendChild(themeCard(th)));
    PLAT.apply(document);
  }

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

  // ---------- Events ----------
  window.addEventListener("langchange", render);

  document.getElementById("scrollTop").addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

  // ---------- Init ----------
  render();
})();
