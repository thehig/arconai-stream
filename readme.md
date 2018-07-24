# Arconai Stream

> Hosted [here](https://arconai-stream.herokuapp.com/).

I was in bed recently, with an episode of Stargate streaming from an online service (arconai). I fell asleep with the stream open. At some point in the night, the stream crashed. I woke up at ~4am to a phone that was *roasting* hot.

To continue my Stargate watching without worrying about setting my bed aflame, I tried saving the stream URL manually, but it changes periodically and I'm lazy.

And then it happened again, so I wrote [this](https://arconai-stream.herokuapp.com/). Stream safely! :dash::fire:

## How does it work

Using an express server hosted on Heroku, the stream page is loaded and processed in your browser until the stream URL can be extracted and the browser is redirected

---

## [express.js](src/express.js)

- Brings up an express server with routes
  - `/` - [index.ejs](src/views/index.ejs)
  - `/:streamid` - [stream.ejs](src/views/stream.ejs)

## [fetch-script.js](src/fetch-script.js)

- Fetches an arconai video stream page
- Loads the html into [cheerio](https://github.com/cheeriojs/cheerio)
- Extracts all the `<script>` elements
- Tags any scripts where the source or content includes `video`

## [index.ejs](src/views/index.ejs)

 Shows a list of stream IDs that I've bothered to save with a *smidge* of Bootstrap to make it easy to use on mobile

## [stream.ejs](src/views/stream.ejs)

- It takes the tagged scripts from above and creates a HTML page with *just* enough HTML to give the video somewhere to load into
- It then injects the original script references (the ones that contained 'video') into the header and body
- The original scripts go about deobfusticating the source URL and modifying the `<video>` element until its ready and it tries to start playing
- It creates a `<script>` that will check the page periodically to see if there are any `<source>` elements that have a valid `src` property
- When it finds one, it redirects the browser to the URL, which can be opened in a video player (eg: [bsplayer](https://www.bsplayer.com/bsplayer-english/products/bsplayer-android.html) or [chrome plugin](https://chrome.google.com/webstore/detail/play-hls-m3u8/ckblfoghkjhaclegefojbgllenffajdc?hl=en))

---

## What didn't/doesn't work

I tried to just deobfusticate the original javascript (see [the wip folder](wip/)) and could see the URL after a fashion, but other than regexing through the source I couldn't implement a way to fully extract it. To get around this, I tried to follow the most 'userland' path by getting the code to deobfusticate itself.

I tried to just embed the video in the page, and that worked to a point. That point being [CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS) on the Arconai server preventing the video player from loading on a domain other than theirs. This makes me think that everything is set up as correctly as it can be, but that the stream just can't be served to a JS client cross-origin.