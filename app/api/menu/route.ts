import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const MENU_FILE_PATH = path.join(process.cwd(), 'menu.json')

export async function GET() {
  try {
    const fileContents = fs.readFileSync(MENU_FILE_PATH, 'utf8')
    const menuData = JSON.parse(fileContents)
    return NextResponse.json(menuData)
  } catch (error) {
    console.error('Error reading menu file:', error)
    return NextResponse.json({ error: 'Failed to read menu data' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const updatedMenu = await request.json()
    
    // Write the updated menu back to the file
    fs.writeFileSync(MENU_FILE_PATH, JSON.stringify(updatedMenu, null, 2))
    
    return NextResponse.json({ success: true, message: 'Menu updated successfully' })
  } catch (error) {
    console.error('Error updating menu file:', error)
    return NextResponse.json({ error: 'Failed to update menu data' }, { status: 500 })
  }
}