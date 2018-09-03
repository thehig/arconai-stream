var CACHE = "cache-update-and-refresh";
var FILES = [
  "./",
  "./registerServiceWorker.js",

  "https://stackpath.bootstrapcdn.com/bootstrap/4.1.2/css/bootstrap.min.css",
  "https://code.jquery.com/jquery-3.3.1.slim.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.3/umd/popper.min.js",
  "https://stackpath.bootstrapcdn.com/bootstrap/4.1.2/js/bootstrap.min.js",
];

self.addEventListener("install", function(evt) {
  console.log("The service worker is being installed.");

  evt.waitUntil(
    caches.open(CACHE).then(function(cache) {
      cache.addAll(FILES);
    })
  );
});

self.addEventListener("fetch", function(evt) {
  console.log("The service worker is serving the asset.");

  evt.respondWith(fromCache(evt.request));

  evt.waitUntil(update(evt.request).then(refresh));
});

function fromCache(request) {
  return caches.open(CACHE).then(function(cache) {
    return cache.match(request);
  });
}

function update(request) {
  return caches.open(CACHE).then(function(cache) {
    return fetch(request).then(function(response) {
      return cache.put(request, response.clone()).then(function() {
        return response;
      });
    });
  });
}

function refresh(response) {
  return self.clients.matchAll().then(function(clients) {
    clients.forEach(function(client) {
      var message = {
        type: "refresh",
        url: response.url,

        eTag: response.headers.get("ETag")
      };

      client.postMessage(JSON.stringify(message));
    });
  });
}
