// Deliberately minimal: this app is entirely data-driven (Postgres via
// authenticated API routes), so caching pages or API responses risks
// showing stale journal/mood/habit data. This service worker exists only
// to satisfy PWA installability and to show something better than the
// browser's default error page when there's no connection at all — it
// does not cache or intercept anything else.
const CACHE_NAME = "life-dashboard-offline-v1";
const OFFLINE_URL = "/offline.html";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.add(OFFLINE_URL)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  // Only ever intervene for full-page navigations, and only to swap in the
  // offline fallback when the network is unreachable. Everything else
  // (API calls, JS/CSS, images) goes straight to the network untouched.
  if (event.request.mode !== "navigate") return;

  event.respondWith(
    fetch(event.request).catch(() => caches.match(OFFLINE_URL))
  );
});
