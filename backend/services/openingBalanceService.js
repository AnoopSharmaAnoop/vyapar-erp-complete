const prisma = require('../config/prisma');

async function createOpeningBalanceVoucher(companyId, entries) {
  // 🔒 Safety: allow only one opening balance voucher
  const existing = await prisma.voucher.findFirst({
    where: {
      companyId,
      voucherType: 'OPENING_BALANCE',
    },
  });

  if (existing) {
    throw new Error('Opening Balance already created');
  }

  // 🧮 Calculate totals
  const totalDebit = entries.reduce((s, e) => s + (e.debit || 0), 0);
  const totalCredit = entries.reduce((s, e) => s + (e.credit || 0), 0);

  if (totalDebit !== totalCredit) {
    throw new Error('Opening Balance is not balanced');
  }

  // ✅ Create voucher
  return await prisma.voucher.create({
    data: {
      companyId,
      voucherType: 'OPENING_BALANCE',
      voucherDate: new Date(),
      narration: 'Opening Balance',
      voucherItems: {
        create: entries,
      },
    },
  });
}

module.exports = { createOpeningBalanceVoucher };
