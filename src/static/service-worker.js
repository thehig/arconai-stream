const DEBUG = true

const CACHE_BASE_NAME = 'ARCONAI-STREAM'
const CACHE_TAG = '0000'

// Static cache is loaded once and then always served from cache
const staticCache = {
  name: `${CACHE_BASE_NAME}-STATIC-${CACHE_TAG}`,
  files: [
    './manifest.json',
    'https://stackpath.bootstrapcdn.com/bootstrap/4.1.2/css/bootstrap.min.css',
    'https://code.jquery.com/jquery-3.3.1.slim.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.3/umd/popper.min.js',
    'https://stackpath.bootstrapcdn.com/bootstrap/4.1.2/js/bootstrap.min.js'
  ]
}

// Update cache is loaded, then when requested it serves from cache, and in the background updates and refreshes the client
const updateCache = {
  name: `${CACHE_BASE_NAME}-UPDATE-${CACHE_TAG}`,
  files: ['/']
}

// Accessors for named caches
const fromStaticCache = fromUsingCache(staticCache.name)
const fromUpdateCache = fromUsingCache(updateCache.name)
const updateUpdateCache = updateUsingCache(updateCache.name)

const CACHES = [staticCache, updateCache]

/**
 * Install service worker and runs precache
 */
self.addEventListener('install', function(evt) {
  if (DEBUG) console.log('install serviceworker')
  evt.waitUntil(precache())
})

/**
 * Populate cache with a set of resources
 */
function precache() {
  return Promise.all(
    CACHES.map(function({ name, files }) {
      return caches.open(name).then(function(cache) {
        return cache.addAll(files)
      })
    })
  )
}

self.addEventListener('fetch', function(evt) {
  if (DEBUG)
    console.log('%cfetch', 'background: #222; color: #bf6ee0', evt.request.url)

  // If resource is in static cache, return it from the static cache
  // If resource is in update cache, return it from the update cache, then update the cache from the network and refresh the client
  // If resource is not in the caches, fetch it from the network and don't cache it

  evt.respondWith(
    // Return from the static cache if valid
    fromStaticCache(evt.request).catch(function() {
      // return from update cache if valid
      return fromUpdateCache(evt.request)
        .then(function(response) {
          // update and refresh
          evt.waitUntil(updateUpdateCache(evt.request).then(refresh))
          return response
        })
        .catch(function() {
          // resort to network
          return fromNetwork(evt.request)
        })
    })
  )
})

/**
 * Get a resource from a URL (within ${timeout}ms if specified)
 *
 * Returns resource
 * If timeout is specified, throws an error if timeout exceeded
 */
function fromNetwork(request, timeout) {
  if (DEBUG)
    console.log('%cfromNetwork', 'color: #1e90ff', request.url, timeout)

  return new Promise(function(fulfill, reject) {
    var timeoutId = timeout && setTimeout(reject, timeout)
    fetch(request).then(function(response) {
      timeout && clearTimeout(timeoutId)
      fulfill(response)
    }, reject)
  })
}

/**
 * Get a resource from the cache
 *
 * Returns resource
 * Throws an error if resource not in cache
 */
function fromUsingCache(cacheName) {
  return function fromCache(request) {
    return caches.open(cacheName).then(function(cache) {
      return cache.match(request).then(function(matching) {
        if (DEBUG && matching) {
          console.log(
            '%cfromCache: ' + cacheName,
            'color: #af851a',
            request.url
          )
        }
        return matching || Promise.reject('no-match')
      })
    })
  }
}

/**
 * Get a resource from network then store it in the cache
 *
 * Returns resource
 */
function updateUsingCache(cacheName) {
  return function update(request) {
    if (DEBUG)
      console.log('%cupdate: ' + cacheName, 'color: #7f311a', request.url)
    return caches.open(cacheName).then(function(cache) {
      return fromNetwork(request).then(function(response) {
        return cache.put(request, response.clone()).then(function() {
          return response
        })
      })
    })
  }
}

/**
 * Refresh any serviceworker connected client pages
 */
function refresh(response) {
  if (DEBUG) console.log('%crefresh: ', 'color: #21350A', response.url)
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
