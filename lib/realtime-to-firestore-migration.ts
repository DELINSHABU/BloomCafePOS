import { database, db } from './firebase'
import { ref, get } from 'firebase/database'
import { 
  collection, 
  doc, 
  writeBatch, 
  setDoc, 
  getDocs, 
  addDoc,
  connectFirestoreEmulator 
} from 'firebase/firestore'
import { promises as fs } from 'fs'
import path from 'path'

interface MigrationResult {
  success: boolean
  message?: string
  error?: string
  migratedCollections?: string[]
  totalDocuments?: number
}

interface CollectionMigrationStats {
  name: string
  documentsCount: number
  success: boolean
  error?: string
}

/**
 * Main function to migrate all data from Firebase Realtime Database to Cloud Firestore
 */
export async function migrateRealtimeToFirestore(): Promise<MigrationResult> {
  try {
    console.log('🚀 Starting migration from Firebase Realtime Database to Cloud Firestore...')
    
    const migrationStats: CollectionMigrationStats[] = []
    let totalDocuments = 0

    // Step 1: Migrate data from Realtime Database (if any exists)
    console.log('📡 Fetching data from Firebase Realtime Database...')
    const realtimeData = await fetchAllRealtimeData()
    
    if (realtimeData) {
      const realtimeStats = await migrateRealtimeDataToFirestore(realtimeData)
      migrationStats.push(...realtimeStats)
      totalDocuments += realtimeStats.reduce((sum, stat) => sum + stat.documentsCount, 0)
    }

    // Step 2: Migrate local JSON files to Firestore
    console.log('📁 Migrating local JSON files to Cloud Firestore...')
    const jsonFileStats = await migrateJsonFilesToFirestore()
    migrationStats.push(...jsonFileStats)
    totalDocuments += jsonFileStats.reduce((sum, stat) => sum + stat.documentsCount, 0)

    const successfulMigrations = migrationStats.filter(stat => stat.success)
    const failedMigrations = migrationStats.filter(stat => !stat.success)

    console.log('\n📊 Migration Summary:')
    console.log(`✅ Successfully migrated ${successfulMigrations.length} collections`)
    console.log(`❌ Failed to migrate ${failedMigrations.length} collections`)
    console.log(`📦 Total documents migrated: ${totalDocuments}`)

    if (failedMigrations.length > 0) {
      console.log('\n❌ Failed collections:')
      failedMigrations.forEach(stat => console.log(`  - ${stat.name}: ${stat.error}`))
    }

    return {
      success: true,
      message: `Migration completed! ${successfulMigrations.length}/${migrationStats.length} collections migrated successfully`,
      migratedCollections: successfulMigrations.map(stat => stat.name),
      totalDocuments
    }

  } catch (error) {
    console.error('❌ Migration failed:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown migration error'
    }
  }
}

/**
 * Fetch all data from Firebase Realtime Database
 */
async function fetchAllRealtimeData(): Promise<any> {
  try {
    const rootRef = ref(database, '/')
    const snapshot = await get(rootRef)
    
    if (snapshot.exists()) {
      const data = snapshot.val()
      console.log(`📡 Found data in Realtime Database:`, Object.keys(data))
      return data
    } else {
      console.log('📡 No data found in Firebase Realtime Database')
      return null
    }
  } catch (error) {
    console.error('❌ Error fetching Realtime Database data:', error)
    return null
  }
}

/**
 * Migrate Realtime Database data to Firestore
 */
async function migrateRealtimeDataToFirestore(realtimeData: any): Promise<CollectionMigrationStats[]> {
  const stats: CollectionMigrationStats[] = []

  for (const [collectionName, data] of Object.entries(realtimeData)) {
    try {
      console.log(`🔄 Migrating Realtime DB collection: ${collectionName}`)
      
      const collectionRef = collection(db, collectionName)
      const batch = writeBatch(db)
      let documentsCount = 0

      if (Array.isArray(data)) {
        // Handle array data
        data.forEach((item: any, index: number) => {
          const docRef = doc(collectionRef, `${collectionName}_${index}`)
          batch.set(docRef, {
            ...item,
            migratedFrom: 'realtimeDB',
            migratedAt: new Date().toISOString(),
            originalIndex: index
          })
          documentsCount++
        })
      } else if (typeof data === 'object' && data !== null) {
        // Handle object data
        for (const [key, value] of Object.entries(data)) {
          if (typeof value === 'object' && value !== null) {
            const docRef = doc(collectionRef, key)
            batch.set(docRef, {
              ...(value as any),
              migratedFrom: 'realtimeDB',
              migratedAt: new Date().toISOString()
            })
            documentsCount++
          }
        }
      } else {
        // Handle primitive data
        const docRef = doc(collectionRef, 'data')
        batch.set(docRef, {
          value: data,
          migratedFrom: 'realtimeDB',
          migratedAt: new Date().toISOString()
        })
        documentsCount++
      }

      await batch.commit()
      
      stats.push({
        name: collectionName,
        documentsCount,
        success: true
      })
      
      console.log(`✅ Successfully migrated ${documentsCount} documents to collection: ${collectionName}`)
      
    } catch (error) {
      console.error(`❌ Failed to migrate collection ${collectionName}:`, error)
      stats.push({
        name: collectionName,
        documentsCount: 0,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }

  return stats
}

/**
 * Migrate local JSON files to Firestore collections
 */
async function migrateJsonFilesToFirestore(): Promise<CollectionMigrationStats[]> {
  const stats: CollectionMigrationStats[] = []
  
  // Define JSON files to migrate
  const jsonFiles = [
    'menu.json',
    'orders.json',
    'combos.json',
    'offers.json',
    'analytics_data.json',
    'menu-availability.json',
    'todays-special.json',
    'staff-credentials.json'
  ]

  for (const fileName of jsonFiles) {
    try {
      const filePath = path.join(process.cwd(), fileName)
      
      // Check if file exists
      try {
        await fs.access(filePath)
      } catch {
        console.log(`📄 File ${fileName} not found, skipping...`)
        continue
      }

      console.log(`🔄 Migrating ${fileName} to Firestore...`)
      
      const fileContent = await fs.readFile(filePath, 'utf8')
      const jsonData = JSON.parse(fileContent)
      
      // Determine collection name (remove .json extension)
      const collectionName = fileName.replace('.json', '').replace(/-/g, '_')
      
      const migrationStat = await migrateJsonDataToCollection(collectionName, jsonData, fileName)
      stats.push(migrationStat)
      
    } catch (error) {
      console.error(`❌ Failed to migrate ${fileName}:`, error)
      stats.push({
        name: fileName.replace('.json', ''),
        documentsCount: 0,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }

  return stats
}

/**
 * Migrate JSON data to a specific Firestore collection
 */
async function migrateJsonDataToCollection(
  collectionName: string, 
  jsonData: any, 
  sourceFile: string
): Promise<CollectionMigrationStats> {
  try {
    const collectionRef = collection(db, collectionName)
    let documentsCount = 0

    // Handle different data structures
    if (jsonData.orders && Array.isArray(jsonData.orders)) {
      // Orders data
      const batch = writeBatch(db)
      
      jsonData.orders.forEach((order: any) => {
        const docRef = doc(collectionRef, order.id || `order_${Date.now()}_${Math.random()}`)
        batch.set(docRef, {
          ...order,
          migratedFrom: sourceFile,
          migratedAt: new Date().toISOString()
        })
        documentsCount++
      })
      
      await batch.commit()
      
    } else if (jsonData.menu && Array.isArray(jsonData.menu)) {
      // Menu data
      const batch = writeBatch(db)
      
      jsonData.menu.forEach((category: any, categoryIndex: number) => {
        const categoryDocRef = doc(collectionRef, `category_${categoryIndex}`)
        batch.set(categoryDocRef, {
          ...category,
          migratedFrom: sourceFile,
          migratedAt: new Date().toISOString()
        })
        documentsCount++

        // Also create individual product documents if needed
        if (category.products && Array.isArray(category.products)) {
          const productsCollectionRef = collection(db, `${collectionName}_products`)
          category.products.forEach((product: any) => {
            const productDocRef = doc(productsCollectionRef, product.itemNo || `product_${Date.now()}_${Math.random()}`)
            batch.set(productDocRef, {
              ...product,
              category: category.category,
              migratedFrom: sourceFile,
              migratedAt: new Date().toISOString()
            })
            documentsCount++
          })
        }
      })
      
      await batch.commit()
      
    } else if (jsonData.combos && Array.isArray(jsonData.combos)) {
      // Combos data
      const batch = writeBatch(db)
      
      jsonData.combos.forEach((combo: any) => {
        const docRef = doc(collectionRef, combo.id || `combo_${Date.now()}_${Math.random()}`)
        batch.set(docRef, {
          ...combo,
          migratedFrom: sourceFile,
          migratedAt: new Date().toISOString()
        })
        documentsCount++
      })
      
      await batch.commit()
      
    } else if (Array.isArray(jsonData)) {
      // Generic array data
      const batch = writeBatch(db)
      
      jsonData.forEach((item: any, index: number) => {
        const docRef = doc(collectionRef, `${collectionName}_${index}`)
        batch.set(docRef, {
          ...item,
          migratedFrom: sourceFile,
          migratedAt: new Date().toISOString(),
          originalIndex: index
        })
        documentsCount++
      })
      
      await batch.commit()
      
    } else if (typeof jsonData === 'object' && jsonData !== null) {
      // Generic object data
      if (Object.keys(jsonData).length === 1 && Array.isArray(Object.values(jsonData)[0])) {
        // Single key with array value
        const [key, arrayValue] = Object.entries(jsonData)[0]
        const batch = writeBatch(db)
        
        ;(arrayValue as any[]).forEach((item: any, index: number) => {
          const docRef = doc(collectionRef, `${key}_${index}`)
          batch.set(docRef, {
            ...item,
            migratedFrom: sourceFile,
            migratedAt: new Date().toISOString(),
            originalIndex: index
          })
          documentsCount++
        })
        
        await batch.commit()
      } else {
        // Multiple keys or single document
        const docRef = doc(collectionRef, 'data')
        await setDoc(docRef, {
          ...jsonData,
          migratedFrom: sourceFile,
          migratedAt: new Date().toISOString()
        })
        documentsCount = 1
      }
    }

    console.log(`✅ Successfully migrated ${documentsCount} documents to collection: ${collectionName}`)
    
    return {
      name: collectionName,
      documentsCount,
      success: true
    }

  } catch (error) {
    console.error(`❌ Failed to migrate to collection ${collectionName}:`, error)
    return {
      name: collectionName,
      documentsCount: 0,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Verify Firestore collections after migration
 */
export async function verifyFirestoreMigration(): Promise<{ success: boolean; collections: any[] }> {
  try {
    console.log('🔍 Verifying Firestore migration...')
    
    const collections = [
      'menu', 'menu_products', 'orders', 'combos', 'offers', 
      'analytics_data', 'menu_availability', 'todays_special', 'staff_credentials'
    ]
    
    const verificationResults = []
    
    for (const collectionName of collections) {
      try {
        const collectionRef = collection(db, collectionName)
        const snapshot = await getDocs(collectionRef)
        
        verificationResults.push({
          name: collectionName,
          documentCount: snapshot.size,
          exists: snapshot.size > 0
        })
        
        console.log(`📊 Collection '${collectionName}': ${snapshot.size} documents`)
        
      } catch (error) {
        console.warn(`⚠️ Could not verify collection '${collectionName}':`, error)
        verificationResults.push({
          name: collectionName,
          documentCount: 0,
          exists: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }
    
    return {
      success: true,
      collections: verificationResults
    }
    
  } catch (error) {
    console.error('❌ Verification failed:', error)
    return {
      success: false,
      collections: []
    }
  }
}

/**
 * Backup current Firestore data before migration
 */
export async function backupFirestoreData(): Promise<boolean> {
  try {
    console.log('💾 Creating backup of current Firestore data...')
    
    const collections = [
      'menu', 'orders', 'combos', 'offers', 
      'analytics_data', 'menu_availability', 'todays_special', 'staff_credentials'
    ]
    
    const backupData: any = {}
    
    for (const collectionName of collections) {
      try {
        const collectionRef = collection(db, collectionName)
        const snapshot = await getDocs(collectionRef)
        
        if (snapshot.size > 0) {
          backupData[collectionName] = {}
          snapshot.forEach(doc => {
            backupData[collectionName][doc.id] = doc.data()
          })
          console.log(`💾 Backed up ${snapshot.size} documents from ${collectionName}`)
        }
        
      } catch (error) {
        console.warn(`⚠️ Could not backup collection '${collectionName}':`, error)
      }
    }
    
    // Save backup to file
    const backupDir = path.join(process.cwd(), 'firestore-backup')
    await fs.mkdir(backupDir, { recursive: true })
    
    const backupFilePath = path.join(backupDir, `firestore-backup-${Date.now()}.json`)
    await fs.writeFile(backupFilePath, JSON.stringify(backupData, null, 2))
    
    console.log(`✅ Backup saved to: ${backupFilePath}`)
    return true
    
  } catch (error) {
    console.error('❌ Backup failed:', error)
    return false
  }
}
