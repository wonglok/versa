import * as NLP from './NLPService'

self.addEventListener('message', (event) => {
  if (event.data.type === 'process') {
    let result = NLP.readSentenceWords({ paragraph: event.data.paragraph })
    self.postMessage({ type: 'process', result })
    console.log('sending back NLP result....')
  }

  if (event.data.type === 'refresh') {
    self.postMessage({ type: 'refresh' })
    self.close()
  }

  if (event.data.type === 'app-init') {
    self.postMessage({ type: 'app-init', paragraph: event.data.paragraph })
  }
})
