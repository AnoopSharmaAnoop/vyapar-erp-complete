const express = require('express');
const router = express.Router();
const ledgerController = require('../controllers/ledgerController');
const { authenticate, authorizeCompany } = require('../middleware/auth');

// Ledger routes (SECURED)
router.post('/', authenticate, ledgerController.createLedger);



router.get('/', authenticate, ledgerController.getAllLedgers);


router.get(
  '/',
  authenticate,
  authorizeCompany,
  ledgerController.getAllLedgers
);

router.get('/groups', authenticate, ledgerController.getLedgerGroups);

router.get('/:id', authenticate, ledgerController.getLedgerById);

router.put('/:id', authenticate, ledgerController.updateLedger);

//router.put('/:id/balance', authenticate, ledgerController.updateBalance);

router.delete('/:id', authenticate, ledgerController.deleteLedger);

module.exports = router;
