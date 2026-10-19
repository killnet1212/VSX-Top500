/* ============================================================
   common.js — общие утилиты для всех страниц VSX Top500
   Подключается первым: <script src="common.js"></script>
   ============================================================ */

(function () {
  "use strict";

  // ---------- Экранирование HTML ----------
  window.esc = function (s) {
    return String(s ?? "").replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  };

  // ---------- Копирование в буфер обмена ----------
  window.copyText = async function (text) {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return;
      }
    } catch {
      /* fall through to legacy path */
    }
    var ta = document.createElement("textarea");
    ta.value = text;
    ta.style.cssText = "position:fixed;opacity:0";
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand("copy");
    } finally {
      ta.remove();
    }
  };

  // ---------- Toast-уведомления ----------
  var _toastEl;
  window.toast = function (text) {
    if (!_toastEl) {
      _toastEl = document.createElement("div");
      _toastEl.className = "toast";
      document.body.appendChild(_toastEl);
    }
    _toastEl.textContent = text;
    _toastEl.classList.add("show");
    clearTimeout(_toastEl._t);
    _toastEl._t = setTimeout(function () { _toastEl.classList.remove("show"); }, 1800);
  };

  // ---------- Burger menu ----------
  window.toggleMobileNav = function (burgerBtn, mobileNav, mobileNavOverlay, open) {
    var isOpen = typeof open === "boolean" ? open : !mobileNav.classList.contains("open");
    mobileNav.classList.toggle("open", isOpen);
    mobileNavOverlay.classList.toggle("open", isOpen);
    burgerBtn.classList.toggle("open", isOpen);
    burgerBtn.setAttribute("aria-expanded", String(isOpen));
    document.body.style.overflow = isOpen ? "hidden" : "";
    return isOpen;
  };

  // ---------- Scroll to top ----------
  window.scrollTopSmooth = function () {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

})();
