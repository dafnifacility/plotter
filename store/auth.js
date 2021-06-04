export const state = () => ({
  uuid: '',
  /**
   * Authenticated against keycloak
   */
  authenticated: false,
  /**
   * Keycloak is ready to attempt login
   * (It needs to request it's configuration)
   */
  keycloakReady: false,
  /**
   * Keycloak has reported an error
   */
  keycloakError: '',
})

export const mutations = {
  uuid: (state, uuid) => {
    state.uuid = uuid
  },
  authenticated: (state, auth) => {
    state.authenticated = auth
  },
  keycloakReady: (state, ready) => {
    state.keycloakReady = ready
  },
  keycloakError: (state, error) => {
    state.keycloakError = error
  },
}

export const actions = {}
