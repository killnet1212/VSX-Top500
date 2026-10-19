#!/usr/bin/env python3
"""
VSX Top500 — запуск всех проверок одним скриптом.
Выполняет:
  1. node --check для всех JS-файлов
  2. check_index.py
  3. check_new_pages.py
  4. check_collections.py
  5. check_youtube.py (если существует)
Выход: 0 если все проверки прошли, 1 если есть ошибки.
"""

import subprocess
import sys
from pathlib import Path


def run(cmd, label: str, cwd: Path) -> bool:
    """Запускает команду списком аргументов, возвращает True если OK."""
    print(f"\n{'='*60}")
    print(f"▶ {label}")
    print(f"{'='*60}")
    result = subprocess.run(cmd, cwd=str(cwd))
    return result.returncode == 0


def main():
    root = Path(__file__).parent

    # Python для проверок: сначала venv с quickjs, иначе системный
    venv_py = root / ".venv-check" / "Scripts" / "python.exe"
    py = str(venv_py) if venv_py.exists() else sys.executable

    all_ok = True

    # ---------- 1. Синтаксис JS ----------
    js_files = [
        "app.js", "i18n.js", "assistant.js", "platform.js", "screenshot.js",
        "kits.js", "kits-data.js", "first-day.js", "settings.js",
        "lifehacks.js", "prompts.js", "lessons.js", "avoid.js", "theme.js",
        "translate.js", "update-top500.js",
    ]
    print("\n" + "=" * 60)
    print("▶ 1. Синтаксис JavaScript (node --check)")
    print("=" * 60)
    for js in js_files:
        p = root / js
        if not p.exists():
            print(f"  [SKIP] {js} не найден")
            continue
        r = subprocess.run(["node", "--check", str(p)], capture_output=True)
        status = "[OK ]" if r.returncode == 0 else "[FAIL]"
        print(f"  {status} {js}")
        if r.returncode != 0:
            all_ok = False
            print(r.stderr.decode("utf-8", "replace")[:500])

    # ---------- 2–4. Python-проверки ----------
    for script, human in [
        ("check_index.py", "2. check_index.py"),
        ("check_new_pages.py", "3. check_new_pages.py"),
        ("check_collections.py", "4. check_collections.py"),
    ]:
        p = root / script
        if p.exists():
            if not run([py, script], human, root):
                all_ok = False
        else:
            print(f"\n[SKIP] {script} не найден")

    # ---------- 5. Живость YouTube-ссылок ----------
    yt_check = root / "check_youtube.py"
    if yt_check.exists():
        if not run([sys.executable, "check_youtube.py"], "5. check_youtube.py (YouTube)", root):
            all_ok = False
    else:
        print("\n[SKIP] check_youtube.py не найден")

    # Итог
    print("\n" + "="*60)
    if all_ok:
        print("✅ ВСЕ ПРОВЕРКИ ПРОЙДЕНЫ ✓")
        sys.exit(0)
    else:
        print("❌ ЕСТЬ ОШИБКИ — см. выше")
        sys.exit(1)


if __name__ == "__main__":
    main()
