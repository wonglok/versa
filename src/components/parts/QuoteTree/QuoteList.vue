<template>
  <div class="full">
    <h1>Quotes</h1>
    <ul :key="kqi" v-for="(kq, kqi) in kindsOfQuote">
      <li>{{ kq.type }}</li>
      <ul>
        <li :key="qi" v-for="(q, qi) in kq.list">{{ q.quote }}</li>
      </ul>
    </ul>
  </div>
</template>

<script>
import * as StratusXL from '@/mcgill-db/stratusXL.js'

export default {
  props: {
    paragraph: {
      default: ''
    }
  },
  data () {
    return {
      kindsOfQuote: []
    }
  },
  mounted () {
    this.processParagraph()
  },
  watch: {
    paragraph () {
      this.processParagraph()
    }
  },
  methods: {
    processParagraph () {
      let { quotes } = StratusXL.scan({ text: this.paragraph })
      this.kindsOfQuote = quotes
    }
  }
}
</script>

<style scoped>

</style>
