const express = require('express')
const fetchScript = require('./fetch-script')
const showStream = require('./show-stream')

const PORT = process.env.PORT || 3000
var app = express()

const knownStreams = [
  { id: 138, name: 'Stargate' },
  { id: 139, name: 'House' },
  { id: 32, name: 'Community' },
  { id: 70, name: 'Outer Limits' },
  { id: 150, name: 'Rick & Morty' },
  { id: 84, name: 'South Park' },
  { id: 115, name: 'Supernatural' },
  { id: 15, name: 'Last Airbender & Korra' },
]

app.get('/', (req, res) => {
  const html = `
<html>
  <head>
    <script src="https://code.jquery.com/jquery-3.3.1.slim.min.js" integrity="sha384-q8i/X+965DzO0rT7abK41JStQIAqVgRVzpbzo5smXKp4YfRvH+8abtTE1Pi6jizo" crossorigin="anonymous"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.3/umd/popper.min.js" integrity="sha384-ZMP7rVo3mIykV+2+9J3UJ46jBk0WLaUAdn689aCwoqbBJiSnjAK/l8WvCWPIPm49" crossorigin="anonymous"></script>

    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.1.2/css/bootstrap.min.css" integrity="sha384-Smlep5jCw/wG7hdkwQ/Z5nLIefveQRIY9nfy6xoR1uRYBtpZgI6339F5dgvm/e9B" crossorigin="anonymous">
    <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.1.2/js/bootstrap.min.js" integrity="sha384-o+RDsa0aLu++PJvFqy8fFScvbHFLtbvScb8AjopnFD+iEQ7wo/CG0xlczd+2O/em" crossorigin="anonymous"></script>
  </head>

<body>
  <ul class="list-group">
    ${knownStreams
      .map(stream => `<li class="list-group-item"><a href='/${stream.id}'>${stream.name}</a></li>`)
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
