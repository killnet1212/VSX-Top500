/* ============================================================
   VSX Top500 — генератор .vscode/extensions.json
   Позволяет выбрать расширения и скачать готовый файл
   для папки .vscode/ в проекте.
   ============================================================ */

(() => {
  "use strict";

  const t = (key, vars) => window.I18N.t(key, vars);
  const lang = () => window.I18N.lang;

  // ---------- Данные ----------
  const API_URL = "https://marketplace.visualstudio.com/_apis/public/gallery/extensionquery";
  const TOP_N = 500;
  const FLAGS = 1 | 2 | 4 | 16 | 256 | 512;

  // ---------- Подборки (совпадают с app.js) ----------
  const kw = (...words) => {
    const lower = words.map((w) => w.toLowerCase());
    return (e) => {
      const hay = `${e.name} ${e.short} ${(e.tags || []).join(" ")} ${(e.categories || []).join(" ")} ${e.id}`.toLowerCase();
      return lower.some((w) => hay.includes(w));
    };
  };

  const COLLECTIONS = {
    all: () => true,
    python: (e) => (e.publisherId || "").toLowerCase() === "ms-python" || (e.id || "").toLowerCase().startsWith("ms-toolsai.jupyter") || (e.id || "").toLowerCase().includes("python") || (e.name || "").toLowerCase().includes("python"),
    web: kw("web", "html", "css", "react", "vue", "angular", "svelte", "tailwind", "next.js", "node", "javascript", "typescript"),
    ai: kw("ai", "artificial intelligence", "machine learning", "copilot", "gpt", "llm", "chatgpt", "openai", "gemini", "claude", "deepseek"),
    git: kw("git", "github", "gitlab", "prettier", "eslint", "format", "lint"),
    devops: kw("docker", "kubernetes", "devops", "aws", "azure", "terraform", "ansible", "remote", "ssh", "wsl", "container"),
    data: kw("sql", "database", "postgres", "mysql", "mongodb", "redis", "data", "pandas", "csv", "json", "graphql"),
    themes: kw("theme", "icon", "color", "font", "material"),
    testing: kw("test", "jest", "mocha", "cypress", "playwright", "selenium", "coverage", "debug"),
    format: kw("prettier", "eslint", "formatter", "beautify", "lint", "format", "stylelint", "black", "ruff"),
    autocomplete: kw("intellisense", "autocomplete", "autocompletion", "snippet", "tabnine", "codeium"),
    langs: kw("java", "c++", "c#", "golang", "rust", "php", "ruby", "kotlin", "swift", "dart", "lua", "scala", "elixir"),
    docs: kw("markdown", "mermaid", "docs", "diagram", "latex", "pdf", "drawio"),
  };

  // ---------- DOM ----------
  const grid = document.getElementById("genGrid");
  const searchInput = document.getElementById("genSearch");
  const collectionSelect = document.getElementById("genCollection");
  const countEl = document.getElementById("genCount");
  const downloadBtn = document.getElementById("genDownload");
  const copyJsonBtn = document.getElementById("genCopyJson");
  const copyCmdsBtn = document.getElementById("genCopyCmds");
  const selectVisibleBtn = document.getElementById("genSelectVisible");
  const clearAllBtn = document.getElementById("genClearAll");
  const fromFavsBtn = document.getElementById("genFromFavs");
  const emptyBox = document.getElementById("genEmpty");
  const preview = document.getElementById("genPreview");
  const jsonCode = document.getElementById("genJsonCode");
  const togglePreviewBtn = document.getElementById("genTogglePreview");

  // ---------- State ----------
  let extensions = [];
  let selected = new Set();
  let visibleList = [];
  let previewVisible = true;

  // ---------- Load data ----------
  async function fetchTop() {
    const body = {
      filters: [{
        criteria: [
          { filterType: 8, value: "Microsoft.VisualStudio.Code" },
          { filterType: 12, value: "4096" },
        ],
        pageNumber: 1, pageSize: TOP_N, sortBy: 4, sortOrder: 2,
      }],
      assetTypes: [], flags: FLAGS,
    };
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json;api-version=7.1-preview.1" },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    return (json.results?.[0]?.extensions || []).map((raw, i) => window.VSXNormalize.normalize(raw, i));
  }

  async function loadData() {
    // Сначала пробуем локальный top500.json
    try {
      const res = await fetch("top500.json?t=" + Date.now(), { cache: "no-store" });
      if (res.ok) {
        const json = await res.json();
        if (Array.isArray(json)) extensions = json;
        else if (Array.isArray(json.data)) extensions = json.data;
      }
    } catch { /* fall through */ }

    // Если не загрузилось — из API
    if (!extensions.length) {
      try { extensions = await fetchTop(); } catch { /* ignore */ }
    }

    // Загружаем избранное
    try {
      const favs = JSON.parse(localStorage.getItem("vsx_favorites") || "[]");
      favs.forEach((id) => selected.add(id.toLowerCase()));
    } catch { /* ignore */ }

    render();
  }

  // ---------- Filter ----------
  function getVisible() {
    const q = searchInput.value.trim().toLowerCase();
    const col = collectionSelect.value;
    const matcher = COLLECTIONS[col] || COLLECTIONS.all;

    visibleList = extensions.filter((e) => {
      if (!matcher(e)) return false;
      if (!q) return true;
      const hay = `${e.name} ${e.publisher} ${e.id} ${e.short}`.toLowerCase();
      return hay.includes(q);
    });
  }

  // ---------- Render ----------
  function render() {
    getVisible();
    grid.innerHTML = "";
    emptyBox.hidden = visibleList.length > 0;

    const frag = document.createDocumentFragment();
    visibleList.forEach((e, i) => {
      const lid = e.id.toLowerCase();
      const item = document.createElement("label");
      item.className = "gen-item" + (selected.has(lid) ? " selected" : "");
      item.style.setProperty("--i", Math.min(i, 40));
      item.dataset.id = lid;

      item.innerHTML = `
        <input type="checkbox" class="gen-check" ${selected.has(lid) ? "checked" : ""} />
        <span class="gen-icon">${e.icon ? `<img src="${esc(e.icon)}" alt="" loading="lazy" />` : ""}</span>
        <span class="gen-info">
          <b>${esc(e.name)}</b>
          <span class="gen-pub">${esc(e.publisher)}</span>
          <span class="gen-installs">⬇ ${fmtNum(e.installs)}</span>
        </span>
        <code class="gen-id">${esc(e.id)}</code>`;

      item.querySelector(".gen-check").addEventListener("change", (ev) => {
        if (ev.target.checked) selected.add(lid); else selected.delete(lid);
        item.classList.toggle("selected", ev.target.checked);
        updateStatus();
      });

      frag.appendChild(item);
    });
    grid.appendChild(frag);
    updateStatus();
  }

  function fmtNum(n) {
    if (n == null || isNaN(n)) return "—";
    if (n >= 1e6) return (n / 1e6).toFixed(1).replace(/\.?0+$/, "") + "M";
    if (n >= 1e3) return (n / 1e3).toFixed(1).replace(/\.?0+$/, "") + "K";
    return String(Math.round(n));
  }

  // ---------- Status & actions ----------
  function updateStatus() {
    countEl.textContent = selected.size;
    const has = selected.size > 0;
    downloadBtn.disabled = !has;
    copyJsonBtn.disabled = !has;
    copyCmdsBtn.disabled = !has;
    if (has && previewVisible) updatePreview();
    else if (!has) preview.hidden = true;
  }

  function buildJson() {
    return JSON.stringify({
      recommendations: [...selected].sort(),
      unwantedRecommendations: [],
    }, null, 2) + "\n";
  }

  function updatePreview() {
    if (!selected.size) { preview.hidden = true; return; }
    const json = buildJson();
    jsonCode.textContent = json;
    preview.hidden = !previewVisible;
  }

  // ---------- Download ----------
  function downloadFile(content, filename, mime) {
    const blob = new Blob([content], { type: mime || "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  }

  downloadBtn.addEventListener("click", () => {
    downloadFile(buildJson(), "extensions.json", "application/json");
    toast(t("gen.downloaded"));
  });

  copyJsonBtn.addEventListener("click", () => {
    window.copyText(buildJson()).then(() => toast(t("gen.copiedJson")));
  });

  copyCmdsBtn.addEventListener("click", () => {
    const cmds = [...selected].map((id) => `code --install-extension ${id}`).join("\n");
    window.copyText(cmds).then(() => toast(t("gen.copiedCmds")));
  });

  // ---------- Batch buttons ----------
  selectVisibleBtn.addEventListener("click", () => {
    visibleList.forEach((e) => selected.add(e.id.toLowerCase()));
    render();
  });

  clearAllBtn.addEventListener("click", () => {
    selected.clear();
    render();
  });

  fromFavsBtn.addEventListener("click", () => {
    try {
      const favs = JSON.parse(localStorage.getItem("vsx_favorites") || "[]");
      favs.forEach((id) => selected.add(id.toLowerCase()));
      render();
      toast(t("gen.favsAdded"));
    } catch { /* ignore */ }
  });

  togglePreviewBtn.addEventListener("click", () => {
    previewVisible = !previewVisible;
    if (!previewVisible) preview.hidden = true;
    else updatePreview();
    togglePreviewBtn.textContent = previewVisible ? t("gen.hide") : t("gen.show");
  });

  // ---------- Events ----------
  let searchTimer;
  searchInput.addEventListener("input", () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(render, 120);
  });
  collectionSelect.addEventListener("change", render);
  document.getElementById("scrollTop").addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

  window.addEventListener("langchange", () => {
    render();
    updateStatus();
  });

  // ---------- Init ----------
  loadData();
})();
