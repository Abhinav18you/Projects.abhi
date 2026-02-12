const APP_CACHE = 'ghost-drop-app-v1';
const SHARE_CACHE = 'ghost-drop-share-v1';
const SHARE_ENTRY_URL = '/shared-image';
const APP_ASSETS = ['/', '/index.html', '/manifest.webmanifest', '/icon-192.svg', '/icon-512.svg'];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(APP_CACHE).then((cache) => cache.addAll(APP_ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => ![APP_CACHE, SHARE_CACHE].includes(key)).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  if (request.method === 'POST' && url.pathname === '/share-target') {
    event.respondWith(handleShareTarget(request));
    return;
  }

  if (request.method === 'GET' && url.pathname === SHARE_ENTRY_URL) {
    event.respondWith(getSharedImageResponse());
    return;
  }

  if (request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) {
        return cached;
      }

      return fetch(request)
        .then((response) => {
          if (!response || response.status !== 200 || response.type === 'opaque') {
            return response;
          }

          const responseClone = response.clone();
          caches.open(APP_CACHE).then((cache) => cache.put(request, responseClone));
          return response;
        })
        .catch(() => {
          if (request.mode === 'navigate') {
            return caches.match('/index.html');
          }

          return new Response('Offline', {
            status: 503,
            statusText: 'Service Unavailable',
            headers: { 'Content-Type': 'text/plain' },
          });
        });
    }),
  );
});

const handleShareTarget = async (request) => {
  const formData = await request.formData();
  const sharedFile = formData.get('image');

  if (!(sharedFile instanceof File)) {
    return Response.redirect('/?share-error=missing-file', 303);
  }

  const cache = await caches.open(SHARE_CACHE);
  await cache.put(
    SHARE_ENTRY_URL,
    new Response(sharedFile, {
      headers: {
        'Content-Type': sharedFile.type || 'application/octet-stream',
        'X-Shared-File-Name': encodeURIComponent(sharedFile.name || 'shared-image'),
      },
    }),
  );

  return Response.redirect('/?share-target=1', 303);
};

const getSharedImageResponse = async () => {
  const cache = await caches.open(SHARE_CACHE);
  const response = await cache.match(SHARE_ENTRY_URL);

  if (!response) {
    return new Response(null, { status: 404, statusText: 'Not Found' });
  }

  await cache.delete(SHARE_ENTRY_URL);
  return response;
};
