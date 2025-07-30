"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Home, Menu, Minus, Plus, ArrowLeft } from "lucide-react"
import type { CartItem, Page } from "@/app/page"

interface OrderListPageProps {
  items: CartItem[]
  onNavigate: (page: Page) => void
  onUpdateQuantity: (id: string, quantity: number) => void
  onOrderNow: (customerName?: string) => void
  orderType: "dine-in" | "delivery"
  tableNumber: string
  onOrderTypeChange: (type: "dine-in" | "delivery") => void
}

export default function OrderListPage({ items, onNavigate, onUpdateQuantity, onOrderNow, orderType, tableNumber, onOrderTypeChange }: OrderListPageProps) {
  const [customerName, setCustomerName] = useState("")
  const [customerPhone, setCustomerPhone] = useState("")
  const [deliveryAddress, setDeliveryAddress] = useState("")
  const [specialInstructions, setSpecialInstructions] = useState("")

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  const handleOrderNow = () => {
    if (orderType === "delivery" && !customerName.trim()) {
      alert("Please enter your name for delivery orders")
      return
    }
    onOrderNow(customerName.trim() || undefined)
  }

  return (
    <div className="w-full bg-white min-h-screen">
      {/* Header */}
      <div className="bg-emerald-700 text-white p-4 sm:p-6">
        <div className="flex items-center gap-4 mb-4">
          <Button
            variant="ghost"
            size="sm"
            className="text-white hover:bg-emerald-800 p-2"
            onClick={() => onNavigate("home")}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold">Your Order</h1>
        </div>
        
        {/* Order Type Info */}
        <div className="bg-white/10 rounded-lg p-3">
          <p className="text-white text-sm">
            {orderType === "dine-in" ? "🍽️ Dine-in" : "🚚 Delivery"}
            {tableNumber && ` • Table ${tableNumber}`}
          </p>
        </div>
      </div>

      {/* Order Items */}
      <div className="p-4 sm:p-6">
        <div className="space-y-4 mb-6">
          {items.map((item) => (
            <div key={item.id} className="flex items-center justify-between bg-gray-50 rounded-lg p-4">
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">{item.name}</h3>
                <p className="text-sm text-gray-500">{item.description}</p>
                <p className="font-bold text-gray-900">₹{item.price}</p>
              </div>
              <div className="flex items-center bg-emerald-600 rounded-full ml-4">
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-white hover:bg-emerald-700 w-8 h-8 p-0 rounded-full"
                  onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <span className="text-white px-3 font-medium">{item.quantity}</span>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-white hover:bg-emerald-700 w-8 h-8 p-0 rounded-full"
                  onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Customer Information Form */}
        <div className="space-y-4 mb-6">
          <h3 className="font-semibold text-gray-900">
            {orderType === "delivery" ? "Delivery Information" : "Order Information"}
          </h3>
          
          <div className="space-y-3">
            <div>
              <Label htmlFor="customerName">
                {orderType === "delivery" ? "Full Name *" : "Name (Optional)"}
              </Label>
              <Input
                id="customerName"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Enter your name"
                required={orderType === "delivery"}
              />
            </div>

            {orderType === "delivery" && (
              <>
                <div>
                  <Label htmlFor="customerPhone">Phone Number</Label>
                  <Input
                    id="customerPhone"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="Enter your phone number"
                    type="tel"
                  />
                </div>

                <div>
                  <Label htmlFor="deliveryAddress">Delivery Address</Label>
                  <Textarea
                    id="deliveryAddress"
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    placeholder="Enter your full delivery address"
                    rows={3}
                  />
                </div>
              </>
            )}

            <div>
              <Label htmlFor="specialInstructions">Special Instructions (Optional)</Label>
              <Textarea
                id="specialInstructions"
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                placeholder="Any special requests or dietary requirements"
                rows={2}
              />
            </div>
          </div>
        </div>

        {/* Order Total */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="flex justify-between items-center">
            <span className="font-semibold text-gray-900">Total:</span>
            <span className="font-bold text-xl text-emerald-600">₹{total.toFixed(2)}</span>
          </div>
        </div>

        <Button
          onClick={handleOrderNow}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-medium"
          disabled={items.length === 0}
        >
          {orderType === "delivery" ? "Place Delivery Order" : "Place Order"} - ₹{total.toFixed(2)}
        </Button>
      </div>


    </div>
  )
}
