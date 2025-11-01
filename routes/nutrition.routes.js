import express from 'express';
import axios from 'axios';

const router = express.Router();

// --- System Prompt ---
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
- If you can't find exact data, estimate based on similar foods.
- Round values to 1 decimal place.
- Use realistic average nutritional values per 100g.
`;

// --- Route Handler ---
router.post('/', async (req, res) => {
  const { food } = req.body;
  const geminiApiKey = process.env.GEMINI_API_KEY;
  const geminiApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`;

  if (!geminiApiKey) {
    return res.status(500).json({ error: 'GEMINI_API_KEY is not set on the server.' });
  }

  if (!food) {
    return res.status(400).json({ error: 'Missing "food" field in request body.' });
  }

  // Construct the payload for the Gemini API
  const geminiPayload = {
    contents: [{
      parts: [{ text: food }]
    }],
    systemInstruction: {
      parts: [{ text: systemPrompt }]
    },
    generationConfig: {
      responseMimeType: "application/json",
    }
  };
  try {
    // Call the Gemini API
    const apiResponse = await axios.post(geminiApiUrl, geminiPayload, {
      headers: { 'Content-Type': 'application/json' }
    });

    // Extract the raw JSON string from Gemini's response
    const nutritionJsonString = apiResponse.data.candidates[0].content.parts[0].text;
    
    // Parse the JSON string to validate it and send it as a proper JSON response
    const nutritionData = JSON.parse(nutritionJsonString);
    
    // Send the extracted JSON object back to the client
    res.json(nutritionData);

  } catch (error) {
    console.error('Error calling Gemini API:', error.response ? error.response.data : error.message);
    res.status(500).json({ error: 'Failed to fetch nutrition data from Gemini API.' });
  }
});

export default router;
