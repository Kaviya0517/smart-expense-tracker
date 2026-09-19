const express = require('express');
const router = express.Router();
const { uploadReceipt, getReceipts, getReceiptById } = require('../controllers/receiptController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// All routes are protected (need JWT token)
router.post('/upload', protect, upload.single('receipt'), uploadReceipt);
router.get('/', protect, getReceipts);
router.get('/:id', protect, getReceiptById);

module.exports = router;