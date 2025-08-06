import { db } from './firebase'
import { collection, query, where, getDocs, addDoc, Timestamp } from 'firebase/firestore'

export interface LegacyOrder {
  id: string
  items: any[]
  total: number
  status: 'pending' | 'preparing' | 'ready' | 'delivered' | 'cancelled'
  orderType: 'dine-in' | 'delivery'
  tableNumber?: string
  customerName?: string
  timestamp: string
  customerPhone?: string
  deliveryAddress?: {
    label: string
    streetAddress: string
    city: string
    state: string
    zipCode: string
    phoneNumber?: string
  }
}

export interface CustomerOrder {
  id: string
  customerId: string
  items: any[]
  total: number
  status: 'pending' | 'preparing' | 'ready' | 'delivered' | 'cancelled'
  orderType: 'dine-in' | 'delivery'
  tableNumber?: string
  deliveryAddress?: any
  customerName: string
  timestamp: Date
}

/**
 * Finds potential customer matches based on name, phone, or delivery address
 */
export async function findCustomersByOrderData(order: LegacyOrder): Promise<any[]> {
  const potentialMatches: any[] = []

  try {
    // Search by display name if customer name exists
    if (order.customerName && order.customerName.trim() !== '' && order.customerName !== 'Walk-in Customer') {
      const nameQuery = query(
        collection(db, 'customers'),
        where('displayName', '==', order.customerName.trim())
      )
      const nameSnapshot = await getDocs(nameQuery)
      nameSnapshot.docs.forEach(doc => {
        potentialMatches.push({
          id: doc.id,
          ...doc.data(),
          matchReason: 'name',
          confidence: 0.8
        })
      })
    }

    // Search by phone number if available
    if (order.customerPhone) {
      const phoneQuery = query(
        collection(db, 'customers'),
        where('phoneNumber', '==', order.customerPhone)
      )
      const phoneSnapshot = await getDocs(phoneQuery)
      phoneSnapshot.docs.forEach(doc => {
        const existing = potentialMatches.find(m => m.id === doc.id)
        if (existing) {
          existing.confidence = Math.min(1.0, existing.confidence + 0.3)
          existing.matchReason += '+phone'
        } else {
          potentialMatches.push({
            id: doc.id,
            ...doc.data(),
            matchReason: 'phone',
            confidence: 0.9
          })
        }
      })
    }

    // Search by delivery address if available
    if (order.deliveryAddress?.streetAddress) {
      const customersSnapshot = await getDocs(collection(db, 'customers'))
      customersSnapshot.docs.forEach(doc => {
        const customer = doc.data()
        const addressMatch = customer.addresses?.find((addr: any) => 
          addr.streetAddress?.toLowerCase().includes(order.deliveryAddress!.streetAddress.toLowerCase()) ||
          order.deliveryAddress!.streetAddress.toLowerCase().includes(addr.streetAddress?.toLowerCase() || '')
        )
        
        if (addressMatch) {
          const existing = potentialMatches.find(m => m.id === doc.id)
          if (existing) {
            existing.confidence = Math.min(1.0, existing.confidence + 0.2)
            existing.matchReason += '+address'
          } else {
            potentialMatches.push({
              id: doc.id,
              ...customer,
              matchReason: 'address',
              confidence: 0.6
            })
          }
        }
      })
    }

    // Sort by confidence, highest first
    return potentialMatches.sort((a, b) => b.confidence - a.confidence)

  } catch (error) {
    console.error('Error finding customers by order data:', error)
    return []
  }
}

/**
 * Migrates a legacy order to a customer's order history if a match is found
 */
export async function migrateLegacyOrderToCustomer(order: LegacyOrder, customerId: string): Promise<boolean> {
  try {
    // Check if this order already exists in customer's history
    const existingQuery = query(
      collection(db, 'orders'),
      where('customerId', '==', customerId),
      where('timestamp', '==', Timestamp.fromDate(new Date(order.timestamp)))
    )
    const existingSnapshot = await getDocs(existingQuery)
    
    if (existingSnapshot.size > 0) {
      console.log(`Order ${order.id} already exists for customer ${customerId}`)
      return true
    }

    // Create the customer order
    const customerOrder = {
      customerId,
      items: order.items,
      total: order.total,
      status: order.status,
      orderType: order.orderType,
      tableNumber: order.tableNumber,
      deliveryAddress: order.deliveryAddress,
      customerName: order.customerName || 'Customer',
      timestamp: Timestamp.fromDate(new Date(order.timestamp)),
      // Keep original order ID as reference
      originalOrderId: order.id,
      migratedAt: Timestamp.fromDate(new Date())
    }

    await addDoc(collection(db, 'orders'), customerOrder)
    console.log(`Successfully migrated order ${order.id} to customer ${customerId}`)
    return true

  } catch (error) {
    console.error(`Error migrating order ${order.id} to customer ${customerId}:`, error)
    return false
  }
}

/**
 * Loads legacy orders from the analytics data file
 */
export async function loadLegacyOrders(): Promise<LegacyOrder[]> {
  try {
    const response = await fetch('/analytics_data.json')
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    return data.orders || []
  } catch (error) {
    console.error('Error loading legacy orders:', error)
    return []
  }
}

/**
 * Main migration function that processes all legacy orders
 */
export async function migrateAllLegacyOrders(): Promise<{
  processed: number
  migrated: number
  skipped: number
  errors: number
}> {
  const stats = { processed: 0, migrated: 0, skipped: 0, errors: 0 }
  
  try {
    console.log('Starting legacy order migration...')
    const legacyOrders = await loadLegacyOrders()
    console.log(`Found ${legacyOrders.length} legacy orders to process`)

    for (const order of legacyOrders) {
      stats.processed++
      
      try {
        // Skip orders without customer info or walk-in customers
        if (!order.customerName || 
            order.customerName === 'Walk-in Customer' || 
            order.customerName.trim() === '') {
          stats.skipped++
          continue
        }

        // Find potential customer matches
        const customers = await findCustomersByOrderData(order)
        
        if (customers.length === 0) {
          console.log(`No customer match found for order ${order.id} (${order.customerName})`)
          stats.skipped++
          continue
        }

        // Use the best match (highest confidence)
        const bestMatch = customers[0]
        if (bestMatch.confidence < 0.6) {
          console.log(`Low confidence match for order ${order.id}, skipping`)
          stats.skipped++
          continue
        }

        console.log(`Migrating order ${order.id} to customer ${bestMatch.displayName} (confidence: ${bestMatch.confidence})`)
        const success = await migrateLegacyOrderToCustomer(order, bestMatch.id)
        
        if (success) {
          stats.migrated++
        } else {
          stats.errors++
        }

        // Add small delay to avoid overwhelming Firestore
        await new Promise(resolve => setTimeout(resolve, 100))

      } catch (error) {
        console.error(`Error processing order ${order.id}:`, error)
        stats.errors++
      }
    }

    console.log('Migration completed:', stats)
    return stats

  } catch (error) {
    console.error('Error in migration process:', error)
    return stats
  }
}

/**
 * Creates a summary report of what orders can be migrated
 */
export async function generateMigrationReport(): Promise<{
  totalOrders: number
  migratable: Array<{
    orderId: string
    customerName: string
    matches: number
    bestMatchConfidence: number
    bestMatchName: string
  }>
  notMigratable: Array<{
    orderId: string
    customerName: string
    reason: string
  }>
}> {
  const report = {
    totalOrders: 0,
    migratable: [] as any[],
    notMigratable: [] as any[]
  }

  try {
    const legacyOrders = await loadLegacyOrders()
    report.totalOrders = legacyOrders.length

    for (const order of legacyOrders) {
      if (!order.customerName || 
          order.customerName === 'Walk-in Customer' || 
          order.customerName.trim() === '') {
        report.notMigratable.push({
          orderId: order.id,
          customerName: order.customerName || 'N/A',
          reason: 'No customer name or walk-in customer'
        })
        continue
      }

      const customers = await findCustomersByOrderData(order)
      
      if (customers.length === 0) {
        report.notMigratable.push({
          orderId: order.id,
          customerName: order.customerName,
          reason: 'No matching customer found'
        })
      } else if (customers[0].confidence < 0.6) {
        report.notMigratable.push({
          orderId: order.id,
          customerName: order.customerName,
          reason: `Low confidence match (${customers[0].confidence})`
        })
      } else {
        report.migratable.push({
          orderId: order.id,
          customerName: order.customerName,
          matches: customers.length,
          bestMatchConfidence: customers[0].confidence,
          bestMatchName: customers[0].displayName
        })
      }
    }

    return report
  } catch (error) {
    console.error('Error generating migration report:', error)
    return report
  }
}
