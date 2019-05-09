const { Pool } = require('pg')
const config = require('config')

const pool = new Pool({
  connectionString: config.get('DATABASE_URL'),
  ssl: true
})

const getStreams = async () => {
  // Connect to DB
  const client = await pool.connect()
  let result = []
  try {
    const { rows } = await client.query(
      'SELECT * FROM streams ORDER BY "stream-clicks" DESC'
    )

    // Map results into compatible format
    for (var i = 0; i < rows.length; i++) {
      const row = rows[i]
      result.push({
        id: row['stream-id'],
        name: row['stream-name'],
        clicks: row['stream-clicks']
      })
    }
  } catch (err) {
    throw err
  } finally {
    client.release()
  }
  return result
}

const getStreamName = async streamId => {
  if (!Number.isInteger(parseInt(streamId)))
    throw new Error(`Stream ID must be an integer. Got "${streamId}"`)

  // Connect to DB
  const client = await pool.connect()
  let result
  try {
    const { rows } = await client.query(
      'SELECT "stream-name" FROM streams WHERE "stream-id"=$1',
      [streamId]
    )

    if (rows.length !== 1) {
      throw new Error(`Row length !== 1 for id ${streamId}`)
    }

    result = rows[0]['stream-name']
    if (!result) {
      throw new Error(`Stream name not found for id ${streamId}`)
    }
  } catch (err) {
    throw err
  } finally {
    client.release()
  }
  return result
}

const incrementStreamCount = async streamId => {
  if (!Number.isInteger(parseInt(streamId)))
    throw new Error(`Stream ID must be an integer. Got "${streamId}"`)

  const client = await pool.connect()
  let result
  try {
    result = await client.query(
      'UPDATE streams SET "stream-clicks"="stream-clicks"+1 WHERE "stream-id"=$1',
      [streamId]
    )
  } catch (err) {
    throw err
  } finally {
    client.release()
  }
  return result
}

module.exports = {
  getStreams,
  getStreamName,
  incrementStreamCount
}
