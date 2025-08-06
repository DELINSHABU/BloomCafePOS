"use client"

import { useState, useEffect } from "react"
import { useCustomerAuth, CustomerAddress } from "@/lib/customer-auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Home, Menu, Minus, Plus, ArrowLeft, MapPin, User, UserPlus } from "lucide-react"
import CustomerAuthModal from "@/components/customer-auth-modal"
import AddressManager from "@/components/address-manager"
import type { CartItem, Page } from "@/app/page"

interface OrderListPageProps {
  items: CartItem[]
  onNavigate: (page: Page) => void
  onUpdateQuantity: (id: string, quantity: number) => void
  onOrderNow: (customerName?: string, deliveryAddress?: CustomerAddress, customerPhone?: string) => void
  orderType: "dine-in" | "delivery"
  tableNumber: string
  onOrderTypeChange: (type: "dine-in" | "delivery") => void
}

export default function OrderListPage({ items, onNavigate, onUpdateQuantity, onOrderNow, orderType, tableNumber, onOrderTypeChange }: OrderListPageProps) {
  const { user, profile } = useCustomerAuth()
  const [customerName, setCustomerName] = useState("")
  const [customerPhone, setCustomerPhone] = useState("")
  const [selectedAddress, setSelectedAddress] = useState<CustomerAddress | null>(null)
  const [specialInstructions, setSpecialInstructions] = useState("")
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showAddressSelector, setShowAddressSelector] = useState(false)

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  
  // Auto-populate user data when user logs in
  useEffect(() => {
    if (user && profile) {
      setCustomerName(profile.displayName)
      // Auto-select default address if available
      const defaultAddress = profile.addresses.find(addr => addr.isDefault)
      if (defaultAddress) {
        setSelectedAddress(defaultAddress)
      }
      // Auto-populate phone from profile if available
      if (profile.phoneNumber && !customerPhone) {
        setCustomerPhone(profile.phoneNumber)
      }
    }
  }, [user, profile, customerPhone])
  
  const handleAddressSelect = (address: CustomerAddress) => {
    setSelectedAddress(address)
    setShowAddressSelector(false)
  }

  const handleOrderNow = () => {
    if (orderType === "delivery" && !customerName.trim()) {
      alert("Please enter your name for delivery orders")
      return
    }
    
    // For delivery orders, pass the address and phone information
    if (orderType === "delivery") {
      const phoneToPass = profile?.phoneNumber || customerPhone
      onOrderNow(customerName.trim() || undefined, selectedAddress || undefined, phoneToPass || undefined)
    } else {
      onOrderNow(customerName.trim() || undefined)
    }
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
                {/* Customer Authentication Section */}
                {!user ? (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <UserPlus className="h-5 w-5" />
                        Create Account for Better Experience
                      </CardTitle>
                      <CardDescription>
                        Sign up to save addresses and track your orders easily
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button
                        variant="outline"
                        onClick={() => setShowAuthModal(true)}
                        className="w-full"
                      >
                        <User className="mr-2 h-4 w-4" />
                        Login or Sign Up
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  /* Address Selection for Logged-in Users */
                  <div>
                    <Label>Delivery Address</Label>
                    {selectedAddress ? (
                      <Card className="cursor-pointer" onClick={() => setShowAddressSelector(true)}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4" />
                                <span className="font-medium">{selectedAddress.label}</span>
                                {selectedAddress.isDefault && (
                                  <Badge variant="secondary" className="text-xs">Default</Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {selectedAddress.streetAddress}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {selectedAddress.city}, {selectedAddress.state} {selectedAddress.zipCode}
                              </p>
                            </div>
                            <Button variant="ghost" size="sm">
                              Change
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ) : (
                      <Card>
                        <CardContent className="p-6 text-center">
                          <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                          <CardTitle className="mb-2">Select Delivery Address</CardTitle>
                          <CardDescription className="mb-4">
                            Choose from your saved addresses or add a new one
                          </CardDescription>
                          <Button onClick={() => setShowAddressSelector(true)}>
                            <MapPin className="mr-2 h-4 w-4" />
                            Select Address
                          </Button>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                )}
                
                {/* Fallback Phone Input for guests or if user doesn't have phone */}
                {(!user || !profile?.phoneNumber) && (
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
                )}
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
      
      {/* Customer Authentication Modal */}
      <CustomerAuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={() => {
          setShowAuthModal(false)
          // User data will be auto-populated by useEffect
        }}
      />
      
      {/* Address Selector Modal */}
      <AddressManager
        isOpen={showAddressSelector}
        onClose={() => setShowAddressSelector(false)}
        onAddressSelect={handleAddressSelect}
        selectMode={true}
      />
    </div>
  )
}
