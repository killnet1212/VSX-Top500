"""Temporary test: verify the new curated collections against REAL top-500
Marketplace data. Extracts the collections block from app.js, evaluates it in
QuickJS, and counts matches per collection."""
import json
import re
import sys
import urllib.request

import quickjs

fail = False

# ---------- 1. Fetch real top-500 from Marketplace ----------
body = json.dumps({
    "filters": [{
        "criteria": [
            {"filterType": 8, "value": "Microsoft.VisualStudio.Code"},
            {"filterType": 12, "value": "4096"},
        ],
        "pageNumber": 1,
        "pageSize": 500,
        "sortBy": 4,
        "sortOrder": 2,
    }],
    "assetTypes": [],
    "flags": 1 | 2 | 4 | 16 | 256 | 512,
}).encode()

req = urllib.request.Request(
    "https://marketplace.visualstudio.com/_apis/public/gallery/extensionquery",
    data=body,
    headers={
        "Content-Type": "application/json",
        "Accept": "application/json;api-version=7.1-preview.1",
        "User-Agent": "Mozilla/5.0",
    },
    method="POST",
)
with urllib.request.urlopen(req, timeout=90) as r:
    data = json.load(r)

raw = data["results"][0]["extensions"]
print(f"fetched {len(raw)} extensions")

exts = []
for e in raw:
    props = {}
    vers = e.get("versions") or [{}]
    for p in (vers[0].get("properties") or []):
        props[p["key"]] = p["value"]
    exts.append({
        "id": f"{e['publisher']['publisherName']}.{e['extensionName']}",
        "name": e.get("displayName") or e["extensionName"],
        "short": e.get("shortDescription") or "",
        "tags": [t for t in (e.get("tags") or []) if not t.startswith("__")],
        "categories": e.get("categories") or [],
        "publisherId": e["publisher"]["publisherName"],
        "sponsor": props.get("Microsoft.VisualStudio.Code.SponsorLink", ""),
        "installs": next((s["value"] for s in (e.get("statistics") or []) if s["statisticName"] == "install"), 0),
    })

# ---------- 2. Extract the collections block from app.js ----------
src = open("app.js", encoding="utf-8").read()
start = src.index("// ---------- Тематические подборки")
end = src.index("// ---------- DOM ----------")
block = src[start:end]
print(f"collections block: {len(block)} chars")

# ---------- 3. Evaluate in QuickJS with real data ----------
ctx = quickjs.Context()
ctx.eval(f"globalThis.DATA = {json.dumps(exts, ensure_ascii=False)};")
ctx.eval(block + ";globalThis.__coll = COLLECTIONS;")

colls = json.loads(ctx.eval("""
JSON.stringify(__coll.map(c => ({
  id: c.id,
  label: c.label.ru,
  count: c.match ? DATA.filter(c.match).length : DATA.length,
  sample: c.match ? DATA.filter(c.match).slice(0, 40).map(e => e.name + " (" + e.id + ")") : [],
})))
"""))

print("\n=== collections on real top-500 ===")
for c in colls:
    print(f"{c['label']:28} | {c['count']:3} | {', '.join(c['sample'][:4])}")

print("\n=== FULL lists for new collections ===")
for c in colls:
    if c["id"] in ("python", "prog", "games"):
        print(f"\n[{c['label']}] {c['count']} items:")
        for s in c['sample']:
            print(f"  - {s}")

counts = {c["id"]: c["count"] for c in colls}
expect = {
    "python": 12,  # ms-python + jupyter family alone should give this many
    "prog": 25,
    "games": 5,
    "ai": 20,
    "sponsors": 25,
}
for cid, minimum in expect.items():
    if counts.get(cid, 0) < minimum:
        print(f"FAIL: collection '{cid}' has only {counts.get(cid, 0)} items (expected >= {minimum})")
        fail = True

# Ensure no collection is empty (except maybe ru / rare ones)
for c in colls:
    if c["count"] == 0 and c["id"] not in ("ru",):
        print(f"WARN: collection '{c['id']}' is empty")

# ---------- 4. Syntax check of all JS ----------
print("\n=== syntax ===")
for f in ["i18n.js", "translate.js", "app.js", "lessons.js", "lifehacks.js", "common.js", "normalize.js"]:
    try:
        s = open(f, encoding="utf-8").read()
        quickjs.Context().eval(s)
        print(f"{f}: executed fully")
    except FileNotFoundError:
        print(f"{f}: SKIP (not found)")
    except quickjs.JSException as e:
        msg = str(e)
        if "SyntaxError" in msg:
            print(f"{f}: SYNTAX ERROR -> {msg}")
            fail = True
        else:
            print(f"{f}: syntax OK")

# ---------- 5. i18n key parity ----------
print("\n=== i18n ===")
ctx4 = quickjs.Context()
ctx4.eval("""
globalThis.localStorage = { getItem: () => null, setItem: () => {} };
globalThis.navigator = { language: "ru-RU" };
globalThis.window = globalThis;
globalThis.addEventListener = () => {};
globalThis.dispatchEvent = () => {};
globalThis.document = {
  readyState: "complete", documentElement: { lang: "" },
  querySelector: () => null, querySelectorAll: () => [], addEventListener: () => {},
};
""")
ctx4.eval(open("i18n.js", encoding="utf-8").read().replace("const DICT =", "globalThis.DICT ="))
ru_keys = set(json.loads(ctx4.eval("JSON.stringify(Object.keys(DICT.ru))")))
en_keys = set(json.loads(ctx4.eval("JSON.stringify(Object.keys(DICT.en))")))
if ru_keys != en_keys:
    print(f"FAIL: key mismatch: {sorted(ru_keys ^ en_keys)}")
    fail = True
else:
    print(f"dict keys match: {len(ru_keys)}")

call_re = re.compile(r'(?<![A-Za-z0-9_$.])t\(\s*"([^"]+)"')
for js in ["app.js", "lessons.js", "lifehacks.js", "translate.js"]:
    try:
        content = open(js, encoding="utf-8").read()
    except FileNotFoundError:
        continue
    for key in sorted(set(call_re.findall(content))):
        if not key.endswith(".") and key not in ru_keys:
            print(f"FAIL: {js} uses unknown key: {key}")
            fail = True
attr_re = re.compile(r'data-i18n(?:-[a-z]+)?="([^"]+)"')
for html in ["index.html", "lessons.html", "lifehacks.html"]:
    try:
        content = open(html, encoding="utf-8").read()
    except FileNotFoundError:
        continue
    for key in sorted(set(attr_re.findall(content))):
        if key not in ru_keys:
            print(f"FAIL: {html} uses unknown key: {key}")
            fail = True
print("key checks done")

sys.exit(1 if fail else 0)
