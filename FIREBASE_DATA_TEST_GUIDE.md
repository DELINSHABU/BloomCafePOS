# 🧪 Firebase Data Testing Guide

## 📊 **What We Migrated to Firebase Database**

Based on our successful migration, here are **all 8 collections** now in Firebase Firestore:

| # | Collection | Items | Source File | API Endpoint | Status |
|---|------------|-------|-------------|--------------|--------|
| 1 | **menu** | 265 items | `menu.json` | `/api/menu` | ✅ Migrated |
| 2 | **menu-availability** | 5 items | `menu-availability.json` | `/api/menu-availability` | ✅ Migrated |
| 3 | **orders** | 148 items | `orders.json` | `/api/orders` | ✅ Migrated |
| 4 | **inventory** | 15 items | `data/inventory.json` | `/api/inventory` | ✅ Migrated |
| 5 | **blog-posts** | 6 items | `data/blog-posts.json` | `/api/blog-posts` | ✅ Migrated |
| 6 | **reviews** | 6 items | `data/customer-reviews.json` | `/api/customer-reviews` | ✅ Migrated |
| 7 | **staff** | 18 items | `staff-credentials.json` | `/api/load-credentials` | ✅ Migrated |
| 8 | **tasks** | 10 items | `tasks.json` | `/api/tasks` | ✅ Migrated |

**TOTAL: 473 items migrated successfully** 🎉

---

## 🧪 **Firebase vs JSON Testing Commands**

### **Setup: Start Your Dev Server**
```bash
cd "/home/delin/Documents/GitHub/BloomCafeNextJS (copy)"
npm run dev
```

Then open **another terminal** for testing.

---

### **Test 1: 📋 Menu Data (265 items)**
```bash
# Test menu API
curl -s "http://localhost:3001/api/menu" | head -20

# Test specific category
curl -s "http://localhost:3001/api/menu?category=Breakfast" | jq

# Expected: Should show menu items with Firebase timestamp
# Look for: "source": "firebase" in response
```

**What to Look For:**
- ✅ Menu items load
- ✅ Categories are organized
- ✅ Firebase source indicator
- ❌ Any error messages

---

### **Test 2: 🔄 Menu Availability (5 items)**
```bash
# Test availability API
curl -s "http://localhost:3001/api/menu-availability" | jq

# Expected: Should show availability data
# Look for: Firebase timestamps and availability status
```

---

### **Test 3: 📦 Orders Data (148 items)**
```bash
# Test orders API
curl -s "http://localhost:3001/api/orders" | head -50

# Expected: Should show order history
# Look for: Order details, timestamps, customer info
```

---

### **Test 4: 📦 Inventory Data (15 items)**
```bash
# Test inventory API
curl -s "http://localhost:3001/api/inventory" | jq

# Expected: Should show inventory items
# Look for: Stock levels, suppliers, categories
```

---

### **Test 5: 📝 Blog Posts (6 items)**
```bash
# Test blog API
curl -s "http://localhost:3001/api/blog-posts" | jq

# Expected: Should show blog articles
# Look for: Titles, content, publish dates
```

---

### **Test 6: ⭐ Customer Reviews (6 items)**
```bash
# Test reviews API
curl -s "http://localhost:3001/api/customer-reviews" | jq

# Expected: Should show customer feedback
# Look for: Ratings, comments, customer names
```

---

### **Test 7: 👥 Staff Data (18 items)**
```bash
# Test staff API
curl -s "http://localhost:3001/api/load-credentials" | jq

# Expected: Should show staff members
# Look for: Usernames, roles, names (passwords excluded)
```

---

### **Test 8: ✅ Tasks Data (10 items)**
```bash
# Test tasks API
curl -s "http://localhost:3001/api/tasks" | jq

# Expected: Should show assigned tasks
# Look for: Task descriptions, assignments, status
```

---

## 🔍 **How to Tell If Data is from Firebase vs JSON**

### **Firebase Indicators:**
- ✅ Response contains `"source": "firebase"`
- ✅ Firebase timestamps (ISO format)
- ✅ `migratedAt` field in documents
- ✅ Console shows: "✅ Firebase Admin SDK initialized"

### **JSON Fallback Indicators:**
- ⚠️ Response contains `"source": "json"` or `"source": "local"`
- ⚠️ Console shows: "⚠️ Firebase failed, falling back to JSON"
- ⚠️ No Firebase timestamps
- ⚠️ Original JSON structure preserved

---

## 🔥 **Direct Firebase Console Verification**

**Check your data directly in Firebase Console:**

1. **Go to:** https://console.firebase.google.com/project/bloom-graden-cafe-user-login/firestore

2. **You should see 8 collections:**
   - `menu` (265 documents)
   - `orders` (148 documents)
   - `inventory` (15 documents)
   - `blog-posts` (6 documents)
   - `reviews` (6 documents)
   - `staff` (18 documents)
   - `tasks` (10 documents)
   - `admin` (1 document - migration metadata)

3. **Click on any collection** to browse the data

---

## 🚀 **Quick Test All APIs Script**

Create and run this test script:

```bash
# Save this as test-firebase.sh
#!/bin/bash

echo "🧪 TESTING ALL FIREBASE APIs"
echo "============================"

APIs=(
  "menu"
  "menu-availability"
  "orders"
  "inventory"
  "blog-posts"
  "customer-reviews"
  "load-credentials"
  "tasks"
)

for api in "${APIs[@]}"; do
  echo ""
  echo "🔍 Testing /api/$api"
  echo "-------------------"
  response=$(curl -s "http://localhost:3001/api/$api" | head -5)
  if [[ $response == *"error"* ]] || [[ -z "$response" ]]; then
    echo "❌ FAILED or NO DATA"
  else
    echo "✅ SUCCESS - Data loaded"
    # Check if it's from Firebase or JSON
    if [[ $response == *"firebase"* ]]; then
      echo "📊 Source: FIREBASE"
    else
      echo "📄 Source: JSON FALLBACK"
    fi
  fi
done

echo ""
echo "🏁 Test complete!"
```

**Run the script:**
```bash
chmod +x test-firebase.sh
./test-firebase.sh
```

---

## 📊 **Migration Verification Report**

Run this to get a summary:

```bash
echo "📊 FIREBASE MIGRATION VERIFICATION"
echo "================================="
echo ""
echo "🔥 Firebase Collections:"
echo "  - menu: 265 items"
echo "  - orders: 148 items"
echo "  - inventory: 15 items"
echo "  - blog-posts: 6 items"
echo "  - reviews: 6 items"
echo "  - staff: 18 items"
echo "  - tasks: 10 items"
echo "  - admin: 1 metadata doc"
echo ""
echo "📊 Total: 473 items migrated"
echo ""
echo "🔗 Firebase Console:"
echo "https://console.firebase.google.com/project/bloom-graden-cafe-user-login/firestore"
```

---

## 🎯 **Expected Test Results**

### **✅ SUCCESS (Firebase Working):**
- All 8 APIs return data
- Console shows Firebase initialization success
- Data includes Firebase timestamps
- Response contains `"source": "firebase"`

### **⚠️ FALLBACK (JSON Working):**
- APIs still work but show JSON fallback messages
- Console shows Firebase connection warnings
- Data comes from original JSON files
- Response contains `"source": "json"`

### **❌ FAILURE:**
- APIs return errors
- No data loaded
- Console shows API route errors

---

## 🔧 **Troubleshooting**

If tests fail:

1. **Check dev server is running:**
   ```bash
   curl -s http://localhost:3001/api/health || echo "Server not running"
   ```

2. **Check Firebase connection:**
   ```bash
   # Look for these in dev server console:
   # ✅ "Firebase Admin SDK initialized successfully"
   # OR ⚠️ "Firebase failed, falling back to JSON"
   ```

3. **Verify environment:**
   ```bash
   cat .env.local | grep FIREBASE
   ```

Your migration is complete - now test everything to make sure it's working! 🚀
