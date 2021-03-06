const express = require('express')
const favicon = require('serve-favicon')
const path = require('path')
const config = require('config')

const fetchScript = require('./fetch-script')
const { getStreams, incrementStreamCount, getStreamName } = require('./db')

const PORT = config.get('EXPRESS_PORT');

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
  try {
    const streams = await getStreams()
    res.render('index', { streams })
  } catch (err) {
    console.error(err)
    res.statusCode = 500
    res.send(`${err}`)
  }
})

/**
 * ROUTE `/stream/:streamid`
 *
 * Take a stream ID from the URL parameter
 * - increment the counter in the DB
 * - fetch the page by ID and scrape the scripts
 * - render scripts using the `stream` view template
 */
app.get('/stream/:streamid', async (req, res) => {
  try {
    const streamid = req.params['streamid']
    if (!streamid) throw new Error(`Invalid streamid: ${streamid}`)

    // Beware Promise.all fail-fast behavior!
    const [count, scripts, name] = await Promise.all([
      incrementStreamCount(streamid),
      fetchScript(streamid),
      getStreamName(streamid)
    ])

    res.render('stream', { ...scripts, name })
  } catch (err) {
    console.error(err)
    res.statusCode = 500
    res.send(`${err}`)
  }
})

// Serve static files
app.use(
  '/service-worker.js',
  express.static(__dirname + '/static/service-worker.js')
)
app.use('/manifest.json', express.static(__dirname + '/static/manifest.json'))

// Start server
app.listen(PORT, () => {
  console.log(`(${new Date().toLocaleTimeString()}): Listening on port ${PORT}`)
})
