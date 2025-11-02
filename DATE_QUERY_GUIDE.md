# 📅 Date-Based Query Endpoints - Complete Guide

## 🎯 New Endpoints Added

I've added **2 new powerful endpoints** to query nutrition logs by date!

---

## 1️⃣ **GET /save/date/:date** - Get Logs by Specific Date

Get all nutrition logs for a specific date.

### **Endpoint:**
```
GET /save/date/:date
```

### **Parameters:**
- `date` (path parameter) - Date in **YYYY-MM-DD** format

### **Example curl Commands:**

#### Get logs for November 2, 2025:
```bash
curl "http://localhost:3000/save/date/2025-11-02"
```

#### Get logs for November 1, 2025:
```bash
curl "http://localhost:3000/save/date/2025-11-01"
```

#### Get logs for today (example):
```bash
curl "http://localhost:3000/save/date/$(date +%Y-%m-%d)"
```

### **Response:**
```json
{
  "success": true,
  "date": "2025-11-02",
  "count": 6,
  "data": [
    {
      "id": 8,
      "food_name": "Thepla",
      "serving_size": "100.0",
      "calories": "300.0",
      "protein_g": "9.0",
      "carbohydrates_g": "45.0",
      "fats_g": "12.0",
      "fiber_g": "6.0",
      "sugars_g": "1.5",
      "sodium_mg": "400.0",
      "potassium_mg": "200.0",
      "calcium_mg": "65.0",
      "iron_mg": "3.0",
      "vitamin_c_mg": "7.5",
      "vitamin_d_mcg": "0.0",
      "vitamin_b12_mcg": "0.0",
      "healthy_score": 7,
      "notes": "Traditional Indian flatbread...",
      "created_at": "2025-11-02T08:14:42.541Z",
      "date": "2025-11-02",
      "formattedDate": "Sunday, November 2, 2025",
      "time": "01:44:42 PM"
    },
    ...
  ]
}
```

### **Features:**
- ✅ Returns all logs for the specified date
- ✅ Sorted by newest first (created_at DESC)
- ✅ Includes formatted date and time
- ✅ Shows count of records found
- ✅ Empty array if no logs found for that date

### **Error Responses:**
```json
// Invalid date format
{
  "error": "Invalid date format. Use YYYY-MM-DD (e.g., 2025-11-02)"
}

// Database error
{
  "error": "Failed to fetch nutrition logs by date",
  "details": "error message"
}
```

---

## 2️⃣ **GET /save/range/query** - Get Logs by Date Range

Get all nutrition logs between two dates (inclusive).

### **Endpoint:**
```
GET /save/range/query?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
```

### **Query Parameters:**
- `startDate` (required) - Start date in **YYYY-MM-DD** format
- `endDate` (required) - End date in **YYYY-MM-DD** format

### **Example curl Commands:**

#### Get logs from November 1-2, 2025:
```bash
curl "http://localhost:3000/save/range/query?startDate=2025-11-01&endDate=2025-11-02"
```

#### Get logs for the entire week:
```bash
curl "http://localhost:3000/save/range/query?startDate=2025-11-01&endDate=2025-11-07"
```

#### Get logs for the entire month of November:
```bash
curl "http://localhost:3000/save/range/query?startDate=2025-11-01&endDate=2025-11-30"
```

#### Get last 7 days (using date command):
```bash
START_DATE=$(date -v-7d +%Y-%m-%d)
END_DATE=$(date +%Y-%m-%d)
curl "http://localhost:3000/save/range/query?startDate=$START_DATE&endDate=$END_DATE"
```

### **Response:**
```json
{
  "success": true,
  "startDate": "2025-11-01",
  "endDate": "2025-11-02",
  "count": 7,
  "data": [
    {
      "id": 8,
      "food_name": "Thepla",
      "serving_size": "100.0",
      "calories": "300.0",
      "protein_g": "9.0",
      "carbohydrates_g": "45.0",
      "fats_g": "12.0",
      "fiber_g": "6.0",
      "sugars_g": "1.5",
      "sodium_mg": "400.0",
      "potassium_mg": "200.0",
      "calcium_mg": "65.0",
      "iron_mg": "3.0",
      "vitamin_c_mg": "7.5",
      "vitamin_d_mcg": "0.0",
      "vitamin_b12_mcg": "0.0",
      "healthy_score": 7,
      "notes": "Traditional Indian flatbread...",
      "created_at": "2025-11-02T08:14:42.541Z",
      "date": "2025-11-02",
      "formattedDate": "Sunday, November 2, 2025",
      "time": "01:44:42 PM"
    },
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
      "created_at": "2025-11-01T08:06:11.382Z",
      "date": "2025-11-01",
      "formattedDate": "Saturday, November 1, 2025",
      "time": "01:36:11 PM"
    },
    ...
  ]
}
```

### **Features:**
- ✅ Returns all logs between startDate and endDate (inclusive)
- ✅ Sorted by newest first (created_at DESC)
- ✅ Includes formatted date and time for each entry
- ✅ Shows count of total records found
- ✅ Shows the date range queried
- ✅ Empty array if no logs found in range

### **Error Responses:**
```json
// Missing parameters
{
  "error": "Missing required query parameters: startDate and endDate (format: YYYY-MM-DD)"
}

// Invalid date format
{
  "error": "Invalid date format. Use YYYY-MM-DD (e.g., 2025-11-01)"
}

// Database error
{
  "error": "Failed to fetch nutrition logs by date range",
  "details": "error message"
}
```

---

## 📊 **Complete Endpoint Summary**

| Endpoint | Method | Purpose | Example |
|----------|--------|---------|---------|
| `/save` | GET | Get all nutrition logs | `curl http://localhost:3000/save` |
| `/save/:id` | GET | Get specific log by ID | `curl http://localhost:3000/save/2` |
| `/save/date/:date` | GET | Get logs for specific date | `curl http://localhost:3000/save/date/2025-11-02` |
| `/save/range/query` | GET | Get logs for date range | `curl "http://localhost:3000/save/range/query?startDate=2025-11-01&endDate=2025-11-02"` |
| `/save` | POST | Save nutrition data | `curl -X POST http://localhost:3000/save -d '{...}'` |
| `/save/:id` | DELETE | Delete nutrition log | `curl -X DELETE http://localhost:3000/save/2` |

---

## 🎯 **Use Cases**

### **Daily Tracking:**
Get all foods logged today:
```bash
TODAY=$(date +%Y-%m-%d)
curl "http://localhost:3000/save/date/$TODAY"
```

### **Weekly Summary:**
Get nutrition logs for the current week:
```bash
curl "http://localhost:3000/save/range/query?startDate=2025-11-01&endDate=2025-11-07"
```

### **Monthly Report:**
Get all logs for November 2025:
```bash
curl "http://localhost:3000/save/range/query?startDate=2025-11-01&endDate=2025-11-30"
```

### **Compare Two Days:**
```bash
# Get Monday's logs
curl "http://localhost:3000/save/date/2025-11-01"

# Get Tuesday's logs
curl "http://localhost:3000/save/date/2025-11-02"
```

### **Custom Date Range:**
Get logs from Oct 15 to Nov 5:
```bash
curl "http://localhost:3000/save/range/query?startDate=2025-10-15&endDate=2025-11-05"
```

---

## 📅 **Date Field Reference**

Each record includes multiple date/time formats:

| Field | Format | Example | Use Case |
|-------|--------|---------|----------|
| `created_at` | ISO Timestamp (UTC) | `2025-11-02T08:14:42.541Z` | Original database timestamp |
| `date` | YYYY-MM-DD | `2025-11-02` | Grouping by date, filtering |
| `formattedDate` | Full readable date | `Sunday, November 2, 2025` | Display in UI |
| `time` | 12-hour time | `01:44:42 PM` | Show when the food was logged |

---

## 🔍 **Query Tips**

### **Date Format:**
- Always use **YYYY-MM-DD** format
- Example: `2025-11-02` ✅
- Not: `11/02/2025` ❌
- Not: `02-11-2025` ❌

### **Date Range:**
- Both startDate and endDate are **inclusive**
- `startDate=2025-11-01&endDate=2025-11-02` includes both Nov 1 AND Nov 2

### **Time Zone:**
- All dates are stored in UTC in the database
- The `created_at` field shows UTC time
- The `time` field shows local time (based on server)

---

## 🚀 **Testing Commands**

### **1. Test specific date:**
```bash
curl "http://localhost:3000/save/date/2025-11-02"
```

### **2. Test date range:**
```bash
curl "http://localhost:3000/save/range/query?startDate=2025-11-01&endDate=2025-11-02"
```

### **3. Pretty print with Python:**
```bash
curl "http://localhost:3000/save/date/2025-11-02" | python3 -m json.tool
```

### **4. Pretty print with jq:**
```bash
curl "http://localhost:3000/save/date/2025-11-02" | jq
```

### **5. Get count only:**
```bash
curl "http://localhost:3000/save/date/2025-11-02" | jq '.count'
```

### **6. Get food names only:**
```bash
curl "http://localhost:3000/save/date/2025-11-02" | jq '.data[].food_name'
```

### **7. Calculate total calories for a date:**
```bash
curl "http://localhost:3000/save/date/2025-11-02" | jq '[.data[].calories | tonumber] | add'
```

---

## ✅ **Summary**

You now have **6 endpoints** in the Save Nutrition microservice:

1. **POST** `/save` - Save nutrition data
2. **GET** `/save` - Get all nutrition logs
3. **GET** `/save/:id` - Get specific log by ID
4. **GET** `/save/date/:date` - Get logs by specific date ⭐ NEW
5. **GET** `/save/range/query` - Get logs by date range ⭐ NEW
6. **DELETE** `/save/:id` - Delete nutrition log

All endpoints include:
- ✅ Formatted dates and times
- ✅ Proper error handling
- ✅ Validation
- ✅ Consistent response structure

Perfect for building daily calorie tracking, weekly summaries, and monthly reports! 🎉
