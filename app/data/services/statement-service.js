const hsbc = require('../fixtures/hsbc')
const monzo = require('../fixtures/monzo')

function createMockStatement(bank) {
  switch (bank) {
    case 'HSBC':
      return structuredClone(hsbc)

    case 'Monzo':
      return structuredClone(monzo)

    default:
      return null
  }
}

module.exports = {
  createMockStatement
}