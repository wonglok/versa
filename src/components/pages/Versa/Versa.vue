<template>
<div class="full">
  <div class="full editor-lr">
    <div class="ed-left">
      <codemirror class="full" @ready="onCmReady" v-model="paragraph" :options="cmOptions"></codemirror>
    </div>
    <div class="ed-right">
      <Tree
        v-if="brain && brain.world && show === 'dom-tree'"
        :world="brain.world"
        :child="brain.world"
      >
      </Tree>

      <ForceGraph
        v-if="brain && brain.world && show === 'force-graph'"
        :world="brain.world"
      ></ForceGraph>

      <!-- <pre style="background-color: white; max-width: 50vw; overflow: auto; max-height: 400px">{{ brain }}</pre> -->
      <router-link class="go-home" to="/">Home</router-link>
    </div>
  </div>

</div>
</template>

<script>
import { codemirror } from 'vue-codemirror'
import Tree from '@/components/parts/Tree/Tree.vue'
import ForceGraph from '@/components/parts/ForceGraph/ForceGraph.vue'

import CodeMirror from 'codemirror'
import 'codemirror/keymap/sublime.js'
import 'codemirror/addon/hint/show-hint.js'
import { sampleText } from '@/components/parts/Data/NLPService.js'
/* eslint-disable */
import NLPWorker from '@/components/parts/Data/nlp.worker.js'
/* eslint-enable */

export default {
  components: {
    codemirror,
    Tree,
    ForceGraph
  },
  data () {
    let data = {
      show: 'force-graph', // force-graph, dom-tree
      worker: false,
      brain: false,
      lexicon: {},
      typeList: [],
      paragraph: null,
      cm: false,
      cmOptions: {
        extraKeys: {'Ctrl-Space': 'autocomplete'},
        // codemirror options
        keyMap: 'sublime',
        tabSize: 2,
        mode: 'versa',
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
          hint: this.wordSuggestion,
          closeOnUnfocus: true
        }
        // more codemirror options, 更多 codemirror 的高级配置...
      }
    }
    let prepWork = () => {
      let worker = data.worker = new NLPWorker()
      worker.addEventListener('message', (evt) => {
        if (evt.data.type === 'app-init') {
          data.paragraph = evt.data.paragraph
        }
        if (evt.data.type === 'process') {
          let { brain, lexicon } = evt.data.result
          data.brain = brain
          data.lexicon = lexicon
          data.typeList = this.computeTypeList()
          this.refreshing = true
          this.cm && CodeMirror.commands.undo(this.cm)
          this.cm && CodeMirror.commands.redo(this.cm)
          this.refreshing = false
        }
        if (evt.data.type === 'refresh') {
          if (data.worker) {
            data.worker.terminate()
          }
          clearTimeout(worker.timeout)
          worker.timeout = setTimeout(() => {
            prepWork()
          }, 150)
        }
      })
      worker.postMessage({ type: 'process', paragraph: data.paragraph || sampleText })
    }
    prepWork()
    if (data.worker) {
      data.worker.postMessage({ type: 'app-init', paragraph: sampleText })
    }
    // data.paragraph = sampleText

    // let { brain, lexicon } = readSentenceWords({ paragraph: sampleText })
    return data
  },
  beforeMount () {
    // this.typeList = this.computeTypeList()
    let self = this
    CodeMirror.defineMode('versa', () => {
      var parserState = {
        curlyQuoteIsOpen: false
      }
      return {
        token (stream, state) {
          let title = ''
          let quote = ''
          let detectedType = null

          self.typeList.forEach((et) => {
            if (detectedType === null) {
              detectedType = et.keywords.reduce((ans, item) => {
                if (stream.match(item)) {
                  ans = et.name
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

          if (stream.match(/{/, false)) {
            parserState.curlyQuoteIsOpen = true
          }
          if (stream.match(/}/, false)) {
            quote = 'Quote'
            parserState.curlyQuoteIsOpen = false
          }
          if (parserState.curlyQuoteIsOpen) {
            quote = 'Quote'
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
  },
  mounted () {
    // this.runUpdate()
  },
  methods: {
    computeTypeList () {
      return [
        { keywords: this.getList({ typeOfTag: 'ParagraphTitle' }), name: 'ParagraphTitle' },
        { keywords: this.getList({ typeOfTag: 'Existence' }), name: 'Existence' },
        { keywords: this.getList({ typeOfTag: 'Being' }), name: 'Being' }
      ]
    },
    getList ({ typeOfTag }) {
      let bucket = []

      return Object.keys(this.lexicon).reduce((bucket, keyname) => {
        if (this.lexicon[keyname].includes(typeOfTag) && !bucket.includes(keyname)) {
          bucket.push(keyname)
        }
        return bucket
      }, bucket)
    },
    wordSuggestion (cm, option) {
      /*
      [
        ['wordA', 'relatedWordB'],
        ['wordA', 'relatedWordB'],
        ['wordA', 'relatedWordB']
      ]
      */
      /* eslint-disable */
      var comp = this.typeList.map(tl => tl.keywords)
      return new Promise(function(resolve, reject) {
        setTimeout(function() {
          var cursor = cm.getCursor(), line = cm.getLine(cursor.line)
          var start = cursor.ch, end = cursor.ch
          while (start && /\w/.test(line.charAt(start - 1))) --start
          while (end < line.length && /\w/.test(line.charAt(end))) ++end
          var word = line.slice(start, end).toLowerCase()
          for (var i = 0; i < comp.length; i++) {
            if (comp[i].indexOf(word) !== -1) {
              // console.log(word)
              return resolve({
                list: comp[i],
                from: CodeMirror.Pos(cursor.line, start),
                to: CodeMirror.Pos(cursor.line, end)
              })
            }
          }
          return resolve(null)
        }, 0)
      })
      /* eslint-enable */
    },
    onCmReady (cm) {
      // console.log(cm)
      this.cm = cm
      cm.toggleComment = () => {
      }
      // cm.on('completion', () => {
      //   this.typeList = this.computeTypeList()
      //   setTimeout(() => {
      //     cm.refresh()
      //   }, 10)
      // })

      this.acTimeout = 0
      let tryOepnAC = () => {
        clearTimeout(this.acTimeout)
        this.acTimeout = setTimeout(() => {
          CodeMirror.commands.autocomplete(cm, null, {completeSingle: true})
        }, 450)
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
    runUpdate () {
      if (this.refreshing) {
        return
      }
      if (this.worker) {
        this.worker.postMessage({ type: 'refresh', paragraph: this.paragraph })
      }
    }
  },
  watch: {
    paragraph () {
      this.$nextTick(() => {
        this.runUpdate()
      })
    }
  }
}
</script>

<style scoped>
.go-home{
  position: absolute;
  bottom: 20px;
  right: 20px;
}
</style>
