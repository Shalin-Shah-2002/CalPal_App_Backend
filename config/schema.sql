-- Create users table for Appwrite authentication
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  appwrite_id TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create nutrition_logs table
CREATE TABLE IF NOT EXISTS nutrition_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
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
CREATE INDEX IF NOT EXISTS idx_users_appwrite_id ON users(appwrite_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_nutrition_user_id ON nutrition_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_created_at ON nutrition_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_food_name ON nutrition_logs(food_name);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
