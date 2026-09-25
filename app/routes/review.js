module.exports = function (router) {

  router.get('/review', (req, res) => {
    const statements = req.session.data.case.statements

    const statement = statements[statements.length - 1]

    const transactions = statement?.transactions || []

    res.render('review/index', {
      transactions
    })
  })

  router.get('/review/change/:transactionId', (req, res) => {
    const statements = req.session.data.case.statements

    const statement = statements[statements.length - 1]

    const transaction = statement.transactions.find(
      transaction => transaction.id === req.params.transactionId
    )

    res.render('review/change', {
      transaction
    })
  })

  router.post('/review/change/:transactionId', (req, res) => {
    const statements = req.session.data.case.statements

    const statement = statements[statements.length - 1]

    const transaction = statement.transactions.find(
      transaction => transaction.id === req.params.transactionId
    )

    if (transaction) {
      transaction.amount = req.body.amount
    }

    res.redirect('/review')
  })

}