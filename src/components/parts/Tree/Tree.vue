<template>
  <ul class="array-wrapper tree">
    <li v-if="error" style="color: red">{{ error }}</li>
    <li class="item-wrapper" :key="w.id" v-for="w in child" v-if="isroot && !w.data.parentIDs || !isroot">
      <div>
        {{ w.id }} - <span v-if="w.data && w.data.be">be: {{ emojify(w.data.be) }}</span>
      </div>
      <Tree
        v-if="getKids(w.id).length > 0 && checkLoop(w.id)"
        :isroot="false"
        :child="getKids(w.id)"
        :world="world"
      ></Tree>
    </li>

  </ul>
</template>

<script>
import { mojis } from '@/components/parts/Data/NLPService.js'
var emoji = require('node-emoji')

export default {
  components: {
    Tree: () => import('../Tree/Tree.vue')
  },
  created () {
  },
  props: {
    isroot: { default: true },
    child: {},
    world: {}
  },
  data () {
    return {
      error: false
    }
  },
  computed: {},
  methods: {
    emojify (arr) {
      let result = arr.reduce((str, item) => {
        str += (mojis[item] || emoji.emojify(emoji.get(item), t => t) || item) + ' '
        return str
      }, '')
      return result
    },
    checkLoop (id) {
      let result = true

      let rfn = ({ world, child, stat }) => {
        child.forEach((w) => {
          let kids = this.getKids(w.id)
          if (kids.length > 0) {
            rfn({ world, child: kids, stat })
          }
        })
      }

      try {
        rfn({ world: this.world, child: this.child, stat: {} })
        this.error = false
      } catch (e) {
        console.log(e)
        result = false

        this.error = 'Logic Error: Loop relationship detected.'
      }

      return result
    },
    getKids (id) {
      let kids = this.world.filter(ww => ww.data.parentIDs && ww.data.parentIDs.includes(id))
      return kids
    }
    // getChild (id) {
    //   return this.world.filter(ww => ww.parentID === id)
    // }
  }
}
</script>

<style scoped>
.tree{
  background-color: white;
}
ul{
  list-style: none;
}
</style>
