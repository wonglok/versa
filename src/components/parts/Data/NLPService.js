import nlp from 'compromise'

export const sampleText = `let the universe exist.
let earth and heaven exist within the universe.
let venus exist within the universe.

let heaven and earth be love and light and exist within multiverse.
let universe be fun.
let moon be glowing.
let venus be happy.

let heaven exist on earth.

let the multiverse exist and be cosmic.

let universe exist within multiverse.
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

const plugin = {
  words: lexicon,
  patterns: {
    '^let * exist *?': 'CreativeForce',
    'exist within the? * #PlaceHolder+': 'Within',
    'exist on the? * #PlaceHolder+': 'Within',
    'exist at the? * #PlaceHolder+': 'Within',
    'exist in the? * #PlaceHolder+': 'Within',
    'exist around the? * #PlaceHolder+': 'Within',
    '^let * be *': 'LetItBe'
  },
  tags: {
    Within: {
      isA: 'WordPower'
    },
    CreativeForce: {
      isA: 'WordPower'
    },
    LetItBe: {
      isA: 'WordPower'
    }
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

export function letsUnderstand ({ paragraph, world }) {
  let getID = () => {
    return `_${Number(Math.random() * 1024 * 1024).toFixed(0)}`
  }

  let sentences = nlp(paragraph)
    .sentences()
    .data()

  let langWorld = nlp(paragraph)
    .sentences()
    .world()

  // let patterns = Object.keys(langWorld.patterns).map(patternKey => {
  //   return {
  //     id: langWorld.patterns[patternKey],
  //     pattern: patternKey
  //   }
  // })
  // console.log(patterns)

  let creativeTypes = Object.keys(langWorld.tags)
    .map(name => {
      return {
        id: name,
        tag: langWorld.tags[name]
      }
    })
    .filter(info => {
      return info.tag.isA === 'WordPower'
    })

  let infoBase = sentences.map(s => s.text).reduce(
    (ctx, sentence) => {
      let debugInfo = ctx.debugInfo
      let world = ctx.world
      let doc = nlp(sentence)

      creativeTypes.forEach(info => {
        if (doc.has(`#${info.id}`)) {
          debugInfo.push({
            type: info.id,
            sentence
          })

          if (doc.has('#CreativeForce+')) {
            doc
              .match('#CreativeForce+')
              .out('tags')
              // .filter(p => p.tags.includes('PlaceHolder'))
              .reduce((carry, sentenceTag) => {
                // console.log(sentenceTag.normal, sentenceTag.tags)

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

                // create roots
                if (sentenceTag.tags.includes('PlaceHolder')) {
                  provideByID(sentenceTag.normal)
                }

                // child
                if (
                  sentenceTag.tags.includes('PlaceHolder') &&
                  !sentenceTag.tags.includes('Within')
                ) {
                  let item = provideByID(sentenceTag.normal)
                  carry.child = carry.child || []
                  carry.child.push(item)
                }

                // parent
                if (
                  sentenceTag.tags.includes('PlaceHolder') &&
                  sentenceTag.tags.includes('Within')
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

            places.map(t => t.normal).forEach(p => {
              let object = world.find(ww => ww.id === p)
              if (object) {
                object.data = object.data || {}
                let be = [
                  ...(object.data.be || [])
                ]
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
        }
      })

      return ctx
    },
    { world, debugInfo: [], html: '' }
  )

  return infoBase
}
