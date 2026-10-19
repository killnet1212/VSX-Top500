/* ============================================================
   VSX Top500 — страница «Уроки» (lessons.html)
   Видео-подборка про VS Code и лучшие расширения.
   Превью берутся с i.ytimg.com, ссылки ведут на YouTube.
   ============================================================ */

(() => {
  "use strict";

  const t = (key, vars) => window.I18N.t(key, vars);
  const lang = () => window.I18N.lang;
  // esc — из common.js

  // ---------- Подборка уроков ----------
  // yt — ID видео на YouTube (проверены), lang — язык видео, topic — тема.
  const LESSONS = [
    {
      yt: "nxCLXMBl4e4",
      lang: "ru",
      topic: "setup",
      author: "Фрілансер по життю",
      title: "VS Code: настройка, установка, плагины — подробный гайд за час",
      views: "1.2M",
    },
    {
      yt: "2xuUldhwA0w",
      lang: "ru",
      topic: "extensions",
      author: "Уроки Java и Visual Studio",
      title: "Лучшие VS Code расширения — ТОП-10 крутых плагинов",
    },
    {
      yt: "SE0_wdokumg",
      lang: "ru",
      topic: "basics",
      author: "Андрей Шопинский",
      title: "VS Code FULL Course + Setup (Interface, Plugins, Coding)",
      views: "202K",
    },
    {
      yt: "bBTgcO6CKv0",
      lang: "en",
      topic: "extensions",
      author: "Traversy Media",
      title: "20 Essential VS Code Extensions",
      views: "312K",
    },
    {
      yt: "XU57YBbSueM",
      lang: "en",
      topic: "extensions",
      author: "Web Dev Simplified",
      title: "10 Best Visual Studio Code Extensions",
      views: "216K",
    },
    {
      yt: "ifTF3ags0XI",
      lang: "en",
      topic: "productivity",
      author: "Fireship",
      title: "25 VS Code Productivity Tips and Speed Hacks",
      views: "2.7M",
    },
    {
      yt: "u21W_tfPVrY",
      lang: "en",
      topic: "productivity",
      author: "Fireship",
      title: "VS Code Top-Ten Pro Tips",
      views: "1.9M",
    },
    {
      yt: "KMxo3T_MTvY",
      lang: "en",
      topic: "basics",
      author: "Fireship",
      title: "VS Code in 100 Seconds",
    },
    {
      yt: "VknMxAIbJj4",
      lang: "en",
      topic: "setup",
      author: "Web Dev Simplified",
      title: "How I Setup And Customize VSCode",
    },
  ];

  const FILTERS = [
    { id: "all", labelKey: "lessons.filter.all" },
    { id: "ru", labelKey: "lessons.filter.ru" },
    { id: "en", labelKey: "lessons.filter.en" },
  ];

  // ---------- DOM ----------
  const grid = document.getElementById("lessonsGrid");
  const filtersEl = document.getElementById("lessonFilters");
  const countEl = document.getElementById("lessonCount");
  const emptyEl = document.getElementById("lessonsEmpty");

  let activeFilter = "all";

  // ---------- Filters ----------
  function renderFilters() {
    filtersEl.innerHTML = "";
    FILTERS.forEach((f) => {
      const n = f.id === "all" ? LESSONS.length : LESSONS.filter((l) => l.lang === f.id).length;
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
  function render() {
    const list = LESSONS.filter((l) => activeFilter === "all" || l.lang === activeFilter);
    grid.innerHTML = "";
    emptyEl.hidden = list.length > 0;
    countEl.textContent = t("lessons.count", { n: list.length });

    const frag = document.createDocumentFragment();
    list.forEach((l, i) => {
      const card = document.createElement("a");
      card.className = "video-card";
      card.href = `https://www.youtube.com/watch?v=${l.yt}`;
      card.target = "_blank";
      card.rel = "noopener";
      card.style.setProperty("--i", Math.min(i, 20));
      card.innerHTML = `
        <div class="video-thumb">
          <span class="video-lang">${l.lang.toUpperCase()}</span>
          <img alt="" loading="lazy" />
          <span class="play-badge">
            <svg viewBox="0 0 24 24" fill="#fff" aria-hidden="true"><path d="M8 5.5v13l11-6.5-11-6.5z"/></svg>
          </span>
        </div>
        <div class="video-body">
          <h3 class="video-title">${esc(l.title)}</h3>
          <div class="video-meta">
            ${l.author ? `<span>${esc(l.author)}</span>` : ""}
            ${l.author && l.views ? "<span>·</span>" : ""}
            ${l.views ? `<span>${esc(t("lessons.views", { v: l.views }))}</span>` : ""}
          </div>
          <div class="video-topics"><span class="tag">${esc(t("lessons.topic." + l.topic))}</span></div>
          <span class="video-cta">${esc(t("lessons.watch"))}
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><path d="M15 3h6v6"/><path d="M10 14 21 3"/></svg>
          </span>
        </div>`;

      // Превью: показываем реальную обложку с YouTube даже там, где YouTube
      // заблокирован, — картинки идут через публичные image-прокси.
      const img = card.querySelector("img");
      const thumb = card.querySelector(".video-thumb");
      const yt = l.yt;
      const chain = [
        `https://wsrv.nl/?url=i.ytimg.com/vi/${yt}/hq720.jpg&w=640&output=jpg`,
        `https://images.weserv.nl/?url=i.ytimg.com/vi/${yt}/hq720.jpg&w=640&output=jpg`,
        `https://wsrv.nl/?url=i.ytimg.com/vi/${yt}/hqdefault.jpg&w=640&output=jpg`,
        `https://i.ytimg.com/vi/${yt}/hq720.jpg`,
        `https://i.ytimg.com/vi/${yt}/hqdefault.jpg`,
      ];
      let step = 0;
      img.src = chain[step];
      img.addEventListener("error", () => {
        step++;
        if (step < chain.length) {
          img.src = chain[step];
        } else {
          img.remove();
          thumb.classList.add("noimg");
        }
      });

      frag.appendChild(card);
    });
    grid.appendChild(frag);
  }

  // ---------- Events ----------
  window.addEventListener("langchange", () => {
    renderFilters();
    render();
  });

  document.getElementById("scrollTop").addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

  // ---------- Init ----------
  renderFilters();
  render();
})();
