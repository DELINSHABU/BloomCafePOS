"use client"

import { Pie, PieChart } from "recharts"
import { Package, TrendingUp, AlertTriangle, TrendingDown, DollarSign } from "lucide-react"

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
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

export const description = "Inventory distribution pie chart"

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

interface InventoryPieChartProps {
  inventory: InventoryItem[];
  chartType?: 'category' | 'status' | 'value';
  className?: string;
}

export function InventoryPieChart({ inventory, chartType = 'category', className }: InventoryPieChartProps) {
  
  // Generate chart data based on type
  const generateChartData = () => {
    if (chartType === 'category') {
      const categoryData = inventory.reduce((acc, item) => {
        const category = item.category || 'Unknown';
        if (!acc[category]) {
          acc[category] = { count: 0, value: 0 };
        }
        acc[category].count += 1;
        acc[category].value += item.currentStock * item.unitPrice;
        return acc;
      }, {} as Record<string, { count: number; value: number }>);

      const colors = ['#3b82f6', '#ef4444', '#f59e0b', '#10b981', '#8b5cf6', '#f97316', '#06b6d4', '#84cc16'];
      
      return Object.entries(categoryData).map(([category, data], index) => ({
        name: category,
        value: data.count,
        totalValue: data.value,
        fill: colors[index % colors.length],
      }));
    }

    if (chartType === 'status') {
      const statusData = inventory.reduce((acc, item) => {
        const status = item.status;
        if (!acc[status]) {
          acc[status] = { count: 0, value: 0 };
        }
        acc[status].count += 1;
        acc[status].value += item.currentStock * item.unitPrice;
        return acc;
      }, {} as Record<string, { count: number; value: number }>);

      const statusColors = {
        'in_stock': '#10b981', // Green
        'low_stock': '#f59e0b', // Yellow/Orange
        'out_of_stock': '#ef4444', // Red
      };

      return Object.entries(statusData).map(([status, data]) => ({
        name: status === 'in_stock' ? 'In Stock' : 
              status === 'low_stock' ? 'Low Stock' : 'Out of Stock',
        value: data.count,
        totalValue: data.value,
        fill: statusColors[status as keyof typeof statusColors] || '#10b981',
        status,
      }));
    }

    if (chartType === 'value') {
      // Group by value ranges
      const valueRanges = inventory.reduce((acc, item) => {
        const itemValue = item.currentStock * item.unitPrice;
        let range;
        
        if (itemValue === 0) range = 'No Stock (₹0)';
        else if (itemValue < 1000) range = 'Low Value (<₹1K)';
        else if (itemValue < 5000) range = 'Medium Value (₹1K-5K)';
        else if (itemValue < 20000) range = 'High Value (₹5K-20K)';
        else range = 'Premium (>₹20K)';

        if (!acc[range]) {
          acc[range] = { count: 0, value: 0 };
        }
        acc[range].count += 1;
        acc[range].value += itemValue;
        return acc;
      }, {} as Record<string, { count: number; value: number }>);

      const valueColors = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];
      
      return Object.entries(valueRanges).map(([range, data], index) => ({
        name: range,
        value: data.count,
        totalValue: data.value,
        fill: valueColors[index % valueColors.length],
      }));
    }

    return [];
  };

  const chartData = generateChartData();

  const chartConfig = chartData.reduce((config, item, index) => {
    const key = item.name.toLowerCase().replace(/[^a-z0-9]/g, '_');
    config[key] = {
      label: item.name,
      color: item.fill,
    };
    return config;
  }, {} as ChartConfig);

  // Calculate totals
  const totalItems = inventory.length;
  const totalValue = inventory.reduce((sum, item) => sum + (item.currentStock * item.unitPrice), 0);
  const lowStockCount = inventory.filter(item => item.status === 'low_stock').length;
  const outOfStockCount = inventory.filter(item => item.status === 'out_of_stock').length;

  const getChartTitle = () => {
    switch (chartType) {
      case 'category': return 'Inventory by Category';
      case 'status': return 'Stock Status Distribution';
      case 'value': return 'Inventory by Value Range';
      default: return 'Inventory Distribution';
    }
  };

  const getChartDescription = () => {
    switch (chartType) {
      case 'category': return 'Distribution of items across different categories';
      case 'status': return 'Current stock status breakdown';
      case 'value': return 'Items grouped by inventory value ranges';
      default: return 'Inventory item distribution';
    }
  };

  if (chartData.length === 0) {
    return (
      <Card className={`flex flex-col ${className}`}>
        <CardHeader className="items-center pb-0">
          <CardTitle>{getChartTitle()}</CardTitle>
          <CardDescription>{getChartDescription()}</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 pb-0">
          <div className="flex items-center justify-center h-[300px]">
            <div className="text-center">
              <Package className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600">No inventory data available</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`flex flex-col ${className}`}>
      <CardHeader className="items-center pb-0">
        <CardTitle className="flex items-center gap-2">
          <Package className="w-5 h-5" />
          {getChartTitle()}
        </CardTitle>
        <CardDescription>{getChartDescription()}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[300px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent 
                  formatter={(value, name) => [
                    `${value} items`,
                    name
                  ]}
                  labelFormatter={(label, payload) => {
                    const data = payload?.[0]?.payload;
                    return (
                      <div className="space-y-1">
                        <div className="font-medium">{label}</div>
                        <div className="text-sm text-muted-foreground">
                          {data?.value} items • ₹{(data?.totalValue || 0).toLocaleString()}
                        </div>
                      </div>
                    );
                  }}
                />
              }
            />
            <Pie 
              data={chartData} 
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={100}
              innerRadius={40}
              paddingAngle={2}
              strokeWidth={2}
            />
            <ChartLegend
              content={<ChartLegendContent nameKey="name" />}
              className="-translate-y-2 flex-wrap gap-2 *:basis-1/4 *:justify-center"
            />
          </PieChart>
        </ChartContainer>
        
        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Package className="w-4 h-4 text-blue-500" />
              <span className="text-sm text-muted-foreground">Total Items</span>
            </div>
            <div className="text-lg font-semibold text-blue-600">{totalItems}</div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <DollarSign className="w-4 h-4 text-green-500" />
              <span className="text-sm text-muted-foreground">Total Value</span>
            </div>
            <div className="text-lg font-semibold text-green-600">₹{(totalValue / 1000).toFixed(1)}K</div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <TrendingDown className="w-4 h-4 text-yellow-500" />
              <span className="text-sm text-muted-foreground">Low Stock</span>
            </div>
            <div className="text-lg font-semibold text-yellow-600">{lowStockCount}</div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              <span className="text-sm text-muted-foreground">Out of Stock</span>
            </div>
            <div className="text-lg font-semibold text-red-600">{outOfStockCount}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
