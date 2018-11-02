<template>
  <div class="full pos-rel">
    <div class="bg-div pos-abs full">
      <!-- <Bg class="full" /> -->
    </div>
    <div class="content-div full pos-abs center-column">
      <Landing />
    </div>
  </div>
</template>

<script>
import Bg from './parts/Bg/Bg.vue'
import Landing from './pages/Landing/Landing.vue'
export default {
  components: {
    Bg,
    Landing
  },
  name: 'HelloWorld',
  data () {
    return {
      msg: 'Welcome to Your Vue.js App'
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.center-column{
  display: flex;
  justify-content: center;
}
</style>
