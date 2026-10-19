/* ============================================================
   service-worker.js — кэширование статических ресурсов для
   работы сайта VSX Top500 без интернета.
   ============================================================ */

var CACHE_NAME = "vsx-top500-v1";
var ASSETS = [
  "index.html",
  "lessons.html",
  "lifehacks.html",
  "prompts.html",
  "settings.html",
  "kits.html",
  "first-day.html",
  "publishers.html",
  "avoid.html",
  "styles.css",
  "common.js",
  "i18n.js",
  "theme.js",
  "platform.js",
  "translate.js",
  "kits-data.js",
  "screenshot.js",
  "app.js",
  "assistant.js",
  "lessons.js",
  "lifehacks.js",
  "prompts.js",
  "settings.js",
  "publishers.js",
  "avoid.js",
  "marked.min.js",
  "purify.min.js",
  "normalize.js",
];

// Установка — кэшируем все статические ресурсы
self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

// Активация — удаляем старые кэши
self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then(function (cacheNames) {
      return Promise.all(
        cacheNames
          .filter(function (name) {
            return name !== CACHE_NAME;
          })
          .map(function (name) {
            return caches.delete(name);
          })
      );
    })
  );
  self.clients.claim();
});

// Запросы — отдаём из кэша, если нет — загружаем из сети
self.addEventListener("fetch", function (event) {
  event.respondWith(
    caches.match(event.request).then(function (cached) {
      return cached || fetch(event.request).then(function (response) {
        // Кэшируем новые ресурсы
        if (response && response.status === 200) {
          var responseClone = response.clone();
          caches.open(CACHE_NAME).then(function (cache) {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      });
    })
  );
});
