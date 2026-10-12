const barclays = require('../fixtures/barclays')
const revolut = require('../fixtures/revolut')
const monzo = require('../fixtures/monzo')

function createMockStatement(bank) {
  switch (bank) {
    case 'Barclays':
      return structuredClone(barclays)

    case 'Revolut':
      return structuredClone(revolut)

    case 'Monzo':
      return structuredClone(monzo)

    default:
      return null
  }
}

module.exports = {
  createMockStatement
}