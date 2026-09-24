const hsbc = require('../fixtures/hsbc')

function createMockStatement(bank) {
  switch (bank) {
    case 'HSBC':
      return structuredClone(hsbc)

    default:
      return null
  }
}

module.exports = {
  createMockStatement
}