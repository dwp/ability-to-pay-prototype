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

    const uploadedFileName =
      req.session.data.upload?.filename ||
      (statement.bank
        ? `${statement.bank.toLowerCase()}_statement.pdf`
        : 'bank_statement.pdf')

    res.render('review/index', {
      statement,
      reviewItems,
      hasAuditRecords,
      uploadedFileName
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

  router.get('/review/start-edit/:transactionId', (req, res) => {
    const statements = req.session.data.case.statements

    const statement = statements[statements.length - 1]

    const transaction = statement.transactions.find(
      transaction => transaction.id === req.params.transactionId
    )

    if (!transaction) {
      return res.redirect('/review')
    }

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
      pendingTransactionChange,
      enteredReason:
        pendingTransactionChange.reason || ''
    })
  })

  router.get('/review/audit-history', (req, res) => {
    const auditRecords = (req.session.data.audit || []).map(
      record => ({
        ...record,

        formattedTimestamp: new Date(
          record.timestamp
        ).toLocaleString('en-GB', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      })
    )

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

    let transactionType = 'unknown'
    let transactionAmount = '—'

    if (transaction.debit) {
      transactionType = 'debit'
      transactionAmount = transaction.debit
    } else if (transaction.credit) {
      transactionType = 'credit'
      transactionAmount = transaction.credit
    }

    res.render('review/remove', {
      transaction,
      transactionType,
      transactionAmount
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
      userId: req.session.data.user?.id || 'ECM12345',
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

    req.session.data.hasReviewChanges = true

    if (statement.reviewStatus === 'completed') {
      return res.redirect('/statements/success')
    }

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

    const uploadedFileName =
      req.session.data.upload?.filename ||
      (statement.bank
        ? `${statement.bank.toLowerCase()}_statement.pdf`
        : 'bank_statement.pdf')

    res.render('review/item', {
      reviewItem,
      reviewNumber,
      transactions,
      uploadedFileName
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

  router.post('/review/review-changes', (req, res) => {
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

    const reason = req.body.reason?.trim()

    if (!reason) {
      return res.render('review/change', {
        transaction,
        pendingTransactionChange,
        enteredReason: '',
        errors: [
          {
            text: 'Enter a reason for the change',
            href: '#reason'
          }
        ]
      })
    }

    transaction.debit =
      pendingTransactionChange.updatedValues.debit

    transaction.credit =
      pendingTransactionChange.updatedValues.credit

    transaction.balance =
      pendingTransactionChange.updatedValues.balance

    req.session.data.audit.push({
      timestamp: new Date().toISOString(),
      userId: req.session.data.user?.id || 'ECM12345',
      action: 'change',
      transactionId: transaction.id,
      originalValues:
        pendingTransactionChange.originalValues,
      updatedValues:
        pendingTransactionChange.updatedValues,
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

    req.session.data.hasReviewChanges = true

    if (statement.reviewStatus === 'completed') {
      return res.redirect('/statements/success')
    }

    res.redirect('/review')

  })




}