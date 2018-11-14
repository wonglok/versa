// import * as MDB from '@/mcgill-db/mcgilldb.js'
import nlp from 'compromise'
const soundex = (s) => {
  // https://gist.github.com/shawndumas/1262659
  var a = s.toLowerCase().split('')
  var f = a.shift()
  var r = ''
  var codes = {
    a: '',
    e: '',
    i: '',
    o: '',
    u: '',

    b: 1,
    f: 1,
    p: 1,
    v: 1,
    c: 2,
    g: 2,
    j: 2,
    k: 2,
    q: 2,
    s: 2,
    x: 2,
    z: 2,
    d: 3,
    t: 3,
    l: 4,
    m: 5,
    n: 5,
    r: 6
  }

  r = f + a
    .map(function (v, i, a) { return codes[v] })
    .filter(function (v, i, a) {
      return ((i === 0) ? v !== codes[f] : v !== a[i - 1])
    })
    .join('')

  return (r + '000').slice(0, 4).toUpperCase()
}

const levenshteinDistance = (s, t) => {
  if (!s.length) return t.length
  if (!t.length) return s.length

  return Math.min(
    levenshteinDistance(s.substr(1), t) + 1,
    levenshteinDistance(t.substr(1), s) + 1,
    levenshteinDistance(s.substr(1), t.substr(1)) + (s[0] !== t[0] ? 1 : 0)
  ) + 1
}

// let roundexGroups = require('@/mcgill-db/roundex-group.json')
// const searchSoundex = ({ search }) => {
//   let rw = search.split('').reverse().join()
//   let roundex = soundex(rw)
//   let result = roundexGroups[roundex]
//   result = result.sort((a, b) => {
//     return levenshteinDistance(a, search) - levenshteinDistance(b, search)
//   })
//   result = result.filter((e, i) => i < 20)
//   // console.log(result)
//   return [search, ...result.map(r => r.toLowerCase())]
// }

let synn = require('@/mcgill-db/similar-words.json')

let roundexCSV = require('@/mcgill-db/roundex.csv')
let rows = roundexCSV.split('\n')
rows.shift()
let records = rows.map((row) => {
  let items = row.split('|')
  let word = items[0]
  let roundex = items[1]
  return {
    word,
    reversed: word.split('').reverse().join(''),
    roundex
  }
})

const searchFuzzy = ({ search }) => {
  // console.log(records)
  let rw = search.split('').reverse().join('')
  let rdx = soundex(rw)
  let searchResult = records.reduce((result, info) => {
    if (rdx === info.roundex) {
      // info.dist = levenshteinDistance(rw, info.reversed)
      result.push(info.word)
    }
    return result
  }, [])
  // .sort((a, b) => {
  //   return a.dist - b.dist
  // })
  console.log(searchResult)

  // searchResult = searchResult.filter((e, i) => i < 20)
  return [search, ...searchResult.map(r => r.toLowerCase())]
}

self.addEventListener('message', (event) => {
  if (event.data.type === 'process') {
    let words = nlp(event.data.paragraph).terms().out('freq').map(e => e.normal)
    let result = words.reduce((suggestions, eachWord) => {
      let result = searchFuzzy({ search: eachWord })
      suggestions.push(result)

      let filteredSynn = synn.filter(arr => arr.includes(eachWord))
      suggestions.push(...filteredSynn)

      return suggestions
    }, [])

    self.postMessage({ type: 'done-suggestions', suggestions: result })
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
