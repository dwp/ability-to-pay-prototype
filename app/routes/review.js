const {
  updateReviewStatus
} = require('../data/services/review-service')

module.exports = function (router) {

  router.get('/review', (req, res) => {
    const statements = req.session.data.case.statements

    const statement = statements[statements.length - 1]

    const reviewItems = (statement?.reviewItems || []).map(item => ({
      ...item,
      displayNumber: Number(
        item.id.replace('issue-', '')
      )
    }))

    const hasAuditRecords =
      (req.session.data.audit || []).length > 0

    res.render('review/index', {
      statement,
      reviewItems,
      hasAuditRecords
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
  })

  router.post('/review/confirm-change', (req, res) => {

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

    const reviewItem = statement.reviewItems.find(
      item =>
        item.transactionIds.includes(transaction.id)
    )

    if (reviewItem) {
      reviewItem.status = 'validated'
    }

    updateReviewStatus(statement)

    delete req.session.data.pendingChange

    res.redirect('/review')
  })

  router.get('/review/audit-history', (req, res) => {
    const auditRecords = req.session.data.audit || []

    res.render('review/audit-history', {
      auditRecords
    })
  })

  router.get('/review/remove/:transactionId', (req, res) => {
    const statements = req.session.data.case.statements

    const statement = statements[statements.length - 1]

    const transaction = statement.transactions.find(
      transaction => transaction.id === req.params.transactionId
    )

    if (!transaction) {
      return res.redirect('/review')
    }

    res.render('review/remove', {
      transaction
    })
  })

  router.post('/review/remove/:transactionId', (req, res) => {
    const statements = req.session.data.case.statements

    const statement = statements[statements.length - 1]

    const transaction = statement.transactions.find(
      transaction => transaction.id === req.params.transactionId
    )

    if (!transaction) {
      return res.redirect('/review')
    }

    const reason = req.body.reason?.trim()

    if (!reason) {
      return res.render('review/remove', {
        transaction,
        enteredReason: '',
        errors: [
          {
            text: 'Enter a reason for removing the transaction',
            href: '#reason'
          }
        ]
      })
    }

    transaction.removed = true
    transaction.removalReason = reason

    req.session.data.audit.push({
      timestamp: new Date().toISOString(),
      userId: req.session.data.user.id,
      action: 'remove',
      transactionId: transaction.id,
      amount: transaction.amount,
      reason
    })

    const reviewItem = statement.reviewItems.find(
      item =>
        item.transactionIds.includes(transaction.id)
    )

    if (reviewItem) {
      reviewItem.status = 'validated'
    }

    updateReviewStatus(statement)

    res.redirect('/review')
  })

  router.get('/review/item/:reviewItemId', (req, res) => {
    const statements = req.session.data.case.statements

    const statement = statements[statements.length - 1]

    const reviewItem = statement.reviewItems.find(
      item => item.id === req.params.reviewItemId
    )

    if (!reviewItem) {
      return res.redirect('/review')
    }

    const transactions = statement.transactions.filter(
      transaction =>
        reviewItem.transactionIds.includes(transaction.id) &&
        !transaction.removed
    )

    const reviewNumber = Number(
      reviewItem.id.replace('issue-', '')
    )

    res.render('review/item', {
      reviewItem,
      reviewNumber,
      transactions
    })
  })

  router.get('/review/edit/:transactionId/:field', (req, res) => {
    const statements = req.session.data.case.statements

    const statement = statements[statements.length - 1]

    const transaction = statement.transactions.find(
      transaction => transaction.id === req.params.transactionId
    )

    if (!transaction) {
      return res.redirect('/review')
    }

    const allowedFields = [
      'debit',
      'credit',
      'balance'
    ]

    const field = req.params.field

    if (!allowedFields.includes(field)) {
      return res.redirect('/review')
    }

    res.render('review/edit-field', {
      transaction,
      field,
      value: transaction[field]
    })
  })

  router.post('/review/edit/:transactionId/:field', (req, res) => {
    const statements = req.session.data.case.statements

    const statement = statements[statements.length - 1]

    const transaction = statement.transactions.find(
      transaction => transaction.id === req.params.transactionId
    )

    if (!transaction) {
      return res.redirect('/review')
    }

    const allowedFields = [
      'debit',
      'credit',
      'balance'
    ]

    const field = req.params.field

    if (!allowedFields.includes(field)) {
      return res.redirect('/review')
    }

    const value = req.body.value?.trim()

    const errors = []

    if (!value) {
      errors.push({
        text: `Enter a ${field} amount`,
        href: '#value'
      })

      return res.render('review/edit-field', {
        transaction,
        field,
        value,
        errors
      })
    }

    if (!req.session.data.pendingTransactionChange) {
      req.session.data.pendingTransactionChange = {
        transactionId: transaction.id,

        originalValues: {
          debit: transaction.debit,
          credit: transaction.credit,
          balance: transaction.balance
        },

        updatedValues: {
          debit: transaction.debit,
          credit: transaction.credit,
          balance: transaction.balance
        }
      }
    }

    req.session.data.pendingTransactionChange.updatedValues[field] =
      value

    res.redirect('/review/edit')
  })

  router.get('/review/edit', (req, res) => {
    const statements = req.session.data.case.statements

    const statement = statements[statements.length - 1]

    const pendingTransactionChange =
      req.session.data.pendingTransactionChange

    if (!pendingTransactionChange) {
      return res.redirect('/review')
    }

    const transaction = statement.transactions.find(
      transaction =>
        transaction.id === pendingTransactionChange.transactionId
    )

    if (!transaction) {
      return res.redirect('/review')
    }

    res.render('review/change', {
      transaction,
      pendingTransactionChange
    })
  })

  router.post('/review/edit/:transactionId/review-changes', (req, res) => {
    const statements = req.session.data.case.statements

    const statement = statements[statements.length - 1]

    const transaction = statement.transactions.find(
      transaction => transaction.id === req.params.transactionId
    )

    if (!transaction) {
      return res.redirect('/review')
    }

    const reason = req.body.reason?.trim()

    if (!reason) {
      return res.render('review/change', {
        transaction,
        pendingTransactionChange:
          req.session.data.pendingTransactionChange,
        enteredReason: '',
        errors: [
          {
            text: 'Enter a reason for the change',
            href: '#reason'
          }
        ]
      })
    }

    req.session.data.pendingTransactionChange.reason =
      reason

    res.redirect('/review/review-changes')
  })

  router.get('/review/review-changes', (req, res) => {
    const statements = req.session.data.case.statements

    const statement = statements[statements.length - 1]

    const pendingTransactionChange =
      req.session.data.pendingTransactionChange

    if (!pendingTransactionChange) {
      return res.redirect('/review')
    }

    const transaction = statement.transactions.find(
      transaction =>
        transaction.id === pendingTransactionChange.transactionId
    )

    if (!transaction) {
      return res.redirect('/review')
    }

    res.render('review/review-changes', {
      transaction,
      pendingTransactionChange
    })
  })

}