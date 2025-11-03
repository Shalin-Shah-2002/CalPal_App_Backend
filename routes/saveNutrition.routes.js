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

    // Add formatted date to the response
    const savedData = {
      ...result.rows[0],
      date: new Date().toISOString().split('T')[0], // Format: YYYY-MM-DD
      fullDateTime: new Date().toISOString() // Full ISO timestamp
    };

    res.status(201).json({
      success: true,
      message: 'Nutrition data saved successfully',
      data: savedData,
      savedOn: new Date().toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })
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

    // Add formatted dates to each record
    const dataWithDates = result.rows.map(row => ({
      ...row,
      date: new Date(row.created_at).toISOString().split('T')[0], // YYYY-MM-DD
      formattedDate: new Date(row.created_at).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    }));

    res.json({
      success: true,
      count: result.rows.length,
      data: dataWithDates
    });

  } catch (error) {
    console.error('❌ Error fetching nutrition logs:', error.message);
    res.status(500).json({ 
      error: 'Failed to fetch nutrition logs',
      details: error.message 
    });
  }
});

// --- GET /date/:date - Get nutrition logs by specific date ---
router.get('/date/:date', async (req, res) => {
  const { date } = req.params;

  try {
    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return res.status(400).json({ 
        error: 'Invalid date format. Use YYYY-MM-DD (e.g., 2025-11-02)' 
      });
    }

    // Query for records on the specific date
    const query = `
      SELECT * FROM nutrition_logs 
      WHERE DATE(created_at) = $1
      ORDER BY created_at DESC
    `;

    const result = await pool.query(query, [date]);

    // Add formatted dates to each record
    const dataWithDates = result.rows.map(row => ({
      ...row,
      date: new Date(row.created_at).toISOString().split('T')[0],
      formattedDate: new Date(row.created_at).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      time: new Date(row.created_at).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
    }));

    res.json({
      success: true,
      date: date,
      count: result.rows.length,
      data: dataWithDates
    });

  } catch (error) {
    console.error('❌ Error fetching nutrition logs by date:', error.message);
    res.status(500).json({ 
      error: 'Failed to fetch nutrition logs by date',
      details: error.message 
    });
  }
});

// --- GET /range - Get nutrition logs by date range (query params) ---
router.get('/range/query', async (req, res) => {
  const { startDate, endDate } = req.query;

  try {
    // Validate required parameters
    if (!startDate || !endDate) {
      return res.status(400).json({ 
        error: 'Missing required query parameters: startDate and endDate (format: YYYY-MM-DD)' 
      });
    }

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(startDate) || !dateRegex.test(endDate)) {
      return res.status(400).json({ 
        error: 'Invalid date format. Use YYYY-MM-DD (e.g., 2025-11-01)' 
      });
    }

    // Query for records within the date range
    const query = `
      SELECT * FROM nutrition_logs 
      WHERE DATE(created_at) BETWEEN $1 AND $2
      ORDER BY created_at DESC
    `;

    const result = await pool.query(query, [startDate, endDate]);

    // Add formatted dates to each record
    const dataWithDates = result.rows.map(row => ({
      ...row,
      date: new Date(row.created_at).toISOString().split('T')[0],
      formattedDate: new Date(row.created_at).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      time: new Date(row.created_at).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
    }));

    res.json({
      success: true,
      startDate: startDate,
      endDate: endDate,
      count: result.rows.length,
      data: dataWithDates
    });

  } catch (error) {
    console.error('❌ Error fetching nutrition logs by date range:', error.message);
    res.status(500).json({ 
      error: 'Failed to fetch nutrition logs by date range',
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

    // Add formatted dates to the record
    const dataWithDate = {
      ...result.rows[0],
      date: new Date(result.rows[0].created_at).toISOString().split('T')[0], // YYYY-MM-DD
      formattedDate: new Date(result.rows[0].created_at).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    };

    res.json({
      success: true,
      data: dataWithDate
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
