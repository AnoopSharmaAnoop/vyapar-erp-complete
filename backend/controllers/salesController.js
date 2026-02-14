// Create Journal Entries for Sales
await prisma.journalEntry.createMany({
  data: [
    {
      companyId: invoice.companyId,
      voucherId: invoice.id,
      ledgerId: CASH_LEDGER_ID,
      debit: invoice.totalAmount,
      credit: 0,
      entryDate: invoice.date,
      isReversed: false,
      createdAt: new Date()
    },
    {
      companyId: invoice.companyId,
      voucherId: invoice.id,
      ledgerId: SALES_LEDGER_ID,
      debit: 0,
      credit: invoice.totalAmount,
      entryDate: invoice.date,
      isReversed: false,
      createdAt: new Date()
    }
  ]
});
