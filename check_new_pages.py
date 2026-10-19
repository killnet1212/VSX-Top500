"""Temporary end-to-end smoke test for the new pages and the AI assistant:
loads i18n.js + prompts.js / kits.js / settings.js / avoid.js / assistant.js
with a DOM mock and verifies rendering and the assistant's search quality."""
import json
import sys

import quickjs

DOM_MOCK = """
globalThis.localStorage = {
  _d: {},
  getItem(k) { return (k in this._d) ? this._d[k] : null; },
  setItem(k, v) { this._d[k] = String(v); },
};
globalThis.navigator = { language: "ru-RU" };
globalThis.__listeners = {};
globalThis.addEventListener = (type, fn) => { (__listeners[type] = __listeners[type] || []).push(fn); };
globalThis.dispatchEvent = (ev) => { (__listeners[ev.type] || []).forEach(fn => fn(ev)); };
globalThis.CustomEvent = function (n, o) { this.type = n; this.detail = o && o.detail; };
globalThis.window = globalThis;
globalThis.setTimeout = () => 0;      // никогда не срабатывает — тесты синхронные
globalThis.clearTimeout = () => {};
globalThis.setInterval = () => 0;

function mkClassList() { return { add() {}, remove() {}, toggle() {}, contains() { return false; } }; }
function mkEl(tag) {
  const el = {
    tagName: tag, children: [], dataset: {}, classList: mkClassList(),
    style: { setProperty() {} },
    className: "", href: "", target: "", rel: "", hidden: false,
    textContent: "", title: "", value: "", src: "", alt: "",
    scrollTop: 0, scrollHeight: 0,
    _html: "", _qs: {},
    querySelector(sel) { return this._qs[sel] || (this._qs[sel] = mkEl("q")); },
    querySelectorAll() { return []; },
    addEventListener() {}, removeEventListener() {},
    appendChild(c) {
      if (c.tagName === "frag") this.children.push(...c.children);
      else this.children.push(c);
    },
    remove() {}, setAttribute() {}, closest() { return null; }, focus() {},
    getBoundingClientRect() { return { left: 0, top: 0 }; },
    cloneNode() { return mkEl(this.tagName); },
  };
  Object.defineProperty(el, "innerHTML", {
    get() { return this._html; },
    set(v) { this._html = v; if (v === "") this.children = []; },
  });
  return el;
}

const REG = {};
globalThis.__reg = REG;
globalThis.document = {
  readyState: "complete",
  documentElement: { lang: "" },
  body: { style: {}, appendChild() {} },
  getElementById(id) { return REG[id] || (REG[id] = mkEl("div#" + id)); },
  createElement: mkEl,
  createDocumentFragment: () => mkEl("frag"),
  querySelector(sel) { return REG[sel] || (REG[sel] = mkEl("el:" + sel)); },
  querySelectorAll() { return []; },
  addEventListener() {},
  dispatchEvent() {},
};
"""

fail = False

# ---------- Страница «Промпты» ----------
ctx = quickjs.Context()
ctx.eval(DOM_MOCK)
ctx.eval(open("i18n.js", encoding="utf-8").read())
ctx.eval(open("prompts.js", encoding="utf-8").read())

prompt_cards = int(ctx.eval("__reg['promptsGrid'].children.length"))
prompt_filters = int(ctx.eval("__reg['promptFilters'].children.length"))
print(f"prompts: cards={prompt_cards}, filters={prompt_filters}")
if prompt_cards < 18:
    print(f"FAIL: expected at least 18 prompt cards, got {prompt_cards}")
    fail = True
if prompt_filters != 4:
    print(f"FAIL: expected 4 level filters, got {prompt_filters}")
    fail = True

# проверим, что фильтр «новичкам» реально фильтрует: нажмём первый chip
# (в моке клик не эмулируется, поэтому дёргаем рендер через setLang — просто
# убеждаемся, что карточки содержат все три уровня)
html = str(ctx.eval("__reg['promptsGrid'].children.map(c => c._html).join('')"))
for needle in ["novice", "skilled", "pro"]:
    if f"prompt-level {needle}" not in html:
        print(f"FAIL: no cards with level '{needle}'")
        fail = True
print("prompt levels checked")

# ---------- Страница «Наборы» ----------
ctx2 = quickjs.Context()
ctx2.eval(DOM_MOCK)
ctx2.eval(open("i18n.js", encoding="utf-8").read())
ctx2.eval(open("kits-data.js", encoding="utf-8").read())
ctx2.eval(open("kits.js", encoding="utf-8").read())

kits = int(ctx2.eval("__reg['kitsGrid'].children.length"))
kit_count = str(ctx2.eval("__reg['kitCount'].textContent"))
print(f"kits: {kits}, count label: '{kit_count}'")
if kits < 6:
    print(f"FAIL: expected at least 6 kits, got {kits}")
    fail = True
if "6" not in kit_count:
    print(f"FAIL: kit count label wrong: '{kit_count}'")
    fail = True

# в каждом наборе 5-10 плагинов и есть кнопка «скопировать всё»
for i in range(kits):
    html = str(ctx2.eval(f"__reg['kitsGrid'].children[{i}]._html"))
    if "kit-copy-all" not in html or "kit-plugin" not in html:
        print(f"FAIL: kit #{i} missing copy-all or plugins")
        fail = True
print("kit contents checked")

# ---------- Страница «Настройки» ----------
ctx3 = quickjs.Context()
ctx3.eval(DOM_MOCK)
ctx3.eval(open("i18n.js", encoding="utf-8").read())
ctx3.eval(open("settings.js", encoding="utf-8").read())

jsons = int(ctx3.eval("__reg['jsonGrid'].children.length"))
keys = int(ctx3.eval("__reg['keysGrid'].children.length"))
themes = int(ctx3.eval("__reg['themesGrid'].children.length"))
print(f"settings: json={jsons}, keys={keys}, themes={themes}")
if (jsons, keys, themes) != (3, 1, 6):
    print(f"FAIL: expected (3,1,6), got ({jsons},{keys},{themes})")
    fail = True

# ---------- Страница «Не ставить» ----------
ctx4 = quickjs.Context()
ctx4.eval(DOM_MOCK)
ctx4.eval(open("i18n.js", encoding="utf-8").read())
ctx4.eval(open("avoid.js", encoding="utf-8").read())

avoid = int(ctx4.eval("__reg['avoidGrid'].children.length"))
avoid_count = str(ctx4.eval("__reg['avoidCount'].textContent"))
print(f"avoid: {avoid}, count label: '{avoid_count}'")
if avoid != 7:
    print(f"FAIL: expected 7 avoid cards, got {avoid}")
    fail = True

# ---------- ИИ-ассистент ----------
ctx5 = quickjs.Context()
ctx5.eval(DOM_MOCK)
ctx5.eval(open("i18n.js", encoding="utf-8").read())
ctx5.eval(open("assistant.js", encoding="utf-8").read())

kb_len = int(ctx5.eval("__VSX_AI.KB.length"))
print(f"assistant KB articles: {kb_len}")
if kb_len < 16:
    print(f"FAIL: expected at least 16 KB articles, got {kb_len}")
    fail = True

# Поиск должен приводить к правильной статье для типовых запросов
CASES = [
    ("как установить расширение", "install"),
    ("лучшие расширения", "best"),
    ("горячие клавиши", "hotkeys"),
    ("промпты для копилота", "prompts"),
    ("питон", "python"),
    ("наборы для старта", "kits"),
    ("что не стоит ставить", "avoid"),
    ("темы оформления", "theme"),
    ("настройки vs code", "settings"),
    ("спонсор", "sponsor"),
    ("рейтинг", "rating"),
    ("git коммит", "git"),
    ("уроки видео", "lessons"),
]
for q, expected in CASES:
    top = ctx5.eval(f"JSON.stringify(__VSX_AI.search({json.dumps(q)}).slice(0,1).map(x => x.a.id))")
    ids = json.loads(top)
    got = ids[0] if ids else "NONE"
    mark = "OK " if got == expected else "FAIL"
    print(f"  [{mark}] '{q}' -> {got} (expected {expected})")
    if got != expected:
        fail = True

# пустой и бессмысленный запрос не должны находить ничего
empty = json.loads(ctx5.eval("JSON.stringify(__VSX_AI.search('   '))"))
if empty:
    print("FAIL: empty query should return no results")
    fail = True

sys.exit(1 if fail else 0)
