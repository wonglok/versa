import nlp from 'compromise'

export let sampleText = `## Verse Your Kindness.

# Make existence

let there be the universe, the multiverse and the rainbowverse.
let there be heaven and earth.

# Let things be

let the universe and heaven be love and light.
let the multiverse and rainbowverse be dope and fun.
let the earth be pizza and happiness.

# Organise

place the earth within the universe.
place heaven within universe.
place heaven within multiverse.
place heaven on earth.
place earth within rainbowverse.

# Extend description

may moon exist.
let moon be glowing.
place moon around rainbowverse.

{{ let earth be glowing }}
let there be apple.
let apple be fruit.
place apple in heaven.
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
  'cosmic': '����',
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
    return match + '.\n\n'
  })
}

export const readSentenceWords = ({ paragraph }) => {
  let myLexi = JSON.parse(JSON.stringify(lexicon))
  let world = []
  let brain = { world, paragraph }
  let worldAPI = makeWorldAPI({ world })

  paragraph = mcgill.cleanQuote(paragraph)
  nlp.plugin({
    tags: {},
    words: myLexi,
    patterns: {},
    regex: {},
    plurals: {}
  })
  let doc = nlp(paragraph)

  doc
    .sentences()
    .forEach((sentence) => {
      sentence
        .match('^let there be [*]')
        .not('the')
        .not('and')

        .tag('Existence')
        .out('tags')
        .forEach((tag) => {
          worldAPI.provideByID(tag.normal)
          worldAPI.tagsToLexicon({ lexicon: myLexi, tagName: 'Existence', item: tag })
        })
      sentence
        .match('^let !(here|there) * be the? [*]')
        .not('the')
        .not('and')

        .tag('Being')
        .out('tags')
        .forEach((tag) => {
          worldAPI.tagsToLexicon({ lexicon: myLexi, tagName: 'Being', item: tag })
        })
    })

  nlp.plugin({
    tags: {},
    words: myLexi,
    patterns: {},
    regex: {},
    plurals: {}
  })

  // exec with our lexicon
  nlp(doc.out('text'))
    .forEach((sentence) => {
      sentence.match('#Existence+').out('array').forEach((existenceTag) => {
        worldAPI.provideByID(existenceTag)
        worldAPI.provideBeing(existenceTag, sentence.match('#Being+').out('array'))
      })
    })

  nlp(doc.out('text'))
    .match('^place the? *? (at|in|on|near|within|around) the? *?')
    .forEach((sentence) => {
      let scan = sentence
        .match('^place the? * (at|in|on|near|within|around) [*]')
        .not('the')
        .out('array')

      sentence
        .match('#Existence+')
        .out('array')
        .filter(e => !scan.includes(e))
        .forEach((existenceTag) => {
          worldAPI.provideByID(existenceTag)
          worldAPI.providePlacing(existenceTag, scan)
        })
    })

  return {
    lexicon: myLexi,
    brain
  }
}
