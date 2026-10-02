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

    res.redirect('/statements/success')
  })

  router.get('/statements/success', (req, res) => {
    const statements = req.session.data.case.statements

    const statement = statements[statements.length - 1]

    const reviewItems = statement.reviewItems || []

    const reviewedCount = reviewItems.filter(
      item => item.status === 'validated'
    ).length

    const lastAudit =
      req.session.data.audit?.slice(-1)[0]

    const uploadedFileName =
      req.session.data.upload?.filename || 'Unknown'

    res.render('statements/success', {
      statement,
      reviewItems,
      reviewedCount,
      lastAudit,
      uploadedFileName
    })
  })

}
