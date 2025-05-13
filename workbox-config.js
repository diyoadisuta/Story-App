module.exports = {
  globDirectory: 'dist/',
  globPatterns: [
    '**/*.{html,css,js,json,png,jpg,jpeg,gif,svg,ico}',
    'index.html'
  ],
  swDest: 'dist/sw.js',
  clientsClaim: true,
  skipWaiting: true,
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/fonts\.googleapis\.com/,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'google-fonts-stylesheets',
        expiration: {
          maxEntries: 10,
          maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
        }
      }
    },
    {
      urlPattern: /^https:\/\/fonts\.gstatic\.com/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'google-fonts-webfonts',
        expiration: {
          maxEntries: 10,
          maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
        }
      }
    },
    {
      urlPattern: /^https:\/\/unpkg\.com\/leaflet@1\.9\.4\/dist\/leaflet\.css/,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'leaflet-css',
        expiration: {
          maxEntries: 1,
          maxAgeSeconds: 60 * 60 * 24 * 7 // 1 week
        }
      }
    },
    {
      urlPattern: /^https:\/\/unpkg\.com\/leaflet@1\.9\.4\/dist\/leaflet\.js/,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'leaflet-js',
        expiration: {
          maxEntries: 1,
          maxAgeSeconds: 60 * 60 * 24 * 7 // 1 week
        }
      }
    },
    {
      urlPattern: /^https:\/\/(?:[a-z0-9-]+\.tile\.openstreetmap\.org)\/.*/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'map-tiles',
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 60 * 60 * 24 * 7 // 1 week
        }
      }
    },
    {
      urlPattern: /^https:\/\/api\.dicoding\.dev\/story/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'api-stories',
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 60 * 60 * 24 // 1 day
        },
        networkTimeoutSeconds: 10
      }
    },
    {
      urlPattern: /\.(?:png|jpg|jpeg|gif|svg|ico)$/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'images',
        expiration: {
          maxEntries: 60,
          maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
        }
      }
    }
  ]
}; 