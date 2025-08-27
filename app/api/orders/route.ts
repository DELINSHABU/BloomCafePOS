import { NextRequest, NextResponse } from 'next/server'
import { JsonDataService } from '@/lib/json-data-service'

// GET - Fetch orders with query parameters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const recentOnly = searchParams.get('recent') === 'true'
    const hours = parseInt(searchParams.get('hours') || '24')
    
    console.log('📋 Fetching orders from JSON file')
    
    const ordersData = JsonDataService.getOrders()
    let orders = ordersData.orders || []
    
    // Apply filters
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
    
  } catch (error) {
    console.error('❌ Error fetching orders:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch orders',
        orders: []
      }, 
      { status: 500 }
    )
  }
}

// POST - Add new order or update existing order
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, order, orderId, status, cancellationReason, cancelledBy, cancelledAt } = body

    console.log(`📝 Processing order ${action} in JSON file`)
    
    if (action === 'add') {
      // Add new order
      const newOrder = JsonDataService.addOrder(order)
      if (!newOrder) {
        throw new Error('Failed to add order')
      }
      
      return NextResponse.json({ 
        success: true, 
        order: newOrder,
        message: 'Order added successfully'
      })
      
    } else if (action === 'update' && orderId && status) {
      // Update order status
      const success = JsonDataService.updateOrder(orderId, { status })
      if (!success) {
        throw new Error(`Order ${orderId} not found or update failed`)
      }
      
      return NextResponse.json({ 
        success: true, 
        message: `Order status updated to: ${status}`
      })
      
    } else if (action === 'cancel' && orderId && cancellationReason) {
      // Cancel order
      const success = JsonDataService.updateOrder(orderId, {
        status: 'cancelled',
        cancellationReason,
        cancelledBy,
        cancelledAt: new Date(cancelledAt).toISOString()
      })
      
      if (!success) {
        throw new Error(`Order ${orderId} not found or cancellation failed`)
      }
      
      return NextResponse.json({ 
        success: true, 
        message: `Order cancelled by ${cancelledBy}: ${cancellationReason}`
      })
      
    } else {
      return NextResponse.json(
        { error: 'Invalid action or missing required fields' },
        { status: 400 }
      )
    }
    
  } catch (error) {
    console.error('Error processing order:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to process order'
      }, 
      { status: 500 }
    )
  }
}

// DELETE - Remove specific order or clear all orders
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const orderId = searchParams.get('orderId')
    const clearAll = searchParams.get('clearAll') === 'true'
    
    if (clearAll) {
      // Clear all orders and analytics
      const ordersSuccess = JsonDataService.saveOrders({ orders: [] })
      
      if (!ordersSuccess) {
        throw new Error('Failed to clear orders')
      }
      
      console.log('All orders cleared from JSON files')
      
      return NextResponse.json({ 
        success: true, 
        message: 'All orders cleared successfully' 
      })
      
    } else if (orderId) {
      // Delete specific order
      const success = JsonDataService.deleteOrder(orderId)
      
      if (!success) {
        return NextResponse.json(
          { error: `Order ${orderId} not found` },
          { status: 404 }
        )
      }
      
      return NextResponse.json({ 
        success: true, 
        message: `Order ${orderId} deleted successfully` 
      })
      
    } else {
      return NextResponse.json(
        { error: 'orderId or clearAll parameter required' },
        { status: 400 }
      )
    }
    
  } catch (error) {
    console.error('Error deleting orders:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to delete orders'
      }, 
      { status: 500 }
    )
  }
}
