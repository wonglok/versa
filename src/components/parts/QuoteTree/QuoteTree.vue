<template>
  <div ref="force-3d" class="full force-3d">
  </div>
</template>

<script>
import ForceGraph3D from '3d-force-graph'
import SpriteText from 'three-spritetext'
import * as StratusXL from '@/mcgill-db/stratusXL.js'
// import { emojify } from '@/components/parts/Data/NLPService.js'

export default {
  props: {
    paragraph: {}
  },
  mounted () {
    const initData = this.toGraphData()

    const elem = this.$refs['force-3d']
    const rect = elem.getBoundingClientRect()

    this.Graph = ForceGraph3D()(elem)
      .enableNodeDrag(false)
      .onNodeHover((node) => {
        elem.style.cursor = node ? 'pointer' : null
      })
      .onNodeClick(this.onClick)
      .graphData(initData)
      .nodeThreeObject((node) => {
        const sprite = new SpriteText(node.name)
        sprite.color = '#000000'
        sprite.textHeight = 5
        sprite.fontSize = 90
        sprite.fontFace = `'Inconsolata', 'Avenir', Helvetica, Arial, sans-serif`

        // correct emoji print
        const canvas = sprite._canvas
        const ctx = canvas.getContext('2d')

        const font = `normal ${sprite.fontSize * 0.9}px ${sprite.fontFace}`

        ctx.font = font
        const textWidth = ctx.measureText(sprite.text).width
        canvas.width = textWidth
        canvas.height = sprite.fontSize

        ctx.font = font
        ctx.fillStyle = sprite.color
        ctx.textBaseline = 'bottom'
        ctx.fillText(sprite.text, 0, canvas.height)

        // Inject canvas into sprite
        sprite._texture.image = canvas
        sprite._texture.needsUpdate = true

        sprite.scale.set(sprite.textHeight * canvas.width / canvas.height, sprite.textHeight)
        sprite.material.transparent = true
        return sprite
      })
      .linkOpacity(0.5)
      .linkWidth(0.3)
      .linkResolution(24)

    let renderer = this.Graph.renderer()
    renderer.setPixelRatio(window.devicePixelRatio || 1.0)
    this.Graph.backgroundColor('#ffffff')
    this.Graph.width(rect.width)
    this.Graph.height(rect.height)
  },
  watch: {
    paragraph () {
      this.Graph.graphData(this.toGraphData())
    }
  },
  methods: {
    toGraphData () {
      let nodes = [
        { id: 'quotes', name: 'quotes' },
        { id: 'quotes-hidden-only', name: 'quotes-hidden-only' },
        { id: 'quotes-double-star', name: 'quotes-double-star' },
        { id: 'quotes-any-star', name: 'quotes-any-star' },
        { id: 'quotes-all-but-hidden', name: 'quotes-all-but-hidden' },
        { id: 'quotes-controlversial', name: 'quotes-controlversial' }
      ]
      // { id: 0 }
      let links = [
        { target: 'quotes', source: 'quotes-hidden-only', color: '#4199a9' },
        { target: 'quotes', source: 'quotes-double-star', color: '#4199a9' },
        { target: 'quotes', source: 'quotes-any-star', color: '#4199a9' },
        { target: 'quotes', source: 'quotes-all-but-hidden', color: '#4199a9' },
        { target: 'quotes', source: 'quotes-controlversial', color: '#4199a9' }
      ]

      // this.paragraph = {}
      // let quotes = (this.paragraph || '').split('\n').map((s) => {
      //   return {
      //     line: s
      //   }
      // })

      // let paragraph = (this.paragraph || '')
      // let quotes = /{(.*?){(.*?)}(.*?)}/gim.exec(paragraph) || []
      // console.log(quotes)

      // let result = quotes.reduce((carry, item, i) => {
      //   // let emojis = item.data && item.data.be && emojify(item.data.be)
      //   // if (!emojis) {
      //   //   emojis = ''
      //   // }

      //   // console.log(i)

      //   let regex = /{(.*?){(.*?)}(.*?)}/gim
      //   let match = regex.exec(item.line)
      //   if (match) {
      //     console.log(match)

      //     if (match[1] === 'x') { match[1] = '' }
      //     var quote = match[1] + match[2] + match[3]

      //     carry.nodes.push({
      //       id: i,
      //       name: item.line
      //     })

      //     if (/-$/.test(quote)) {
      //       carry.links.push({
      //         source: i,
      //         color: '#4199a9',
      //         target: 'hidden-only'
      //       })
      //       // return carry
      //     }

      //     if (/\+\+$/.test(quote)) {
      //       carry.links.push({
      //         source: i,
      //         color: '#4199a9',
      //         target: 'double-star'
      //       })
      //       // return carry
      //     }

      //     if (/\+$/.test(quote)) {
      //       carry.links.push({
      //         source: i,
      //         color: '#4199a9',
      //         target: 'any-star'
      //       })
      //       // return carry
      //     }

      //     if (/\+$/.test(quote) === false) {
      //       carry.links.push({
      //         source: i,
      //         color: '#4199a9',
      //         target: 'all-but-hidden'
      //       })
      //       // return carry
      //     }
      //   }

      //   // //
      //   // item.data && item.data.parentIDs && item.data.parentIDs.forEach((wItem) => {
      //   //   // console.log(item.id, wItem)
      //   //   let source = this.world.findIndex(w => w.id === wItem)
      //   //   let target = i

      //   //   // console.log(source, target)
      //   //   carry.links.push({
      //   //     source,
      //   //     color: '#4199a9',
      //   //     target
      //   //   })
      //   // })

      //   return carry
      // }, { nodes, links })

      let paragraph = this.paragraph || ''

      let info = StratusXL.scan({ text: paragraph })
      let iii = 0
      info.quotes.forEach((typeOfQuotes) => {
        typeOfQuotes.list.forEach((item) => {
          nodes.push({
            id: iii,
            name: item.quote
          })

          links.push({
            source: iii,
            target: 'quotes-' + typeOfQuotes.type,
            color: '#4199a9'
          })

          iii++
        })
      })

      console.log(info)

      let result = {
        nodes, links
      }

      return result
    },
    onClick (node) {
      // let Graph = this.Graph
      // let { nodes, links } = Graph.graphData()
      // links = links.filter(l => l.source !== node && l.target !== node) // Remove links attached to node
      // nodes.splice(node.id, 1) // Remove node
      // nodes.forEach((n, idx) => { n.id = idx }) // Reset node ids to array index
      // Graph.graphData({ nodes, links })
    },
    onInit () {

    }
  }
}
</script>

<style scoped>
.force-3d{
  width: 100%;
  max-width: 50vw;
  height: 100%;
}
</style>
