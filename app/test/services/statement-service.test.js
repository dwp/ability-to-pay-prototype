const {
  createMockStatement
} = require('../../app/data/services/statement-service')

describe('createMockStatement', () => {
  test('returns HSBC fixture', () => {
    const statement = createMockStatement('HSBC')

    expect(statement.bank).toBe('HSBC')
  })
})