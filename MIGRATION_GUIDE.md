# Firebase Realtime Database to Cloud Firestore Migration Guide

This guide helps you migrate your data from Firebase Realtime Database and local JSON files to Cloud Firestore, creating separate collections for each data type.

## Overview

The migration tool will:
1. ✅ Export all data from Firebase Realtime Database
2. ✅ Read all your local JSON files
3. ✅ Create organized Firestore collections
4. ✅ Preserve data relationships and structure
5. ✅ Create backups before migration
6. ✅ Verify data integrity after migration

## Collections Created

The migration will create the following Firestore collections:

| Collection Name | Source | Description |
|----------------|--------|-------------|
| `menu` | menu.json | Restaurant menu categories |
| `menu_products` | menu.json | Individual menu products |
| `orders` | orders.json | Customer orders |
| `combos` | combos.json | Combo deals and packages |
| `offers` | offers.json | Special offers and promotions |
| `analytics_data` | analytics_data.json | Analytics and statistics |
| `menu_availability` | menu-availability.json | Item availability status |
| `todays_special` | todays-special.json | Daily specials |
| `staff_credentials` | staff-credentials.json | Staff authentication data |

## Prerequisites

1. **Firebase Project Setup**: Ensure your Firebase project has both Realtime Database and Firestore enabled
2. **Development Server**: The migration requires your Next.js development server to be running
3. **Firestore Rules**: Make sure your Firestore rules allow write operations

## Quick Start

### Method 1: Using npm scripts (Recommended)

```bash
# 1. Start your development server in one terminal
npm run dev

# 2. In another terminal, run the migration
npm run migrate:firestore

# Or with force (skips prompts)
npm run migrate:force
```

### Method 2: Using the script directly

```bash
# Basic migration
node scripts/migrate-to-firestore.js

# With options
node scripts/migrate-to-firestore.js --force --no-backup
```

### Method 3: Using API endpoints

```bash
# Verify current state
curl http://localhost:3000/api/firestore-migration?action=verify

# Create backup
curl http://localhost:3000/api/firestore-migration?action=backup

# Run migration
curl -X POST http://localhost:3000/api/firestore-migration \
  -H "Content-Type: application/json" \
  -d '{"action": "migrate"}'
```

## Available Commands

| Command | Description |
|---------|-------------|
| `npm run migrate:firestore` | Run full migration with prompts |
| `npm run migrate:verify` | Check existing Firestore data |
| `npm run migrate:backup` | Create backup only |
| `npm run migrate:force` | Force migration without prompts |

## Command Options

| Option | Description |
|--------|-------------|
| `--verify` | Only verify existing Firestore data |
| `--backup` | Only create backup of existing data |
| `--no-backup` | Skip backup before migration |
| `--force` | Force migration without confirmation prompts |
| `--help` | Show help message |

## Step-by-Step Migration Process

### Step 1: Pre-Migration Check

Before running the migration, verify your current setup:

```bash
# Check what data currently exists
npm run migrate:verify
```

### Step 2: Create Backup (Recommended)

```bash
# Create a backup of existing Firestore data
npm run migrate:backup
```

This creates a backup in the `firestore-backup/` directory.

### Step 3: Run Migration

```bash
# Run the full migration
npm run migrate:firestore
```

The tool will:
1. Check if development server is running
2. Verify current Firestore state
3. Create backup (unless `--no-backup` is used)
4. Fetch data from Realtime Database
5. Read local JSON files
6. Create Firestore collections
7. Verify migration success

### Step 4: Verify Results

After migration, the tool automatically verifies the data. You can also run:

```bash
npm run migrate:verify
```

## Data Structure Examples

### Menu Collection
```json
{
  "category": "Breakfast",
  "products": [...],
  "migratedFrom": "menu.json",
  "migratedAt": "2025-01-01T12:00:00.000Z"
}
```

### Orders Collection
```json
{
  "id": "order-123",
  "items": [...],
  "total": 340,
  "status": "delivered",
  "migratedFrom": "orders.json",
  "migratedAt": "2025-01-01T12:00:00.000Z"
}
```

### Products Collection
```json
{
  "itemNo": "001",
  "name": "APPAM",
  "rate": "10",
  "category": "Breakfast",
  "migratedFrom": "menu.json",
  "migratedAt": "2025-01-01T12:00:00.000Z"
}
```

## Troubleshooting

### Common Issues

1. **Development server not running**
   ```
   Error: Development server is not running
   ```
   Solution: Run `npm run dev` in another terminal first.

2. **Firestore permission denied**
   ```
   Error: Missing or insufficient permissions
   ```
   Solution: Check your Firestore security rules.

3. **Existing data warning**
   ```
   Warning: Existing Firestore data found
   ```
   Solution: Use `--force` to proceed or `--backup` first.

### Firebase Rules

Make sure your Firestore rules allow writes:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true; // For development only!
    }
  }
}
```

### Environment Variables

Ensure your Firebase config is properly set in your environment or `lib/firebase.ts`.

## Post-Migration Steps

### Update Your Application Code

After migration, update your application to use Firestore instead of Realtime Database:

```typescript
// Before (Realtime Database)
import { database } from './firebase'
import { ref, get } from 'firebase/database'

// After (Firestore)
import { db } from './firebase'
import { collection, getDocs } from 'firebase/firestore'

// Example: Get orders
const ordersRef = collection(db, 'orders')
const snapshot = await getDocs(ordersRef)
```

### Update Firebase Configuration

Your `firebase.json` should include Firestore:

```json
{
  "database": {
    "rules": "database.rules.json"
  },
  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  }
}
```

## Backup and Recovery

### Automatic Backups

The migration tool creates backups in:
- `firestore-backup/` - Firestore data backups
- `backup/` - Local JSON file backups

### Manual Backup

```bash
# Create backup before any migration
npm run migrate:backup
```

### Recovery

To recover from a backup:
1. Stop your application
2. Restore the backup files
3. Re-run the migration if needed

## Performance Notes

- **Batch Operations**: The tool uses Firestore batch operations for optimal performance
- **Rate Limits**: Large datasets are processed in batches to avoid rate limits
- **Memory Usage**: For very large datasets, consider running migration in parts

## Security Considerations

⚠️ **Important**: 
- Never commit Firebase credentials to version control
- Use environment variables for sensitive configuration
- Review and secure your Firestore rules after migration
- Consider using service account keys for production migrations

## Support

If you encounter issues:
1. Check the troubleshooting section
2. Verify your Firebase project setup
3. Check the logs in your development server console
4. Ensure all prerequisites are met

## Migration Checklist

- [ ] Firebase project has both Realtime Database and Firestore enabled
- [ ] Development server is running (`npm run dev`)
- [ ] Firestore rules allow write operations
- [ ] All JSON files are present in project root
- [ ] Backup created (recommended)
- [ ] Migration completed successfully
- [ ] Data verified in Firebase Console
- [ ] Application code updated to use Firestore
- [ ] Production deployment tested
