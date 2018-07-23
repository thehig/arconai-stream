import express from 'express';
import fetchScript from './fetch-script';

const PORT = 80
var app = express()

const buildHtml = scripts => {
  const referenceScripts = scripts
    .filter(script => script.sourceContainsVideo)
    .map(script => `<script src="${script.source}"></script>`)
  const inlineScripts = scripts
    .filter(script => script.dataContainsVideo)
    .map(script => `<script>${script.data}</script>`)

  return `
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width = device-width, initial-scale = 1.0, user-scalable = no" />
  <title>Arconai Hijack</title>
  ${referenceScripts}
</head>

<body>
  <div class="video-container">
    <video id="stream_player" class="stream-player video-js vjs-default-skin vjs-16-9 vjs-big-play-centered" autoplay controls
      preload="none" width="640" height="264">
      <source id="stream_player_src" src="" type="application/x-mpegURL">
    </video> 
    ${inlineScripts}
  </div>
</body>

</html>
`
}

app.get('/video', (req, res) => {
  fetchScript().then(scripts => {
    var html = buildHtml(scripts)

    res.writeHead(200, {
      'Content-Type': 'text/html',
      'Content-Length': html.length,
      Expires: new Date().toUTCString()
    })
    res.end(html)
  })
})

app.listen(PORT)
console.log(`(${new Date().toLocaleTimeString()}): Listening on port ${PORT}`)
