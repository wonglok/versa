import nlp from 'compromise'

export let sampleText = `let rainbowverse be fun.
let multiverse be goodie and joyful.
let universe be love and light.
let earth be dope and love and placed within universe.
let moon be glowing and amazing and placed near earth and in universe.

let heaven be awesome and placed on earth, in rainbowverse, multiverse and universe.
`

export let lexicon = {
  multiverse: ['PlaceHolder'],
  universe: ['PlaceHolder'],
  rainbowverse: ['PlaceHolder'],

  heaven: ['PlaceHolder'],

  venus: ['PlaceHolder'],
  moon: ['PlaceHolder'],
  earth: ['PlaceHolder'],
  mars: ['PlaceHolder'],

  glowing: ['BeHere'],
  cosmic: ['BeHere', 'Spacious', 'Spirit'],
  dope: ['BeHere', 'Great', 'Spirit'],
  fun: ['BeHere', 'Fun', 'Spirit'],
  goodie: ['BeHere', 'Fun', 'Spirit'],
  amazing: ['BeHere', 'Love', 'Spirit'],
  love: ['BeHere', 'Love', 'Spirit'],
  light: ['BeHere', 'Love', 'Spirit'],
  happiness: ['BeHere', 'Love', 'Spirit'],
  happy: ['BeHere', 'Love', 'Spirit'],
  godly: ['BeHere', 'Love', 'Spirit'],
  joyful: ['BeHere', 'Love', 'Spirit'],
  joy: ['BeHere', 'Love', 'Spirit'],
  awesome: ['BeHere', 'Love', 'Spirit']
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

export function letsUnderstand ({ paragraph, lexicon }) {
  const plugin = {
    words: lexicon,
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
      'placed within the? *? #PlaceHolder+ *?': 'Wrap',
      'placed on the? *? #PlaceHolder+ *?': 'Wrap',
      'placed at the? *? #PlaceHolder+ *?': 'Wrap',
      'placed in the? *? #PlaceHolder+ *?': 'Wrap',
      'placed near the? *? #PlaceHolder+ *?': 'Wrap',

      'be #BeHere+ *?': 'LetItBe'
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

  let sentences = nlp(paragraph, lexicon)
    .sentences()
    .data()

  let brain = { world: [] }

  sentences.map(s => s.text).reduce((brain, sentence) => {
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
