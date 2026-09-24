const express = require('express')

const router = express.Router()

const { initialiseSession } = require('./session')

router.use((req, res, next) => {
  initialiseSession(req)
  next()
})

router.use(require('./upload'))
router.use(require('./statements'))
router.use(require('./review'))

module.exports = router