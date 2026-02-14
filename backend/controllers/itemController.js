const prisma = require('../config/prisma');

/*
|--------------------------------------------------------------------------
| CREATE ITEM
| Company is taken ONLY from JWT (secure)
|--------------------------------------------------------------------------
*/
exports.createItem = async (req, res) => {
  try {
    // 🔁 Normalize CATEGORY enum
    const categoryMap = {
      product: 'PRODUCT',
      service: 'SERVICE',
      raw_material: 'RAW_MATERIAL',
    };

    const category =
      categoryMap[String(req.body.category || '').toLowerCase()] || 'PRODUCT';

    // 🔁 Normalize UNIT enum
    const unitMap = {
      pcs: 'PCS',
      piece: 'PCS',
      nos: 'NOS',
      kg: 'KG',
      kgs: 'KG',
      ltr: 'LTR',
      liter: 'LTR',
      box: 'BOX',
      pack: 'BOX',
    };

    const unit =
      unitMap[String(req.body.unit || '').toLowerCase()] || 'PCS';

    const item = await prisma.item.create({
      data: {
        companyId: req.user.companyId, // 🔐 from JWT
        itemCode: req.body.itemCode,
        itemName: req.body.itemName,
        category, // ✅ enum-safe
        unit,     // ✅ enum-safe
        description: req.body.description,
        hsnCode: req.body.hsnCode,
        openingStock: Number(req.body.openingStock) || 0,
        currentStock: Number(req.body.openingStock) || 0,
        minStockLevel: Number(req.body.minStockLevel) || 0,
        purchasePrice: Number(req.body.purchasePrice) || 0,
        sellingPrice: Number(req.body.sellingPrice) || 0,
        mrp: req.body.mrp ? Number(req.body.mrp) : null,
        gstRate: Number(req.body.gstRate) || 0,
        taxType: req.body.taxType || 'NONE',
        isActive: true,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Item created successfully',
      data: item,
    });
  } catch (error) {
  console.error('Create item error:', error);

  // 🔐 Duplicate itemCode protection
  if (error.code === 'P2002') {
    return res.status(400).json({
      success: false,
      message: 'Item Code already exists for this company',
    });
  }

  return res.status(500).json({
    success: false,
    message: 'Failed to create item',
  });
}

};

/*
|--------------------------------------------------------------------------
| GET ALL ITEMS (company scoped)
|--------------------------------------------------------------------------
*/
exports.getAllItems = async (req, res) => {
  try {
    const items = await prisma.item.findMany({
      where: {
        companyId: req.user.companyId,
        isActive: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({
      success: true,
      count: items.length,
      data: items,
    });
  } catch (error) {
    console.error('Get items error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/*
|--------------------------------------------------------------------------
| GET ITEM BY ID (company protected)
|--------------------------------------------------------------------------
*/
exports.getItemById = async (req, res) => {
  try {
    const item = await prisma.item.findFirst({
      where: {
        id: Number(req.params.id),
        companyId: req.user.companyId,
        isActive: true,
      },
    });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found or access denied',
      });
    }

    res.status(200).json({
      success: true,
      data: item,
    });
  } catch (error) {
    console.error('Get item error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/*
|--------------------------------------------------------------------------
| UPDATE ITEM (company protected)
|--------------------------------------------------------------------------
*/
exports.updateItem = async (req, res) => {
  try {
    const existingItem = await prisma.item.findFirst({
      where: {
        id: Number(req.params.id),
        companyId: req.user.companyId,
      },
    });

    if (!existingItem) {
      return res.status(404).json({
        success: false,
        message: 'Item not found or access denied',
      });
    }

    const data = { ...req.body };

    // Convert numeric fields safely
    const numericFields = [
      'openingStock',
      'currentStock',
      'minStockLevel',
      'purchasePrice',
      'sellingPrice',
      'mrp',
      'gstRate',
    ];

    numericFields.forEach((field) => {
      if (data[field] !== undefined) {
        data[field] = Number(data[field]);
      }
    });

    // 🔐 Never allow these to be updated
    delete data.id;
    delete data.companyId;
    delete data.createdAt;
    delete data.updatedAt;

    const updatedItem = await prisma.item.update({
      where: { id: Number(req.params.id) },
      data,
    });

    res.status(200).json({
      success: true,
      message: 'Item updated successfully',
      data: updatedItem,
    });
  } catch (error) {
    console.error('Update item error:', error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/*
|--------------------------------------------------------------------------
| SOFT DELETE ITEM (company protected)
|--------------------------------------------------------------------------
*/
exports.deleteItem = async (req, res) => {
  try {
    const existingItem = await prisma.item.findFirst({
      where: {
        id: Number(req.params.id),
        companyId: req.user.companyId,
      },
    });

    if (!existingItem) {
      return res.status(404).json({
        success: false,
        message: 'Item not found or access denied',
      });
    }

    await prisma.item.update({
      where: { id: Number(req.params.id) },
      data: { isActive: false },
    });

    res.status(200).json({
      success: true,
      message: 'Item deleted successfully',
    });
  } catch (error) {
    console.error('Delete item error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/*
|--------------------------------------------------------------------------
| UPDATE STOCK (safe + validated)
|--------------------------------------------------------------------------
*/
exports.updateStock = async (req, res) => {
  try {
    const { quantity, type } = req.body;

    const item = await prisma.item.findFirst({
      where: {
        id: Number(req.params.id),
        companyId: req.user.companyId,
        isActive: true,
      },
    });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found or access denied',
      });
    }

    const qty = Number(quantity);
    if (qty <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be greater than zero',
      });
    }

    let newStock = item.currentStock;

    if (type === 'add') {
      newStock += qty;
    } else if (type === 'remove') {
      if (item.currentStock < qty) {
        return res.status(400).json({
          success: false,
          message: 'Insufficient stock',
        });
      }
      newStock -= qty;
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid stock operation',
      });
    }

    const updatedItem = await prisma.item.update({
      where: { id: item.id },
      data: { currentStock: newStock },
    });

    res.status(200).json({
      success: true,
      message: 'Stock updated successfully',
      data: updatedItem,
    });
  } catch (error) {
    console.error('Update stock error:', error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/*
|--------------------------------------------------------------------------
| GET LOW STOCK ITEMS (BEST VERSION)
|--------------------------------------------------------------------------
*/
exports.getLowStockItems = async (req, res) => {
  try {
    const items = await prisma.item.findMany({
      where: {
        companyId: req.user.companyId,
        isActive: true,
        currentStock: {
          lte: prisma.item.fields.minStockLevel,
        },
      },
      orderBy: {
        currentStock: 'asc',
      },
    });

    res.status(200).json({
      success: true,
      count: items.length,
      data: items,
    });
  } catch (error) {
    console.error('Low stock error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch low stock items',
    });
  }
};
