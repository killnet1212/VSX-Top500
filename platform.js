/* ============================================================
   VSX Top500 — переключатель платформы (Windows/Linux ↔ Mac).
   Сочетания клавиш на сайте записаны для Windows (Ctrl), на Mac
   те же команды живут под Cmd. Модуль переписывает клавиши на
   лёту и вешает переключатель в шапку каждой страницы.

   Настройка хранится в localStorage ("vsx_platform").
   Публичный API: window.VSXPlatform
     get() / set(p) / toggle() / isMac() / label()
     k(text)      — «Ctrl + D»  → «⌘ D»
     json(text)   — keybindings.json: "ctrl+alt+t" → "cmd+alt+t"
     apply(root)  — пройтись по странице и переписать клавиши
     onChange(fn) — подписка на смену платформы
   ============================================================ */

(() => {
  "use strict";

  const KEY = "vsx_platform";
  const MAC = "mac";
  const WIN = "win";

  // ---------- Определение платформы по умолчанию ----------
  function detect() {
    try {
      const saved = localStorage.getItem(KEY);
      if (saved === MAC || saved === WIN) return saved;
    } catch {
      /* localStorage may be unavailable */
    }
    const ua = navigator.userAgentData || {};
    const platform = (ua.platform || navigator.platform || navigator.userAgent || "").toLowerCase();
    return /mac|iphone|ipad|ipod/.test(platform) ? MAC : WIN;
  }

  let current = detect();
  const listeners = new Set();

  // ---------- Преобразование сочетаний ----------
  // На Mac: Ctrl → ⌘, Alt → ⌥, Shift → ⇧.
  // Часть команд на macOS остаётся на Control (терминал, навигация по документу) —
  // для них список исключений ниже.
  const MAC_TOKENS = { ctrl: "⌘", alt: "⌥", shift: "⇧", meta: "⌘", cmd: "⌘", command: "⌘" };

  // Клавиши, которые на macOS жмут вместе с Control, а не Command.
  const KEEP_CTRL_KEYS = ["`", "home", "end", "pageup", "pagedown", "page up", "page down", "insert", "delete"];

  function keepsControl(nextKey) {
    const nk = nextKey.trim().toLowerCase();
    return !!nk && KEEP_CTRL_KEYS.some((k2) => nk.startsWith(k2));
  }

  function k(text) {
    const s = String(text ?? "");
    if (current !== MAC) return s;
    if (!/\b(ctrl|control|alt|shift|cmd|command)\b/i.test(s)) return s;

    // Модификатор + разделитель + следующая клавиша. Слова в обычном тексте
    // не трогаем — только сочетания вида «Ctrl+D», «Shift + Alt + ↑/↓».
    return s.replace(/\b(ctrl|control|alt|shift|cmd|command)\b(\s*[+/→]?\s*)(\S*)/gi, (m, mod, sep, next) => {
      const name = mod.toLowerCase() === "control" ? "ctrl" : mod.toLowerCase();
      if (name === "ctrl" && keepsControl(next)) return "⌃" + sep + next;
      return (MAC_TOKENS[name] || mod) + sep + next;
    });
  }

  // keybindings.json: "ctrl+alt+t" → "cmd+alt+t"
  function json(text) {
    const s = String(text ?? "");
    if (current !== MAC) return s;
    return s.replace(/\bctrl\+/g, "cmd+");
  }

  // ---------- Применение к странице ----------
  const original = new WeakMap();

  function rewriteKbd(el) {
    if (!original.has(el)) original.set(el, el.textContent);
    el.textContent = k(original.get(el));
  }

  // Элементы с data-i18n*: берём строку из словаря, чтобы замены не накапливались,
  // и переписываем только те, где вообще есть модификаторы.
  const I18N_ATTRS = [
    ["data-i18n", "textContent"],
    ["data-i18n-placeholder", "placeholder"],
    ["data-i18n-title", "title"],
    ["data-i18n-aria", "aria-label"],
  ];

  function rewriteI18n(el) {
    const I18N = window.I18N;
    if (!I18N || !I18N.t) return;
    for (const [attr, prop] of I18N_ATTRS) {
      if (!el.hasAttribute(attr)) continue;
      const raw = I18N.t(el.getAttribute(attr));
      if (!/\b(ctrl|alt|shift)\b/i.test(raw)) return;
      el[prop] = k(raw);
      return;
    }
  }

  function apply(root) {
    const scope = root && root.querySelectorAll ? root : document;
    scope.querySelectorAll("kbd, .kbd, [data-i18n], [data-i18n-placeholder], [data-i18n-title], [data-i18n-aria]").forEach((el) => {
      if (el.matches("kbd, .kbd")) rewriteKbd(el);
      else rewriteI18n(el);
    });
  }

  // ---------- Переключатель в шапке ----------
  function injectToggle() {
    const nav = document.querySelector(".header-nav");
    if (!nav || nav.querySelector("[data-plat-switch]")) return;
    const tr = (key, fallback) => (window.I18N ? window.I18N.t(key) : fallback);

    const wrap = document.createElement("div");
    wrap.className = "lang-switch plat-switch";
    wrap.dataset.platSwitch = "";
    wrap.setAttribute("role", "group");
    wrap.setAttribute("aria-label", tr("platform.label", "Платформа"));
    wrap.innerHTML = `
      <button class="lang-btn plat-btn" type="button" data-plat-btn="win" title="${tr("platform.winTitle", "Сочетания клавиш для Windows и Linux")}">Win</button>
      <button class="lang-btn plat-btn" type="button" data-plat-btn="mac" title="${tr("platform.macTitle", "Сочетания клавиш для macOS")}">Mac</button>`;
    const langSwitch = nav.querySelector(".lang-switch");
    if (langSwitch) nav.insertBefore(wrap, langSwitch);
    else nav.appendChild(wrap);
    syncToggle();
  }

  function syncToggle() {
    document.querySelectorAll("[data-plat-btn]").forEach((b) => {
      const on = b.dataset.platBtn === current;
      b.classList.toggle("active", on);
      b.setAttribute("aria-pressed", String(on));
    });
  }

  document.addEventListener("click", (ev) => {
    const btn = ev.target.closest("[data-plat-btn]");
    if (btn) set(btn.dataset.platBtn);
  });

  // ---------- Смена платформы ----------
  function set(platform) {
    const next = platform === MAC ? MAC : WIN;
    if (next === current) return;
    current = next;
    try {
      localStorage.setItem(KEY, current);
    } catch {
      /* localStorage may be unavailable */
    }
    syncToggle();
    apply(document);
    listeners.forEach((fn) => fn(current));
    window.dispatchEvent(new CustomEvent("platformchange", { detail: { platform: current } }));
  }

  window.VSXPlatform = {
    get: () => current,
    set,
    toggle: () => set(current === MAC ? WIN : MAC),
    isMac: () => current === MAC,
    label: () => (current === MAC ? "macOS" : "Windows / Linux"),
    k,
    json,
    apply,
    onChange: (fn) => {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
  };

  window.addEventListener("langchange", () => {
    injectToggle();
    apply(document);
  });

  function boot() {
    injectToggle();
    apply(document);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
