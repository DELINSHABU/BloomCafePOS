"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Edit, Plus, Save, X, Search, AlertCircle, LogOut, User, Star } from "lucide-react"
import { getMenuData, getMenuCategories, getCategoryIcon, updateItemAvailability, updateItemPrice } from "@/lib/menu-data"
import TodaysSpecialManager from "@/components/todays-special-manager"
import type { Page } from "@/app/page"
import type { MenuItem, MenuCategory } from "@/lib/menu-data"

interface AdminMenuPanelProps {
  onNavigate?: (page: any) => void
  currentUser?: { username: string; role: string; name: string };
  onLogout?: () => void;
}

interface MenuItemWithAvailability extends MenuItem {
  available: boolean
  originalRate: string
}

interface CategoryWithAvailability extends Omit<MenuCategory, 'products'> {
  products: MenuItemWithAvailability[]
}

export default function AdminMenuPanel({ onNavigate, currentUser, onLogout }: AdminMenuPanelProps) {
  const [menuData, setMenuData] = useState<CategoryWithAvailability[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>("All")
  const [searchTerm, setSearchTerm] = useState("")
  const [editingItem, setEditingItem] = useState<MenuItemWithAvailability | null>(null)
  const [isAddingItem, setIsAddingItem] = useState(false)
  const [newItem, setNewItem] = useState<Partial<MenuItemWithAvailability>>({
    name: "",
    rate: "",
    available: true
  })
  const [selectedCategoryForNew, setSelectedCategoryForNew] = useState("")

  const categories = getMenuCategories()

  // Initialize menu data with availability status
  useEffect(() => {
    loadMenuData()
  }, [])

  const loadMenuData = async () => {
    try {
      // Get base menu data
      const originalData = getMenuData()
      
      // Get availability data
      const availabilityResponse = await fetch('/api/menu-availability')
      let availabilityData = { items: {} }
      
      if (availabilityResponse.ok) {
        availabilityData = await availabilityResponse.json()
      }
      
      // Merge data with availability
      const dataWithAvailability: CategoryWithAvailability[] = originalData.map(category => ({
        ...category,
        products: category.products.map(item => {
          const availability = availabilityData.items[item.itemNo] || {}
          return {
            ...item,
            available: availability.available !== undefined ? availability.available : true,
            rate: availability.price || item.rate,
            originalRate: item.rate
          }
        })
      }))
      
      setMenuData(dataWithAvailability)
    } catch (error) {
      console.error('Error loading menu data:', error)
      // Fallback to static data
      const originalData = getMenuData()
      const dataWithAvailability: CategoryWithAvailability[] = originalData.map(category => ({
        ...category,
        products: category.products.map(item => ({
          ...item,
          available: true,
          originalRate: item.rate
        }))
      }))
      setMenuData(dataWithAvailability)
    }
  }

  const getFilteredItems = () => {
    let items: MenuItemWithAvailability[] = []
    
    if (selectedCategory === "All") {
      items = menuData.flatMap(category => category.products)
    } else {
      const category = menuData.find(cat => cat.category === selectedCategory)
      items = category ? category.products : []
    }

    if (searchTerm) {
      items = items.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.itemNo.includes(searchTerm)
      )
    }

    return items
  }

  const toggleItemAvailability = async (itemNo: string, categoryName: string) => {
    try {
      // Find current availability
      const currentItem = menuData
        .find(cat => cat.category === categoryName)
        ?.products.find(item => item.itemNo === itemNo)
      
      if (!currentItem) return
      
      const newAvailability = !currentItem.available
      
      // Update in availability API
      await updateItemAvailability(itemNo, newAvailability)
      
      // Update local state
      setMenuData(prev => prev.map(category => 
        category.category === categoryName 
          ? {
              ...category,
              products: category.products.map(item =>
                item.itemNo === itemNo 
                  ? { ...item, available: newAvailability }
                  : item
              )
            }
          : category
      ))
    } catch (error) {
      console.error('Error updating availability:', error)
      alert('Failed to update availability. Please try again.')
    }
  }

  const handleUpdateItemPrice = async (itemNo: string, categoryName: string, newRate: string) => {
    try {
      // Update in availability API
      await updateItemPrice(itemNo, newRate)
      
      // Update local state
      setMenuData(prev => prev.map(category => 
        category.category === categoryName 
          ? {
              ...category,
              products: category.products.map(item =>
                item.itemNo === itemNo 
                  ? { ...item, rate: newRate }
                  : item
              )
            }
          : category
      ))
    } catch (error) {
      console.error('Error updating price:', error)
      alert('Failed to update price. Please try again.')
    }
  }

  const addNewItem = () => {
    if (!newItem.name || !newItem.rate || !selectedCategoryForNew) {
      alert("Please fill in all required fields")
      return
    }

    const newItemNo = Math.random().toString(36).substr(2, 3).toUpperCase()
    const itemToAdd: MenuItemWithAvailability = {
      itemNo: newItemNo,
      name: newItem.name!,
      rate: newItem.rate!,
      available: newItem.available || true,
      originalRate: newItem.rate!
    }

    setMenuData(prev => prev.map(category => 
      category.category === selectedCategoryForNew
        ? {
            ...category,
            products: [...category.products, itemToAdd]
          }
        : category
    ))

    // Reset form
    setNewItem({ name: "", rate: "", available: true })
    setSelectedCategoryForNew("")
    setIsAddingItem(false)
  }

  const saveItemEdit = () => {
    if (!editingItem) return

    const categoryName = menuData.find(cat => 
      cat.products.some(item => item.itemNo === editingItem.itemNo)
    )?.category

    if (categoryName) {
      handleUpdateItemPrice(editingItem.itemNo, categoryName, editingItem.rate)
    }
    setEditingItem(null)
  }

  const getAvailabilityStats = () => {
    const allItems = menuData.flatMap(category => category.products)
    const available = allItems.filter(item => item.available).length
    const unavailable = allItems.filter(item => !item.available).length
    return { available, unavailable, total: allItems.length }
  }

  const stats = getAvailabilityStats()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-emerald-700 text-white p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-emerald-800 p-2"
              onClick={() => onNavigate && onNavigate("dashboard")}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold">Menu Management</h1>
              <p className="text-emerald-100 text-sm">Manage menu items and availability</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-emerald-100">
              <User className="w-4 h-4" />
              <span className="text-sm">Welcome, {currentUser?.name || 'Admin User'}</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-emerald-800"
              onClick={onLogout || (() => window.location.reload())}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-6">
        {/* Navigation Tabs */}
        <Tabs defaultValue="menu" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="menu">Menu Management</TabsTrigger>
            <TabsTrigger value="specials">Today's Special</TabsTrigger>
          </TabsList>

          <TabsContent value="menu">
            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <Card>
                <CardContent className="p-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{stats.available}</div>
                    <div className="text-sm text-gray-600">Available</div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">{stats.unavailable}</div>
                    <div className="text-sm text-gray-600">Unavailable</div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
                    <div className="text-sm text-gray-600">Total Items</div>
                  </div>
                </CardContent>
              </Card>
            </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search items by name or item number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {getCategoryIcon(category)} {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Dialog open={isAddingItem} onOpenChange={setIsAddingItem}>
            <DialogTrigger asChild>
              <Button className="bg-emerald-600 hover:bg-emerald-700">
                <Plus className="w-4 h-4 mr-2" />
                Add Item
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Menu Item</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select value={selectedCategoryForNew} onValueChange={setSelectedCategoryForNew}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {getCategoryIcon(category)} {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="itemName">Item Name *</Label>
                  <Input
                    id="itemName"
                    value={newItem.name || ""}
                    onChange={(e) => setNewItem(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter item name"
                  />
                </div>
                <div>
                  <Label htmlFor="itemRate">Price *</Label>
                  <Input
                    id="itemRate"
                    value={newItem.rate || ""}
                    onChange={(e) => setNewItem(prev => ({ ...prev, rate: e.target.value }))}
                    placeholder="Enter price (e.g., 120 or APS)"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="available"
                    checked={newItem.available || true}
                    onCheckedChange={(checked) => setNewItem(prev => ({ ...prev, available: checked }))}
                  />
                  <Label htmlFor="available">Available</Label>
                </div>
                <div className="flex gap-2">
                  <Button onClick={addNewItem} className="flex-1">
                    <Save className="w-4 h-4 mr-2" />
                    Add Item
                  </Button>
                  <Button variant="outline" onClick={() => setIsAddingItem(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Menu Items Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {getFilteredItems().map((item) => {
            const categoryName = menuData.find(cat => 
              cat.products.some(p => p.itemNo === item.itemNo)
            )?.category || ""

            return (
              <Card key={item.itemNo} className={`relative ${!item.available ? 'opacity-60' : ''}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-base">{item.name}</CardTitle>
                      <p className="text-sm text-gray-500">#{item.itemNo} • {categoryName}</p>
                    </div>
                    <Badge variant={item.available ? "default" : "destructive"}>
                      {item.available ? "Available" : "Unavailable"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Price:</span>
                      {editingItem?.itemNo === item.itemNo ? (
                        <div className="flex items-center gap-2">
                          <Input
                            value={editingItem.rate}
                            onChange={(e) => setEditingItem(prev => prev ? { ...prev, rate: e.target.value } : null)}
                            className="w-20 h-8 text-sm"
                          />
                          <Button size="sm" onClick={saveItemEdit} className="h-8 px-2">
                            <Save className="w-3 h-3" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setEditingItem(null)} className="h-8 px-2">
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-emerald-600">
                            {item.rate === 'APS' ? 'APS' : item.rate === 'none' ? 'N/A' : `₹${item.rate}`}
                          </span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setEditingItem(item)}
                            className="h-8 px-2"
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Availability:</span>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={item.available}
                          onCheckedChange={() => toggleItemAvailability(item.itemNo, categoryName)}
                        />
                        <span className="text-sm">
                          {item.available ? "Available" : "Unavailable"}
                        </span>
                      </div>
                    </div>

                    {!item.available && (
                      <div className="flex items-center gap-2 text-amber-600 bg-amber-50 p-2 rounded">
                        <AlertCircle className="w-4 h-4" />
                        <span className="text-xs">This item is currently unavailable to customers</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

            {getFilteredItems().length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <Search className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No items found matching your search criteria</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="specials">
            <TodaysSpecialManager currentUser={currentUser} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}