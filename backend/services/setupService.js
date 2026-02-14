const prisma = require('../config/prisma');

async function ensureOpeningBalanceLedger(companyId) {
  const existing = await prisma.ledger.findFirst({
    where: {
      companyId,
      ledgerCode: 'OPENING_BAL_ADJ',
    },
  });

  if (existing) return existing;

  return prisma.ledger.create({
    data: {
      companyId,
      ledgerCode: 'OPENING_BAL_ADJ',
      ledgerName: 'Opening Balance Adjustment',
      ledgerGroup: 'CAPITAL',
      ledgerType: 'EQUITY',
      openingBalance: 0,
      isActive: true,
    },
  });
}

module.exports = { ensureOpeningBalanceLedger };
