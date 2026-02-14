// backend/services/accountingService.js

/**
 * Create journal entries for Sales Invoice
 * Debit: Customer
 * Credit: Sales
 */
exports.createSalesInvoiceEntries = async ({
  tx,
  companyId,
  voucher,
  totalAmount,
  partyId,
}) => {
  if (!partyId) {
    throw new Error('Sales Invoice must have a customer (partyId)');
  }

  if (!totalAmount || totalAmount <= 0) {
    throw new Error('Invalid totalAmount for Sales Invoice');
  }

  // 🔎 Find Sales Ledger
  const salesLedger = await tx.ledger.findFirst({
    where: {
      companyId,
      ledgerGroup: 'SALES_ACCOUNTS',
      isActive: true,
    },
  });

  if (!salesLedger) {
    throw new Error('Sales ledger not found');
  }

  // 1️⃣ Debit Customer
  await tx.journalEntry.create({
    data: {
      companyId,
      voucherId: voucher.id,
      ledgerId: partyId,
      debit: totalAmount,
      credit: 0,
      narration: `Sales Invoice ${voucher.voucherNumber}`,
    },
  });

  // 2️⃣ Credit Sales
  await tx.journalEntry.create({
    data: {
      companyId,
      voucherId: voucher.id,
      ledgerId: salesLedger.id,
      debit: 0,
      credit: totalAmount,
      narration: `Sales Invoice ${voucher.voucherNumber}`,
    },
  });
};
