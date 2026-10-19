/* ============================================================
   VSX Top500 — страница «Промпты» (prompts.html)
   Готовые промпты для ИИ-ассистентов (GitHub Copilot, ChatGPT,
   Koda и других) по трём уровням: новичкам, знающим, ветеранам
   VS Code. Промпт копируется в буфер одной кнопкой.
   ============================================================ */

(() => {
  "use strict";

  const t = (key, vars) => window.I18N.t(key, vars);
  const lang = () => window.I18N.lang;
  const esc = (s) =>
    String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  // ---------- Промпты ----------
  // level: novice (новичкам) | skilled (знающим) | pro (ветеранам VS Code)
  // cat: code | refactor | tests | debug | docs | learn | prod | ai
  // В текстах промптов квадратные скобки — плейсхолдеры для подстановки.
  const PROMPTS = [
    // ===== Новичкам =====
    {
      icon: "🐣",
      level: "novice",
      cat: "learn",
      title: { ru: "Объясни незнакомый код", en: "Explain unfamiliar code" },
      desc: {
        ru: "Разбор построчно, простыми словами — даже если такой синтаксис вы видите впервые.",
        en: "A line-by-line walkthrough in plain words — even if the syntax is new to you.",
      },
      prompt: {
        ru: "Объясни, что делает этот код, простыми словами и построчно. Для каждой строки добавь короткий комментарий. В конце перечисли, что нужно изучить, чтобы понимать такой код самостоятельно.\n\nВот код:\n[вставьте ваш код]",
        en: "Explain what this code does in plain words, line by line. Add a short comment for every line. At the end, list what I should learn to understand such code on my own.\n\nHere is the code:\n[paste your code]",
      },
      tip: {
        ru: "В Copilot Chat выделите код, нажмите Ctrl+Alt+I и вставьте промпт.",
        en: "In Copilot Chat select the code, press Ctrl+Alt+I and paste the prompt.",
      },
    },
    {
      icon: "🚀",
      level: "novice",
      cat: "code",
      title: { ru: "Первый скрипт и его запуск", en: "Your first script and how to run it" },
      desc: {
        ru: "Пошагово: какой файл создать, что написать и какой кнопкой запустить — без лишней теории.",
        en: "Step by step: which file to create, what to write and which button runs it — no extra theory.",
      },
      prompt: {
        ru: "Я новичок и только установил VS Code. Помоги написать первый скрипт на [язык]: какой файл создать, какой код в него вставить и как запустить его прямо в редакторе. Объясни каждый шаг так, будто я делаю это впервые.",
        en: "I'm a beginner and just installed VS Code. Help me write my first script in [language]: which file to create, what code to put in it and how to run it right in the editor. Explain every step as if I'm doing this for the first time.",
      },
      tip: {
        ru: "Укажите язык — Python, JavaScript, C++ — и ОС, если это важно.",
        en: "Specify the language — Python, JavaScript, C++ — and the OS if it matters.",
      },
    },
    {
      icon: "🔍",
      level: "novice",
      cat: "debug",
      title: { ru: "Найди ошибку и объясни её", en: "Find the bug and explain it" },
      desc: {
        ru: "Почему код упал, что исправить и как не повторить эту ошибку.",
        en: "Why the code broke, what to fix and how to avoid repeating the mistake.",
      },
      prompt: {
        ru: "В моём коде ошибка: [вставьте текст ошибки].\n\nВот код:\n[вставьте ваш код]\n\nНайди причину, объясни простыми словами, почему она возникла, и покажи исправленный вариант кода.",
        en: "My code has an error: [paste the error message].\n\nHere is the code:\n[paste your code]\n\nFind the cause, explain in plain words why it happened and show the fixed version of the code.",
      },
      tip: {
        ru: "Ошибки удобно копировать прямо из панели Problems: Ctrl+Shift+M.",
        en: "The easiest way to copy errors is from the Problems panel: Ctrl+Shift+M.",
      },
    },
    {
      icon: "⌨️",
      level: "novice",
      cat: "prod",
      title: { ru: "Шпаргалка горячих клавиш", en: "A hotkey cheat sheet" },
      desc: {
        ru: "Персональный список клавиш под вашу задачу — вместо сотни ненужных.",
        en: "A personal hotkey list for your task — instead of a hundred useless ones.",
      },
      prompt: {
        ru: "Составь список из 10 самых полезных горячих клавиш VS Code для задачи «[чем вы занимаетесь]». Для каждой клавиши — одно короткое предложение, что она делает. Я работаю на [Windows/macOS/Linux].",
        en: "Make a list of the 10 most useful VS Code hotkeys for «[what you do]». For each key — one short sentence about what it does. I work on [Windows/macOS/Linux].",
      },
      tip: {
        ru: "Ещё больше клавиш — на странице «Лайфхаки» на этом сайте.",
        en: "Even more keys are on the “Lifehacks” page of this site.",
      },
    },
    {
      icon: "📚",
      level: "novice",
      cat: "learn",
      title: { ru: "План обучения на 7 дней", en: "A 7-day learning plan" },
      desc: {
        ru: "30 минут в день — от установки редактора до уверенной работы в нём.",
        en: "30 minutes a day — from installing the editor to working confidently in it.",
      },
      prompt: {
        ru: "Составь план изучения Visual Studio Code для новичка на 7 дней, по 30 минут в день. Для каждого дня: тема, что сделать на практике и какой результат должен получиться. Учитывай, что я пишу код на [язык].",
        en: "Make a 7-day plan for a beginner to learn Visual Studio Code, 30 minutes a day. For each day: the topic, what to practice and the result I should get. Take into account that I write code in [language].",
      },
      tip: {
        ru: "Потом попросите сжать план до 3 дней или расширить до месяца.",
        en: "Afterwards, ask to squeeze the plan into 3 days or stretch it to a month.",
      },
    },
    {
      icon: "🧯",
      level: "novice",
      cat: "code",
      title: { ru: "Объясни сообщение редактора", en: "Explain the editor's warning" },
      desc: {
        ru: "Красные подчёркивания и предупреждения больше не пугают.",
        en: "Red squiggles and warnings stop being scary.",
      },
      prompt: {
        ru: "VS Code подчёркивает мой код и показывает: [сообщение об ошибке]. Объясни, что это значит, почему возникло и как исправить. Если вариантов несколько — покажи самый простой.",
        en: "VS Code underlines my code and shows: [error message]. Explain what it means, why it happened and how to fix it. If there are several options, show the simplest one.",
      },
      tip: {
        ru: "Наведите курсор на подчёркнутый код — сообщение появится во всплывающей подсказке.",
        en: "Hover over the underlined code — the message appears in a tooltip.",
      },
    },
    {
      icon: "📁",
      level: "novice",
      cat: "learn",
      title: { ru: "Структура проекта", en: "Project structure" },
      desc: {
        ru: "Какие файлы и папки создать — без воды, с примерами.",
        en: "Which files and folders to create — no fluff, with examples.",
      },
      prompt: {
        ru: "Я начинаю проект на [язык/фреймворк] для [что делаю]. Предложи структуру папок и файлов, объясни назначение каждой папки и какие файлы создать в первую очередь.",
        en: "I'm starting a project in [language/framework] to [what you're building]. Suggest a folder and file structure, explain the purpose of each folder and which files to create first.",
      },
      tip: {
        ru: "VS Code может создать структуру автоматически: Ctrl+Shift+P → «Configure Snippets».",
        en: "VS Code can scaffold it automatically: Ctrl+Shift+P → \"Configure Snippets\".",
      },
    },
    {
      icon: "🎨",
      level: "novice",
      cat: "prod",
      title: { ru: "Выбор темы и шрифта", en: "Choosing a theme and font" },
      desc: {
        ru: "Как настроить внешний вид редактора под себя.",
        en: "How to set up the editor's look to suit you.",
      },
      prompt: {
        ru: "Я работаю в VS Code на [Windows/macOS/Linux], глаза устают от [яркого/тёмного] фона. Посоветуй 3–5 тем и 2–3 моноширинных шрифта для комфортной работы, объясни как их установить и настроить.",
        en: "I use VS Code on [Windows/macOS/Linux], my eyes get tired from [bright/dark] backgrounds. Recommend 3–5 themes and 2–3 monospace fonts for comfortable work, explain how to install and configure them.",
      },
      tip: {
        ru: "Быстрая смена темы: Ctrl+K Ctrl+T.",
        en: "Quick theme switch: Ctrl+K Ctrl+T.",
      },
    },
    {
      icon: "🔀",
      level: "novice",
      cat: "learn",
      title: { ru: "Git для новичков", en: "Git for beginners" },
      desc: {
        ru: "Первые коммиты, ветки и push — без страха всё сломать.",
        en: "Your first commits, branches and push — without fear of breaking everything.",
      },
      prompt: {
        ru: "Я новичок в Git. Объясни простыми словами, что такое репозиторий, коммит, ветка и push. Дай 5 команд для начала работы с VS Code и объясни, когда каждая нужна. Как откатить последний коммит, если я ошибся?",
        en: "I'm new to Git. Explain in simple words what a repository, commit, branch and push are. Give me 5 commands to start working with VS Code and explain when each is needed. How do I undo the last commit if I made a mistake?",
      },
      tip: {
        ru: "В VS Code Git встроен: панель Source Control на боковой панели.",
        en: "Git is built into VS Code: the Source Control panel on the sidebar.",
      },
    },

    // ===== Знающим =====
    {
      icon: "♻️",
      level: "skilled",
      cat: "refactor",
      title: { ru: "Отрефактори без изменения поведения", en: "Refactor without changing behaviour" },
      desc: {
        ru: "Читаемость, имена и дублирование — под контролем, логика та же.",
        en: "Readability, naming and duplication under control — the logic stays the same.",
      },
      prompt: {
        ru: "Отрефактори этот код: улучши структуру и читаемость, убери дублирование, дай понятные имена переменным и функциям. Поведение менять нельзя. Покажи результат и коротко перечисли, что и почему ты изменил.\n\n[вставьте код]",
        en: "Refactor this code: improve the structure and readability, remove duplication, give clear names to variables and functions. Behaviour must not change. Show the result and briefly list what you changed and why.\n\n[paste the code]",
      },
      tip: {
        ru: "Добавьте «следуй стилю проекта» или «используй паттерн [название]».",
        en: "Add “follow the project style” or “use the [name] pattern”.",
      },
    },
    {
      icon: "🧪",
      level: "skilled",
      cat: "tests",
      title: { ru: "Юнит-тесты для функции", en: "Unit tests for a function" },
      desc: {
        ru: "Обычные случаи, граничные значения и ошибочные входные данные.",
        en: "Normal cases, edge values and invalid input.",
      },
      prompt: {
        ru: "Напиши юнит-тесты для этого кода на [фреймворк: Jest, pytest, JUnit…]. Покрой обычные случаи, граничные значения и ошибочные входные данные. Для каждого теста напиши, что именно он проверяет.\n\n[вставьте код]",
        en: "Write unit tests for this code using [framework: Jest, pytest, JUnit…]. Cover normal cases, edge values and invalid input. For every test, write what exactly it checks.\n\n[paste the code]",
      },
      tip: {
        ru: "Укажите, как запускаются тесты в проекте, — ИИ подстроит импорты.",
        en: "Mention how tests are run in the project — the AI will adjust imports.",
      },
    },
    {
      icon: "🐛",
      level: "skilled",
      cat: "debug",
      title: { ru: "Разбери стек ошибки", en: "Make sense of a stack trace" },
      desc: {
        ru: "От stack trace — к конкретному файлу, строке и плану проверки.",
        en: "From a stack trace to the exact file, line and a checklist.",
      },
      prompt: {
        ru: "Вот стек ошибки из моего приложения:\n[вставьте stack trace]\n\nОбъясни, что произошло, в каком файле искать причину и какие три проверки сделать в первую очередь. Предложи, как воспроизвести проблему.",
        en: "Here is a stack trace from my application:\n[paste the stack trace]\n\nExplain what happened, which file to look at first and which three checks to run before anything else. Suggest how to reproduce the issue.",
      },
      tip: {
        ru: "Приложите код из верхних строк стека — ответ станет точнее.",
        en: "Attach the code from the top frames of the stack — the answer gets sharper.",
      },
    },
    {
      icon: "📖",
      level: "skilled",
      cat: "docs",
      title: { ru: "Задокументируй модуль", en: "Document a module" },
      desc: {
        ru: "JSDoc, docstring или README — за один проход, в вашем стиле.",
        en: "JSDoc, docstrings or a README — in one pass, in your style.",
      },
      prompt: {
        ru: "Напиши документацию к этому коду в формате [JSDoc / docstring / README]: назначение, параметры, возвращаемые значения и пример использования. Пиши так, чтобы понял разработчик, который видит этот код впервые.\n\n[вставьте код]",
        en: "Write documentation for this code in [JSDoc / docstring / README] format: purpose, parameters, return values and a usage example. Write it so that a developer seeing this code for the first time understands it.\n\n[paste the code]",
      },
      tip: {
        ru: "Для README добавьте: «в стиле GitHub Markdown, с примерами запуска».",
        en: "For a README add: “GitHub Markdown style, with run examples”.",
      },
    },
    {
      icon: "⚡",
      level: "skilled",
      cat: "refactor",
      title: { ru: "Ускорь медленный код", en: "Speed up slow code" },
      desc: {
        ru: "Три способа оптимизации — от простого к сложному, с объяснением.",
        en: "Three optimisation options — from simple to advanced, all explained.",
      },
      prompt: {
        ru: "Этот код работает медленно. Предложи три способа ускорить его — от самого простого к самому сложному — и покажи оптимизированную версию. Объясни, почему каждый способ помогает и когда его применять.\n\n[вставьте код]",
        en: "This code runs slowly. Suggest three ways to speed it up — from the simplest to the most advanced — and show the optimised version. Explain why each approach helps and when to apply it.\n\n[paste the code]",
      },
      tip: {
        ru: "Добавьте, на каком объёме данных тормозит: например, «100 тысяч записей».",
        en: "Mention the data size where it slows down, e.g. “100 thousand records”.",
      },
    },
    {
      icon: "🕳️",
      level: "skilled",
      cat: "debug",
      title: { ru: "Найди крайние случаи", en: "Find the edge cases" },
      desc: {
        ru: "Пустые значения, переполнение, неверные типы — до того, как их найдёт пользователь.",
        en: "Empty values, overflow, wrong types — before a user finds them.",
      },
      prompt: {
        ru: "Проанализируй этот код и найди все крайние случаи, которые могут его сломать: пустые значения, отрицательные числа, большие объёмы данных, неверные типы. Для каждого случая приведи пример входных данных, при которых код упадёт или выдаст неверный результат.\n\n[вставьте код]",
        en: "Analyse this code and find every edge case that can break it: empty values, negative numbers, large data volumes, wrong types. For each case, give an input example that makes the code crash or produce a wrong result.\n\n[paste the code]",
      },
      tip: {
        ru: "Отличный прогон перед code review или релизом.",
        en: "A great pass before code review or a release.",
      },
    },
    {
      icon: "📦",
      level: "skilled",
      cat: "refactor",
      title: { ru: "Миграция зависимостей", en: "Dependency migration" },
      desc: {
        ru: "С одной библиотеки на другую — по шагам, с проверкой результатов.",
        en: "From one library to another — step by step, with result checks.",
      },
      prompt: {
        ru: "Нужно мигрировать этот код с [библиотека/фреймворк A] на [библиотека/фреймворк B]. Предложи пошаговый план миграции, покажи как переписать ключевые фрагменты и как убедиться, что поведение не изменилось.\n\n[вставьте код]",
        en: "This code needs migrating from [library/framework A] to [library/framework B]. Suggest a step-by-step migration plan, show how to rewrite the key fragments and how to verify that behaviour hasn't changed.\n\n[paste the code]",
      },
      tip: {
        ru: "Запустите тесты до и после миграции — это лучший способ поймать регрессии.",
        en: "Run your tests before and after the migration — the best way to catch regressions.",
      },
    },
    {
      icon: "🔌",
      level: "skilled",
      cat: "code",
      title: { ru: "API-эндпоинт по описанию", en: "API endpoint from a description" },
      desc: {
        ru: "Роут, валидация, обработка ошибок и тест — за один промпт.",
        en: "Route, validation, error handling and a test — in one prompt.",
      },
      prompt: {
        ru: "Напиши API-эндпоинт [GET/POST/PUT/DELETE] /api/[resource] на [фреймворк: Express, FastAPI, ASP.NET…]. Включи: валидацию входных данных, обработку ошибок, ответ в JSON. Добавь один интеграционный тест.\n\nОписание: [что делает эндпоинт]",
        en: "Write an API endpoint [GET/POST/PUT/DELETE] /api/[resource] in [framework: Express, FastAPI, ASP.NET…]. Include: input validation, error handling, a JSON response. Add one integration test.\n\nDescription: [what the endpoint does]",
      },
      tip: {
        ru: "REST Client в VS Code позволяет тестировать эндпоинты прямо из редактора.",
        en: "REST Client in VS Code lets you test endpoints right in the editor.",
      },
    },
    {
      icon: "🌍",
      level: "skilled",
      cat: "docs",
      title: { ru: "README для проекта", en: "README for the project" },
      desc: {
        ru: "Быстрый старт, примеры, скриншоты — всё, что нужно новому разработчику.",
        en: "Quick start, examples, screenshots — everything a new developer needs.",
      },
      prompt: {
        ru: "Напиши README.md для проекта: [название, стек, что делает]. Включи: описание, требования, установку, быстрый старт, примеры кода, конфигурацию окружения и как запустить тесты. Формат GitHub Markdown.",
        en: "Write a README.md for the project: [name, stack, what it does]. Include: description, requirements, installation, quick start, code examples, environment config and how to run tests. GitHub Markdown format.",
      },
      tip: {
        ru: "Расширение Markdown Preview Enhanced покажет превью прямо в VS Code.",
        en: "Markdown Preview Enhanced shows the preview right in VS Code.",
      },
    },

    // ===== Ветеранам VS Code =====
    {
      icon: "🤖",
      level: "pro",
      cat: "ai",
      title: { ru: "Инструкции для Copilot в репозитории", en: "Copilot instructions for the repo" },
      desc: {
        ru: "Файл, который делает ответы Copilot точнее во всём проекте.",
        en: "The file that makes Copilot's answers sharper across the whole project.",
      },
      prompt: {
        ru: "Сгенерируй файл .github/copilot-instructions.md для моего проекта. Включи: стек и версии, структуру папок, правила стиля кода, команды запуска, тестов и сборки, а также то, что нельзя менять. Пиши кратко, пунктами — Copilot будет использовать это как контекст.\n\nО проекте: [стек, пара предложений о задаче]",
        en: "Generate a .github/copilot-instructions.md file for my project. Include: stack and versions, folder structure, code style rules, commands for running, testing and building, and things that must not be changed. Keep it short and bulleted — Copilot will use it as context.\n\nAbout the project: [stack, a couple of sentences about the task]",
      },
      tip: {
        ru: "Copilot в VS Code автоматически читает этот файл и учитывает его в ответах.",
        en: "Copilot in VS Code reads this file automatically and uses it in its answers.",
      },
    },
    {
      icon: "🏗️",
      level: "pro",
      cat: "refactor",
      title: { ru: "Спроектируй архитектуру модуля", en: "Design a module's architecture" },
      desc: {
        ru: "Границы, слои и точки роста — до того, как написана первая строка.",
        en: "Boundaries, layers and growth points — before the first line is written.",
      },
      prompt: {
        ru: "Спроектируй архитектуру для [задача] на [стек]. Предложи структуру модулей и их ответственность, точки расширения и то, как решение переживёт рост проекта. Учти принципы SOLID. Оформи как список, в конце опиши риски и компромиссы.",
        en: "Design the architecture for [task] in [stack]. Suggest the module structure and responsibilities, extension points and how the solution will survive the project's growth. Follow SOLID. Format it as a list and describe the risks and trade-offs at the end.",
      },
      tip: {
        ru: "Попросите альтернативный вариант — и сравните два подхода.",
        en: "Ask for an alternative option — and compare the two approaches.",
      },
    },
    {
      icon: "🧑‍⚖️",
      level: "pro",
      cat: "debug",
      title: { ru: "Ревью уровня senior", en: "A senior-level code review" },
      desc: {
        ru: "Строгая проверка по приоритетам: блокеры, важно, мелочи.",
        en: "A strict check by priority: blockers, important, nitpicks.",
      },
      prompt: {
        ru: "Проведи строгое code review этого кода как senior-разработчик. Проверь архитектуру, читаемость, производительность, безопасность и тесты. Сгруппируй замечания по приоритету: блокеры, важно, мелочи. Для каждого замечания предложи исправление.\n\n[вставьте код]",
        en: "Do a strict code review of this code as a senior developer. Check architecture, readability, performance, security and tests. Group the findings by priority: blockers, important, nitpicks. For every finding, suggest a fix.\n\n[paste the code]",
      },
      tip: {
        ru: "Добавьте «будь придирчив и не хвали» — замечаний станет больше.",
        en: "Add “be picky and don't praise” — you'll get more findings.",
      },
    },
    {
      icon: "🔐",
      level: "pro",
      cat: "debug",
      title: { ru: "Аудит безопасности по OWASP", en: "OWASP security audit" },
      desc: {
        ru: "Инъекции, XSS, утечки — с уровнем критичности и примером эксплуатации.",
        en: "Injections, XSS, leaks — with severity levels and exploit examples.",
      },
      prompt: {
        ru: "Проверь этот код на уязвимости из OWASP Top 10: инъекции, XSS, утечки данных, небезопасную работу с зависимостями. Для каждой находки укажи уровень критичности, пример эксплуатации и конкретное исправление. Если уязвимостей нет — так и скажи.\n\n[вставьте код]",
        en: "Check this code for vulnerabilities from the OWASP Top 10: injections, XSS, data leaks, unsafe dependency handling. For each finding, give the severity level, an exploit example and a concrete fix. If there are no vulnerabilities — say so.\n\n[paste the code]",
      },
      tip: {
        ru: "Уточните контекст: серверный код, фронтенд или CLI-утилита.",
        en: "Specify the context: server code, frontend or a CLI tool.",
      },
    },
    {
      icon: "📋",
      level: "pro",
      cat: "docs",
      title: { ru: "Составь ADR — запись об архитектурном решении", en: "Write an ADR — architecture decision record" },
      desc: {
        ru: "Контекст, варианты, выбор и последствия — в одном файле.",
        en: "Context, options, decision and consequences — in one file.",
      },
      prompt: {
        ru: "Составь ADR (Architecture Decision Record) для решения: [что решили и почему]. Формат: заголовок, статус, контекст, рассмотренные варианты, выбранный вариант и последствия (плюсы и минусы). Стиль — сухой и деловой, как в инженерной документации.",
        en: "Write an ADR (Architecture Decision Record) for the decision: [what was decided and why]. Format: title, status, context, considered options, chosen option and consequences (pros and cons). Style — dry and businesslike, as in engineering docs.",
      },
      tip: {
        ru: "Храните ADR в docs/adr/ — команде будет проще понимать решения.",
        en: "Keep ADRs in docs/adr/ — the team will understand decisions faster.",
      },
    },
    {
      icon: "🚦",
      level: "pro",
      cat: "prod",
      title: { ru: "CI с тестами на GitHub Actions", en: "CI with tests on GitHub Actions" },
      desc: {
        ru: "Линтер, тесты и сборка при каждом push — с кешем и комментариями.",
        en: "Linter, tests and build on every push — with caching and comments.",
      },
      prompt: {
        ru: "Напиши workflow GitHub Actions для проекта на [стек]: установка зависимостей, линтер, тесты и сборка при push и pull request. Добавь кеширование зависимостей и комментарии к каждой секции YAML, чтобы я понимал, что происходит.",
        en: "Write a GitHub Actions workflow for a project in [stack]: installing dependencies, linter, tests and build on push and pull request. Add dependency caching and comments for every YAML section so I understand what is going on.",
      },
      tip: {
        ru: "Укажите версию Node/Python — workflow заработает без правок.",
        en: "Specify the Node/Python version — the workflow will run without edits.",
      },
    },
    {
      icon: "🧩",
      level: "pro",
      cat: "ai",
      title: { ru: "Промпт-инжиниринг для Copilot Chat", en: "Prompt engineering for Copilot Chat" },
      desc: {
        ru: "Стратегия промптов, которая даёт стабильно точные ответы.",
        en: "A prompting strategy that gives consistently accurate answers.",
      },
      prompt: {
        ru: "Объясни, как правильно формулировать запросы в GitHub Copilot Chat в VS Code: контекст файла, @workspace, /explain, /tests, /fix. Дай 5 шаблонов промптов для типичных задач (рефакторинг, отладка, тесты, документация, архитектура) и объясни, почему они работают.",
        en: "Explain how to formulate queries in GitHub Copilot Chat in VS Code: file context, @workspace, /explain, /tests, /fix. Give 5 prompt templates for typical tasks (refactoring, debugging, tests, docs, architecture) and explain why they work.",
      },
      tip: {
        ru: "Используйте @workspace для вопросов по всему проекту, @vscode — для настроек редактора.",
        en: "Use @workspace for whole-project questions, @vscode for editor settings.",
      },
    },
    {
      icon: "⚙️",
      level: "pro",
      cat: "prod",
      title: { ru: "Настройки VS Code через settings.json", en: "VS Code settings via settings.json" },
      desc: {
        ru: "Готовый settings.json под вашу связку языков и инструментов.",
        en: "A ready settings.json for your language and tooling stack.",
      },
      prompt: {
        ru: "Составь settings.json для VS Code под мой стек: [языки, фреймворки, инструменты]. Включи: форматирование, линтеры, отладку, поиск и appearance. Добавь комментарии к каждой секции через //.",
        en: "Create a settings.json for VS Code for my stack: [languages, frameworks, tools]. Include: formatting, linters, debugging, search and appearance. Add comments for each section using //.",
      },
      tip: {
        ru: "Открыть settings.json: Ctrl+Shift+P → \"Open Settings (JSON)\".",
        en: "Open settings.json: Ctrl+Shift+P → \"Open Settings (JSON)\".",
      },
    },
  ];

  const FILTERS = [
    { id: "all", labelKey: "prompts.level.all" },
    { id: "novice", labelKey: "prompts.level.novice" },
    { id: "skilled", labelKey: "prompts.level.skilled" },
    { id: "pro", labelKey: "prompts.level.pro" },
  ];

  // ---------- DOM ----------
  const grid = document.getElementById("promptsGrid");
  const filtersEl = document.getElementById("promptFilters");
  const countEl = document.getElementById("promptCount");
  const emptyEl = document.getElementById("promptsEmpty");
  const searchInput = document.getElementById("promptSearch");

  let activeFilter = "all";

  // ---------- Filters ----------
  function renderFilters() {
    filtersEl.innerHTML = "";
    FILTERS.forEach((f) => {
      const n = f.id === "all" ? PROMPTS.length : PROMPTS.filter((p) => p.level === f.id).length;
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "filter-chip" + (f.id === activeFilter ? " active" : "");
      btn.innerHTML = `${esc(t(f.labelKey))} <span class="filter-count">${n}</span>`;
      btn.addEventListener("click", () => {
        activeFilter = f.id;
        renderFilters();
        render();
      });
      filtersEl.appendChild(btn);
    });
  }

  // ---------- Render ----------
  function getVisible() {
    const q = searchInput.value.trim().toLowerCase();
    const lg = lang();
    return PROMPTS.filter((p) => {
      if (activeFilter !== "all" && p.level !== activeFilter) return false;
      if (!q) return true;
      const hay =
        `${p.title[lg]} ${p.desc[lg]} ${p.prompt[lg]} ${p.tip[lg]} ` +
        `${t("prompts.cat." + p.cat)} ${t("prompts.level." + p.level)}`;
      return hay.toLowerCase().includes(q);
    });
  }

  function render() {
    const list = getVisible();
    grid.innerHTML = "";
    emptyEl.hidden = list.length > 0;
    countEl.textContent = t("prompts.count", { n: list.length });

    const lg = lang();
    const frag = document.createDocumentFragment();
    list.forEach((p, i) => {
      const card = document.createElement("article");
      card.className = "prompt-card";
      card.style.setProperty("--i", Math.min(i, 20));
      card.innerHTML = `
        <div class="prompt-top">
          <span class="prompt-icon" aria-hidden="true">${p.icon}</span>
          <div class="prompt-badges">
            <span class="prompt-level ${p.level}">${esc(t("prompts.level." + p.level))}</span>
            <span class="prompt-cat">${esc(t("prompts.cat." + p.cat))}</span>
          </div>
        </div>
        <h3 class="prompt-title">${esc(p.title[lg])}</h3>
        <p class="prompt-desc">${esc(p.desc[lg])}</p>
        <pre class="prompt-text">${esc(p.prompt[lg])}</pre>
        <p class="prompt-tip">💡 ${esc(p.tip[lg])}</p>
        <div class="prompt-foot">
          <button class="btn btn-primary prompt-copy" type="button" title="${esc(t("prompts.copyTitle"))}">${esc(t("prompts.copy"))}</button>
        </div>`;

      card.querySelector(".prompt-copy").addEventListener("click", () => {
        copyText(p.prompt[lg]).then(() => toast(t("prompts.copied")));
      });

      frag.appendChild(card);
    });
    grid.appendChild(frag);
  }

  // ---------- Clipboard ----------
  async function copyText(text) {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return;
      }
    } catch {
      /* fall through to legacy path */
    }
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.cssText = "position:fixed;opacity:0";
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand("copy");
    } finally {
      ta.remove();
    }
  }

  // ---------- Toast ----------
  let toastEl;
  function toast(text) {
    if (!toastEl) {
      toastEl = document.createElement("div");
      toastEl.className = "toast";
      document.body.appendChild(toastEl);
    }
    toastEl.textContent = text;
    toastEl.classList.add("show");
    clearTimeout(toastEl._t);
    toastEl._t = setTimeout(() => toastEl.classList.remove("show"), 1800);
  }

  // ---------- Events ----------
  let searchTimer;
  searchInput.addEventListener("input", () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(render, 120);
  });

  window.addEventListener("langchange", () => {
    renderFilters();
    render();
  });

  document.getElementById("scrollTop").addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

  // ---------- Init ----------
  renderFilters();
  render();
})();
