"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import {
  Package,
  Plus,
  Edit,
  Trash2,
  Search,
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  Filter,
  RotateCcw,
  Package2,
  DollarSign,
  Calendar,
  Truck,
  BarChart3,
} from "lucide-react";
import { InventoryPieChart } from "@/components/charts/inventory-pie-chart";
import { InventoryBarChart } from "@/components/charts/inventory-bar-chart";
import InventoryAnalyticsDashboard from "@/components/inventory-analytics-dashboard";

interface InventoryItem {
  id: string;
  name: string;
  category: string;
  currentStock: number;
  unit: string;
  minimumStock: number;
  maximumStock: number;
  unitPrice: number;
  supplier: string;
  lastRestocked: string;
  expiryDate: string;
  status: 'in_stock' | 'low_stock' | 'out_of_stock';
  description: string;
  isPaid: boolean;
  discountPercentage: number;
  finalPrice: number;
  paymentMethods: string[];
  qrCodeImage?: string;
  upiLink?: string;
  supplierPhone?: string;
}

interface InventoryData {
  inventory: InventoryItem[];
  categories: string[];
  suppliers: string[];
  units: string[];
  lastUpdated: string;
  updatedBy: string;
}

interface InventoryManagerProps {
  currentUser?: { username: string; role: string; name: string };
}

export default function InventoryManager({ currentUser }: InventoryManagerProps) {
  const [inventoryData, setInventoryData] = useState<InventoryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [addItemError, setAddItemError] = useState('');
  const [editItemError, setEditItemError] = useState('');
  const [isClient, setIsClient] = useState(false);

  const [newItem, setNewItem] = useState({
    name: '',
    category: '',
    currentStock: '',
    unit: '',
    minimumStock: '',
    maximumStock: '',
    unitPrice: '',
    supplier: '',
    lastRestocked: '',
    expiryDate: '',
    description: '',
    isPaid: false,
    discountPercentage: '',
    finalPrice: '',
    paymentMethods: [] as string[],
    qrCodeImage: '',
    upiLink: '',
    supplierPhone: ''
  });

  // Fetch inventory data
  const fetchInventoryData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/inventory');
      if (response.ok) {
        const data = await response.json();
        setInventoryData(data);
      } else {
        showAlert('error', 'Failed to fetch inventory data');
      }
    } catch (error) {
      console.error('Error fetching inventory:', error);
      showAlert('error', 'Failed to fetch inventory data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setIsClient(true);
    fetchInventoryData();
  }, []);

  // Helper function to get today's date
  const getTodayDate = () => {
    return isClient ? new Date().toISOString().split('T')[0] : '';
  };

  const showAlert = (type: 'success' | 'error', message: string) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 5000);
  };

  // Get status badge color and icon
  const getStatusBadge = (status: string, currentStock: number, minimumStock: number) => {
    switch (status) {
      case 'out_of_stock':
        return (
          <Badge className="bg-red-100 text-red-700 border-red-200">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Out of Stock
          </Badge>
        );
      case 'low_stock':
        return (
          <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">
            <TrendingDown className="w-3 h-3 mr-1" />
            Low Stock
          </Badge>
        );
      default:
        return (
          <Badge className="bg-green-100 text-green-700 border-green-200">
            <TrendingUp className="w-3 h-3 mr-1" />
            In Stock
          </Badge>
        );
    }
  };

  // Filter inventory items
  const filteredItems = inventoryData?.inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.supplier.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    
    return matchesSearch && matchesCategory && matchesStatus;
  }) || [];

  // Calculate statistics
  const stats = {
    totalItems: inventoryData?.inventory.length || 0,
    lowStockItems: inventoryData?.inventory.filter(item => item.status === 'low_stock').length || 0,
    outOfStockItems: inventoryData?.inventory.filter(item => item.status === 'out_of_stock').length || 0,
    totalValue: inventoryData?.inventory.reduce((total, item) => total + (item.currentStock * item.unitPrice), 0) || 0
  };

  // Add new inventory item
  const handleAddItem = async () => {
    try {
      setAddItemError('');
      
      // Validate required fields
      if (!newItem.name || !newItem.category || !newItem.currentStock || !newItem.unit || 
          !newItem.minimumStock || !newItem.maximumStock || !newItem.unitPrice || !newItem.supplier) {
        setAddItemError('Please fill in all required fields');
        return;
      }

      const response = await fetch('/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newItem,
          updatedBy: currentUser?.username || 'admin'
        })
      });

      const result = await response.json();

      if (response.ok) {
        showAlert('success', 'Inventory item added successfully');
        setIsAddDialogOpen(false);
        setNewItem({
          name: '',
          category: '',
          currentStock: '',
          unit: '',
          minimumStock: '',
          maximumStock: '',
          unitPrice: '',
          supplier: '',
          lastRestocked: getTodayDate(),
          expiryDate: '',
          description: '',
          isPaid: false,
          discountPercentage: '',
          finalPrice: '',
          paymentMethods: [],
          qrCodeImage: '',
          upiLink: '',
          supplierPhone: ''
        });
        fetchInventoryData();
      } else {
        setAddItemError(result.error || 'Failed to add item');
      }
    } catch (error) {
      console.error('Error adding item:', error);
      setAddItemError('Failed to add item');
    }
  };

  // Helper function to upload image
  const uploadImage = async (file: File, itemId: string): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('itemId', itemId);

    const response = await fetch('/api/inventory/upload-image', {
      method: 'POST',
      body: formData
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error || 'Failed to upload image');
    }

    return result.filePath;
  };

  // Edit inventory item
  const handleEditItem = async () => {
    if (!editingItem) return;

    try {
      setEditItemError('');

      // Handle UPI QR code image upload if it's a file (base64 string indicates new file)
      let finalUpiLink = editingItem.upiLink;
      if (editingItem.upiLink && editingItem.upiLink.startsWith('data:image/')) {
        // Convert base64 to file and upload
        try {
          const response = await fetch(editingItem.upiLink);
          const blob = await response.blob();
          const file = new File([blob], 'upi-qr-code.png', { type: blob.type });
          finalUpiLink = await uploadImage(file, editingItem.id);
        } catch (uploadError) {
          console.error('Error uploading UPI QR image:', uploadError);
          setEditItemError('Failed to upload UPI QR code image');
          return;
        }
      }

      const response = await fetch('/api/inventory', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...editingItem,
          upiLink: finalUpiLink,
          updatedBy: currentUser?.username || 'admin'
        })
      });

      const result = await response.json();

      if (response.ok) {
        showAlert('success', 'Inventory item updated successfully');
        setIsEditDialogOpen(false);
        setEditingItem(null);
        fetchInventoryData();
      } else {
        setEditItemError(result.error || 'Failed to update item');
      }
    } catch (error) {
      console.error('Error updating item:', error);
      setEditItemError('Failed to update item');
    }
  };

  // Delete inventory item
  const handleDeleteItem = async (itemId: string) => {
    if (!confirm('Are you sure you want to delete this inventory item?')) return;

    try {
      const response = await fetch(`/api/inventory?id=${itemId}&updatedBy=${currentUser?.username || 'admin'}`, {
        method: 'DELETE'
      });

      const result = await response.json();

      if (response.ok) {
        showAlert('success', 'Inventory item deleted successfully');
        fetchInventoryData();
      } else {
        showAlert('error', result.error || 'Failed to delete item');
      }
    } catch (error) {
      console.error('Error deleting item:', error);
      showAlert('error', 'Failed to delete item');
    }
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return `₹${amount.toFixed(2)}`;
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <Package className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p>Loading inventory data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Package className="w-6 h-6 text-blue-600" />
            Inventory Management
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your restaurant's inventory items and stock levels
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
          setIsAddDialogOpen(open);
          if (!open) {
            setAddItemError('');
            setNewItem({
              name: '',
              category: '',
              currentStock: '',
              unit: '',
              minimumStock: '',
              maximumStock: '',
              unitPrice: '',
              supplier: '',
              lastRestocked: getTodayDate(),
              expiryDate: '',
              description: '',
              isPaid: false,
              discountPercentage: '',
              finalPrice: '',
              paymentMethods: [],
              qrCodeImage: '',
              upiLink: '',
              supplierPhone: ''
            });
          }
        }}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Add New Item
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Inventory Item</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {addItemError && (
                <Alert variant="destructive">
                  <AlertDescription>{addItemError}</AlertDescription>
                </Alert>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="add-name">Item Name *</Label>
                  <Input
                    id="add-name"
                    value={newItem.name}
                    onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                    placeholder="e.g., Atta (Wheat Flour)"
                  />
                </div>
                <div>
                  <Label htmlFor="add-category">Category *</Label>
                  <Select value={newItem.category} onValueChange={(value) => setNewItem({ ...newItem, category: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {inventoryData?.categories.map((category) => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                      <SelectItem value="new">+ Add New Category</SelectItem>
                    </SelectContent>
                  </Select>
                  {newItem.category === 'new' && (
                    <Input
                      className="mt-2"
                      placeholder="Enter new category"
                      value=""
                      onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                    />
                  )}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="add-currentStock">Current Stock *</Label>
                  <Input
                    id="add-currentStock"
                    type="number"
                    step="0.1"
                    value={newItem.currentStock}
                    onChange={(e) => setNewItem({ ...newItem, currentStock: e.target.value })}
                    placeholder="25"
                  />
                </div>
                <div>
                  <Label htmlFor="add-unit">Unit *</Label>
                  <Select value={newItem.unit} onValueChange={(value) => setNewItem({ ...newItem, unit: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                    <SelectContent>
                      {inventoryData?.units.map((unit) => (
                        <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="add-unitPrice">Unit Price (₹) *</Label>
                  <Input
                    id="add-unitPrice"
                    type="number"
                    step="0.01"
                    value={newItem.unitPrice}
                    onChange={(e) => setNewItem({ ...newItem, unitPrice: e.target.value })}
                    placeholder="45.50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="add-minimumStock">Minimum Stock *</Label>
                  <Input
                    id="add-minimumStock"
                    type="number"
                    step="0.1"
                    value={newItem.minimumStock}
                    onChange={(e) => setNewItem({ ...newItem, minimumStock: e.target.value })}
                    placeholder="10"
                  />
                </div>
                <div>
                  <Label htmlFor="add-maximumStock">Maximum Stock *</Label>
                  <Input
                    id="add-maximumStock"
                    type="number"
                    step="0.1"
                    value={newItem.maximumStock}
                    onChange={(e) => setNewItem({ ...newItem, maximumStock: e.target.value })}
                    placeholder="50"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="add-supplier">Supplier *</Label>
                <Select value={newItem.supplier} onValueChange={(value) => setNewItem({ ...newItem, supplier: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select supplier" />
                  </SelectTrigger>
                  <SelectContent>
                    {inventoryData?.suppliers.map((supplier) => (
                      <SelectItem key={supplier} value={supplier}>{supplier}</SelectItem>
                    ))}
                    <SelectItem value="new">+ Add New Supplier</SelectItem>
                  </SelectContent>
                </Select>
                {newItem.supplier === 'new' && (
                  <Input
                    className="mt-2"
                    placeholder="Enter new supplier"
                    value=""
                    onChange={(e) => setNewItem({ ...newItem, supplier: e.target.value })}
                  />
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="add-lastRestocked">Last Restocked</Label>
                  <Input
                    id="add-lastRestocked"
                    type="date"
                    value={newItem.lastRestocked}
                    onChange={(e) => setNewItem({ ...newItem, lastRestocked: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="add-expiryDate">Expiry Date</Label>
                  <Input
                    id="add-expiryDate"
                    type="date"
                    value={newItem.expiryDate}
                    onChange={(e) => setNewItem({ ...newItem, expiryDate: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="add-description">Description</Label>
                <Textarea
                  id="add-description"
                  value={newItem.description}
                  onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                  placeholder="Brief description of the item"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="add-discountPercentage">Discount Percentage (%)</Label>
                  <Input
                    id="add-discountPercentage"
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={newItem.discountPercentage}
                    onChange={(e) => {
                      const discount = parseFloat(e.target.value) || 0;
                      const unitPrice = parseFloat(newItem.unitPrice) || 0;
                      const finalPrice = unitPrice * (1 - discount / 100);
                      setNewItem({ 
                        ...newItem, 
                        discountPercentage: e.target.value,
                        finalPrice: finalPrice.toString()
                      });
                    }}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label htmlFor="add-finalPrice">Final Price (₹)</Label>
                  <Input
                    id="add-finalPrice"
                    type="number"
                    step="0.01"
                    value={newItem.finalPrice}
                    onChange={(e) => setNewItem({ ...newItem, finalPrice: e.target.value })}
                    placeholder="Calculated automatically"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="add-isPaid"
                  checked={newItem.isPaid}
                  onChange={(e) => setNewItem({ ...newItem, isPaid: e.target.checked })}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                />
                <Label htmlFor="add-isPaid" className="text-sm font-medium text-gray-700">
                  Item is paid
                </Label>
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={handleAddItem} className="flex-1">
                  Add Item
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setIsAddDialogOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Alert */}
      {alert && (
        <Alert variant={alert.type === 'error' ? 'destructive' : 'default'}>
          <AlertDescription>{alert.message}</AlertDescription>
        </Alert>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Items</p>
                <p className="text-2xl font-bold text-blue-600">{stats.totalItems}</p>
              </div>
              <Package2 className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Low Stock</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.lowStockItems}</p>
              </div>
              <TrendingDown className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Out of Stock</p>
                <p className="text-2xl font-bold text-red-600">{stats.outOfStockItems}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Value</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(stats.totalValue)}</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Advanced Analytics Dashboard */}
      {inventoryData && inventoryData.inventory.length > 0 && (
        <InventoryAnalyticsDashboard 
          inventoryData={inventoryData} 
          onRefresh={fetchInventoryData}
        />
      )}

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search items, categories, or suppliers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-48">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {inventoryData?.categories.map((category) => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="in_stock">In Stock</SelectItem>
                  <SelectItem value="low_stock">Low Stock</SelectItem>
                  <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                </SelectContent>
              </Select>
              
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm('');
                  setCategoryFilter('all');
                  setStatusFilter('all');
                }}
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Inventory Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Inventory Items ({filteredItems.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Unit Price</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Expiry</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{item.name}</div>
                        <div className="text-sm text-gray-600">{item.description}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{item.category}</Badge>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {item.currentStock} {item.unit}
                        </div>
                        <div className="text-sm text-gray-600">
                          Min: {item.minimumStock} | Max: {item.maximumStock}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(item.status, item.currentStock, item.minimumStock)}
                    </TableCell>
                    <TableCell>{formatCurrency(item.unitPrice)}</TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(item.currentStock * item.unitPrice)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Truck className="w-3 h-3 text-gray-400" />
                        {item.supplier}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-gray-400" />
                        {formatDate(item.expiryDate)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Dialog open={isEditDialogOpen && editingItem?.id === item.id} onOpenChange={(open) => {
                          setIsEditDialogOpen(open);
                          if (!open) {
                            setEditingItem(null);
                            setEditItemError('');
                          }
                        }}>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setEditingItem({ ...item })}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Edit Inventory Item</DialogTitle>
                            </DialogHeader>
                            {editingItem && (
                              <div className="space-y-4 max-h-96 overflow-y-auto">
                                {editItemError && (
                                  <Alert variant="destructive">
                                    <AlertDescription>{editItemError}</AlertDescription>
                                  </Alert>
                                )}
                                
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label htmlFor="edit-name">Item Name</Label>
                                    <Input
                                      id="edit-name"
                                      value={editingItem.name}
                                      onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor="edit-category">Category</Label>
                                    <Select value={editingItem.category} onValueChange={(value) => setEditingItem({ ...editingItem, category: value })}>
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {inventoryData?.categories.map((category) => (
                                          <SelectItem key={category} value={category}>{category}</SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>

                                <div className="grid grid-cols-3 gap-4">
                                  <div>
                                    <Label htmlFor="edit-currentStock">Current Stock</Label>
                                    <Input
                                      id="edit-currentStock"
                                      type="number"
                                      step="0.1"
                                      value={editingItem.currentStock}
                                      onChange={(e) => setEditingItem({ ...editingItem, currentStock: parseFloat(e.target.value) || 0 })}
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor="edit-unit">Unit</Label>
                                    <Select value={editingItem.unit} onValueChange={(value) => setEditingItem({ ...editingItem, unit: value })}>
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {inventoryData?.units.map((unit) => (
                                          <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div>
                                    <Label htmlFor="edit-unitPrice">Unit Price (₹)</Label>
                                    <Input
                                      id="edit-unitPrice"
                                      type="number"
                                      step="0.01"
                                      value={editingItem.unitPrice}
                                      onChange={(e) => setEditingItem({ ...editingItem, unitPrice: parseFloat(e.target.value) || 0 })}
                                    />
                                  </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label htmlFor="edit-minimumStock">Minimum Stock</Label>
                                    <Input
                                      id="edit-minimumStock"
                                      type="number"
                                      step="0.1"
                                      value={editingItem.minimumStock}
                                      onChange={(e) => setEditingItem({ ...editingItem, minimumStock: parseFloat(e.target.value) || 0 })}
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor="edit-maximumStock">Maximum Stock</Label>
                                    <Input
                                      id="edit-maximumStock"
                                      type="number"
                                      step="0.1"
                                      value={editingItem.maximumStock}
                                      onChange={(e) => setEditingItem({ ...editingItem, maximumStock: parseFloat(e.target.value) || 0 })}
                                    />
                                  </div>
                                </div>

                                <div>
                                  <Label htmlFor="edit-supplier">Supplier</Label>
                                  <Select value={editingItem.supplier} onValueChange={(value) => setEditingItem({ ...editingItem, supplier: value })}>
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {inventoryData?.suppliers.map((supplier) => (
                                        <SelectItem key={supplier} value={supplier}>{supplier}</SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label htmlFor="edit-lastRestocked">Last Restocked</Label>
                                    <Input
                                      id="edit-lastRestocked"
                                      type="date"
                                      value={editingItem.lastRestocked.split('T')[0]}
                                      onChange={(e) => setEditingItem({ ...editingItem, lastRestocked: e.target.value })}
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor="edit-expiryDate">Expiry Date</Label>
                                    <Input
                                      id="edit-expiryDate"
                                      type="date"
                                      value={editingItem.expiryDate.split('T')[0]}
                                      onChange={(e) => setEditingItem({ ...editingItem, expiryDate: e.target.value })}
                                    />
                                  </div>
                                </div>

                                <div>
                                  <Label htmlFor="edit-description">Description</Label>
                                  <Textarea
                                    id="edit-description"
                                    value={editingItem.description}
                                    onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                                    rows={3}
                                  />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label htmlFor="edit-discountPercentage">Discount Percentage (%)</Label>
                                    <Input
                                      id="edit-discountPercentage"
                                      type="number"
                                      step="0.01"
                                      min="0"
                                      max="100"
                                      value={editingItem.discountPercentage}
                                      onChange={(e) => {
                                        const discount = parseFloat(e.target.value) || 0;
                                        const unitPrice = editingItem.unitPrice || 0;
                                        const finalPrice = unitPrice * (1 - discount / 100);
                                        setEditingItem({ 
                                          ...editingItem, 
                                          discountPercentage: parseFloat(e.target.value) || 0,
                                          finalPrice: finalPrice
                                        });
                                      }}
                                      placeholder="0.00"
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor="edit-finalPrice">Final Price (₹)</Label>
                                    <Input
                                      id="edit-finalPrice"
                                      type="number"
                                      step="0.01"
                                      value={editingItem.finalPrice}
                                      onChange={(e) => setEditingItem({ ...editingItem, finalPrice: parseFloat(e.target.value) || 0 })}
                                      placeholder="Calculated automatically"
                                    />
                                  </div>
                                </div>

                                <div className="flex items-center space-x-2">
                                  <input
                                    type="checkbox"
                                    id="edit-isPaid"
                                    checked={editingItem.isPaid}
                                    onChange={(e) => setEditingItem({ ...editingItem, isPaid: e.target.checked })}
                                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                                  />
                                  <Label htmlFor="edit-isPaid" className="text-sm font-medium text-gray-700">
                                    Item is paid
                                  </Label>
                                </div>

                                {/* Payment Methods Section */}
                                <div className="border-t pt-4">
                                  <Label className="text-lg font-semibold text-gray-900 mb-3 block">Payment Methods</Label>
                                  <div className="space-y-3">
                                    <div>
                                      <Label htmlFor="edit-paymentMethods">Accepted Payment Methods</Label>
                                      <div className="grid grid-cols-2 gap-2 mt-2">
                                        {['Cash', 'UPI', 'Card', 'Bank Transfer', 'Credit', 'Cheque'].map(method => (
                                          <div key={method} className="flex items-center space-x-2">
                                            <input
                                              type="checkbox"
                                              id={`edit-payment-${method}`}
                                              checked={editingItem.paymentMethods?.includes(method) || false}
                                              onChange={(e) => {
                                                const methods = editingItem.paymentMethods || [];
                                                if (e.target.checked) {
                                                  setEditingItem({ ...editingItem, paymentMethods: [...methods, method] });
                                                } else {
                                                  setEditingItem({ 
                                                    ...editingItem, 
                                                    paymentMethods: methods.filter(m => m !== method) 
                                                  });
                                                }
                                              }}
                                              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                                            />
                                            <Label htmlFor={`edit-payment-${method}`} className="text-sm">{method}</Label>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                    
                                    <div>
                                      <Label htmlFor="edit-qrCodeImage">QR Code Image URL</Label>
                                      <Input
                                        id="edit-qrCodeImage"
                                        value={editingItem.qrCodeImage || ''}
                                        onChange={(e) => setEditingItem({ ...editingItem, qrCodeImage: e.target.value })}
                                        placeholder="https://example.com/qr-code.png"
                                      />
                                    </div>
                                    
                                    <div>
                                      <Label htmlFor="edit-upiQR">UPI QR Code Image</Label>
                                      <div className="space-y-2">
                                        <Input
                                          id="edit-upiQR"
                                          type="file"
                                          accept="image/*"
                                          onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                              const reader = new FileReader();
                                              reader.onload = (event) => {
                                                const result = event.target?.result as string;
                                                setEditingItem({ ...editingItem, upiLink: result });
                                              };
                                              reader.readAsDataURL(file);
                                            }
                                          }}
                                          className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                        />
                                        {editingItem.upiLink && (
                                          <div className="mt-2">
                                            <p className="text-sm text-gray-600 mb-2">Preview:</p>
                                            <img 
                                              src={editingItem.upiLink} 
                                              alt="UPI QR Code" 
                                              className="w-32 h-32 object-contain border border-gray-300 rounded-lg"
                                            />
                                            <div className="flex gap-2 mt-2">
                                              <button
                                                type="button"
                                                onClick={() => {
                                                  const newWindow = window.open();
                                                  if (newWindow) {
                                                    newWindow.document.write(`
                                                      <html>
                                                        <head>
                                                          <title>UPI QR Code - ${editingItem.name}</title>
                                                          <style>
                                                            body {
                                                              margin: 0;
                                                              padding: 20px;
                                                              background: #f5f5f5;
                                                              display: flex;
                                                              flex-direction: column;
                                                              align-items: center;
                                                              font-family: Arial, sans-serif;
                                                            }
                                                            .container {
                                                              background: white;
                                                              padding: 20px;
                                                              border-radius: 8px;
                                                              box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                                                              text-align: center;
                                                            }
                                                            img {
                                                              max-width: 400px;
                                                              max-height: 400px;
                                                              border: 2px solid #ddd;
                                                              border-radius: 8px;
                                                            }
                                                            h2 {
                                                              color: #333;
                                                              margin-bottom: 10px;
                                                            }
                                                            .info {
                                                              color: #666;
                                                              margin-bottom: 20px;
                                                            }
                                                          </style>
                                                        </head>
                                                        <body>
                                                          <div class="container">
                                                            <h2>UPI QR Code</h2>
                                                            <div class="info">Item: ${editingItem.name}</div>
                                                            <div class="info">Supplier: ${editingItem.supplier}</div>
                                                            <img src="${editingItem.upiLink}" alt="UPI QR Code" />
                                                            <div class="info" style="margin-top: 20px; font-size: 12px;">
                                                              Right-click and "Save Image As" to download
                                                            </div>
                                                          </div>
                                                        </body>
                                                      </html>
                                                    `);
                                                    newWindow.document.close();
                                                  }
                                                }}
                                                className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                                              >
                                                View Image
                                              </button>
                                              <button
                                                type="button"
                                                onClick={() => setEditingItem({ ...editingItem, upiLink: '' })}
                                                className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                                              >
                                                Remove Image
                                              </button>
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* Supplier Contact Section */}
                                <div className="border-t pt-4">
                                  <Label className="text-lg font-semibold text-gray-900 mb-3 block">Supplier Contact</Label>
                                  <div>
                                    <Label htmlFor="edit-supplierPhone">Supplier Phone Number</Label>
                                    <Input
                                      id="edit-supplierPhone"
                                      type="tel"
                                      value={editingItem.supplierPhone || ''}
                                      onChange={(e) => setEditingItem({ ...editingItem, supplierPhone: e.target.value })}
                                      placeholder="+91 9876543210"
                                    />
                                  </div>
                                </div>

                                <div className="flex gap-2 pt-4">
                                  <Button onClick={handleEditItem} className="flex-1">
                                    Save Changes
                                  </Button>
                                  <Button 
                                    variant="outline" 
                                    onClick={() => {
                                      setIsEditDialogOpen(false);
                                      setEditingItem(null);
                                    }}
                                    className="flex-1"
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteItem(item.id)}
                          className="text-red-600 border-red-200 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {filteredItems.length === 0 && (
            <div className="text-center py-8">
              <Package className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">No inventory items found</p>
              <p className="text-sm text-gray-500">Try adjusting your search or filters</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
