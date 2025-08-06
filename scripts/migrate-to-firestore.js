#!/usr/bin/env node

/**
 * Command line script to migrate data from Firebase Realtime Database and local JSON files to Cloud Firestore
 * 
 * Usage:
 * node scripts/migrate-to-firestore.js [options]
 * 
 * Options:
 * --verify     : Only verify existing Firestore data
 * --backup     : Only create backup of existing Firestore data
 * --no-backup  : Skip backup before migration
 * --force      : Force migration without prompts
 */

const { execSync } = require('child_process')
const path = require('path')

// Parse command line arguments
const args = process.argv.slice(2)
const options = {
  verify: args.includes('--verify'),
  backup: args.includes('--backup'),
  noBackup: args.includes('--no-backup'),
  force: args.includes('--force')
}

console.log('🚀 Firebase to Firestore Migration Tool')
console.log('=====================================\n')

async function runMigration() {
  try {
    const baseUrl = 'http://localhost:3000/api/firestore-migration'
    
    if (options.verify) {
      console.log('🔍 Verifying Firestore collections...')
      await makeRequest(`${baseUrl}?action=verify`, 'GET')
      return
    }
    
    if (options.backup) {
      console.log('💾 Creating Firestore backup...')
      await makeRequest(`${baseUrl}?action=backup`, 'GET')
      return
    }
    
    // Check if development server is running
    console.log('🔧 Checking if development server is running...')
    try {
      await makeRequest(`${baseUrl}?action=verify`, 'GET')
      console.log('✅ Development server is running\n')
    } catch (error) {
      console.log('❌ Development server is not running')
      console.log('Please start the development server first:')
      console.log('npm run dev\n')
      process.exit(1)
    }
    
    // Verify current state
    console.log('🔍 Checking current Firestore state...')
    const verifyResult = await makeRequest(`${baseUrl}?action=verify`, 'GET')
    
    if (verifyResult.collections && verifyResult.collections.some(c => c.exists)) {
      console.log('⚠️  Existing Firestore data found:')
      verifyResult.collections
        .filter(c => c.exists)
        .forEach(c => console.log(`  - ${c.name}: ${c.documentCount} documents`))
      
      if (!options.force) {
        console.log('\nThis will overwrite existing data. Use --force to proceed anyway.')
        console.log('Or use --backup to create a backup first.')
        process.exit(1)
      }
    }
    
    // Start migration
    console.log('\n🚀 Starting migration...')
    const migrationOptions = {
      createBackup: !options.noBackup
    }
    
    const result = await makeRequest(baseUrl, 'POST', {
      action: 'migrate',
      options: migrationOptions
    })
    
    console.log('\n✅ Migration completed successfully!')
    console.log(`📊 Total documents migrated: ${result.totalDocuments}`)
    console.log(`📁 Collections migrated: ${result.migratedCollections?.join(', ')}`)
    
    if (result.verification) {
      console.log('\n🔍 Post-migration verification:')
      result.verification.collections
        .filter(c => c.exists)
        .forEach(c => console.log(`  ✅ ${c.name}: ${c.documentCount} documents`))
    }
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message)
    process.exit(1)
  }
}

async function makeRequest(url, method = 'GET', body = null) {
  const fetch = (await import('node-fetch')).default
  
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json'
    }
  }
  
  if (body) {
    options.body = JSON.stringify(body)
  }
  
  const response = await fetch(url, options)
  const data = await response.json()
  
  if (!response.ok) {
    throw new Error(data.error || `HTTP ${response.status}`)
  }
  
  return data
}

// Show help
if (args.includes('--help') || args.includes('-h')) {
  console.log('Usage: node scripts/migrate-to-firestore.js [options]')
  console.log('')
  console.log('Options:')
  console.log('  --verify      Only verify existing Firestore data')
  console.log('  --backup      Only create backup of existing Firestore data')
  console.log('  --no-backup   Skip backup before migration')
  console.log('  --force       Force migration without prompts')
  console.log('  --help, -h    Show this help message')
  console.log('')
  console.log('Examples:')
  console.log('  node scripts/migrate-to-firestore.js --verify')
  console.log('  node scripts/migrate-to-firestore.js --backup')
  console.log('  node scripts/migrate-to-firestore.js --force')
  console.log('  node scripts/migrate-to-firestore.js --no-backup --force')
  process.exit(0)
}

// Run the migration
runMigration().catch(console.error)
