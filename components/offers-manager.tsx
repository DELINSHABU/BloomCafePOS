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
import { Percent, Plus, Edit, Trash2, Save, X, Loader2, Tag, Package } from 'lucide-react'
import { getMenuDataWithAvailabilitySync } from '@/lib/menu-data'
import ComboManager from '@/components/combo-manager'

interface Offer {
  id: string
  itemId: string
  itemName: string
  itemType: 'menu' | 'special'
  originalPrice: number
  offerPrice: number
  discountPercentage: number
  isActive: boolean
  startDate?: string
  endDate?: string
  createdAt: string
  updatedAt: string
}

interface TodaysSpecialItem {
  id: string
  name: string
  price: number
  description: string
  category: string
  isActive: boolean
}

interface OffersManagerProps {
  currentUser?: { username: string; role: string; name: string }
}

export default function OffersManager({ currentUser }: OffersManagerProps) {
  const [offers, setOffers] = useState<Offer[]>([])
  const [loading, setLoading] = useState(true)
  const [menuItems, setMenuItems] = useState<any[]>([])
  const [specialItems, setSpecialItems] = useState<TodaysSpecialItem[]>([])
  const [isAddingOffer, setIsAddingOffer] = useState(false)
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null)
  const [newOffer, setNewOffer] = useState({
    itemId: '',
    itemName: '',
    itemType: 'menu' as 'menu' | 'special',
    originalPrice: 0,
    offerPrice: 0,
    isActive: true,
    startDate: '',
    endDate: ''
  })

  useEffect(() => {
    loadOffers()
    loadMenuItems()
    loadSpecialItems()
  }, [])

  const loadOffers = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/offers')
      if (response.ok) {
        const data = await response.json()
        setOffers(data.offers || [])
      } else {
        console.error('Failed to load offers')
      }
    } catch (error) {
      console.error('Error loading offers:', error)
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
          category: category.category
        }))
      )
      setMenuItems(allItems)
    } catch (error) {
      console.error('Error loading menu items:', error)
    }
  }

  const loadSpecialItems = async () => {
    try {
      const response = await fetch('/api/todays-special')
      if (response.ok) {
        const data = await response.json()
        setSpecialItems(data.items || [])
      } else {
        console.error('Failed to load special items')
      }
    } catch (error) {
      console.error('Error loading special items:', error)
    }
  }

  const calculateDiscount = (original: number, offer: number) => {
    if (original <= 0 || offer <= 0) return 0
    return Math.round(((original - offer) / original) * 100)
  }

  const handleAddOffer = async () => {
    if (!newOffer.itemId || !newOffer.itemName || newOffer.originalPrice <= 0 || newOffer.offerPrice <= 0) {
      alert('Please fill in all required fields with valid values.')
      return
    }

    if (newOffer.offerPrice >= newOffer.originalPrice) {
      alert('Offer price must be less than original price.')
      return
    }

    try {
      const response = await fetch('/api/offers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newOffer),
      })

      if (response.ok) {
        const data = await response.json()
        setOffers(prev => [...prev.filter(o => o.itemId !== newOffer.itemId || o.itemType !== newOffer.itemType), data.offer])
        setNewOffer({
          itemId: '',
          itemName: '',
          itemType: 'menu',
          originalPrice: 0,
          offerPrice: 0,
          isActive: true,
          startDate: '',
          endDate: ''
        })
        setIsAddingOffer(false)
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to add offer')
      }
    } catch (error) {
      console.error('Error adding offer:', error)
      alert('Failed to add offer. Please try again.')
    }
  }

  const handleUpdateOffer = async () => {
    if (!editingOffer) return

    try {
      const response = await fetch('/api/offers', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editingOffer),
      })

      if (response.ok) {
        const data = await response.json()
        setOffers(prev => prev.map(offer => offer.id === editingOffer.id ? data.offer : offer))
        setEditingOffer(null)
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to update offer')
      }
    } catch (error) {
      console.error('Error updating offer:', error)
      alert('Failed to update offer. Please try again.')
    }
  }

  const handleDeleteOffer = async (id: string) => {
    if (!confirm('Are you sure you want to delete this offer?')) {
      return
    }

    try {
      const response = await fetch(`/api/offers?id=${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setOffers(prev => prev.filter(offer => offer.id !== id))
      } else {
        alert('Failed to delete offer. Please try again.')
      }
    } catch (error) {
      console.error('Error deleting offer:', error)
      alert('Failed to delete offer. Please try again.')
    }
  }

  const toggleOfferStatus = async (offer: Offer) => {
    try {
      const response = await fetch('/api/offers', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...offer,
          isActive: !offer.isActive
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setOffers(prev => prev.map(o => o.id === offer.id ? data.offer : o))
      } else {
        alert('Failed to update offer status.')
      }
    } catch (error) {
      console.error('Error updating offer status:', error)
      alert('Failed to update offer status.')
    }
  }

  const getItemsByType = (type: 'menu' | 'special') => {
    return type === 'menu' ? menuItems : specialItems
  }

  const handleItemSelection = (itemId: string, itemType: 'menu' | 'special') => {
    const items = getItemsByType(itemType)
    const selectedItem = items.find(item => 
      itemType === 'menu' ? item.itemNo === itemId : item.id === itemId
    )
    
    if (selectedItem) {
      const price = itemType === 'menu' 
        ? (typeof selectedItem.rate === 'string' && selectedItem.rate !== 'APS' && selectedItem.rate !== 'none' 
           ? parseFloat(selectedItem.rate) : 0)
        : selectedItem.price

      setNewOffer(prev => ({
        ...prev,
        itemId,
        itemName: selectedItem.name,
        itemType,
        originalPrice: price
      }))
    }
  }

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
          <span className="text-gray-600">Loading offers...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 bg-white dark:bg-gray-900">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
            <Percent className="w-6 h-6 text-red-500" />
            Offers Management
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Create and manage discount offers for menu items and today's specials
          </p>
        </div>
        <Button
          onClick={() => setIsAddingOffer(true)}
          className="bg-emerald-600 hover:bg-emerald-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add New Offer
        </Button>
      </div>

      {/* Add New Offer Form */}
      {isAddingOffer && (
        <Card className="mb-6 border-emerald-200">
          <CardHeader className="bg-emerald-50">
            <CardTitle className="text-emerald-700">Add New Offer</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="item-type">Item Type *</Label>
                <Select
                  value={newOffer.itemType}
                  onValueChange={(value: 'menu' | 'special') => {
                    setNewOffer(prev => ({ 
                      ...prev, 
                      itemType: value, 
                      itemId: '', 
                      itemName: '', 
                      originalPrice: 0 
                    }))
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="menu">Menu Item</SelectItem>
                    <SelectItem value="special">Today's Special</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="item-select">Select Item *</Label>
                <Select
                  value={newOffer.itemId}
                  onValueChange={(value) => handleItemSelection(value, newOffer.itemType)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose an item" />
                  </SelectTrigger>
                  <SelectContent>
                    {getItemsByType(newOffer.itemType).map((item) => (
                      <SelectItem 
                        key={newOffer.itemType === 'menu' ? item.itemNo : item.id} 
                        value={newOffer.itemType === 'menu' ? item.itemNo : item.id}
                      >
                        {item.name} - ₹{newOffer.itemType === 'menu' ? item.rate : item.price}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="original-price">Original Price (₹) *</Label>
                <Input
                  id="original-price"
                  type="number"
                  value={newOffer.originalPrice || ''}
                  onChange={(e) => setNewOffer(prev => ({ ...prev, originalPrice: Number(e.target.value) }))}
                  placeholder="Original price"
                />
              </div>
              <div>
                <Label htmlFor="offer-price">Offer Price (₹) *</Label>
                <Input
                  id="offer-price"
                  type="number"
                  value={newOffer.offerPrice || ''}
                  onChange={(e) => setNewOffer(prev => ({ ...prev, offerPrice: Number(e.target.value) }))}
                  placeholder="Discounted price"
                />
              </div>
            </div>
            
            {newOffer.originalPrice > 0 && newOffer.offerPrice > 0 && (
              <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="text-2xl font-bold text-red-500">
                    -{calculateDiscount(newOffer.originalPrice, newOffer.offerPrice)}%
                  </div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">₹{newOffer.offerPrice}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 line-through">
                    M.R.P: ₹{newOffer.originalPrice}
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-2 mt-4">
              <Button onClick={handleAddOffer} className="bg-emerald-600 hover:bg-emerald-700">
                <Save className="w-4 h-4 mr-2" />
                Add Offer
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsAddingOffer(false)
                  setNewOffer({
                    itemId: '',
                    itemName: '',
                    itemType: 'menu',
                    originalPrice: 0,
                    offerPrice: 0,
                    isActive: true,
                    startDate: '',
                    endDate: ''
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

      {/* Offers List */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-white dark:bg-gray-800">
          <TabsTrigger value="all">All Offers</TabsTrigger>
          <TabsTrigger value="menu">Menu Items</TabsTrigger>
          <TabsTrigger value="special">Today's Special</TabsTrigger>
          <TabsTrigger value="combos">Combos</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {offers.map((offer) => (
              <OfferCard 
                key={offer.id} 
                offer={offer} 
                onEdit={setEditingOffer}
                onDelete={handleDeleteOffer}
                onToggleStatus={toggleOfferStatus}
                isEditing={editingOffer?.id === offer.id}
                editingOffer={editingOffer}
                setEditingOffer={setEditingOffer}
                onUpdate={handleUpdateOffer}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="menu" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {offers.filter(offer => offer.itemType === 'menu').map((offer) => (
              <OfferCard 
                key={offer.id} 
                offer={offer} 
                onEdit={setEditingOffer}
                onDelete={handleDeleteOffer}
                onToggleStatus={toggleOfferStatus}
                isEditing={editingOffer?.id === offer.id}
                editingOffer={editingOffer}
                setEditingOffer={setEditingOffer}
                onUpdate={handleUpdateOffer}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="special" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {offers.filter(offer => offer.itemType === 'special').map((offer) => (
              <OfferCard 
                key={offer.id} 
                offer={offer} 
                onEdit={setEditingOffer}
                onDelete={handleDeleteOffer}
                onToggleStatus={toggleOfferStatus}
                isEditing={editingOffer?.id === offer.id}
                editingOffer={editingOffer}
                setEditingOffer={setEditingOffer}
                onUpdate={handleUpdateOffer}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="combos" className="mt-6">
          <ComboManager currentUser={currentUser} />
        </TabsContent>
      </Tabs>

      {offers.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Percent className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No Offers Created</h3>
            <p className="text-gray-500 mb-4">Create your first offer to get started</p>
            <Button
              onClick={() => setIsAddingOffer(true)}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add First Offer
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// Offer Card Component
function OfferCard({ 
  offer, 
  onEdit, 
  onDelete, 
  onToggleStatus, 
  isEditing, 
  editingOffer, 
  setEditingOffer, 
  onUpdate 
}: {
  offer: Offer
  onEdit: (offer: Offer) => void
  onDelete: (id: string) => void
  onToggleStatus: (offer: Offer) => void
  isEditing: boolean
  editingOffer: Offer | null
  setEditingOffer: (offer: Offer | null) => void
  onUpdate: () => void
}) {
  return (
    <Card className={`${offer.isActive ? 'border-emerald-200' : 'border-gray-200 opacity-60'}`}>
      <CardContent className="p-4">
        {isEditing ? (
          // Edit Mode
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>Original Price (₹)</Label>
                <Input
                  type="number"
                  value={editingOffer?.originalPrice || ''}
                  onChange={(e) => setEditingOffer(editingOffer ? { ...editingOffer, originalPrice: Number(e.target.value) } : null)}
                />
              </div>
              <div>
                <Label>Offer Price (₹)</Label>
                <Input
                  type="number"
                  value={editingOffer?.offerPrice || ''}
                  onChange={(e) => setEditingOffer(editingOffer ? { ...editingOffer, offerPrice: Number(e.target.value) } : null)}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={onUpdate} size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                <Save className="w-4 h-4 mr-1" />
                Save
              </Button>
              <Button variant="outline" size="sm" onClick={() => setEditingOffer(null)}>
                <X className="w-4 h-4 mr-1" />
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          // View Mode
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-semibold text-lg text-gray-800 dark:text-gray-100">{offer.itemName}</h3>
                <Badge variant="outline" className="text-xs">
                  {offer.itemType === 'menu' ? 'Menu Item' : "Today's Special"}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={offer.isActive ? "default" : "secondary"}>
                  {offer.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
            </div>
            
            {/* Offer Display - Similar to your image */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-4">
                <div className="text-2xl font-bold text-red-500">
                  -{offer.discountPercentage}%
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">₹{offer.offerPrice}</div>
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400 line-through mt-1">
                M.R.P: ₹{offer.originalPrice}
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => onEdit(offer)}>
                <Edit className="w-4 h-4 mr-1" />
                Edit
              </Button>
              <Button
                variant={offer.isActive ? "outline" : "default"}
                size="sm"
                onClick={() => onToggleStatus(offer)}
                className={offer.isActive ? "" : "bg-emerald-600 hover:bg-emerald-700"}
              >
                {offer.isActive ? "Deactivate" : "Activate"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDelete(offer.id)}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Delete
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}