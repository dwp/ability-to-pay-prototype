const { initialiseSession } = require('../../app/routes/session')

describe('initialiseSession', () => {
  test('creates default ATP session state', () => {
    const req = {
      session: {
        data: {}
      }
    }

    initialiseSession(req)

    expect(req.session.data.user).toEqual({
      id: 'ECM12345'
    })

    expect(req.session.data.case).toEqual({
      statements: []
    })

    expect(req.session.data.audit).toEqual([])
  })

  test('does not overwrite existing user', () => {
    const req = {
      session: {
        data: {
          user: {
            id: 'ASIER001'
          }
        }
      }
    }

    initialiseSession(req)

    expect(req.session.data.user.id).toBe('ASIER001')
  })

  test('does not overwrite existing statements', () => {
    const req = {
      session: {
        data: {
          case: {
            statements: [
              {
                id: 'stmt-001'
              }
            ]
          }
        }
      }
    }

    initialiseSession(req)

    expect(req.session.data.case.statements).toHaveLength(1)
  })

  test('does not overwrite existing audit history', () => {
    const req = {
      session: {
        data: {
          audit: [
            {
              action: 'change'
            }
          ]
        }
      }
    }

    initialiseSession(req)

    expect(req.session.data.audit).toHaveLength(1)
  })
})