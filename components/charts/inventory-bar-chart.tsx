"use client"

import { Bar, BarChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Cell } from "recharts"
import { Package, AlertTriangle, TrendingDown } from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

export const description = "Inventory bar chart for stock levels and values"

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

interface InventoryBarChartProps {
  inventory: InventoryItem[];
  chartType?: 'stock_levels' | 'category_values' | 'low_stock_alert' | 'supplier_breakdown';
  className?: string;
}

export function InventoryBarChart({ inventory, chartType = 'stock_levels', className }: InventoryBarChartProps) {
  
  const generateChartData = () => {
    if (chartType === 'stock_levels') {
      // Show items with their current stock vs minimum/maximum
      return inventory
        .filter(item => item.currentStock > 0 || item.status === 'low_stock' || item.status === 'out_of_stock')
        .slice(0, 10) // Show top 10 items
        .map(item => ({
          name: item.name.length > 15 ? `${item.name.slice(0, 15)}...` : item.name,
          fullName: item.name,
          currentStock: item.currentStock,
          minimumStock: item.minimumStock,
          maximumStock: item.maximumStock,
          status: item.status,
          unit: item.unit,
        }));
    }

    if (chartType === 'category_values') {
      const categoryData = inventory.reduce((acc, item) => {
        const category = item.category || 'Unknown';
        if (!acc[category]) {
          acc[category] = { 
            totalValue: 0, 
            itemCount: 0,
            averageValue: 0 
          };
        }
        acc[category].totalValue += item.currentStock * item.unitPrice;
        acc[category].itemCount += 1;
        return acc;
      }, {} as Record<string, { totalValue: number; itemCount: number; averageValue: number }>);

      const categoryColors = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#f97316', '#06b6d4', '#84cc16'];
      
      return Object.entries(categoryData)
        .map(([category, data], index) => ({
          name: category.length > 12 ? `${category.slice(0, 12)}...` : category,
          fullName: category,
          totalValue: Math.round(data.totalValue),
          itemCount: data.itemCount,
          averageValue: Math.round(data.totalValue / data.itemCount),
          fill: categoryColors[index % categoryColors.length],
        }))
        .sort((a, b) => b.totalValue - a.totalValue)
        .slice(0, 8);
    }

    if (chartType === 'low_stock_alert') {
      return inventory
        .filter(item => item.status === 'low_stock' || item.status === 'out_of_stock')
        .slice(0, 10)
        .map(item => ({
          name: item.name.length > 15 ? `${item.name.slice(0, 15)}...` : item.name,
          fullName: item.name,
          currentStock: item.currentStock,
          minimumStock: item.minimumStock,
          shortfall: Math.max(0, item.minimumStock - item.currentStock),
          status: item.status,
          unit: item.unit,
        }));
    }

    if (chartType === 'supplier_breakdown') {
      const supplierData = inventory.reduce((acc, item) => {
        const supplier = item.supplier || 'Unknown';
        if (!acc[supplier]) {
          acc[supplier] = { 
            totalValue: 0, 
            itemCount: 0,
            lowStockItems: 0 
          };
        }
        acc[supplier].totalValue += item.currentStock * item.unitPrice;
        acc[supplier].itemCount += 1;
        if (item.status === 'low_stock' || item.status === 'out_of_stock') {
          acc[supplier].lowStockItems += 1;
        }
        return acc;
      }, {} as Record<string, { totalValue: number; itemCount: number; lowStockItems: number }>);

      return Object.entries(supplierData)
        .map(([supplier, data]) => ({
          name: supplier.length > 12 ? `${supplier.slice(0, 12)}...` : supplier,
          fullName: supplier,
          totalValue: Math.round(data.totalValue),
          itemCount: data.itemCount,
          lowStockItems: data.lowStockItems,
        }))
        .sort((a, b) => b.itemCount - a.itemCount)
        .slice(0, 8);
    }

    return [];
  };

  const chartData = generateChartData();

  const getChartConfig = (): ChartConfig => {
    switch (chartType) {
      case 'stock_levels':
        return {
          currentStock: {
            label: "Current Stock",
            color: "#3b82f6", // Blue
          },
          minimumStock: {
            label: "Minimum Stock",
            color: "#f59e0b", // Amber
          },
        };
      case 'category_values':
        return {
          totalValue: {
            label: "Total Value (₹)",
            color: "#10b981", // Green
          },
          itemCount: {
            label: "Item Count",
            color: "#8b5cf6", // Purple
          },
        };
      case 'low_stock_alert':
        return {
          currentStock: {
            label: "Current Stock",
            color: "#3b82f6", // Blue
          },
          shortfall: {
            label: "Shortfall",
            color: "#ef4444", // Red
          },
        };
      case 'supplier_breakdown':
        return {
          itemCount: {
            label: "Items Supplied",
            color: "#3b82f6", // Blue
          },
          lowStockItems: {
            label: "Low Stock Items",
            color: "#ef4444", // Red
          },
        };
      default:
        return {};
    }
  };

  const chartConfig = getChartConfig();

  const getChartTitle = () => {
    switch (chartType) {
      case 'stock_levels': return 'Stock Levels Overview';
      case 'category_values': return 'Category Value Analysis';
      case 'low_stock_alert': return 'Low Stock Alert';
      case 'supplier_breakdown': return 'Supplier Analysis';
      default: return 'Inventory Chart';
    }
  };

  const getChartDescription = () => {
    switch (chartType) {
      case 'stock_levels': return 'Current stock vs minimum required levels';
      case 'category_values': return 'Total inventory value by category';
      case 'low_stock_alert': return 'Items requiring immediate restocking';
      case 'supplier_breakdown': return 'Inventory distribution by supplier';
      default: return 'Inventory data visualization';
    }
  };

  const getChartIcon = () => {
    switch (chartType) {
      case 'stock_levels': return <Package className="w-5 h-5" />;
      case 'category_values': return <Package className="w-5 h-5" />;
      case 'low_stock_alert': return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'supplier_breakdown': return <TrendingDown className="w-5 h-5" />;
      default: return <Package className="w-5 h-5" />;
    }
  };

  if (chartData.length === 0) {
    return (
      <Card className={`flex flex-col ${className}`}>
        <CardHeader className="items-center pb-0">
          <CardTitle className="flex items-center gap-2">
            {getChartIcon()}
            {getChartTitle()}
          </CardTitle>
          <CardDescription>{getChartDescription()}</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 pb-0">
          <div className="flex items-center justify-center h-[300px]">
            <div className="text-center">
              <Package className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600">No data available</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const renderBars = () => {
    switch (chartType) {
      case 'stock_levels':
        return (
          <>
            <Bar dataKey="currentStock" fill="#3b82f6" radius={4} />
            <Bar dataKey="minimumStock" fill="#f59e0b" radius={4} />
          </>
        );
      case 'category_values':
        return (
          <Bar dataKey="totalValue" radius={4}>
            {chartData.map((entry: any, index: number) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Bar>
        );
      case 'low_stock_alert':
        return (
          <>
            <Bar dataKey="currentStock" fill="#3b82f6" radius={4} />
            <Bar dataKey="shortfall" fill="#ef4444" radius={4} />
          </>
        );
      case 'supplier_breakdown':
        return (
          <>
            <Bar dataKey="itemCount" fill="#3b82f6" radius={4} />
            <Bar dataKey="lowStockItems" fill="#ef4444" radius={4} />
          </>
        );
      default:
        return <Bar dataKey="value" fill="#3b82f6" radius={4} />;
    }
  };

  const customTooltip = (active: any, payload: any, label: any) => {
    if (!active || !payload || !payload.length) return null;

    const data = payload[0]?.payload;
    if (!data) return null;

    switch (chartType) {
      case 'stock_levels':
        return (
          <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-md">
            <p className="font-medium">{data.fullName}</p>
            <div className="space-y-1 mt-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Current Stock:</span>
                <span className="font-medium">{data.currentStock} {data.unit}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Minimum Stock:</span>
                <span className="font-medium">{data.minimumStock} {data.unit}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Status:</span>
                <span className={`font-medium capitalize ${
                  data.status === 'in_stock' ? 'text-green-600' :
                  data.status === 'low_stock' ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {data.status.replace('_', ' ')}
                </span>
              </div>
            </div>
          </div>
        );
      case 'category_values':
        return (
          <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-md">
            <p className="font-medium">{data.fullName}</p>
            <div className="space-y-1 mt-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total Value:</span>
                <span className="font-medium">₹{data.totalValue.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Items:</span>
                <span className="font-medium">{data.itemCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Avg Value:</span>
                <span className="font-medium">₹{data.averageValue.toLocaleString()}</span>
              </div>
            </div>
          </div>
        );
      case 'low_stock_alert':
        return (
          <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-md">
            <p className="font-medium">{data.fullName}</p>
            <div className="space-y-1 mt-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Current:</span>
                <span className="font-medium">{data.currentStock} {data.unit}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Required:</span>
                <span className="font-medium">{data.minimumStock} {data.unit}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-red-600">Shortfall:</span>
                <span className="font-medium text-red-600">{data.shortfall} {data.unit}</span>
              </div>
            </div>
          </div>
        );
      case 'supplier_breakdown':
        return (
          <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-md">
            <p className="font-medium">{data.fullName}</p>
            <div className="space-y-1 mt-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total Items:</span>
                <span className="font-medium">{data.itemCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total Value:</span>
                <span className="font-medium">₹{data.totalValue.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-red-600">Low Stock:</span>
                <span className="font-medium text-red-600">{data.lowStockItems}</span>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Card className={`flex flex-col ${className}`}>
      <CardHeader className="items-center pb-0">
        <CardTitle className="flex items-center gap-2">
          {getChartIcon()}
          {getChartTitle()}
        </CardTitle>
        <CardDescription>{getChartDescription()}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer config={chartConfig} className="h-[400px] w-full">
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              dataKey="name" 
              tick={{ fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis tick={{ fontSize: 12 }} />
            <ChartTooltip 
              content={({ active, payload, label }) => {
                return customTooltip(active, payload, label);
              }}
            />
            {renderBars()}
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
