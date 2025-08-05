import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const ANALYTICS_FILE = path.join(process.cwd(), 'analytics_data.json')

export async function GET() {
  try {
    if (fs.existsSync(ANALYTICS_FILE)) {
      const data = fs.readFileSync(ANALYTICS_FILE, 'utf8')
      const analyticsData = JSON.parse(data)
      
      return NextResponse.json(analyticsData)
    } else {
      return NextResponse.json(
        { error: 'Analytics data not found' },
        { status: 404 }
      )
    }
  } catch (error) {
    console.error('Error reading analytics data:', error)
    return NextResponse.json(
      { error: 'Failed to load analytics data' },
      { status: 500 }
    )
  }
}
