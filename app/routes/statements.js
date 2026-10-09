const {
  createMockStatement
} = require('../data/services/statement-service')

module.exports = function (router) {
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
      req.session.data.audit = []

      req.session.data.case.statements = [statement]
    }

    if (
      statement?.reviewItems &&
      statement.reviewItems.length > 0
    ) {
      return res.redirect('/review')
    }

    res.redirect('/statements/success')
  })

  router.get('/statements/success', (req, res) => {
    const statements = req.session.data.case.statements

    const statement = statements?.[statements.length - 1]

    if (!statement) {
      return res.redirect('/')
    }

    const reviewItems = statement.reviewItems || []

    const hasReviewItems = reviewItems.length > 0

    const reviewedCount = reviewItems.filter(
      item => item.status === 'validated'
    ).length

    const uploadedFileName =
      req.session.data.upload?.filename ||
      (statement.bank
        ? `${statement.bank.toLowerCase()}_statement.pdf`
        : 'bank_statement.pdf')

    const showAuditDownloadError =
      req.session.data.showAuditDownloadError

    delete req.session.data.showAuditDownloadError

    res.render('statements/success', {
      statement,
      reviewItems,
      hasReviewItems,
      reviewedCount,
      uploadedFileName,
      showAuditDownloadError
    })
  })

  const {
    createMockStatement
  } = require('../data/services/statement-service')

  router.get('/prototype/monzo-complete', (req, res) => {
    const statement = createMockStatement('Monzo')

    req.session.data.case.statements = [statement]

    req.session.data.upload = {
      filename: 'monzo_statement.pdf'
    }

    req.session.data.audit = []

    req.session.data.hasReviewChanges = false

    req.session.data.auditHistoryDownloaded = false

    res.redirect('/statements/success')
  })

  router.get('/prototype/hsbc-complete', (req, res) => {
    const statement = createMockStatement('HSBC')

    statement.reviewItems.forEach(item => {
      item.status = 'validated'
    })

    statement.reviewStatus = 'completed'

    req.session.data.case.statements = [statement]

    req.session.data.upload = {
      filename: 'hsbc_statement.pdf'
    }

    req.session.data.audit = [
      {
        timestamp: new Date().toISOString(),
        userId: req.session.data.user?.id || 'ECM12345',
        action: 'change',
        transactionId: 'txn-001',
        originalValues: {
          debit: '71.00',
          credit: '',
          balance: '4749.25'
        },
        updatedValues: {
          debit: '80.00',
          credit: '',
          balance: '4758.25'
        },
        reason: 'Prototype review correction'
      }
    ]

    req.session.data.hasReviewChanges = true

    req.session.data.auditHistoryDownloaded = false

    res.redirect('/statements/success')
  })

  router.get('/prototype/reset', (req, res) => {

    const user = req.session.data.user
    
    req.session.data = {
      prototypeReset: true,
      case: {
        statements: []
      },
      audit: [],
      upload: null,
      selectedBank: null,
      hasReviewChanges: false,
      auditHistoryDownloaded: false,
      showAuditDownloadError: false
    }

    res.redirect('/')
  })


}
