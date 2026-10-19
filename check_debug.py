"""Temporary debug: why do extensions match the python/games matchers?"""
import json
import re
import urllib.request

body = json.dumps({
    "filters": [{
        "criteria": [
            {"filterType": 8, "value": "Microsoft.VisualStudio.Code"},
            {"filterType": 12, "value": "4096"},
        ],
        "pageNumber": 1, "pageSize": 500, "sortBy": 4, "sortOrder": 2,
    }],
    "assetTypes": [],
    "flags": 1 | 2 | 4 | 16 | 256 | 512,
}).encode()
req = urllib.request.Request(
    "https://marketplace.visualstudio.com/_apis/public/gallery/extensionquery",
    data=body,
    headers={"Content-Type": "application/json", "Accept": "application/json;api-version=7.1-preview.1", "User-Agent": "Mozilla/5.0"},
    method="POST",
)
with urllib.request.urlopen(req, timeout=90) as r:
    data = json.load(r)
raw = data["results"][0]["extensions"]

PY_WORDS = ["python", "django", "flask", "jupyter", "pylance", "pytest", "conda", "anaconda", "fastapi", "питон"]
GAME_RE = re.compile(r"\b(unity|godot|unreal|gamedev|gdscript|shader|sprite|tilemap|tileset|monogame|shadertoy|glsl|hlsl|webgl|three\.js|babylon|phaser|cocos|pixi|raylib|love2d|game|gaming|minecraft|arcade|pixel)\b|игр|гейм", re.I)

print("=== PYTHON matcher: reasons for suspicious items ===")
suspicious = {"ecmel.vscode-html-css", "ZainChen.json", "pflannery.vscode-versionlens", "ChakrounAnas.turbo-console-log", "GitHub.copilot-chat", "formulahendry.code-runner", "GraphQL.vscode-graphql-syntax", "AmazonWebServices.aws-toolkit-vscode"}
for e in raw:
    eid = f"{e['publisher']['publisherName']}.{e['extensionName']}"
    if eid not in suspicious:
        continue
    name = (e.get("displayName") or e["extensionName"]).lower()
    short = (e.get("shortDescription") or "").lower()
    tags = [t for t in (e.get("tags") or []) if not t.startswith("__")]
    tags_l = " ".join(tags).lower()
    idl = eid.lower()
    why = []
    for w in PY_WORDS:
        where = []
        if w in name: where.append("name")
        if w in tags_l: where.append("tags")
        if w in idl: where.append("id")
        if where: why.append(f"{w}@{'+'.join(where)}")
    print(f"{eid}: {'; '.join(why) or 'NO MATCH?!'}")
    print(f"    tags: {tags[:20]}")

print("\n=== GAMES matcher: what matched ===")
for e in raw:
    eid = f"{e['publisher']['publisherName']}.{e['extensionName']}"
    hay = f"{e.get('displayName') or ''} {e.get('shortDescription') or ''} {' '.join(e.get('tags') or [])} {' '.join(e.get('categories') or [])} {eid}"
    m = GAME_RE.search(hay)
    if m:
        print(f"{eid}: matched '{m.group(0)}' in: ...{hay[max(0,m.start()-40):m.end()+40]}...")
