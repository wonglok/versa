import nlp from 'compromise'
let dictText = require('./cmudict.0.7a.txt')
let rows = dictText.split('\n')
let dict = {}
let me = {}
rows.map((row) => {
  if (row.match(/^[A-Z]/i)) {
    var words = row.split(/\s+/)
    var w = words[0].replace(/\(\d+\)$/, '')

    if (!dict[w]) dict[w] = []
    dict[w].push(words.slice(1))
  }
})
let synn = require('@/mcgill-db/similar-words.json')

me.pronounce = function (word) {
  return dict[word.toUpperCase()]
}

me.syllables = function (word) {
  var prose = me.pronounce(word)
  return prose && prose[0].filter(function (ph) {
    return ph.match(/^[AEIOU]/)
  }).length
}

me.rhyme = function (word) {
  word = word.toUpperCase()
  if (!dict[word]) return []

  var xs = dict[word].reduce(function (acc, w) {
    acc[active(w)] = true
    return acc
  }, {})

  var rhymes = []
  Object.keys(dict).forEach(function (w) {
    if (w === word) return

    var some = dict[w].some(function (p) {
      return xs[active(p)]
    })
    if (some) rhymes.push(w)
  }, [])
  return rhymes
}

function toTitleCase (str) {
  return str.replace(/\w\S*/g, (txt) => {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  })
}

function active (ws) {
  // active rhyming region: slice off the leading consonants
  for (var i = 0; i < ws.length && ws[i].match(/^[^AEIOU]/i); i++) {
    continue
  }
  return ws.slice(i).join(' ')
}

self.addEventListener('message', (event) => {
  if (event.data.type === 'process') {
    let words = nlp(event.data.paragraph).terms().out('freq').map(e => e.normal)
    let docRhymes = words.reduce((suggestions, eachWord) => {
      /*
      [
        ['word group 1 member a', 'b'],
        ['word group 1 member a', 'b']
      ]
      */
      let rhymes = me.rhyme(eachWord)
      rhymes = rhymes.map(w => {
        return toTitleCase(w)
      })
      if (rhymes.length > 0) {
        rhymes.unshift(eachWord)
        rhymes = rhymes.filter((e, i) => i < 30)
        suggestions.push(rhymes)
      }
      return suggestions
    }, [])

    let docSynn = words.reduce((suggestions, eachWord) => {
      let filteredSynn = synn.filter(arr => arr.includes(eachWord))
      suggestions.push(...filteredSynn)
      return suggestions
    }, [])

    self.postMessage({ type: 'done-suggestions', rhymes: docRhymes, synn: docSynn })
    console.log('sending back NLP result....')
  }

  // if (event.data.type === 'refresh') {
  //   self.postMessage({ type: 'refresh' })
  //   self.close()
  // }

  // if (event.data.type === 'app-init') {
  //   self.postMessage({ type: 'app-init', paragraph: event.data.paragraph })
  // }
})
