const prisma = require('../config/prisma');

// ✅ SECURE: Create Item - CompanyId from JWT token ONLY
exports.createItem = async (req, res) => {
  try {
    const item = await prisma.item.create({
      data: {
        companyId: req.user.companyId, // ✅ From JWT token, NOT from request body
        itemCode: req.body.itemCode,
        itemName: req.body.itemName,
        category: req.body.category,
        description: req.body.description,
        unit: req.body.unit,
        hsnCode: req.body.hsnCode,
        openingStock: parseFloat(req.body.openingStock) || 0,
        currentStock: parseFloat(req.body.openingStock) || 0,
        minStockLevel: parseFloat(req.body.minStockLevel) || 0,
        purchasePrice: parseFloat(req.body.purchasePrice) || 0,
        sellingPrice: parseFloat(req.body.sellingPrice) || 0,
        mrp: req.body.mrp ? parseFloat(req.body.mrp) : null,
        gstRate: parseFloat(req.body.gstRate) || 0,
        taxType: req.body.taxType || 'NONE',
      },
      include: {
        company: {
          select: { id: true, name: true },
        },
      },
    });

    res.status(201).json({
      success: true,
      message: 'Item created successfully',
      data: item,
    });
  } catch (error) {
    console.error('Create item error:', error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// ✅ SECURE: Get all Items - Only for user's company
exports.getAllItems = async (req, res) => {
  try {
    const items = await prisma.item.findMany({
      where: {
        companyId: req.user.companyId, // ✅ From JWT token
        isActive: true,
      },
      include: {
        company: {
          select: { id: true, name: true },
        },
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

// ✅ SECURE: Get Item by ID - Only if belongs to user's company
exports.getItemById = async (req, res) => {
  try {
    const item = await prisma.item.findFirst({
      where: {
        id: parseInt(req.params.id),
        companyId: req.user.companyId, // ✅ Security check
      },
      include: {
        company: {
          select: { id: true, name: true },
        },
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

// ✅ SECURE: Update Item - Only if belongs to user's company
exports.updateItem = async (req, res) => {
  try {
    // First verify item belongs to user's company
    const existingItem = await prisma.item.findFirst({
      where: {
        id: parseInt(req.params.id),
        companyId: req.user.companyId, // ✅ Security check
      },
    });

    if (!existingItem) {
      return res.status(404).json({
        success: false,
        message: 'Item not found or access denied',
      });
    }

    const updateData = { ...req.body };
    
    // Convert numeric fields
    if (updateData.openingStock) updateData.openingStock = parseFloat(updateData.openingStock);
    if (updateData.currentStock) updateData.currentStock = parseFloat(updateData.currentStock);
    if (updateData.minStockLevel) updateData.minStockLevel = parseFloat(updateData.minStockLevel);
    if (updateData.purchasePrice) updateData.purchasePrice = parseFloat(updateData.purchasePrice);
    if (updateData.sellingPrice) updateData.sellingPrice = parseFloat(updateData.sellingPrice);
    if (updateData.mrp) updateData.mrp = parseFloat(updateData.mrp);
    if (updateData.gstRate) updateData.gstRate = parseFloat(updateData.gstRate);
    
    // Remove fields that shouldn't be updated
    delete updateData.id;
    delete updateData.companyId; // ✅ Prevent changing company
    delete updateData.createdAt;
    delete updateData.updatedAt;

    const item = await prisma.item.update({
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
      message: 'Item updated successfully',
      data: item,
    });
  } catch (error) {
    console.error('Update item error:', error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// ✅ SECURE: Delete Item - Only if belongs to user's company
exports.deleteItem = async (req, res) => {
  try {
    // Verify item belongs to user's company
    const existingItem = await prisma.item.findFirst({
      where: {
        id: parseInt(req.params.id),
        companyId: req.user.companyId, // ✅ Security check
      },
    });

    if (!existingItem) {
      return res.status(404).json({
        success: false,
        message: 'Item not found or access denied',
      });
    }

    await prisma.item.update({
      where: { id: parseInt(req.params.id) },
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

// ✅ SECURE: Update Stock - Only if belongs to user's company
exports.updateStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity, type } = req.body;

    const item = await prisma.item.findFirst({
      where: {
        id: parseInt(id),
        companyId: req.user.companyId, // ✅ Security check
      },
    });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found or access denied',
      });
    }

    let newStock = item.currentStock;

    if (type === 'add') {
      newStock += parseFloat(quantity);
    } else if (type === 'remove') {
      if (item.currentStock < parseFloat(quantity)) {
        return res.status(400).json({
          success: false,
          message: 'Insufficient stock',
        });
      }
      newStock -= parseFloat(quantity);
    }

    const updatedItem = await prisma.item.update({
      where: { id: parseInt(id) },
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

// ✅ SECURE: Get Low Stock Items - Only for user's company
exports.getLowStockItems = async (req, res) => {
  try {
    const items = await prisma.$queryRaw`
      SELECT * FROM items 
      WHERE company_id = ${req.user.companyId}
      AND is_active = true 
      AND current_stock <= min_stock_level
      ORDER BY current_stock ASC
    `;

    res.status(200).json({
      success: true,
      count: items.length,
      data: items,
    });
  } catch (error) {
    console.error('Get low stock items error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
