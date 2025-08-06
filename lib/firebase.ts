import { initializeApp, getApps } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getDatabase } from 'firebase/database'

const firebaseConfig = {
  apiKey: "AIzaSyA8mwcfmiULd-NZKIv1bI2RBJsFnLxbfeg",
  authDomain: "bloom-graden-cafe-user-login.firebaseapp.com",
  databaseURL: "https://bloom-graden-cafe-user-login-default-rtdb.firebaseio.com/",
  projectId: "bloom-graden-cafe-user-login",
  storageBucket: "bloom-graden-cafe-user-login.firebasestorage.app",
  messagingSenderId: "939336590102",
  appId: "1:939336590102:web:7c702aaaa3161b626ca637",
}

// Debug environment variables
console.log('🔍 Environment Variables Debug:')
console.log('API_KEY:', process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? '✅ Found' : '❌ Missing')
console.log('AUTH_DOMAIN:', process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ? '✅ Found' : '❌ Missing')
console.log('PROJECT_ID:', process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? '✅ Found' : '❌ Missing')
console.log('APP_ID:', process.env.NEXT_PUBLIC_FIREBASE_APP_ID ? '✅ Found' : '❌ Missing')

// Validate Firebase configuration (temporarily disabled)
/*
const requiredEnvVars = [
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'NEXT_PUBLIC_FIREBASE_APP_ID'
]

for (const envVar of requiredEnvVars) {
  const value = process.env[envVar]
  console.log(`Checking ${envVar}:`, value ? `"${value.substring(0, 10)}..."` : 'UNDEFINED')
  
  if (!value || value.includes('your-')) {
    console.error(`❌ Firebase Error: ${envVar} is not properly configured in .env.local`)
    console.log('📋 Please follow these steps:')
    console.log('1. Go to https://console.firebase.google.com/')
    console.log('2. Create or select your project')
    console.log('3. Go to Project Settings > General > Your apps')
    console.log('4. Copy the config values to .env.local')
    console.log('5. Restart the development server')
    throw new Error(`Missing Firebase configuration: ${envVar}`)
  }
}
*/

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app)

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app)

// Initialize Firebase Realtime Database and get a reference to the service
export const database = getDatabase(app)

export default app
