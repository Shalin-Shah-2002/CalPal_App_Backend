import express from 'express';
import pool from '../config/database.js';

const router = express.Router();

// --- POST / - Save nutrition data to database ---
router.post('/', async (req, res) => {
  const nutritionData = req.body;

  // Validate required fields
  if (!nutritionData.food_name || !nutritionData.serving_size || !nutritionData.calories) {
    return res.status(400).json({ 
      error: 'Missing required fields: food_name, serving_size, and calories are required' 
    });
  }

  try {
    // Extract data from the nutrition object
    const {
      food_name,
      serving_size,
      calories,
      macronutrients,
      micronutrients,
      healthy_score,
      notes
    } = nutritionData;

    // Insert into database
    const query = `
      INSERT INTO nutrition_logs (
        food_name, serving_size, calories,
        protein_g, carbohydrates_g, fats_g, fiber_g, sugars_g,
        sodium_mg, potassium_mg, calcium_mg, iron_mg,
        vitamin_c_mg, vitamin_d_mcg, vitamin_b12_mcg,
        healthy_score, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
      RETURNING *
    `;

    const values = [
      food_name,
      serving_size,
      calories,
      macronutrients?.protein_g || 0,
      macronutrients?.carbohydrates_g || 0,
      macronutrients?.fats_g || 0,
      macronutrients?.fiber_g || 0,
      macronutrients?.sugars_g || 0,
      micronutrients?.sodium_mg || 0,
      micronutrients?.potassium_mg || 0,
      micronutrients?.calcium_mg || 0,
      micronutrients?.iron_mg || 0,
      micronutrients?.vitamin_c_mg || 0,
      micronutrients?.vitamin_d_mcg || 0,
      micronutrients?.vitamin_b12_mcg || 0,
      healthy_score || 5,
      notes || ''
    ];

    const result = await pool.query(query, values);

    res.status(201).json({
      success: true,
      message: 'Nutrition data saved successfully',
      data: result.rows[0]
    });

  } catch (error) {
    console.error('❌ Error saving nutrition data:', error.message);
    res.status(500).json({ 
      error: 'Failed to save nutrition data to database',
      details: error.message 
    });
  }
});

// --- GET / - Get all nutrition logs ---
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM nutrition_logs ORDER BY created_at DESC'
    );

    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });

  } catch (error) {
    console.error('❌ Error fetching nutrition logs:', error.message);
    res.status(500).json({ 
      error: 'Failed to fetch nutrition logs',
      details: error.message 
    });
  }
});

// --- GET /:id - Get specific nutrition log ---
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      'SELECT * FROM nutrition_logs WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Nutrition log not found' });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });

  } catch (error) {
    console.error('❌ Error fetching nutrition log:', error.message);
    res.status(500).json({ 
      error: 'Failed to fetch nutrition log',
      details: error.message 
    });
  }
});

// --- DELETE /:id - Delete specific nutrition log ---
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      'DELETE FROM nutrition_logs WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Nutrition log not found' });
    }

    res.json({
      success: true,
      message: 'Nutrition log deleted successfully',
      data: result.rows[0]
    });

  } catch (error) {
    console.error('❌ Error deleting nutrition log:', error.message);
    res.status(500).json({ 
      error: 'Failed to delete nutrition log',
      details: error.message 
    });
  }
});

export default router;
