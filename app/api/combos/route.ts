import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const COMBOS_FILE = path.join(process.cwd(), 'combos.json')

interface ComboItem {
  itemId: string
  itemName: string
  quantity: number
  originalPrice: number
}

interface Combo {
  id: string
  name: string
  description: string
  items: ComboItem[]
  originalTotal: number
  comboPrice: number
  discountAmount: number
  discountPercentage: number
  isActive: boolean
  category: string
  createdAt: string
  updatedAt: string
}

interface CombosData {
  combos: Combo[]
  lastUpdated: string
}

// Helper function to read combos data
function readCombosData(): CombosData {
  try {
    if (fs.existsSync(COMBOS_FILE)) {
      console.log('🍽️ JSON FILE ACCESS: combos.json accessed from api/combos/route.ts -> readCombosData()');
      const data = fs.readFileSync(COMBOS_FILE, 'utf8')
      return JSON.parse(data)
    }
  } catch (error) {
    console.error('Error reading combos file:', error)
  }
  
  return {
    combos: [],
    lastUpdated: new Date().toISOString()
  }
}

// Helper function to write combos data
function writeCombosData(data: CombosData): void {
  try {
    console.log('💾 JSON FILE ACCESS: combos.json updated from api/combos/route.ts -> writeCombosData()');
    fs.writeFileSync(COMBOS_FILE, JSON.stringify(data, null, 2))
  } catch (error) {
    console.error('Error writing combos file:', error)
    throw error
  }
}

// GET - Fetch all combos
export async function GET() {
  try {
    const data = readCombosData()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching combos:', error)
    return NextResponse.json(
      { error: 'Failed to fetch combos' },
      { status: 500 }
    )
  }
}

// POST - Create new combo
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, items, originalTotal, comboPrice, discountAmount, discountPercentage, category, isActive } = body

    // Validation
    if (!name || !description || !items || items.length === 0 || !comboPrice) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (comboPrice >= originalTotal) {
      return NextResponse.json(
        { error: 'Combo price must be less than original total' },
        { status: 400 }
      )
    }

    const data = readCombosData()
    
    // Check if combo with same name already exists
    const existingCombo = data.combos.find(combo => combo.name.toLowerCase() === name.toLowerCase())
    if (existingCombo) {
      return NextResponse.json(
        { error: 'Combo with this name already exists' },
        { status: 400 }
      )
    }

    const newCombo: Combo = {
      id: Date.now().toString(),
      name,
      description,
      items,
      originalTotal,
      comboPrice,
      discountAmount,
      discountPercentage,
      isActive: isActive !== undefined ? isActive : true,
      category: category || 'Combo Special',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    data.combos.push(newCombo)
    data.lastUpdated = new Date().toISOString()
    
    writeCombosData(data)

    return NextResponse.json({ combo: newCombo })
  } catch (error) {
    console.error('Error creating combo:', error)
    return NextResponse.json(
      { error: 'Failed to create combo' },
      { status: 500 }
    )
  }
}

// PUT - Update existing combo
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, name, description, items, originalTotal, comboPrice, discountAmount, discountPercentage, category, isActive } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Combo ID is required' },
        { status: 400 }
      )
    }

    const data = readCombosData()
    const comboIndex = data.combos.findIndex(combo => combo.id === id)
    
    if (comboIndex === -1) {
      return NextResponse.json(
        { error: 'Combo not found' },
        { status: 404 }
      )
    }

    // Update combo
    const updatedCombo: Combo = {
      ...data.combos[comboIndex],
      name: name || data.combos[comboIndex].name,
      description: description || data.combos[comboIndex].description,
      items: items || data.combos[comboIndex].items,
      originalTotal: originalTotal || data.combos[comboIndex].originalTotal,
      comboPrice: comboPrice || data.combos[comboIndex].comboPrice,
      discountAmount: discountAmount || data.combos[comboIndex].discountAmount,
      discountPercentage: discountPercentage || data.combos[comboIndex].discountPercentage,
      category: category || data.combos[comboIndex].category,
      isActive: isActive !== undefined ? isActive : data.combos[comboIndex].isActive,
      updatedAt: new Date().toISOString()
    }

    data.combos[comboIndex] = updatedCombo
    data.lastUpdated = new Date().toISOString()
    
    writeCombosData(data)

    return NextResponse.json({ combo: updatedCombo })
  } catch (error) {
    console.error('Error updating combo:', error)
    return NextResponse.json(
      { error: 'Failed to update combo' },
      { status: 500 }
    )
  }
}

// DELETE - Delete combo
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Combo ID is required' },
        { status: 400 }
      )
    }

    const data = readCombosData()
    const comboIndex = data.combos.findIndex(combo => combo.id === id)
    
    if (comboIndex === -1) {
      return NextResponse.json(
        { error: 'Combo not found' },
        { status: 404 }
      )
    }

    data.combos.splice(comboIndex, 1)
    data.lastUpdated = new Date().toISOString()
    
    writeCombosData(data)

    return NextResponse.json({ message: 'Combo deleted successfully' })
  } catch (error) {
    console.error('Error deleting combo:', error)
    return NextResponse.json(
      { error: 'Failed to delete combo' },
      { status: 500 }
    )
  }
}