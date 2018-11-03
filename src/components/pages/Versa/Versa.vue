<template>
<div class="full">
  <div class="full editor-lr">
    <div class="ed-left">
      <codemirror class="full" @ready="onCmReady" v-model="paragraph" :options="cmOptions"></codemirror>
    </div>
    <div class="ed-right">
      <Tree
        :world="output.world"
        :child="output.world"
      >
      </Tree>
    </div>
  </div>

</div>
</template>

<script>
import { codemirror } from 'vue-codemirror'
import Tree from '@/components/parts/Tree/Tree.vue'

import CodeMirror from 'codemirror'
import 'codemirror/keymap/sublime.js'
import 'codemirror/addon/hint/show-hint.js'
import { lexicon, sampleText, letsUnderstand } from '@/components/parts/Data/NLPService.js'
// import nlp from 'compromise'

export default {
  components: {
    codemirror,
    Tree
  },
  data () {
    // let words = Object.keys(lexicon)
    let getList = ({ typeOfTag }) => {
      return Object.keys(lexicon).reduce((bucket, keyname) => {
        if (lexicon[keyname].includes(typeOfTag)) {
          bucket.push(keyname)
        }
        return bucket
      }, [])
    }

    let typeList = [
      { keywords: getList({ typeOfTag: 'PlaceHolder' }), name: 'PlaceHolder' },
      { keywords: getList({ typeOfTag: 'BeHere' }), name: 'BeHere' }
    ]
    CodeMirror.defineMode('versa', () => {
      return {
        token (stream, state) {
          let detectedType = null
          typeList.forEach((et) => {
            if (detectedType === null) {
              detectedType = et.keywords.reduce((ans, item) => {
                if (stream.match(item)) {
                  ans = et.name
                }
                return ans
              }, null)
            }
          })

          if (detectedType) {
            return detectedType
          } else if (detectedType === null) {
            stream.next()
            return detectedType
          }

          if (stream.match('const')) {
            return 'style-a'
          } else if (stream.match('bbb')) {
            return 'style-b'
          } else {
            stream.next()
            return null
          }
        }
      }
    })
    /* eslint-disable */

    /*
    [
      ['wordA', 'relatedWordB'],
      ['wordA', 'relatedWordB'],
      ['wordA', 'relatedWordB']
    ]
    */
    var comp = typeList.map(tl => tl.keywords)

    let wordSuggestion = (cm, option) => {
      return new Promise(function(resolve, reject) {
        setTimeout(function() {
          var cursor = cm.getCursor(), line = cm.getLine(cursor.line)
          var start = cursor.ch, end = cursor.ch
          while (start && /\w/.test(line.charAt(start - 1))) --start
          while (end < line.length && /\w/.test(line.charAt(end))) ++end
          var word = line.slice(start, end).toLowerCase()
          for (var i = 0; i < comp.length; i++) {
            if (comp[i].indexOf(word) !== -1) {
              console.log(word)
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
    }
    return {
      output: false,
      paragraph: sampleText,
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
          customKeys: {
            'Arrow-Up': '',
            'Arrow-Down': ''
          },
          alignWithWord: false,
          hint: wordSuggestion,
          closeOnUnfocus: false
        }
        // more codemirror options, 更多 codemirror 的高级配置...
      }
    }
  },
  mounted () {
    this.runUpdate()
  },
  methods: {
    onCmReady (cm) {
      console.log(cm)
      this.cm = cm
      cm.on('cursorActivity', (cm, event) => {
        CodeMirror.commands.autocomplete(cm, null, {completeSingle: true})
      })
      cm.on('keyup', (cm, event) => {
        if (!cm.state.completionActive && /* Enables keyboard navigation in autocomplete list */
          event.keyCode !== 13) { /* Enter - do not open autocomplete list just after item has been selected in it */
          CodeMirror.commands.autocomplete(cm, null, {completeSingle: true})
        }
      })
    },
    runUpdate () {
      this.output = letsUnderstand({ paragraph: this.paragraph, world: [] })
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

</style>
