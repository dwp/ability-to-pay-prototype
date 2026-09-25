//
// For guidance on how to create routes see:
// https://prototype-kit.service.gov.uk/docs/create-routes
//

const govukPrototypeKit = require('govuk-prototype-kit')

const router = govukPrototypeKit.requests.setupRouter()

const { initialiseSession } = require('./routes/session')

router.use((req, res, next) => {
  initialiseSession(req)
  next()
})

require('./routes/upload')(router)
require('./routes/statements')(router)
require('./routes/review')(router)

module.exports = router

// Add your routes here
