const express = require('express');
const router = express.Router();
const reportsController = require('../controllers/reportsController');
const { authenticate } = require('../middleware/auth');

// All report routes require authentication
router.get('/trial-balance', authenticate, reportsController.getTrialBalance);
router.get('/profit-loss', authenticate, reportsController.getProfitLoss);
router.get('/balance-sheet', authenticate, reportsController.getBalanceSheet);
router.get('/ledger', authenticate, reportsController.getLedgerReport);
router.get('/gstr1', authenticate, reportsController.getGSTR1);

module.exports = router;


