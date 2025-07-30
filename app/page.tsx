"use client"

import { useState, useEffect } from "react"
import HomePage from "@/components/home-page"
import CartModal from "@/components/cart-modal"
import OrderListPage from "@/components/order-list-page"
import MenuPage from "@/components/menu-page"
import OrderSuccessPage from "@/components/order-success-page"
import QRGenerator from "@/components/qr-generator"
import { OrderProvider, useOrders } from "@/lib/order-context"

export type CartItem = {
  id: string
  name: string
  description: string
  price: number
  quantity: number
}

export type OrderStatus = "pending" | "preparing" | "ready" | "delivered"

export type Order = {
  id: string
  items: CartItem[]
  total: number
  status: OrderStatus
  tableNumber?: string
  customerName?: string
  orderType: "dine-in" | "delivery"
  timestamp: Date
  staffMember?: string
}

export type Page = "home" | "menu" | "cart" | "order-list" | "order-success" | "qr-generator"

function AppContent() {
  const [currentPage, setCurrentPage] = useState<Page>("home")
  const [showCartModal, setShowCartModal] = useState(false)
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [tableNumber, setTableNumber] = useState<string>("")
  const [orderType, setOrderType] = useState<"dine-in" | "delivery">("delivery")
  const [isCartLoaded, setIsCartLoaded] = useState(false)
  
  const { orders, addOrder, updateOrderStatus } = useOrders()

  // Cart persistence functions
  const saveCartToStorage = (items: CartItem[]) => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('bloom_cafe_cart', JSON.stringify({
          items,
          tableNumber,
          orderType,
          timestamp: new Date().toISOString()
        }))
        console.log('Cart saved to localStorage:', items.length, 'items')
      } catch (error) {
        console.error('Failed to save cart to localStorage:', error)
      }
    }
  }

  const loadCartFromStorage = () => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('bloom_cafe_cart')
        if (stored) {
          const cartData = JSON.parse(stored)
          const savedTime = new Date(cartData.timestamp)
          const now = new Date()
          const hoursDiff = (now.getTime() - savedTime.getTime()) / (1000 * 60 * 60)
          
          // Only restore cart if it's less than 24 hours old
          if (hoursDiff < 24) {
            console.log('Cart loaded from localStorage:', cartData.items.length, 'items')
            return {
              items: cartData.items || [],
              tableNumber: cartData.tableNumber || "",
              orderType: cartData.orderType || "delivery"
            }
          } else {
            // Clear old cart data
            localStorage.removeItem('bloom_cafe_cart')
            console.log('Old cart data cleared (>24 hours)')
          }
        }
      } catch (error) {
        console.error('Failed to load cart from localStorage:', error)
      }
    }
    return { items: [], tableNumber: "", orderType: "delivery" }
  }

  const clearCartFromStorage = () => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('bloom_cafe_cart')
        console.log('Cart cleared from localStorage')
      } catch (error) {
        console.error('Failed to clear cart from localStorage:', error)
      }
    }
  }

  // Load cart from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedCart = loadCartFromStorage()
      setCartItems(savedCart.items)
      
      // Only set table/order type from storage if not already set by URL
      if (!tableNumber && savedCart.tableNumber) {
        setTableNumber(savedCart.tableNumber)
      }
      if (orderType === "delivery" && savedCart.orderType) {
        setOrderType(savedCart.orderType)
      }
      
      setIsCartLoaded(true)
      console.log('Cart initialization completed')
    }
  }, [])

  // Initialize page state from URL on load
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const updateFromURL = () => {
        const urlParams = new URLSearchParams(window.location.search)
        const table = urlParams.get('table')
        const page = urlParams.get('page') as Page
        
        console.log('URL Detection - Full URL:', window.location.href)
        console.log('URL Detection - Table parameter:', table)
        console.log('URL Detection - Page parameter:', page)
        
        // Handle QR code table parameter (takes priority over stored data)
        if (table) {
          console.log('Setting table number from URL:', table)
          setTableNumber(table)
          setOrderType("dine-in")
        }
        
        // Handle page parameter
        if (page && isValidPage(page)) {
          console.log('Setting page from URL:', page)
          setCurrentPage(page)
        } else if (!page) {
          // No page parameter means home page
          setCurrentPage("home")
        }
      }

      // Initial load
      updateFromURL()

      // Handle browser back/forward buttons
      const handlePopState = () => {
        console.log('Browser navigation detected')
        updateFromURL()
      }

      window.addEventListener('popstate', handlePopState)
      
      return () => {
        window.removeEventListener('popstate', handlePopState)
      }
    }
  }, [])

  // Save cart to localStorage whenever cart items, table, or order type changes
  useEffect(() => {
    if (isCartLoaded) {
      saveCartToStorage(cartItems)
    }
  }, [cartItems, tableNumber, orderType, isCartLoaded])

  // Helper function to validate page parameter
  const isValidPage = (page: string): page is Page => {
    const validPages: Page[] = ["home", "menu", "cart", "order-list", "order-success", "qr-generator"]
    return validPages.includes(page as Page)
  }

  // Update URL when page changes (without page reload)
  const navigateToPage = (page: Page) => {
    setCurrentPage(page)
    
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      
      // Preserve table parameter if it exists
      if (tableNumber) {
        urlParams.set('table', tableNumber)
      }
      
      // Set page parameter (except for home page to keep URLs clean)
      if (page !== 'home') {
        urlParams.set('page', page)
      } else {
        urlParams.delete('page')
      }
      
      const newUrl = `${window.location.pathname}${urlParams.toString() ? '?' + urlParams.toString() : ''}`
      window.history.pushState({}, '', newUrl)
      console.log('Navigation - Updated URL to:', newUrl)
    }
  }

  const addToCart = (item: Omit<CartItem, "quantity">) => {
    setCartItems((prev) => {
      const existing = prev.find((i) => i.id === item.id)
      if (existing) {
        return prev.map((i) => (i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i))
      }
      return [...prev, { ...item, quantity: 1 }]
    })
  }

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      setCartItems((prev) => prev.filter((item) => item.id !== id))
    } else {
      setCartItems((prev) => prev.map((item) => (item.id === id ? { ...item, quantity } : item)))
    }
  }

  const getTotalItems = () => {
    return cartItems.reduce((sum, item) => sum + item.quantity, 0)
  }

  const createOrder = (customerName?: string) => {
    const newOrder: Order = {
      id: `order-${Math.random().toString(36).substr(2, 9)}`,
      items: [...cartItems],
      total: cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
      status: "pending",
      tableNumber: orderType === "dine-in" ? tableNumber : undefined,
      customerName,
      orderType,
      timestamp: new Date()
    }
    
    addOrder(newOrder)
    setCartItems([])
    clearCartFromStorage() // Clear cart from localStorage after successful order
    return newOrder
  }

  if (currentPage === "home") {
    return (
      <>
        <HomePage
          onNavigate={navigateToPage}
          onAddToCart={addToCart}
          onShowCart={() => setShowCartModal(true)}
          cartItemCount={getTotalItems()}
          orderType={orderType}
          tableNumber={tableNumber}
          onOrderTypeChange={setOrderType}
        />
        {showCartModal && (
          <CartModal
            items={cartItems}
            onClose={() => setShowCartModal(false)}
            onUpdateQuantity={updateQuantity}
            onConfirm={() => {
              setShowCartModal(false)
              navigateToPage("order-list")
            }}
          />
        )}
      </>
    )
  }

  if (currentPage === "menu") {
    return (
      <>
        <MenuPage 
          onNavigate={navigateToPage} 
          onAddToCart={addToCart} 
          cartItemCount={getTotalItems()} 
          onShowCart={() => setShowCartModal(true)}
        />
        {showCartModal && (
          <CartModal
            items={cartItems}
            onClose={() => setShowCartModal(false)}
            onUpdateQuantity={updateQuantity}
            onConfirm={() => {
              setShowCartModal(false)
              navigateToPage("order-list")
            }}
          />
        )}
      </>
    )
  }

  if (currentPage === "order-list") {
    return (
      <OrderListPage
        items={cartItems}
        onNavigate={navigateToPage}
        onUpdateQuantity={updateQuantity}
        onOrderNow={(customerName) => {
          createOrder(customerName)
          navigateToPage("order-success")
        }}
        orderType={orderType}
        tableNumber={tableNumber}
        onOrderTypeChange={setOrderType}
      />
    )
  }

  if (currentPage === "order-success") {
    return (
      <OrderSuccessPage
        onNavigate={navigateToPage}
        totalAmount={orders[orders.length - 1]?.total || 0}
        orderType={orderType}
        tableNumber={tableNumber}
      />
    )
  }

  if (currentPage === "qr-generator") {
    return <QRGenerator onNavigate={navigateToPage} />
  }

  return null
}

export default function App() {
  return (
    <OrderProvider>
      <AppContent />
    </OrderProvider>
  )
}
