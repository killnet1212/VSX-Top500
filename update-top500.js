/* ============================================================
   update-top500.js — downloads the top 500 VS Code extensions
   from the Marketplace API and saves them as top500.json.
   Put top500.json next to index.html to make the site work offline.
   Run: node update-top500.js
   ============================================================ */

"use strict";

const fs = require("fs");
const path = require("path");
const { normalize } = require("./normalize.js");

const API_URL = "https://marketplace.visualstudio.com/_apis/public/gallery/extensionquery";
const API_VERSION = "7.1-preview.1";
const TOP_N = 500;
// IncludeVersions | IncludeFiles | IncludeCategoryAndTags |
// IncludeVersionProperties | IncludeStatistics | IncludeLatestVersionOnly
const FLAGS = 1 | 2 | 4 | 16 | 256 | 512;

async function fetchTop() {
  const body = {
    filters: [
      {
        criteria: [
          { filterType: 8, value: "Microsoft.VisualStudio.Code" },
          { filterType: 12, value: "4096" },
        ],
        pageNumber: 1,
        pageSize: TOP_N,
        sortBy: 4, // InstallCount
        sortOrder: 2, // Descending
      },
    ],
    assetTypes: [],
    flags: FLAGS,
  };

  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: `application/json;api-version=${API_VERSION}`,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  const list = json.results?.[0]?.extensions || [];
  if (!list.length) throw new Error("Empty response from Marketplace");
  return list.map(normalize);
}

async function main() {
  const localDay = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  };

  process.stdout.write("Загружаем топ-500 из Marketplace… ");
  const data = await fetchTop();

  const out = path.join(__dirname, "top500.json");

  // Keep yesterday's ranks so the day-over-day arrows keep working offline.
  if (fs.existsSync(out)) {
    try {
      const prev = JSON.parse(fs.readFileSync(out, "utf-8"));
      const prevArr = Array.isArray(prev) ? prev : prev.data;
      if (Array.isArray(prevArr) && prevArr.length) {
        const prevFile = path.join(__dirname, "top500.prev.json");
        fs.writeFileSync(prevFile, JSON.stringify({ day: prev.day || null, ranks: prevArr.map((e) => [e.id, e.rank]) }));
      }
    } catch {
      /* previous snapshot unreadable — not fatal */
    }
  }

  const payload = { day: localDay(), fetchedAt: new Date().toISOString(), count: data.length, data };
  fs.writeFileSync(out, JSON.stringify(payload));

  // ---------- История позиций ----------
  const histFile = path.join(__dirname, "history.json");
  let hist = { days: [], ranks: {} };
  if (fs.existsSync(histFile)) {
    try {
      hist = JSON.parse(fs.readFileSync(histFile, "utf-8"));
      if (!Array.isArray(hist.days)) hist.days = [];
      if (typeof hist.ranks !== "object") hist.ranks = {};
    } catch {
      /* unreadable — reset */
      hist = { days: [], ranks: {} };
    }
  }
  // Добавляем новую дату, если её ещё нет
  const today = localDay();
  if (!hist.days.includes(today)) {
    hist.days.push(today);
    // Для каждого расширения добавляем позицию
    data.forEach((e) => {
      if (!hist.ranks[e.id]) hist.ranks[e.id] = [];
      hist.ranks[e.id].push(e.rank);
    });
    // Храним последние 365 дней
    const maxDays = 365;
    while (hist.days.length > maxDays) {
      const oldDay = hist.days.shift();
      for (const id in hist.ranks) {
        hist.ranks[id].shift();
      }
    }
    fs.writeFileSync(histFile, JSON.stringify(hist));
  }

  const kb = (fs.statSync(out).size / 1024).toFixed(0);
  process.stdout.write(`готово: ${data.length} расширений, ${kb} КБ\n`);
  process.stdout.write("Положите top500.json рядом с index.html — сайт откроется без интернета.\n");
}

main().catch((err) => {
  console.error("\nОшибка:", err.message);
  process.exit(1);
});
