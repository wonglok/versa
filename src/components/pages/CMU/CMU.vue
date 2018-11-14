<template>
<div class="full" :class="{ processing: workerStatus === 'processing' }">
  <div class="full editor-lr">
    <div class="ed-left">
      <codemirror class="full" @ready="onCmReady" v-model="paragraph" :options="cmOptions"></codemirror>
      <div class="loading-div" v-if="workerStatus">
        <h1 v-if="workerStatus === 'download'">Engine Loading...</h1>
        <h1 v-if="workerStatus === 'processing'">Processing...</h1>
      </div>
    </div>
    <div class="ed-right">
      <h3>Synonyms: {{ current.word }}</h3>
      <ul class="rhymes-suggestions">
        <li :key="lii" v-for="(li, lii) in current.synn" @click="replace(li)">{{ li }}</li>
      </ul>

      <h3>Rhyme: {{ current.word }}</h3>
      <ul class="rhymes-suggestions">
        <li :key="lii" v-for="(li, lii) in current.rhymes" @click="replace(li)">{{ li }}</li>
      </ul>

      <router-link class="go-home" to="/">Home</router-link>
    </div>
  </div>

</div>
</template>

<script>
import { codemirror } from 'vue-codemirror'
import CodeMirror from 'codemirror'
import 'codemirror/keymap/sublime.js'
import 'codemirror/addon/hint/show-hint.js'
import RhymeWorker from './cmu-dict/rhyme.worker.js'
import uniq from 'lodash.uniq'

export default {
  components: {
    codemirror
  },
  data () {
    let appdata = {
      workerStatus: false,
      rhymes: [],
      synn: [],
      suggestions: [],
      disableRefresh: false,
      paragraph: null,
      cm: false,
      current: {
        word: '',
        rhymes: [],
        synn: []
      },
      cmOptions: {
        extraKeys: { 'Ctrl-Space': 'autocomplete' },
        // codemirror options
        keyMap: 'sublime',
        tabSize: 2,
        mode: 'cmuRHYME',
        // theme: 'chrome',
        lineWrapping: true,
        lineNumbers: true,
        line: true,
        hintOptions: {
          // customKeys: {
          //   'Arrow-Up': '',
          //   'Arrow-Down': ''
          // },
          alignWithWord: false,
          hint: this.handleWordSuggestion,
          closeOnUnfocus: true
        }
      },
      clearPITimeout: 0,
      acTimeout: 0
    }
    appdata.workerStatus = 'download'
    appdata.worker = new RhymeWorker()
    var handler = (evt) => {
      if (evt.data.type === 'done-suggestions') {
        appdata.workerStatus = 'ready'

        appdata.rhymes = evt.data.rhymes
        appdata.synn = evt.data.synn
        appdata.suggestions = [...appdata.synn]
        if (this.cm) {
          this.disableRefresh = true
          let curosr = this.cm.getCursor()
          setTimeout(() => {
            CodeMirror.commands.autocomplete(this.cm, null, {completeSingle: true})
            CodeMirror.commands.undo(this.cm)
            CodeMirror.commands.redo(this.cm)
            this.cm.setCursor({ line: curosr.line, ch: curosr.ch })
            this.disableRefresh = false
          }, 0)
        }
      }
    }
    appdata.worker.addEventListener('message', handler)

    return appdata
  },
  mounted () {
    this.loadInfo()
  },
  methods: {
    loadInfo () {
      setTimeout(() => {
        this.paragraph = `reading text is fun.`
        this.processInfo()
      }, 300)
    },
    processInfo () {
      if (this.disableRefresh) {
        return
      }
      this.workerStatus = 'processing'
      clearTimeout(this.clearPITimeout)
      this.clearPITimeout = setTimeout(() => {
        this.worker.postMessage({ type: 'process', paragraph: this.paragraph })
      }, 500)
    },
    onCmReady (cm) {
      // console.log(cm)
      this.cm = cm
      cm.toggleComment = () => {
      }

      this.acTimeout = 0
      let tryOepnAC = () => {
        clearTimeout(this.acTimeout)
        this.acTimeout = setTimeout(() => {
          CodeMirror.commands.autocomplete(cm, null, {completeSingle: true})
        }, 400)
      }

      cm.on('cursorActivity', (cm, event) => {
        tryOepnAC()
      })

      cm.on('keyup', (cm, event) => {
        if (!cm.state.completionActive && /* Enables keyboard navigation in autocomplete list */
          event.keyCode !== 13 && event.keyCode !== 27) { /* Enter - do not open autocomplete list just after item has been selected in it */
          tryOepnAC()
        }
      })
    },
    replace (replaceMe) {
      var cm = this.cm
      var oldCursor = cm.getCursor()
      var A1 = oldCursor.line
      var A2 = oldCursor.ch

      var B1 = cm.findWordAt({line: A1, ch: A2}).anchor.ch
      var B2 = cm.findWordAt({line: A1, ch: A2}).head.ch

      cm.replaceRange(replaceMe, {line: A1, ch: B1}, {line: A1, ch: B2})
      cm.setCursor({line: A1, ch: B1})
    },
    handleWordSuggestion (cm, option) {
      /*
      [
        ['wordA', 'relatedWordB'],
        ['wordA', 'relatedWordB'],
        ['wordA', 'relatedWordB']
      ]
      */

      /* eslint-disable */

      return new Promise((resolve, reject) => {
        let run = () => {
          var suggs = this.suggestions
          console.log(suggs)
          var cursor = cm.getCursor(), line = cm.getLine(cursor.line)
          var start = cursor.ch, end = cursor.ch
          while (start && /\w/.test(line.charAt(start - 1))) --start
          while (end < line.length && /\w/.test(line.charAt(end))) ++end
          var word = line.slice(start, end).toLowerCase()
          let flatMe = (c, arr) => {
            arr.forEach((i) => {
              if (!c.includes(i)) {
                i = i.replace(/_/, ' ')
                c.push(i)
              }
            })
            c = uniq(c)
            return c
          }
          this.current = {
            ...this.current,
            cursor,
            word,
            rhymes: this.rhymes.filter(r => r.includes(word)).reduce(flatMe, []),
            synn: this.synn.filter(r => r.includes(word)).reduce(flatMe, [])
          }

          for (var i = 0; i < suggs.length; i++) {
            if (suggs[i].indexOf(word) !== -1) {
              // console.log(word)
              return resolve({
                list: this.current.synn.filter((e, i) => i < 15),
                from: CodeMirror.Pos(cursor.line, start),
                to: CodeMirror.Pos(cursor.line, end)
              })
            }
          }
          return resolve(null)
        }

        run()
        // setTimeout(run, 0)
      })
      /* eslint-enable */
    }
  },
  watch: {
    paragraph () {
      this.processInfo()
    }
  },
  beforeMount () {
    // this.typeList = this.computeTypeList()
    var self = this

    CodeMirror.defineMode('cmuRHYME', () => {
      var parserState = {
        curlyQuoteIsOpen: false,
        curlyQuoteName: 'Quote'
      }
      return {
        token (stream, state) {
          let title = ''
          let quote = ''
          let detectedType = null

          self.suggestions.forEach((et) => {
            if (detectedType === null) {
              detectedType = et.reduce((ans, item) => {
                if (stream.match(item)) {
                  ans = 'Rhyme'
                }
                return ans
              }, null)
            }
          })

          if (stream.match(/### .+/g)) {
            title += ' ParagraphTitle-3'
          } else if (stream.match(/## .+/g)) {
            title += ' ParagraphTitle-2'
          } else if (stream.match(/# .+/g)) {
            title += ' ParagraphTitle-1'
          }

          if (stream.string.match(/}/, false)) {
            quote = parserState.curlyQuoteName = 'Quote'
            // parserState.curlyQuoteIsOpen = false
          }
          if (stream.string.match(/\+}/, false)) {
            quote = parserState.curlyQuoteName = 'StarQuote'
            // parserState.curlyQuoteIsOpen = false
          }
          if (stream.string.match(/\+\+}/, false)) {
            quote = parserState.curlyQuoteName = 'DoubleStarQuote'
            // parserState.curlyQuoteIsOpen = false
          }

          if (stream.string.match(/-}/, false)) {
            quote = parserState.curlyQuoteName = 'HiddenQuote'
            // parserState.curlyQuoteIsOpen = false
          }
          if (stream.string.match(/--}/, false)) {
            quote = parserState.curlyQuoteName = 'DoubleHiddenQuote'
            // parserState.curlyQuoteIsOpen = false
          }

          if (stream.string.match(/\+-}/, false)) {
            quote = parserState.curlyQuoteName = 'ControversialQuote'
            // parserState.curlyQuoteIsOpen = false
          }
          if (stream.string.match(/-\+}/, false)) {
            quote = parserState.curlyQuoteName = 'ControversialQuote'
            // parserState.curlyQuoteIsOpen = false
          }

          if (stream.match(/{/, false)) {
            parserState.curlyQuoteIsOpen = true
          }

          if (stream.match(/}/, false)) {
            quote = parserState.curlyQuoteName
            parserState.curlyQuoteIsOpen = false
          }

          if (parserState.curlyQuoteIsOpen) {
            quote = parserState.curlyQuoteName
          } else {
            parserState.curlyQuoteName = 'Quote'
          }

          let output = (detectedType ? detectedType + ' ' : '') + title + quote
          if (detectedType === null) {
            stream.next()
          }

          return output
          // if (stream.match('const')) {
          //   return 'style-a'
          // } else if (stream.match('bbb')) {
          //   return 'style-b'
          // } else {
          //   stream.next()
          //   return null
          // }
        }
      }
    })
  }
}
</script>

<style scoped>
.loading-div{
  position: absolute;
  bottom: 0px;
  right: 0px;
  width: 50%;
  text-align: center;
  /* height: 30px; */
}
.loading-div h1{
  margin-top: 10px;
  font-size: 24px;
}
.go-home{
  padding: 0px 5px;
  background-color: white;
  position: absolute;
  bottom: 20px;
  right: 20px;
}
.ed-right {
  max-height: 100%;
  overflow: auto;
  /* border-left: grey solid 1px; */
  box-sizing: border-box;
  background: linear-gradient(-135deg, rgba(255, 105, 180, 0.5098039215686274), rgba(0, 255, 255, 0.5));
}
.rhymes-suggestions li{
  cursor: pointer;
  margin-bottom: 0px;
}
.rhymes-suggestions li:hover{
  text-decoration: underline;
}
</style>
