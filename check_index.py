"""Temporary end-to-end smoke test of the main page (index.html logic):
loads i18n.js + app.js with a DOM mock and a mocked Marketplace response,
then verifies that the collection chips and cards render correctly."""
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
globalThis.setTimeout = () => 0;      // никогда не срабатывает — без полночного refresh в тесте
globalThis.clearTimeout = () => {};
globalThis.setInterval = () => 0;
globalThis.requestAnimationFrame = () => 0;
globalThis.performance = { now: () => 0 };
globalThis.IntersectionObserver = function () { return { observe() {} }; };

function mkClassList() { return { add() {}, remove() {}, toggle() {}, contains() { return false; } }; }
function mkEl(tag) {
  const el = {
    tagName: tag, children: [], dataset: {}, classList: mkClassList(),
    style: { setProperty() {} },
    className: "", href: "", target: "", rel: "", hidden: false,
    textContent: "", title: "", value: "", src: "", alt: "",
    _html: "", _qs: {},
    querySelector(sel) { return this._qs[sel] || (this._qs[sel] = mkEl("q")); },
    querySelectorAll() { return []; },
    addEventListener() {}, removeEventListener() {},
    appendChild(c) {
      if (c.tagName === "frag") this.children.push(...c.children);
      else this.children.push(c);
    },
    remove() {}, setAttribute() {}, closest() { return null; },
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
  body: { style: {} },
  getElementById(id) { return REG[id] || (REG[id] = mkEl("div#" + id)); },
  createElement: mkEl,
  createDocumentFragment: () => mkEl("frag"),
  querySelector(sel) {
    if (sel === "#cardTpl") return { content: { firstElementChild: mkEl("article") } };
    return REG[sel] || (REG[sel] = mkEl("el:" + sel));
  },
  querySelectorAll() { return []; },
  addEventListener() {},
  dispatchEvent() {},
};

globalThis.fetch = () => Promise.resolve({
  ok: true,
  json: () => Promise.resolve({
    results: [{ extensions: [
      {
        publisher: { publisherName: "ms-python", displayName: "Microsoft", flags: "", domain: "", isDomainVerified: true },
        extensionName: "python",
        displayName: "Python",
        shortDescription: "Python language support with IntelliSense",
        statistics: [
          { statisticName: "install", value: 130000000 },
          { statisticName: "averagerating", value: 4.5 },
          { statisticName: "ratingcount", value: 3000 },
        ],
        versions: [{
          version: "2024.1.0", lastUpdated: "2024-01-01T00:00:00Z",
          properties: [{ key: "Microsoft.VisualStudio.Code.SponsorLink", value: "https://example.com/sponsor" }],
          files: [],
        }],
        categories: ["Programming Languages"],
        tags: ["python"],
        lastUpdated: "2024-01-01T00:00:00Z",
        publishedDate: "2015-01-01T00:00:00Z",
      },
      {
        publisher: { publisherName: "VisualStudioToolsForUnity", displayName: "Microsoft", flags: "", domain: "", isDomainVerified: true },
        extensionName: "vstuc",
        displayName: "Unity",
        shortDescription: "Unity tools for game development",
        statistics: [{ statisticName: "install", value: 3000000 }],
        versions: [{ version: "1.0.0", lastUpdated: "2024-01-01T00:00:00Z", properties: [], files: [] }],
        categories: ["Other"],
        tags: ["unity", "game"],
        lastUpdated: "2024-01-01T00:00:00Z",
        publishedDate: "2019-01-01T00:00:00Z",
      },
    ] }],
  }),
});
"""

ctx = quickjs.Context()
ctx.eval(DOM_MOCK)
ctx.eval(open("i18n.js", encoding="utf-8").read())
ctx.eval(open("app.js", encoding="utf-8").read())

# прогоняем асинхронные джобы (fetch → normalize → render)
guard = 0
while ctx.execute_pending_job() and guard < 1000:
    guard += 1

fail = False

chips = json.loads(ctx.eval("JSON.stringify(__reg['#collections'].children.map(c => c._html || ''))"))
print(f"collection chips: {len(chips)}")
for c in chips[:5]:
    print("  -", c[:110])

grid_cards = int(ctx.eval("__reg['#grid'].children.length"))
result_count = str(ctx.eval("__reg['#resultCount'].textContent"))
print(f"grid cards: {grid_cards}, resultCount: '{result_count}'")

if len(chips) != 17:
    print(f"FAIL: expected 17 chips, got {len(chips)}")
    fail = True
for needle in ["Лучшие для Python", "Для программистов", "Создание игр"]:
    if not any(needle in c for c in chips):
        print(f"FAIL: chip '{needle}' not found")
        fail = True
if grid_cards != 2:
    print(f"FAIL: expected 2 cards, got {grid_cards}")
    fail = True

# sponsor badge on the python card
card_html = str(ctx.eval("__reg['#grid'].children[0]._qs['.chip-sponsor'] ? __reg['#grid'].children[0]._qs['.chip-sponsor'].textContent : 'NONE'"))
print(f"python card sponsor chip: '{card_html}'")
if "Спонсор" not in card_html:
    print("FAIL: sponsor chip missing on python card")
    fail = True

# switch language to EN and verify chips re-render in English
ctx.eval('I18N.setLang("en")')
while ctx.execute_pending_job() and guard < 2000:
    guard += 1
chips_en = json.loads(ctx.eval("JSON.stringify(__reg['#collections'].children.map(c => c._html || ''))"))
for needle in ["Best for Python", "For programmers", "Game development"]:
    if not any(needle in c for c in chips_en):
        print(f"FAIL: EN chip '{needle}' not found")
        fail = True
print("EN chips checked")

sys.exit(1 if fail else 0)
