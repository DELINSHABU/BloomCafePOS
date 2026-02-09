# 🔥 Firebase Integration Guide

## 📋 Overview

Your BloomCafe menu system has been successfully integrated with Firebase Firestore! This guide will walk you through:

- **Migrating** your existing JSON data to Firebase
- **Using** the new Firebase-powered API endpoints
- **Managing** menu data with full CRUD operations

---

## 🚀 Quick Start

### 1. **Migrate Your Data to Firebase**

Run the migration script to upload your current `menu.json` and `menu-availability.json` to Firebase:

```bash
npm run migrate:menu
```

This will:
- ✅ Upload all menu items to Firestore
- ✅ Set availability data from `menu-availability.json`
- ✅ Create proper document structure
- ✅ Verify the migration

### 2. **Start Using Firebase APIs**

Your existing API endpoints now work with Firebase! No frontend changes needed.

```bash
npm run dev
```

---

## 📊 **Data Structure in Firestore**

### **Menu Collection** (`/menu/{itemNo}`)
```json
{
  "itemNo": "001",
  "name": "APPAM",
  "rate": "10",
  "category": "Breakfast",
  "available": true,
  "createdAt": "2025-08-19T10:00:00Z",
  "updatedAt": "2025-08-19T10:00:00Z"
}
```

### **Admin Collection** (`/admin/menu-metadata`)
```json
{
  "totalItems": 263,
  "updatedItems": 5,
  "lastMigrated": "2025-08-19T10:00:00Z",
  "source": "migration-script",
  "version": "1.0"
}
```

---

## 🔌 **API Endpoints**

### **Menu API** (`/api/menu`)

#### **GET** - Fetch Menu Data
```bash
# Get all menu items
GET /api/menu

# Get specific category
GET /api/menu?category=Breakfast

# Get specific item
GET /api/menu?itemNo=001
```

**Response Example:**
```json
{
  "menu": [
    {
      "category": "Breakfast",
      "products": [
        {
          "itemNo": "001",
          "name": "APPAM",
          "rate": "10",
          "available": true
        }
      ]
    }
  ],
  "source": "firebase",
  "lastUpdated": "2025-08-19T10:00:00Z"
}
```

#### **POST** - Create Menu Items

**Single Item:**
```bash
POST /api/menu
Content-Type: application/json

{
  "itemNo": "999",
  "name": "New Dish",
  "rate": "150",
  "category": "Special",
  "available": true
}
```

**Bulk Upload (Replace entire menu):**
```bash
POST /api/menu
Content-Type: application/json

{
  "menu": [
    {
      "category": "Breakfast",
      "products": [
        {
          "itemNo": "001",
          "name": "APPAM",
          "rate": "10"
        }
      ]
    }
  ]
}
```

#### **PUT** - Update Menu Item
```bash
PUT /api/menu
Content-Type: application/json

{
  "itemNo": "001",
  "name": "Updated APPAM",
  "rate": "15",
  "available": false
}
```

#### **DELETE** - Remove Menu Item
```bash
DELETE /api/menu?itemNo=001
```

---

### **Menu Availability API** (`/api/menu-availability`)

#### **GET** - Fetch Availability Data
```bash
GET /api/menu-availability
```

**Response:**
```json
{
  "lastUpdated": "2025-08-19T10:00:00Z",
  "items": {
    "001": {
      "available": true,
      "price": "10"
    }
  },
  "source": "firebase"
}
```

#### **POST** - Update Single Item Availability
```bash
POST /api/menu-availability
Content-Type: application/json

{
  "itemNo": "001",
  "available": false,
  "price": "12"
}
```

#### **PUT** - Bulk Update Availability
```bash
PUT /api/menu-availability
Content-Type: application/json

[
  {
    "itemNo": "001",
    "available": false
  },
  {
    "itemNo": "002",
    "price": "15"
  }
]
```

---

## 🛠 **Configuration**

### **Firebase Toggle**
You can switch between Firebase and JSON mode by editing the API files:

```typescript
// In app/api/menu/route.ts and app/api/menu-availability/route.ts
const USE_FIREBASE = true  // true = Firebase, false = JSON fallback
```

### **Environment Variables**
Your Firebase configuration is already set up in `lib/firebase.ts`. For production, consider moving credentials to environment variables.

---

## ⚡ **Features**

### ✅ **What Works Now**
- **Full CRUD Operations**: Create, Read, Update, Delete menu items
- **Real-time Data**: All changes reflect immediately
- **Fallback Support**: Automatically falls back to JSON if Firebase fails
- **Batch Operations**: Efficient bulk updates
- **Data Validation**: Proper error handling and validation
- **Availability Management**: Toggle item availability and update prices

### 🔄 **Backwards Compatibility**
- ✅ All existing frontend code works without changes
- ✅ JSON files are still used as fallback
- ✅ Same API response format maintained

---

## 📝 **Usage Examples**

### **JavaScript/Frontend Usage**

```javascript
// Fetch all menu items
const response = await fetch('/api/menu')
const data = await response.json()
console.log(`Loaded ${data.menu.length} categories from ${data.source}`)

// Create new menu item
await fetch('/api/menu', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    itemNo: '999',
    name: 'Special Dish',
    rate: '200',
    category: 'Specials'
  })
})

// Update item availability
await fetch('/api/menu-availability', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    itemNo: '001',
    available: false
  })
})

// Update menu item
await fetch('/api/menu', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    itemNo: '001',
    name: 'Updated Name',
    rate: '25'
  })
})

// Delete menu item
await fetch('/api/menu?itemNo=001', {
  method: 'DELETE'
})
```

### **cURL Examples**

```bash
# Get menu data
curl -X GET http://localhost:3000/api/menu

# Get specific category
curl -X GET "http://localhost:3000/api/menu?category=Breakfast"

# Create new item
curl -X POST http://localhost:3000/api/menu \
  -H "Content-Type: application/json" \
  -d '{
    "itemNo": "999",
    "name": "Test Item",
    "rate": "100",
    "category": "Test"
  }'

# Update availability
curl -X POST http://localhost:3000/api/menu-availability \
  -H "Content-Type: application/json" \
  -d '{
    "itemNo": "001",
    "available": false,
    "price": "15"
  }'

# Update item
curl -X PUT http://localhost:3000/api/menu \
  -H "Content-Type: application/json" \
  -d '{
    "itemNo": "001",
    "name": "Updated APPAM",
    "rate": "20"
  }'

# Delete item
curl -X DELETE "http://localhost:3000/api/menu?itemNo=999"
```

---

## 🔍 **Monitoring & Debugging**

### **Check Migration Status**
```bash
# Run verification
npm run migrate:verify

# Check Firestore in Firebase Console
# https://console.firebase.google.com/project/bloom-graden-cafe-user-login/firestore
```

### **API Response Indicators**
Every API response includes a `source` field:
- `"source": "firebase"` - Data from Firestore
- `"source": "json"` - Data from JSON files
- `"source": "json-fallback"` - Fallback mode (Firebase failed)

### **Console Logs**
The APIs log their operations:
```
🔥 Fetching menu data from Firebase Firestore
✅ Successfully loaded 25 categories from Firebase
⚠️ Firebase failed, falling back to JSON
```

---

## 🚨 **Troubleshooting**

### **Migration Issues**
```bash
# If migration fails, check:
1. Firebase project ID is correct
2. Admin SDK has proper permissions
3. Firestore is enabled in Firebase Console

# Re-run migration
npm run migrate:menu
```

### **API Errors**
- **404 Error**: Item not found in Firestore
- **409 Error**: Item already exists (POST)
- **400 Error**: Missing required fields
- **500 Error**: Firebase connection issue (check fallback)

### **Fallback Mode**
If Firebase is unavailable, the system automatically uses JSON files:
```json
{
  "source": "json-fallback",
  "fallback": true
}
```

---

## 🔮 **Next Steps**

1. **Test the APIs** with your frontend
2. **Monitor** Firebase usage in the console
3. **Consider** implementing authentication for write operations
4. **Optimize** with caching if needed
5. **Scale** with Firebase's powerful querying capabilities

Your menu system is now powered by Firebase and ready for production use! 🎉

---

## 📞 **Support**

If you encounter any issues:

1. Check the console logs for detailed error messages
2. Verify Firebase configuration in the console
3. Test the fallback mode by setting `USE_FIREBASE = false`
4. Run the verification script: `npm run migrate:verify`

**Happy coding! 🚀**
