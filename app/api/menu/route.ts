import { NextRequest, NextResponse } from 'next/server'
import { JsonDataService } from '@/lib/json-data-service'

// GET - Fetch menu data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const itemNo = searchParams.get('itemNo')
    
    console.log('📋 Fetching menu data from JSON file')
    
    // If specific item requested
    if (itemNo) {
      const item = JsonDataService.getMenuItem(itemNo)
      if (!item) {
        return NextResponse.json({ error: 'Item not found' }, { status: 404 })
      }
      
      return NextResponse.json({
        item,
        source: 'json'
      })
    }
    
    // If specific category requested
    if (category) {
      const categoryData = JsonDataService.getMenuByCategory(category)
      if (!categoryData) {
        return NextResponse.json({ error: 'Category not found' }, { status: 404 })
      }
      
      return NextResponse.json({
        ...categoryData,
        source: 'json'
      })
    }
    
    // Get all menu data
    const menuData = JsonDataService.getMenu()
    return NextResponse.json({
      ...menuData,
      source: 'json'
    })
    
  } catch (error) {
    console.error('❌ Error fetching menu data:', error)
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
    
    console.log('📋 Creating/updating menu data in JSON file')
    
    // Check if it's a single item or bulk upload
    if (data.menu && Array.isArray(data.menu)) {
      // Bulk upload - replace entire menu
      const success = JsonDataService.saveMenu(data)
      
      if (!success) {
        return NextResponse.json(
          { error: 'Failed to save menu data' },
          { status: 500 }
        )
      }
      
      let totalItems = 0
      data.menu.forEach((category: any) => {
        if (category.products) {
          totalItems += category.products.length
        }
      })
      
      return NextResponse.json({
        success: true,
        message: `Successfully uploaded ${totalItems} menu items`,
        totalItems,
        source: 'json'
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
      const existingItem = JsonDataService.getMenuItem(itemNo)
      if (existingItem) {
        return NextResponse.json(
          { error: `Item with itemNo ${itemNo} already exists` },
          { status: 409 }
        )
      }
      
      const menuItem = {
        itemNo,
        name: name.trim(),
        rate,
        available
      }
      
      const success = JsonDataService.addMenuItem({ ...menuItem, category })
      
      if (!success) {
        return NextResponse.json(
          { error: 'Failed to add menu item' },
          { status: 500 }
        )
      }
      
      return NextResponse.json({
        success: true,
        message: `Successfully created menu item ${name}`,
        item: menuItem,
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
    
    console.log(`📋 Updating menu item ${itemNo} in JSON file`)
    
    // Check if item exists
    const existingItem = JsonDataService.getMenuItem(itemNo)
    if (!existingItem) {
      return NextResponse.json(
        { error: `Item with itemNo ${itemNo} not found` },
        { status: 404 }
      )
    }
    
    const updateData: any = {}
    
    // Only update provided fields
    if (name !== undefined) updateData.name = name.trim()
    if (rate !== undefined) updateData.rate = rate
    if (available !== undefined) updateData.available = available
    
    const success = JsonDataService.updateMenuItem(itemNo, updateData)
    
    if (!success) {
      return NextResponse.json(
        { error: 'Failed to update menu item' },
        { status: 500 }
      )
    }
    
    // Get updated item
    const updatedItem = JsonDataService.getMenuItem(itemNo)
    
    return NextResponse.json({
      success: true,
      message: `Successfully updated menu item ${itemNo}`,
      item: updatedItem,
      source: 'json'
    })
    
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
    
    console.log(`📋 Deleting menu item ${itemNo} from JSON file`)
    
    // Check if item exists and get data before deletion
    const itemData = JsonDataService.getMenuItem(itemNo)
    if (!itemData) {
      return NextResponse.json(
        { error: `Item with itemNo ${itemNo} not found` },
        { status: 404 }
      )
    }
    
    const success = JsonDataService.deleteMenuItem(itemNo)
    
    if (!success) {
      return NextResponse.json(
        { error: 'Failed to delete menu item' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      success: true,
      message: `Successfully deleted menu item ${itemNo}`,
      deletedItem: itemData,
      source: 'json'
    })
    
  } catch (error) {
    console.error('❌ Error deleting menu item:', error)
    return NextResponse.json(
      { error: 'Failed to delete menu item', details: error.message },
      { status: 500 }
    )
  }
}
