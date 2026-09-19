const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config({ quiet: true });

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Routes
const authRoutes = require('./routes/authRoutes');
const receiptRoutes = require('./routes/receiptRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const budgetRoutes = require('./routes/budgetRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/receipts', receiptRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/budgets', budgetRoutes);

// Test Route
app.get('/', (req, res) => {
  res.send('Smart Expense Tracker API is running!');
});

// Server Port
const PORT = process.env.PORT || 5000;

// Debug: Check if .env is loading
console.log('==================================================');
console.log('ENV CHECK');
console.log('PORT =', process.env.PORT);
console.log('MONGO_URI =', process.env.MONGO_URI);
console.log('==================================================');

// Connect MongoDB
mongoose.connect(process.env.MONGO_URI, {
  serverSelectionTimeoutMS: 30000
})
  .then((conn) => {
    console.log('==================================================');
    console.log('🎉 SUCCESS: MongoDB Atlas Connected Successfully!');
    console.log(`📡 Host: ${conn.connection.host}`);
    console.log(`📁 Database: ${conn.connection.name}`);
    console.log('==================================================');

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.log('==================================================');
    console.log('❌ FULL MONGODB ERROR');
    console.log('==================================================');
    console.error(err);
    console.log('==================================================');
  });