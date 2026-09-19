const mongoose = require('mongoose');

const receiptSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  imagePath: {
    type: String,
    required: true       // file path where image is saved
  },
  rawText: {
    type: String         // raw text extracted by Tesseract OCR
  },
  extractedData: {
    merchant: String,
    date: Date,
    amount: Number,
    category: String,
    items: [String]      // list of items on the receipt
  },
  status: {
    type: String,
    enum: ['pending', 'processed', 'failed'],
    default: 'pending'
  }
}, { timestamps: true });

module.exports = mongoose.model('Receipt', receiptSchema);