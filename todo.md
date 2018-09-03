


## Service Worker

- Caching not properly refreshing `./` on the hosted version
- Caching is intercepting the `./stream/:id` urls when it shouldn't be
  - Returning a cached stream url would cache the previous ID