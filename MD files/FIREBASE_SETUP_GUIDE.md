# 🔥 Firebase Setup Guide - Fix Authentication Error

## 🚨 Current Issue
You're getting this error because Firebase Admin SDK needs proper authentication:
```
Error: Could not load the default credentials
```

## 🔧 **SOLUTION 1: Quick Fix for Development (Recommended)**

Replace your entire `.env.local` file with this content:

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

# Development mode - disable admin SDK strict authentication
FIREBASE_AUTH_EMULATOR_HOST=127.0.0.1:9099
FIRESTORE_EMULATOR_HOST=127.0.0.1:8080

# Disable editor warnings
REACT_EDITOR=none
```

## 🔧 **SOLUTION 2: Get Service Account Key (Production Ready)**

### Step 1: Get Firebase Service Account Key

1. Go to [Firebase Console](https://console.firebase.google.com/project/bloom-graden-cafe-user-login/settings/serviceaccounts/adminsdk)
2. Click "Generate new private key"
3. Download the JSON file
4. Copy the JSON content

### Step 2: Add to Environment Variables

Add these to your `.env.local`:

```env
# ... (keep existing NEXT_PUBLIC_ variables above)

# Firebase Admin SDK with Service Account
FIREBASE_PROJECT_ID=bloom-graden-cafe-user-login
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@bloom-graden-cafe-user-login.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"
```

## 🔧 **SOLUTION 3: Use Google Cloud CLI (Alternative)**

Install and configure Google Cloud CLI:

```bash
# Install gcloud CLI (Ubuntu/Debian)
curl https://sdk.cloud.google.com | bash
exec -l $SHELL

# Initialize and authenticate
gcloud init
gcloud auth application-default login

# Set project
gcloud config set project bloom-graden-cafe-user-login
```

## ✅ **Quick Test to Verify Fix**

After applying any solution, test:

```bash
# Restart your dev server
npm run dev

# Test API in another terminal
curl "http://localhost:3001/api/menu-availability"
```

You should see data instead of the error.

## 🎯 **Which Solution to Use?**

- **Development**: Use Solution 1 (emulator config)
- **Production**: Use Solution 2 (service account key)
- **Team Development**: Use Solution 3 (gcloud CLI)

## 📋 **Current Status Check**

Run this to see your current environment:

```bash
echo "🔍 Current .env.local content:"
cat .env.local
echo ""
echo "🔍 Firebase environment variables:"
env | grep FIREBASE
```

---

Choose **Solution 1** for the quickest fix to get your app working immediately!
