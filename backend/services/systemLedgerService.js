const prisma = require('../config/prisma');

async function createSystemLedgers(companyId) {
  const systemLedgers = [
    {
      ledgerName: 'Cash in Hand',
      ledgerCode: 'CASH_IN_HAND',
      ledgerGroup: 'CASH_IN_HAND',
      ledgerType: 'ASSET',
      openingBalance: 0,
    },
    {
      ledgerName: 'Capital Account',
      ledgerCode: 'CAPITAL_ACCOUNT',
      ledgerGroup: 'CAPITAL',
      ledgerType: 'EQUITY',
      openingBalance: 0,
    },
    {
      ledgerName: 'Opening Balance Adjustment',
      ledgerCode: 'OPENING_BALANCE_ADJ',
      ledgerGroup: 'CAPITAL',
      ledgerType: 'EQUITY',
      openingBalance: 0,
    },
  ];

  for (const ledger of systemLedgers) {
    await prisma.ledger.create({
      data: {
        companyId,
        ...ledger,
        isActive: true,
      },
    });
  }
}

module.exports = { createSystemLedgers };
