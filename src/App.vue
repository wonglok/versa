<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style>
html, body, #app, .full{
  width: 100%;
  height: 100%;
  margin: 0px;
  padding: 0px;
}
#app {
  font-family: 'Inconsolata', 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
.pos-rel{
  position: relative;
}
.pos-abs{
  position: absolute;
  top: 0px;
  left: 0px;
}
</style>
