'use strict';
// All runtime files are bundled locally. A new release must change VERSION.
const VERSION = 'mastro-costas-1.1.0';
const FILES = ['./','./index.html','./style.css','./calc.js','./app.js','./pwa.js','./manifest.webmanifest','./icons/apple-touch-icon.png','./icons/icon-192.png','./icons/icon-512.png','./icons/maskable-512.png'];
const absolute = path => new URL(path, self.registration.scope).href;
const allowed = new Set(FILES.map(absolute));
self.addEventListener('install', event => {
  event.waitUntil(caches.open(VERSION).then(cache => cache.addAll(FILES.map(path => new Request(absolute(path), {cache:'reload'})))));
});
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    for (const key of await caches.keys()) if (key.startsWith('mastro-costas-') && key !== VERSION) await caches.delete(key);
    await self.clients.claim();
  })());
});
self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET' || !request.url.startsWith(self.registration.scope)) return;
  // Use one consistent release, even while an update is downloading.
  if (request.mode === 'navigate') {
    event.respondWith(caches.open(VERSION).then(async cache => (await cache.match(absolute('./index.html'))) || fetch(request)));
  } else if (allowed.has(request.url)) {
    event.respondWith(caches.open(VERSION).then(async cache => (await cache.match(request)) || fetch(request)));
  }
});
