/* ============================================================
   VSX Top500 — страница «Не ставить» (avoid.html)
   Типичные антипаттерны: расширения, которые дублируют
   встроенные функции, конфликтуют или тормозят редактор.
   Формулировки аккуратные: критикуем категории и практики,
   а не конкретных авторов.
   ============================================================ */

(() => {
  "use strict";

  const t = (key, vars) => window.I18N.t(key, vars);
  const lang = () => window.I18N.lang;
  const esc = (s) =>
    String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  // ---------- Антипаттерны ----------
  const AVOID = [
    {
      icon: "🧩",
      title: { ru: "Дубли встроенных функций", en: "Duplicates of built-in features" },
      why: {
        ru: "VS Code уже умеет подсвечивать парные скобки, синхронизировать настройки и показывать цвета. Расширения из прошлых лет для этого только замедляют редактор и тянут лишние процессы.",
        en: "VS Code already highlights bracket pairs, syncs settings and shows colour swatches. Extensions from past years for these tasks only slow the editor down and spawn extra processes.",
      },
      examples: {
        ru: "Примеры: Bracket Pair Colorizer (встроено с 2021), старое Settings Sync (заменено встроенной синхронизацией).",
        en: "Examples: Bracket Pair Colorizer (built in since 2021), the old Settings Sync (replaced by built-in sync).",
      },
      instead: {
        ru: "Проверьте встроенные настройки: Ctrl+, → поиск «bracket pair» и «settings sync».",
        en: "Check the built-in settings: Ctrl+, → search “bracket pair” and “settings sync”.",
      },
    },
    {
      icon: "⏳",
      title: { ru: "Заброшенные и устаревшие", en: "Abandoned and outdated" },
      why: {
        ru: "Расширение без обновлений годами — это баги, несовместимость с новыми версиями VS Code и потенциальные дыры в безопасности. Часто у него уже есть официальная замена.",
        en: "An extension without updates for years means bugs, incompatibility with new VS Code versions and potential security holes. There's often an official replacement already.",
      },
      examples: {
        ru: "Примеры: TSLint (официально deprecated в пользу ESLint), устаревшие сборки Debugger for Chrome.",
        en: "Examples: TSLint (officially deprecated in favour of ESLint), outdated Debugger for Chrome builds.",
      },
      instead: {
        ru: "Смотрите в карточке на дату обновления и стрелку тренда: живой проект обновлялся за последние месяцы.",
        en: "Check the update date and trend arrow on the card: a live project was updated within the last months.",
      },
    },
    {
      icon: "⚔️",
      title: { ru: "Несколько форматтеров сразу", en: "Several formatters at once" },
      why: {
        ru: "Prettier, Beautify и автофиксы ESLint одновременно переписывают друг за другом один и тот же файл. Результат — «дрожащий» код, конфликты в диффах и удивление в команде.",
        en: "Prettier, Beautify and ESLint autofixes rewriting the same file after each other. The result — jittery code, noisy diffs and surprises for the team.",
      },
      examples: {
        ru: "Примеры: Prettier + Beautify в одном проекте; автофикс ESLint стиля вместе с Prettier без общей конфигурации.",
        en: "Examples: Prettier + Beautify in one project; ESLint style autofixes alongside Prettier without a shared config.",
      },
      instead: {
        ru: "Один форматтер на проект: «editor.defaultFormatter» + formatOnSave. Стиль-правила ESLint отключите, если форматирует Prettier.",
        en: "One formatter per project: “editor.defaultFormatter” + formatOnSave. Disable ESLint style rules if Prettier does the formatting.",
      },
    },
    {
      icon: "🤖",
      title: { ru: "Несколько ИИ-ассистентов одновременно", en: "Several AI assistants at once" },
      why: {
        ru: "Copilot, Codeium и другие ассистенты конкурируют за одно и то же автодополнение: подсказки мигают и перекрывают друг друга, расход ресурсов растёт.",
        en: "Copilot, Codeium and other assistants compete for the same autocomplete: suggestions blink and overlap, resource usage grows.",
      },
      examples: {
        ru: "Примеры: Copilot + Codeium + TabNine, включённые все сразу.",
        en: "Examples: Copilot + Codeium + TabNine all enabled at once.",
      },
      instead: {
        ru: "Держите включённым один ассистент и отключайте остальные через Extensions → Disable.",
        en: "Keep a single assistant enabled and disable the rest via Extensions → Disable.",
      },
    },
    {
      icon: "🐘",
      title: { ru: "Тяжёлые «мега-паки» всего подряд", en: "Heavy “mega-packs” of everything" },
      why: {
        ru: "Наборы из десятков расширений «на все случаи» грузят редактор, ставят ненужные зависимости и конфликтуют между собой. Каждое лишнее расширение — это время запуска и память.",
        en: "Packs of dozens of “just in case” extensions load the editor, pull unneeded dependencies and conflict with each other. Every extra extension costs startup time and memory.",
      },
      examples: {
        ru: "Примеры: extension packs из 30+ расширений, где реально нужны два-три.",
        en: "Examples: extension packs with 30+ extensions where only two or three are actually needed.",
      },
      instead: {
        ru: "Ставьте по мере надобности — или возьмите готовый набор из 5–10 расширений на странице «Наборы».",
        en: "Install as you go — or grab a ready-made 5–10 extension kit on the “Kits” page.",
      },
    },
    {
      icon: "🎨",
      title: { ru: "Стопка тем и иконочных паков", en: "A pile of themes and icon packs" },
      why: {
        ru: "Одновременно активна только одна тема, остальные просто занимают место. Несколько иконочных пакетов могут конфликтовать за одни и те же типы файлов.",
        en: "Only one theme is active at a time; the rest just take up space. Several icon packs can fight over the same file types.",
      },
      examples: {
        ru: "Примеры: пять тем «на настроение» и три иконочных пака сразу.",
        en: "Examples: five “mood” themes and three icon packs at once.",
      },
      instead: {
        ru: "Оставьте одну тему и один иконочный пак. Переключение темы — Ctrl+K Ctrl+T.",
        en: "Keep one theme and one icon pack. Switch themes with Ctrl+K Ctrl+T.",
      },
    },
    {
      icon: "🕵️",
      title: { ru: "Сомнительные и непрозрачные", en: "Shady and opaque extensions" },
      why: {
        ru: "Расширения без репозитория, с обфусцированным кодом или странными разрешениями получают доступ к вашему коду и буферу обмена. Установок может быть много, но это не гарантия безопасности.",
        en: "Extensions without a repository, with obfuscated code or odd permissions get access to your code and clipboard. High install counts are no guarantee of safety.",
      },
      examples: {
        ru: "Признаки: нет ссылки на исходники, нет лицензии, автор без истории публикаций.",
        en: "Signs: no source link, no licence, a publisher without a track record.",
      },
      instead: {
        ru: "Проверяйте карточку: репозиторий, лицензия, издатель. Есть сомнения — не ставьте.",
        en: "Check the card: repository, licence, publisher. In doubt — don't install.",
      },
    },
  ];

  // ---------- DOM ----------
  const grid = document.getElementById("avoidGrid");
  const countEl = document.getElementById("avoidCount");

  // ---------- Render ----------
  function render() {
    const lg = lang();
    grid.innerHTML = "";
    countEl.textContent = t("avoid.count", { n: AVOID.length });

    const frag = document.createDocumentFragment();
    AVOID.forEach((a, i) => {
      const card = document.createElement("article");
      card.className = "avoid-card";
      card.style.setProperty("--i", Math.min(i, 20));
      card.innerHTML = `
        <div class="avoid-head">
          <span class="avoid-icon" aria-hidden="true">${a.icon}</span>
          <h3>${esc(a.title[lg] || a.title.ru)}</h3>
        </div>
        <div class="avoid-block why">
          <h4>${esc(t("avoid.why"))}</h4>
          <p>${esc(a.why[lg] || a.why.ru)}</p>
          <p class="avoid-examples">${esc(a.examples[lg] || a.examples.ru)}</p>
        </div>
        <div class="avoid-block instead">
          <h4>${esc(t("avoid.instead"))}</h4>
          <p>${esc(a.instead[lg] || a.instead.ru)}</p>
        </div>`;
      frag.appendChild(card);
    });
    grid.appendChild(frag);
  }

  // ---------- Events ----------
  window.addEventListener("langchange", render);

  document.getElementById("scrollTop").addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

  // ---------- Init ----------
  render();
})();
