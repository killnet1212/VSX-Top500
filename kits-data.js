/* ============================================================
   VSX Top500 — общие данные наборов расширений.
   Подключается на страницах «Наборы» (kits.html) и на главной,
   где работает подбор за 3 вопроса (app.js). Один источник
   правды, чтобы набор и рекомендация никогда не расходились.

   Формат плагина: { id, name, desc: { ru, en } }
   ============================================================ */

window.VSX_KITS = [
  {
    id: "start",
    icon: "🐣",
    title: { ru: "Старт для новичка", en: "Beginner starter" },
    tags: ["start", "newbie"],
    desc: {
      ru: "Десять расширений, которые делают редактор удобным с первого дня: подсказки, запуск кода, Git и порядок в файлах.",
      en: "Ten extensions that make the editor comfortable from day one: hints, running code, Git and tidy files.",
    },
    plugins: [
      { id: "usernamehw.errorlens", name: "Error Lens", desc: { ru: "Показывает ошибки прямо в строке", en: "Shows errors right in the line" } },
      { id: "formulahendry.code-runner", name: "Code Runner", desc: { ru: "Запуск кода одной кнопкой", en: "Run code with one button" } },
      { id: "eamodio.gitlens", name: "GitLens", desc: { ru: "История и авторство каждой строки", en: "History and blame for every line" } },
      { id: "streetsidesoftware.code-spell-checker", name: "Code Spell Checker", desc: { ru: "Проверка орфографии в коде и комментариях", en: "Spell checking in code and comments" } },
      { id: "editorconfig.editorconfig", name: "EditorConfig", desc: { ru: "Единый стиль отступов в проекте", en: "Consistent indentation across the project" } },
      { id: "christian-kohler.path-intellisense", name: "Path Intellisense", desc: { ru: "Автодополнение путей к файлам", en: "Autocomplete for file paths" } },
      { id: "aaron-bond.better-comments", name: "Better Comments", desc: { ru: "Цветные пометки TODO и вопросов", en: "Colour-coded TODO and question notes" } },
      { id: "oderwat.indent-rainbow", name: "Indent Rainbow", desc: { ru: "Подсветка уровней отступов", en: "Colourises indentation levels" } },
      { id: "ritwickdey.liveserver", name: "Live Server", desc: { ru: "Локальный сервер с автоперезагрузкой", en: "Local server with live reload" } },
      { id: "wayou.vscode-todo-highlight", name: "Todo Highlight", desc: { ru: "Подсветка TODO и FIXME", en: "Highlights TODO and FIXME" } },
    ],
  },
  {
    id: "web",
    icon: "🌐",
    title: { ru: "Веб-разработка", en: "Web development" },
    tags: ["web"],
    desc: {
      ru: "HTML, CSS, JavaScript и React: форматирование, линтер, Tailwind, сниппеты и живой предпросмотр.",
      en: "HTML, CSS, JavaScript and React: formatting, linting, Tailwind, snippets and live preview.",
    },
    plugins: [
      { id: "esbenp.prettier-vscode", name: "Prettier", desc: { ru: "Единое форматирование кода", en: "Consistent code formatting" } },
      { id: "dbaeumer.vscode-eslint", name: "ESLint", desc: { ru: "Находит проблемы в JS/TS на лету", en: "Catches JS/TS problems as you type" } },
      { id: "bradlc.vscode-tailwindcss", name: "Tailwind CSS IntelliSense", desc: { ru: "Классы Tailwind с подсказками", en: "Tailwind classes with hints" } },
      { id: "ritwickdey.liveserver", name: "Live Server", desc: { ru: "Предпросмотр страницы с автоперезагрузкой", en: "Page preview with live reload" } },
      { id: "formulahendry.auto-rename-tag", name: "Auto Rename Tag", desc: { ru: "Переименование парного тега", en: "Renames the matching tag" } },
      { id: "naumovs.color-highlight", name: "Color Highlight", desc: { ru: "Показывает цвета прямо в коде", en: "Shows colour swatches in code" } },
      { id: "ecmel.vscode-html-css", name: "HTML CSS Support", desc: { ru: "Подсказки CSS-классов в HTML", en: "CSS class hints inside HTML" } },
      { id: "christian-kohler.npm-intellisense", name: "npm Intellisense", desc: { ru: "Автодополнение импортов из npm", en: "Autocompletes npm imports" } },
    ],
  },
  {
    id: "python",
    icon: "🐍",
    title: { ru: "Python", en: "Python" },
    tags: ["python", "ai", "data"],
    desc: {
      ru: "Официальные расширения Microsoft плюс Ruff, Jupyter и помощники для docstring и конфигов.",
      en: "Official Microsoft extensions plus Ruff, Jupyter and helpers for docstrings and configs.",
    },
    plugins: [
      { id: "ms-python.python", name: "Python", desc: { ru: "Базовая поддержка языка от Microsoft", en: "Core language support from Microsoft" } },
      { id: "ms-python.vscode-pylance", name: "Pylance", desc: { ru: "Быстрый IntelliSense и проверка типов", en: "Fast IntelliSense and type checking" } },
      { id: "ms-toolsai.jupyter", name: "Jupyter", desc: { ru: "Ноутбуки прямо в VS Code", en: "Notebooks right inside VS Code" } },
      { id: "charliermarsh.ruff", name: "Ruff", desc: { ru: "Быстрый линтер и форматтер", en: "Fast linter and formatter" } },
      { id: "njpwerner.autodocstring", name: "autoDocstring", desc: { ru: "Docstring по нажатию клавиши", en: "Docstrings in one keystroke" } },
      { id: "ms-python.isort", name: "isort", desc: { ru: "Сортировка импортов", en: "Sorts imports" } },
      { id: "tamasfe.even-better-toml", name: "Even Better TOML", desc: { ru: "Поддержка pyproject.toml", en: "Support for pyproject.toml" } },
      { id: "redhat.vscode-yaml", name: "YAML", desc: { ru: "Поддержка YAML-конфигов", en: "YAML config support" } },
    ],
  },
  {
    id: "ai",
    icon: "🤖",
    title: { ru: "ИИ-ассистенты", en: "AI assistants" },
    tags: ["ai"],
    desc: {
      ru: "Автодополнение и чат по коду. Совет: держите включённым только один ассистент — они конфликтуют.",
      en: "Autocomplete and code chat. Tip: keep only one assistant enabled — they conflict.",
    },
    plugins: [
      { id: "github.copilot", name: "GitHub Copilot", desc: { ru: "Автодополнение кода от GitHub", en: "Code autocomplete from GitHub" } },
      { id: "github.copilot-chat", name: "Copilot Chat", desc: { ru: "Чат с ИИ прямо в редакторе", en: "AI chat right in the editor" } },
      { id: "codeium.codeium", name: "Codeium", desc: { ru: "Бесплатное автодополнение", en: "Free autocomplete" } },
      { id: "continue.continue", name: "Continue", desc: { ru: "Открытый ИИ-ассистент с любыми моделями", en: "Open AI assistant with any models" } },
      { id: "github.vscode-pull-request-github", name: "GitHub Pull Requests", desc: { ru: "Ревью и PR из редактора", en: "Review and manage PRs from the editor" } },
    ],
  },
  {
    id: "gamedev",
    icon: "🎮",
    title: { ru: "Создание игр", en: "Game development" },
    tags: ["gamedev", "games"],
    desc: {
      ru: "Unity и Godot, C# и C++ — всё, что нужно для игровых проектов в VS Code.",
      en: "Unity and Godot, C# and C++ — everything for game projects in VS Code.",
    },
    plugins: [
      { id: "visualstudiotoolsforunity.vstuc", name: "Unity", desc: { ru: "Официальная поддержка Unity", en: "Official Unity support" } },
      { id: "ms-dotnettools.csharp", name: "C#", desc: { ru: "Язык C# для скриптов Unity", en: "C# language for Unity scripts" } },
      { id: "ms-dotnettools.csdevkit", name: "C# Dev Kit", desc: { ru: "Проекты, отладка и тесты C#", en: "C# projects, debugging and tests" } },
      { id: "geequlim.godot-tools", name: "Godot Tools", desc: { ru: "Отладка и GDScript для Godot", en: "Debugging and GDScript for Godot" } },
      { id: "ms-vscode.cpptools", name: "C/C++", desc: { ru: "IntelliSense и отладка C++", en: "C++ IntelliSense and debugging" } },
      { id: "ms-vscode.cmake-tools", name: "CMake Tools", desc: { ru: "Сборка C++ проектов", en: "Building C++ projects" } },
    ],
  },
  {
    id: "git",
    icon: "🔧",
    title: { ru: "Git и командная работа", en: "Git and teamwork" },
    tags: ["git"],
    desc: {
      ru: "Наглядная история, граф веток, pull request'ы и совместное редактирование в реальном времени.",
      en: "Visual history, branch graph, pull requests and real-time collaboration.",
    },
    plugins: [
      { id: "eamodio.gitlens", name: "GitLens", desc: { ru: "Blame, история и сравнение версий", en: "Blame, history and comparisons" } },
      { id: "mhutchie.git-graph", name: "Git Graph", desc: { ru: "Граф веток и коммитов", en: "Branch and commit graph" } },
      { id: "github.vscode-pull-request-github", name: "GitHub Pull Requests", desc: { ru: "PR и ревью из редактора", en: "PRs and reviews in the editor" } },
      { id: "github.vscode-github-actions", name: "GitHub Actions", desc: { ru: "Статусы CI прямо в VS Code", en: "CI status right in VS Code" } },
      { id: "donjayamanne.githistory", name: "Git History", desc: { ru: "История файла и строк", en: "File and line history" } },
      { id: "ms-vsliveshare.vsliveshare", name: "Live Share", desc: { ru: "Совместное редактирование в реальном времени", en: "Real-time collaborative editing" } },
    ],
  },
];

/* ---------- Дополнения по языку (вопрос №2 в подборе) ---------- */
window.VSX_LANG_KITS = {
  js: {
    label: "JavaScript / TypeScript",
    plugins: [
      { id: "esbenp.prettier-vscode", name: "Prettier", desc: { ru: "Форматтер для JS, TS, CSS и JSON", en: "Formatter for JS, TS, CSS and JSON" } },
      { id: "dbaeumer.vscode-eslint", name: "ESLint", desc: { ru: "Линтер JavaScript и TypeScript", en: "JavaScript and TypeScript linter" } },
      { id: "christian-kohler.npm-intellisense", name: "npm Intellisense", desc: { ru: "Автодополнение импортов из npm", en: "Autocompletes npm imports" } },
      { id: "dsznajder.es7-react-js-snippets", name: "ES7+ React Snippets", desc: { ru: "Сниппеты React-компонентов", en: "React component snippets" } },
    ],
  },
  python: {
    label: "Python",
    plugins: [
      { id: "ms-python.python", name: "Python", desc: { ru: "Поддержка языка от Microsoft", en: "Language support from Microsoft" } },
      { id: "ms-python.vscode-pylance", name: "Pylance", desc: { ru: "IntelliSense и проверка типов", en: "IntelliSense and type checking" } },
      { id: "charliermarsh.ruff", name: "Ruff", desc: { ru: "Очень быстрый линтер", en: "Very fast linter" } },
      { id: "ms-toolsai.jupyter", name: "Jupyter", desc: { ru: "Ноутбуки в редакторе", en: "Notebooks in the editor" } },
    ],
  },
  csharp: {
    label: "C#",
    plugins: [
      { id: "ms-dotnettools.csharp", name: "C#", desc: { ru: "Язык C# и отладка", en: "C# language and debugging" } },
      { id: "ms-dotnettools.csdevkit", name: "C# Dev Kit", desc: { ru: "Проекты, тесты и решения", en: "Projects, tests and solutions" } },
    ],
  },
  cpp: {
    label: "C / C++",
    plugins: [
      { id: "ms-vscode.cpptools", name: "C/C++", desc: { ru: "IntelliSense и отладчик", en: "IntelliSense and debugger" } },
      { id: "ms-vscode.cmake-tools", name: "CMake Tools", desc: { ru: "Сборка проектов C++", en: "Building C++ projects" } },
    ],
  },
  java: {
    label: "Java",
    plugins: [
      { id: "redhat.java", name: "Language Support for Java", desc: { ru: "Сервер языка Java", en: "Java language server" } },
      { id: "vscjava.vscode-java-pack", name: "Extension Pack for Java", desc: { ru: "Всё для Java сразу", en: "Everything for Java at once" } },
    ],
  },
  go: {
    label: "Go",
    plugins: [
      { id: "golang.go", name: "Go", desc: { ru: "Официальное расширение Go", en: "Official Go extension" } },
    ],
  },
  rust: {
    label: "Rust",
    plugins: [
      { id: "rust-lang.rust-analyzer", name: "rust-analyzer", desc: { ru: "Умные подсказки для Rust", en: "Smart hints for Rust" } },
    ],
  },
  php: {
    label: "PHP",
    plugins: [
      { id: "bmewburn.vscode-intelephense-client", name: "PHP Intelephense", desc: { ru: "IntelliSense для PHP", en: "PHP IntelliSense" } },
      { id: "xdebug.php-debug", name: "PHP Debug", desc: { ru: "Отладчик PHP", en: "PHP debugger" } },
    ],
  },
  other: {
    label: "Другой язык",
    plugins: [
      { id: "usernamehw.errorlens", name: "Error Lens", desc: { ru: "Ошибки прямо в строке", en: "Errors right in the line" } },
      { id: "editorconfig.editorconfig", name: "EditorConfig", desc: { ru: "Единый стиль отступов", en: "Consistent indentation" } },
      { id: "formulahendry.code-runner", name: "Code Runner", desc: { ru: "Запуск кода на любом языке", en: "Run code in any language" } },
    ],
  },
};

/* ---------- Дополнения по опыту (вопрос №3 в подборе) ---------- */
window.VSX_LEVEL_KITS = {
  newbie: {
    label: { ru: "Новичок", en: "Newbie" },
    plugins: [
      { id: "usernamehw.errorlens", name: "Error Lens", desc: { ru: "Сразу видно, где ошибка", en: "Shows straight away where the error is" } },
      { id: "formulahendry.code-runner", name: "Code Runner", desc: { ru: "Запуск кода одной кнопкой", en: "Run code with one button" } },
      { id: "streetsidesoftware.code-spell-checker", name: "Code Spell Checker", desc: { ru: "Ловит опечатки в коде", en: "Catches typos in code" } },
      { id: "aaron-bond.better-comments", name: "Better Comments", desc: { ru: "Пометки цветом", en: "Colour-coded notes" } },
    ],
  },
  mid: {
    label: { ru: "Средний уровень", en: "Intermediate" },
    plugins: [
      { id: "eamodio.gitlens", name: "GitLens", desc: { ru: "История и авторы строк", en: "Line history and authors" } },
      { id: "editorconfig.editorconfig", name: "EditorConfig", desc: { ru: "Общий стиль в команде", en: "Shared style across the team" } },
      { id: "christian-kohler.path-intellisense", name: "Path Intellisense", desc: { ru: "Пути к файлам с подсказками", en: "File paths with hints" } },
      { id: "gruntfuggly.todo-tree", name: "Todo Tree", desc: { ru: "Все TODO в одном дереве", en: "All TODOs in one tree" } },
    ],
  },
  pro: {
    label: { ru: "Профи", en: "Advanced" },
    plugins: [
      { id: "ms-vscode-remote.remote-ssh", name: "Remote - SSH", desc: { ru: "Работа на удалённом сервере", en: "Work on a remote server" } },
      { id: "ms-vscode-remote.remote-containers", name: "Dev Containers", desc: { ru: "Однородная среда в контейнере", en: "Reproducible environment in a container" } },
      { id: "alefragnani.project-manager", name: "Project Manager", desc: { ru: "Быстрое переключение проектов", en: "Fast project switching" } },
      { id: "wix.vscode-import-cost", name: "Import Cost", desc: { ru: "Вес импортов прямо в коде", en: "Import size inline" } },
    ],
  },
};
