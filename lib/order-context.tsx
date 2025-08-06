"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import type { Order, OrderStatus } from '@/app/page'

interface OrderContextType {
  orders: Order[]
  addOrder: (order: Order) => void
  updateOrderStatus: (orderId: string, status: OrderStatus) => void
  cancelOrder: (orderId: string, reason: string, cancelledBy: string) => void
  getOrdersByStatus: (status: OrderStatus) => Order[]
  syncOrders: () => void
}

const OrderContext = createContext<OrderContextType | undefined>(undefined)

// API helper functions
const fetchOrdersFromAPI = async (): Promise<Order[]> => {
  try {
    const response = await fetch('/api/orders', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    if (data.success && data.orders) {
      const orders = data.orders.map((order: any) => ({
        ...order,
        timestamp: new Date(order.timestamp)
      }))
      console.log('Orders fetched from API:', orders.length, 'orders')
      return orders
    }
  } catch (error) {
    console.error('Failed to fetch orders from API:', error)
  }
  return []
}

const addOrderToAPI = async (order: Order): Promise<boolean> => {
  try {
    const response = await fetch('/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'add',
        order: {
          ...order,
          timestamp: order.timestamp.toISOString()
        }
      })
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    console.log('Order added to API:', data.message)
    return data.success
  } catch (error) {
    console.error('Failed to add order to API:', error)
    return false
  }
}

const updateOrderStatusInAPI = async (orderId: string, status: OrderStatus): Promise<boolean> => {
  try {
    const response = await fetch('/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'update',
        orderId,
        status
      })
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    console.log('Order status updated in API:', data.message)
    return data.success
  } catch (error) {
    console.error('Failed to update order status in API:', error)
    return false
  }
}

const cancelOrderInAPI = async (orderId: string, reason: string, cancelledBy: string): Promise<boolean> => {
  try {
    const response = await fetch('/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'cancel',
        orderId,
        cancellationReason: reason,
        cancelledBy,
        cancelledAt: new Date().toISOString()
      })
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    console.log('Order cancelled in API:', data.message)
    return data.success
  } catch (error) {
    console.error('Failed to cancel order in API:', error)
    return false
  }
}

export function OrderProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<Order[]>([])
  const [isInitialized, setIsInitialized] = useState(false)

  // Load orders from API on mount
  useEffect(() => {
    const loadOrders = async () => {
      const apiOrders = await fetchOrdersFromAPI()
      setOrders(apiOrders)
      setIsInitialized(true)
      console.log('OrderProvider initialized with', apiOrders.length, 'orders from API')
    }
    
    loadOrders()
  }, [])

  // Periodic sync to check for updates from other devices
  useEffect(() => {
    if (!isInitialized) return

    const syncInterval = setInterval(async () => {
      try {
        const latestOrders = await fetchOrdersFromAPI()
        // Only update if there are changes to avoid unnecessary re-renders
        if (JSON.stringify(latestOrders) !== JSON.stringify(orders)) {
          setOrders(latestOrders)
          console.log('Orders synced from API:', latestOrders.length, 'orders')
        }
      } catch (error) {
        console.error('Failed to sync orders from API:', error)
      }
    }, 3000) // Check every 3 seconds for real-time updates

    return () => clearInterval(syncInterval)
  }, [isInitialized, orders])

  const addOrder = async (order: Order) => {
    console.log('Adding new order:', order)
    
    // Optimistically update local state
    setOrders(prev => [...prev, order])
    
    // Sync with API
    const success = await addOrderToAPI(order)
    if (!success) {
      // Revert on failure
      setOrders(prev => prev.filter(o => o.id !== order.id))
      console.error('Failed to add order to API, reverted local state')
    }
  }

  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    console.log(`Updating order ${orderId} status to: ${status}`)
    
    // Optimistically update local state
    const previousOrders = orders
    setOrders(prev => prev.map(order => 
      order.id === orderId ? { ...order, status } : order
    ))
    
    // Sync with API
    const success = await updateOrderStatusInAPI(orderId, status)
    if (!success) {
      // Revert on failure
      setOrders(previousOrders)
      console.error('Failed to update order status in API, reverted local state')
    }
  }

  const cancelOrder = async (orderId: string, reason: string, cancelledBy: string) => {
    console.log(`Cancelling order ${orderId} with reason: ${reason}`)
    
    // Optimistically update local state
    const previousOrders = orders
    const cancelledAt = new Date()
    setOrders(prev => prev.map(order => 
      order.id === orderId ? { 
        ...order, 
        status: 'cancelled' as OrderStatus,
        cancellationReason: reason,
        cancelledBy,
        cancelledAt
      } : order
    ))
    
    // Sync with API
    const success = await cancelOrderInAPI(orderId, reason, cancelledBy)
    if (!success) {
      // Revert on failure
      setOrders(previousOrders)
      console.error('Failed to cancel order in API, reverted local state')
    }
  }

  const getOrdersByStatus = (status: OrderStatus) => {
    return orders.filter(order => order.status === status)
  }

  const syncOrders = async () => {
    try {
      const latestOrders = await fetchOrdersFromAPI()
      setOrders(latestOrders)
      console.log('Manual sync completed:', latestOrders.length, 'orders')
    } catch (error) {
      console.error('Manual sync failed:', error)
    }
  }

  return (
    <OrderContext.Provider value={{
      orders,
      addOrder,
      updateOrderStatus,
      cancelOrder,
      getOrdersByStatus,
      syncOrders
    }}>
      {children}
    </OrderContext.Provider>
  )
}

export function useOrders() {
  const context = useContext(OrderContext)
  if (context === undefined) {
    throw new Error('useOrders must be used within an OrderProvider')
  }
  return context
}