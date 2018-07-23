const express = require('express')
const fetchScript = require('./fetch-script')
const showStream = require('./show-stream')

const PORT = process.env.PORT || 3000
var app = express()

const knownStreams = [
  { id: 138, name: 'Stargate' },
  { id: 139, name: 'House' }
]

app.get('/', (req, res) => {
  const html = `
    <html>
    <body>
      <ul>
        ${knownStreams
          .map(stream => `<li><a href='/${stream.id}'>${stream.name}</a></li>`)
          .join('')}
      </ul>
    </body>
    </html>
  `

  res.writeHead(200, {
    'Content-Type': 'text/html',
    'Content-Length': html.length,
    Expires: new Date().toUTCString()
  })
  res.end(html)
})

app.get('/:streamid', (req, res) => {
  fetchScript(req.params.streamid).then(scripts => {
    var html = showStream(scripts)

    res.writeHead(200, {
      'Content-Type': 'text/html',
      'Content-Length': html.length,
      Expires: new Date().toUTCString()
    })
    res.end(html)
  })
})

app.listen(PORT, () => {
  console.log(
    `(${new Date().toLocaleTimeString()}): Listening on port ${PORT}`
  )
})
