import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import nutritionRoutes from './routes/nutrition.routes.js';

// --- Configuration ---
dotenv.config();
const app = express();
const port = process.env.PORT || 3000;

// --- Middleware ---
// const geminiApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${geminiApiKey}`;

// --- System Prompt ---
// This is the prompt you provided, defining the AI's role and JSON structure.
const systemPrompt = `
You are a nutrition data generator AI.  
When a user gives you any food name or food with quantity (e.g., "2 boiled eggs" or "banana 100g"), respond only in valid JSON format containing detailed nutritional information.  

If no weight is mentioned, assume 100 grams as the default serving size.  

Your JSON must follow this structure:

{
 "food_name": "string",
 "serving_size": "number (in grams)",
 "calories": "number (in kcal)",
 "macronutrients": {
   "protein_g": "number",
   "carbohydrates_g": "number",
   "fats_g": "number",
   "fiber_g": "number",
   "sugars_g": "number"
 },
 "micronutrients": {
   "sodium_mg": "number",
   "potassium_mg": "number",
   "calcium_mg": "number",
   "iron_mg": "number",
   "vitamin_c_mg": "number",
   "vitamin_d_mcg": "number",
   "vitamin_b12_mcg": "number"
 },
 "healthy_score": "number (1-10, based on overall nutrition quality)",
 "notes": "string (short health-related advice or description)"
}

Rules:
- Respond ONLY with the JSON (no text outside JSON).
- If you can’t find exact data, estimate based on similar foods.
- Round values to 1 decimal place.
- Use realistic average nutritional values per 100g.
`;

// --- Middleware ---
app.use(express.json()); // To parse JSON request bodies
app.use(cors()); // Enable CORS for all origins (required for Flutter)

// --- Routes ---
app.use('/nutrition', nutritionRoutes);

// --- Health Check Route ---
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// --- Start Server ---
app.listen(port, () => {
  console.log(`✅ Node.js server running on http://localhost:${port}`);
  console.log('CORS is enabled for all origins.');
});
