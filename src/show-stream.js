const getStreamUrl = (checkInterval = 300) => `
<script>
  // Every second
  var searchForSource = setInterval(function() {
    // Find all <source> elements
    var elems = document.getElementsByTagName("source");
    for (var i = 0; i < elems.length; i++) {
      try {
        var elem = elems[i];
        // If the <source> element has a 'src' property
        if(elem.src) {
          // We're done here
          clearInterval(searchForSource)
          window.location = elem.src;
          break;
        }
      } catch (e) {
        /*no-op*/
      }
    }
  }, ${checkInterval});
</script>
`

const buildHtml = scripts => {
  const referenceScripts = scripts
    .filter(script => script.sourceContainsVideo)
    .map(script => `<script src="${script.source}"></script>`)
    .join('')
  const inlineScripts = scripts
    .filter(script => script.dataContainsVideo)
    .map(script => `<script>${script.data}</script>`)
    .join('')

  return `
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <title>Arconai Stream</title>
  <style>
    .video-container {
      display: none;
    }
  </style>
  ${referenceScripts}
</head>

<body>
  <div><h3>You will be redirected in a moment</h3></div>
  <div class="video-container">
    <video id="stream_player" class="stream-player video-js vjs-default-skin vjs-16-9 vjs-big-play-centered" autoplay controls
      preload="none" width="640" height="264">
      <source id="stream_player_src" src="" type="application/x-mpegURL">
    </video> 
    ${inlineScripts}
  </div>
  ${getStreamUrl()}
</body>

</html>
`
}

module.exports = buildHtml