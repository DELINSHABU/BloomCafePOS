"use client"

import { TrendingUp, Package } from "lucide-react"
import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

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

interface SupplierRadarChartProps {
  inventory: InventoryItem[];
}

const chartConfig = {
  orders: {
    label: "Orders",
    color: "hsl(var(--chart-1))",
  },
  value: {
    label: "Value (₹K)",
    color: "hsl(var(--chart-2))",
  },
  items: {
    label: "Items",
    color: "hsl(var(--chart-3))",
  },
} satisfies ChartConfig

export function SupplierRadarChart({ inventory }: SupplierRadarChartProps) {
  // Process supplier data
  const supplierData = Object.entries(
    inventory.reduce((acc, item) => {
      if (!acc[item.supplier]) {
        acc[item.supplier] = {
          orders: 0,
          value: 0,
          items: 0,
          performance: 0
        };
      }
      acc[item.supplier].orders += 1;
      acc[item.supplier].value += item.currentStock * item.unitPrice;
      acc[item.supplier].items += item.currentStock;
      
      // Calculate performance score (100 - percentage of low stock items)
      const supplierItems = inventory.filter(i => i.supplier === item.supplier);
      const lowStockItems = supplierItems.filter(i => i.status === 'low_stock' || i.status === 'out_of_stock').length;
      acc[item.supplier].performance = Math.max(0, 100 - (lowStockItems / supplierItems.length) * 100);
      
      return acc;
    }, {} as Record<string, { orders: number; value: number; items: number; performance: number }>)
  );

  // Get top 6 suppliers by orders and normalize data for radar chart
  const maxOrders = Math.max(...supplierData.map(([, data]) => data.orders));
  const maxValue = Math.max(...supplierData.map(([, data]) => data.value));
  const maxItems = Math.max(...supplierData.map(([, data]) => data.items));

  const chartData = supplierData
    .sort(([,a], [,b]) => b.orders - a.orders)
    .slice(0, 6)
    .map(([supplier, data]) => ({
      supplier: supplier.length > 12 ? supplier.substring(0, 12) + '...' : supplier,
      fullName: supplier,
      orders: Math.round((data.orders / maxOrders) * 100), // Normalize to 0-100
      value: Math.round((data.value / maxValue) * 100), // Normalize to 0-100
      items: Math.round((data.items / maxItems) * 100), // Normalize to 0-100
      rawOrders: data.orders,
      rawValue: data.value,
      rawItems: data.items,
      performance: Math.round(data.performance)
    }));

  const totalOrders = supplierData.reduce((sum, [, data]) => sum + data.orders, 0);
  const totalValue = supplierData.reduce((sum, [, data]) => sum + data.value, 0);

  return (
    <Card>
      <CardHeader className="items-center pb-4">
        <CardTitle className="flex items-center gap-2">
          <Package className="w-5 h-5" />
          Supplier Analysis - Radar Chart
        </CardTitle>
        <CardDescription>
          Performance comparison across top suppliers
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[300px]"
        >
          <RadarChart data={chartData}>
            <ChartTooltip
              cursor={false}
              content={({ active, payload }) => {
                if (active && payload && payload.length > 0) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-white p-3 border rounded-lg shadow-lg">
                      <p className="font-medium">{data.fullName}</p>
                      <div className="mt-2 space-y-1">
                        <div className="flex justify-between gap-4">
                          <span className="text-blue-600">Orders:</span>
                          <span className="font-medium">{data.rawOrders}</span>
                        </div>
                        <div className="flex justify-between gap-4">
                          <span className="text-green-600">Value:</span>
                          <span className="font-medium">₹{data.rawValue.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between gap-4">
                          <span className="text-purple-600">Items:</span>
                          <span className="font-medium">{data.rawItems}</span>
                        </div>
                        <div className="flex justify-between gap-4">
                          <span className="text-orange-600">Performance:</span>
                          <span className="font-medium">{data.performance}%</span>
                        </div>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <PolarGrid gridType="circle" />
            <PolarAngleAxis dataKey="supplier" />
            
            {/* Orders Radar */}
            <Radar
              dataKey="orders"
              stroke="hsl(var(--chart-1))"
              fill="hsl(var(--chart-1))"
              fillOpacity={0.1}
              strokeWidth={2}
              dot={{
                r: 3,
                fillOpacity: 1,
              }}
            />
            
            {/* Value Radar */}
            <Radar
              dataKey="value"
              stroke="hsl(var(--chart-2))"
              fill="hsl(var(--chart-2))"
              fillOpacity={0.1}
              strokeWidth={2}
              dot={{
                r: 3,
                fillOpacity: 1,
              }}
            />
            
            {/* Items Radar */}
            <Radar
              dataKey="items"
              stroke="hsl(var(--chart-3))"
              fill="hsl(var(--chart-3))"
              fillOpacity={0.1}
              strokeWidth={2}
              dot={{
                r: 3,
                fillOpacity: 1,
              }}
            />
          </RadarChart>
        </ChartContainer>
        
        {/* Legend */}
        <div className="flex justify-center gap-6 mt-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-chart-1 rounded-full"></div>
            <span>Orders</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-chart-2 rounded-full"></div>
            <span>Value</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-chart-3 rounded-full"></div>
            <span>Items</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 leading-none font-medium">
          Total {totalOrders} orders worth ₹{(totalValue/1000).toFixed(1)}K
          <TrendingUp className="h-4 w-4" />
        </div>
        <div className="text-muted-foreground flex items-center gap-2 leading-none">
          Top {chartData.length} suppliers by order count
        </div>
      </CardFooter>
    </Card>
  )
}
