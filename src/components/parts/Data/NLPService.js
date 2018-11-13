const nlp = require('compromise')
var emoji = require('node-emoji')

export let sampleText = `# Verse Your Kindness.

### Make existence

may the universe, the multiverse and the rainbowverse exist.
may the heaven and the earth exist.

may you exist.

### Let things be

let the universe and heaven be love and light.
let the multiverse and heaven be dope and fun.
let you be happy.
let rainbowverse be love, awesome and dope.

### Organise

link multiverse with universe.
link multiverse with rainbowverse.

link universe with multiverse.
link universe with earth.

link rainbowverse with multiverse.
link heaven with multiverse.

link heaven with earth.

link you with heaven.
link you with moon.
link you with rainbowverse.

### Extend description

may moon exist.
let moon be glowing.
link earth with moon.

Star Quote
{{ let earth be glowing. +}}
Double Star Quote
{{ let earth be glowing. ++}}

Hidden Quote
{{ let earth be glowing. -}}
Doubble Hidden Quote
{{ let earth be glowing. --}}

Controversial Quote
{{ let earth be glowing. +-}}
Controversial Quote
{{ let earth be glowing. -+}}

may apple exist.
let apple be fun.
link apple with rainbowverse.
link apple with moon.
link apple with universe.
`

export let lexicon = {
  // multiverse: ['Existence'],
  // universe: ['Existence'],
  // rainbowverse: ['Existence'],

  // heaven: ['Existence'],

  // venus: ['Existence'],
  // moon: ['Existence'],
  // earth: ['Existence'],
  // mars: ['Existence'],

  // glowing: ['Being'],
  // cosmic: ['Being'],
  // dope: ['Being'],
  // fun: ['Being'],
  // goodie: ['Being'],
  // amazing: ['Being'],
  // love: ['Being'],
  // light: ['Being'],
  // happiness: ['Being'],
  // happy: ['Being'],
  // godly: ['Being'],
  // joyful: ['Being'],
  // joy: ['Being'],
  // awesome: ['Being']
}

export let mojis = {
  'glowing': '💫',
  'cosmic': '🌌',
  'dope': '🥰',
  'fun': '😂',
  'goodie': '👍🏻',
  'amazing': '😎',
  'love': '❤️',
  'light': '🌈',
  'happiness': '😁',
  'happy': '😆',
  'godly': '❤️',
  'joyful': '😃',
  'joy': '😃',
  'awesome': '🦄'
}

export const emojify = (arr) => {
  let result = arr.reduce((str, item) => {
    str += (mojis[item] || emoji.emojify(emoji.get(item), t => t) || item) + ' '
    return str
  }, '')
  return result
}

export let getID = () => {
  return `_${Number(Math.random() * 1024 * 1024).toFixed(0)}`
}

export function toTitleCase (str) {
  return str.replace(
    /\w\S*/g,
    function (txt) {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    }
  )
}

export const makeWorldAPI = ({ world }) => {
  let provideByID = id => {
    let result = world.find(w => w.id === id)
    if (!result) {
      let newMe = {
        uuid: getID(),
        id,
        data: {}
      }
      world.push(newMe)
      return newMe
    } else {
      return result
    }
  }

  let provideBeing = (id, beings = []) => {
    let result = world.find(w => w.id === id)
    result.data.be = result.data.be || []
    beings.forEach(be => {
      if (!result.data.be.includes(be)) {
        result.data.be.push(be)
      }
    })
  }

  let providePlacing = (id, placedAts = []) => {
    let result = world.find(w => w.id === id)
    result.data.parentIDs = result.data.parentIDs || []
    placedAts.forEach(place => {
      if (!result.data.parentIDs.includes(place) && id !== place) {
        result.data.parentIDs.push(place)
      }
    })
  }

  let tagsToLexicon = ({ lexicon, tagName, item }) => {
    let lexObj = lexicon[item.normal] = lexicon[item.normal] || []
    if (!lexObj.includes(tagName)) {
      lexObj.unshift(tagName)
    }
    item.tags.forEach((tag) => {
      if (!lexObj.includes(tag)) {
        lexObj.unshift(tag)
      }
    })
  }

  return {
    tagsToLexicon,
    provideByID,
    provideBeing,
    providePlacing
  }
}

export const mcgill = {}
mcgill.cleanQuote = (str) => {
  return str.replace(/{(.*?){(.*?)}(.*?)}/g, (match) => {
    //
    // return match[1];
    if (match[1] === 'x') { return '' }

    match = match.replace(/\++}/g, '}')
    match = match.replace(/-}/g, '}')
    match = match.replace(/{.*?{(.*?)}.*?}/g, '$1')
    // quote = match[1] + match[2] + match[3]
    // match = match.replace(/\+\+/g,'')
    return match + '\n'
  })
}

export const readSentenceWords = ({ paragraph }) => {
  let myLexi = JSON.parse(JSON.stringify(lexicon))
  let world = []
  let brain = { world, paragraph }
  let worldAPI = makeWorldAPI({ world })

  paragraph = mcgill.cleanQuote(paragraph)
  paragraph = paragraph.replace(/\./g, '. ')

  let refreshDictionary = () => {
    nlp.plugin({
      tags: {},
      words: { ...myLexi },
      patterns: {},
      regex: {},
      plurals: {}
    })
  }
  refreshDictionary()

  let doc = nlp(paragraph)

  doc
    // .sentences()
    .data()
    .map(s => s.text)
    .forEach((sentence) => {
      refreshDictionary()

      nlp(sentence)
        .match('may the? [*] exist')
        .not('the')
        .not('and')
        .out('tags')
        .forEach((tag) => {
          worldAPI.provideByID(tag.normal)
          worldAPI.tagsToLexicon({ lexicon: myLexi, tagName: 'Existence', item: tag })
        })

      nlp(sentence)
        .match(`!exist? let *? #Existence+ *? be [*]`)
        .not('the')
        .not('and')
        .terms()
        .out('tags')
        .forEach((tag) => {
          worldAPI.tagsToLexicon({ lexicon: myLexi, tagName: 'Being', item: tag })
        })
    })

  refreshDictionary()

  // exec with our lexicon
  nlp(doc.out('text'))
    .forEach((sentence) => {
      sentence.match('#Existence+').out('array').forEach((existenceTag) => {
        worldAPI.provideByID(existenceTag)
        worldAPI.provideBeing(existenceTag, sentence.match('#Being+').terms().out('array'))
      })
    })

  nlp(doc.out('text'))
    .match('link the? #Existence+ (at|in|on|near|with|within|around) the? #Existence+')
    .forEach((sentence) => {
      let parentPlaces = sentence
        .match('link the? #Existence+ (at|in|on|near|with|within|around) the? [#Existence+]')
        .not('the')
        .out('array')

      sentence
        .match('#Existence+')
        .out('array')
        .filter(e => !parentPlaces.includes(e))
        .forEach((existenceTag) => {
          worldAPI.provideByID(existenceTag)
          worldAPI.providePlacing(existenceTag, parentPlaces)
        })
    })

  return {
    lexicon: myLexi,
    brain
  }
}
