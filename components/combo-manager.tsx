'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus, Edit, Trash2, Save, X, Loader2, Package, Minus } from 'lucide-react'
import { getMenuDataWithAvailabilitySync } from '@/lib/menu-data'

interface ComboItem {
  itemId: string
  itemName: string
  quantity: number
  originalPrice: number
}

interface Combo {
  id: string
  name: string
  description: string
  items: ComboItem[]
  originalTotal: number
  comboPrice: number
  discountAmount: number
  discountPercentage: number
  isActive: boolean
  category: string
  createdAt: string
  updatedAt: string
}

interface ComboManagerProps {
  currentUser?: { username: string; role: string; name: string }
}

export default function ComboManager({ currentUser }: ComboManagerProps) {
  const [combos, setCombos] = useState<Combo[]>([])
  const [loading, setLoading] = useState(true)
  const [menuItems, setMenuItems] = useState<any[]>([])
  const [isAddingCombo, setIsAddingCombo] = useState(false)
  const [editingCombo, setEditingCombo] = useState<Combo | null>(null)
  const [newCombo, setNewCombo] = useState({
    name: '',
    description: '',
    items: [] as ComboItem[],
    comboPrice: 0,
    category: 'Combo Special',
    isActive: true
  })

  useEffect(() => {
    loadCombos()
    loadMenuItems()
  }, [])

  const loadCombos = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/combos')
      if (response.ok) {
        const data = await response.json()
        setCombos(data.combos || [])
      } else {
        console.error('Failed to load combos')
      }
    } catch (error) {
      console.error('Error loading combos:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadMenuItems = () => {
    try {
      const menuData = getMenuDataWithAvailabilitySync()
      const allItems = menuData.flatMap(category => 
        category.products.map(item => ({
          ...item,
          category: category.category,
          price: typeof item.rate === 'string' && item.rate !== 'APS' && item.rate !== 'none' 
            ? parseFloat(item.rate) : 0
        }))
      ).filter(item => item.price > 0) // Only include items with valid prices
      setMenuItems(allItems)
    } catch (error) {
      console.error('Error loading menu items:', error)
    }
  }

  const addItemToCombo = (itemId: string) => {
    const selectedItem = menuItems.find(item => item.itemNo === itemId)
    if (!selectedItem) return

    const existingItem = newCombo.items.find(item => item.itemId === itemId)
    if (existingItem) {
      // Increase quantity if item already exists
      setNewCombo(prev => ({
        ...prev,
        items: prev.items.map(item => 
          item.itemId === itemId 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }))
    } else {
      // Add new item
      const newItem: ComboItem = {
        itemId: selectedItem.itemNo,
        itemName: selectedItem.name,
        quantity: 1,
        originalPrice: selectedItem.price
      }
      setNewCombo(prev => ({
        ...prev,
        items: [...prev.items, newItem]
      }))
    }
  }

  const updateItemQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      setNewCombo(prev => ({
        ...prev,
        items: prev.items.filter(item => item.itemId !== itemId)
      }))
    } else {
      setNewCombo(prev => ({
        ...prev,
        items: prev.items.map(item => 
          item.itemId === itemId 
            ? { ...item, quantity }
            : item
        )
      }))
    }
  }

  const calculateTotals = (items: ComboItem[], comboPrice: number) => {
    const originalTotal = items.reduce((sum, item) => sum + (item.originalPrice * item.quantity), 0)
    const discountAmount = originalTotal - comboPrice
    const discountPercentage = originalTotal > 0 ? Math.round((discountAmount / originalTotal) * 100) : 0
    
    return { originalTotal, discountAmount, discountPercentage }
  }

  const handleAddCombo = async () => {
    if (!newCombo.name || !newCombo.description || newCombo.items.length === 0 || newCombo.comboPrice <= 0) {
      alert('Please fill in all required fields and add at least one item.')
      return
    }

    const { originalTotal, discountAmount, discountPercentage } = calculateTotals(newCombo.items, newCombo.comboPrice)

    if (newCombo.comboPrice >= originalTotal) {
      alert('Combo price must be less than the original total.')
      return
    }

    try {
      const comboData = {
        ...newCombo,
        originalTotal,
        discountAmount,
        discountPercentage
      }

      const response = await fetch('/api/combos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(comboData),
      })

      if (response.ok) {
        const data = await response.json()
        setCombos(prev => [...prev, data.combo])
        setNewCombo({
          name: '',
          description: '',
          items: [],
          comboPrice: 0,
          category: 'Combo Special',
          isActive: true
        })
        setIsAddingCombo(false)
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to add combo')
      }
    } catch (error) {
      console.error('Error adding combo:', error)
      alert('Failed to add combo. Please try again.')
    }
  }

  const handleDeleteCombo = async (id: string) => {
    if (!confirm('Are you sure you want to delete this combo?')) {
      return
    }

    try {
      const response = await fetch(`/api/combos?id=${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setCombos(prev => prev.filter(combo => combo.id !== id))
      } else {
        alert('Failed to delete combo. Please try again.')
      }
    } catch (error) {
      console.error('Error deleting combo:', error)
      alert('Failed to delete combo. Please try again.')
    }
  }

  const toggleComboStatus = async (combo: Combo) => {
    try {
      const response = await fetch('/api/combos', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...combo,
          isActive: !combo.isActive
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setCombos(prev => prev.map(c => c.id === combo.id ? data.combo : c))
      } else {
        alert('Failed to update combo status.')
      }
    } catch (error) {
      console.error('Error updating combo status:', error)
      alert('Failed to update combo status.')
    }
  }

  const currentTotals = calculateTotals(newCombo.items, newCombo.comboPrice)

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
          <span className="text-gray-600">Loading combos...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
            <Package className="w-6 h-6 text-orange-500" />
            Combo Management
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Create and manage combo offers with multiple items at discounted prices
          </p>
        </div>
        <Button
          onClick={() => setIsAddingCombo(true)}
          className="bg-orange-600 hover:bg-orange-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add New Combo
        </Button>
      </div>

      {/* Add New Combo Form */}
      {isAddingCombo && (
        <Card className="mb-6 border-orange-200">
          <CardHeader className="bg-orange-50">
            <CardTitle className="text-orange-700">Add New Combo</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <Label htmlFor="combo-name">Combo Name *</Label>
                <Input
                  id="combo-name"
                  value={newCombo.name}
                  onChange={(e) => setNewCombo(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Al Faham Special Combo"
                />
              </div>
              <div>
                <Label htmlFor="combo-category">Category</Label>
                <Input
                  id="combo-category"
                  value={newCombo.category}
                  onChange={(e) => setNewCombo(prev => ({ ...prev, category: e.target.value }))}
                  placeholder="Combo Special"
                />
              </div>
            </div>
            
            <div className="mb-4">
              <Label htmlFor="combo-description">Description *</Label>
              <Input
                id="combo-description"
                value={newCombo.description}
                onChange={(e) => setNewCombo(prev => ({ ...prev, description: e.target.value }))}
                placeholder="e.g., 3 Appam + 1 Egg Curry - Perfect combination"
              />
            </div>

            {/* Add Items Section */}
            <div className="mb-4">
              <Label>Add Items to Combo</Label>
              <Select onValueChange={addItemToCombo}>
                <SelectTrigger>
                  <SelectValue placeholder="Select an item to add" />
                </SelectTrigger>
                <SelectContent>
                  {menuItems.map((item) => (
                    <SelectItem key={item.itemNo} value={item.itemNo}>
                      {item.name} - ₹{item.price} ({item.category})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Selected Items */}
            {newCombo.items.length > 0 && (
              <div className="mb-4">
                <Label>Selected Items</Label>
                <div className="space-y-2 mt-2">
                  {newCombo.items.map((item) => (
                    <div key={item.itemId} className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                      <div className="flex-1">
                        <span className="font-medium text-gray-900 dark:text-gray-100">{item.itemName}</span>
                        <span className="text-gray-500 dark:text-gray-400 ml-2">₹{item.originalPrice} each</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateItemQuantity(item.itemId, item.quantity - 1)}
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateItemQuantity(item.itemId, item.quantity + 1)}
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => updateItemQuantity(item.itemId, 0)}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Pricing Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <Label>Original Total</Label>
                <div className="text-2xl font-bold text-gray-600 dark:text-gray-300">₹{currentTotals.originalTotal}</div>
              </div>
              <div>
                <Label htmlFor="combo-price">Combo Price (₹) *</Label>
                <Input
                  id="combo-price"
                  type="number"
                  value={newCombo.comboPrice || ''}
                  onChange={(e) => setNewCombo(prev => ({ ...prev, comboPrice: Number(e.target.value) }))}
                  placeholder="Discounted combo price"
                />
              </div>
            </div>
            
            {newCombo.comboPrice > 0 && currentTotals.originalTotal > 0 && (
              <div className="mb-4 p-4 bg-orange-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="text-2xl font-bold text-orange-600">
                    -{currentTotals.discountPercentage}%
                  </div>
                  <div className="text-2xl font-bold text-green-600">₹{newCombo.comboPrice}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 line-through">
                    Original: ₹{currentTotals.originalTotal}
                  </div>
                  <div className="text-sm text-green-600 font-medium">
                    Save ₹{currentTotals.discountAmount}
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <Button onClick={handleAddCombo} className="bg-orange-600 hover:bg-orange-700">
                <Save className="w-4 h-4 mr-2" />
                Add Combo
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsAddingCombo(false)
                  setNewCombo({
                    name: '',
                    description: '',
                    items: [],
                    comboPrice: 0,
                    category: 'Combo Special',
                    isActive: true
                  })
                }}
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Combos List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {combos.map((combo) => (
          <ComboCard 
            key={combo.id} 
            combo={combo} 
            onDelete={handleDeleteCombo}
            onToggleStatus={toggleComboStatus}
          />
        ))}
      </div>

      {combos.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No Combos Created</h3>
            <p className="text-gray-500 mb-4">Create your first combo to get started</p>
            <Button
              onClick={() => setIsAddingCombo(true)}
              className="bg-orange-600 hover:bg-orange-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add First Combo
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// Combo Card Component
function ComboCard({ 
  combo, 
  onDelete, 
  onToggleStatus
}: {
  combo: Combo
  onDelete: (id: string) => void
  onToggleStatus: (combo: Combo) => void
}) {
  return (
    <Card className={`${combo.isActive ? 'border-orange-200' : 'border-gray-200 opacity-60'}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-semibold text-lg text-gray-800 dark:text-gray-100">{combo.name}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">{combo.description}</p>
            <Badge variant="outline" className="text-xs mt-1">
              {combo.category}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={combo.isActive ? "default" : "secondary"}>
              {combo.isActive ? "Active" : "Inactive"}
            </Badge>
          </div>
        </div>
        
        {/* Items List */}
        <div className="mb-4">
          <Label className="text-sm font-medium">Items included:</Label>
          <div className="mt-2 space-y-1">
            {combo.items.map((item, index) => (
              <div key={index} className="text-sm text-gray-600 dark:text-gray-300 flex justify-between">
                <span>{item.quantity}x {item.itemName}</span>
                <span>₹{item.originalPrice * item.quantity}</span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Pricing Display */}
        <div className="bg-orange-50 dark:bg-gray-800 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-4">
            <div className="text-2xl font-bold text-orange-600">
              -{combo.discountPercentage}%
            </div>
            <div className="text-2xl font-bold text-green-600">₹{combo.comboPrice}</div>
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400 line-through mt-1">
            Original Total: ₹{combo.originalTotal}
          </div>
          <div className="text-sm text-green-600 font-medium">
            You Save: ₹{combo.discountAmount}
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant={combo.isActive ? "outline" : "default"}
            size="sm"
            onClick={() => onToggleStatus(combo)}
            className={combo.isActive ? "" : "bg-orange-600 hover:bg-orange-700"}
          >
            {combo.isActive ? "Deactivate" : "Activate"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete(combo.id)}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4 mr-1" />
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}