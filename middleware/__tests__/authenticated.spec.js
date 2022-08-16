import authenticated from '../middleware/authenticated'
import { checkUserRoleOrRedirect } from '../../static/js/authenticated'

// mocking backends to suppress the console.warn in backendsPromise
jest.mock('../../api/backends')
jest.mock('../../static/js/authenticated')

describe('authenticated middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  function getArgs(authenticated) {
    return {
      redirect: 'redirect',
      route: 'route',
      store: {
        state: {
          auth: {
            authenticated,
          },
        },
      },
    }
  }
  it('doesnt call to checkUserRoleOrRedirect if authenticated is false', async () => {
    expect(checkUserRoleOrRedirect).toHaveBeenCalledTimes(0)
    await authenticated(getArgs(false))

    expect(checkUserRoleOrRedirect).toHaveBeenCalledTimes(0)
  })
  it('calls to checkUserRoleOrRedirect if authenticated is true', async () => {
    const args = getArgs(true)
    expect(checkUserRoleOrRedirect).toHaveBeenCalledTimes(0)
    await authenticated(args)

    expect(checkUserRoleOrRedirect).toHaveBeenCalledTimes(1)
    expect(checkUserRoleOrRedirect).toHaveBeenCalledWith(args)
  })
})
