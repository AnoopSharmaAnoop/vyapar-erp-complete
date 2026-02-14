const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const voucherController = require('../controllers/voucherController');

router.post('/', authenticate, voucherController.createVoucher);
router.get('/company/:companyId', authenticate, voucherController.getAllVouchers);
router.get('/summary/:companyId', authenticate, voucherController.getVoucherSummary);
router.get('/:id', authenticate, voucherController.getVoucherById);
router.put('/:id', authenticate, voucherController.updateVoucher);
router.put('/:id/payment', authenticate, voucherController.updatePaymentStatus);
router.delete('/:id', authenticate, voucherController.deleteVoucher);

module.exports = router;
