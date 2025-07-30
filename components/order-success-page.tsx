"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Home, Menu, Check, Clock, CheckCircle } from "lucide-react"
import type { Page } from "@/app/page"

interface OrderSuccessPageProps {
  onNavigate: (page: Page) => void
  totalAmount: number
  orderType: "dine-in" | "delivery"
  tableNumber: string
}

export default function OrderSuccessPage({ onNavigate, totalAmount, orderType, tableNumber }: OrderSuccessPageProps) {
  const getEstimatedTime = () => {
    return orderType === "dine-in" ? "15-20 minutes" : "30-45 minutes"
  }

  const [currentTime, setCurrentTime] = useState<string>("")
  const [orderId, setOrderId] = useState<string>("")

  useEffect(() => {
    // Set these values only on client side to avoid hydration mismatch
    setCurrentTime(new Intl.DateTimeFormat('en-US', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }).format(new Date()))
    
    setOrderId(Math.random().toString(36).substr(2, 8).toUpperCase())
  }, [])

  return (
    <div className="w-full bg-white min-h-screen">
      {/* Header */}
      <div className="bg-emerald-700 text-white p-4 sm:p-6">
        <h1 className="text-xl sm:text-2xl font-bold text-center">Order Confirmed!</h1>
      </div>

      <div className="flex flex-col items-center justify-center p-6 sm:p-8">
        <div className="text-center max-w-md w-full">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 sm:w-12 sm:h-12 text-green-600" />
          </div>
          
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Thank You!</h2>
          
          {/* Order Details Card */}
          <div className="bg-gray-50 rounded-lg p-4 sm:p-6 mb-6 text-left">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Order ID:</span>
                <span className="font-medium">#{orderId}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Order Time:</span>
                <span className="font-medium">{currentTime}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Order Type:</span>
                <span className="font-medium">
                  {orderType === "dine-in" ? "🍽️ Dine-in" : "🚚 Delivery"}
                </span>
              </div>
              
              {tableNumber && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Table:</span>
                  <span className="font-medium">{tableNumber}</span>
                </div>
              )}
              
              <div className="flex justify-between items-center pt-2 border-t">
                <span className="text-gray-600">Estimated Time:</span>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4 text-orange-500" />
                  <span className="font-medium text-orange-600">{getEstimatedTime()}</span>
                </div>
              </div>
              
              <div className="flex justify-between items-center pt-2 border-t">
                <span className="text-lg font-semibold text-gray-900">Total Amount:</span>
                <span className="text-xl font-bold text-emerald-600">₹{totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <p className="text-gray-600 mb-6 text-sm sm:text-base">
            {orderType === "dine-in" 
              ? "Your order is being prepared. Please wait at your table and our staff will serve you shortly."
              : "Your order has been confirmed and will be delivered to your address within the estimated time."
            }
          </p>
          
          <div className="space-y-3">
            <Button
              onClick={() => onNavigate("home")}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl"
            >
              <Home className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
            
            <Button
              variant="outline"
              onClick={() => onNavigate("menu")}
              className="w-full border-emerald-600 text-emerald-600 hover:bg-emerald-50 py-3 rounded-xl"
            >
              <Menu className="w-4 h-4 mr-2" />
              Order More Items
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
