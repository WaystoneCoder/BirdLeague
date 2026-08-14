const CACHE = "birdleague-v6";
const ASSETS = ["./", "./index.html", "./styles.css", "./taxonomy-de.js", "./points.js", "./data.js", "./app.js", "./logo-birdleague.png", "./icon-192.png", "./icon-512.png", "./manifest.webmanifest"];

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(ASSETS)));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  const shouldRefresh = url.pathname.endsWith("/data.js") || url.pathname.endsWith("/points.js") || url.pathname.endsWith("/taxonomy-de.js") || event.request.mode === "navigate";

  if (shouldRefresh) {
    event.respondWith(
      fetch(event.request, { cache: "no-store" })
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE).then((cache) => cache.put(event.request, copy));
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  event.respondWith(caches.match(event.request).then((cached) => cached || fetch(event.request)));
});
