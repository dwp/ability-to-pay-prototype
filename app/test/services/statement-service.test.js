const {
  createMockStatement
} = require('../../app/data/services/statement-service')

describe('createMockStatement', () => {
  test('returns Barclays fixture', () => {
    const statement = createMockStatement('Barclays')

    expect(statement.bank).toBe('Barclays')
  })
})