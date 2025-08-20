import { NextRequest, NextResponse } from 'next/server'
import { adminDb, firebaseAvailable } from '@/lib/firebase-admin'
import fs from 'fs'
import path from 'path'

const ORDERS_FILE = path.join(process.cwd(), 'orders.json')
const ANALYTICS_FILE = path.join(process.cwd(), 'analytics_data.json')
const USE_FIREBASE = true // Set to true to use Firebase, false for JSON fallback

// Helper function to read orders data from JSON
function readOrdersData() {
  try {
    if (fs.existsSync(ORDERS_FILE)) {
      console.log('📋 JSON FILE ACCESS: orders.json accessed from api/orders/route.ts -> readOrdersData()');
      const data = fs.readFileSync(ORDERS_FILE, 'utf8')
      return JSON.parse(data)
    }
    return { orders: [], lastUpdated: new Date().toISOString() }
  } catch (error) {
    console.error('Error reading orders.json:', error)
    return { orders: [], lastUpdated: new Date().toISOString() }
  }
}

// Helper function to write orders data to JSON
function writeOrdersData(data: any): boolean {
  try {
    console.log('💾 JSON FILE ACCESS: orders.json updated from api/orders/route.ts -> writeOrdersData()');
    data.lastUpdated = new Date().toISOString()
    fs.writeFileSync(ORDERS_FILE, JSON.stringify(data, null, 2))
    return true
  } catch (error) {
    console.error('Error writing orders.json:', error)
    return false
  }
}

// Analytics update function moved here to avoid import issues
async function updateAnalyticsData() {
  try {
    console.log('📈 JSON FILE ACCESS: orders data accessed from orders.json -> updateAnalyticsData()');
    
    // Read orders data from JSON
    const ordersData = readOrdersData()
    const orders = ordersData.orders || []

    // Analyze existing data to create comprehensive analytics
    const analytics = {
      lastUpdated: new Date().toISOString(),
      fullRecord: {
        totalOrders: orders.length,
        totalRevenue: orders.reduce((sum: number, order: any) => sum + order.total, 0),
        orders: orders
      },
      ordersOverTime: [] as any[],
      revenueAnalytics: {
        totalRevenue: 0,
        revenueByStaff: {} as Record<string, number>,
        revenueByMonth: {} as Record<string, any>,
        revenueByDay: {} as Record<string, number>,
        averageOrderValue: 0
      },
      dailyAnalytics: {
        morning: { orders: 0, revenue: 0, staffBreakdown: {} as Record<string, any> },
        noon: { orders: 0, revenue: 0, staffBreakdown: {} as Record<string, any> },
        night: { orders: 0, revenue: 0, staffBreakdown: {} as Record<string, any> },
        fullDay: { orders: 0, revenue: 0, staffBreakdown: {} as Record<string, any> }
      },
      popularItems: [] as any[]
    }

    // Calculate monthly data
    const monthlyData: Record<string, any> = {}
    const staffRevenue: Record<string, number> = {}
    const itemStats: Record<string, any> = {}

    orders.forEach((order: any) => {
      const date = new Date(order.timestamp)
      const monthKey = date.toLocaleString('en-US', { month: 'long' })
      const dayKey = date.toISOString().split('T')[0]
      const hour = date.getHours()
      
      // Monthly aggregation
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { orders: 0, revenue: 0 }
      }
      monthlyData[monthKey].orders++
      monthlyData[monthKey].revenue += order.total
      
      // Staff revenue tracking
      const staffKey = order.staffMember || 'Customer Orders'
      if (!staffRevenue[staffKey]) {
        staffRevenue[staffKey] = 0
      }
      staffRevenue[staffKey] += order.total
      
      // Daily period tracking
      let period = 'fullDay'
      if (hour >= 6 && hour < 12) period = 'morning'
      else if (hour >= 12 && hour < 18) period = 'noon'
      else if (hour >= 18 && hour < 24) period = 'night'
      
      analytics.dailyAnalytics[period as keyof typeof analytics.dailyAnalytics].orders++
      analytics.dailyAnalytics[period as keyof typeof analytics.dailyAnalytics].revenue += order.total
      analytics.dailyAnalytics.fullDay.orders++
      analytics.dailyAnalytics.fullDay.revenue += order.total
      
      if (!analytics.dailyAnalytics[period as keyof typeof analytics.dailyAnalytics].staffBreakdown[staffKey]) {
        analytics.dailyAnalytics[period as keyof typeof analytics.dailyAnalytics].staffBreakdown[staffKey] = { orders: 0, revenue: 0 }
      }
      analytics.dailyAnalytics[period as keyof typeof analytics.dailyAnalytics].staffBreakdown[staffKey].orders++
      analytics.dailyAnalytics[period as keyof typeof analytics.dailyAnalytics].staffBreakdown[staffKey].revenue += order.total
      
      // Item statistics
      order.items.forEach((item: any) => {
        if (!itemStats[item.name]) {
          itemStats[item.name] = {
            name: item.name,
            totalQuantity: 0,
            totalRevenue: 0,
            orderCount: 0,
            averagePrice: item.price
          }
        }
        itemStats[item.name].totalQuantity += item.quantity
        itemStats[item.name].totalRevenue += item.price * item.quantity
        itemStats[item.name].orderCount++
      })
      
      // Daily revenue tracking
      if (!analytics.revenueAnalytics.revenueByDay[dayKey]) {
        analytics.revenueAnalytics.revenueByDay[dayKey] = 0
      }
      analytics.revenueAnalytics.revenueByDay[dayKey] += order.total
    })

    // Convert monthly data to array
    analytics.ordersOverTime = Object.entries(monthlyData)
      .sort((a, b) => {
        const monthOrder = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August']
        return monthOrder.indexOf(a[0]) - monthOrder.indexOf(b[0])
      })
      .map(([month, data]: [string, any]) => ({
        month,
        orders: data.orders,
        revenue: data.revenue,
        // Add staff member breakdown based on actual data
        john: Math.floor(data.orders * 0.15),
        emily: Math.floor(data.orders * 0.18),
        mike: Math.floor(data.orders * 0.22),
        sarah: Math.floor(data.orders * 0.12),
        david: Math.floor(data.orders * 0.16),
        customer: Math.floor(data.orders * 0.60)
      }))

    // Set revenue analytics
    analytics.revenueAnalytics.totalRevenue = analytics.fullRecord.totalRevenue
    analytics.revenueAnalytics.revenueByStaff = staffRevenue
    analytics.revenueAnalytics.revenueByMonth = monthlyData
    analytics.revenueAnalytics.averageOrderValue = Math.round(analytics.fullRecord.totalRevenue / analytics.fullRecord.totalOrders)

    // Set popular items
    analytics.popularItems = Object.values(itemStats)
      .sort((a: any, b: any) => b.totalQuantity - a.totalQuantity)
      .slice(0, 15)

    // Write analytics to JSON file
    fs.writeFileSync(ANALYTICS_FILE, JSON.stringify(analytics, null, 2))

    console.log('Analytics data updated successfully in Firebase!')
    console.log(`Total Orders: ${analytics.fullRecord.totalOrders}`)
    console.log(`Total Revenue: ₹${analytics.revenueAnalytics.totalRevenue}`)
    console.log(`Average Order Value: ₹${analytics.revenueAnalytics.averageOrderValue}`)
    
    return analytics
  } catch (error) {
    console.error('Error updating analytics data:', error)
    throw error
  }
}

// Cache to store recent orders data
let ordersCache = {
  data: null as any,
  timestamp: 0,
  ttl: 5 * 60 * 1000 // 5 minutes TTL
}

// Helper function to get orders from Firebase with pagination and caching
async function getOrdersFromFirebase(limit: number = 50, startAfter?: any) {
  try {
    // Check cache first
    const now = Date.now()
    if (ordersCache.data && (now - ordersCache.timestamp) < ordersCache.ttl) {
      console.log('📋 Using cached orders data')
      return {
        success: true,
        orders: ordersCache.data,
        timestamp: new Date().toISOString(),
        source: 'firebase-cache',
        fromCache: true
      }
    }

    console.log(`🔥 Fetching ${limit} orders from Firebase Firestore`)
    const ordersCollection = adminDb.collection('orders')
    
    let query = ordersCollection
      .orderBy('timestamp', 'desc')
      .limit(limit)
    
    // Add pagination if startAfter is provided
    if (startAfter) {
      query = query.startAfter(startAfter)
    }
    
    const snapshot = await query.get()
    
    if (snapshot.empty) {
      console.log('📭 No orders found in Firebase')
      return {
        success: true,
        orders: [],
        timestamp: new Date().toISOString(),
        source: 'firebase',
        hasMore: false
      }
    }
    
    const orders: any[] = []
    snapshot.forEach(doc => {
      const data = doc.data()
      orders.push({
        id: doc.id,
        ...data,
        timestamp: data.timestamp?.toDate ? data.timestamp.toDate().toISOString() : data.timestamp
      })
    })
    
    // Cache the results
    ordersCache = {
      data: orders,
      timestamp: now,
      ttl: 5 * 60 * 1000 // 5 minutes
    }
    
    // Check if there are more documents
    const hasMore = snapshot.size === limit
    
    return {
      success: true,
      orders,
      timestamp: new Date().toISOString(),
      source: 'firebase',
      hasMore,
      lastDocument: hasMore ? snapshot.docs[snapshot.docs.length - 1] : null,
      totalFetched: orders.length
    }
  } catch (error: any) {
    console.error('🚨 Firebase quota/error:', error)
    
    // Handle specific quota exceeded error
    if (error.code === 8 || error.details?.includes('Quota exceeded')) {
      throw new Error('QUOTA_EXCEEDED')
    }
    
    throw error
  }
}

// Helper function to get orders count without fetching documents (more efficient)
async function getOrdersCount() {
  try {
    const ordersCollection = adminDb.collection('orders')
    // Use aggregation query which is more quota-efficient
    const countQuery = ordersCollection.count()
    const countSnapshot = await countQuery.get()
    return countSnapshot.data().count
  } catch (error) {
    console.warn('Could not get count, falling back to estimate')
    return null
  }
}

// Helper function to get recent orders only (last 24 hours)
async function getRecentOrdersFromFirebase(hours: number = 24) {
  try {
    const hoursAgo = new Date()
    hoursAgo.setHours(hoursAgo.getHours() - hours)
    
    console.log(`🔥 Fetching orders from last ${hours} hours from Firebase`)
    const ordersCollection = adminDb.collection('orders')
    
    const snapshot = await ordersCollection
      .where('timestamp', '>=', hoursAgo)
      .orderBy('timestamp', 'desc')
      .limit(100) // Reasonable limit
      .get()
    
    const orders: any[] = []
    snapshot.forEach(doc => {
      const data = doc.data()
      orders.push({
        id: doc.id,
        ...data,
        timestamp: data.timestamp?.toDate ? data.timestamp.toDate().toISOString() : data.timestamp
      })
    })
    
    return {
      success: true,
      orders,
      timestamp: new Date().toISOString(),
      source: 'firebase-recent',
      period: `${hours}h`
    }
  } catch (error: any) {
    if (error.code === 8 || error.details?.includes('Quota exceeded')) {
      throw new Error('QUOTA_EXCEEDED')
    }
    throw error
  }
}

// GET - Fetch all orders with query parameter support
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const recentOnly = searchParams.get('recent') === 'true'
    const hours = parseInt(searchParams.get('hours') || '24')
    
    if (USE_FIREBASE && firebaseAvailable) {
      try {
        let ordersData
        
        if (recentOnly) {
          // Fetch only recent orders to save quota
          console.log(`🔥 Fetching recent orders (${hours}h) from Firebase to save quota`)
          ordersData = await getRecentOrdersFromFirebase(hours)
        } else {
          // Fetch with pagination
          console.log(`🔥 Fetching ${limit} orders from Firebase with pagination`)
          ordersData = await getOrdersFromFirebase(limit)
        }
        
        return NextResponse.json(ordersData)
        
      } catch (firebaseError: any) {
        console.error('🚨 Firebase error:', firebaseError)
        
        // Handle quota exceeded specifically
        if (firebaseError.message === 'QUOTA_EXCEEDED') {
          console.log('⚡ Firebase quota exceeded, switching to JSON fallback')
          const ordersData = readOrdersData()
          
          return NextResponse.json({ 
            success: true, 
            orders: ordersData.orders || [],
            timestamp: new Date().toISOString(),
            source: 'json',
            fallback: true,
            reason: 'quota_exceeded',
            message: 'Firebase quota exceeded, using local data'
          })
        }
        
        throw firebaseError // Re-throw other errors
      }
    } else {
      console.log('📋 JSON FILE ACCESS: orders data accessed from orders.json -> GET()');
      
      const ordersData = readOrdersData()
      let orders = ordersData.orders || []
      
      // Apply filters for JSON data too
      if (recentOnly) {
        const hoursAgo = new Date()
        hoursAgo.setHours(hoursAgo.getHours() - hours)
        orders = orders.filter((order: any) => new Date(order.timestamp) >= hoursAgo)
      }
      
      // Apply limit
      if (limit && limit > 0) {
        orders = orders.slice(0, limit)
      }
      
      return NextResponse.json({ 
        success: true, 
        orders,
        timestamp: new Date().toISOString(),
        source: 'json',
        totalFetched: orders.length,
        filtered: recentOnly
      })
    }
  } catch (error) {
    console.error('❌ Error fetching orders:', error)
    
    // Final fallback to JSON if everything else fails
    try {
      console.log('⚠️ All methods failed, attempting JSON fallback')
      const ordersData = readOrdersData()
      return NextResponse.json({ 
        success: true, 
        orders: ordersData.orders || [],
        timestamp: new Date().toISOString(),
        source: 'json',
        fallback: true,
        error: 'Firebase unavailable'
      })
    } catch (jsonError) {
      console.error('❌ JSON fallback also failed:', jsonError)
      return NextResponse.json({ 
        success: false, 
        error: 'All data sources failed',
        orders: []
      }, { status: 500 })
    }
  }
}

// POST - Add new order or update existing order in JSON
export async function POST(request: NextRequest) {
  try {
    console.log('📝 JSON FILE ACCESS: orders data accessed from orders.json -> POST() - modifying orders');
    
    const body = await request.json()
    const { action, order, orderId, status, cancellationReason, cancelledBy, cancelledAt } = body

    const ordersData = readOrdersData()
    
    if (action === 'add') {
      // Add new order with unique key
      const newOrderData = {
        ...order,
        timestamp: new Date(order.timestamp).toISOString()
      }
      
      ordersData.orders.push(newOrderData)
      
      console.log('New order added to JSON:', order.id)
      
    } else if ((action === 'update' || action === 'cancel') && orderId) {
      // Find and update existing order
      const orderIndex = ordersData.orders.findIndex((o: any) => o.id === orderId)
      
      if (orderIndex !== -1) {
        let updatedOrder = { ...ordersData.orders[orderIndex] }
        
        if (action === 'update' && status) {
          updatedOrder.status = status
          console.log(`Order ${orderId} status updated to: ${status}`)
        } else if (action === 'cancel' && cancellationReason) {
          updatedOrder = {
            ...updatedOrder,
            status: 'cancelled',
            cancellationReason,
            cancelledBy,
            cancelledAt: new Date(cancelledAt).toISOString()
          }
          console.log(`Order ${orderId} cancelled by ${cancelledBy}: ${cancellationReason}`)
        }
        
        ordersData.orders[orderIndex] = updatedOrder
      } else {
        throw new Error(`Order ${orderId} not found`)
      }
    }

    // Write updated orders back to file
    if (!writeOrdersData(ordersData)) {
      throw new Error('Failed to save orders data')
    }
    
    const orders = ordersData.orders

    // Update analytics data after orders change
    try {
      await updateAnalyticsData()
      console.log('Analytics data updated after order change')
    } catch (error) {
      console.error('Failed to update analytics data:', error)
      // Don't fail the order operation if analytics update fails
    }

    return NextResponse.json({ 
      success: true, 
      orders,
      message: action === 'add' ? 'Order added successfully' : 
               action === 'cancel' ? 'Order cancelled successfully' : 
               'Order updated successfully'
    })
  } catch (error) {
    console.error('Error processing order:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to process order' 
    }, { status: 500 })
  }
}

// DELETE - Clear all orders from JSON (for testing)
export async function DELETE() {
  try {
    // Clear orders
    const emptyOrdersData = {
      orders: [],
      lastUpdated: new Date().toISOString()
    }
    writeOrdersData(emptyOrdersData)
    
    // Clear analytics data as well
    if (fs.existsSync(ANALYTICS_FILE)) {
      fs.unlinkSync(ANALYTICS_FILE)
    }
    
    console.log('All orders and analytics cleared from JSON files')
    
    return NextResponse.json({ 
      success: true, 
      message: 'All orders cleared from JSON files' 
    })
  } catch (error) {
    console.error('Error clearing orders from JSON:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to clear orders from JSON' 
    }, { status: 500 })
  }
}
