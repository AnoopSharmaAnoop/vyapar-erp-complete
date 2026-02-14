require('dotenv').config();
const express = require('express');
const cors = require('cors');
const prisma = require('./config/prisma');

// Import routes
const authRoutes = require('./routes/authRoutes');
const companyRoutes = require('./routes/companyRoutes');
const itemRoutes = require('./routes/itemRoutes');
const ledgerRoutes = require('./routes/ledgerRoutes');
const voucherRoutes = require('./routes/voucherRoutes');
const reportRoutes = require('./routes/reportRoutes');
const openingBalanceRoutes = require('./routes/openingBalanceRoutes');



const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
}

// API Routes - MAKE SURE THIS IS CORRECT
app.use('/api/auth', authRoutes);  // ← THIS IS IMPORTANT!
app.use('/api/companies', companyRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/ledgers', ledgerRoutes);
app.use('/api/vouchers', voucherRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/opening-balance', openingBalanceRoutes);
//app.use('/api/opening-balance', require('./routes/openingBalanceRoutes'));


// Health check
app.get('/api/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({ 
      success: true, 
      message: 'VyaparERP API is running',
      database: 'PostgreSQL connected'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Database connection failed',
      error: error.message
    });
  }
});

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'VyaparERP API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      companies: '/api/companies',
      items: '/api/items',
      ledgers: '/api/ledgers',
      vouchers: '/api/vouchers',
      reports: '/api/reports'
    }
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log('=================================');
  console.log(`Server running on port ${PORT}`);
  console.log(`Database: PostgreSQL with Prisma`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('=================================');
});

process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

module.exports = app;