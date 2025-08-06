'use client'

import { useState } from 'react'
import { useCustomerAuth, CustomerAddress } from '@/lib/customer-auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { 
  MapPin, 
  Plus, 
  Edit2, 
  Trash2, 
  Star, 
  StarIcon,
  Loader2,
  Home,
  Building,
  MapIcon
} from 'lucide-react'

interface AddressManagerProps {
  isOpen: boolean
  onClose: () => void
  onAddressSelect?: (address: CustomerAddress) => void
  selectMode?: boolean
}

export default function AddressManager({ 
  isOpen, 
  onClose, 
  onAddressSelect,
  selectMode = false 
}: AddressManagerProps) {
  const { profile, addAddress, updateAddress, deleteAddress, setDefaultAddress } = useCustomerAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingAddress, setEditingAddress] = useState<CustomerAddress | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    label: 'Home',
    streetAddress: '',
    city: '',
    state: '',
    zipCode: '',
    phoneNumber: '',
    isDefault: false,
  })

  const resetForm = () => {
    setFormData({
      label: 'Home',
      streetAddress: '',
      city: '',
      state: '',
      zipCode: '',
      phoneNumber: '',
      isDefault: false,
    })
    setError(null)
  }

  const handleClose = () => {
    resetForm()
    setShowAddForm(false)
    setEditingAddress(null)
    onClose()
  }

  const handleAddAddress = () => {
    resetForm()
    setEditingAddress(null)
    setShowAddForm(true)
  }

  const handleEditAddress = (address: CustomerAddress) => {
    setFormData({
      label: address.label,
      streetAddress: address.streetAddress,
      city: address.city,
      state: address.state,
      zipCode: address.zipCode,
      phoneNumber: address.phoneNumber || '',
      isDefault: address.isDefault,
    })
    setEditingAddress(address)
    setShowAddForm(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.streetAddress || !formData.city || !formData.state || !formData.zipCode) {
      setError('Please fill in all required fields')
      return
    }

    setLoading(true)
    setError(null)

    try {
      if (editingAddress) {
        await updateAddress(editingAddress.id, formData)
      } else {
        await addAddress(formData)
      }
      setShowAddForm(false)
      resetForm()
      setEditingAddress(null)
    } catch (error: any) {
      setError(error.message || 'Failed to save address')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAddress = async (addressId: string) => {
    if (!confirm('Are you sure you want to delete this address?')) return

    setLoading(true)
    try {
      await deleteAddress(addressId)
    } catch (error: any) {
      setError(error.message || 'Failed to delete address')
    } finally {
      setLoading(false)
    }
  }

  const handleSetDefault = async (addressId: string) => {
    setLoading(true)
    try {
      await setDefaultAddress(addressId)
    } catch (error: any) {
      setError(error.message || 'Failed to set default address')
    } finally {
      setLoading(false)
    }
  }

  const handleSelectAddress = (address: CustomerAddress) => {
    if (onAddressSelect) {
      onAddressSelect(address)
      handleClose()
    }
  }

  const getLabelIcon = (label: string) => {
    switch (label.toLowerCase()) {
      case 'home':
        return <Home className="h-4 w-4" />
      case 'work':
        return <Building className="h-4 w-4" />
      default:
        return <MapIcon className="h-4 w-4" />
    }
  }

  if (showAddForm) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingAddress ? 'Edit Address' : 'Add New Address'}
            </DialogTitle>
          </DialogHeader>
          
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="label">Address Label</Label>
              <Select
                value={formData.label}
                onValueChange={(value) => setFormData(prev => ({ ...prev, label: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Home">Home</SelectItem>
                  <SelectItem value="Work">Work</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="streetAddress">Street Address *</Label>
              <Input
                id="streetAddress"
                placeholder="123 Main Street, Apt 4B"
                value={formData.streetAddress}
                onChange={(e) => setFormData(prev => ({ ...prev, streetAddress: e.target.value }))}
                disabled={loading}
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  placeholder="City"
                  value={formData.city}
                  onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                  disabled={loading}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="state">State *</Label>
                <Input
                  id="state"
                  placeholder="State"
                  value={formData.state}
                  onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                  disabled={loading}
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="zipCode">ZIP Code *</Label>
              <Input
                id="zipCode"
                placeholder="12345"
                value={formData.zipCode}
                onChange={(e) => setFormData(prev => ({ ...prev, zipCode: e.target.value }))}
                disabled={loading}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone Number (Optional)</Label>
              <Input
                id="phoneNumber"
                type="tel"
                placeholder="(555) 123-4567"
                value={formData.phoneNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                disabled={loading}
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isDefault"
                checked={formData.isDefault}
                onChange={(e) => setFormData(prev => ({ ...prev, isDefault: e.target.checked }))}
                disabled={loading}
              />
              <Label htmlFor="isDefault">Set as default address</Label>
            </div>
            
            <div className="flex space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAddForm(false)}
                disabled={loading}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {editingAddress ? 'Update' : 'Add'} Address
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            {selectMode ? 'Select Delivery Address' : 'Manage Addresses'}
          </DialogTitle>
        </DialogHeader>
        
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          {!selectMode && (
            <Button onClick={handleAddAddress} className="w-full">
              <Plus className="mr-2 h-4 w-4" />
              Add New Address
            </Button>
          )}

          {profile?.addresses && profile.addresses.length > 0 ? (
            <div className="space-y-3">
              {profile.addresses.map((address) => (
                <Card 
                  key={address.id} 
                  className={`cursor-pointer transition-colors ${
                    selectMode ? 'hover:bg-muted' : ''
                  }`}
                  onClick={selectMode ? () => handleSelectAddress(address) : undefined}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          {getLabelIcon(address.label)}
                          <span className="font-medium">{address.label}</span>
                          {address.isDefault && (
                            <Badge variant="secondary" className="text-xs">
                              <Star className="mr-1 h-3 w-3 fill-current" />
                              Default
                            </Badge>
                          )}
                        </div>
                        
                        <div className="text-sm text-muted-foreground">
                          <p>{address.streetAddress}</p>
                          <p>{address.city}, {address.state} {address.zipCode}</p>
                          {address.phoneNumber && <p>Phone: {address.phoneNumber}</p>}
                        </div>
                      </div>
                      
                      {!selectMode && (
                        <div className="flex items-center gap-1">
                          {!address.isDefault && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleSetDefault(address.id)}
                              disabled={loading}
                              title="Set as default"
                            >
                              <StarIcon className="h-4 w-4" />
                            </Button>
                          )}
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditAddress(address)}
                            disabled={loading}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteAddress(address.id)}
                            disabled={loading}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <CardTitle className="mb-2">No Addresses Found</CardTitle>
                <CardDescription className="mb-4">
                  Add your first delivery address to get started with ordering
                </CardDescription>
                <Button onClick={handleAddAddress}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Address
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
