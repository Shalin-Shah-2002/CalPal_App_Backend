# Calorie Tracking Backend API Documentation

## 🚀 Server Status
- **Base URL**: `http://localhost:3000`
- **Database**: PostgreSQL (Connected ✅)
- **CORS**: Enabled for all origins

---

## 📋 API Endpoints

### 1. Health Check
**GET** `/health`

Check if the server is running.

```bash
curl http://localhost:3000/health
```

**Response:**
```json
{
  "status": "OK",
  "message": "Server is running"
}
```

---

### 2. Get Nutrition Data (Gemini AI)
**POST** `/nutrition`

Get nutritional information for any food using AI.

**Request Body:**
```json
{
  "food": "2 boiled eggs"
}
```

**Example:**
```bash
curl -X POST http://localhost:3000/nutrition \
  -H "Content-Type: application/json" \
  -d '{"food": "2 boiled eggs"}'
```

**Response:**
```json
{
  "food_name": "Boiled eggs",
  "serving_size": 100,
  "calories": 155,
  "macronutrients": {
    "protein_g": 13,
    "carbohydrates_g": 1.1,
    "fats_g": 10.6,
    "fiber_g": 0,
    "sugars_g": 1.1
  },
  "micronutrients": {
    "sodium_mg": 124,
    "potassium_mg": 126,
    "calcium_mg": 50,
    "iron_mg": 1.2,
    "vitamin_c_mg": 0,
    "vitamin_d_mcg": 2.1,
    "vitamin_b12_mcg": 1.1
  },
  "healthy_score": 8,
  "notes": "Highly nutritious food..."
}
```

---

### 3. Save Nutrition Data
**POST** `/save`

Save nutrition data to the PostgreSQL database.

**Request Body:**
```json
{
  "food_name": "Boiled Eggs",
  "serving_size": 100,
  "calories": 155,
  "macronutrients": {
    "protein_g": 13,
    "carbohydrates_g": 1.1,
    "fats_g": 10.6,
    "fiber_g": 0,
    "sugars_g": 1.1
  },
  "micronutrients": {
    "sodium_mg": 124,
    "potassium_mg": 126,
    "calcium_mg": 50,
    "iron_mg": 1.2,
    "vitamin_c_mg": 0,
    "vitamin_d_mcg": 2.1,
    "vitamin_b12_mcg": 1.1
  },
  "healthy_score": 8,
  "notes": "Highly nutritious food"
}
```

**Example:**
```bash
curl -X POST http://localhost:3000/save \
  -H "Content-Type: application/json" \
  -d '{
    "food_name": "Boiled Eggs",
    "serving_size": 100,
    "calories": 155,
    "macronutrients": {
      "protein_g": 13,
      "carbohydrates_g": 1.1,
      "fats_g": 10.6,
      "fiber_g": 0,
      "sugars_g": 1.1
    },
    "micronutrients": {
      "sodium_mg": 124,
      "potassium_mg": 126,
      "calcium_mg": 50,
      "iron_mg": 1.2,
      "vitamin_c_mg": 0,
      "vitamin_d_mcg": 2.1,
      "vitamin_b12_mcg": 1.1
    },
    "healthy_score": 8,
    "notes": "Highly nutritious food"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Nutrition data saved successfully",
  "data": {
    "id": 1,
    "food_name": "Boiled Eggs",
    "serving_size": "100.0",
    "calories": "155.0",
    "protein_g": "13.0",
    "carbohydrates_g": "1.1",
    "fats_g": "10.6",
    "fiber_g": "0.0",
    "sugars_g": "1.1",
    "sodium_mg": "124.0",
    "potassium_mg": "126.0",
    "calcium_mg": "50.0",
    "iron_mg": "1.2",
    "vitamin_c_mg": "0.0",
    "vitamin_d_mcg": "2.1",
    "vitamin_b12_mcg": "1.1",
    "healthy_score": 8,
    "notes": "Highly nutritious food",
    "created_at": "2025-11-01T08:06:11.382Z"
  }
}
```

---

### 4. Get All Nutrition Logs
**GET** `/save`

Retrieve all saved nutrition logs from the database.

**Example:**
```bash
curl http://localhost:3000/save
```

**Response:**
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "id": 2,
      "food_name": "Boiled Eggs",
      "serving_size": "100.0",
      "calories": "155.0",
      "protein_g": "13.0",
      "carbohydrates_g": "1.1",
      "fats_g": "10.6",
      "fiber_g": "0.0",
      "sugars_g": "1.1",
      "sodium_mg": "124.0",
      "potassium_mg": "126.0",
      "calcium_mg": "50.0",
      "iron_mg": "1.2",
      "vitamin_c_mg": "0.0",
      "vitamin_d_mcg": "2.1",
      "vitamin_b12_mcg": "1.1",
      "healthy_score": 8,
      "notes": "Highly nutritious food",
      "created_at": "2025-11-01T08:06:11.382Z"
    },
    ...
  ]
}
```

---

### 5. Get Specific Nutrition Log
**GET** `/save/:id`

Get a specific nutrition log by its ID.

**Example:**
```bash
curl http://localhost:3000/save/1
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "food_name": "Apple",
    "serving_size": "100.0",
    "calories": "52.0",
    ...
    "created_at": "2025-11-01T08:04:52.682Z"
  }
}
```

---

### 6. Delete Nutrition Log
**DELETE** `/save/:id`

Delete a specific nutrition log by its ID.

**Example:**
```bash
curl -X DELETE http://localhost:3000/save/1
```

**Response:**
```json
{
  "success": true,
  "message": "Nutrition log deleted successfully",
  "data": {
    "id": 1,
    "food_name": "Apple",
    ...
  }
}
```

---

## 🏗️ Database Schema

**Table:** `nutrition_logs`

| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL PRIMARY KEY | Auto-incrementing ID |
| food_name | VARCHAR(255) | Name of the food |
| serving_size | DECIMAL(10, 1) | Serving size in grams |
| calories | DECIMAL(10, 1) | Calories in kcal |
| protein_g | DECIMAL(10, 1) | Protein in grams |
| carbohydrates_g | DECIMAL(10, 1) | Carbohydrates in grams |
| fats_g | DECIMAL(10, 1) | Fats in grams |
| fiber_g | DECIMAL(10, 1) | Fiber in grams |
| sugars_g | DECIMAL(10, 1) | Sugars in grams |
| sodium_mg | DECIMAL(10, 1) | Sodium in mg |
| potassium_mg | DECIMAL(10, 1) | Potassium in mg |
| calcium_mg | DECIMAL(10, 1) | Calcium in mg |
| iron_mg | DECIMAL(10, 1) | Iron in mg |
| vitamin_c_mg | DECIMAL(10, 1) | Vitamin C in mg |
| vitamin_d_mcg | DECIMAL(10, 1) | Vitamin D in mcg |
| vitamin_b12_mcg | DECIMAL(10, 1) | Vitamin B12 in mcg |
| healthy_score | INTEGER | Health score (1-10) |
| notes | TEXT | Additional notes |
| created_at | TIMESTAMP | Creation timestamp |

---

## 📁 Project Structure

```
Calorie Tracking Backend/
├── server.js                      # Main server file
├── .env                          # Environment variables
├── package.json                  # Dependencies
├── config/
│   ├── database.js              # PostgreSQL connection
│   ├── initDb.js                # Database initialization
│   └── schema.sql               # Database schema
└── routes/
    ├── nutrition.routes.js      # Gemini AI nutrition endpoint
    └── saveNutrition.routes.js  # Database CRUD operations
```

---

## 🔄 Typical Workflow

1. **User requests nutrition data:**
   ```bash
   POST /nutrition
   {"food": "banana"}
   ```

2. **AI returns nutrition data:**
   ```json
   {
     "food_name": "Banana",
     "serving_size": 100,
     "calories": 89,
     ...
   }
   ```

3. **User clicks "Add" - Save to database:**
   ```bash
   POST /save
   {
     "food_name": "Banana",
     "serving_size": 100,
     "calories": 89,
     ...
   }
   ```

4. **Data is stored in PostgreSQL ✅**

5. **Retrieve all logs:**
   ```bash
   GET /save
   ```

---

## ✅ Features

- ✅ Microservice architecture (separated concerns)
- ✅ PostgreSQL database integration
- ✅ AI-powered nutrition data (Gemini API)
- ✅ Full CRUD operations
- ✅ Automatic table creation on startup
- ✅ Error handling and validation
- ✅ CORS enabled for Flutter/React apps
- ✅ Timestamp tracking for all entries
- ✅ Independent save microservice

---

## 🚀 How to Run

```bash
# Start the server
node server.js

# Server will:
# 1. Connect to PostgreSQL ✅
# 2. Initialize database tables ✅
# 3. Start listening on port 3000 ✅
```

---

## 🔧 Environment Variables

Add to `.env` file:

```env
GEMINI_API_KEY=your_gemini_api_key_here
DATABASE_URL=your_postgresql_connection_string
PORT=3000
```
