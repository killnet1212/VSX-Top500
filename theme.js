/* ============================================================
   VSX Top500 — переключатель темы сайта (тёмная / светлая).
   Тема хранится в localStorage ("vsx_theme") и применяется
   атрибутом data-theme на <html>. На каждой странице в <head>
   стоит мини-скрипт, который ставит тему до первой отрисовки,
   чтобы не было «вспышки» неправильной темы.
   ============================================================ */

(() => {
  "use strict";

  const KEY = "vsx_theme";
  const root = document.documentElement;

  const current = () => (root.dataset.theme === "light" ? "light" : "dark");

  function apply(theme) {
    if (theme === "light") root.setAttribute("data-theme", "light");
    else root.removeAttribute("data-theme");

    document.querySelectorAll("[data-theme-btn]").forEach((btn) => {
      const label = window.I18N ? window.I18N.t(theme === "light" ? "theme.toDark" : "theme.toLight") : "";
      btn.setAttribute("aria-pressed", String(theme === "light"));
      if (label) {
        btn.title = label;
        btn.setAttribute("aria-label", label);
      }
    });
  }

  function set(theme) {
    try {
      localStorage.setItem(KEY, theme);
    } catch {
      /* localStorage may be unavailable */
    }
    apply(theme);
  }

  document.addEventListener("click", (ev) => {
    const btn = ev.target.closest("[data-theme-btn]");
    if (btn) set(current() === "light" ? "dark" : "light");
  });

  window.addEventListener("langchange", () => apply(current()));

  apply(current());
})();
