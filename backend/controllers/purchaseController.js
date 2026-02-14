// Create Journal Entries for Purchase
await prisma.journalEntry.createMany({

    console.log("🔥 Purchase journal entry block running");
console.log("Invoice data:", invoice);

  data: [
    {
      companyId: invoice.companyId,
      voucherId: invoice.id,
      ledgerId: PURCHASE_LEDGER_ID, // purchase ledger
      debit: invoice.totalAmount,
      credit: 0,
      entryDate: invoice.date,
      isReversed: false,
      createdAt: new Date()
    },
    {
      companyId: invoice.companyId,
      voucherId: invoice.id,
      ledgerId: CASH_LEDGER_ID, // cash ledger
      debit: 0,
      credit: invoice.totalAmount,
      entryDate: invoice.date,
      isReversed: false,
      createdAt: new Date()
    }
  ]
});
