module.exports = {
  // Port that the Express Server will run on
  EXPRESS_PORT: process.env.PORT || 3000,
  // URL for the database containing the streams
  DATABASE_URL: process.env.DATABASE_URL,
  // URL for the stream page
  STREAM_URL: 'https://www.arconaitv.us/stream.php?id=',
  // Parameter for finding scripts on page
  DATA_FILTER: 'video'
}
