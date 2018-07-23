import express from 'express'
import fetchScript from './fetch-script'

const PORT = 80
var app = express()

app.get('/video', (req, res) => {
  fetchScript().then(script => {
    console.log('script:', script)
    res.send(script)
  })
})

app.listen(PORT)
console.log(`(${new Date().toLocaleTimeString()}): Listening on port ${PORT}`)
