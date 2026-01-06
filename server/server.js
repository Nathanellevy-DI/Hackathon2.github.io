const express = require('express');
const cors = require('cors');
const path = require('path');

// Import routes
const workoutsRouter = require('./routes/workouts');
const goalsRouter = require('./routes/goals');

// Import database setup
const { initializeDatabase } = require('./models/database');

const app = express();
const PORT = process.env.PORT || 5000;

// ============================================
// MIDDLEWARE
// ============================================

// Enable CORS for React frontend
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true
}));

// Parse JSON bodies
app.use(express.json());

// Request logging (development)
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// ============================================
// ROUTES
// ============================================

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/workouts', workoutsRouter);
app.use('/api/goals', goalsRouter);

// ============================================
// ERROR HANDLING
// ============================================

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Not found' });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// ============================================
// START SERVER
// ============================================

// Initialize database and start server
initializeDatabase()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`
╔═══════════════════════════════════════════════╗
║                                               ║
║   🏋️  FitTrack Backend Server                  ║
║                                               ║
║   Server running on: http://localhost:${PORT}    ║
║                                               ║
║   Endpoints:                                  ║
║   - GET  /api/health                          ║
║   - GET  /api/workouts                        ║
║   - POST /api/workouts                        ║
║   - DELETE /api/workouts/:id                  ║
║   - GET  /api/goals                           ║
║   - POST /api/goals                           ║
║   - PUT  /api/goals/:id                       ║
║   - DELETE /api/goals/:id                     ║
║                                               ║
╚═══════════════════════════════════════════════╝
      `);
        });
    })
    .catch(err => {
        console.error('Failed to initialize database:', err);
        process.exit(1);
    });

module.exports = app;
