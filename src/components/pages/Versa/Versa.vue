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
      <pre style="background-color: white; max-width: 50vw; overflow: auto; max-height: 400px">{{ { lexicon: lexicon, world: output.world } }}</pre>
      <router-link class="go-home" to="/">Home</router-link>
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
import { sampleText, letsUnderstand, getLexicon } from '@/components/parts/Data/NLPService.js'
// import nlp from 'compromise'

export default {
  components: {
    codemirror,
    Tree
  },
  data () {
    return {
      lexicon: getLexicon({ paragraph: sampleText }),
      typeList: [],
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
  },
  beforeMount () {
    this.typeList = this.getTypeList()
    let self = this
    CodeMirror.defineMode('versa', () => {
      return {
        token (stream, state) {
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

          if (detectedType) {
            return detectedType
          } else if (detectedType === null) {
            stream.next()
            return detectedType
          }
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
    this.runUpdate()
  },
  methods: {
    getTypeList () {
      return [
        { keywords: this.getList({ typeOfTag: 'PlaceHolder' }), name: 'PlaceHolder' },
        { keywords: this.getList({ typeOfTag: 'BeHere' }), name: 'BeHere' }
      ]
    },
    getList ({ typeOfTag }) {
      let bucket = []
      // if (typeOfTag === 'PlaceHolder') {
      //   nlp(this.paragraph).normalize().match('#CreativeForce+').match('#Noun+').out('array').reduce((reduce, item) => {
      //     if (!bucket.includes(item)) {
      //       bucket.push(item)
      //     }
      //     return bucket
      //   }, bucket)
      // }

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
      // cm.on('completion', () => {
      //   this.typeList = this.getTypeList()
      //   setTimeout(() => {
      //     cm.refresh()
      //   }, 10)
      // })
      this.acTimeout = 0
      let tryOepnAC = () => {
        clearTimeout(this.acTimeout)
        this.acTimeout = setTimeout(() => {
          CodeMirror.commands.autocomplete(cm, null, {completeSingle: true})
        }, 550)
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
      this.lexicon = getLexicon({ paragraph: this.paragraph })
      this.output = letsUnderstand({ paragraph: this.paragraph })
      this.typeList = this.getTypeList()
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
