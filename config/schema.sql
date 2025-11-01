-- Create nutrition_logs table
CREATE TABLE IF NOT EXISTS nutrition_logs (
  id SERIAL PRIMARY KEY,
  food_name VARCHAR(255) NOT NULL,
  serving_size DECIMAL(10, 1) NOT NULL,
  calories DECIMAL(10, 1) NOT NULL,
  protein_g DECIMAL(10, 1),
  carbohydrates_g DECIMAL(10, 1),
  fats_g DECIMAL(10, 1),
  fiber_g DECIMAL(10, 1),
  sugars_g DECIMAL(10, 1),
  sodium_mg DECIMAL(10, 1),
  potassium_mg DECIMAL(10, 1),
  calcium_mg DECIMAL(10, 1),
  iron_mg DECIMAL(10, 1),
  vitamin_c_mg DECIMAL(10, 1),
  vitamin_d_mcg DECIMAL(10, 1),
  vitamin_b12_mcg DECIMAL(10, 1),
  healthy_score INTEGER,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_created_at ON nutrition_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_food_name ON nutrition_logs(food_name);
