import { NextResponse } from 'next/server'
import { JsonDataService } from '@/lib/json-data-service'

export async function GET() {
  try {
    console.log('📈 Fetching analytics data from JSON file')
    
    // Get analytics data using JsonDataService
    const analyticsData = JsonDataService.getAnalytics()
    
    return NextResponse.json(analyticsData)
    
  } catch (error) {
    console.error('Error reading analytics data:', error)
    return NextResponse.json(
      { error: 'Failed to load analytics data' },
      { status: 500 }
    )
  }
}

// POST - Trigger analytics update
export async function POST() {
  try {
    console.log('📈 Updating analytics data')
    
    const success = JsonDataService.updateAnalytics()
    
    if (!success) {
      throw new Error('Failed to update analytics')
    }
    
    const analyticsData = JsonDataService.getAnalytics()
    
    return NextResponse.json({
      success: true,
      message: 'Analytics updated successfully',
      analytics: analyticsData
    })
    
  } catch (error) {
    console.error('Error updating analytics data:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to update analytics data'
      },
      { status: 500 }
    )
  }
}
