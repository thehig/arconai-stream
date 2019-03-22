# Arconai Stream

> Hosted [here](https://arconai-stream.herokuapp.com/).

I was in bed recently, with an episode of Stargate streaming from an online service (arconai). I fell asleep with the stream open. At some point in the night, the stream crashed. I woke up at ~4am to a phone that was *roasting* hot.

To continue my Stargate watching without worrying about setting my bed aflame, I tried saving the stream URL manually, but it changes periodically and I'm lazy.

And then it happened again, so I wrote [this](https://arconai-stream.herokuapp.com/). Stream safely! :dash::fire:

## How does it work

An [express server](https://expressjs.com/) hosted on [Heroku](https://www.heroku.com/) scrapes the arconai stream page. The page is [parsed and stripped](https://github.com/cheeriojs/cheerio
) of interesting scripts that **must** deobfusticate the video url (otherwise, how could anyone see the video), then [rebuilds the html](src/views/stream.ejs) and sends it to be :muscle: processed :muscle: in the browser until a stream URL can be extracted and the browser redirects

---

## [express.js](src/express.js)

- Brings up an express server with routes
  - `/` - [index.ejs](src/views/index.ejs)
  - `/stream/:streamid` - [stream.ejs](src/views/stream.ejs)

> I changed the URI to `/stream/:id` after db errors looking for a stream with the id `favicon.ico` :trollface:

## [db.js](src/db.js)

- Handles getting the list of streams from the db
- Handles adding `+1` to the `views` count

## [fetch-script.js](src/fetch-script.js)

- Fetches an arconai video stream page
- Loads the html into [cheerio](https://github.com/cheeriojs/cheerio)
- Extracts all the `<script>` elements
- Tags any scripts where the source or content includes `video`

## [index.ejs](src/views/index.ejs)

 Shows a list of stream IDs that I've bothered to save with a *smidge* of Bootstrap to make it easy to use on mobile

## [stream.ejs](src/views/stream.ejs)

- Takes the tagged scripts from above and creates a HTML page with *just* enough HTML to give the video somewhere to load into
- Injects the script references (that contained 'video') into the header and body
- The original scripts go about deobfusticating the source URL and modifying the `<video>` element until its ready and it tries to start playing, and then CORS kills it (*and rightly so* :raised_hands:)
- An inline `<script>` checks the page periodically to see if the `<source>` element has a valid `src` attribute
- When it's ready, the browser is redirected to the final URI ([.m3u8](https://en.wikipedia.org/wiki/M3U) playlist), which can be opened in a video player (eg: [bsplayer](https://www.bsplayer.com/bsplayer-english/products/bsplayer-android.html) or [chrome plugin](https://chrome.google.com/webstore/detail/play-hls-m3u8/ckblfoghkjhaclegefojbgllenffajdc?hl=en))

## [service-worker.js](src/static/service-worker.js)

Since all this is hosted on a Heroku instance, it exists "in the wild" on what I like to call a "💤sleepy server💤" (a server that is 'asleep' the first time you ping it, which then triggers it to 'wake up'). This 💤sleepy server💤 causes 20 - 30 seconds delay which I'd rather spend deciding whether to watch Stargate or, well, Stargate.

So what is a service-worker? The service-worker is a piece of javascript that lives in the client browser in between it and the internet at large. This allows us to intercept requests and reply with cached data.

So then we come to "the good stuff", the caching strategy. Wait, wait... it's not _that_ boring. I've probably put more effort into the service worker than I have the rest of the project combined, and I'm especially happy with how it has turned out. If you're interested, open then developer console and check out the 🌈color-coded🌈 events

### Cache-Once

Some assets (Bootstrap, jQuery) are cached when the service-worker is "installed" and then always served from the Cache. Ok that one _was_ boring.

### Cache And Update

When the browser tries to open the list of streams, the service-worker intercepts the request and returns the last cached version it had. Then in the background it sends a request off to the "actual" site, which can take 20 - 30 seconds to resolve.

When the updated data is recieved by the service worker, it causes the page to refresh, showing the user the most up-to-date data as soon as is possible.

During that 20 - 30 seconds the user can interact with the page as normal, deciding which stream to watch. If you click on a link, the automatic refresh is disabled, and you are taken to your stream ASAP.

---

## What didn't/doesn't work

I tried to just deobfusticate the original javascript (see [the wip folder](wip/)) and could see the URL after a fashion, but other than regexing through the source I couldn't implement a way to fully extract it. To get around this, I tried to follow the most 'userland' path by getting the code to deobfusticate itself.

I tried to just embed the video in the page, and that worked to a point. That point being [CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS) on the Arconai server preventing the video player from loading on a domain other than theirs. This makes me think that everything is set up as correctly as it can be, but that the stream just can't be served to a JS client cross-origin.