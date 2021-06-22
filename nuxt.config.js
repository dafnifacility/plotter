// only add `router.base = '/<repository-name>/'` if `DEPLOY_ENV` is `GH_PAGES`
const routerBase =
  process.env.DEPLOY_ENV === 'GH_PAGES'
    ? {
        router: {
          base: '/plotter/',
        },
      }
    : {}

export default {
  /*
   ** Nuxt rendering mode
   ** See https://nuxtjs.org/api/configuration-mode
   */
  mode: 'spa',
  ssr: false,
  /*
   ** Nuxt target
   ** See https://nuxtjs.org/api/configuration-target
   */
  target: 'static',

  env: {
    keycloakUrl: process.env.KEYCLOAK_ENDPOINT_TEST,
    keycloakRealm: process.env.KEYCLOAK_REALM,
    keycloakClient: process.env.KEYCLOAK_CLIENT,
    INSTANCE_ID:
      process.env.INSTANCE_ID || 'b57525e7-0a5a-43da-b489-741c18c9f6d8',
  },

  /*
   ** Headers of the page
   ** See https://nuxtjs.org/api/configuration-head
   */
  head: {
    titleTemplate: '%s - DAFNI Plotter',
    title: 'DAFNI Plotter',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      {
        hid: 'description',
        name: 'description',
        content: process.env.npm_package_description || '',
      },
    ],
    link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.png' }],
  },
  /*
   ** Global CSS
   */
  css: ['~/assets/style/scss/main.scss'],
  /*
   ** Plugins to load before mounting the App
   ** https://nuxtjs.org/guide/plugins
   */
  plugins: [
    '~/api/backends/index.js',
    '~/plugins/axios.js',
    { src: '~/plugins/keycloak.js', mode: 'client' },
  ],
  /*
   ** Auto import components
   ** See https://nuxtjs.org/api/configuration-components
   */
  components: true,
  /*
   ** Nuxt.js dev-modules
   */
  buildModules: [
    // Doc: https://github.com/nuxt-community/eslint-module
    '@nuxtjs/eslint-module',
    '@nuxtjs/vuetify',
  ],
  /*
   ** Nuxt.js modules
   */
  modules: [
    // Doc: https://axios.nuxtjs.org/usage
    '@nuxtjs/axios',
  ],
  /*
   ** Axios module configuration
   ** See https://axios.nuxtjs.org/options
   */
  axios: {},
  /*
   ** vuetify module configuration
   ** https://github.com/nuxt-community/vuetify-module
   */
  vuetify: {
    customVariables: [
      '~/assets/style/scss/variables/_colours.scss',
      '~/assets/style/scss/variables/_radius.scss',
    ],
    optionsPath: '~/plugins/vuetify.js',
    // TODO: need to turn off tree shaking since draggable wraps v-expansion-panels
    // see https://github.com/nuxt-community/vuetify-module/issues/128
    treeShake: false,
  },
  /*
   ** Build configuration
   ** See https://nuxtjs.org/api/configuration-build/
   */
  build: {
    extractCSS: process.env.NODE_ENV === 'development',
    publicPath: process.env.NODE_ENV === 'development' ? '/_nuxt' : './_nuxt/',
    extend(config) {
      // Run ESLint on save
      config.module.rules.push({
        enforce: 'pre',
        test: /\.(js|vue)$/,
        loader: 'eslint-loader',
        exclude: /(node_modules)/,
      })
    },
  },

  ...routerBase,
}
