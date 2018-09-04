const DEBUG = true

const CACHE_BASE_NAME = 'ARCONAI-STREAM'
const CACHE_TAG = '0001'

// #region Output Styles

const swStyle = 'background: #333;' // Service Worker Background
const fnStyle = 'background: #EEE;' // Function Background

const styles = {
  install: `${swStyle} color: #c8f7c5`,
  activate: `${swStyle} color: #c5cbf7`,
  delete: `${swStyle} color: #e0ffff`,
  fetch: `${swStyle} color: #ffecdb`,

  precache: `${fnStyle} color: #2e8856`,
  fromNetwork: `${fnStyle} color: #638bb3`,
  fromCache: `${fnStyle} color: #bf55ec`,
  updateCache: `${fnStyle} color: #808080`,
  refresh: `${fnStyle} color: #9d8319`
}

// #endregion

// #region Cache Definitions

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

// Update cache is loaded, then when requested it serves from cache
//    then in the background it tries to update the cache from network
//    then refreshes the client
const updateCache = {
  name: `${CACHE_BASE_NAME}-UPDATE-${CACHE_TAG}`,
  files: ['/']
}

const CACHES = [staticCache, updateCache]

// #endregion

// #region Service Worker Lifecycle Events

/**
 * Install service worker and runs precache
 */
self.addEventListener('install', function(evt) {
  if (DEBUG) console.log('%c[->][install]', styles.install)

  evt.waitUntil(precache())
})

/**
 * Remove any caches other than the current ones
 */
self.addEventListener('activate', function(event) {
  if (DEBUG) console.log('%c[->][activate]', styles.activate)
  event.waitUntil(
    // Get all the cache names (keys)
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        // For each cache name
        cacheNames.map(function(key) {
          // Whitelist the current cache names
          if (
            CACHES.map(function(c) {
              return c.name
            }).indexOf(key) === -1
          ) {
            if (DEBUG) console.log('%c[->][delete]', styles.delete, key)
            // Delete the rest
            return caches.delete(key)
          }
        })
      )
    })
  )
})

self.addEventListener('fetch', function(evt) {
  if (DEBUG) console.log('%c[->][fetch]', styles.fetch, evt.request.url)

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

// #endregion

// #region Cache Functions

// Accessors for named caches
const fromStaticCache = fromUsingCache(staticCache.name)
const fromUpdateCache = fromUsingCache(updateCache.name)
const updateUpdateCache = updateUsingCache(updateCache.name)

/**
 * Populate cache with a set of resources
 */
function precache() {
  if (DEBUG) console.log('%c[->][precache]', styles.precache)
  return Promise.all(
    CACHES.map(function({ name, files }) {
      return caches.open(name).then(function(cache) {
        return cache.addAll(files)
      })
    })
  )
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
            `%c[<-][cache ${cacheName}]`,
            styles.fromCache,
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
      console.log(
        `%c[->][update ${cacheName}]`,
        styles.updateCache,
        request.url
      )
    return caches.open(cacheName).then(function(cache) {
      return fromNetwork(request).then(function(response) {
        return cache.put(request, response.clone()).then(function() {
          return response
        })
      })
    })
  }
}

// #endregion

/**
 * Get a resource from a URL (within ${timeout}ms if specified)
 *
 * Returns resource
 * If timeout is specified, throws an error if timeout exceeded
 */
function fromNetwork(request, timeout) {
  return new Promise(function(fulfill, reject) {
    var timeoutId = timeout && setTimeout(reject, timeout)
    fetch(request).then(function(response) {
      if (DEBUG)
        console.log(
          '%c[<-][network]',
          styles.fromNetwork,
          request.url,
          timeout || ''
        )
      timeout && clearTimeout(timeoutId)
      fulfill(response)
    }, reject)
  })
}

/**
 * Refresh any serviceworker connected client pages
 */
function refresh(response) {
  if (DEBUG) console.log('%c[<-][refresh]', styles.refresh, response.url)

  return self.clients.matchAll().then(function(clients) {
    return Promise.all(
      clients.map(function(client) {
        return new Promise(function(resolve) {
          var message = {
            type: 'refresh',
            url: response.url,
            eTag: response.headers.get('ETag')
          }
          resolve(client.postMessage(JSON.stringify(message)))
        })
      })
    )
  })
}
