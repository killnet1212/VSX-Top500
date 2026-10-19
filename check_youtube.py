#!/usr/bin/env python3
"""
VSX Top500 — проверка живости YouTube-ссылок в lessons.js.
Использует oEmbed API (https://www.youtube.com/oembed) — работает без API-ключа.
Выход: 0 если все ссылки живые, 1 если есть мёртвые.
"""

import re
import sys
import urllib.request
import urllib.error
import json
from pathlib import Path


def extract_yt_ids(js_path: Path) -> list[str]:
    """Достаёт все yt ID из lessons.js."""
    text = js_path.read_text(encoding="utf-8")
    # Ищем строки вида yt: "ID"
    ids = re.findall(r'yt:\s*"([^"]+)"', text)
    return list(dict.fromkeys(ids))  # уникальные, порядок сохранён


def check_video(video_id: str) -> tuple[bool, str]:
    """Проверяет видео через oEmbed API. Возвращает (живое, причина)."""
    url = f"https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v={video_id}&format=json"
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "VSX-Checker/1.0"})
        with urllib.request.urlopen(req, timeout=8) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            title = data.get("title", "")[:40]
            return True, f"OK ({title})"
    except urllib.error.HTTPError as e:
        if e.code == 401 or e.code == 403:
            return False, "401/403 (приватное или удалено)"
        if e.code == 404:
            return False, "404 (не найдено)"
        return False, f"HTTP {e.code}"
    except urllib.error.URLError as e:
        return False, f"Сеть: {e.reason}"
    except Exception as e:
        return False, f"Ошибка: {e}"


def main():
    root = Path(__file__).parent
    lessons = root / "lessons.js"
    if not lessons.exists():
        print(f"FAIL: {lessons} не найден")
        sys.exit(1)

    yt_ids = extract_yt_ids(lessons)
    if not yt_ids:
        print("FAIL: в lessons.js не найдено ни одного yt ID")
        sys.exit(1)

    print(f"=== Проверка YouTube-ссылок ({len(yt_ids)} видео) ===\n")
    dead = []
    for vid in yt_ids:
        ok, msg = check_video(vid)
        status = "[OK ]" if ok else "[FAIL]"
        print(f"  {status} {vid}  {msg}")
        if not ok:
            dead.append(vid)

    print()
    if dead:
        print(f"=== ИТОГ: {len(dead)} мёртвых ссылок ===")
        for vid in dead:
            print(f"  - {vid}")
        sys.exit(1)
    else:
        print(f"=== ИТОГ: все {len(yt_ids)} ссылок живые ✓ ===")
        sys.exit(0)


if __name__ == "__main__":
    main()
