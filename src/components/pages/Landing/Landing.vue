<template>
  <div class="center padme container">
    <div class="row">
      <div class="twelve columns">
        <h1 class="title">
          VERSA Experiment
        </h1>
        <h3 class="author">
          by Wong Lok
        </h3>

        <router-link tag="h2" to="/editor" class="enter">
          Enter
        </router-link>

        <div class="desc">
          <p>Our verse engine transforms your words into 3D visual programs.</p>
          <p>A technological instrument to spread kindness.</p>
          <p>Inspired by Bryant McGill :)</p>
        </div>

        <router-link to="/about" class="how-does-it-work">How does it work?</router-link>

      </div>
    </div>

  </div>
</template>

<script>
export default {

}
</script>

<style scoped>
.padme{
  padding: 1px;
}
.center{
  text-align: center;
}
.title{
  font-size: 70px;
  margin-top: 50px;
}
.author{
}
.enter{
  cursor: pointer;
  text-decoration: underline;
}
.desc{
}
.how-does-it-work{
  position: absolute;
  bottom: 20px;
  right: 20px;
}

/* Larger than mobile */
@media (min-width: 400px) {}

/* Larger than phablet (also point when grid becomes active) */
@media (min-width: 550px) {}

/* Larger than tablet */
@media (min-width: 750px) {}

/* Larger than desktop */
@media (min-width: 1000px) {}

/* Larger than Desktop HD */
@media (min-width: 1200px) {}

</style>
