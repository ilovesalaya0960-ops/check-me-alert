export default defineNuxtConfig({
  ssr: false,
  nitro: {
    preset: 'static'
  },
  generate: {
    dir: 'dist'
  }
})