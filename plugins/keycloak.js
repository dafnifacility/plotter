/**
 * Keycloak Plugin
 * (Based on https://github.com/dsb-norge/vue-keycloak-js)
 */
import axios from 'axios'
import { setRequestInterceptor } from './axios'
import Vue from 'vue'
import VueKeyCloak from '@dsb-norge/vue-keycloak-js'

/**
 * Connect and login to Keycloak.
 * @param context The Vue context
 */
export default context => {
  const keycloakConfig = getKeycloakSettings(context)
  Vue.use(VueKeyCloak, {
    config: keycloakConfig,
    init: {
      onLoad: '',
      checkLoginIframe: false,
      enableLogging: process.env.NODE_ENV === 'development',
    },
    logout: {
      redirectUri: window.location.origin,
    },
    onReady: kc => {
      context.store.commit('auth/keycloakReady', true)
      if (kc.authenticated) {
        tokenInterceptor()
        dafniWideLogin()
        context.store.commit('auth/authenticated', true)
        return
      }
      kc.login()
    },
    onInitError: error => {
      context.store.commit('auth/keycloakError', error)
    },
  })
}

/**
 * Call the login for the "dafni" audience login to create cookie.
 */
function dafniWideLogin() {
  const iframe = document.createElement('iframe')
  iframe.style =
    'position:absolute;visibility:hidden;display:none;width:0;height:0; padding:0; border:0;'
  iframe.src = '/keycloak/login.html'
  document.body.append(iframe)
}

/**
 * Make axios use the currently active JWT in all its calls.
 */
function tokenInterceptor() {
  setRequestInterceptor(config => {
    if (config.url.includes('geonames')) {
      return config
    }
    if (config.url.includes('minio') || config.url.includes('nims-io')) {
      config.withCredentials = true
      return config
    }
    const token = Vue.prototype.$keycloak ? Vue.prototype.$keycloak.token : ''
    if (token) {
      config.headers.Authorization = `Bearer ${Vue.prototype.$keycloak.token}`
    }
    return config
  })
}

/**
 * Get keycloak settings.
 * First look for settings at /backends/keycloak.json
 * If not found, check if we have any environment variables set.
 * If not, use default (localhost) settings.
 * @param context
 * @returns {Promise<{clientId: string, realm: string, url: string}>}
 */
async function getKeycloakSettings(context) {
  let keycloakConfig = {
    url:
      context.env.keycloakUrl ||
      'https://keycloak.staging.dafni.rl.ac.uk/auth/',
    realm: context.env.keycloakRealm || 'testrealm',
    clientId: context.env.keycloakClient || 'testclient',
  }

  try {
    const response = await axios.get('/backends/keycloak.json')
    if (response.status === 200) {
      keycloakConfig = response.data
    }
  } catch (error) {
    console.warn("Can't access backend configuration, using local settings")
  }

  return keycloakConfig
}

/**
 * Get the currently logged in user details
 * @param fill Add the details to this object rather than returning or null to create one
 * @returns {null|*|{}} If logged in returns details otherwise null
 */
export function getUserDetails(fill) {
  const keycloak = Vue.prototype.$keycloak

  if (keycloak && keycloak.authenticated) {
    const userDetails = fill || {}
    userDetails.id = keycloak.subject
    userDetails.userName = keycloak.userName
    userDetails.email = keycloak.tokenParsed.email
    userDetails.firstName = keycloak.tokenParsed.given_name
    userDetails.lastName = keycloak.tokenParsed.family_name

    return userDetails
  }

  return null
}
