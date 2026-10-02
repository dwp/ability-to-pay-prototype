module.exports = {
  id: 'stmt-001',
  bank: 'HSBC',
  status: 'extracted',
  reviewStatus: 'in-progress',
  reviewItems: [
    {
      id: 'issue-001',
      title: 'Unreconciled transaction 1',
      hint: 'Monzo.pdf, page 5, rows 7 to 12',
      status: 'needs-review',
      transactionIds: [
        'txn-001',
        'txn-002',
        'txn-003'
      ]
    },
    {
      id: 'issue-002',
      title: 'Unreconciled transaction 2',
      hint: 'Monzo.pdf, page 11, rows 2 to 5',
      status: 'needs-review',
      transactionIds: [
        'txn-004',
        'txn-005',
        'txn-006'
      ]
    }
  ],

  transactions: [
    {
      id: 'txn-001',
      date: '18/04/2026',
      description: 'Card payment',
      debit: '71.00',
      credit: '',
      balance: '4749.25'
    },
    {
      id: 'txn-002',
      date: '18/04/2026',
      description: 'Transfer received',
      debit: '',
      credit: '120.00',
      balance: '4869.25'
    },
    {
      id: 'txn-003',
      date: '19/04/2026',
      description: 'Salary',
      debit: '',
      credit: '1900.00',
      balance: '6769.25'
    },
    {
      id: 'txn-004',
      date: '20/04/2026',
      description: 'ATM withdrawal',
      debit: '50.00',
      credit: '',
      balance: '6719.25'
    },
    {
      id: 'txn-005',
      date: '20/04/2026',
      description: 'Card payment',
      debit: '24.50',
      credit: '',
      balance: '6694.75'
    },
    {
      id: 'txn-006',
      date: '21/04/2026',
      description: 'Standing order',
      debit: '400.00',
      credit: '',
      balance: '6294.75'
    }
  ]
}
