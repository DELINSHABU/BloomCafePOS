import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const TODAYS_SPECIAL_FILE = path.join(process.cwd(), 'todays-special.json')

interface TodaysSpecialItem {
  id: string
  name: string
  price: number
  description: string
  category: string
  isActive: boolean
}

// Helper function to read Today's Special data
function readTodaysSpecialData(): TodaysSpecialItem[] {
  try {
    if (fs.existsSync(TODAYS_SPECIAL_FILE)) {
      const data = fs.readFileSync(TODAYS_SPECIAL_FILE, 'utf8')
      return JSON.parse(data)
    }
    return []
  } catch (error) {
    console.error('Error reading todays-special.json:', error)
    return []
  }
}

// Helper function to write Today's Special data
function writeTodaysSpecialData(data: TodaysSpecialItem[]): boolean {
  try {
    fs.writeFileSync(TODAYS_SPECIAL_FILE, JSON.stringify(data, null, 2))
    return true
  } catch (error) {
    console.error('Error writing todays-special.json:', error)
    return false
  }
}

// GET - Fetch all Today's Special items
export async function GET() {
  try {
    const specialItems = readTodaysSpecialData()
    return NextResponse.json({ items: specialItems })
  } catch (error) {
    console.error('Error fetching Today\'s Special:', error)
    return NextResponse.json(
      { error: 'Failed to fetch Today\'s Special items' },
      { status: 500 }
    )
  }
}

// POST - Add new Today's Special item
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, price, description, category, isActive = true } = body

    if (!name || !price || !description || !category) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const specialItems = readTodaysSpecialData()
    const newItem: TodaysSpecialItem = {
      id: Date.now().toString(),
      name,
      price: Number(price),
      description,
      category,
      isActive
    }

    specialItems.push(newItem)
    
    if (writeTodaysSpecialData(specialItems)) {
      return NextResponse.json({ success: true, item: newItem })
    } else {
      return NextResponse.json(
        { error: 'Failed to save item' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error adding Today\'s Special item:', error)
    return NextResponse.json(
      { error: 'Failed to add item' },
      { status: 500 }
    )
  }
}

// PUT - Update existing Today's Special item
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, name, price, description, category, isActive } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Item ID is required' },
        { status: 400 }
      )
    }

    const specialItems = readTodaysSpecialData()
    const itemIndex = specialItems.findIndex(item => item.id === id)

    if (itemIndex === -1) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      )
    }

    // Update the item
    specialItems[itemIndex] = {
      ...specialItems[itemIndex],
      ...(name !== undefined && { name }),
      ...(price !== undefined && { price: Number(price) }),
      ...(description !== undefined && { description }),
      ...(category !== undefined && { category }),
      ...(isActive !== undefined && { isActive })
    }

    if (writeTodaysSpecialData(specialItems)) {
      return NextResponse.json({ success: true, item: specialItems[itemIndex] })
    } else {
      return NextResponse.json(
        { error: 'Failed to update item' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error updating Today\'s Special item:', error)
    return NextResponse.json(
      { error: 'Failed to update item' },
      { status: 500 }
    )
  }
}

// DELETE - Remove Today's Special item
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Item ID is required' },
        { status: 400 }
      )
    }

    const specialItems = readTodaysSpecialData()
    const filteredItems = specialItems.filter(item => item.id !== id)

    if (filteredItems.length === specialItems.length) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      )
    }

    if (writeTodaysSpecialData(filteredItems)) {
      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json(
        { error: 'Failed to delete item' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error deleting Today\'s Special item:', error)
    return NextResponse.json(
      { error: 'Failed to delete item' },
      { status: 500 }
    )
  }
}