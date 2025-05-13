// Import workbox from CDN
importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.4.1/workbox-sw.js');

// Set workbox debug mode
workbox.setConfig({
  debug: true
});

// Skip waiting
self.skipWaiting();

// Wait for workbox to be ready
workbox.loadModule('workbox-precaching');
workbox.loadModule('workbox-routing');
workbox.loadModule('workbox-strategies');
workbox.loadModule('workbox-expiration');

// Claim clients after workbox is ready
self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

// Cache the offline page
workbox.precaching.precacheAndRoute([
  { url: '/offline.html', revision: '1' }
]);

// Handle 404 errors
workbox.routing.registerRoute(
  ({ request }) => request.mode === 'navigate',
  new workbox.strategies.NetworkFirst({
    cacheName: 'pages',
    plugins: [
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 30 * 24 * 60 * 60 // 30 days
      })
    ]
  })
);

// Cache Google Fonts
workbox.routing.registerRoute(
  /^https:\/\/fonts\.googleapis\.com/,
  new workbox.strategies.StaleWhileRevalidate({
    cacheName: 'google-fonts-stylesheets',
    plugins: [
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 10,
        maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
      })
    ]
  })
);

workbox.routing.registerRoute(
  /^https:\/\/fonts\.gstatic\.com/,
  new workbox.strategies.CacheFirst({
    cacheName: 'google-fonts-webfonts',
    plugins: [
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 10,
        maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
      })
    ]
  })
);

// Cache Leaflet resources
workbox.routing.registerRoute(
  /^https:\/\/unpkg\.com\/leaflet@1\.9\.4\/dist\/leaflet\.css/,
  new workbox.strategies.StaleWhileRevalidate({
    cacheName: 'leaflet-css',
    plugins: [
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 1,
        maxAgeSeconds: 60 * 60 * 24 * 7 // 1 week
      })
    ]
  })
);

workbox.routing.registerRoute(
  /^https:\/\/unpkg\.com\/leaflet@1\.9\.4\/dist\/leaflet\.js/,
  new workbox.strategies.StaleWhileRevalidate({
    cacheName: 'leaflet-js',
    plugins: [
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 1,
        maxAgeSeconds: 60 * 60 * 24 * 7 // 1 week
      })
    ]
  })
);

// Cache map tiles
workbox.routing.registerRoute(
  /^https:\/\/(?:[a-z0-9-]+\.tile\.openstreetmap\.org)\/.*/,
  new workbox.strategies.CacheFirst({
    cacheName: 'map-tiles',
    plugins: [
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 60 * 60 * 24 * 7 // 1 week
      })
    ]
  })
);

// Cache API responses
workbox.routing.registerRoute(
  /^https:\/\/api\.dicoding\.dev\/story/,
  new workbox.strategies.NetworkFirst({
    cacheName: 'api-stories',
    networkTimeoutSeconds: 10,
    plugins: [
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 60 * 60 * 24 // 1 day
      })
    ]
  })
);

// Cache images
workbox.routing.registerRoute(
  /\.(?:png|jpg|jpeg|gif|svg|ico)$/,
  new workbox.strategies.CacheFirst({
    cacheName: 'images',
    plugins: [
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 60,
        maxAgeSeconds: 30 * 24 * 60 * 60 // 30 days
      })
    ]
  })
);

// Push notification event listener
self.addEventListener('push', function(event) {
  let notificationData;
  try {
    notificationData = event.data.json();
  } catch (e) {
    notificationData = {
      title: 'Story App',
      body: event.data.text()
    };
  }

  const options = {
    body: notificationData.body || 'New notification from Story App',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1,
      url: notificationData.url || '/'
    },
    actions: [
      {
        action: 'explore',
        title: 'View Story',
        icon: '/icons/checkmark.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/icons/xmark.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(notificationData.title || 'Story App', options)
  );
});

// Notification click event listener
self.addEventListener('notificationclick', function(event) {
  event.notification.close();

  if (event.action === 'explore') {
    const urlToOpen = event.notification.data.url || '/';
    event.waitUntil(
      clients.matchAll({
        type: 'window',
        includeUncontrolled: true
      }).then(function(clientList) {
        // If a window tab is already open, focus it
        for (const client of clientList) {
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus();
          }
        }
        // If no window tab is open, open a new one
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
    );
  }
}); 