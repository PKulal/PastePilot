const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const { connectDB } = require('./config/db');
const { startViewFlushJob } = require('./jobs/viewFlush');
const { getActiveAnnouncements } = require('./controllers/adminController');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to PostgreSQL and Redis
connectDB();

// Middleware
app.use(express.json({ limit: '2mb' }));
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/pastes', require('./routes/pasteRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

// Public announcements
app.get('/api/announcements', getActiveAnnouncements);

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong on the server', error: err.message });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    startViewFlushJob(30000); // PRD Redis F2: periodic view-count flush
  });
}

module.exports = { app };
