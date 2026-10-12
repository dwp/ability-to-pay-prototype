module.exports = {
  id: 'stmt-003',

  bank: 'Monzo',

  status: 'extracted',

  pageCount: 5,

  transactionCount: 87,

  reviewStatus: 'in-progress',

  reviewItems: [
    {
      id: 'issue-001',

      title: 'Transaction 1',

      hint: 'Page 3, rows 10 to 18',

      status: 'needs-review',

      transactionIds: [
        'txn-001',
        'txn-002',
        'txn-003',
        'txn-004',
        'txn-005'
      ]
    }
  ],

  transactions: [
    {
      id: 'txn-001',
      date: '17 Mar 26',
      description: 'TESCO STORES 4312',
      debit: '42.15',
      credit: '',
      balance: '2284.95'
    },

    {
      id: 'txn-002',
      date: '17 Mar 26',
      description: 'COSTA COFFEE',
      debit: '4.35',
      credit: '',
      balance: '2280.60'
    },

    /*
      MISSING TRANSACTION IN PDF:

      JUST EAT
      17 MAR 26
      £18.22

      This transaction has deliberately been omitted
      from the extracted data.

      The reviewer should identify it from the PDF
      and add it manually.
    */

    {
      id: 'txn-003',
      date: '18 Mar 26',
      description: 'AMAZON UK MARKETPLACE',
      debit: '11.99',
      credit: '',
      balance: '2268.61'
    },

    {
      id: 'txn-004',
      date: '18 Mar 26',
      description: 'TRAINLINE',
      debit: '24.50',
      credit: '',
      balance: '2244.11'
    },

    {
      id: 'txn-005',
      date: '18 Mar 26',
      description: 'LIAM',
      debit: '',
      credit: '25.00',
      balance: '2269.11'
    }
  ]
}