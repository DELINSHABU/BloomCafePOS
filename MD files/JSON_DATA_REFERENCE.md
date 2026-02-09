# 📋 BloomCafe JSON Files & API Endpoints Reference

> **Last Updated**: August 19, 2025  
> **Status**: 🔥 **Hybrid Firebase + JSON System**  
> **Database**: Firebase Firestore + JSON Fallback  
> **Authentication**: Firebase Auth Only

---

## 🎯 **Core Data Files (Hybrid System)**

### 1. **Menu Data** 🔥
- **📄 File**: `menu.json` (fallback)
- **🔥 Database**: Firebase Firestore `/menu/{itemNo}`
- **📡 API Endpoint**: `/api/menu`
- **🔄 Operations**: `GET`, `POST`, `PUT`, `DELETE`
- **📊 Structure**: Menu categories with products (itemNo, name, rate, available)
- **✅ Status**: 🔥 **Hybrid Mode** - Firebase Primary, JSON Fallback
- **🔧 Toggle**: Set `USE_FIREBASE = false` in route.ts to use JSON only

**Example Structure:**
```json
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

### 2. **Orders Data**
- **📄 File**: `orders.json`
- **📡 API Endpoint**: `/api/orders`
- **🔄 Operations**: `GET`, `POST`, `PUT`, `DELETE`
- **📊 Structure**: Order history with items, totals, status, timestamps
- **✅ Status**: ✅ Active

**Example Structure:**
```json
{
  "orders": [
    {
      "id": "order-fw5qwd54l",
      "items": [
        {
          "id": "079-b9r9ei7io",
          "name": "ALFAHAM (QTR)",
          "price": 120,
          "quantity": 1
        }
      ],
      "total": 340,
      "status": "delivered",
      "tableNumber": "1",
      "customerName": "Customer Name",
      "orderType": "dine-in",
      "timestamp": "2025-07-24T12:14:16.934Z"
    }
  ]
}
```

### 3. **Inventory Management**
- **📄 File**: `data/inventory.json`
- **📡 API Endpoint**: `/api/inventory`
- **🔄 Operations**: `GET`, `POST`, `PUT`, `DELETE`
- **📊 Structure**: Stock items with payment fields, QR codes, supplier info
- **✅ Status**: ✅ Active

**Example Structure:**
```json
{
  "inventory": [
    {
      "id": "inv_001",
      "name": "Atta (Wheat Flour)",
      "category": "Flour & Grains",
      "currentStock": 44,
      "unit": "kg",
      "minimumStock": 10,
      "maximumStock": 50,
      "unitPrice": 45.5,
      "supplier": "Grain Suppliers Ltd",
      "status": "in_stock",
      "isPaid": true,
      "discountPercentage": 10,
      "finalPrice": 40.95,
      "paymentMethods": ["Cash", "UPI"],
      "supplierPhone": "+91 9876543210"
    }
  ],
  "categories": ["Flour & Grains", "Rice & Grains"],
  "suppliers": ["Grain Suppliers Ltd"],
  "units": ["kg", "liters"],
  "lastUpdated": "2024-08-10T10:00:00Z",
  "updatedBy": "admin"
}
```

### 4. **Analytics Data**
- **📄 File**: `analytics_data.json`
- **📡 API Endpoint**: `/api/analytics`
- **🔄 Operations**: `GET` (auto-generated from orders)
- **📊 Structure**: Revenue, order statistics, popular items
- **✅ Status**: ✅ Active (Auto-updated when orders change)

### 5. **Menu Availability** 🔥
- **📄 File**: `menu-availability.json` (fallback)
- **🔥 Database**: Firebase Firestore `/menu/{itemNo}` (available field)
- **📡 API Endpoint**: `/api/menu-availability`
- **🔄 Operations**: `GET`, `POST`, `PUT`
- **📊 Structure**: Item availability status and price updates
- **✅ Status**: 🔥 **Hybrid Mode** - Firebase Primary, JSON Fallback
- **🔧 Toggle**: Set `USE_FIREBASE = false` in route.ts to use JSON only

### 6. **Combo Offers**
- **📄 File**: `combos.json`
- **📡 API Endpoint**: `/api/combos`
- **🔄 Operations**: `GET`, `POST`, `PUT`, `DELETE`
- **📊 Structure**: Combo deals with items and pricing
- **✅ Status**: ✅ Active

### 7. **Today's Special**
- **📄 File**: `todays-special.json`
- **📡 API Endpoint**: `/api/todays-special`
- **🔄 Operations**: `GET`, `POST`, `PUT`
- **📊 Structure**: Daily featured items and promotions
- **✅ Status**: ✅ Active

### 8. **Special Offers**
- **📄 File**: `offers.json`
- **📡 API Endpoint**: `/api/offers`
- **🔄 Operations**: `GET`, `POST`, `PUT`, `DELETE`
- **📊 Structure**: Promotional offers and discounts
- **✅ Status**: ✅ Active

---

## 🏢 **Business Management Files**

### 9. **Customer Reviews**
- **📄 File**: `data/customer-reviews.json`
- **📡 API Endpoint**: `/api/customer-reviews`
- **🔄 Operations**: `GET`, `POST`, `PUT`, `DELETE`
- **📊 Structure**: Customer feedback and ratings
- **✅ Status**: ✅ Active

### 10. **Event Bookings**
- **📄 File**: `data/event-bookings.json`
- **📡 API Endpoint**: `/api/event-bookings`
- **🔄 Operations**: `GET`, `POST`, `PUT`, `DELETE`
- **📊 Structure**: Event reservations and party bookings
- **✅ Status**: ✅ Active

### 11. **Gallery Images**
- **📄 File**: `data/gallery.json`
- **📡 API Endpoint**: `/api/gallery`
- **🔄 Operations**: `GET`, `POST`, `DELETE`
- **📊 Structure**: Image metadata and file paths
- **✅ Status**: ✅ Active

### 12. **Blog Posts**
- **📄 File**: `data/blog-posts.json`
- **📡 API Endpoint**: `/api/blog-posts` & `/api/blog-posts/[id]`
- **🔄 Operations**: `GET`, `POST`, `PUT`, `DELETE`
- **📊 Structure**: Blog articles with content and metadata
- **✅ Status**: ✅ Active

### 13. **About Us Content**
- **📄 File**: `data/about-us-content.json`
- **📡 API Endpoint**: `/api/about-us-content`
- **🔄 Operations**: `GET`, `POST`
- **📊 Structure**: Company information and story
- **✅ Status**: ✅ Active

---

## 👥 **Staff Management Files**

### 14. **Staff Tasks**
- **📄 File**: `tasks.json`
- **📡 API Endpoint**: `/api/tasks`
- **🔄 Operations**: `GET`, `POST`, `PUT`, `DELETE`
- **📊 Structure**: Task assignments and status tracking
- **✅ Status**: ✅ Active

### 15. **Staff Credentials**
- **📄 File**: `staff-credentials.json`
- **📡 API Endpoint**: `/api/load-credentials` & `/api/save-credentials`
- **🔄 Operations**: `GET`, `POST`
- **📊 Structure**: Staff login credentials and permissions
- **✅ Status**: ✅ Active

---

## 📊 **System Files (Read-Only)**

### 17. **Package Configuration**
- **📄 File**: `package.json`
- **📡 API Endpoint**: N/A
- **🔄 Operations**: Read-only
- **📊 Structure**: Project dependencies and scripts
- **✅ Status**: ✅ System file

### 18. **TypeScript Configuration**
- **📄 File**: `tsconfig.json`
- **📡 API Endpoint**: N/A
- **🔄 Operations**: Read-only
- **📊 Structure**: TypeScript compiler settings
- **✅ Status**: ✅ System file

### 19. **Components Configuration**
- **📄 File**: `components.json`
- **📡 API Endpoint**: N/A
- **🔄 Operations**: Read-only
- **📊 Structure**: UI component library settings
- **✅ Status**: ✅ System file

### 20. **Firebase Configuration Files**
- **📄 Files**: `firebase.json`, `lib/firebase.ts`, `lib/firebase-admin.ts`
- **📡 API Endpoint**: N/A
- **🔄 Operations**: System configuration
- **📊 Structure**: Firebase Auth + Admin SDK setup
- **✅ Status**: ✅ Active - Supports both Auth and Firestore
- **🔥 Features**: Auto-fallback to JSON when credentials unavailable

---

## 🚀 **Quick Reference: API Usage**

### **🔥 Firebase-Powered APIs (with JSON fallback)**
```bash
# Menu data (Firebase + JSON fallback)
curl http://localhost:3000/api/menu

# Menu availability (Firebase + JSON fallback)
curl http://localhost:3000/api/menu-availability

# Get specific menu item
curl "http://localhost:3000/api/menu?itemNo=001"

# Get specific category
curl "http://localhost:3000/api/menu?category=Breakfast"
```

### **📋 JSON-Only APIs**
```bash
# Orders
curl http://localhost:3000/api/orders

# Inventory
curl http://localhost:3000/api/inventory

# Analytics (auto-generated)
curl http://localhost:3000/api/analytics

# All other endpoints follow similar pattern
curl http://localhost:3000/api/{endpoint-name}
```

### **🔥 Firebase Operations (with JSON fallback)**
```bash
# Create single menu item (Firebase)
curl -X POST http://localhost:3000/api/menu \
  -H "Content-Type: application/json" \
  -d '{
    "itemNo": "999",
    "name": "Special Dish",
    "rate": "200",
    "category": "Specials",
    "available": true
  }'

# Bulk upload menu (Firebase)
curl -X POST http://localhost:3000/api/menu \
  -H "Content-Type: application/json" \
  -d '{"menu": [{"category": "Test", "products": [...]}]}'

# Update item availability (Firebase)
curl -X POST http://localhost:3000/api/menu-availability \
  -H "Content-Type: application/json" \
  -d '{
    "itemNo": "001",
    "available": false,
    "price": "15"
  }'
```

### **📋 JSON-Only Operations**
```bash
# Create new order
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{"items": [...], "total": 100}'

# Add inventory item
curl -X POST http://localhost:3000/api/inventory \
  -H "Content-Type: application/json" \
  -d '{"name": "New Item", "category": "Category"}'
```

### **🔥 Firebase Update Operations**
```bash
# Update menu item (Firebase)
curl -X PUT http://localhost:3000/api/menu \
  -H "Content-Type: application/json" \
  -d '{
    "itemNo": "001",
    "name": "Updated Name",
    "rate": "25",
    "available": false
  }'

# Bulk update availability (Firebase)
curl -X PUT http://localhost:3000/api/menu-availability \
  -H "Content-Type: application/json" \
  -d '[
    {"itemNo": "001", "available": false},
    {"itemNo": "002", "price": "15"}
  ]'
```

### **📋 JSON Update Operations**
```bash
# Update existing order
curl -X PUT http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{"id": "order-123", "status": "completed"}'

# Update inventory item
curl -X PUT http://localhost:3000/api/inventory \
  -H "Content-Type: application/json" \
  -d '{"id": "inv_001", "currentStock": 50}'
```

### **🔥 Firebase Delete Operations**
```bash
# Delete menu item (Firebase)
curl -X DELETE "http://localhost:3000/api/menu?itemNo=999"
```

### **📋 JSON Delete Operations**
```bash
# Delete order
curl -X DELETE http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{"id": "order-123"}'
```

---

## 📁 **File Structure Overview**

```
BloomCafeNextJS/
├── 🔥 **HYBRID FIREBASE + JSON**
├── 📄 menu.json                    # Menu data (Firebase fallback)
├── 📄 menu-availability.json       # Availability (Firebase fallback)
├── 📄 orders.json                  # Order history (JSON only)
├── 📄 analytics_data.json          # Auto-generated analytics
├── 📄 combos.json                  # Combo offers
├── 📄 todays-special.json          # Daily specials
├── 📄 offers.json                  # Special offers
├── 📄 tasks.json                   # Staff tasks
├── 📄 staff-credentials.json       # Staff login data
├── 📂 data/
│   ├── 📄 inventory.json           # Inventory management
│   ├── 📄 customer-reviews.json    # Customer feedback
│   ├── 📄 event-bookings.json      # Event reservations
│   ├── 📄 gallery.json             # Image gallery
│   ├── 📄 blog-posts.json          # Blog content
│   └── 📄 about-us-content.json    # Company info
├── 📂 lib/
│   ├── 🔥 firebase.ts              # Client-side Firebase config
│   └── 🔥 firebase-admin.ts        # Server-side Firebase Admin
├── 📂 scripts/
│   ├── 🔥 migrate-menu-to-firebase.js     # Firebase migration
│   └── 🔥 migrate-to-firestore.js         # Firestore migration
└── 📂 app/api/
   ├── 🔥 menu/                     # Firebase + JSON hybrid
   ├── 🔥 menu-availability/        # Firebase + JSON hybrid
   ├── 📂 orders/                   # JSON only
   ├── 📂 inventory/                # JSON only
   ├── 📂 analytics/                # JSON only
   └── ... (20+ API endpoints)
```

---

## 🔧 **Current System Architecture**

### 🔥 **Firebase Integration Status**
- ✅ **Firebase Auth**: Email/password + Google Sign-in functional
- 🔥 **Firebase Admin SDK**: Server-side with credentials handling
- 🔥 **Firestore Database**: Menu & availability data with auto-fallback
- 🔥 **Hybrid System**: Firebase primary, JSON fallback when no credentials
- ✅ **Migration Scripts**: Available for Firebase data migration
- ✅ **Auto-Fallback**: Graceful JSON fallback when Firebase unavailable

### 📋 **JSON-Only Systems**
- ✅ **Orders Management**: Pure JSON file operations
- ✅ **Inventory System**: JSON-based with full CRUD
- ✅ **Analytics**: Auto-generated from order data
- ✅ **Staff Management**: JSON-based credentials and tasks
- ✅ **Content Management**: Blog, reviews, gallery via JSON

### 🔧 **Configuration Options**
- 🔥 **Firebase Toggle**: Set `USE_FIREBASE = false` to disable Firebase
- 📋 **JSON Fallback**: Automatic when Firebase credentials unavailable
- 🔑 **Credential Options**: Service Account, ADC, or JSON-only mode
- ✅ **Development Ready**: Works with or without Firebase setup

### 🔐 **Authentication Status**
- ✅ **Firebase Auth**: Email/password login functional
- ✅ **Google Sign-in**: Available
- 🔥 **Firebase Session**: Persistent user sessions
- ⚠️ **Customer Profiles**: Firebase Auth only (no additional storage)

---

## 📖 **Usage Notes**

1. **🔥 Hybrid System**: Menu data uses Firebase Firestore with JSON fallback
2. **📋 JSON Primary**: Orders, inventory, and other data remain JSON-based
3. **🔑 Credential Flexibility**: Works with service accounts, ADC, or no Firebase
4. **⚡ Auto-Fallback**: Seamless fallback to JSON when Firebase unavailable
5. **🔄 Migration Tools**: Scripts available for Firebase data migration
6. **📊 Real-time Potential**: Firebase enables real-time updates when available
7. **🛡️ Error Handling**: Robust error handling with fallback mechanisms
8. **🔧 Easy Toggle**: Switch between Firebase and JSON-only modes
9. **📈 Scalable**: Firebase provides scalability while maintaining JSON simplicity

---

## 🛠️ **Development Commands**

### **🔥 Firebase Operations**
```bash
# Migrate menu data to Firebase
npm run migrate:menu

# Full Firestore migration
npm run migrate:firestore

# Verify Firebase migration
npm run migrate:verify

# Backup before migration
npm run migrate:backup

# Force migration (overwrite existing)
npm run migrate:force
```

### **📋 Standard Development**
```bash
# Start development server
npm run dev

# Build for production
npm run build

# View all JSON files
find . -name "*.json" -not -path "./node_modules/*"

# Test Firebase-enabled API
curl http://localhost:3000/api/menu

# Test with specific parameters
curl "http://localhost:3000/api/menu?category=Breakfast"
curl "http://localhost:3000/api/menu?itemNo=001"
```

---

**🎯 Total Active Data Files**: 16 JSON files  
**📡 Total API Endpoints**: 20+ endpoints  
**🔥 Firebase-Powered Endpoints**: 2 (Menu, Menu-Availability)  
**📋 JSON-Only Endpoints**: 18+ endpoints  
**🔄 Total CRUD Operations**: 60+ operations  
**✅ System Status**: 🔥 **Hybrid Firebase + JSON Active**
