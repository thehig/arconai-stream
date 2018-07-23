import axios from 'axios'
import cheerio from 'cheerio'

const fetch = url => axios.get(url)
const extractData = response => response.data
const loadCheerio = html => cheerio.load(html)

const scrapeAllScripts = $ =>
  $('script').map(function() {
    // Don't use an arrow fn as it won't have 'this'
    return this.children[0] && this.children[0].data
      ? this.children[0].data
      : undefined
  })

const inlineScriptToString = scripts =>
  scripts.map((index, value) => value).get()

const filterFor = desiredScriptContent => scripts =>
  scripts.filter(script => script.indexOf(desiredScriptContent) >= 0)

const thereCanBeOnlyOne = scripts => {
  if (scripts && scripts.length === 1) return scripts[0]
  throw new Error('Invalid scripts')
}

const cutStartingFrom = (startingFrom, trimLength = 0) => script =>
  script
    .substring(
      script.indexOf(startingFrom),
      script.length - trimLength
    )

const removeHiddenChars = input => input.replace(/\u200B/g, '').trim()

export default () =>
  fetch('https://www.arconaitv.us/stream.php?id=138')
    .then(extractData)
    .then(loadCheerio)
    .then(scrapeAllScripts)
    .then(inlineScriptToString)
    .then(filterFor('document.getElementsByTagName(\'video\')'))
    .then(thereCanBeOnlyOne)
    .then(cutStartingFrom('eval(', 2))
    .then(removeHiddenChars)
