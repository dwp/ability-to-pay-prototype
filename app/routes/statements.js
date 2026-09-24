const express = require('express')

const router = express.Router()

const {
  createMockStatement
} = require('../data/services/statement-service')

router.get('/bank', (req, res) => {
  res.render('statements/bank')
})

router.post('/bank', (req, res) => {
  const { bank } = req.body

  req.session.data.selectedBank = bank

  res.redirect('/processing')
})

router.get('/processing', (req, res) => {
  const bank = req.session.data.selectedBank

  const statement = createMockStatement(bank)

  if (statement) {
    req.session.data.case.statements.push(statement)
  }

  res.redirect('/statements/success')
})

router.get('/statements/success', (req, res) => {
  const statements = req.session.data.case.statements

  const statement = statements[statements.length - 1]

  res.render('statements/success', {
    statement
  })
})

module.exports = router