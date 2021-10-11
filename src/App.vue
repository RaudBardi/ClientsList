<template>
  <v-app>
    <v-app-bar
      app
    />
    <v-main>
      <router-view/>
    </v-main>
  </v-app>
</template>

<script>

export default {
  name: 'App'
}
</script>

<style lang="scss">
#app {
  font-family: Roboto, RobotoFallback, Noto Kufi Arabic, Helvetica, Arial, sans-serif;
  line-height: 1.2857;
  background: #f2f2f2;

  h2 {
    font-size: 30px !important;
    font-weight: 300 !important;
    margin-top: 20px !important;
    margin-bottom: 20px !important;
  }
}
</style>
