var express = require('express')
// var fetch = require('node-fetch')
let axios = require('axios')
var cheerio = require('cheerio')

const PORT = 80
var app = express()

const getHtml = () =>
  axios
    .get('https://www.arconaitv.us/stream.php?id=138')
    .then(response => {
      if (response.status === 200) return response
      throw response
    })
    .then(html => cheerio.load(html))
    .catch(e => {
      console.log('Error:', e)
    })

const getAttribs = function(number, value) {
  const result = {
    src: this.attribs['src'], //?
    data: this.children[0] && this.children[0].data //?
  }

  console.log('attribs', result)

  return result
};

const getScript = $ => {
  const scripts = $('script').each(function(number, value) {
    console.log(this)
  }) //?

  // console.log(scripts);

  // getAttribs(scripts.get(0)) //?
};

app.get('/video', (req, res) => {
  getHtml().then($ => {
    var p = Promise.resolve()

    $('script').each(function(number, value) {
      console.log('El')
      // p = p.then(() => {
      //   console.log('Thing')
      //   // console.log(this.attribs["src"]); //?
      //   // if (this.children[0]) {
      //   //   console.log(this.children[0].data); //?
      //   // }
      // });
    })
    // console.log(scripts);
    return p
  })
    .then(result => {
      console.log(result)
  })
})

app.listen(PORT)
console.log(`${Date.now()}: Listening on port ${PORT}`)
