import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const AVAILABILITY_FILE_PATH = path.join(process.cwd(), 'menu-availability.json')

// Initialize availability file if it doesn't exist
function initializeAvailabilityFile() {
  if (!fs.existsSync(AVAILABILITY_FILE_PATH)) {
    const initialData = {
      lastUpdated: new Date().toISOString(),
      items: {}
    }
    fs.writeFileSync(AVAILABILITY_FILE_PATH, JSON.stringify(initialData, null, 2))
  }
}

export async function GET() {
  try {
    console.log('📋 JSON FILE ACCESS: menu-availability.json accessed from api/menu-availability/route.ts -> GET()');
    initializeAvailabilityFile()
    const fileContents = fs.readFileSync(AVAILABILITY_FILE_PATH, 'utf8')
    const availabilityData = JSON.parse(fileContents)
    return NextResponse.json(availabilityData)
  } catch (error) {
    console.error('Error reading availability file:', error)
    return NextResponse.json({ error: 'Failed to read availability data' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('📝 JSON FILE ACCESS: menu-availability.json accessed from api/menu-availability/route.ts -> POST() - updating availability');
    initializeAvailabilityFile()
    const { itemNo, available, price } = await request.json()
    
    // Read existing availability data
    const fileContents = fs.readFileSync(AVAILABILITY_FILE_PATH, 'utf8')
    const availabilityData = JSON.parse(fileContents)
    
    // Update item availability/price
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
    
    // Write back to file
    fs.writeFileSync(AVAILABILITY_FILE_PATH, JSON.stringify(availabilityData, null, 2))
    
    return NextResponse.json({ success: true, message: 'Availability updated successfully' })
  } catch (error) {
    console.error('Error updating availability:', error)
    return NextResponse.json({ error: 'Failed to update availability' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    console.log('🔄 JSON FILE ACCESS: menu-availability.json accessed from api/menu-availability/route.ts -> PUT() - bulk updating availability');
    initializeAvailabilityFile()
    const updates = await request.json() // Array of updates or single update
    
    // Read existing availability data
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
    
    // Write back to file
    fs.writeFileSync(AVAILABILITY_FILE_PATH, JSON.stringify(availabilityData, null, 2))
    
    return NextResponse.json({ success: true, message: 'Availability updated successfully' })
  } catch (error) {
    console.error('Error updating availability:', error)
    return NextResponse.json({ error: 'Failed to update availability' }, { status: 500 })
  }
}