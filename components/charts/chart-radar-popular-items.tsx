"use client"

import { TrendingUp } from "lucide-react"
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

export const description = "A radar chart showing most popular items"

const chartConfig = {
  quantity: {
    label: "Quantity Sold",
    color: "var(--chart-1)",
  },
  revenue: {
    label: "Revenue",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig

interface PopularItem {
  name: string;
  totalQuantity: number;
  totalRevenue: number;
  orderCount: number;
  averagePrice: number;
}

interface ChartRadarPopularItemsProps {
  popularItems: PopularItem[];
  className?: string;
  key?: number;
  filterDescription?: string;
}

export function ChartRadarPopularItems({ popularItems, className, filterDescription }: ChartRadarPopularItemsProps) {
  // Transform the data to show top 8 items for better radar visualization
  const radarData = popularItems
    .slice(0, 8)
    .map((item) => ({
      item: item.name.length > 15 ? `${item.name.slice(0, 15)}...` : item.name,
      fullName: item.name,
      quantity: item.totalQuantity,
      // Scale revenue for better radar visualization (divide by 100 for proportional display)
      revenue: Math.round(item.totalRevenue / 100),
      orders: item.orderCount,
      originalRevenue: item.totalRevenue,
    }));

  // Calculate trends
  const totalQuantity = popularItems.reduce((sum, item) => sum + item.totalQuantity, 0);
  const totalRevenue = popularItems.reduce((sum, item) => sum + item.totalRevenue, 0);
  const averageOrders = popularItems.reduce((sum, item) => sum + item.orderCount, 0) / popularItems.length;

  return (
    <Card className={className}>
      <CardHeader className="items-center pb-4">
        <CardTitle>Most Popular Items</CardTitle>
        <CardDescription>
          Top performing items by quantity sold and revenue generated
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[300px]"
        >
          <RadarChart data={radarData}>
            <ChartTooltip 
              cursor={false} 
              content={<ChartTooltipContent 
                formatter={(value, name, props) => {
                  if (name === 'quantity') {
                    return [`${value} units`, 'Quantity Sold'];
                  }
                  if (name === 'revenue') {
                    const originalRevenue = props.payload?.originalRevenue || 0;
                    return [`₹${originalRevenue.toLocaleString()}`, 'Revenue'];
                  }
                  return [value, name];
                }}
                labelFormatter={(label, payload) => {
                  const item = payload?.[0]?.payload;
                  return item?.fullName || label;
                }}
              />} 
            />
            <PolarAngleAxis 
              dataKey="item" 
              tick={{ fontSize: 10 }}
              className="text-xs"
            />
            <PolarGrid />
            <Radar
              dataKey="quantity"
              fill="var(--color-quantity)"
              fillOpacity={0.3}
              stroke="var(--color-quantity)"
              strokeWidth={2}
            />
            <Radar
              dataKey="revenue"
              fill="var(--color-revenue)"
              fillOpacity={0.1}
              stroke="var(--color-revenue)"
              strokeWidth={2}
              strokeDasharray="5 5"
            />
          </RadarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        {/* Legend */}
        <div className="flex items-center justify-center gap-6 w-full mb-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-chart-1 rounded-full"></div>
            <span className="text-xs">Quantity (units)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 border-2 border-chart-2 rounded-full" style={{borderStyle: 'dashed'}}></div>
            <span className="text-xs">Revenue (₹/100)</span>
          </div>
        </div>
        
        {/* Stats Summary */}
        <div className="grid grid-cols-3 gap-4 w-full text-center border-t pt-2">
          <div>
            <div className="text-xs text-muted-foreground">Total Items</div>
            <div className="font-semibold">{totalQuantity}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Total Revenue</div>
            <div className="font-semibold">₹{(totalRevenue / 1000).toFixed(1)}k</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Avg Orders</div>
            <div className="font-semibold">{Math.round(averageOrders)}</div>
          </div>
        </div>

        <div className="flex items-center gap-2 leading-none font-medium">
          Popular items trending up by 15.2% this month <TrendingUp className="h-4 w-4" />
        </div>
        <div className="text-muted-foreground flex items-center gap-2 leading-none">
          Showing top 8 most popular items by sales volume
        </div>
      </CardFooter>
    </Card>
  )
}
