# 🔥 Firebase Credentials Guide - Where to Find Everything

## 🔍 **Current Status Analysis**

Your `.env.local` file has **CLIENT SDK credentials** but is **MISSING ADMIN SDK credentials** for production.

### ✅ **What You Have (Client SDK - Working for Development):**
- `NEXT_PUBLIC_FIREBASE_API_KEY` ✅
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` ✅ 
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID` ✅
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` ✅
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` ✅
- `NEXT_PUBLIC_FIREBASE_APP_ID` ✅
- `NEXT_PUBLIC_FIREBASE_DATABASE_URL` ✅

### ❌ **What's Missing (Admin SDK - Needed for Production):**
- `FIREBASE_CLIENT_EMAIL` ❌
- `FIREBASE_PRIVATE_KEY` ❌

---

## 🔗 **Where to Find Each Credential in Firebase Console**

### **🌐 Part 1: Client SDK Credentials (You Already Have These)**

**Location:** Firebase Console → Project Settings → General → Your Apps → Web App

1. Go to: https://console.firebase.google.com/project/bloom-graden-cafe-user-login/settings/general
2. Scroll down to "Your apps" section
3. Click on your web app (🌐 icon)
4. You'll see the config object:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyA8mwcfmiULd-NZKIv1bI2RBJsFnLxbfeg",           // ✅ You have this
  authDomain: "bloom-graden-cafe-user-login.firebaseapp.com",   // ✅ You have this  
  projectId: "bloom-graden-cafe-user-login",                    // ✅ You have this
  storageBucket: "bloom-graden-cafe-user-login.firebasestorage.app", // ✅ You have this
  messagingSenderId: "939336590102",                            // ✅ You have this
  appId: "1:939336590102:web:7c702aaaa3161b626ca637",          // ✅ You have this
  databaseURL: "https://bloom-graden-cafe-user-login-default-rtdb.firebaseio.com/" // ✅ You have this
};
```

### **🔑 Part 2: Admin SDK Credentials (MISSING - For Production)**

**Location:** Firebase Console → Project Settings → Service Accounts

#### Step-by-Step Instructions:

1. **Go to Service Accounts:**
   - URL: https://console.firebase.google.com/project/bloom-graden-cafe-user-login/settings/serviceaccounts/adminsdk
   
2. **Generate New Private Key:**
   - Click "Generate new private key" button
   - Click "Generate key" in the popup
   - A JSON file will be downloaded

3. **Extract Credentials from Downloaded JSON:**
   The JSON file looks like this:
   ```json
   {
     "type": "service_account",
     "project_id": "bloom-graden-cafe-user-login",
     "private_key_id": "abcd1234...",
     "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BA...\n-----END PRIVATE KEY-----\n",
     "client_email": "firebase-adminsdk-xyz@bloom-graden-cafe-user-login.iam.gserviceaccount.com",
     "client_id": "123456789...",
     "auth_uri": "https://accounts.google.com/o/oauth2/auth",
     "token_uri": "https://oauth2.googleapis.com/token",
     // ... more fields
   }
   ```

4. **Copy These Values:**
   - `client_email` → goes to `FIREBASE_CLIENT_EMAIL`
   - `private_key` → goes to `FIREBASE_PRIVATE_KEY`

---

## 📝 **Complete .env.local Template**

Here's what your **complete** `.env.local` should look like:

```env
# Firebase Client SDK Configuration (for frontend)
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyA8mwcfmiULd-NZKIv1bI2RBJsFnLxbfeg
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=bloom-graden-cafe-user-login.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=bloom-graden-cafe-user-login
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=bloom-graden-cafe-user-login.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=939336590102
NEXT_PUBLIC_FIREBASE_APP_ID=1:939336590102:web:7c702aaaa3161b626ca637
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://bloom-graden-cafe-user-login-default-rtdb.firebaseio.com/

# Firebase Admin SDK Configuration (for API routes)
FIREBASE_PROJECT_ID=bloom-graden-cafe-user-login
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@bloom-graden-cafe-user-login.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_ACTUAL_PRIVATE_KEY_CONTENT_HERE\n-----END PRIVATE KEY-----\n"

# Disable editor integration
REACT_EDITOR=none
```

---

## 🎯 **Quick Action Steps**

### **Option 1: Get the Missing Credentials (Recommended)**

1. **Go to:** https://console.firebase.google.com/project/bloom-graden-cafe-user-login/settings/serviceaccounts/adminsdk

2. **Click:** "Generate new private key"

3. **Download** the JSON file

4. **Copy** `client_email` and `private_key` from the JSON

5. **Add** them to your `.env.local` file

### **Option 2: Continue with Development Mode (Current Setup)**

Your current setup works for development because:
- ✅ Client SDK credentials are complete
- ✅ Fallback to JSON files works
- ✅ All your data is migrated to Firebase

---

## 🔍 **Visual Firebase Console Navigation**

```
Firebase Console
├── 🏠 Project Overview
├── ⚙️ Project Settings
│   ├── 📋 General (← Client SDK credentials here)
│   │   └── Your Apps → Web App Config
│   └── 🔑 Service Accounts (← Admin SDK credentials here)
│       └── Generate new private key
├── 🔥 Firestore Database (← Your data is here)
├── 🔐 Authentication
└── 📊 Analytics
```

---

## ✅ **Testing Your Setup**

After adding credentials, test with:

```bash
# Restart dev server
npm run dev

# Test API
curl "http://localhost:3001/api/menu" | head -20
```

---

## 📋 **Summary**

**For Development:** Your current setup works fine!

**For Production:** You need to add the `FIREBASE_CLIENT_EMAIL` and `FIREBASE_PRIVATE_KEY` from the service account JSON.

**Priority:** The missing credentials are only needed for production deployment. Your development environment is working correctly with the current configuration.
