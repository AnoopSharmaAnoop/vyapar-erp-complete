const express = require('express');
const router = express.Router();

const { authenticate } = require('../middleware/auth');
const itemController = require('../controllers/itemController');

// Create item
router.post('/', authenticate, itemController.createItem);

// Get all items
router.get('/', authenticate, itemController.getAllItems);

// Get low stock items
router.get('/low-stock', authenticate, itemController.getLowStockItems);

// Get item by ID
router.get('/:id', authenticate, itemController.getItemById);

// Update item
router.put('/:id', authenticate, itemController.updateItem);

// Update stock
router.put('/:id/stock', authenticate, itemController.updateStock);

// Delete item
router.delete('/:id', authenticate, itemController.deleteItem);

module.exports = router;
