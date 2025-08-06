import { NextRequest, NextResponse } from 'next/server'
import { 
  migrateRealtimeToFirestore, 
  verifyFirestoreMigration, 
  backupFirestoreData 
} from '@/lib/realtime-to-firestore-migration'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const action = searchParams.get('action')

  try {
    switch (action) {
      case 'verify':
        console.log('🔍 Verifying Firestore migration status...')
        const verificationResult = await verifyFirestoreMigration()
        return NextResponse.json({
          success: verificationResult.success,
          collections: verificationResult.collections,
          message: `Found ${verificationResult.collections.filter(c => c.exists).length} collections with data`
        })

      case 'backup':
        console.log('💾 Creating Firestore backup...')
        const backupResult = await backupFirestoreData()
        return NextResponse.json({
          success: backupResult,
          message: backupResult ? 'Backup created successfully' : 'Backup failed'
        })

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action. Use ?action=verify or ?action=backup'
        }, { status: 400 })
    }
  } catch (error) {
    console.error('Migration API Error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown API error'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, options = {} } = body

    switch (action) {
      case 'migrate':
        console.log('🚀 Starting Realtime DB to Firestore migration via API...')
        
        // Optional: Create backup before migration
        if (options.createBackup !== false) {
          console.log('💾 Creating backup before migration...')
          await backupFirestoreData()
        }
        
        const migrationResult = await migrateRealtimeToFirestore()
        
        if (migrationResult.success) {
          // Verify migration after completion
          const verificationResult = await verifyFirestoreMigration()
          
          return NextResponse.json({
            success: true,
            message: migrationResult.message,
            migratedCollections: migrationResult.migratedCollections,
            totalDocuments: migrationResult.totalDocuments,
            verification: verificationResult
          })
        } else {
          return NextResponse.json({
            success: false,
            error: migrationResult.error
          }, { status: 500 })
        }

      case 'force-migrate':
        console.log('🚀 Starting FORCED migration (no backup)...')
        const forcedMigrationResult = await migrateRealtimeToFirestore()
        
        return NextResponse.json({
          success: forcedMigrationResult.success,
          message: forcedMigrationResult.message,
          migratedCollections: forcedMigrationResult.migratedCollections,
          totalDocuments: forcedMigrationResult.totalDocuments,
          error: forcedMigrationResult.error
        })

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action. Use action=migrate or action=force-migrate in POST body'
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
