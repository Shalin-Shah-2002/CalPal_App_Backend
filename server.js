import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import nutritionRoutes from './routes/nutrition.routes.js';
import saveNutritionRoutes from './routes/saveNutrition.routes.js';
import { testConnection } from './config/database.js';
import { initializeDatabase } from './config/initDb.js';

// --- Configuration ---
dotenv.config();
const app = express();
const port = process.env.PORT || 3000;

// --- Middleware ---
// const geminiApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${geminiApiKey}`;

// --- System Prompt ---
// This is the prompt you provided, defining the AI's role and JSON structure.
// systemPrompt removed — unused

// --- Middleware ---   
app.use(express.json()); 
app.use(cors()); 

// --- Routes ---
app.use('/nutrition', nutritionRoutes);       
app.use('/save', saveNutritionRoutes);       

// --- Health Check Route ---
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// --- Start Server ---
app.listen(port, async () => {
  console.log(`✅ Node.js server running on http://localhost:${port}`);
  console.log('CORS is enabled for all origins.');
  
  // Test database connection on server start
  await testConnection();
  
  // Initialize database tables
  await initializeDatabase();
});
