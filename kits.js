/* ============================================================
   VSX Top500 — страница «Наборы» (kits.html)
   Готовые наборы расширений для старта: один клик — и все
   команды установки в буфере. Расширения можно ставить пачкой
   через терминал: code --install-extension publisher.name
   ============================================================ */

(() => {
  "use strict";

  const t = (key, vars) => window.I18N.t(key, vars);
  const lang = () => window.I18N.lang;
  const esc = (s) =>
    String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  // Данные наборов вынесены в kits-data.js, чтобы и подбор за 3 вопроса
  // мог использовать тот же источник. Если модуль не загрузился —
  // используем пустой массив (тесты без kits-data.js).
  const KITS = window.VSX_KITS || [];

  // ---------- DOM ----------
  const grid = document.getElementById("kitsGrid");
  const countEl = document.getElementById("kitCount");

  const cmdFor = (id) => `code --install-extension ${id}`;
  const cmdsFor = (kit) => kit.plugins.map((p) => cmdFor(p.id)).join("\n");

  // ---------- Render ----------
  function render() {
    const lg = lang();
    grid.innerHTML = "";
    countEl.textContent = t("kits.count", { n: KITS.length });

    const frag = document.createDocumentFragment();
    KITS.forEach((kit, i) => {
      const card = document.createElement("article");
      card.className = "kit-card";
      card.style.setProperty("--i", Math.min(i, 20));

      const pluginsHtml = kit.plugins
        .map(
          (p) => `
        <li class="kit-plugin">
          <div class="kit-plugin-text">
            <b>${esc(p.name)}</b> <code>${esc(p.id)}</code>
            <span>${esc(p.desc[lg] || p.desc.ru)}</span>
          </div>
          <button class="kit-copy-one" type="button" data-cmd="${esc(cmdFor(p.id))}" title="${esc(t("kits.copyOne"))}" aria-label="${esc(t("kits.copyOne"))}">
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
          </button>
        </li>`
        )
        .join("");

      card.innerHTML = `
        <div class="kit-head">
          <span class="kit-icon" aria-hidden="true">${kit.icon}</span>
          <div class="kit-titles">
            <h2>${esc(kit.title[lg] || kit.title.ru)}</h2>
            <p>${esc(kit.desc[lg] || kit.desc.ru)}</p>
          </div>
          <span class="kit-count">${esc(t("kits.plugins", { n: kit.plugins.length }))}</span>
        </div>
        <ul class="kit-list">${pluginsHtml}</ul>
        <div class="kit-foot">
          <button class="btn btn-primary kit-copy-all" type="button">${esc(t("kits.copyAll"))}</button>
          <a class="btn btn-ghost" href="index.html#rating">${esc(t("kits.openRating"))}</a>
        </div>`;

      card.querySelector(".kit-copy-all").addEventListener("click", () => {
        copyText(cmdsFor(kit)).then(() => toast(t("kits.copiedAll")));
      });

      frag.appendChild(card);
    });
    grid.appendChild(frag);
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
  grid.addEventListener("click", (ev) => {
    const one = ev.target.closest(".kit-copy-one");
    if (one) {
      copyText(one.dataset.cmd).then(() => toast(t("toast.copied")));
    }
  });

  window.addEventListener("langchange", render);

  document.getElementById("scrollTop").addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

  // ---------- Init ----------
  render();
})();
