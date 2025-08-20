import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'
import { FieldValue } from 'firebase-admin/firestore'
import fs from 'fs'
import path from 'path'

const MENU_FILE_PATH = path.join(process.cwd(), 'menu.json')
const USE_FIREBASE = true // Set to true to use Firebase, false for JSON fallback

// Helper functions for Firebase operations
async function getMenuFromFirebase() {
  const menuCollection = adminDb.collection('menu')
  const snapshot = await menuCollection.orderBy('category').orderBy('itemNo').get()
  
  const categoryMap = new Map()
  
  snapshot.forEach(doc => {
    const data = doc.data()
    const category = data.category
    
    if (!categoryMap.has(category)) {
      categoryMap.set(category, {
        category,
        products: []
      })
    }
    
    categoryMap.get(category).products.push({
      itemNo: data.itemNo,
      name: data.name,
      rate: data.rate,
      available: data.available || true
    })
  })
  
  return {
    menu: Array.from(categoryMap.values()),
    source: 'firebase',
    lastUpdated: new Date().toISOString()
  }
}

async function getMenuFromJSON() {
  const fileContents = fs.readFileSync(MENU_FILE_PATH, 'utf8')
  const menuData = JSON.parse(fileContents)
  return {
    ...menuData,
    source: 'json',
    lastUpdated: new Date().toISOString()
  }
}

// GET - Fetch menu data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const itemNo = searchParams.get('itemNo')
    
    if (USE_FIREBASE) {
      console.log('🔥 Fetching menu data from Firebase Firestore')
      
      // If specific item requested
      if (itemNo) {
        const docRef = adminDb.collection('menu').doc(itemNo)
        const doc = await docRef.get()
        
        if (!doc.exists) {
          return NextResponse.json({ error: 'Item not found' }, { status: 404 })
        }
        
        return NextResponse.json({
          item: doc.data(),
          source: 'firebase'
        })
      }
      
      // If specific category requested
      if (category) {
        const menuCollection = adminDb.collection('menu')
        const snapshot = await menuCollection
          .where('category', '==', category)
          .orderBy('itemNo')
          .get()
        
        const products = []
        snapshot.forEach(doc => {
          const data = doc.data()
          products.push({
            itemNo: data.itemNo,
            name: data.name,
            rate: data.rate,
            available: data.available || true
          })
        })
        
        return NextResponse.json({
          category,
          products,
          source: 'firebase'
        })
      }
      
      // Get all menu data
      const menuData = await getMenuFromFirebase()
      return NextResponse.json(menuData)
      
    } else {
      console.log('📋 Fetching menu data from JSON file')
      const menuData = await getMenuFromJSON()
      return NextResponse.json(menuData)
    }
    
  } catch (error) {
    console.error('❌ Error fetching menu data:', error)
    
    // Fallback to JSON if Firebase fails
    if (USE_FIREBASE) {
      try {
        console.log('⚠️ Firebase failed, falling back to JSON')
        const menuData = await getMenuFromJSON()
        return NextResponse.json({ ...menuData, fallback: true })
      } catch (jsonError) {
        console.error('❌ JSON fallback also failed:', jsonError)
      }
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch menu data', details: error.message },
      { status: 500 }
    )
  }
}

// POST - Create new menu item or bulk upload
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    if (USE_FIREBASE) {
      console.log('🔥 Creating menu item(s) in Firebase Firestore')
      
      // Check if it's a single item or bulk upload
      if (data.menu && Array.isArray(data.menu)) {
        // Bulk upload - replace entire menu
        const batch = adminDb.batch()
        
        // Clear existing data
        const existingDocs = await adminDb.collection('menu').get()
        existingDocs.docs.forEach(doc => {
          batch.delete(doc.ref)
        })
        
        let totalItems = 0
        // Add new data
        for (const category of data.menu) {
          for (const product of category.products) {
            const menuItem = {
              itemNo: product.itemNo,
              name: product.name.trim(),
              rate: product.rate,
              category: category.category,
              available: product.available !== undefined ? product.available : true,
              createdAt: new Date(),
              updatedAt: new Date()
            }
            
            const docRef = adminDb.collection('menu').doc(product.itemNo)
            batch.set(docRef, menuItem)
            totalItems++
          }
        }
        
        await batch.commit()
        
        return NextResponse.json({
          success: true,
          message: `Successfully uploaded ${totalItems} menu items`,
          totalItems,
          source: 'firebase'
        })
        
      } else {
        // Single item creation
        const { itemNo, name, rate, category, available = true } = data
        
        if (!itemNo || !name || !rate || !category) {
          return NextResponse.json(
            { error: 'Missing required fields: itemNo, name, rate, category' },
            { status: 400 }
          )
        }
        
        // Check if item already exists
        const docRef = adminDb.collection('menu').doc(itemNo)
        const existingDoc = await docRef.get()
        
        if (existingDoc.exists) {
          return NextResponse.json(
            { error: `Item with itemNo ${itemNo} already exists` },
            { status: 409 }
          )
        }
        
        const menuItem = {
          itemNo,
          name: name.trim(),
          rate,
          category,
          available,
          createdAt: new Date(),
          updatedAt: new Date()
        }
        
        await docRef.set(menuItem)
        
        return NextResponse.json({
          success: true,
          message: `Successfully created menu item ${name}`,
          item: menuItem,
          source: 'firebase'
        })
      }
      
    } else {
      // JSON fallback
      console.log('📋 Updating menu data in JSON file')
      fs.writeFileSync(MENU_FILE_PATH, JSON.stringify(data, null, 2))
      
      return NextResponse.json({
        success: true,
        message: 'Menu updated successfully',
        source: 'json'
      })
    }
    
  } catch (error) {
    console.error('❌ Error creating menu item:', error)
    return NextResponse.json(
      { error: 'Failed to create menu item', details: error.message },
      { status: 500 }
    )
  }
}

// PUT - Update existing menu item
export async function PUT(request: NextRequest) {
  try {
    const data = await request.json()
    const { itemNo, name, rate, category, available } = data
    
    if (!itemNo) {
      return NextResponse.json(
        { error: 'itemNo is required for updates' },
        { status: 400 }
      )
    }
    
    if (USE_FIREBASE) {
      console.log(`🔥 Updating menu item ${itemNo} in Firebase Firestore`)
      
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
      
      // Only update provided fields
      if (name !== undefined) updateData.name = name.trim()
      if (rate !== undefined) updateData.rate = rate
      if (category !== undefined) updateData.category = category
      if (available !== undefined) updateData.available = available
      
      await docRef.update(updateData)
      
      // Get updated document
      const updatedDoc = await docRef.get()
      
      return NextResponse.json({
        success: true,
        message: `Successfully updated menu item ${itemNo}`,
        item: updatedDoc.data(),
        source: 'firebase'
      })
      
    } else {
      return NextResponse.json(
        { error: 'PUT operation requires Firebase to be enabled' },
        { status: 501 }
      )
    }
    
  } catch (error) {
    console.error('❌ Error updating menu item:', error)
    return NextResponse.json(
      { error: 'Failed to update menu item', details: error.message },
      { status: 500 }
    )
  }
}

// DELETE - Remove menu item
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const itemNo = searchParams.get('itemNo')
    
    if (!itemNo) {
      return NextResponse.json(
        { error: 'itemNo is required for deletion' },
        { status: 400 }
      )
    }
    
    if (USE_FIREBASE) {
      console.log(`🔥 Deleting menu item ${itemNo} from Firebase Firestore`)
      
      const docRef = adminDb.collection('menu').doc(itemNo)
      const doc = await docRef.get()
      
      if (!doc.exists) {
        return NextResponse.json(
          { error: `Item with itemNo ${itemNo} not found` },
          { status: 404 }
        )
      }
      
      const itemData = doc.data()
      await docRef.delete()
      
      return NextResponse.json({
        success: true,
        message: `Successfully deleted menu item ${itemNo}`,
        deletedItem: itemData,
        source: 'firebase'
      })
      
    } else {
      return NextResponse.json(
        { error: 'DELETE operation requires Firebase to be enabled' },
        { status: 501 }
      )
    }
    
  } catch (error) {
    console.error('❌ Error deleting menu item:', error)
    return NextResponse.json(
      { error: 'Failed to delete menu item', details: error.message },
      { status: 500 }
    )
  }
}
