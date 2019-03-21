const express = require('express')
const favicon = require('serve-favicon')
const path = require('path')

const fetchScript = require('./fetch-script')
const { getStreams, incrementStreamCount } = require('./db')

const PORT = process.env.PORT || 3000

var app = express()

// Favicon
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')))
// Configure view engine
app.set('view engine', 'ejs')
app.set('views', 'src/views')

/**
 * ROUTE `/`
 * 
 * Get the streams from the database (`getStreams`) and render them using the `index` view template
 */
app.get('/', async (req, res) => {
  return getStreams()
    .then(streams => {
      res.render('index', {
        streams
      })
    })
    .catch(err => {
      console.error(err)
      res.statusCode = 500
      res.send(`${err}`)
    })
})

/** 
 * ROUTE `/stream/:streamid`
 *
 * Take a stream ID from the URL parameter
 * - increment the counter in the DB
 * - fetch the page by ID and scrape the scripts
 * - render scripts using the `stream` view template
 */
app.get('/stream/:streamid', (req, res) => {
  return incrementStreamCount(req.params.streamid)
    .then(() => fetchScript(req.params.streamid))
    .then(scripts => {
      res.render('stream', scripts)
    })
    .catch(err => {
      console.error(err)
      res.statusCode = 500
      res.send(`${err}`)
    })
})

// Serve static files
app.use('/service-worker.js', express.static(__dirname + '/static/service-worker.js'))
app.use('/manifest.json', express.static(__dirname + '/static/manifest.json'))

// Start server
app.listen(PORT, () => {
  console.log(
    `(${new Date().toLocaleTimeString()}): Listening on port ${PORT}`
  )
})
