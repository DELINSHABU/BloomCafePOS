"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  AlertTriangle, 
  Package,
  Calendar,
  Filter,
  Download,
  RefreshCw
} from "lucide-react"
import { InventoryPieChart } from "./charts/inventory-pie-chart"
import { InventoryBarChart } from "./charts/inventory-bar-chart"
import { SupplierRadarChart } from "./charts/supplier-radar-chart"

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
}

interface InventoryData {
  inventory: InventoryItem[];
  categories: string[];
  suppliers: string[];
  units: string[];
  lastUpdated: string;
  updatedBy: string;
}

interface InventoryAnalyticsDashboardProps {
  inventoryData: InventoryData;
  onRefresh?: () => void;
}

export default function InventoryAnalyticsDashboard({ inventoryData, onRefresh }: InventoryAnalyticsDashboardProps) {
  const [selectedView, setSelectedView] = useState<'overview' | 'detailed' | 'alerts'>('overview');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSupplier, setSelectedSupplier] = useState<string>('all');

  // Filter inventory based on selected filters
  const filteredInventory = inventoryData.inventory.filter(item => {
    const categoryMatch = selectedCategory === 'all' || item.category === selectedCategory;
    const supplierMatch = selectedSupplier === 'all' || item.supplier === selectedSupplier;
    return categoryMatch && supplierMatch;
  });

  // Calculate key metrics
  const metrics = {
    totalItems: filteredInventory.length,
    totalValue: filteredInventory.reduce((sum, item) => sum + (item.currentStock * item.unitPrice), 0),
    lowStockItems: filteredInventory.filter(item => item.status === 'low_stock').length,
    outOfStockItems: filteredInventory.filter(item => item.status === 'out_of_stock').length,
    categoriesCount: new Set(filteredInventory.map(item => item.category)).size,
    suppliersCount: new Set(filteredInventory.map(item => item.supplier)).size,
    averageValue: filteredInventory.length > 0 
      ? filteredInventory.reduce((sum, item) => sum + (item.currentStock * item.unitPrice), 0) / filteredInventory.length 
      : 0,
    reorderNeeded: filteredInventory.filter(item => 
      item.status === 'low_stock' || item.status === 'out_of_stock'
    ).length,
  };

  // Get items expiring soon (within 30 days)
  const expiringItems = filteredInventory.filter(item => {
    if (!item.expiryDate) return false;
    const expiryDate = new Date(item.expiryDate);
    const today = new Date();
    const daysDiff = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
    return daysDiff <= 30 && daysDiff > 0;
  });

  const handleExportData = () => {
    const csvContent = [
      ['Item Name', 'Category', 'Current Stock', 'Unit', 'Status', 'Value', 'Supplier', 'Expiry Date'].join(','),
      ...filteredInventory.map(item => [
        `"${item.name}"`,
        item.category,
        item.currentStock,
        item.unit,
        item.status,
        (item.currentStock * item.unitPrice).toFixed(2),
        `"${item.supplier}"`,
        item.expiryDate
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inventory-analytics-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const formatCurrency = (amount: number) => `₹${amount.toLocaleString()}`;

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-blue-600" />
            Inventory Analytics Dashboard
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Comprehensive insights into your inventory performance
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {/* View Toggle */}
          <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            {(['overview', 'detailed', 'alerts'] as const).map((view) => (
              <Button
                key={view}
                variant={selectedView === view ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setSelectedView(view)}
                className="capitalize"
              >
                {view}
              </Button>
            ))}
          </div>
          
          {/* Filters */}
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-40">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {inventoryData.categories.map(category => (
                <SelectItem key={category} value={category}>{category}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedSupplier} onValueChange={setSelectedSupplier}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Supplier" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Suppliers</SelectItem>
              {inventoryData.suppliers.map(supplier => (
                <SelectItem key={supplier} value={supplier}>{supplier}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {/* Action Buttons */}
          <Button onClick={onRefresh} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          
          <Button onClick={handleExportData} variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <Package className="w-6 h-6 mx-auto mb-2 text-blue-500" />
              <div className="text-2xl font-bold text-blue-600">{metrics.totalItems}</div>
              <div className="text-xs text-gray-600">Total Items</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <TrendingUp className="w-6 h-6 mx-auto mb-2 text-green-500" />
              <div className="text-2xl font-bold text-green-600">{formatCurrency(metrics.totalValue / 1000)}K</div>
              <div className="text-xs text-gray-600">Total Value</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <AlertTriangle className="w-6 h-6 mx-auto mb-2 text-yellow-500" />
              <div className="text-2xl font-bold text-yellow-600">{metrics.lowStockItems}</div>
              <div className="text-xs text-gray-600">Low Stock</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <AlertTriangle className="w-6 h-6 mx-auto mb-2 text-red-500" />
              <div className="text-2xl font-bold text-red-600">{metrics.outOfStockItems}</div>
              <div className="text-xs text-gray-600">Out of Stock</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <Package className="w-6 h-6 mx-auto mb-2 text-purple-500" />
              <div className="text-2xl font-bold text-purple-600">{metrics.categoriesCount}</div>
              <div className="text-xs text-gray-600">Categories</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <Package className="w-6 h-6 mx-auto mb-2 text-indigo-500" />
              <div className="text-2xl font-bold text-indigo-600">{metrics.suppliersCount}</div>
              <div className="text-xs text-gray-600">Suppliers</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <Calendar className="w-6 h-6 mx-auto mb-2 text-orange-500" />
              <div className="text-2xl font-bold text-orange-600">{expiringItems.length}</div>
              <div className="text-xs text-gray-600">Expiring Soon</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <RefreshCw className="w-6 h-6 mx-auto mb-2 text-cyan-500" />
              <div className="text-2xl font-bold text-cyan-600">{metrics.reorderNeeded}</div>
              <div className="text-xs text-gray-600">Reorder Needed</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Overview Charts */}
      {selectedView === 'overview' && (
        <div className="space-y-6">
          {/* Pie Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <InventoryPieChart 
              inventory={filteredInventory} 
              chartType="category" 
            />
            <InventoryPieChart 
              inventory={filteredInventory} 
              chartType="status" 
            />
            <InventoryPieChart 
              inventory={filteredInventory} 
              chartType="value" 
            />
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <InventoryBarChart 
              inventory={filteredInventory} 
              chartType="category_values" 
            />
            <SupplierRadarChart 
              inventory={filteredInventory} 
            />
          </div>
        </div>
      )}

      {/* Detailed Analysis */}
      {selectedView === 'detailed' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <InventoryBarChart 
              inventory={filteredInventory} 
              chartType="stock_levels" 
            />
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Top Value Categories
                </CardTitle>
                <CardDescription>Categories with highest inventory value</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(
                    filteredInventory.reduce((acc, item) => {
                      if (!acc[item.category]) acc[item.category] = 0;
                      acc[item.category] += item.currentStock * item.unitPrice;
                      return acc;
                    }, {} as Record<string, number>)
                  )
                    .sort(([,a], [,b]) => b - a)
                    .slice(0, 5)
                    .map(([category, value]) => (
                      <div key={category} className="flex justify-between items-center">
                        <span className="font-medium">{category}</span>
                        <div className="text-right">
                          <div className="font-bold text-green-600">{formatCurrency(value)}</div>
                          <div className="text-xs text-gray-500">
                            {filteredInventory.filter(item => item.category === category).length} items
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Expiring Items (Next 30 Days)
                </CardTitle>
                <CardDescription>Items that need attention soon</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {expiringItems.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No items expiring soon</p>
                  ) : (
                    expiringItems.map(item => {
                      const expiryDate = new Date(item.expiryDate);
                      const today = new Date();
                      const daysDiff = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
                      
                      return (
                        <div key={item.id} className="flex justify-between items-center p-2 bg-orange-50 rounded">
                          <div>
                            <div className="font-medium">{item.name}</div>
                            <div className="text-xs text-gray-600">{item.category}</div>
                          </div>
                          <div className="text-right">
                            <Badge variant={daysDiff <= 7 ? "destructive" : "secondary"}>
                              {daysDiff} days
                            </Badge>
                            <div className="text-xs text-gray-500 mt-1">
                              {item.currentStock} {item.unit}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Supplier Analysis
                </CardTitle>
                <CardDescription>Orders and performance by supplier</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(
                    filteredInventory.reduce((acc, item) => {
                      if (!acc[item.supplier]) {
                        acc[item.supplier] = { 
                          orders: 0, 
                          items: 0, 
                          value: 0, 
                          lowStock: 0,
                          avgOrderValue: 0,
                          lastOrderDate: item.lastRestocked
                        };
                      }
                      acc[item.supplier].orders += 1; // Each item represents an order
                      acc[item.supplier].items += item.currentStock;
                      acc[item.supplier].value += item.currentStock * item.unitPrice;
                      if (item.status === 'low_stock' || item.status === 'out_of_stock') {
                        acc[item.supplier].lowStock += 1;
                      }
                      // Update last order date if this item was restocked more recently
                      if (new Date(item.lastRestocked) > new Date(acc[item.supplier].lastOrderDate)) {
                        acc[item.supplier].lastOrderDate = item.lastRestocked;
                      }
                      return acc;
                    }, {} as Record<string, { 
                      orders: number; 
                      items: number; 
                      value: number; 
                      lowStock: number;
                      avgOrderValue: number;
                      lastOrderDate: string;
                    }>)
                  )
                    .map(([supplier, data]) => {
                      data.avgOrderValue = data.orders > 0 ? data.value / data.orders : 0;
                      return [supplier, data];
                    })
                    .sort(([,a], [,b]) => b.orders - a.orders)
                    .slice(0, 5)
                    .map(([supplier, data]) => {
                      const lastOrderDays = Math.floor(
                        (new Date().getTime() - new Date(data.lastOrderDate).getTime()) / 
                        (1000 * 3600 * 24)
                      );
                      
                      return (
                        <div key={supplier} className="p-3 border rounded-lg bg-gray-50">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <div className="font-medium text-lg">{supplier}</div>
                              <div className="text-sm text-gray-600">
                                Last order: {lastOrderDays === 0 ? 'Today' : `${lastOrderDays} days ago`}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-blue-600 text-lg">
                                {data.orders} Orders
                              </div>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-3 gap-2 text-sm">
                            <div className="text-center">
                              <div className="font-semibold text-green-600">
                                {formatCurrency(data.value)}
                              </div>
                              <div className="text-xs text-gray-500">Total Value</div>
                            </div>
                            <div className="text-center">
                              <div className="font-semibold text-purple-600">
                                {data.items}
                              </div>
                              <div className="text-xs text-gray-500">Total Items</div>
                            </div>
                            <div className="text-center">
                              <div className="font-semibold text-orange-600">
                                {formatCurrency(data.avgOrderValue)}
                              </div>
                              <div className="text-xs text-gray-500">Avg Order</div>
                            </div>
                          </div>
                          
                          <div className="flex justify-between items-center mt-2">
                            <div className="text-xs text-gray-600">
                              {data.orders === 1 ? '1 unique item' : `${data.orders} unique items`}
                            </div>
                            {data.lowStock > 0 && (
                              <Badge variant="destructive" className="text-xs">
                                {data.lowStock} low stock
                              </Badge>
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Alerts View */}
      {selectedView === 'alerts' && (
        <div className="space-y-6">
          <InventoryBarChart 
            inventory={filteredInventory} 
            chartType="low_stock_alert" 
          />
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-600">
                  <AlertTriangle className="w-5 h-5" />
                  Critical Stock Alerts
                </CardTitle>
                <CardDescription>Items requiring immediate attention</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {filteredInventory
                    .filter(item => item.status === 'out_of_stock' || item.status === 'low_stock')
                    .map(item => (
                      <div key={item.id} className="flex justify-between items-center p-3 border rounded-lg">
                        <div>
                          <div className="font-medium">{item.name}</div>
                          <div className="text-sm text-gray-600">{item.category} • {item.supplier}</div>
                        </div>
                        <div className="text-right">
                          <Badge variant={item.status === 'out_of_stock' ? 'destructive' : 'secondary'}>
                            {item.status === 'out_of_stock' ? 'Out of Stock' : 'Low Stock'}
                          </Badge>
                          <div className="text-sm text-gray-500 mt-1">
                            {item.currentStock} / {item.minimumStock} {item.unit}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-orange-500" />
                  Reorder Recommendations
                </CardTitle>
                <CardDescription>Suggested reorder quantities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {filteredInventory
                    .filter(item => item.status === 'low_stock' || item.status === 'out_of_stock')
                    .slice(0, 10)
                    .map(item => {
                      const recommendedOrder = Math.max(
                        item.minimumStock - item.currentStock,
                        Math.ceil((item.maximumStock - item.currentStock) * 0.7)
                      );
                      
                      return (
                        <div key={item.id} className="flex justify-between items-center p-2 bg-blue-50 rounded">
                          <div>
                            <div className="font-medium">{item.name}</div>
                            <div className="text-xs text-gray-600">{item.supplier}</div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-blue-600">
                              Order: {recommendedOrder} {item.unit}
                            </div>
                            <div className="text-xs text-gray-500">
                              Cost: {formatCurrency(recommendedOrder * item.unitPrice)}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
