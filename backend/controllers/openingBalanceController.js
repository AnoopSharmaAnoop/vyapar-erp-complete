const prisma = require('../config/prisma');

exports.createOpeningBalance = async (req, res) => {
  try {
    const companyId = req.user.companyId;
    const { entries } = req.body;

    /**
     * entries = [
     *   { ledgerId: 1, debit: 50000, credit: 0 },
     *   { ledgerId: 2, debit: 0, credit: 50000 }
     * ]
     */

    if (!entries || entries.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'At least two entries required',
      });
    }

    const totalDebit = entries.reduce((s, e) => s + (e.debit || 0), 0);
    const totalCredit = entries.reduce((s, e) => s + (e.credit || 0), 0);

    if (totalDebit !== totalCredit) {
      return res.status(400).json({
        success: false,
        message: 'Debit and Credit must be equal',
      });
    }

    // ❗ Only ONE opening balance allowed
    const existing = await prisma.voucher.findFirst({
      where: {
        companyId,
        voucherType: 'OPENING_BALANCE',
        isActive: true,
      },
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Opening balance already exists',
      });
    }

    const voucher = await prisma.voucher.create({
      data: {
        companyId,
        voucherType: 'OPENING_BALANCE',
        voucherNumber: 'OB-1',
        narration: 'Opening Balance',
        journalEntries: {
          create: entries.map(e => ({
            companyId,
            ledgerId: e.ledgerId,
            debit: e.debit || 0,
            credit: e.credit || 0,
            narration: 'Opening Balance',
          })),
        },
      },
    });

    res.status(201).json({
      success: true,
      message: 'Opening balance created',
      data: voucher,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
