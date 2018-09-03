const DEBUG = true
const CACHE = 'cache-update-and-refresh'

const FILES = [
  './',
  './service-worker.js',
  './manifest.json',
  'https://stackpath.bootstrapcdn.com/bootstrap/4.1.2/css/bootstrap.min.css',
  'https://code.jquery.com/jquery-3.3.1.slim.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.3/umd/popper.min.js',
  'https://stackpath.bootstrapcdn.com/bootstrap/4.1.2/js/bootstrap.min.js'
]

self.addEventListener('install', function(evt) {
  if (DEBUG) console.log('install serviceworker')

  evt.waitUntil(
    caches.open(CACHE).then(function(cache) {
      cache.addAll(FILES)
    })
  )
})

self.addEventListener('fetch', function(evt) {
  // if (DEBUG) console.log('fetch', evt.request.url, evt.request.referrer)
  evt.respondWith(fromCache(evt.request))

  var shouldUpdate = false

  // Ideally, we want to cache everything
  //  but update the cache for './' route
  //  to show (nearly) up-to-date views

  // No referrer means we're on the root url via a direct navigation
  if (!evt.request.referrer) shouldUpdate = true
  // referrer === url means we're refreshing
  if (evt.request.url === evt.request.referrer) shouldUpdate = true

  if (shouldUpdate) {
    evt.waitUntil(update(evt.request).then(refresh))
  }
})

function fromCache(request) {
  if (DEBUG) console.log('fromCache', request.url)
  return caches.open(CACHE).then(function(cache) {
    return cache.match(request)
  })
}

function update(request) {
  if (DEBUG) console.log('update', request.url)
  return caches.open(CACHE).then(function(cache) {
    return fetch(request).then(function(response) {
      return cache.put(request, response.clone()).then(function() {
        return response
      })
    })
  })
}

function refresh(response) {
  if (DEBUG) console.log('refresh', response.url)
  return self.clients.matchAll().then(function(clients) {
    clients.forEach(function(client) {
      var message = {
        type: 'refresh',
        url: response.url,

        eTag: response.headers.get('ETag')
      }

      client.postMessage(JSON.stringify(message))
    })
  })
}
