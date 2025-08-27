// Firebase Admin has been disconnected - using JSON files for data storage
// This file provides stub exports to prevent import errors

console.log('📋 Firebase Admin disconnected - using JSON file storage')

// Stub exports to prevent import errors in existing code
export const adminApp = null
export const adminDb = null
export const firebaseAvailable = false

// Test Firebase connection (always returns false now)
export async function testFirebaseConnection(): Promise<boolean> {
  return false
}

// Default export as null
const app = null
export default app
