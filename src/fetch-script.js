const axios = require('axios')
const cheerio = require('cheerio')

module.exports = (streamid = 138) =>
  axios
    .get(`https://www.arconaitv.us/stream.php?id=${streamid}`)
    .then(response => response.data)
    .then(html => {
      const $ = cheerio.load(html) // Populate cheerio, our headless DOM
      const scripts = $('script')
        .map(function() {
          // For each script (Don't use an arrow fn as it won't have 'this')
          //  get the source and the data from the script
          const source = this.attribs['src']
          const data =
            this.children[0] && this.children[0].data
              ? this.children[0].data
              : undefined

          // Reformat the script to be injected (if it contains 'video')
          return {
            inlineScript:
              data && data.indexOf('video') >= 0
                ? `<script>${data}</script>`
                : undefined,
            referenceScript:
              source && source.indexOf('video') >= 0
                ? `<script src="${source}"></script>`
                : undefined
          }
        })
        .get()

      // Join the scripts together
      return {
        referenceScripts: scripts
          .filter(script => script.referenceScript)
          .map(script => script.referenceScript)
          .join(''),
        inlineScripts: scripts
          .filter(script => script.inlineScript)
          .map(script => script.inlineScript)
          .join('')
      }
    })
