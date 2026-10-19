/* ============================================================
   VSX Top500 — перевод описаний расширений (EN → RU).
   Провайдеры (все с CORS, проверены из РФ):
     1. mozhi.aryak.me    (Google через прокси)
     2. mozhi.ducks.party (Google через прокси)
     3. translate.googleapis.com (напрямую — для тех, у кого доступен)
   Переводы кэшируются в localStorage навсегда: повторные
   посещения не тратят ни одного запроса.
   ============================================================ */

(() => {
  "use strict";

  const CACHE_KEY = "vsx_trans_v1";
  const MAX_PARALLEL = 3; // одновременных запросов
  const GAP_MS = 120; // пауза между стартами запросов
  const ERR_BREAK = 8; // столько ошибок подряд → длинная пауза
  const ERR_PAUSE_MS = 30000;
  const MAX_TRIES = 2; // попыток на текст
  const REQ_TIMEOUT_MS = 15000;

  // ---------- Кэш ----------
  let cache = {};
  try {
    cache = JSON.parse(localStorage.getItem(CACHE_KEY) || "{}") || {};
  } catch {
    cache = {};
  }

  let saveTimer = null;
  function scheduleSave() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
      } catch {
        /* quota — ignore */
      }
    }, 3000);
  }
  window.addEventListener("pagehide", () => {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
    } catch {
      /* ignore */
    }
  });

  const get = (text) => cache[text] || null;

  // ---------- Что нужно переводить ----------
  const hasLatin = (s) => /[A-Za-z]/.test(s);
  const cyrRatio = (s) => {
    const cyr = (s.match(/[А-Яа-яЁё]/g) || []).length;
    return cyr / (s.length || 1);
  };
  const needTranslate = (text) =>
    typeof text === "string" &&
    text.trim().length > 1 &&
    hasLatin(text) &&
    cyrRatio(text) < 0.4 && // уже русский — пропускаем
    !cache[text];

  // ---------- Провайдеры ----------
  const PROVIDERS = [
    {
      name: "mozhi-aryak",
      build: (q) => `https://mozhi.aryak.me/api/translate?engine=google&from=en&to=ru&text=${encodeURIComponent(q)}`,
      parse: (j) => (j && j["translated-text"]) || "",
    },
    {
      name: "mozhi-ducks",
      build: (q) => `https://mozhi.ducks.party/api/translate?engine=google&from=en&to=ru&text=${encodeURIComponent(q)}`,
      parse: (j) => (j && j["translated-text"]) || "",
    },
    {
      name: "gtx",
      build: (q) => `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=ru&dt=t&q=${encodeURIComponent(q)}`,
      parse: (j) => (Array.isArray(j) && Array.isArray(j[0]) ? j[0].map((r) => (r && r[0]) || "").join("") : ""),
    },
  ];
  let providerIdx = 0; // индекс последнего успешного провайдера

  async function requestTranslation(text) {
    // начинаем с последнего успешного провайдера, остальные — по кругу
    const order = [...PROVIDERS.slice(providerIdx), ...PROVIDERS.slice(0, providerIdx)];
    for (const p of order) {
      try {
        const opts = AbortSignal && typeof AbortSignal.timeout === "function" ? { signal: AbortSignal.timeout(REQ_TIMEOUT_MS) } : {};
        const res = await fetch(p.build(text), opts);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const j = await res.json();
        const out = String(p.parse(j) || "").trim();
        const srcWords = text.trim().split(/\s+/).length;
        // отсекаем пустой ответ и «перевод», вернувший исходник
        if (!out || out === text || (srcWords >= 3 && !/[А-Яа-яЁё]/.test(out))) {
          throw new Error("bad translation");
        }
        providerIdx = PROVIDERS.indexOf(p);
        return out;
      } catch {
        /* пробуем следующий провайдер */
      }
    }
    throw new Error("all providers failed");
  }

  // ---------- Очередь ----------
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  const queue = [];
  const queued = new Set();
  let active = 0;
  let doneCount = 0;
  let totalCount = 0;
  let errStreak = 0;
  let running = false;
  let onEachCb = null;
  let progressCb = null;

  const stats = () => ({ done: doneCount, total: totalCount, active: running && doneCount < totalCount });
  const updateProgress = () => progressCb && progressCb(stats());

  function autoTranslate(texts, onEach) {
    if (typeof onEach === "function") onEachCb = onEach;
    const fresh = [];
    for (const tx of texts) {
      if (queued.has(tx) || !needTranslate(tx)) continue;
      queued.add(tx);
      fresh.push(tx);
    }
    if (!fresh.length) {
      updateProgress();
      return;
    }
    totalCount += fresh.length;
    queue.push(...fresh);
    if (!running) {
      running = true;
      pump();
    }
    updateProgress();
  }

  async function pump() {
    while (queue.length || active > 0) {
      while (active < MAX_PARALLEL && queue.length) {
        const text = queue.shift();
        active++;
        worker(text).finally(() => {
          active--;
        });
        await sleep(GAP_MS);
      }
      await sleep(150);
    }
    running = false;
    updateProgress();
  }

  async function worker(text) {
    for (let attempt = 0; attempt < MAX_TRIES; attempt++) {
      try {
        const out = await requestTranslation(text);
        cache[text] = out;
        scheduleSave();
        doneCount++;
        errStreak = 0;
        if (onEachCb) onEachCb(text, out);
        updateProgress();
        return;
      } catch {
        errStreak++;
        if (errStreak >= ERR_BREAK) {
          errStreak = 0;
          await sleep(ERR_PAUSE_MS);
        }
      }
    }
    // не удалось — оставляем оригинал, текст попробуем при следующем визите
    doneCount++;
    updateProgress();
  }

  window.VSXTranslate = {
    get,
    needTranslate,
    autoTranslate,
    stats,
    onProgress(cb) {
      progressCb = cb;
    },
  };
})();
