import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

const ORDERS_FILE = path.join(process.cwd(), 'orders.json')

// Ensure orders file exists
async function ensureOrdersFile() {
  try {
    await fs.access(ORDERS_FILE)
  } catch {
    await fs.writeFile(ORDERS_FILE, JSON.stringify({ orders: [] }))
  }
}

// GET - Fetch all orders
export async function GET() {
  try {
    await ensureOrdersFile()
    const data = await fs.readFile(ORDERS_FILE, 'utf8')
    const { orders } = JSON.parse(data)
    
    return NextResponse.json({ 
      success: true, 
      orders: orders || [],
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch orders',
      orders: []
    }, { status: 500 })
  }
}

// POST - Add new order or update existing order
export async function POST(request: NextRequest) {
  try {
    await ensureOrdersFile()
    const body = await request.json()
    const { action, order, orderId, status } = body

    const data = await fs.readFile(ORDERS_FILE, 'utf8')
    const ordersData = JSON.parse(data)
    let orders = ordersData.orders || []

    if (action === 'add') {
      // Add new order
      orders.push({
        ...order,
        timestamp: new Date(order.timestamp).toISOString()
      })
      console.log('New order added:', order.id)
    } else if (action === 'update' && orderId && status) {
      // Update order status
      orders = orders.map((o: any) => 
        o.id === orderId ? { ...o, status } : o
      )
      console.log(`Order ${orderId} status updated to: ${status}`)
    }

    // Save updated orders
    await fs.writeFile(ORDERS_FILE, JSON.stringify({ 
      orders,
      lastUpdated: new Date().toISOString()
    }))

    return NextResponse.json({ 
      success: true, 
      orders,
      message: action === 'add' ? 'Order added successfully' : 'Order updated successfully'
    })
  } catch (error) {
    console.error('Error processing order:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to process order' 
    }, { status: 500 })
  }
}

// DELETE - Clear all orders (for testing)
export async function DELETE() {
  try {
    await fs.writeFile(ORDERS_FILE, JSON.stringify({ 
      orders: [],
      lastUpdated: new Date().toISOString()
    }))
    
    return NextResponse.json({ 
      success: true, 
      message: 'All orders cleared' 
    })
  } catch (error) {
    console.error('Error clearing orders:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to clear orders' 
    }, { status: 500 })
  }
}