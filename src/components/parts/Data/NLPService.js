import nlp from 'compromise'

export let sampleText = `let there be the universe.
let the universe be love and light.
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

  // glowing: ['BeHere'],
  // cosmic: ['BeHere', 'Spacious', 'Spirit'],
  // dope: ['BeHere', 'Great', 'Spirit'],
  // fun: ['BeHere', 'Fun', 'Spirit'],
  // goodie: ['BeHere', 'Fun', 'Spirit'],
  // amazing: ['BeHere', 'Love', 'Spirit'],
  // love: ['BeHere', 'Love', 'Spirit'],
  // light: ['BeHere', 'Love', 'Spirit'],
  // happiness: ['BeHere', 'Love', 'Spirit'],
  // happy: ['BeHere', 'Love', 'Spirit'],
  // godly: ['BeHere', 'Love', 'Spirit'],
  // joyful: ['BeHere', 'Love', 'Spirit'],
  // joy: ['BeHere', 'Love', 'Spirit'],
  // awesome: ['BeHere', 'Love', 'Spirit']
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

export function getBrain ({ paragraph }) {
  let world = []
  let brain = { world }
  let myLexicon = JSON.parse(JSON.stringify(lexicon))
  const plugin = {
    words: myLexicon,
    tags: {
      // Placing: {
      //   isA: 'WordPower'
      // },
      // CreativeForce: {
      //   isA: 'WordPower'
      // },
      // LetItBe: {
      //   isA: 'WordPower'
      // }
    },
    patterns: {
      '^let there be [.+]': 'MarkLetThereBe',
      '^let the? #Existence+ be [*]': 'MarkBeings',

      '^let the? [#Existence+ be #Being+]': 'RunLetExistenceBe'
      // // '^let *?': 'Let',
      // '^let there be [*]': 'CreativeForce',
      // '^place the? . within the? .': 'Placing',
      // '^place the? . in the? .': 'Placing',
      // '^place the? . on the? .': 'Placing',
      // '^place the? . at the? .': 'Placing'
    },
    regex: {
      // '[a-z]iraptor$':'Dinosaur',
    }
    // plurals:{
    //   brontosaurus: 'brontosauri',
    //   stegosaurus: 'stegosauruses'
    // }
  }
  nlp.plugin(plugin)

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
    result.data.be.push(...beings)
  }

  let cleanTags = (b) => {
    return b.not('#Preposition')
      .not('#Conjunction')
      .not('placed')
      .not('let')
      .not('the')
      .out('tags')
  }

  let letThereBe = () => {
    let b = nlp(paragraph).match('#MarkLetThereBe')
    return cleanTags(b)
  }

  // scan existance
  letThereBe()
    .forEach((item) => {
      let lex = myLexicon[item.normal] = myLexicon[item.normal] || []
      if (!lex.includes('Existence')) {
        lex.push('Existence')
      }
      item.tags.forEach((tag) => {
        if (!lex.includes(tag)) {
          lex.push(tag)
        }
      })
    })
  nlp.plugin(plugin)

  let letExistenceBe = () => {
    let b = nlp(paragraph)
      .match('#MarkBeings')
    return cleanTags(b)
  }

  // scan being
  letExistenceBe()
    .forEach((item) => {
      let lex = myLexicon[item.normal] = myLexicon[item.normal] || []
      if (!lex.includes('Being')) {
        lex.push('Being')
      }
      item.tags.forEach((tag) => {
        if (!lex.includes(tag)) {
          lex.push(tag)
        }
      })
    })

  nlp.plugin(plugin)

  // let things exist
  letThereBe()
    .forEach(tag => {
      provideByID(tag.normal)
    })

  // let things be
  nlp(paragraph)
    .match('^let the? #Existence+ be #Being+ *?')
    .forEach((sentence) => {
      sentence.match('#Existence+').out('array').forEach((existenceTag) => {
        provideByID(existenceTag)
        provideBeing(existenceTag, sentence.match('#Being+').out('array'))
      })
    })

  return {
    lexicon: myLexicon,
    brain
  }
}
