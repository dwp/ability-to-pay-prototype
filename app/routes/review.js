const express = require('express')

const router = express.Router()

router.get('/review', (req, res) => {
  const statements = req.session.data.case.statements

  const statement = statements[statements.length - 1]

  const rows = statement.transactions.map(transaction => [
    { text: transaction.date },
    { text: transaction.description },
    { text: transaction.amount },
    {
      html: '#Change</a>'
    }
  ])

  res.render('review/index', {
    rows
  })
})

module.exports = router