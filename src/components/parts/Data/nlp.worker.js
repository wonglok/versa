import * as NLP from './NLPService'

console.log('worker refreshed')

self.addEventListener('message', (event) => {
  if (event.data.type === 'understand' || event.data.type === 'input') {
    let result = NLP.readSentenceWords({ paragraph: event.data.paragraph })
    self.postMessage({ type: event.data.type, result })
  }
  if (event.data.type === 'init') {
    self.postMessage({ type: 'init', paragraph: event.data.paragraph })
  }
})
