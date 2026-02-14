
// Create Ledger
const prisma = require('../config/prisma');
const ledgerTypeMap = {
  SUNDRY_DEBTORS: 'ASSET',
  SUNDRY_CREDITORS: 'LIABILITY',
  CASH_IN_HAND: 'ASSET',
  BANK_ACCOUNTS: 'ASSET',
  SALES_ACCOUNTS: 'INCOME',
  PURCHASE_ACCOUNTS: 'EXPENSE',
  DIRECT_EXPENSES: 'EXPENSE',
  INDIRECT_EXPENSES: 'EXPENSE',
  CAPITAL: 'EQUITY',
};

exports.createLedger = async (req, res) => {
  try {
    const {
      ledgerName,
      ledgerGroup,
      openingBalance = 0,
    //  balanceType = 'DEBIT',
      phone,
      email,
      address,
      gstNumber,
      creditLimit,
      creditDays,
    } = req.body;

    if (!ledgerName || !ledgerGroup) {
      return res.status(400).json({
        success: false,
        message: 'Ledger name and group are required',
      });
    }

    // ✅ Ledger Group ENUM MAP (IMPORTANT)
    const ledgerGroupMap = {
      'sundry debtors': 'SUNDRY_DEBTORS',
      'sundry creditors': 'SUNDRY_CREDITORS',
      'cash in hand': 'CASH_IN_HAND',
      'bank accounts': 'BANK_ACCOUNTS',
      'sales accounts': 'SALES_ACCOUNTS',
      'purchase accounts': 'PURCHASE_ACCOUNTS',
      'direct expenses': 'DIRECT_EXPENSES',
      'indirect expenses': 'INDIRECT_EXPENSES',
      assets: 'ASSETS',
      liabilities: 'LIABILITIES',
      income: 'INCOME',
      expenses: 'EXPENSES',
      capital: 'CAPITAL',
    };

    // ✅ Normalize ledgerGroup → Prisma ENUM
    const normalizedLedgerGroup =
      ledgerGroupMap[String(ledgerGroup).toLowerCase()] ||
      'SUNDRY_DEBTORS';
      const ledgerType =
  ledgerTypeMap[normalizedLedgerGroup] || 'ASSET';


    // ✅ Auto-generate ledgerCode
    const ledgerCode = ledgerName
      .trim()
      .toUpperCase()
      .replace(/\s+/g, '_');

      
    const ledger = await prisma.ledger.create({
      data: {
        companyId: req.user.companyId, // 🔐 FROM JWT
        ledgerCode,
        ledgerName,
        ledgerGroup: normalizedLedgerGroup, // ✅ FIXED
       

    ledgerType: ledgerType, // ✅ WRITE HERE ✅
        openingBalance: Number(openingBalance),
       // currentBalance: Number(openingBalance),
      //  balanceType: balanceType.toUpperCase(),
        phone: phone || null,
        email: email || null,
        address: address || null,
        gstNumber: gstNumber || null,
        creditLimit: creditLimit ? Number(creditLimit) : null,
        creditDays: creditDays ? Number(creditDays) : null,
      },
      include: {
        company: {
          select: { id: true, name: true },
        },
      },
    });

    res.status(201).json({
      success: true,
      message: 'Ledger created successfully',
      data: ledger,
    });
  } catch (error) {
    console.error('Create ledger error:', error);

    if (error.code === 'P2002') {
      return res.status(400).json({
        success: false,
        message: 'Ledger already exists for this company',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create ledger',
    });
  }
};

// Get all Ledgers by Company
exports.getAllLedgers = async (req, res) => {
  try {
    const { group } = req.query;

    const whereClause = {
      companyId: req.user.companyId,
      isActive: true,
    };

   // if (group) {
     // whereClause.ledgerGroup = ledgerGroupMap[group];

    //}

    const ledgers = await prisma.ledger.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
    });

    const ledgerIds = ledgers.map(l => l.id);

    const journalSums = await prisma.journalEntry.groupBy({
      by: ['ledgerId'],
      where: {
        ledgerId: { in: ledgerIds },
      },
      _sum: {
        debit: true,
        credit: true,
      },
    });

    const balanceMap = {};
    journalSums.forEach(j => {
      balanceMap[j.ledgerId] =
        (j._sum.debit || 0) - (j._sum.credit || 0);
    });

  
const ledgersWithBalance = ledgers.map(ledger => {
  const movement = balanceMap[ledger.id] || 0;

  let balance;

  if (['LIABILITY','EQUITY','INCOME'].includes(ledger.ledgerType)) {
    // Reverse sign for credit-nature accounts
    balance = ledger.openingBalance - movement;
  } else {
    // Normal debit-nature accounts
    balance = ledger.openingBalance + movement;
  }

  return {
    ...ledger,
    balance,
  };
});





    res.status(200).json({
      success: true,
      count: ledgersWithBalance.length,
      data: ledgersWithBalance,
    });
  } catch (error) {
    console.error('Get ledgers error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get Ledger by ID
exports.getLedgerById = async (req, res) => {
  try {
    const ledger = await prisma.ledger.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        company: {
          select: { id: true, name: true },
        },
        vouchers: {
          take: 10,
          orderBy: { voucherDate: 'desc' },
          select: {
            id: true,
            voucherNumber: true,
            voucherType: true,
            voucherDate: true,
            totalAmount: true,
            status: true,
          },
        },
      },
    });

    if (!ledger) {
      return res.status(404).json({
        success: false,
        message: 'Ledger not found',
      });
    }

    res.status(200).json({
      success: true,
      data: ledger,
    });
  } catch (error) {
    console.error('Get ledger error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};





// Update Ledger
exports.updateLedger = async (req, res) => {
  try {
   const {
  ledgerName,
  ledgerGroup,
  openingBalance,
  phone,
  email,
  address,
  gstNumber,
  creditLimit,
  creditDays,
} = req.body;

const updateData = {
  ...(ledgerName && { ledgerName }),
  ...(ledgerGroup && { ledgerGroup }),
  ...(openingBalance !== undefined && { openingBalance: parseFloat(openingBalance) }),
  ...(phone !== undefined && { phone }),
  ...(email !== undefined && { email }),
  ...(address !== undefined && { address }),
  ...(gstNumber !== undefined && { gstNumber }),
  ...(creditLimit !== undefined && { creditLimit: parseFloat(creditLimit) }),
  ...(creditDays !== undefined && { creditDays: parseInt(creditDays) }),
};

    
    // Convert numeric fields
    if (updateData.openingBalance) updateData.openingBalance = parseFloat(updateData.openingBalance);
   // if (updateData.currentBalance) updateData.currentBalance = parseFloat(updateData.currentBalance);
    if (updateData.creditLimit) updateData.creditLimit = parseFloat(updateData.creditLimit);
    if (updateData.creditDays) updateData.creditDays = parseInt(updateData.creditDays);
    
    // Remove fields that shouldn't be updated
    delete updateData.id;
    delete updateData.companyId;
    delete updateData.createdAt;
    delete updateData.updatedAt;

const journalCount = await prisma.journalEntry.count({
  where: {
    ledgerId: parseInt(req.params.id),
  },
});

if (journalCount > 0 && updateData.openingBalance !== undefined) {
  return res.status(400).json({
    success: false,
    message: 'Opening balance cannot be changed after transactions exist',
  });
}




    const ledger = await prisma.ledger.update({
      where: { id: parseInt(req.params.id) },
      data: updateData,
      include: {
        company: {
          select: { id: true, name: true },
        },
      },
    });

    res.status(200).json({
      success: true,
      message: 'Ledger updated successfully',
      data: ledger,
    });
  } catch (error) {
    console.error('Update ledger error:', error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete Ledger (Soft Delete)
exports.deleteLedger = async (req, res) => {
  try {
    // Check if ledger has associated vouchers
    const voucherCount = await prisma.voucher.count({
      where: {
        partyId: parseInt(req.params.id),
        isActive: true,
      },
    });

    if (voucherCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete ledger with existing vouchers. Please delete vouchers first.',
      });
    }

    const ledger = await prisma.ledger.update({
      where: { id: parseInt(req.params.id) },
      data: { isActive: false },
    });

    res.status(200).json({
      success: true,
      message: 'Ledger deleted successfully',
    });
  } catch (error) {
    console.error('Delete ledger error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update Ledger Balance
/*
exports.updateBalance = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, type } = req.body; // type: 'debit' or 'credit'

    const ledger = await prisma.ledger.findUnique({
      where: { id: parseInt(id) },
    });

    if (!ledger) {
      return res.status(404).json({
        success: false,
        message: 'Ledger not found',
      });
    }

    let newBalance = ledger.currentBalance;
    let newBalanceType = ledger.balanceType;

    if (type === 'debit') {
      newBalance += parseFloat(amount);
      newBalanceType = 'DEBIT';
    } else if (type === 'credit') {
      newBalance -= parseFloat(amount);
      if (newBalance < 0) {
        newBalanceType = 'CREDIT';
        newBalance = Math.abs(newBalance);
      }
    }

    const updatedLedger = await prisma.ledger.update({
      where: { id: parseInt(id) },
      data: {
        currentBalance: newBalance,
        balanceType: newBalanceType,
      },
    });

    res.status(200).json({
      success: true,
      message: 'Ledger balance updated successfully',
      data: updatedLedger,
    });
  } catch (error) {
    console.error('Update balance error:', error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
*/
// Get Ledger Groups (Static list based on enum)
exports.getLedgerGroups = async (req, res) => {
  try {
    const groups = [
      'ASSETS',
      'LIABILITIES',
      'INCOME',
      'EXPENSES',
      'CAPITAL',
      'CURRENT_ASSETS',
      'CURRENT_LIABILITIES',
      'FIXED_ASSETS',
      'SUNDRY_DEBTORS',
      'SUNDRY_CREDITORS',
      'BANK_ACCOUNTS',
      'CASH_IN_HAND',
      'PURCHASE_ACCOUNTS',
      'SALES_ACCOUNTS',
      'DIRECT_EXPENSES',
      'INDIRECT_EXPENSES',
    ];

    res.status(200).json({
      success: true,
      data: groups,
    });
  } catch (error) {
    console.error('Get ledger groups error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
