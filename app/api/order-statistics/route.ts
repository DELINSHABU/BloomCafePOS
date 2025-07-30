import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const ORDERS_FILE = path.join(process.cwd(), 'orders.json')

interface OrderItem {
  id: string
  name: string
  description: string
  price: number
  quantity: number
}

interface Order {
  id: string
  items: OrderItem[]
  total: number
  status: 'pending' | 'preparing' | 'ready' | 'delivered' | 'cancelled'
  tableNumber?: string
  customerName?: string
  orderType: 'dine-in' | 'delivery'
  timestamp: string
  staffMember?: string
}

interface OrdersData {
  orders: Order[]
  lastUpdated: string
}

// Helper function to read orders data
function readOrdersData(): OrdersData {
  try {
    if (fs.existsSync(ORDERS_FILE)) {
      const data = fs.readFileSync(ORDERS_FILE, 'utf8')
      return JSON.parse(data)
    }
    return { orders: [], lastUpdated: new Date().toISOString() }
  } catch (error) {
    console.error('Error reading orders.json:', error)
    return { orders: [], lastUpdated: new Date().toISOString() }
  }
}

// Helper function to get date range
function getDateRange(period: string) {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  
  switch (period) {
    case 'today':
      return { start: today, end: new Date(today.getTime() + 24 * 60 * 60 * 1000) }
    case 'week':
      const weekStart = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
      return { start: weekStart, end: now }
    case 'month':
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)
      return { start: monthStart, end: now }
    default:
      return { start: new Date(0), end: now }
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || 'all'
    
    const ordersData = readOrdersData()
    const { start, end } = getDateRange(period)
    
    // Filter orders by date range
    const filteredOrders = ordersData.orders.filter(order => {
      const orderDate = new Date(order.timestamp)
      return orderDate >= start && orderDate <= end
    })
    
    // Calculate basic statistics
    const totalOrders = filteredOrders.length
    const totalRevenue = filteredOrders.reduce((sum, order) => sum + order.total, 0)
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0
    
    // Calculate average completion time for delivered orders
    const deliveredOrders = filteredOrders.filter(order => order.status === 'delivered')
    const averageCompletionTime = deliveredOrders.length > 0 
      ? deliveredOrders.reduce((sum, order) => {
          // Assume orders are completed when marked as delivered
          // For now, we'll estimate completion time based on order complexity
          // In a real system, you'd track status change timestamps
          const itemCount = order.items.reduce((count, item) => count + item.quantity, 0)
          const estimatedTime = Math.min(15 + (itemCount * 3), 60) // 15-60 minutes based on items
          return sum + estimatedTime
        }, 0) / deliveredOrders.length
      : 0
    
    // Order status breakdown
    const statusBreakdown = filteredOrders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    // Order type breakdown
    const orderTypeBreakdown = filteredOrders.reduce((acc, order) => {
      acc[order.orderType] = (acc[order.orderType] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    // Most popular items
    const itemStats = filteredOrders.reduce((acc, order) => {
      order.items.forEach(item => {
        const itemName = item.name
        if (!acc[itemName]) {
          acc[itemName] = {
            name: itemName,
            totalQuantity: 0,
            totalRevenue: 0,
            orderCount: 0,
            averagePrice: item.price
          }
        }
        acc[itemName].totalQuantity += item.quantity
        acc[itemName].totalRevenue += item.price * item.quantity
        acc[itemName].orderCount += 1
      })
      return acc
    }, {} as Record<string, any>)
    
    const popularItems = Object.values(itemStats)
      .sort((a: any, b: any) => b.totalQuantity - a.totalQuantity)
      .slice(0, 10)
    
    // Revenue by day (for charts)
    const revenueByDay = filteredOrders.reduce((acc, order) => {
      const date = new Date(order.timestamp).toISOString().split('T')[0]
      acc[date] = (acc[date] || 0) + order.total
      return acc
    }, {} as Record<string, number>)
    
    // Orders by day (for charts)
    const ordersByDay = filteredOrders.reduce((acc, order) => {
      const date = new Date(order.timestamp).toISOString().split('T')[0]
      acc[date] = (acc[date] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    // Peak hours analysis
    const ordersByHour = filteredOrders.reduce((acc, order) => {
      const hour = new Date(order.timestamp).getHours()
      acc[hour] = (acc[hour] || 0) + 1
      return acc
    }, {} as Record<number, number>)
    
    // Recent orders (last 10)
    const recentOrders = filteredOrders
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 10)
      .map(order => ({
        id: order.id,
        customerName: order.customerName || 'Anonymous',
        total: order.total,
        status: order.status,
        orderType: order.orderType,
        tableNumber: order.tableNumber,
        timestamp: order.timestamp,
        itemCount: order.items.reduce((sum, item) => sum + item.quantity, 0)
      }))
    
    return NextResponse.json({
      success: true,
      period,
      statistics: {
        totalOrders,
        totalRevenue,
        averageOrderValue: Math.round(averageOrderValue * 100) / 100,
        averageCompletionTime: Math.round(averageCompletionTime * 100) / 100,
        statusBreakdown,
        orderTypeBreakdown,
        popularItems,
        revenueByDay,
        ordersByDay,
        ordersByHour,
        recentOrders
      }
    })
  } catch (error) {
    console.error('Error generating order statistics:', error)
    return NextResponse.json(
      { error: 'Failed to generate statistics' },
      { status: 500 }
    )
  }
}