/* ============================================================
   VSX Top500 — страница «Разработчики» (publishers.html)
   Каталог создателей расширений VS Code. Клик по карточке
   открывает модалку со всеми расширениями разработчика:
   иконка, рейтинг, установки и команда установки.
   Логотипы: SimpleIcons → фавикон домена → иконка флагмана → буква.
   ============================================================ */

(() => {
  "use strict";

  const t = (key, vars) => window.I18N.t(key, vars);
  const lang = () => window.I18N.lang;
  const esc = (s) =>
    String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  const fmtNum = (n) => {
    if (n == null || isNaN(n)) return "—";
    const ru = lang() === "ru";
    if (n >= 1e6) return (n / 1e6).toFixed(1).replace(/\.?0+$/, "") + (ru ? " млн" : "M");
    if (n >= 1e3) return (n / 1e3).toFixed(1).replace(/\.?0+$/, "") + (ru ? " тыс." : "K");
    return String(Math.round(n));
  };

  // ---------- Данные ----------
  let allPublishers = [];
  let dataLoaded = false;

  // Ручные соответствия SimpleIcons для крупных брендов,
  // где slug ≠ имя издателя или бренд убрали из набора.
  const ICON_SLUGS = {
    github: "github",
    google: "google",
    docker: "docker",
    "red hat": "redhat",
    atlassian: "atlassian",
    mongodb: "mongodb",
    elastic: "elastic",
    salesforce: "salesforce",
    slack: "slack",
    ms: "visualstudiocode",
    "ms-kubernetes-tools": "kubernetes",
    "ms-python": "python",
    "ms-vscode": "visualstudiocode",
    "ms-toolsai": "jupyter",
    "ms-dotnettools": "dotnet",
    "ms-azuretools": "azure",
    "ms-python.vscode-pylance": "python",
  };

  function logoChain(p) {
    const chain = [];
    const key = (p.name || "").toLowerCase();
    const slug = ICON_SLUGS[key] || (p.verified ? key.replace(/[^a-z0-9]/g, "") : "");
    if (slug && slug.length > 2) chain.push(`https://cdn.simpleicons.org/${slug}/ffffff`);
    if (p.domain) {
      const d = p.domain.replace(/^https?:\/\//, "").replace(/\/.*$/, "");
      chain.push(
        `https://icon.horse/icon/${d}`,
        `https://www.google.com/s2/favicons?domain=${d}&sz=128`,
        `https://icons.duckduckgo.com/ip3/${d}.ico`
      );
    }
    if (p.topIcon) chain.push(p.topIcon);
    return chain;
  }

  // Ставим картинку с цепочкой запасных вариантов.
  function attachLogo(img, fallbackEl, chain) {
    if (!chain.length) {
      img.style.display = "none";
      fallbackEl.style.display = "flex";
      return;
    }
    let i = 0;
    img.addEventListener("error", () => {
      i++;
      if (i < chain.length) img.src = chain[i];
      else {
        img.style.display = "none";
        fallbackEl.style.display = "flex";
      }
    });
    img.src = chain[0];
  }

  async function loadData() {
    if (dataLoaded) return;
    try {
      const res = await fetch("top500.json");
      const json = await res.json();
      const arr = json.data || json;
      if (!Array.isArray(arr)) return;

      const map = new Map();
      arr.forEach((e) => {
        const pub = map.get(e.publisher) || {
          name: e.publisher,
          id: e.publisherId || e.publisher,
          verified: e.verified || false,
          domain: e.domain || "",
          count: 0,
          installs: 0,
          ratingSum: 0,
          ratingN: 0,
          topIcon: "",
          topInstalls: -1,
          exts: [],
        };
        pub.count++;
        pub.installs += e.installs || 0;
        if (e.rating) {
          pub.ratingSum += e.rating;
          pub.ratingN++;
        }
        if ((e.installs || 0) > pub.topInstalls) {
          pub.topInstalls = e.installs || 0;
          pub.topIcon = e.icon || "";
        }
        pub.exts.push(e);
        map.set(e.publisher, pub);
      });

      allPublishers = Array.from(map.values())
        .map((p) => ({
          ...p,
          avgRating: p.ratingN ? (p.ratingSum / p.ratingN).toFixed(1) : null,
          exts: p.exts.sort((a, b) => (b.installs || 0) - (a.installs || 0)),
        }))
        .sort((a, b) => b.installs - a.installs);
      dataLoaded = true;
      renderFilters();
      render();
    } catch {
      const empty = document.getElementById("pubsEmpty");
      empty.hidden = false;
      empty.textContent = t("pubs.loadFailed");
    }
  }

  loadData();

  // ---------- Фильтры ----------
  const FILTERS = [
    { id: "all", labelKey: "pubs.filter.all" },
    { id: "verified", labelKey: "pubs.filter.verified" },
    { id: "popular", labelKey: "pubs.filter.popular" },
  ];

  let activeFilter = "all";
  let showCount = 24;
  const STEP = 24;

  function filterCount(id) {
    if (id === "verified") return allPublishers.filter((p) => p.verified).length;
    if (id === "popular") return allPublishers.filter((p) => p.count >= 5).length;
    return allPublishers.length;
  }

  function renderFilters() {
    const el = document.getElementById("pubsFilters");
    el.innerHTML = "";
    FILTERS.forEach((f) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "pubs-filter-chip" + (f.id === activeFilter ? " active" : "");
      btn.innerHTML = `${esc(t(f.labelKey))} <span class="pubs-filter-count">${filterCount(f.id)}</span>`;
      btn.addEventListener("click", () => {
        activeFilter = f.id;
        showCount = STEP;
        renderFilters();
        render();
      });
      el.appendChild(btn);
    });
  }

  function getFiltered() {
    if (activeFilter === "verified") return allPublishers.filter((p) => p.verified);
    if (activeFilter === "popular") return allPublishers.filter((p) => p.count >= 5);
    return allPublishers;
  }

  // ---------- Сетка карточек ----------
  function render() {
    const filtered = getFiltered();
    const grid = document.getElementById("pubsGrid");
    const countEl = document.getElementById("pubsCount");
    const moreWrap = document.getElementById("pubsMoreWrap");
    const moreBtn = document.getElementById("pubsMoreBtn");

    grid.innerHTML = "";
    countEl.textContent = t("pubs.count", { n: filtered.length });

    const list = filtered.slice(0, showCount);
    const frag = document.createDocumentFragment();

    list.forEach((p, i) => {
      const card = document.createElement("button");
      card.type = "button";
      card.className = "pubs-card";
      card.style.setProperty("--i", Math.min(i, 20));

      card.innerHTML = `
        <div class="pubs-card-header">
          <div class="pubs-logo-wrap">
            <img class="pubs-logo" alt="" loading="lazy" />
            <div class="pubs-logo-fallback">${esc(p.name.charAt(0).toUpperCase())}</div>
          </div>
          <div class="pubs-card-meta">
            <h3 class="pubs-name">${esc(p.name)}${p.verified ? `<span class="pubs-verified" title="${esc(t("card.verified"))}">✓</span>` : ""}</h3>
            <div class="pubs-stats">
              <span class="pubs-stat pubs-stat--ext"><b>${p.count}</b> ${t("pubs.stats.ext")}</span>
              <span class="pubs-stat pubs-stat--installs"><b>${fmtNum(p.installs)}</b> ${t("pubs.stats.installs")}</span>
              ${p.avgRating ? `<span class="pubs-stat pubs-stat--rating"><b>★</b> ${p.avgRating}</span>` : ""}
            </div>
            <div class="pubs-exts"><span class="muted">${esc(p.exts.slice(0, 4).map((e) => e.name).join(", "))}</span></div>
            <span class="pubs-card-cta">${esc(t("pubs.openList"))}</span>
          </div>
        </div>`;

      attachLogo(card.querySelector(".pubs-logo"), card.querySelector(".pubs-logo-fallback"), logoChain(p));

      // Мягкое свечение под курсором
      card.addEventListener("pointermove", (ev) => {
        const r = card.getBoundingClientRect();
        card.style.setProperty("--mx", `${ev.clientX - r.left}px`);
        card.style.setProperty("--my", `${ev.clientY - r.top}px`);
      });

      card.addEventListener("click", () => openPubModal(p));
      frag.appendChild(card);
    });

    grid.appendChild(frag);

    if (showCount < filtered.length) {
      moreWrap.hidden = false;
      moreBtn.textContent = t("pubs.showMore", { n: filtered.length - showCount });
    } else {
      moreWrap.hidden = true;
    }
  }

  // ---------- Модалка разработчика ----------
  const modal = document.getElementById("pubModal");
  const modalContent = document.getElementById("pubModalContent");
  const MAX_ROWS = 40;

  function openPubModal(p) {
    const lg = lang();
    const rows = p.exts.slice(0, MAX_ROWS);
    const rowsHtml = rows
      .map(
        (e) => `
      <div class="pubm-ext">
        <div class="pubm-ext-icon">${e.icon ? `<img src="${esc(e.icon)}" alt="" loading="lazy" />` : esc(e.name.charAt(0))}</div>
        <div class="pubm-ext-body">
          <a class="pubm-ext-name" href="index.html#ext=${esc(e.id)}">${esc(e.name)}${e.verified ? ' <span class="pubs-verified">✓</span>' : ""}</a>
          <div class="pubm-ext-meta">
            <span>⬇ ${fmtNum(e.installs)}</span>
            <span>${e.rating ? `★ ${e.rating.toFixed(1)} (${fmtNum(e.ratingCount)})` : "★ —"}</span>
            <span class="muted">#${e.rank}</span>
          </div>
        </div>
        <div class="pubm-ext-actions">
          <button class="pubm-copy" type="button" data-copy-cmd="code --install-extension ${esc(e.id)}" title="${esc(t("pubs.modal.copy"))}" aria-label="${esc(t("pubs.modal.copy"))}">
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
          </button>
          <a class="pubm-open" href="index.html#ext=${esc(e.id)}" title="${esc(t("pubs.modal.open"))}">
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><path d="M15 3h6v6"/><path d="M10 14 21 3"/></svg>
          </a>
        </div>
      </div>`
      )
      .join("");

    const allCmd = p.exts.map((e) => `code --install-extension ${e.id}`).join("\n");

    modalContent.innerHTML = `
      <div class="pubm-head">
        <div class="pubs-logo-wrap pubm-logo">
          <img class="pubs-logo" alt="" />
          <div class="pubs-logo-fallback">${esc(p.name.charAt(0).toUpperCase())}</div>
        </div>
        <div class="pubm-titles">
          <h2 class="pubm-name" id="pubModalTitle">${esc(p.name)}${p.verified ? `<span class="pubs-verified" title="${esc(t("card.verified"))}">✓</span>` : ""}</h2>
          <div class="pubs-stats">
            <span class="pubs-stat pubs-stat--ext"><b>${p.count}</b> ${t("pubs.stats.ext")}</span>
            <span class="pubs-stat pubs-stat--installs"><b>${fmtNum(p.installs)}</b> ${t("pubs.stats.installs")}</span>
            ${p.avgRating ? `<span class="pubs-stat pubs-stat--rating"><b>★</b> ${p.avgRating}</span>` : ""}
          </div>
        </div>
      </div>
      <div class="pubm-toolbar">
        <button class="btn btn-primary" type="button" data-copy-all>${esc(t("pubs.modal.installAll"))}</button>
        <a class="btn btn-ghost" href="index.html#rating&publisher=${encodeURIComponent(p.id)}">${esc(t("pubs.modal.viewAll"))}</a>
      </div>
      ${p.count > MAX_ROWS ? `<p class="muted pubm-note">${esc(t("pubs.modal.top", { n: MAX_ROWS }))}</p>` : ""}
      <div class="pubm-list">${rowsHtml}</div>
      <textarea data-all-cmd hidden>${esc(allCmd)}</textarea>`;

    attachLogo(modalContent.querySelector(".pubm-logo .pubs-logo"), modalContent.querySelector(".pubm-logo .pubs-logo-fallback"), logoChain(p));

    modal.classList.add("open");
    document.body.style.overflow = "hidden";
  }

  function closePubModal() {
    modal.classList.remove("open");
    document.body.style.overflow = "";
  }

  modal.addEventListener("click", (ev) => {
    if (ev.target.closest("[data-pub-close]")) {
      closePubModal();
      return;
    }
    const copyOne = ev.target.closest("[data-copy-cmd]");
    if (copyOne) {
      ev.preventDefault();
      copyText(copyOne.dataset.copyCmd).then(() => toast(t("toast.copied")));
      return;
    }
    const copyAll = ev.target.closest("[data-copy-all]");
    if (copyAll) {
      const ta = modalContent.querySelector("[data-all-cmd]");
      if (ta) copyText(ta.value).then(() => toast(t("pubs.modal.allCopied")));
    }
  });

  document.addEventListener("keydown", (ev) => {
    if (ev.key === "Escape" && modal.classList.contains("open")) closePubModal();
  });

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
  document.getElementById("pubsMoreBtn").addEventListener("click", () => {
    showCount += STEP;
    render();
  });

  window.addEventListener("langchange", () => {
    renderFilters();
    render();
  });

  document.getElementById("scrollTop").addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
})();
