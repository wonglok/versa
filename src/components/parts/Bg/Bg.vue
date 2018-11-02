<template>
  <div class="bg full pos-rel">
    <div class="group full">
      <div class="bar bar-a"></div>
      <div class="bar bar-b"></div>
      <div class="bar bar-a"></div>
      <div class="bar bar-b"></div>

      <div class="bar bar-a"></div>
      <div class="bar bar-b"></div>
      <div class="bar bar-a"></div>
      <div class="bar bar-b"></div>

      <div class="bar bar-a"></div>
      <div class="bar bar-b"></div>

      <div class="bar bar-a"></div>
      <div class="bar bar-b"></div>
      <div class="bar bar-a"></div>
      <div class="bar bar-b"></div>

      <div class="bar bar-a"></div>
      <div class="bar bar-b"></div>
      <div class="bar bar-a"></div>
      <div class="bar bar-b"></div>

      <div class="bar bar-a"></div>
      <div class="bar bar-b"></div>
    </div>
  </div>
</template>

<script>
export default {

}
</script>

<style scoped>
.bg{
  overflow: hidden;
}
.bar{
  width: 250%;
  height: calc(100% / 20);
}
.bar-a{
  /* Rectangle Copy 17: */
  background-image: linear-gradient(-51deg, #A9F5FF 12%, #FFD5F8 99%);
}
.bar-b{
  /* Rectangle Copy 16: */
  background-image: linear-gradient(-230deg, rgb(103, 237, 255) 1%, #FFFFFF 41%, #FFD5F8 88%);
}
.group{
  /* transform: rotate(50deg) scale(2.1); */
}

@keyframes loopBarA {
  0% {
    transform: translateX(-50%);
  }
  50% {
    transform: translateX(0%);
  }
  100%{
    transform: translateX(-50%);
  }
}

@keyframes loopBarB {
  0% {
    transform: translateX(-50%);
  }
  50% {
    transform: translateX(0%);
  }
  100%{
    transform: translateX(-50%);
  }
}

.bar-a{
  /* animation: loopBarA 10s linear 0s infinite normal both; */
}

.bar-b{
  /* animation: loopBarB 10s linear 0s infinite normal both; */
}
</style>
