import axios from 'axios'
import cheerio from 'cheerio'

const fetch = url => axios.get(url)
const extractData = response => response.data
const loadCheerio = html => cheerio.load(html)

const scrapeAllScripts = $ => {
  const scripts = $('script')
  return scripts.map(function() {
    const child = this.children[0]
    return child && child.data ? child.data : undefined
  })
}

const inlineScriptToString = scripts => {
  const values = scripts.map((index, value) => value)
  const results = []
  for (var i = 0; i < values.length; i++) {
    results.push(values[i].trim())
  }

  return results
}

const filterFor = desiredScriptContent => scripts =>
  scripts.filter(script => script.indexOf(desiredScriptContent) >= 0)

const validate = scripts => {
  if (scripts && scripts.length === 1) return scripts[0]
  throw new Error('Invalid scripts')
}

const startingTag = 'eval('
const interestingScriptPart = script => {
  return script;
  // const startingIndex = script.indexOf(startingTag) /*  + startingTag.length */
  // return script.substring(startingIndex, script.length - 2)
}

fetch('https://www.arconaitv.us/stream.php?id=138')
  .then(extractData)
  .then(loadCheerio)
  .then(scrapeAllScripts)
  .then(inlineScriptToString)
  .then(filterFor('document.getElementsByTagName(\'video\')'))
  .then(validate)
  .then(interestingScriptPart)
  .then(script => {
    console.log(script)
    // let document = {}
    // eval(script) //?
  })
