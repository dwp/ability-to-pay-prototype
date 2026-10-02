function escapeCsv(value) {
  return `"${String(value ?? '').replace(/"/g, '""')}"`
}

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

    res.send(csv)
  })
}