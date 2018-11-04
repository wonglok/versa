import nlp from 'compromise'

export let sampleText = `let rainbowverse be fun.
let multiverse be goodie and joyful.
let universe be love and light.
let earth be dope and love and placed within universe.
let moon be glowing and amazing and placed near earth and in universe.

let heaven be awesome and placed on earth, in rainbowverse, multiverse and universe.

let words and ideas be heard.

let you be happy and placed on earth, universe and multiverse and rainbowverse.
`

export let lexicon = {
  // multiverse: ['PlaceHolder'],
  // universe: ['PlaceHolder'],
  // rainbowverse: ['PlaceHolder'],

  // heaven: ['PlaceHolder'],

  // venus: ['PlaceHolder'],
  // moon: ['PlaceHolder'],
  // earth: ['PlaceHolder'],
  // mars: ['PlaceHolder'],

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
export function getLexicon ({ paragraph }) {
  let myLexicon = JSON.parse(JSON.stringify(lexicon))
  const plugin = {
    words: myLexicon,
    tags: {
      Wrap: {
        isA: 'WordPower'
      },
      CreativeForce: {
        isA: 'WordPower'
      },
      LetItBe: {
        isA: 'WordPower'
      }
    },
    patterns: {
      // '^let *?': 'Let',
      '^let *?': 'CreativeForce',

      'placed within the? *?': 'Wrap',
      'placed on the? *?': 'Wrap',
      'placed at the? *?': 'Wrap',
      'placed in the? *?': 'Wrap',
      'placed near the? *?': 'Wrap',

      'be *?': 'LetItBe'
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

  nlp(paragraph)
    .match('#CreativeForce+')
    .match('let [*] (be|placed)')
    .not('#Preposition')
    .not('#Conjunction')
    .not('let')
    .out('tags')
    .forEach((item) => {
      let lex = myLexicon[item.normal] = myLexicon[item.normal] || []
      if (!lex.includes('PlaceHolder')) {
        lex.push('PlaceHolder')
      }
      item.tags.forEach((tag) => {
        if (!lex.includes(tag)) {
          lex.push(tag)
        }
      })
    })

  nlp(paragraph)
    .match('#Wrap+')
    .not('#Preposition')
    .not('#Conjunction')
    .not('placed')
    .not('near')
    .out('tags')
    .forEach((item) => {
      let lex = myLexicon[item.normal] = myLexicon[item.normal] || []
      if (!lex.includes('PlaceHolder')) {
        lex.push('PlaceHolder')
      }
      item.tags.forEach((tag) => {
        if (!lex.includes(tag)) {
          lex.push(tag)
        }
      })
    })
  nlp.plugin(plugin)

  nlp(paragraph)
    .match('#LetItBe+')
    .not('#Preposition')
    .not('#Conjunction')
    .not('#Wrap+')
    .not('be')
    .out('tags')
    .forEach((item) => {
      let lex = myLexicon[item.normal] = myLexicon[item.normal] || []
      if (!lex.includes('BeHere')) {
        lex.push('BeHere')
      }
      item.tags.forEach((tag) => {
        if (!lex.includes(tag)) {
          lex.push(tag)
        }
      })
    })

  nlp.plugin(plugin)
  return myLexicon
}

export function letsUnderstand ({ paragraph }) {
  let brain = { world: [] }
  getLexicon({ paragraph: paragraph })

  nlp(paragraph)
    // .match('#WordPower')
    .sentences()
    .data()
    .map(s => s.text)
    .reduce((brain, sentence) => {
      let world = brain.world
      let doc = nlp(sentence)

      let provideByID = id => {
        let result = world.find(w => w.id === id)
        if (!result) {
          let newMe = {
            uuid: getID(),
            id
          }
          world.push(newMe)
          return newMe
        } else {
          return result
        }
      }

      if (doc.has('#CreativeForce+')) {
        doc
          .match('#CreativeForce+')
          .out('tags')
          // .filter(p => p.tags.includes('PlaceHolder'))
          .reduce((carry, sentenceTag) => {
            // console.log(sentenceTag.normal, sentenceTag.tags)

            // create roots
            if (sentenceTag.tags.includes('PlaceHolder')) {
              provideByID(sentenceTag.normal)
            }

            // child
            if (
              sentenceTag.tags.includes('PlaceHolder') &&
              !sentenceTag.tags.includes('Wrap')
            ) {
              let item = provideByID(sentenceTag.normal)
              carry.child = carry.child || []
              carry.child.push(item)
            }

            // parent
            if (
              sentenceTag.tags.includes('PlaceHolder') &&
              sentenceTag.tags.includes('Wrap')
            ) {
              if (carry.child) {
                carry.child.forEach(ch => {
                  // ch.parentID = sentenceTag.normal
                  ch.parentIDs = ch.parentIDs || []

                  if (
                    !ch.parentIDs.includes(sentenceTag.normal) &&
                    ch.id !== sentenceTag.normal
                  ) {
                    ch.parentIDs.push(sentenceTag.normal)
                  }
                })
              }
            }

            return carry
          }, {})
      }

      if (doc.has('#LetItBe+')) {
        let places = doc.match('#PlaceHolder+').out('tags')
        let spirits = doc.match('#BeHere+').out('tags')
        places
          // only apply to the subject
          .filter(t => !t.tags.includes('Wrap'))
          .map(t => t.normal).forEach(p => {
            let object = world.find(ww => ww.id === p)
            if (object) {
              object.data = object.data || {}
              let be = object.data.be || []
              spirits.map(s => s.normal).reduce((be, normal) => {
                if (!be.includes(normal)) {
                  be.push(normal)
                }
                return be
              }, be)

              object.data = {
                ...object.data,
                be
              }
            }
          })
      }

      return brain
    }, brain)

  return brain
}
