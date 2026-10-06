function escapeCsv(value) {
  return `"${String(value ?? '').replace(/"/g, '""')}"`
}

module.exports = function (router) {

  router.get('/downloads/extracted-data', (req, res) => {

    if (
      req.session.data.hasReviewChanges &&
      !req.session.data.auditHistoryDownloaded
    ) {
      return res.redirect('/downloads/audit-reminder')
    }

    const statements = req.session.data.case.statements

    const statement = statements[statements.length - 1]

    const transactions = statement.transactions.filter(
      transaction => !transaction.removed
    )

    const rows = [
      [
        'Transaction ID',
        'Date',
        'Description',
        'Debit',
        'Credit',
        'Balance'
      ].join(',')
    ]

    transactions.forEach(transaction => {
      rows.push([
        escapeCsv(transaction.id),
        escapeCsv(transaction.date),
        escapeCsv(transaction.description),
        escapeCsv(transaction.debit),
        escapeCsv(transaction.credit),
        escapeCsv(transaction.balance)
      ].join(','))
    })

    const csv = rows.join('\n')

    res.setHeader('Content-Type', 'text/csv')
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="reviewed-data.csv"'
    )

    res.send(csv)
  })

  router.get('/downloads/audit-history', (req, res) => {
    const auditRecords = req.session.data.audit || []

    const rows = [
      [
        'Timestamp',
        'User ID',
        'Action',
        'Transaction ID',
        'Original Debit',
        'Updated Debit',
        'Original Credit',
        'Updated Credit',
        'Original Balance',
        'Updated Balance',
        'Reason'
      ].join(',')
    ]

    auditRecords.forEach(record => {
      rows.push([
        escapeCsv(record.timestamp),
        escapeCsv(record.userId),
        escapeCsv(record.action),
        escapeCsv(record.transactionId),

        escapeCsv(record.originalValues?.debit),
        escapeCsv(record.updatedValues?.debit),

        escapeCsv(record.originalValues?.credit),
        escapeCsv(record.updatedValues?.credit),

        escapeCsv(record.originalValues?.balance),
        escapeCsv(record.updatedValues?.balance),

        escapeCsv(record.reason)
      ].join(','))
    })

    const csv = rows.join('\n')

    res.setHeader('Content-Type', 'text/csv')
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="audit-history.csv"'
    )

    req.session.data.auditHistoryDownloaded = true

    res.send(csv)
  })

  // router.get('/downloads/audit-reminder', (req, res) => {
  //   res.render('downloads/audit-reminder')
  // })

  //   router.get('/downloads/audit-downloaded', (req, res) => {
  //   res.render('downloads/audit-downloaded')
  // })

  router.post('/downloads/audit-history-ready', (req, res) => {
    const action = req.body.action

    if (action === 'audit-history') {
      return res.redirect('/downloads/audit-history')
    }

    if (
      action === 'reviewed-data' &&
      !req.session.data.auditHistoryDownloaded
    ) {
      req.session.data.showAuditDownloadError = true

      return res.redirect('/statements/success')
    }

    if (action === 'reviewed-data') {
      return res.redirect('/downloads/extracted-data')
    }

    res.redirect('/statements/success')
  })

  router.post('/downloads/reviewed-data', (req, res) => {
    if (!req.session.data.auditHistoryDownloaded) {
      return res.render('downloads/audit-history-ready', {
        errors: true
      })
    }

    return res.redirect('/downloads/extracted-data')
  })

}