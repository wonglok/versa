<template>
  <div class="full editor-lr">
    <div class="ed-left">
      <div class="ed-title">Verse Your Kindness</div>
      <div class="ed-words">

        <div class="cm-colormark">
          <div class="cm-pre" :class="{ 'is-typing': isTyping }">
            <span class="cm-paragraph-line" :key="li" v-for="(line, li) in paragraphHTMLs"><span v-if="line" class="cm-line" v-html="line"></span><span v-if="!line" class="cm-hidevisual">_</span></span>
          </div>
          <label class="cm-label">
            <textarea
              :class="{ 'is-typing': isTyping }"
              spellcheck="false"
              wrap="off"
              class="cm-textarea"
              v-model="paragraph"
              ref='tata'
              @keydown.tab.prevent="onTab"
            >
            </textarea>
          </label>

          <div v-if="sel && sel.alternatives && sel.alternatives.length > 0 && caret.view" class="caret-info" :style="getCaretStyle()">
            <ul style="margin: 15px;">
              <li class="alt-items" :key="sa" v-for="(sa) in sel.alternatives" v-if="sa !== sel.text" @click="onDropdownChange({ alternative: sa })">{{ sa }}{{ mojis[sa] }}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
    <div class="ed-right">
      <Tree
        :world="output.world"
        :child="output.world"
      >
      </Tree>
    </div>
  </div>
</template>

<script>
import nlp from 'compromise'
import Tree from '@/components/parts/Tree/Tree.vue'
import { sampleText, letsUnderstand, lexicon, mojis } from '@/components/parts/Data/NLPService.js'
var getCaretCoordinates = require('textarea-caret')
export default {
  components: {
    Tree
  },
  data () {
    return {
      mojis,
      isTyping: false,
      paragraphHTMLs: [],
      sel: {
        text: '',
        start: 0,
        end: 0,
        alternatives: []
      },
      caret: {
        view: true,
        top: 0,
        left: 0,
        height: 0
      },
      output: false,
      paragraph: sampleText
    }
  },
  mounted () {
    this.selection()
    this.runUpdate()
  },
  methods: {
    setSelection () {
      this.$refs['tata'].select()
      this.$refs['tata'].setSelectionRange(this.sel.start, this.sel.end)
    },
    tryDetectWord () {
      var textbox = this.$refs['tata']
      var end = textbox.selectionEnd
      var result = /\S+$/.exec(textbox.value.slice(0, end))
      var lastWord = result ? result[0] : null
      // console.log(lastWord)

      return lastWord
      // this.sel.text = lastWord
    },
    tryGetCaret () {
      let el = this.$refs['tata']
      var caret = getCaretCoordinates(el, el.selectionEnd)
      // console.log('(top, left, height) = (%s, %s, %s)', caret.top, caret.left, caret.height)
      caret.view = true

      return caret
    },
    getCaretStyle () {
      return {
        top: this.caret.top + this.caret.height + 'px',
        left: this.caret.left + 'px'
      }
    },
    tryDetectWordBySpace () {
      var textbox = this.$refs['tata']
      var text = textbox.value
      var textInfos = nlp(text).match('#WordPower').out('offsets')
      var end = textbox.selectionEnd

      let result = textInfos.reduce((c, w) => {
        if (end >= w.wordStart && end <= (w.wordEnd)) {
          c = w
        }
        return c
      }, {})

      return {
        start: result.wordStart,
        end: result.wordEnd,
        word: result.normal
      }
      // this.sel.text = lastWord
    },
    getSelectionText (dom) {
      var text = ''
      var activeEl = dom || document.activeElement
      var activeElTagName = activeEl ? activeEl.tagName.toLowerCase() : null
      if (
        activeElTagName === 'textarea' ||
        (activeElTagName === 'input' &&
          /^(?:text|search|password|tel|url)$/i.test(activeEl.type) &&
          typeof activeEl.selectionStart === 'number')
      ) {
        text = activeEl.value.slice(
          activeEl.selectionStart,
          activeEl.selectionEnd
        )
      } else if (window.getSelection) {
        text = window.getSelection().toString()
      }
      return text
    },
    onDropdownChange ({ alternative }) {
      let val = alternative
      // let val = evt.target.value
      let ta = this.$refs['tata']

      let origstr = ta.value

      origstr = origstr.substring(0, this.sel.start) + val + origstr.substring(this.sel.end, origstr.length)

      this.paragraph = origstr
      this.caret.view = false
    },
    selection () {
      let el = this.$refs['tata']
      let handler = () => {
        this.caret = this.tryGetCaret()
        clearTimeout(this.onSelChangeTimer)
        this.onSelChangeTimer = setTimeout(() => {
          let word = this.tryDetectWordBySpace()
          this.updateSelInfo({ foundWord: word.word, start: word.start, end: word.end })
        }, 100)
      }
      el.addEventListener('mouseup', handler, false)
      el.addEventListener('keyup', handler, false)
      el.addEventListener('selectionchange', handler, false)
    },
    updateSelInfo ({ foundWord, start, end }) {
      this.sel.start = start || this.$refs['tata'].selectionStart
      this.sel.end = end || this.$refs['tata'].selectionEnd
      this.sel.text = foundWord || this.getSelectionText(this.$refs['tata'])
      this.sel.alternatives = []
      this.sel.tags = []
      let tags = nlp(this.sel.text).out('tags')
      if (tags && tags.length > 0) {
        this.sel.tags = tags[0].tags
        let firstTag = this.sel.tags[0]
        if (firstTag) {
          this.sel.alternatives = Object.keys(lexicon).reduce((bucket, keyname) => {
            if (lexicon[keyname].includes(firstTag)) {
              bucket.push(keyname)
            }
            return bucket
          }, [])
        }
      }
    },
    onTab (evt) {
      var keyCode = evt.keyCode || evt.which
      var el = evt.target
      var start = el.selectionStart
      var end = el.selectionEnd

      if (keyCode === 9) {
        evt.preventDefault()
        // set textarea value to: text before caret + tab + text after caret
        el.value = this.paragraph = el.value.substring(0, start) + '  ' + el.value.substring(end)

        // put caret at right position again
        el.selectionStart = el.selectionEnd = start + 2
      }
    },
    getKids (id) {
      return this.world.filter(ww => ww.parentIDs.includes(id))
    },
    // getChild (id) {
    //   return this.output.world.filter(ww => ww.parentID === id)
    // },
    runUpdate () {
      window.requestIdleCallback = window.requestIdleCallback || requestAnimationFrame
      window.requestIdleCallback(() => {
        this.paragraphHTMLs = this.paragraph.split('\n').map(line => {
          if (!line) {
            return false
          }
          let html = nlp(line).out('html')
          html = html
            .split('>')
            .map(e => e.trim())
            .join('>')
          html = html
            .split('<')
            .map(e => e.trim())
            .join('<')
          return html
        })
      })

      clearTimeout(this.timerRunUpdate)
      this.timerRunUpdate = setTimeout(() => {
        this.output = letsUnderstand({ paragraph: this.paragraph, world: [] })
      }, 500)
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
