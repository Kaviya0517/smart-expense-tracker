const Receipt = require('../models/receipt');
const Expense = require('../models/expense');
const Tesseract = require('tesseract.js');
const { parseReceiptWithRegex } = require('../services/parseService');

const uploadReceipt = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const imagePath = req.file.path;

    const receipt = await Receipt.create({
      user: req.user.id,
      imagePath,
      status: 'pending'
    });

    // Step 1 — Run OCR with English + Tamil
    console.log('Running OCR (eng+tam)...');
    let extractedText = '';

    try {
      const { data: { text } } = await Tesseract.recognize(
        imagePath,
        'eng+tam',
        {
          logger: m => {
            if (m.status === 'recognizing text') {
              process.stdout.write(`\rOCR Progress: ${Math.round(m.progress * 100)}%`);
            }
          }
        }
      );
      extractedText = text;
      console.log('\nOCR (eng+tam) done!');
    } catch (tamilError) {
      console.log('\nTamil OCR failed, falling back to English only...');
      const { data: { text } } = await Tesseract.recognize(
        imagePath,
        'eng',
        {
          logger: m => {
            if (m.status === 'recognizing text') {
              process.stdout.write(`\rOCR Progress: ${Math.round(m.progress * 100)}%`);
            }
          }
        }
      );
      extractedText = text;
      console.log('\nOCR (eng) done!');
    }

    // Step 2 — Parse extracted text
    console.log('Parsing receipt data...');
   console.log("========== OCR TEXT ==========");
console.log(extractedText);
console.log("==============================");
   
    const extractedData = parseReceiptWithRegex(extractedText);

    // Step 3 — Update receipt in DB
    receipt.rawText = extractedText;
    receipt.extractedData = extractedData;
    receipt.status = 'processed';
    await receipt.save();

    // Step 4 — Create Expense automatically
    const expense = await Expense.create({
      user: req.user.id,
      merchant: extractedData.merchant || 'Unknown Store',
      amount: extractedData.amount || 0,
      category: extractedData.category || 'Other',
      date: extractedData.date ? new Date(extractedData.date) : new Date(),
      description: extractedData.items
        ? extractedData.items.filter(i => i !== 'Items not extracted').join(', ')
        : '',
      receipt: receipt._id,
      isManual: false
    });

    res.status(200).json({
      message: 'Receipt processed successfully',
      receipt: {
        id: receipt._id,
        rawText: extractedText,
        extractedData
      },
      expense: {
        id: expense._id,
        merchant: expense.merchant,
        amount: expense.amount,
        category: expense.category,
        date: expense.date
      }
    });

  } catch (error) {
    console.error('Receipt processing error:', error);
    res.status(500).json({ message: 'Processing failed', error: error.message });
  }
};

const getReceipts = async (req, res) => {
  try {
    const receipts = await Receipt.find({ user: req.user.id })
      .sort({ createdAt: -1 });
    res.status(200).json(receipts);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getReceiptById = async (req, res) => {
  try {
    const receipt = await Receipt.findById(req.params.id);
    if (!receipt) return res.status(404).json({ message: 'Receipt not found' });
    if (receipt.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    res.status(200).json(receipt);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { uploadReceipt, getReceipts, getReceiptById };