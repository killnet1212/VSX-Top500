/* ============================================================
   kits-validator.js — проверка ID расширений в наборах.
   Запускает: node kits-validator.js
   Проверяет:
   1. Существует ли расширение в Marketplace
   2. Когда последний раз обновлялось
   3. Предупреждение «давно не обновлялось» (>365 дней)
   ============================================================ */

const API_URL = "https://marketplace.visualstudio.com/_apis/public/gallery/extensionquery";
const API_VERSION = "7.1-preview.1";
const FLAGS = 1 | 2 | 4 | 16 | 256 | 512;

// ---------- Парсим ID из kits.js ----------
function parseKits() {
  const fs = require("fs");
  const path = require("path");

  const kitsPath = path.join(__dirname, "kits.js");
  const content = fs.readFileSync(kitsPath, "utf-8");

  // Извлекаем массив plugins из каждого набора
  const kits = [];
  const kitMatch = content.match(/const KITS = \[([\s\S]*?)\];/);
  if (!kitMatch) {
    console.error("❌ Не удалось найти KITS в kits.js");
    process.exit(1);
  }

  // Парсим каждый набор
  const kitBlocks = kitMatch[1].match(/\{[\s\S]*?id:\s*"([^"]+)"[\s\S]*?plugins:\s*\[([\s\S]*?)\]/g);
  if (!kitBlocks) {
    console.error("❌ Не удалось распарсить наборы");
    process.exit(1);
  }

  kitBlocks.forEach((block) => {
    const kitId = block.match(/id:\s*"([^"]+)"/);
    const pluginsMatch = block.match(/plugins:\s*\[([\s\S]*?)\]/);
    if (!kitId || !pluginsMatch) return;

    const plugins = pluginsMatch[1].match(/\{\s*id:\s*"([^"]+)"[\s\S]*?name:\s*"([^"]+)"/g);
    if (!plugins) return;

    const pluginsList = plugins.map((p) => {
      const id = p.match(/id:\s*"([^"]+)"/);
      const name = p.match(/name:\s*"([^"]+)"/);
      return { id: id ? id[1] : "", name: name ? name[1] : "" };
    });

    kits.push({
      id: kitId[1],
      name: pluginsList[0]?.name || kitId[1],
      plugins: pluginsList,
    });
  });

  return kits;
}

// ---------- Проверка одного расширения ----------
async function checkExtension(id) {
  const body = {
    filters: [
      {
        criteria: [
          { filterType: 8, value: "Microsoft.VisualStudio.Code" },
          { filterType: 12, value: "4096" },
        ],
        pageNumber: 1,
        pageSize: 1,
        sortBy: 4,
        sortOrder: 2,
      },
    ],
    assetTypes: [],
    flags: FLAGS,
  };

  // Ищем расширение по имени
  const query = {
    filters: [
      {
        criteria: [{ filterType: 7, value: id }], // extensionName
        pageNumber: 1,
        pageSize: 1,
      },
    ],
    assetTypes: [],
    flags: FLAGS,
  };

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: `application/json;api-version=${API_VERSION}`,
      },
      body: JSON.stringify(query),
    });

    if (!res.ok) return { id, found: false, error: `HTTP ${res.status}` };

    const json = await res.json();
    const ext = json.results?.[0]?.extensions?.[0];
    if (!ext) return { id, found: false };

    const publisher = ext.publisher.publisherName;
    const name = ext.extensionName;
    const fullName = `${publisher}.${name}`;
    const lastUpdated = ext.lastUpdated;
    const daysSinceUpdate = lastUpdated
      ? Math.floor((Date.now() - new Date(lastUpdated).getTime()) / 86400000)
      : null;

    return {
      id,
      found: true,
      fullName,
      lastUpdated,
      daysSinceUpdate,
      stale: daysSinceUpdate !== null && daysSinceUpdate > 365,
    };
  } catch (err) {
    return { id, found: false, error: err.message };
  }
}

// ---------- Главная ----------
async function main() {
  console.log("🔍 VSX Kits Validator\n" + "=".repeat(40));
  console.log("");

  const kits = parseKits();
  console.log(`📦 Найдено наборов: ${kits.length}\n`);

  const allPlugins = [];
  kits.forEach((kit) => {
    kit.plugins.forEach((p) => allPlugins.push({ ...p, kitId: kit.id }));
  });

  // Убираем дубликаты
  const uniqueIds = [...new Set(allPlugins.map((p) => p.id))];
  console.log(`📋 Уникальных ID расширений: ${uniqueIds.length}\n`);

  const results = { valid: [], invalid: [], stale: [] };

  // Проверяем каждое расширение
  for (let i = 0; i < uniqueIds.length; i++) {
    const id = uniqueIds[i];
    process.stdout.write(`\r[${i + 1}/${uniqueIds.length}] Проверяю ${id}...`);
    const result = await checkExtension(id);

    if (!result.found) {
      results.invalid.push({ id, kit: allPlugins.find((p) => p.id === id)?.kitId });
    } else if (result.stale) {
      results.stale.push({ id, kit: allPlugins.find((p) => p.id === id)?.kitId, daysSinceUpdate: result.daysSinceUpdate });
    }
    results.valid.push(result);
  }

  console.log("\n\n" + "=".repeat(40));
  console.log(`\n✅ Валидных: ${results.valid.length - results.stale.length}`);
  if (results.stale.length) {
    console.log(`\n⚠️  Давно не обновлялось (>365 дней):`);
    results.stale.forEach((r) => {
      console.log(`   ⚠️  ${r.id} — ${r.daysSinceUpdate} дн. (набор: ${r.kit})`);
    });
  }
  if (results.invalid.length) {
    console.log(`\n❌ Не найдено в Marketplace:`);
    results.invalid.forEach((r) => {
      console.log(`   ❌ ${r.id} (набор: ${r.kit})`);
    });
  }
  if (results.invalid.length === 0 && results.stale.length === 0) {
    console.log(`\n🎉 Все ID валидны!`);
  }
  console.log("");
}

main().catch(console.error);
