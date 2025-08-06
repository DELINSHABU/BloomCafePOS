import { NextRequest, NextResponse } from 'next/server'
import { migrateOrdersToFirebase, verifyFirebaseConnection, testFirebaseWrite } from '@/lib/migrate-to-firebase'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const action = searchParams.get('action')

  try {
    switch (action) {
      case 'verify':
        const verificationResult = await verifyFirebaseConnection()
        return NextResponse.json(verificationResult)
        
      case 'test':
        const testResult = await testFirebaseWrite()
        return NextResponse.json(testResult)
        
      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action. Use ?action=verify or ?action=test'
        }, { status: 400 })
    }
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown API error'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action } = body

    switch (action) {
      case 'migrate':
        console.log('🚀 Starting Firebase migration via API...')
        const migrationResult = await migrateOrdersToFirebase()
        
        if (migrationResult.success) {
          return NextResponse.json({
            success: true,
            message: migrationResult.message,
            migratedCount: migrationResult.migratedCount || 0
          })
        } else {
          return NextResponse.json({
            success: false,
            error: migrationResult.error
          }, { status: 500 })
        }
        
      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action. Use action=migrate in POST body'
        }, { status: 400 })
    }
  } catch (error) {
    console.error('Migration API Error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown migration error'
    }, { status: 500 })
  }
}
