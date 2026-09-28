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
    if (!transaction) {
      return res.redirect('/review')
    }

    const amount = req.body.amount?.trim()
    const reason = req.body.reason?.trim()

    const errors = []

    if (!amount) {
      errors.push({
        text: 'Enter an amount',
        href: '#amount'
      })
    }

    if (!reason) {
      errors.push({
        text: 'Enter a reason for the change',
        href: '#reason'
      })
    }

    if (errors.length) {
      return res.render('review/change', {
        transaction,
        errors,
        enteredAmount: amount,
        enteredReason: reason
      })
    }

    const oldAmount = transaction.amount

    req.session.data.audit.push({
      timestamp: new Date().toISOString(),
      userId: req.session.data.user.id,
      action: 'change',
      transactionId: transaction.id,
      oldAmount,
      newAmount: amount,
      reason
    })

    transaction.amount = amount
    transaction.changeReason = reason

    res.redirect('/review')
  })

}