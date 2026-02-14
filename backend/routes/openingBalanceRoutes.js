const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const openingBalanceController = require('../controllers/openingBalanceController');

router.post(
  '/',
  authenticate,
  openingBalanceController.createOpeningBalance
);

module.exports = router;
