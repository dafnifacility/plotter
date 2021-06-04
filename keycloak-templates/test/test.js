/* global hoursToMilliseconds, getCookieString, redirectUrlOK, getParameterByName */
// import { hoursToMilliseconds, getCookieString, redirectUrlOK, getParameterByName } from '../main'

/* eslint-disable-next-line no-unused-vars -- used by functions being tested */
const settings = {
  keycloakUrl: 'http://myurl.example.com/auth/',
  keycloakRealm: 'realm',
  keycloakClientId: 'client',

  cookieName: 'mycookiename',
  cookieDomain: '.domain.example.com',
  cookieExpirationHours: 2,

  redirectDomainCheck: 'example.com',
}

/* eslint-disable-next-line no-unused-vars -- called by test.html */
function test(skipOutput) {
  testHoursToMilliseconds(hoursToMilliseconds)
  testCreateCookie(getCookieString)
  testRedirectUrlOK(redirectUrlOK)
  testGetParameterByName(getParameterByName)

  output()
}

function testJest() {
  const main = require('../main')
  console.log(main)

  describe('Login script', function () {
    beforeAll(function () {
      // test(true)
    })

    it('test hours to milliseconds', function () {
      testHoursToMilliseconds(main.hoursToMilliseconds)
    })

    it('test create cookie', function () {
      testCreateCookie(main.getCookieString)
    })

    it('test redirect url is ok', function () {
      testRedirectUrlOK(main.redirectUrlOK)
    })

    it('test get parameter by name', function () {
      testGetParameterByName(main.getParameterByName)
    })
  })
}

try {
  testJest()
} catch (e) {}

function testHoursToMilliseconds(hoursToMillisecondsFunc) {
  assertSame('testHoursToMilliseconds', 7200000, hoursToMillisecondsFunc(2))
}

function testCreateCookie(getCookieStringFunc) {
  const d = new Date(1820301651534)
  const token = 'a.fake.token'
  let correct = ''
  let c

  correct = 'mycookiename=' + token
  correct += '; expires=Tue, 07 Sep 2027 07:20:51 GMT'
  correct += '; domain=.domain.example.com'
  correct += '; path=/'

  c = getCookieStringFunc(token, d.toUTCString(), settings)
  assertSame('testCreateCookie', c, correct)

  correct = 'mycookiename='
  correct += '; expires=Tue, 07 Sep 2027 07:20:51 GMT'
  correct += '; domain=.domain.example.com'
  correct += '; path=/'

  c = getCookieStringFunc('', d.toUTCString(), settings)
  assertSame('testCreateCookieEmpty', c, correct)

  correct = '__Secure-mycookiename=' + token
  correct += '; expires=Tue, 07 Sep 2027 07:20:51 GMT'
  correct += '; domain=.domain.example.com'
  correct += '; secure'
  correct += '; path=/'

  settings.cookieName = '__Secure-mycookiename'
  c = getCookieStringFunc(token, d.toUTCString(), settings)
  assertSame('testCreateCookie', c, correct)
}

function testRedirectUrlOK(redirectUrlOKFunc) {
  assertSame('testRedirectUrlOK-Null', redirectUrlOKFunc(null, settings), false)
  assertSame('testRedirectUrlOK-Empty', redirectUrlOKFunc('', settings), false)
  assertSame(
    'testRedirectUrlOK-Subdomain',
    redirectUrlOKFunc('example.com.x.com', settings),
    false
  )

  assertSame(
    'testRedirectUrlOK-NoProtocol',
    redirectUrlOKFunc('example.com', settings),
    false
  )

  assertSame(
    'testRedirectUrlOK-Base',
    redirectUrlOKFunc('http://example.com', settings),
    true
  )
  assertSame(
    'testRedirectUrlOK-Sub',
    redirectUrlOKFunc('http://sub.example.com', settings),
    true
  )
  assertSame(
    'testRedirectUrlOK-SubAndFolder',
    redirectUrlOKFunc('https://sub.example.com/somewhere/there', settings),
    true
  )
}

function testGetParameterByName(getParameterByNameFunc) {
  const url =
    'http://example.com/test?one=111&two=hello&three=hello%20again&empty'

  assertSame(
    'testGetParameterByName-NotExist',
    getParameterByNameFunc('four', url),
    null
  )

  assertSame(
    'testGetParameterByName-Number',
    getParameterByNameFunc('one', url),
    '111'
  )
  assertSame(
    'testGetParameterByName-Text',
    getParameterByNameFunc('two', url),
    'hello'
  )
  assertSame(
    'testGetParameterByName-Space',
    getParameterByNameFunc('three', url),
    'hello again'
  )
  assertSame(
    'testGetParameterByName-Empty',
    getParameterByNameFunc('empty', url),
    ''
  )
}

const testsFailed = []
let testsRun = 0

function output() {
  let b = ''
  if (testsFailed.length) {
    b = '<h1>Failed</h1>'
    for (let i = 0, z = testsFailed.length; i < z; i++) {
      b += '<p>' + testsFailed[i].name + ' : ' + testsFailed[i].message
    }
    document.body.innerHTML = b
  } else {
    b = '<h1>OK</h1>'
  }

  b +=
    '<p><strong>' +
    testsRun +
    ' tests run. ' +
    testsFailed.length +
    ' failed tests.</strong></p>'

  document.body.innerHTML = b
}

function assertSame(name, a, b) {
  try {
    expect(a).toEqual(b)
  } catch (e) {
    if (a !== b) {
      testsFailed.push({
        name,
        message: 'Fail: "' + a + '" is not equal to "' + b + '"',
      })
    }
    testsRun++
  }
}
