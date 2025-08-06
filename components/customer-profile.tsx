'use client'

import { useState, useEffect } from 'react'
import { useCustomerAuth, CustomerOrder } from '@/lib/customer-auth-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import AddressManager from './address-manager'
import { 
  User, 
  MapPin, 
  ShoppingBag, 
  LogOut,
  Settings,
  Clock,
  CheckCircle,
  Truck,
  CookingPot
} from 'lucide-react'

interface CustomerProfileProps {
  isOpen: boolean
  onClose: () => void
}

export default function CustomerProfile({ isOpen, onClose }: CustomerProfileProps) {
  const { user, profile, logout, getOrderHistory } = useCustomerAuth()
  const [showAddressManager, setShowAddressManager] = useState(false)
  const [orderHistory, setOrderHistory] = useState<CustomerOrder[]>([])
  const [loadingOrders, setLoadingOrders] = useState(false)
  const [activeTab, setActiveTab] = useState('profile')

  useEffect(() => {
    if (isOpen && activeTab === 'orders') {
      loadOrderHistory()
    }
  }, [isOpen, activeTab])

  // Load order history when profile loads to show correct count
  useEffect(() => {
    if (isOpen && user && profile) {
      loadOrderHistory()
    }
  }, [isOpen, user, profile])

  const loadOrderHistory = async () => {
    setLoadingOrders(true)
    try {
      const orders = await getOrderHistory()
      setOrderHistory(orders.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()))
    } catch (error) {
      console.error('Failed to load order history:', error)
    } finally {
      setLoadingOrders(false)
    }
  }

  const handleLogout = async () => {
    try {
      await logout()
      onClose()
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  const getStatusIcon = (status: CustomerOrder['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-orange-500" />
      case 'preparing':
        return <CookingPot className="h-4 w-4 text-blue-500" />
      case 'ready':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'delivered':
        return <Truck className="h-4 w-4 text-green-600" />
      case 'cancelled':
        return <Clock className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: CustomerOrder['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'preparing':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'ready':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'delivered':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date)
  }

  if (!user || !profile) {
    return null
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              My Account
            </DialogTitle>
          </DialogHeader>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="addresses">Addresses</TabsTrigger>
              <TabsTrigger value="orders">Orders</TabsTrigger>
            </TabsList>
            
            <TabsContent value="profile" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={user.photoURL || undefined} />
                      <AvatarFallback className="text-lg">
                        {profile.displayName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle>{profile.displayName}</CardTitle>
                      <CardDescription>{profile.email}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="font-medium text-muted-foreground">Member Since</p>
                      <p>{formatDate(profile.createdAt)}</p>
                    </div>
                    <div>
                      <p className="font-medium text-muted-foreground">Total Orders</p>
                      <p>{orderHistory.length} orders</p>
                    </div>
                  </div>
                  
                  {orderHistory.length > 0 && (
                    <div className="pt-3 border-t">
                      <p className="text-sm font-medium text-muted-foreground mb-2">Recent Activity</p>
                      <div className="text-sm text-gray-600">
                        <p>Last Order: {orderHistory.length > 0 ? formatDate(orderHistory[0].timestamp) : 'Never'}</p>
                        <p>Total Spent: ₹{orderHistory.reduce((sum, order) => sum + order.total, 0).toFixed(2)}</p>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => setShowAddressManager(true)}
                      className="flex-1"
                    >
                      <MapPin className="mr-2 h-4 w-4" />
                      Manage Addresses
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleLogout}
                      className="flex-1"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="addresses" className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Delivery Addresses</h3>
                  <p className="text-sm text-muted-foreground">
                    {profile.addresses.length} saved address{profile.addresses.length !== 1 ? 'es' : ''}
                  </p>
                </div>
                <Button onClick={() => setShowAddressManager(true)}>
                  <Settings className="mr-2 h-4 w-4" />
                  Manage
                </Button>
              </div>
              
              {profile.addresses.length > 0 ? (
                <div className="grid gap-3">
                  {profile.addresses.map((address) => (
                    <Card key={address.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{address.label}</span>
                              {address.isDefault && (
                                <Badge variant="secondary" className="text-xs">
                                  Default
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {address.streetAddress}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {address.city}, {address.state} {address.zipCode}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-6 text-center">
                    <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <CardTitle className="mb-2">No Addresses</CardTitle>
                    <CardDescription className="mb-4">
                      Add your delivery addresses to get started
                    </CardDescription>
                    <Button onClick={() => setShowAddressManager(true)}>
                      Add Address
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="orders" className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Order History</h3>
                  <p className="text-sm text-muted-foreground">
                    Your recent orders
                  </p>
                </div>
                <Button variant="outline" onClick={loadOrderHistory}>
                  Refresh
                </Button>
              </div>
              
              {loadingOrders ? (
                <Card>
                  <CardContent className="p-6 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto" />
                    <p className="mt-2 text-sm text-muted-foreground">Loading your order history...</p>
                  </CardContent>
                </Card>
              ) : orderHistory.length > 0 ? (
                <div className="space-y-3">
                  {orderHistory.map((order) => (
                    <Card key={order.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">Order #{order.id.slice(-6)}</span>
                              <Badge 
                                variant="outline" 
                                className={getStatusColor(order.status)}
                              >
                                {getStatusIcon(order.status)}
                                <span className="ml-1 capitalize">{order.status}</span>
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {formatDate(order.timestamp)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">${order.total.toFixed(2)}</p>
                            <p className="text-xs text-muted-foreground capitalize">
                              {order.orderType}
                            </p>
                          </div>
                        </div>
                        
                        <div className="space-y-1">
                          {order.items.map((item, index) => (
                            <div key={index} className="flex justify-between text-sm">
                              <span>{item.quantity}x {item.name}</span>
                              <span>${(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                        
                        {order.deliveryAddress && (
                          <div className="mt-3 pt-3 border-t">
                            <p className="text-xs text-muted-foreground">
                              Delivery to: {order.deliveryAddress.streetAddress}, {order.deliveryAddress.city}
                            </p>
                          </div>
                        )}
                        
                        {order.tableNumber && (
                          <div className="mt-3 pt-3 border-t">
                            <p className="text-xs text-muted-foreground">
                              Dine-in: Table {order.tableNumber}
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-6 text-center">
                    <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <CardTitle className="mb-2">No Orders Yet</CardTitle>
                    <CardDescription>
                      Your order history will appear here once you place your first order
                    </CardDescription>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
      
      <AddressManager
        isOpen={showAddressManager}
        onClose={() => setShowAddressManager(false)}
      />
    </>
  )
}
