const prisma = require('../config/prisma');
const accountingService = require('../Services/accountingService')
const VOUCHER_TYPE_MAP = {
  'Sales Invoice': 'SALES_INVOICE',
  'Purchase Invoice': 'PURCHASE_INVOICE',
  'Payment': 'PAYMENT',
  'Receipt': 'RECEIPT',
  'Journal': 'JOURNAL',
  'Debit Note': 'DEBIT_NOTE',
  'Credit Note': 'CREDIT_NOTE',
};



const ITEM_BASED_VOUCHERS = [
  'SALES_INVOICE',
  'PURCHASE_INVOICE',
  'DEBIT_NOTE',
  'CREDIT_NOTE',
];





// ⭐ HELPER FUNCTION HERE (TOP OF FILE)
async function getOrCreateLedger(tx, companyId, ledgerName, ledgerGroup, ledgerType) {
  let ledger = await tx.ledger.findFirst({
    where: {
      companyId,
      ledgerName: {
        equals: ledgerName,
        mode: 'insensitive'
      }
    }
  });

  if (!ledger) {
    ledger = await tx.ledger.create({
      data: {
        companyId,
        ledgerName,
        ledgerCode: ledgerName.toUpperCase().replace(/\s+/g, '_'),
        ledgerGroup,
        ledgerType,
        openingBalance: 0
      }
    });
  }

  return ledger;
}






exports.createVoucher = async (req, res) => {
  try {
    const {
      voucherType,
      voucherDate,
      party,
      items,
      totalAmount,
      narration,
      journalEntries
    } = req.body;

    const companyId = req.user.companyId;
    const prismaVoucherType = VOUCHER_TYPE_MAP[voucherType];

    if (!prismaVoucherType) {
      return res.status(400).json({
        success: false,
        message: 'Invalid voucher type'
      });
    }

    const partyId = party ? Number(party) : null;

    const result = await prisma.$transaction(async (tx) => {

      /* ---------- Generate Voucher Number ---------- */
      const lastVoucher = await tx.voucher.findFirst({
        where: { companyId, voucherType: prismaVoucherType },
        orderBy: { id: 'desc' }
      });

      const nextNumber = lastVoucher ? lastVoucher.id + 1 : 1;

      const prefixMap = {
        SALES_INVOICE: 'SI',
        PURCHASE_INVOICE: 'PI',
        PAYMENT: 'PV',
        RECEIPT: 'RV',
        JOURNAL: 'JV',
        DEBIT_NOTE: 'DN',
        CREDIT_NOTE: 'CN'
      };

      const voucherNumber =
        `${prefixMap[prismaVoucherType]}-${String(nextNumber).padStart(4, '0')}`;

      /* ---------- Create Voucher ---------- */
      const voucher = await tx.voucher.create({
        data: {
          companyId,
          voucherNumber,
          voucherType: prismaVoucherType,
          voucherDate: new Date(voucherDate),
          partyId,
          totalAmount: Number(totalAmount || 0),
          narration
        }
      });

      /* ---------- Save Items ---------- */
      if (items?.length) {
        for (const item of items) {
          await tx.voucherItem.create({
            data: {
              voucherId: voucher.id,
              itemId: Number(item.itemId),
              quantity: Number(item.quantity),
              rate: Number(item.rate),
              discount: Number(item.discount || 0),
              amount: Number(item.amount)
            }
          });
        }
      }

      /* ---------- Stock Movement ---------- */
      if (prismaVoucherType === 'SALES_INVOICE' && items?.length) {
        for (const item of items) {
          await tx.stockMovement.create({
            data: {
              companyId,
              voucherId: voucher.id,
              itemId: Number(item.itemId),
              quantityIn: 0,
              quantityOut: Number(item.quantity),
              rate: Number(item.rate),
              narration: `Sales Invoice ${voucherNumber}`
            }
          });
        }
      }

      /* ---------- Accounting Entries ---------- */

      // 🔵 SALES INVOICE
      if (prismaVoucherType === 'SALES_INVOICE') {

const cashLedger = await getOrCreateLedger(
  tx, companyId, 'Cash in Hand', 'CASH_IN_HAND', 'ASSET'
);

const salesLedger = await getOrCreateLedger(
  tx, companyId, 'Sales Account', 'SALES_ACCOUNTS', 'INCOME'
);





        if (!cashLedger || !salesLedger)
          throw new Error('Required ledgers missing');

        await tx.journalEntry.createMany({
          data: [
            {
              companyId,
              voucherId: voucher.id,
              ledgerId: cashLedger.id,
              debit: voucher.totalAmount,
              credit: 0,
              narration
            },
            {
              companyId,
              voucherId: voucher.id,
              ledgerId: salesLedger.id,
              debit: 0,
              credit: voucher.totalAmount,
              narration
            }
          ]
        });
      }

      // 🔵 PURCHASE INVOICE
      if (prismaVoucherType === 'PURCHASE_INVOICE') {

        const purchaseLedger = await getOrCreateLedger(
  tx, companyId, 'Purchase Account', 'PURCHASE_ACCOUNTS', 'EXPENSE'
);

const cashLedger = await getOrCreateLedger(
  tx, companyId, 'Cash in Hand', 'CASH_IN_HAND', 'ASSET'
);



      

        await tx.journalEntry.createMany({
          data: [
            {
              companyId,
              voucherId: voucher.id,
              ledgerId: purchaseLedger.id,
              debit: voucher.totalAmount,
              credit: 0,
              narration
            },
            {
              companyId,
              voucherId: voucher.id,
              ledgerId: cashLedger.id,
              debit: 0,
              credit: voucher.totalAmount,
              narration
            }
          ]
        });
      }

      // 🔵 MANUAL JOURNAL ENTRY
      if (prismaVoucherType === 'JOURNAL' && journalEntries?.length) {
        for (const entry of journalEntries) {
          await tx.journalEntry.create({
            data: {
              companyId,
              voucherId: voucher.id,
              ledgerId: entry.ledgerId,
              debit: Number(entry.debit || 0),
              credit: Number(entry.credit || 0),
              narration
            }
          });
        }
      }

      return voucher;
    });

    res.status(201).json({
      success: true,
      message: 'Voucher created successfully',
      data: result
    });

  } catch (err) {
    console.error(err);
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};



/*



exports.createVoucher = async (req, res) => {
  try {
    const {
      voucherNumber,
      voucherType,
      voucherDate,
      party,
      items,
      totalAmount,
      narration,
      journalEntries
    } = req.body;

    const companyId = req.user.companyId;
    const prismaVoucherType = VOUCHER_TYPE_MAP[voucherType];

    if (!prismaVoucherType) {
      return res.status(400).json({
        success: false,
        message: 'Invalid voucher type'
      });
    }

    const partyId = party ? parseInt(party) : null;

    const result = await prisma.$transaction(async (tx) => {

// Generate Voucher Number Automatically
const lastVoucher = await tx.voucher.findFirst({
  where: {
    companyId,
    voucherType: prismaVoucherType,
  },
  orderBy: { id: 'desc' },
});

const nextNumber = lastVoucher ? lastVoucher.id + 1 : 1;

const prefixMap = {
  SALES_INVOICE: 'SI',
  PURCHASE_INVOICE: 'PI',
  PAYMENT: 'PV',
  RECEIPT: 'RV',
  JOURNAL: 'JV',
  DEBIT_NOTE: 'DN',
  CREDIT_NOTE: 'CN',
};

const voucherNumber = `${prefixMap[prismaVoucherType]}-${String(nextNumber).padStart(4, '0')}`;


      
      // ⭐ CREATE VOUCHER
      const voucher = await tx.voucher.create({
        data: {
          companyId,
          voucherNumber,
          voucherType: prismaVoucherType,
          voucherDate: voucherDate ? new Date(voucherDate) : new Date(),
          partyId,
          totalAmount: Number(totalAmount || 0),
          narration
        },
      });

      // ⭐ SAVE ITEMS (Sales/Purchase)
      if (items?.length) {
        for (const item of items) {
          await tx.voucherItem.create({
            data: {
              voucherId: voucher.id,
              itemId: Number(item.itemId),
              quantity: Number(item.quantity),
              rate: Number(item.rate),
              discount: Number(item.discount || 0),
              amount: Number(item.amount),
            },
          });
        }
      }

      // ⭐ STOCK MOVEMENT
      if (prismaVoucherType === 'SALES_INVOICE' && items?.length) {
        for (const item of items) {
          await tx.stockMovement.create({
            data: {
              companyId,
              voucherId: voucher.id,
              itemId: Number(item.itemId),
              quantityIn: 0,
              quantityOut: Number(item.quantity),
              rate: Number(item.rate),
              narration: `Sales Invoice ${voucher.voucherNumber}`,
            },
          });
        }
      }


// ⭐ AUTO DOUBLE ENTRY ACCOUNTING
if (prismaVoucherType === 'PURCHASE_INVOICE') {

  const purchaseLedger = await tx.ledger.findFirst({
    where: { ledgerName: 'Purchase', companyId }
  });

  const cashLedger = await tx.ledger.findFirst({
    where: { ledgerName: 'Cash in Hand', companyId }
  });

  await tx.journalEntry.createMany({
    data: [
      {
        companyId,
        voucherId: voucher.id,
        ledgerId: purchaseLedger.id,
        debit: voucher.totalAmount,
        credit: 0,
        narration,
      },
      {
        companyId,
        voucherId: voucher.id,
        ledgerId: cashLedger.id,
        debit: 0,
        credit: voucher.totalAmount,
        narration,
      }
    ]
  });

}


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


// ⭐ AUTO DOUBLE ENTRY ACCOUNTING
if (prismaVoucherType === 'PURCHASE_INVOICE') {
  // 1️⃣ Fetch the Purchase ledger
  const purchaseLedger = await tx.ledger.findFirst({
    where: {
      ledgerName: "Purchase", // use correct field
      companyId: companyId,   // dynamic companyId instead of hardcoded 5
      isActive: true
    }
  });

  if (!purchaseLedger) {
    throw new Error("Purchase ledger not found for this company");
  }

  // 2️⃣ Ensure invoice/voucher data exists
  // Assuming your voucher data is in `req.body`
  const invoice = req.body;
  if (!invoice) {
    throw new Error("Invoice data is required");
  }

  // 3️⃣ Create journal entries for double entry
  await tx.journalEntry.createMany({
    data: [
      {
        ledgerId: purchaseLedger.id,    // Debit purchase ledger
        voucherId: createdVoucher.id,   // ID of voucher you just created
        debit: invoice.totalAmount,     // total invoice amount
        credit: 0,
        companyId: companyId,
        entryDate: invoice.voucherDate,
        narration: `Purchase Invoice #${invoice.voucherNumber}`,
        isReversed: false,
        createdAt: new Date(),
      },
      {
        ledgerId: invoice.partyId,      // Credit party ledger
        voucherId: createdVoucher.id,
        debit: 0,
        credit: invoice.totalAmount,
        companyId: companyId,
        entryDate: invoice.voucherDate,
        narration: `Purchase Invoice #${invoice.voucherNumber}`,
        isReversed: false,
        createdAt: new Date(),
      },
    ],
  });
}



      // ⭐ DOUBLE ENTRY ACCOUNTING (JOURNAL)
      //if (journalEntries?.length) {
        //for (const entry of journalEntries) {
         // await tx.journalEntry.create({
            //data: {
              //companyId,
              //voucherId: voucher.id,
             // ledgerId: entry.ledgerId,
             // debit: Number(entry.debit || 0),
            //  credit: Number(entry.credit || 0),
          //    narration,
        //    },
      //    });
    //    }
  //    }

      return voucher;
    });

    res.status(201).json({
      success: true,
      message: 'Voucher created successfully',
      data: result
    });

  } catch (err) {
    console.error(err);
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};





exports.createVoucher = async (req, res) => {
  try {
    const {
      voucherNumber,
      voucherType,
      voucherDate,
      party,
      items,
      paymentMode,
      subTotal,
      totalDiscount,
      totalTax,
      totalAmount,
      amountPaid,
      balanceAmount,
      narration,
      referenceNumber,
      dueDate,
      status,
    } = req.body;

    const companyId = req.user.companyId;

    const prismaVoucherType = VOUCHER_TYPE_MAP[voucherType];
    if (!prismaVoucherType) {
      return res.status(400).json({
        success: false,
        message: 'Invalid voucher type',
      });
    }

    const partyId =
      party && !isNaN(parseInt(party)) ? parseInt(party) : null;

    if (
      ITEM_BASED_VOUCHERS.includes(prismaVoucherType) &&
      (!items || items.length === 0)
    ) {
      return res.status(400).json({
        success: false,
        message: 'Items are required for this voucher type',
      });
    }

    const result = await prisma.$transaction(async (tx) => {
      /* -----------------------------
         1. CREATE VOUCHER
      ------------------------------ */
  /*    const voucher = await tx.voucher.create({
        data: {
          company: {
            connect: { id: companyId },
          },

          voucherNumber,
          voucherType: prismaVoucherType,
          voucherDate: new Date(voucherDate),

          // ✅ CORRECT PARTY HANDLING
          ...(partyId && {
            party: {
              connect: { id: partyId },
            },
          }),

          paymentMode: paymentMode || 'CASH',

          subTotal: parseFloat(subTotal) || 0,
          totalDiscount: parseFloat(totalDiscount) || 0,
          totalTax: parseFloat(totalTax) || 0,
          totalAmount: parseFloat(totalAmount) || 0,
          amountPaid: parseFloat(amountPaid) || 0,
          balanceAmount:
            parseFloat(balanceAmount) ??
            (parseFloat(totalAmount) || 0) -
              (parseFloat(amountPaid) || 0),

          narration: narration || null,
          referenceNumber: referenceNumber || null,
          dueDate: dueDate ? new Date(dueDate) : null,
        
        },
      });

      /* -----------------------------
         2. ITEMS + STOCK
      ------------------------------ */
/*      if (ITEM_BASED_VOUCHERS.includes(prismaVoucherType)) {
        for (const item of items) {
          await tx.voucherItem.create({
            data: {
              voucherId: voucher.id,
              itemId: parseInt(item.itemId),
              quantity: parseFloat(item.quantity),
              rate: parseFloat(item.rate),
              discount: parseFloat(item.discount) || 0,
              amount: parseFloat(item.amount),
            },
          });

          const stockItem = await tx.item.findUnique({
            where: { id: parseInt(item.itemId) },
          });

          let newStock = stockItem.currentStock;

          if (
            prismaVoucherType === 'SALES_INVOICE' ||
            prismaVoucherType === 'DEBIT_NOTE'
          ) {
            if (newStock < item.quantity) {
              throw new Error(`Insufficient stock for ${stockItem.itemName}`);
            }
            newStock -= item.quantity;
          }

          if (
            prismaVoucherType === 'PURCHASE_INVOICE' ||
            prismaVoucherType === 'CREDIT_NOTE'
          ) {
            newStock += item.quantity;
          }

          await tx.item.update({
            where: { id: stockItem.id },
            data: { currentStock: newStock },
          });
        }
      }

*/

      /* -----------------------------
         3. LEDGER UPDATE
      ------------------------------ */
  /*    if (partyId) {
        const ledger = await tx.ledger.findUnique({
          where: { id: partyId },
        });

        if (ledger) {
          let newBalance = ledger.currentBalance;

          if (
            prismaVoucherType === 'SALES_INVOICE' ||
            prismaVoucherType === 'DEBIT_NOTE'
          ) {
            newBalance += parseFloat(totalAmount);
          }

          if (
            prismaVoucherType === 'PURCHASE_INVOICE' ||
            prismaVoucherType === 'CREDIT_NOTE'
          ) {
            newBalance += parseFloat(totalAmount);
          }

          if (prismaVoucherType === 'PAYMENT') {
            newBalance -= parseFloat(totalAmount);
          }

          if (prismaVoucherType === 'RECEIPT') {
            newBalance -= parseFloat(totalAmount);
          }

          await tx.ledger.update({
            where: { id: partyId },
            data: { currentBalance: newBalance },
          });
        }
      }

      return tx.voucher.findUnique({
        where: { id: voucher.id },
        include: {
          company: { select: { id: true, name: true } },
          party: { select: { id: true, ledgerName: true } },
          items: {
            include: {
              item: { select: { id: true, itemName: true } },
            },
          },
        },
      });
    });

    res.status(201).json({
      success: true,
      message: 'Voucher created successfully',
      data: result,
    });
  } catch (error) {
    console.error('Create voucher error:', error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
*/
// Get all Vouchers by Company
exports.getAllVouchers = async (req, res) => {
  try {
    const companyId = req.user.companyId; // From JWT token
    const { type, status, startDate, endDate } = req.query;

    const whereClause = {
      companyId: companyId,
      isActive: true,
    };

    if (type) whereClause.voucherType = type;
    if (status) whereClause.status = status;
    if (startDate && endDate) {
      whereClause.voucherDate = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    const vouchers = await prisma.voucher.findMany({
      where: whereClause,
      include: {
        company: { select: { id: true, name: true } },
        party: { select: { id: true, ledgerName: true } },
        items: {
          include: {
            item: { select: { id: true, itemName: true, itemCode: true } },
          },
        },
      },
      orderBy: { voucherDate: 'desc' },
    });

    res.status(200).json({
      success: true,
      count: vouchers.length,
      data: vouchers,
    });
  } catch (error) {
    console.error('Get vouchers error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get Voucher by ID
exports.getVoucherById = async (req, res) => {
  try {
    const companyId = req.user.companyId; // From JWT token

    const voucher = await prisma.voucher.findFirst({
      where: { 
        id: parseInt(req.params.id),
        companyId: companyId // Security: only own company's vouchers
      },
      include: {
        company: { select: { id: true, name: true } },
        party: {
          select: {
            id: true,
            ledgerName: true,
            phone: true,
            email: true,
            address: true,
            gstNumber: true,
          },
        },
        items: {
          include: {
            item: {
              select: {
                id: true,
                itemName: true,
                itemCode: true,
                unit: true,
                hsnCode: true,
              },
            },
          },
        },
      },
    });

    if (!voucher) {
      return res.status(404).json({
        success: false,
        message: 'Voucher not found',
      });
    }

    res.status(200).json({
      success: true,
      data: voucher,
    });
  } catch (error) {
    console.error('Get voucher error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update Voucher
exports.updateVoucher = async (req, res) => {
  try {
    const companyId = req.user.companyId; // From JWT token
    const voucherId = parseInt(req.params.id);

    // Verify voucher belongs to user's company
    const existingVoucher = await prisma.voucher.findFirst({
      where: {
        id: voucherId,
        companyId: companyId
      }
    });

    if (!existingVoucher) {
      return res.status(404).json({
        success: false,
        message: 'Voucher not found'
      });
    }

    const updateData = { ...req.body };
    
    // Convert fields
    if (updateData.partyId) updateData.partyId = parseInt(updateData.partyId);
    if (updateData.subTotal) updateData.subTotal = parseFloat(updateData.subTotal);
    if (updateData.totalDiscount) updateData.totalDiscount = parseFloat(updateData.totalDiscount);
    if (updateData.totalTax) updateData.totalTax = parseFloat(updateData.totalTax);
    if (updateData.totalAmount) updateData.totalAmount = parseFloat(updateData.totalAmount);
    if (updateData.amountPaid) updateData.amountPaid = parseFloat(updateData.amountPaid);
    if (updateData.balanceAmount) updateData.balanceAmount = parseFloat(updateData.balanceAmount);
    if (updateData.voucherDate) updateData.voucherDate = new Date(updateData.voucherDate);
    if (updateData.dueDate) updateData.dueDate = new Date(updateData.dueDate);
    
    // Remove fields that shouldn't be updated
    delete updateData.id;
    delete updateData.companyId;
    delete updateData.createdAt;
    delete updateData.updatedAt;
    delete updateData.items;

    const voucher = await prisma.voucher.update({
      where: { id: voucherId },
      data: updateData,
      include: {
        company: { select: { id: true, name: true } },
        party: { select: { id: true, ledgerName: true } },
        items: {
          include: {
            item: { select: { id: true, itemName: true, itemCode: true } },
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      message: 'Voucher updated successfully',
      data: voucher,
    });
  } catch (error) {
    console.error('Update voucher error:', error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete Voucher (Soft Delete with Stock Reversal)
exports.deleteVoucher = async (req, res) => {
  try {
    const companyId = req.user.companyId; // From JWT token
    const voucherId = parseInt(req.params.id);

    await prisma.$transaction(async (tx) => {
      const voucher = await tx.voucher.findFirst({
        where: { 
          id: voucherId,
          companyId: companyId
        },
        include: { items: true },
      });

      if (!voucher) {
        throw new Error('Voucher not found');
      }

      // Reverse stock changes
      for (const voucherItem of voucher.items) {
        const item = await tx.item.findUnique({
          where: { id: voucherItem.itemId },
        });

        if (!item) continue;

        let newStock = item.currentStock;

        if (voucher.voucherType === 'SALES_INVOICE' || voucher.voucherType === 'DEBIT_NOTE') {
          // Restore stock (add back)
          newStock += voucherItem.quantity;
        } else if (voucher.voucherType === 'PURCHASE_INVOICE' || voucher.voucherType === 'CREDIT_NOTE') {
          // Remove stock (deduct)
          newStock -= voucherItem.quantity;
        }

        await tx.item.update({
          where: { id: voucherItem.itemId },
          data: { currentStock: newStock },
        });
      }

      // Reverse ledger balance (only if party exists)
      if (voucher.partyId) {
        const partyLedger = await tx.ledger.findUnique({
          where: { id: voucher.partyId },
        });

        if (partyLedger) {
          let newBalance = partyLedger.currentBalance;

          if (voucher.voucherType === 'SALES_INVOICE' || voucher.voucherType === 'DEBIT_NOTE') {
            newBalance -= voucher.totalAmount;
          } else if (voucher.voucherType === 'PURCHASE_INVOICE' || voucher.voucherType === 'CREDIT_NOTE') {
            newBalance -= voucher.totalAmount;
          } else if (voucher.voucherType === 'PAYMENT') {
            newBalance += voucher.totalAmount;
          } else if (voucher.voucherType === 'RECEIPT') {
            newBalance += voucher.totalAmount;
          }

          await tx.ledger.update({
            where: { id: voucher.partyId },
            data: { currentBalance: newBalance },
          });
        }
      }

      // Soft delete the voucher
      await tx.voucher.update({
        where: { id: voucherId },
        data: {
          isActive: false,
          status: 'CANCELLED',
        },
      });
    });

    res.status(200).json({
      success: true,
      message: 'Voucher deleted successfully',
    });
  } catch (error) {
    console.error('Delete voucher error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update Payment Status
exports.updatePaymentStatus = async (req, res) => {
  try {
    const companyId = req.user.companyId; // From JWT token
    const voucherId = parseInt(req.params.id);
    const { amountPaid: additionalPayment } = req.body;

    const voucher = await prisma.voucher.findFirst({
      where: { 
        id: voucherId,
        companyId: companyId
      },
    });

    if (!voucher) {
      return res.status(404).json({
        success: false,
        message: 'Voucher not found',
      });
    }

    const newAmountPaid = voucher.amountPaid + parseFloat(additionalPayment);
    const newBalanceAmount = voucher.totalAmount - newAmountPaid;

    let newStatus = voucher.status;
    if (newBalanceAmount === 0) {
      newStatus = 'PAID';
    } else if (newAmountPaid > 0 && newBalanceAmount > 0) {
      newStatus = 'PARTIALLY_PAID';
    }

    const updatedVoucher = await prisma.voucher.update({
      where: { id: voucherId },
      data: {
        amountPaid: newAmountPaid,
        balanceAmount: newBalanceAmount,
        status: newStatus,
      },
    });

    res.status(200).json({
      success: true,
      message: 'Payment status updated successfully',
      data: updatedVoucher,
    });
  } catch (error) {
    console.error('Update payment error:', error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Get Voucher Summary/Dashboard
exports.getVoucherSummary = async (req, res) => {
  try {
    const companyId = req.user.companyId; // From JWT token

    const summary = await prisma.voucher.groupBy({
      by: ['voucherType'],
      where: {
        companyId: companyId,
        isActive: true,
      },
      _sum: {
        totalAmount: true,
      },
      _count: {
        id: true,
      },
    });

    res.status(200).json({
      success: true,
      data: summary,
    });
  } catch (error) {
    console.error('Get voucher summary error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};