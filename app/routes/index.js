const express = require('express')

const router = express.Router()

const { initialiseSession } = require('./session')

router.use((req, res, next) => {
  initialiseSession(req)
  next()
})

module.exports = router