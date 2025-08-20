import { initializeApp, getApps, App } from 'firebase-admin/app'
import { getFirestore, Firestore } from 'firebase-admin/firestore'
import { credential } from 'firebase-admin'

let adminApp: App | null = null
let adminDb: Firestore | null = null
let firebaseAvailable = false

// Check if Firebase credentials are available
function checkFirebaseCredentials(): boolean {
  // Check for service account credentials in environment
  if (process.env.FIREBASE_PROJECT_ID && 
      process.env.FIREBASE_CLIENT_EMAIL && 
      process.env.FIREBASE_PRIVATE_KEY) {
    return true
  }
  
  // Check for GOOGLE_APPLICATION_CREDENTIALS
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    return true
  }
  
  // For development, we'll assume ADC might work, but handle gracefully
  return false
}

// Initialize Firebase Admin SDK with error handling
function initializeFirebaseAdmin() {
  if (getApps().length > 0) {
    adminApp = getApps()[0]
    adminDb = getFirestore(adminApp)
    firebaseAvailable = true
    return { adminApp, adminDb, firebaseAvailable }
  }

  try {
    const hasCredentials = checkFirebaseCredentials()
    
    if (hasCredentials) {
      console.log('🔑 Firebase credentials found, initializing with service account')
      adminApp = initializeApp({
        projectId: process.env.FIREBASE_PROJECT_ID || 'bloom-graden-cafe-user-login',
        credential: credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID || 'bloom-graden-cafe-user-login',
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
      })
    } else {
      console.log('🔑 Attempting to use Application Default Credentials (ADC)')
      adminApp = initializeApp({
        projectId: 'bloom-graden-cafe-user-login',
      })
    }
    
    adminDb = getFirestore(adminApp)
    firebaseAvailable = true
    console.log('✅ Firebase Admin SDK initialized successfully')
    
  } catch (error) {
    console.warn('⚠️ Firebase Admin SDK initialization failed:', error.message)
    console.log('📋 Falling back to JSON file operations')
    firebaseAvailable = false
    adminApp = null
    adminDb = null
  }
  
  return { adminApp, adminDb, firebaseAvailable }
}

// Test Firebase connection
export async function testFirebaseConnection(): Promise<boolean> {
  if (!firebaseAvailable || !adminDb) {
    return false
  }
  
  try {
    // Try a simple operation to test connection
    await adminDb.collection('_test').limit(1).get()
    return true
  } catch (error) {
    console.warn('⚠️ Firebase connection test failed:', error.message)
    return false
  }
}

// Initialize on import
const { adminApp: app, adminDb: db, firebaseAvailable: available } = initializeFirebaseAdmin()

export { 
  app as adminApp, 
  db as adminDb, 
  available as firebaseAvailable
}
export default app
