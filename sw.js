const CACHE_VERSION = "mongle-premium-v28";
const APP_SHELL = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./styles.css?v=8",
  "./enhancements.css?v=1",
  "./catalog.css?v=1",
  "./interactions.css?v=19",
  "./premium.css?v=7",
  "./extra-games.js?v=5",
  "./tts-manifest.js?v=4",
  "./interaction-engine.js?v=26",
  "./app.js?v=34",
  "./assets/generated/favicon.png",
  "./assets/generated/app-icon-192.png",
  "./assets/generated/app-icon-512.png",
  "./assets/generated/mongle-hero.webp",
  "./assets/generated/game-look.webp",
  "./assets/generated/game-number.webp",
  "./assets/generated/game-word.webp",
  "./assets/generated/game-heart.webp",
  "./assets/generated/story/chapter-01-morning-fruit.webp",
  "./assets/generated/story/chapter-02-shape-train.webp",
  "./assets/generated/story/chapter-03-five-chicks.webp",
  "./assets/generated/story/chapter-04-forest-sounds.webp",
  "./assets/generated/story/chapter-05-picnic-sorting.webp",
  "./assets/generated/story/chapter-06-flag-pattern.webp",
  "./assets/generated/story/chapter-07-size-lineup.webp",
  "./assets/generated/story/chapter-08-body-mission.webp",
  "./assets/generated/story/chapter-09-feelings.webp",
  "./assets/generated/story/chapter-10-bedtime.webp",
  "./audio/music/mongle-meadow.mp3?v=2"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_VERSION).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

async function navigationResponse(request) {
  try {
    const response = await fetch(request);
    const cache = await caches.open(CACHE_VERSION);
    cache.put("./index.html", response.clone());
    return response;
  } catch {
    return (await caches.match("./index.html")) || (await caches.match("./"));
  }
}

async function cachedAssetResponse(request) {
  const cached = await caches.match(request, { ignoreSearch: false });
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_VERSION);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response("오프라인에서 아직 준비되지 않은 파일이에요.", {
      status: 503,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }
}

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;
  if (event.request.mode === "navigate") {
    event.respondWith(navigationResponse(event.request));
    return;
  }
  event.respondWith(cachedAssetResponse(event.request));
});
