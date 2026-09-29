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

    const amount = req.body.amount?.trim()

    const errors = []

    if (!amount) {
      errors.push({
        text: 'Enter an amount',
        href: '#amount'
      })
    }

    if (errors.length) {
      return res.render('review/change', {
        transaction,
        errors,
        enteredAmount: amount
      })
    }

    req.session.data.pendingChange = {
      transactionId: transaction.id,
      oldAmount: transaction.amount,
      newAmount: amount
    }

    res.redirect(`/review/confirm-change`)
  })

  router.get('/review/confirm-change', (req, res) => {
    if (!req.session.data.pendingChange) {
      return res.redirect('/review')
    }

    res.render('review/confirm-change', {
      pendingChange: req.session.data.pendingChange
    })
  })ß

  router.post('/review/confirm-change', (req, res) => {

    console.log('POST /review/confirm-change reached')

    if (!req.session.data.pendingChange) {
      return res.redirect('/review')
    }

    const reason = req.body.reason?.trim()

    if (!reason) {
      return res.render('review/confirm-change', {
        pendingChange: req.session.data.pendingChange,
        enteredReason: '',
        errors: [
          {
            text: 'Enter a reason for the change',
            href: '#reason'
          }
        ]
      })
    }

    const statements = req.session.data.case.statements

    const statement = statements[statements.length - 1]

    const transaction = statement.transactions.find(
      transaction =>
        transaction.id === req.session.data.pendingChange.transactionId
    )

    transaction.amount =
      req.session.data.pendingChange.newAmount

    transaction.changeReason = reason

    req.session.data.audit.push({
      timestamp: new Date().toISOString(),
      userId: req.session.data.user.id,
      action: 'change',
      transactionId: transaction.id,
      oldAmount: req.session.data.pendingChange.oldAmount,
      newAmount: req.session.data.pendingChange.newAmount,
      reason
    })

    delete req.session.data.pendingChange

    res.redirect('/review')
  })

  router.get('/review/audit-history', (req, res) => {
    const auditRecords = req.session.data.audit || []

    res.render('review/audit-history', {
      auditRecords
    })
  })

}