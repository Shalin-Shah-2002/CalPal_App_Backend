import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import nutritionRoutes from './routes/nutrition.routes.js';
import saveNutritionRoutes from './routes/saveNutrition.routes.js';
import authRoutes from './routes/auth.routes.js';
import { testConnection } from './config/database.js';
import { initializeDatabase } from './config/initDb.js';

// --- Configuration ---
dotenv.config();
const app = express();
const port = process.env.PORT || 3000;

// --- Middleware ---
app.use(express.json()); 

// Enhanced CORS configuration for Flutter app
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*', // Configure specific Flutter app origin in production
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400, // 24 hours
}));// --- Routes ---
app.use('/auth', authRoutes);                // Authentication routes
app.use('/nutrition', nutritionRoutes);      // Nutrition API routes
app.use('/save', saveNutritionRoutes);       // Save nutrition routes

// --- Health Check Route ---
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// --- 404 Handler ---
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`,
  });
});

// --- Error Handler ---
app.use((err, req, res, next) => {
  console.error('❌ Unhandled error:', err);
  res.status(err.status || 500).json({
    success: false,
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
  });
});

// --- Start Server ---
app.listen(port, async () => {
  console.log(`Node.js server running on http://localhost:${port}`);
  console.log('CORS is enabled for all origins.');
  
  await testConnection();
  await initializeDatabase();
});
