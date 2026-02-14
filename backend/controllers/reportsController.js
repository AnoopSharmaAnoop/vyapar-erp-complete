const prisma = require('../config/prisma');

// ==========================================
// TRIAL BALANCE
// ==========================================

exports.getTrialBalance = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const companyId = req.user.companyId;

    // Get all ledgers with their balances
    const ledgers = await prisma.ledger.findMany({
      where: {
        companyId: companyId,
        isActive: true,
      },
      select: {
        id: true,
        ledgerCode: true,
        ledgerName: true,
        ledgerGroup: true,
        openingBalance: true,
       // currentBalance: true,
     //   balanceType: true,
      },
      orderBy: {
        ledgerGroup: 'asc',
      },
    });

    // Get journal entries for the period (if date range provided)
    let journalEntries = [];
    if (startDate && endDate) {
const fromDate = new Date(startDate);
fromDate.setHours(0, 0, 0, 0);

const toDate = new Date(endDate);
toDate.setHours(23, 59, 59, 999);
journalEntries = await prisma.journalEntry.findMany({
  where: {
    companyId,
    createdAt: {
      gte: fromDate,
      lte: toDate
    },
    voucher: {
      is: {
        status: {
          in: ["PAID", "PARTIALLY_PAID", "OVERDUE", "PENDING"]
        }
      }
    }
  },
  include: {
    voucher: true
  }
});


    }

    // Calculate period balances for each ledger
    const trialBalance = ledgers.map(ledger => {
      let periodDebit = 0;
      let periodCredit = 0;

      // Sum debits where this ledger is debited
     const debits = journalEntries
  .filter(entry => entry.ledgerId === ledger.id)
  .reduce((sum, entry) => sum + entry.debit, 0);

const credits = journalEntries
  .filter(entry => entry.ledgerId === ledger.id)
  .reduce((sum, entry) => sum + entry.credit, 0);

      periodDebit = debits;
      periodCredit = credits;

      // Calculate closing balance
      let openingBalance = ledger.openingBalance;
      let closingBalance = openingBalance;

      if (ledger.balanceType === 'DEBIT') {
        closingBalance = openingBalance + periodDebit - periodCredit;
      } else {
        closingBalance = openingBalance + periodCredit - periodDebit;
      }

      // Determine if closing is debit or credit
     let closingType;

if (ledger.balanceType === 'DEBIT') {
  if (closingBalance >= 0) {
    closingType = 'DEBIT';
  } else {
    closingType = 'CREDIT';
  }
} else {
  if (closingBalance >= 0) {
    closingType = 'CREDIT';
  } else {
    closingType = 'DEBIT';
  }
}

closingBalance = Math.abs(closingBalance);

      return {
        ledgerCode: ledger.ledgerCode,
        ledgerName: ledger.ledgerName,
        ledgerGroup: ledger.ledgerGroup,
        openingBalance: Math.abs(openingBalance),
        openingType: ledger.balanceType,
        periodDebit,
        periodCredit,
        closingBalance,
        closingType,
      };
    });

    // Calculate totals
    const totals = {
      totalOpeningDebit: trialBalance
        .filter(l => l.openingType === 'DEBIT')
        .reduce((sum, l) => sum + l.openingBalance, 0),
      totalOpeningCredit: trialBalance
        .filter(l => l.openingType === 'CREDIT')
        .reduce((sum, l) => sum + l.openingBalance, 0),
      totalPeriodDebit: trialBalance.reduce((sum, l) => sum + l.periodDebit, 0),
      totalPeriodCredit: trialBalance.reduce((sum, l) => sum + l.periodCredit, 0),
      totalClosingDebit: trialBalance
        .filter(l => l.closingType === 'DEBIT')
        .reduce((sum, l) => sum + l.closingBalance, 0),
      totalClosingCredit: trialBalance
        .filter(l => l.closingType === 'CREDIT')
        .reduce((sum, l) => sum + l.closingBalance, 0),
    };

    res.status(200).json({
      success: true,
      data: {
        period: {
          startDate: startDate || null,
          endDate: endDate || null,
        },
        ledgers: trialBalance,
        totals,
      },
    });
  } catch (error) {
    console.error('Trial Balance error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// PROFIT & LOSS ACCOUNT
// ==========================================

exports.getProfitLoss = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const companyId = req.user.companyId;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Start date and end date are required',
      });
    }

    // Get all ledgers
    const ledgers = await prisma.ledger.findMany({
      where: {
        companyId: companyId,
        isActive: true,
      },
    });

    // Get journal entries for the period
    const journalEntries = await prisma.journalEntry.findMany({
      where: {
        companyId: companyId,
        entryDate: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
       // isPosted: true,
        isReversed: false,
      },
    });

    // Calculate balances for income and expense ledgers
const calculateLedgerBalance = (ledgerId) => {
  const debits = journalEntries
    .filter(entry => entry.ledgerId === ledgerId)
    .reduce((sum, entry) => sum + Number(entry.debit || 0), 0);

  const credits = journalEntries
    .filter(entry => entry.ledgerId === ledgerId)
    .reduce((sum, entry) => sum + Number(entry.credit || 0), 0);

  return credits - debits;
};



    
    // Income ledgers
  const incomeLedgers = ledgers
  .filter(l => l.ledgerType === 'INCOME')
  .map(ledger => ({
    ledgerName: ledger.ledgerName,
    ledgerGroup: ledger.ledgerGroup,
    amount: calculateLedgerBalance(ledger.id),
  }))
  .filter(l => l.amount > 0);


    // Expense ledgers
   const expenseLedgers = ledgers
  .filter(l => l.ledgerType === 'EXPENSE')
  .map(ledger => ({
    ledgerName: ledger.ledgerName,
    ledgerGroup: ledger.ledgerGroup,
    amount: Math.abs(calculateLedgerBalance(ledger.id)),
  }))
  .filter(l => l.amount > 0);


    // Calculate totals
    const totalIncome = incomeLedgers.reduce((sum, l) => sum + l.amount, 0);
    const totalExpenses = expenseLedgers.reduce((sum, l) => sum + l.amount, 0);
    const netProfitLoss = totalIncome - totalExpenses;

    // Categorize
    const directIncome = incomeLedgers.filter(l => ['SALES_ACCOUNTS', 'DIRECT_INCOME'].includes(l.ledgerGroup));
    const indirectIncome = incomeLedgers.filter(l => ['INCOME', 'INDIRECT_INCOME'].includes(l.ledgerGroup));
    const directExpenses = expenseLedgers.filter(l => ['PURCHASE_ACCOUNTS', 'DIRECT_EXPENSES'].includes(l.ledgerGroup));
    const indirectExpenses = expenseLedgers.filter(l => ['EXPENSES', 'INDIRECT_EXPENSES'].includes(l.ledgerGroup));

    const grossProfit = directIncome.reduce((sum, l) => sum + l.amount, 0) - 
                       directExpenses.reduce((sum, l) => sum + l.amount, 0);

    res.status(200).json({
      success: true,
      data: {
        period: {
          startDate,
          endDate,
        },
        income: {
          directIncome: {
            items: directIncome,
            total: directIncome.reduce((sum, l) => sum + l.amount, 0),
          },
          indirectIncome: {
            items: indirectIncome,
            total: indirectIncome.reduce((sum, l) => sum + l.amount, 0),
          },
          totalIncome,
        },
        expenses: {
          directExpenses: {
            items: directExpenses,
            total: directExpenses.reduce((sum, l) => sum + l.amount, 0),
          },
          indirectExpenses: {
            items: indirectExpenses,
            total: indirectExpenses.reduce((sum, l) => sum + l.amount, 0),
          },
          totalExpenses,
        },
        grossProfit,
        netProfitLoss,
        profitOrLoss: netProfitLoss >= 0 ? 'PROFIT' : 'LOSS',
      },
    });
  } catch (error) {
    console.error('P&L error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// BALANCE SHEET
// ==========================================

exports.getBalanceSheet = async (req, res) => {
  try {
    const { asOnDate } = req.query;
    const companyId = req.user.companyId;

    if (!asOnDate) {
      return res.status(400).json({
        success: false,
        message: 'As on date is required',
      });
    }

    // Get all ledgers
    const ledgers = await prisma.ledger.findMany({
      where: {
        companyId: companyId,
        isActive: true,
      },
    });

    // Get journal entries up to the date
    const journalEntries = await prisma.journalEntry.findMany({
      where: {
        companyId: companyId,
        entryDate: {
          lte: new Date(asOnDate),
        },
     //   isPosted: true,
        isReversed: false,
      },
    });

    // Calculate balance for each ledger
   const calculateLedgerBalance = (ledgerId) => {
  const ledgerEntries = journalEntries.filter(
    entry => entry.ledgerId === ledgerId
  );

  const debitTotal = ledgerEntries.reduce(
    (sum, e) => sum + Number(e.debit || 0),
    0
  );

  const creditTotal = ledgerEntries.reduce(
    (sum, e) => sum + Number(e.credit || 0),
    0
  );

  return creditTotal - debitTotal;
};


    const ledgerBalances = ledgers.map(calculateLedgerBalance);

    // Assets
    const assets = {
      fixedAssets: ledgerBalances.filter(l => l.ledgerGroup === 'FIXED_ASSETS' && l.amount > 0),
      currentAssets: ledgerBalances.filter(l => 
        ['CURRENT_ASSETS', 'CASH_IN_HAND', 'BANK_ACCOUNTS', 'SUNDRY_DEBTORS'].includes(l.ledgerGroup) && l.amount > 0
      ),
      investments: ledgerBalances.filter(l => l.ledgerGroup === 'INVESTMENTS' && l.amount > 0),
      loansAssets: ledgerBalances.filter(l => l.ledgerGroup === 'LOANS_ASSETS' && l.amount > 0),
    };

    // Liabilities
    const liabilities = {
      capital: ledgerBalances.filter(l => 
        ['CAPITAL', 'RESERVES_SURPLUS'].includes(l.ledgerGroup) && l.amount > 0
      ),
      currentLiabilities: ledgerBalances.filter(l => 
        ['CURRENT_LIABILITIES', 'SUNDRY_CREDITORS'].includes(l.ledgerGroup) && l.amount > 0
      ),
      longTermLiabilities: ledgerBalances.filter(l => 
        ['LONG_TERM_LIABILITIES', 'LOANS_LIABILITY'].includes(l.ledgerGroup) && l.amount > 0
      ),
      provisions: ledgerBalances.filter(l => 
        ['PROVISIONS', 'DUTIES_TAXES'].includes(l.ledgerGroup) && l.amount > 0
      ),
    };

    // Calculate totals
    const totalAssets = 
      assets.fixedAssets.reduce((sum, l) => sum + l.amount, 0) +
      assets.currentAssets.reduce((sum, l) => sum + l.amount, 0) +
      assets.investments.reduce((sum, l) => sum + l.amount, 0) +
      assets.loansAssets.reduce((sum, l) => sum + l.amount, 0);

    const totalLiabilities = 
      liabilities.capital.reduce((sum, l) => sum + l.amount, 0) +
      liabilities.currentLiabilities.reduce((sum, l) => sum + l.amount, 0) +
      liabilities.longTermLiabilities.reduce((sum, l) => sum + l.amount, 0) +
      liabilities.provisions.reduce((sum, l) => sum + l.amount, 0);

    // Get profit/loss for the period
    const financialYearStart = await prisma.company.findUnique({
      where: { id: companyId },
      select: { financialYearStart: true },
    });

    // This should ideally call getProfitLoss internally, but simplified here
    const profitLoss = totalAssets - totalLiabilities;
res.status(200).json({
      success: true,
      data: {
        asOnDate,
        assets: {
          fixedAssets: {
            items: assets.fixedAssets,
            total: assets.fixedAssets.reduce((sum, l) => sum + l.amount, 0),
          },
          currentAssets: {
            items: assets.currentAssets,
            total: assets.currentAssets.reduce((sum, l) => sum + l.amount, 0),
          },
          investments: {
            items: assets.investments,
            total: assets.investments.reduce((sum, l) => sum + l.amount, 0),
          },
          loansAssets: {
            items: assets.loansAssets,
            total: assets.loansAssets.reduce((sum, l) => sum + l.amount, 0),
          },
          totalAssets,
        },
        liabilities: {
          capital: {
            items: liabilities.capital,
            total: liabilities.capital.reduce((sum, l) => sum + l.amount, 0),
          },
          currentLiabilities: {
            items: liabilities.currentLiabilities,
            total: liabilities.currentLiabilities.reduce((sum, l) => sum + l.amount, 0),
          },
          longTermLiabilities: {
            items: liabilities.longTermLiabilities,
            total: liabilities.longTermLiabilities.reduce((sum, l) => sum + l.amount, 0),
          },
          provisions: {
            items: liabilities.provisions,
            total: liabilities.provisions.reduce((sum, l) => sum + l.amount, 0),
          },
          totalLiabilities,
        },
        profitLoss: {
          amount: Math.abs(profitLoss),
          type: profitLoss >= 0 ? 'PROFIT' : 'LOSS',
        },
        difference: totalAssets - (totalLiabilities + Math.abs(profitLoss)),
      },
    });
  } catch (error) {
    console.error('Balance Sheet error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// LEDGER REPORT (Individual Ledger Statement)
// ==========================================

exports.getLedgerReport = async (req, res) => {
  try {
    const { ledgerId, startDate, endDate } = req.query;
    const companyId = req.user.companyId;

    if (!ledgerId) {
      return res.status(400).json({
        success: false,
        message: 'Ledger ID is required',
      });
    }

    // Verify ledger belongs to company
    const ledger = await prisma.ledger.findFirst({
      where: {
        id: parseInt(ledgerId),
        companyId: companyId,
      },
    });

    if (!ledger) {
      return res.status(404).json({
        success: false,
        message: 'Ledger not found',
      });
    }

    // Build query
    const whereClause = {
      companyId: companyId,
      OR: [
        { debitLedgerId: parseInt(ledgerId) },
        { creditLedgerId: parseInt(ledgerId) },
      ],
      isPosted: true,
      isReversed: false,
    };



    
    if (startDate && endDate) {
      whereClause.entryDate = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    const entries = await prisma.journalEntry.findMany({
      where: whereClause,
      include: {
        debitLedger: { select: { ledgerName: true } },
        creditLedger: { select: { ledgerName: true } },
        voucher: {
          select: {
            voucherNumber: true,
            voucherType: true,
          },
        },
      },
      orderBy: {
        entryDate: 'asc',
      },
    });

    // Calculate running balance
    let runningBalance = ledger.openingBalance;
    const transactions = entries.map(entry => {
      const isDebit = entry.debitLedgerId === parseInt(ledgerId);
      const particulars = isDebit ? entry.creditLedger.ledgerName : entry.debitLedger.ledgerName;
      const debit = isDebit ? entry.amount : 0;
      const credit = isDebit ? 0 : entry.amount;

      if (ledger.balanceType === 'DEBIT') {
        runningBalance = runningBalance + debit - credit;
      } else {
        runningBalance = runningBalance + credit - debit;
      }

      return {
        date: entry.entryDate,
        particulars,
        voucherNumber: entry.voucher?.voucherNumber || entry.entryNumber,
        voucherType: entry.voucher?.voucherType || 'JOURNAL',
        debit,
        credit,
        balance: Math.abs(runningBalance),
        balanceType: runningBalance >= 0 ? ledger.balanceType : (ledger.balanceType === 'DEBIT' ? 'CREDIT' : 'DEBIT'),
      };
    });

    res.status(200).json({
      success: true,
      data: {
        ledger: {
          ledgerName: ledger.ledgerName,
          ledgerGroup: ledger.ledgerGroup,
          openingBalance: ledger.openingBalance,
          openingType: ledger.balanceType,
        },
        period: {
          startDate: startDate || null,
          endDate: endDate || null,
        },
        transactions,
        closingBalance: {
          amount: Math.abs(runningBalance),
          type: runningBalance >= 0 ? ledger.balanceType : (ledger.balanceType === 'DEBIT' ? 'CREDIT' : 'DEBIT'),
        },
      },
    });
  } catch (error) {
    console.error('Ledger Report error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// GST REPORTS
// ==========================================

exports.getGSTR1 = async (req, res) => {
  try {
    const { month, year } = req.query;
    const companyId = req.user.companyId;

    if (!month || !year) {
      return res.status(400).json({
        success: false,
        message: 'Month and year are required',
      });
    }

    // Get sales invoices for the month
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const salesInvoices = await prisma.voucher.findMany({
      where: {
        companyId: companyId,
        voucherType: 'SALES_INVOICE',
        voucherDate: {
          gte: startDate,
          lte: endDate,
        },
        isActive: true,
      },
      include: {
        party: {
          select: {
            ledgerName: true,
            gstNumber: true,
            state: true,
          },
        },
        items: {
          include: {
            item: {
              select: {
                itemName: true,
                hsnCode: true,
                sacCode: true,
              },
            },
          },
        },
      },
    });

    // Process GSTR1 data
    const gstr1Data = salesInvoices.map(invoice => ({
      invoiceNumber: invoice.voucherNumber,
      invoiceDate: invoice.voucherDate,
      customerName: invoice.party.ledgerName,
      gstNumber: invoice.party.gstNumber,
      placeOfSupply: invoice.placeOfSupply,
      taxableValue: invoice.totalTaxable,
      cgst: invoice.cgstAmount,
      sgst: invoice.sgstAmount,
      igst: invoice.igstAmount,
      cess: invoice.cessAmount,
      totalTax: invoice.totalTax,
      invoiceValue: invoice.totalAmount,
    }));

    // Summary by GST rate
    const summary = {};
    salesInvoices.forEach(invoice => {
      invoice.items.forEach(item => {
        const rate = item.cgstRate + item.sgstRate || item.igstRate;
        if (!summary[rate]) {
          summary[rate] = {
            taxableValue: 0,
            cgst: 0,
            sgst: 0,
            igst: 0,
            cess: 0,
          };
        }
        summary[rate].taxableValue += item.taxableAmount;
        summary[rate].cgst += item.cgstAmount;
        summary[rate].sgst += item.sgstAmount;
        summary[rate].igst += item.igstAmount;
        summary[rate].cess += item.cessAmount;
      });
    });

    res.status(200).json({
      success: true,
      data: {
        period: { month, year },
        invoices: gstr1Data,
        summary,
        totals: {
          totalInvoices: salesInvoices.length,
          totalTaxableValue: gstr1Data.reduce((sum, inv) => sum + inv.taxableValue, 0),
          totalCGST: gstr1Data.reduce((sum, inv) => sum + inv.cgst, 0),
          totalSGST: gstr1Data.reduce((sum, inv) => sum + inv.sgst, 0),
          totalIGST: gstr1Data.reduce((sum, inv) => sum + inv.igst, 0),
          totalCess: gstr1Data.reduce((sum, inv) => sum + inv.cess, 0),
          totalTax: gstr1Data.reduce((sum, inv) => sum + inv.totalTax, 0),
          totalInvoiceValue: gstr1Data.reduce((sum, inv) => sum + inv.invoiceValue, 0),
        },
      },
    });
  } catch (error) {
    console.error('GSTR1 error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
