module.exports = function (router) {

  router.get('/downloads/extracted-data', (req, res) => {
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
        'Amount'
      ].join(',')
    ]

    transactions.forEach(transaction => {
      rows.push([
        transaction.id,
        transaction.date,
        transaction.description,
        transaction.amount
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
        'Old Amount',
        'New Amount',
        'Amount',
        'Reason'
      ].join(',')
    ]

    auditRecords.forEach(record => {
      rows.push([
        record.timestamp || '',
        record.userId || '',
        record.action || '',
        record.transactionId || '',
        record.oldAmount || '',
        record.newAmount || '',
        record.amount || '',
        `"${record.reason || ''}"`
      ].join(','))
    })

    const csv = rows.join('\n')

    res.setHeader('Content-Type', 'text/csv')
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="audit-history.csv"'
    )

    res.send(csv)
  })
}