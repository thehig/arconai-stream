const express = require('express')
const fetchScript = require('./fetch-script')

const PORT = process.env.PORT || 3000

const streams = [
  { id: 138, name: 'Stargate' },
  { id: 139, name: 'House' },
  { id: 32, name: 'Community' },
  { id: 70, name: 'Outer Limits' },
  { id: 150, name: 'Rick & Morty' },
  { id: 84, name: 'South Park' },
  { id: 115, name: 'Supernatural' },
  { id: 15, name: 'Last Airbender & Korra' }
]

var app = express()
app.set('view engine', 'ejs')
app.set('views', 'src/views')

app.get('/', (req, res) => {
  res.render('index', { streams })
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
