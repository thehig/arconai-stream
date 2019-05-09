const axios = require('axios')
const cheerio = require('cheerio')
const config = require('config')

module.exports = async (streamid = 138) => {
  try {
    const page = await axios.get(config.get('STREAM_URL') + streamid)

    const $ = cheerio.load(page.data) // Populate cheerio, our headless DOM
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
            data && data.indexOf(config.get('DATA_FILTER')) >= 0
              ? `<script>${data}</script>`
              : undefined,
          referenceScript:
            source && source.indexOf(config.get('DATA_FILTER')) >= 0
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
  } catch (err) {
    throw new Error(`Problem encountered while fetching scripts: ${err}`)
  }
}
