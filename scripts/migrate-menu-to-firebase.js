#!/usr/bin/env node

const { initializeApp } = require('firebase-admin/app')
const { getFirestore } = require('firebase-admin/firestore')
const fs = require('fs')
const path = require('path')

console.log('🚀 Starting Menu Migration to Firebase Firestore...')
console.log('================================================')

// Initialize Firebase Admin
const app = initializeApp({
  projectId: "bloom-graden-cafe-user-login",
})
const db = getFirestore(app)

async function migrateMenuData() {
  try {
    // Read menu.json
    const menuPath = path.join(process.cwd(), 'menu.json')
    const menuContent = fs.readFileSync(menuPath, 'utf8')
    const menuData = JSON.parse(menuContent)

    console.log(`📋 Found ${menuData.menu?.length || 0} categories to migrate`)

    if (!menuData.menu || !Array.isArray(menuData.menu)) {
      throw new Error('Invalid menu.json structure')
    }

    // Create batches for efficient writes
    const batch = db.batch()
    let totalItems = 0

    // Clear existing menu data
    console.log('🗑️ Clearing existing menu data...')
    const existingMenuDocs = await db.collection('menu').get()
    existingMenuDocs.docs.forEach(doc => {
      batch.delete(doc.ref)
    })

    // Add menu items to Firestore
    console.log('📝 Adding menu items to Firestore...')
    for (const category of menuData.menu) {
      console.log(`  Processing category: ${category.category}`)
      
      for (const product of category.products) {
        const menuItem = {
          itemNo: product.itemNo,
          name: product.name.trim(),
          rate: product.rate,
          category: category.category,
          available: true, // Default to available
          createdAt: new Date(),
          updatedAt: new Date()
        }

        // Use itemNo as document ID for easy querying
        const docRef = db.collection('menu').doc(product.itemNo)
        batch.set(docRef, menuItem)
        totalItems++
      }
    }

    // Commit the batch
    console.log('💾 Committing menu data to Firestore...')
    await batch.commit()

    console.log(`✅ Successfully migrated ${totalItems} menu items`)
    return totalItems

  } catch (error) {
    console.error('❌ Error migrating menu data:', error)
    throw error
  }
}

async function migrateAvailabilityData() {
  try {
    // Read menu-availability.json
    const availabilityPath = path.join(process.cwd(), 'menu-availability.json')
    
    if (!fs.existsSync(availabilityPath)) {
      console.log('⚠️ menu-availability.json not found, skipping...')
      return
    }

    const availabilityContent = fs.readFileSync(availabilityPath, 'utf8')
    const availabilityData = JSON.parse(availabilityContent)

    console.log(`📋 Found availability data for ${Object.keys(availabilityData.items || {}).length} items`)

    // Update menu items with availability data
    const batch = db.batch()
    let updatedCount = 0

    for (const [itemNo, data] of Object.entries(availabilityData.items || {})) {
      const docRef = db.collection('menu').doc(itemNo)
      
      // Check if document exists first
      const doc = await docRef.get()
      if (doc.exists) {
        const updateData = {
          available: data.available !== undefined ? data.available : true,
          updatedAt: new Date()
        }

        // Update price if provided in availability data
        if (data.price) {
          updateData.rate = data.price
        }

        batch.update(docRef, updateData)
        updatedCount++
      } else {
        console.log(`⚠️ Item ${itemNo} not found in menu collection`)
      }
    }

    if (updatedCount > 0) {
      console.log('💾 Committing availability updates to Firestore...')
      await batch.commit()
      console.log(`✅ Successfully updated availability for ${updatedCount} items`)
    }

    return updatedCount

  } catch (error) {
    console.error('❌ Error migrating availability data:', error)
    throw error
  }
}

async function createMetadata(totalItems, updatedItems) {
  try {
    const metadataRef = db.collection('admin').doc('menu-metadata')
    const metadata = {
      totalItems,
      updatedItems,
      lastMigrated: new Date(),
      source: 'migration-script',
      version: '1.0'
    }

    await metadataRef.set(metadata)
    console.log('✅ Created metadata document')

  } catch (error) {
    console.error('❌ Error creating metadata:', error)
    throw error
  }
}

async function verifyMigration() {
  try {
    console.log('🔍 Verifying migration...')
    
    // Count documents
    const menuCollection = db.collection('menu')
    const snapshot = await menuCollection.get()
    
    console.log(`📊 Total documents in Firestore: ${snapshot.size}`)
    
    // Sample a few documents
    const sampleDocs = snapshot.docs.slice(0, 3)
    console.log('📝 Sample documents:')
    sampleDocs.forEach(doc => {
      const data = doc.data()
      console.log(`  - ${data.name} (${data.category}) - ₹${data.rate} - Available: ${data.available}`)
    })

    return snapshot.size

  } catch (error) {
    console.error('❌ Error verifying migration:', error)
    throw error
  }
}

// Main migration function
async function runMigration() {
  try {
    console.log('🔥 Starting Firebase Firestore Migration')
    
    // Migrate menu data
    const totalItems = await migrateMenuData()
    
    // Migrate availability data
    const updatedItems = await migrateAvailabilityData()
    
    // Create metadata
    await createMetadata(totalItems, updatedItems)
    
    // Verify migration
    const verifiedCount = await verifyMigration()
    
    console.log('')
    console.log('🎉 Migration completed successfully!')
    console.log('=====================================')
    console.log(`📊 Total items migrated: ${totalItems}`)
    console.log(`🔄 Items with availability updated: ${updatedItems}`)
    console.log(`✅ Documents verified in Firestore: ${verifiedCount}`)
    console.log('')
    console.log('🔥 Your menu is now available in Firebase Firestore!')
    console.log('You can now use the Firebase API endpoints for CRUD operations.')

  } catch (error) {
    console.error('')
    console.error('💥 Migration failed!')
    console.error('===================')
    console.error(error.message)
    process.exit(1)
  }
}

// Run the migration
runMigration()
