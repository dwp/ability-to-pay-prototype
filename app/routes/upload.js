const express = require('express')

const router = express.Router()

router.get('/upload', (req, res) => {
  res.render('upload/index')
})

router.post('/upload', (req, res) => {
  res.redirect('/bank')
})

module.exports = router