
export const soundex = (s) => {
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

export const levenshteinDistance = (s, t) => {
  if (!s.length) return t.length
  if (!t.length) return s.length

  return Math.min(
    levenshteinDistance(s.substr(1), t) + 1,
    levenshteinDistance(t.substr(1), s) + 1,
    levenshteinDistance(s.substr(1), t.substr(1)) + (s[0] !== t[0] ? 1 : 0)
  ) + 1
}
// -----
// let getSynnRecords = (text) => {
//   let rows = text.split('\n')
//   // rows.shift()
//   let records = rows.map((row) => {
//     let items = row.split('|')
//     let id = items[0]
//     let words = (items[1] || '').split(',')
//     return {
//       id,
//       words
//     }
//   })
//   return records
// }

// let getSynnIdxRecords = (text, synn) => {
//   let rows = text.split('\n')
//   // rows.shift()
//   let records = rows.map((row) => {
//     let items = row.split('|')
//     let id = items[1]
//     let word = items[0]
//     let extra = synn.find(s => s.id === id) || { words: [] }
//     let words = [word, ...extra.words]
//     return {
//       words,
//       id
//     }
//   })
//   return records
// }

// let SYNONYMS = require('./skipgit/MASTER SYNONYMS.kdb')
// let SYNONYMS_IDX = require('./skipgit/MASTER SYNONYMS INDEX.kdb')

// let synn = getSynnRecords(SYNONYMS)
// let synnIdx = getSynnIdxRecords(SYNONYMS_IDX, synn)

// console.log(synnIdx)
// -----

// export const runSoundex = (w) => {
//   return new Promise((resolve) => {
//     let rWord = w.split().reverse().join()
//     setTimeout(() => {
//       resolve({
//         word: w,
//         reverseSoundex: soundex(rWord)
//       })
//     }, 10)
//   })
// }

// export const loadSoundexOf = () => {
//   let words = require('./wordlist-moby-mwords.txt')

//   let newWords = words.split('\n').filter(s => !!s).map(s => {
//     let res = s.split('\r').join('')
//     return res
//   })

//   let result = newWords.map((r) => {
//     let rw = r.split('').reverse().join('')
//     return `${r}|${soundex(rw)}`
//   })

//   // let result = newWords.reduce((group, word) => {
//   //   let rw = word.split('').reverse().join('')
//   //   let roundex = soundex(rw)

//   //   group[roundex] = group[roundex] || []
//   //   if (!group[roundex].includes(word)) {
//   //     group[roundex].push(word)
//   //   }
//   //   return group
//   // }, {})
//   console.log(result)
// }

// loadSoundexOf()

// export const searchSoundex = ({ search }) => {
//   let roundexGroups = require('./roundex-group.json')
//   let rw = search.split('').reverse().join()
//   let roundex = soundex(rw)
//   let result = roundexGroups[roundex]
//   result = result.sort((a, b) => {
//     return levenshteinDistance(a, search) - levenshteinDistance(b, search)
//   })
//   console.log(result)
// }

// searchSoundex('happy')

// let roundexCSV = require('./roundex.csv')
// const searchFuzzy = (search) => {
//   let rows = roundexCSV.split('\n')
//   rows.shift()
//   let records = rows.map((row) => {
//     let items = row.split('|')
//     let word = items[0]
//     let roundex = items[1]
//     return {
//       word,
//       reversed: word.split('').reverse().join(''),
//       roundex
//     }
//   })

//   // console.log(records)
//   let rw = search.split('').reverse().join('')
//   let rdx = soundex(rw)
//   let searchResult = records.reduce((result, info) => {
//     if (rdx === info.roundex) {
//       info.dist = levenshteinDistance(rw, info.reversed)
//       result.push(info)
//     }
//     return result
//   }, []).sort((a, b) => {
//     return a.dist - b.dist
//   })

//   console.log(searchResult)

//   return searchResult
// }

// searchFuzzy('happy')
