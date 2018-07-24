const express = require('express')
const fetchScript = require('./fetch-script')
const streams = require('./streams')

const PORT = process.env.PORT || 3000



var app = express()
app.set('view engine', 'ejs')
app.set('views', 'src/views')

app.get('/', (req, res) => {
  res.render('index', streams)
})

app.get('/:streamid', (req, res) => {
  fetchScript(req.params.streamid).then(scripts => {
    res.render('stream', scripts)
  })
})

app.listen(PORT, () => {
  console.log(
    `(${new Date().toLocaleTimeString()}): Listening on port ${PORT}`
  )
})
