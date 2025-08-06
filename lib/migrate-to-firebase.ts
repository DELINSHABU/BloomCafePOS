import { database } from './firebase'
import { ref, set, get } from 'firebase/database'
import { promises as fs } from 'fs'
import path from 'path'

/**
 * Utility to migrate existing local JSON orders to Firebase Realtime Database
 */
export async function migrateOrdersToFirebase() {
  try {
    console.log('🔄 Starting migration of orders to Firebase...')
    
    // Path to local orders.json file
    const ordersFilePath = path.join(process.cwd(), 'orders.json')
    
    // Check if local orders file exists
    try {
      await fs.access(ordersFilePath)
    } catch (error) {
      console.log('📄 No local orders.json file found. Nothing to migrate.')
      return { success: true, message: 'No local data to migrate' }
    }
    
    // Read local orders data
    const localData = await fs.readFile(ordersFilePath, 'utf8')
    const ordersData = JSON.parse(localData)
    
    if (!ordersData.orders || ordersData.orders.length === 0) {
      console.log('📄 No orders found in local file. Nothing to migrate.')
      return { success: true, message: 'No orders to migrate' }
    }
    
    console.log(`📦 Found ${ordersData.orders.length} orders to migrate`)
    
    // Check if Firebase already has orders data
    const firebaseOrdersRef = ref(database, 'orders')
    const existingSnapshot = await get(firebaseOrdersRef)
    
    if (existingSnapshot.exists()) {
      const existingOrders = existingSnapshot.val()
      const existingCount = Object.keys(existingOrders).length
      console.log(`⚠️  Firebase already has ${existingCount} orders. Merging with local data...`)
    }
    
    // Transform orders array to object with order IDs as keys
    const ordersObject: { [key: string]: any } = {}
    
    ordersData.orders.forEach((order: any) => {
      // Use order ID as the key
      const orderId = order.id || `migrated-${Math.random().toString(36).substr(2, 9)}`
      ordersObject[orderId] = {
        ...order,
        id: orderId, // Ensure ID is present
        migrated: true,
        migratedAt: new Date().toISOString()
      }
    })
    
    // Upload to Firebase
    await set(firebaseOrdersRef, ordersObject)
    
    console.log('✅ Successfully migrated orders to Firebase!')
    console.log(`📊 Migrated ${Object.keys(ordersObject).length} orders`)
    
    // Also migrate analytics if it exists
    const analyticsFilePath = path.join(process.cwd(), 'analytics_data.json')
    
    try {
      await fs.access(analyticsFilePath)
      const analyticsData = await fs.readFile(analyticsFilePath, 'utf8')
      const analytics = JSON.parse(analyticsData)
      
      const analyticsRef = ref(database, 'analytics')
      await set(analyticsRef, {
        ...analytics,
        migrated: true,
        migratedAt: new Date().toISOString()
      })
      
      console.log('✅ Successfully migrated analytics data to Firebase!')
    } catch (error) {
      console.log('📄 No analytics_data.json file found. Skipping analytics migration.')
    }
    
    // Also migrate todays-special if it exists
    const todaysSpecialFilePath = path.join(process.cwd(), 'todays-special.json')
    
    try {
      await fs.access(todaysSpecialFilePath)
      const todaysSpecialData = await fs.readFile(todaysSpecialFilePath, 'utf8')
      const todaysSpecial = JSON.parse(todaysSpecialData)
      
      const todaysSpecialRef = ref(database, 'todays-special')
      await set(todaysSpecialRef, todaysSpecial)
      
      console.log('✅ Successfully migrated todays-special data to Firebase!')
    } catch (error) {
      console.log('📄 No todays-special.json file found. Skipping todays-special migration.')
    }
    
    // Create backup of local files
    const backupDir = path.join(process.cwd(), 'backup')
    try {
      await fs.mkdir(backupDir, { recursive: true })
      
      // Copy orders.json to backup
      await fs.copyFile(
        ordersFilePath,
        path.join(backupDir, `orders-backup-${Date.now()}.json`)
      )
      
      console.log('💾 Created backup of local orders.json file')
    } catch (error) {
      console.warn('⚠️  Could not create backup:', error)
    }
    
    return {
      success: true,
      message: `Successfully migrated ${Object.keys(ordersObject).length} orders to Firebase`,
      migratedCount: Object.keys(ordersObject).length
    }
    
  } catch (error) {
    console.error('❌ Error during migration:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error during migration'
    }
  }
}

/**
 * Utility to verify Firebase connection and data
 */
export async function verifyFirebaseConnection() {
  try {
    console.log('🔍 Verifying Firebase connection...')
    
    const ordersRef = ref(database, 'orders')
    const snapshot = await get(ordersRef)
    
    if (snapshot.exists()) {
      const orders = snapshot.val()
      const orderCount = Object.keys(orders).length
      console.log(`✅ Firebase connected successfully! Found ${orderCount} orders`)
      return { success: true, orderCount }
    } else {
      console.log('📄 Firebase connected but no orders found')
      return { success: true, orderCount: 0 }
    }
  } catch (error) {
    console.error('❌ Firebase connection failed:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown connection error'
    }
  }
}

/**
 * Utility to test Firebase write operations
 */
export async function testFirebaseWrite() {
  try {
    console.log('🧪 Testing Firebase write operations...')
    
    const testRef = ref(database, 'test')
    const testData = {
      message: 'Firebase write test',
      timestamp: new Date().toISOString()
    }
    
    await set(testRef, testData)
    
    // Read back to verify
    const snapshot = await get(testRef)
    
    if (snapshot.exists() && snapshot.val().message === testData.message) {
      // Clean up test data
      await set(testRef, null)
      console.log('✅ Firebase write test successful!')
      return { success: true }
    } else {
      console.log('❌ Firebase write test failed - data mismatch')
      return { success: false, error: 'Data verification failed' }
    }
  } catch (error) {
    console.error('❌ Firebase write test failed:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown write error'
    }
  }
}
