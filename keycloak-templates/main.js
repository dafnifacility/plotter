/* global Keycloak */
/* exported keycloakConnect */

// eslint-disable-next-line
function keycloakConnect(settings) {
  /** Login or logout of Keycloak. Then redirect or set timer for cookie refresh */
  const keycloak = Keycloak({
    url: settings.keycloakUrl,
    realm: settings.keycloakRealm,
    clientId: settings.keycloakClientId,
  })
  const initOptions = {
    flow: 'implicit',
    checkLoginIframe: false,
    onLoad: 'login-required',
    // enableLogging: true,
  }
  const redirectUrl = getParameterByName('redirect')

  keycloak.init(initOptions).then(function (authenticated) {
    if (authenticated) {
      const logout = getParameterByName('logout')
      if (logout !== null) {
        clearCookie(settings)
        keycloak.logout({
          redirectUri: redirectUrlOK(redirectUrl, settings) ? redirectUrl : '',
        })
      } else {
        createCookie(keycloak.token, settings)
        redirect(redirectUrl, settings)
      }

      if (redirectUrl === null || redirectUrl === '') {
        setTimeout(function () {
          /* eslint-disable-next-line no-unused-vars -- used in login.html */
          keycloakConnect(settings)
        }, hoursToMilliseconds(settings.cookieExpirationHours))
      }
    }
  })
}

function hoursToMilliseconds(expirationHours) {
  /** Switch time in hours to Milliseconds */
  return Math.floor(expirationHours * 60 * 60 * 1000)
}
function createCookie(token, settings) {
  /** Create our cookie  with token */
  const d = new Date()
  d.setTime(d.getTime() + hoursToMilliseconds(settings.cookieExpirationHours))
  setCookie(getCookieString(token, d.toUTCString(), settings))
}
function clearCookie(settings) {
  /** Put cookie in past and clear. */
  const d = new Date(3796416 * 10 ** 5)
  setCookie(getCookieString('', d.toUTCString(), settings))
}
function getCookieString(token, expiration, settings) {
  /** Create string for cookie */
  let cookie = settings.cookieName + '=' + encodeURIComponent(token)
  cookie += '; expires=' + expiration
  cookie += '; domain=' + settings.cookieDomain
  if (settings.cookieName.startsWith('__Secure-')) {
    cookie += '; secure'
  }
  return cookie + '; path=/'
}
function setCookie(c) {
  /** set a cookie */
  document.cookie = c
}
function redirect(url, settings) {
  /** Change page */
  if (redirectUrlOK(url, settings)) {
    document.location = url
  }
}

function redirectUrlOK(url, settings) {
  /** Check is a redirect we want to allow */
  if (url === null || url === '') {
    return false
  }

  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return false
  }

  const urlCheck = document.createElement('a')
  urlCheck.href = url

  return urlCheck.hostname.endsWith(settings.redirectDomainCheck)
}

function getParameterByName(name, url) {
  /** Pull out parameter with "name" from url */
  if (url === undefined) {
    url = window.location.href
  }
  name = name.replace(/[[\]]/g, '\\$&')
  const regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)')
  const results = regex.exec(url)
  if (!results) return null
  if (!results[2]) return ''
  return decodeURIComponent(results[2].replace(/\+/g, ' '))
}

try {
  module.exports = {
    hoursToMilliseconds,
    getCookieString,
    redirectUrlOK,
    getParameterByName,
  }
} catch (e) {}
