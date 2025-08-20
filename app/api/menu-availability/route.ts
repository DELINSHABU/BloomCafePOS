import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'
import fs from 'fs'
import path from 'path'

const AVAILABILITY_FILE_PATH = path.join(process.cwd(), 'menu-availability.json')
const USE_FIREBASE = true // Set to true to use Firebase, false for JSON fallback

// Helper functions for Firebase operations
async function getAvailabilityFromFirebase() {
  const menuCollection = adminDb.collection('menu')
  const snapshot = await menuCollection.get()
  
  const items = {}
  snapshot.forEach(doc => {
    const data = doc.data()
    items[data.itemNo] = {
      available: data.available || true,
      price: data.rate
    }
  })
  
  return {
    lastUpdated: new Date().toISOString(),
    items,
    source: 'firebase'
  }
}

function initializeAvailabilityFile() {
  if (!fs.existsSync(AVAILABILITY_FILE_PATH)) {
    const initialData = {
      lastUpdated: new Date().toISOString(),
      items: {}
    }
    fs.writeFileSync(AVAILABILITY_FILE_PATH, JSON.stringify(initialData, null, 2))
  }
}

function getAvailabilityFromJSON() {
  initializeAvailabilityFile()
  const fileContents = fs.readFileSync(AVAILABILITY_FILE_PATH, 'utf8')
  const availabilityData = JSON.parse(fileContents)
  return {
    ...availabilityData,
    source: 'json'
  }
}

// GET - Fetch availability data
export async function GET() {
  try {
    if (USE_FIREBASE) {
      console.log('🔥 Fetching availability data from Firebase Firestore')
      const availabilityData = await getAvailabilityFromFirebase()
      return NextResponse.json(availabilityData)
    } else {
      console.log('📋 Fetching availability data from JSON file')
      const availabilityData = getAvailabilityFromJSON()
      return NextResponse.json(availabilityData)
    }
  } catch (error) {
    console.error('❌ Error reading availability data:', error)
    
    // Fallback to JSON if Firebase fails
    if (USE_FIREBASE) {
      try {
        console.log('⚠️ Firebase failed, falling back to JSON')
        const availabilityData = getAvailabilityFromJSON()
        return NextResponse.json({ ...availabilityData, fallback: true })
      } catch (jsonError) {
        console.error('❌ JSON fallback also failed:', jsonError)
      }
    }
    
    return NextResponse.json(
      { error: 'Failed to read availability data', details: error.message },
      { status: 500 }
    )
  }
}

// POST - Update single item availability
export async function POST(request: NextRequest) {
  try {
    const { itemNo, available, price } = await request.json()
    
    if (!itemNo) {
      return NextResponse.json(
        { error: 'itemNo is required' },
        { status: 400 }
      )
    }
    
    if (USE_FIREBASE) {
      console.log(`🔥 Updating availability for item ${itemNo} in Firebase Firestore`)
      
      const docRef = adminDb.collection('menu').doc(itemNo)
      const doc = await docRef.get()
      
      if (!doc.exists) {
        return NextResponse.json(
          { error: `Item with itemNo ${itemNo} not found` },
          { status: 404 }
        )
      }
      
      const updateData = {
        updatedAt: new Date()
      }
      
      if (available !== undefined) updateData.available = available
      if (price !== undefined) updateData.rate = price
      
      await docRef.update(updateData)
      
      return NextResponse.json({
        success: true,
        message: `Availability updated for item ${itemNo}`,
        source: 'firebase'
      })
      
    } else {
      console.log('📝 Updating availability in JSON file')
      initializeAvailabilityFile()
      
      const fileContents = fs.readFileSync(AVAILABILITY_FILE_PATH, 'utf8')
      const availabilityData = JSON.parse(fileContents)
      
      if (!availabilityData.items[itemNo]) {
        availabilityData.items[itemNo] = {}
      }
      
      if (available !== undefined) {
        availabilityData.items[itemNo].available = available
      }
      
      if (price !== undefined) {
        availabilityData.items[itemNo].price = price
      }
      
      availabilityData.lastUpdated = new Date().toISOString()
      
      fs.writeFileSync(AVAILABILITY_FILE_PATH, JSON.stringify(availabilityData, null, 2))
      
      return NextResponse.json({
        success: true,
        message: 'Availability updated successfully',
        source: 'json'
      })
    }
    
  } catch (error) {
    console.error('❌ Error updating availability:', error)
    return NextResponse.json(
      { error: 'Failed to update availability', details: error.message },
      { status: 500 }
    )
  }
}

// PUT - Bulk update availability
export async function PUT(request: NextRequest) {
  try {
    const updates = await request.json() // Array of updates or single update
    
    if (USE_FIREBASE) {
      console.log('🔥 Bulk updating availability in Firebase Firestore')
      
      const batch = adminDb.batch()
      let updateCount = 0
      
      // Handle bulk updates
      if (Array.isArray(updates)) {
        for (const { itemNo, available, price } of updates) {
          if (!itemNo) continue
          
          const docRef = adminDb.collection('menu').doc(itemNo)
          const doc = await docRef.get()
          
          if (doc.exists) {
            const updateData = { updatedAt: new Date() }
            
            if (available !== undefined) updateData.available = available
            if (price !== undefined) updateData.rate = price
            
            batch.update(docRef, updateData)
            updateCount++
          }
        }
      } else {
        // Handle single update
        const { itemNo, available, price } = updates
        if (itemNo) {
          const docRef = adminDb.collection('menu').doc(itemNo)
          const doc = await docRef.get()
          
          if (doc.exists) {
            const updateData = { updatedAt: new Date() }
            
            if (available !== undefined) updateData.available = available
            if (price !== undefined) updateData.rate = price
            
            batch.update(docRef, updateData)
            updateCount++
          }
        }
      }
      
      if (updateCount > 0) {
        await batch.commit()
      }
      
      return NextResponse.json({
        success: true,
        message: `Successfully updated ${updateCount} items`,
        updatedItems: updateCount,
        source: 'firebase'
      })
      
    } else {
      console.log('📝 Bulk updating availability in JSON file')
      initializeAvailabilityFile()
      
      const fileContents = fs.readFileSync(AVAILABILITY_FILE_PATH, 'utf8')
      const availabilityData = JSON.parse(fileContents)
      
      // Handle bulk updates
      if (Array.isArray(updates)) {
        updates.forEach(({ itemNo, available, price }) => {
          if (!availabilityData.items[itemNo]) {
            availabilityData.items[itemNo] = {}
          }
          
          if (available !== undefined) {
            availabilityData.items[itemNo].available = available
          }
          
          if (price !== undefined) {
            availabilityData.items[itemNo].price = price
          }
        })
      } else {
        // Handle single update
        const { itemNo, available, price } = updates
        if (!availabilityData.items[itemNo]) {
          availabilityData.items[itemNo] = {}
        }
        
        if (available !== undefined) {
          availabilityData.items[itemNo].available = available
        }
        
        if (price !== undefined) {
          availabilityData.items[itemNo].price = price
        }
      }
      
      availabilityData.lastUpdated = new Date().toISOString()
      
      fs.writeFileSync(AVAILABILITY_FILE_PATH, JSON.stringify(availabilityData, null, 2))
      
      return NextResponse.json({
        success: true,
        message: 'Availability updated successfully',
        source: 'json'
      })
    }
    
  } catch (error) {
    console.error('❌ Error bulk updating availability:', error)
    return NextResponse.json(
      { error: 'Failed to update availability', details: error.message },
      { status: 500 }
    )
  }
}
