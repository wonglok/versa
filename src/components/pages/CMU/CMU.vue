<template>
<div class="full">
  <codemirror class="full" @ready="onCmReady" v-model="paragraph" :options="cmOptions"></codemirror>
  <div class="loading-div">
    <h1>downloading...</h1>
  </div>
</div>
</template>

<script>
import { codemirror } from 'vue-codemirror'
import CodeMirror from 'codemirror'
import 'codemirror/keymap/sublime.js'
import 'codemirror/addon/hint/show-hint.js'
import RhymeWorker from './cmu-dict/rhyme.worker.js'

export default {
  components: {
    codemirror
  },
  data () {
    let appdata = {
      rhymes: [],
      suggestions: [],
      disableRefresh: false,
      paragraph: null,
      cm: false,
      cmOptions: {
        extraKeys: {'Ctrl-Space': 'autocomplete'},
        // codemirror options
        keyMap: 'sublime',
        tabSize: 2,
        mode: 'stratus',
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
    appdata.worker = new RhymeWorker()
    var handler = (evt) => {
      if (evt.data.type === 'done-suggestions') {
        appdata.rhymes = evt.data.suggestions
        appdata.suggestions = [...appdata.rhymes]
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
      clearTimeout(this.clearPITimeout)
      this.clearPITimeout = setTimeout(() => {
        this.worker.postMessage({ type: 'process', paragraph: this.paragraph })
      }, 150)
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
          var comp = this.suggestions
          console.log(comp)
          var cursor = cm.getCursor(), line = cm.getLine(cursor.line)
          var start = cursor.ch, end = cursor.ch
          while (start && /\w/.test(line.charAt(start - 1))) --start
          while (end < line.length && /\w/.test(line.charAt(end))) ++end
          var word = line.slice(start, end).toLowerCase()
          for (var i = 0; i < comp.length; i++) {
            if (comp[i].indexOf(word) !== -1) {
              // console.log(word)
              return resolve({
                list: comp[i].filter((i, e) => e < 20),
                from: CodeMirror.Pos(cursor.line, start),
                to: CodeMirror.Pos(cursor.line, end)
              })
            }
          }
          return resolve(null)
        }

        setTimeout(run, 0)
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

    CodeMirror.defineMode('stratus', () => {
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
  left: 0px;
  width: 100%;
  text-align: center;
  /* height: 30px; */
}
</style>
