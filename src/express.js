const express = require('express')
const fetchScript = require('./fetch-script')
const { Pool } = require('pg')

const PORT = process.env.PORT || 3000
const DB = process.env.DATABASE_URL

const pool = new Pool({
  connectionString: DB,
  ssl: true
})

const dbOperation = async processFunction => {
  // Connect to DB
  const client = await pool.connect()
  let result
  try {
    result = processFunction(client)
  } catch (err) {
    // no-op
  } finally {
    client.release()
  }

  return result
}

const getStreams = async () =>
  await dbOperation(async client => {
    const { rows } = await client.query('SELECT * FROM streams')

    // Map results into compatible format
    const streams = []
    for (var i = 0; i < rows.length; i++) {
      const row = rows[i]
      streams.push({
        id: row['stream-id'],
        name: row['stream-name']
      })
    }

    return streams
  })

const incrementStreamCount = streamId =>
  new Promise(async resolve => {
    await dbOperation(async client => {
      const result = await client.query(
        `UPDATE streams SET "stream-clicks"="stream-clicks"+1 WHERE "stream-id"=${streamId};`
      )
      resolve(result)
    })
  })

var app = express()
app.set('view engine', 'ejs')
app.set('views', 'src/views')

app.get('/', async (req, res) => {
  try {
    res.render('index', {
      streams: await getStreams()
    })
  } catch (err) {
    console.error(err)
    res.send('Error ' + err)
  }
})

app.get('/:streamid', (req, res) => {
  fetchScript(req.params.streamid)
    .then(scripts => {
      res.render('stream', scripts)
    })
    .then(() => incrementStreamCount(req.params.streamid))
    .catch(err => {
      console.error(err)
      res.send('Error ' + err)
    })
})

app.listen(PORT, () => {
  console.log(
    `(${new Date().toLocaleTimeString()}): Listening on port ${PORT}`
  )
})
