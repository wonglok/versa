<template>
  <div ref="force-3d" class="full">

  </div>
</template>

<script>
import ForceGraph3D from '3d-force-graph'
import SpriteText from 'three-spritetext'
import { emojify } from '@/components/parts/Data/NLPService.js'

export default {
  props: {
    world: {}
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

    this.Graph.backgroundColor('#ffffff')
    this.Graph.width(rect.width)
    this.Graph.height(rect.height)
  },
  watch: {
    world () {
      this.Graph.graphData(this.toGraphData())
    }
  },
  methods: {
    toGraphData () {
      let nodes = [] // { id: 0 }
      let links = [] // this.world = {}
      console.log(this.world)

      let result = this.world.reduce((carry, item, i) => {
        let emojis = item.data && item.data.be && emojify(item.data.be)
        if (!emojis) {
          emojis = ''
        }

        // console.log(i)
        carry.nodes.push({
          id: i,
          name: item.id + '\n' + emojis
        })

        //
        item.data && item.data.parentIDs && item.data.parentIDs.forEach((wItem) => {
          // console.log(item.id, wItem)
          let source = this.world.findIndex(w => w.id === wItem)
          let target = i

          // console.log(source, target)
          carry.links.push({
            source,
            color: '#4199a9',
            target
          })
        })

        return carry
      }, { nodes, links })

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

<style>

</style>
