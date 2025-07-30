"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  TrendingUp,
  ShoppingCart,
  DollarSign,
  Users,
  Clock,
  Star,
  RefreshCw,
  Loader2,
  TrendingDown,
  BarChart3,
  PieChart,
} from "lucide-react";

interface OrderStatistics {
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  averageCompletionTime: number;
  statusBreakdown: Record<string, number>;
  orderTypeBreakdown: Record<string, number>;
  popularItems: Array<{
    name: string;
    totalQuantity: number;
    totalRevenue: number;
    orderCount: number;
    averagePrice: number;
  }>;
  revenueByDay: Record<string, number>;
  ordersByDay: Record<string, number>;
  ordersByHour: Record<number, number>;
  recentOrders: Array<{
    id: string;
    customerName: string;
    total: number;
    status: string;
    orderType: string;
    tableNumber?: string;
    timestamp: string;
    itemCount: number;
  }>;
}

interface OrderStatisticsResponse {
  success: boolean;
  period: string;
  statistics: OrderStatistics;
}

export default function OrderStatisticsDashboard() {
  const [statistics, setStatistics] = useState<OrderStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("today");
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadStatistics();
  }, [period]);

  const loadStatistics = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/order-statistics?period=${period}`);
      if (response.ok) {
        const data: OrderStatisticsResponse = await response.json();
        setStatistics(data.statistics);
      } else {
        console.error("Failed to load statistics");
      }
    } catch (error) {
      console.error("Error loading statistics:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadStatistics();
    setRefreshing(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "bg-green-100 text-green-800";
      case "ready":
        return "bg-blue-100 text-blue-800";
      case "preparing":
        return "bg-yellow-100 text-yellow-800";
      case "pending":
        return "bg-orange-100 text-orange-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getPeriodLabel = (period: string) => {
    switch (period) {
      case "today":
        return "Today";
      case "week":
        return "This Week";
      case "month":
        return "This Month";
      case "all":
        return "All Time";
      default:
        return "Today";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex items-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
          <span className="text-gray-600">Loading statistics...</span>
        </div>
      </div>
    );
  }

  if (!statistics) {
    return (
      <div className="text-center p-8">
        <p className="text-gray-600">Failed to load statistics</p>
        <Button onClick={loadStatistics} className="mt-4">
          <RefreshCw className="w-4 h-4 mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Period Selection */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-gray-800">Order Statistics</h3>
          <p className="text-gray-600">
            Overview of {getPeriodLabel(period).toLowerCase()} performance
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw
              className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-blue-600">
                  {statistics.totalOrders}
                </p>
              </div>
              <ShoppingCart className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(statistics.totalRevenue)}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Average Order</p>
                <p className="text-2xl font-bold text-purple-600">
                  {formatCurrency(statistics.averageOrderValue)}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Completion Time</p>
                <p className="text-2xl font-bold text-orange-600">
                  {statistics.averageCompletionTime > 0
                    ? `${Math.round(statistics.averageCompletionTime)}m`
                    : "N/A"}
                </p>
              </div>
              <Clock className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Order Status Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="w-5 h-5 text-blue-600" />
              Order Status Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(statistics.statusBreakdown).map(
                ([status, count]) => (
                  <div
                    key={status}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(status)}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{count}</span>
                      <span className="text-sm text-gray-500">
                        (
                        {statistics.totalOrders > 0
                          ? Math.round((count / statistics.totalOrders) * 100)
                          : 0}
                        %)
                      </span>
                    </div>
                  </div>
                )
              )}
            </div>
          </CardContent>
        </Card>

        {/* Order Type Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-600" />
              Order Type Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(statistics.orderTypeBreakdown).map(
                ([type, count]) => (
                  <div key={type} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {type === "dine-in" ? "🍽️ Dine In" : "🚚 Delivery"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{count}</span>
                      <span className="text-sm text-gray-500">
                        (
                        {statistics.totalOrders > 0
                          ? Math.round((count / statistics.totalOrders) * 100)
                          : 0}
                        %)
                      </span>
                    </div>
                  </div>
                )
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Most Popular Items */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-600" />
            Most Popular Items
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 font-semibold">Rank</th>
                  <th className="text-left py-2 font-semibold">Item Name</th>
                  <th className="text-right py-2 font-semibold">
                    Quantity Sold
                  </th>
                  <th className="text-right py-2 font-semibold">Revenue</th>
                  <th className="text-right py-2 font-semibold">Orders</th>
                  <th className="text-right py-2 font-semibold">Avg Price</th>
                </tr>
              </thead>
              <tbody>
                {statistics.popularItems.slice(0, 10).map((item, index) => (
                  <tr key={item.name} className="border-b hover:bg-gray-50">
                    <td className="py-3">
                      <Badge variant={index < 3 ? "default" : "secondary"}>
                        #{index + 1}
                      </Badge>
                    </td>
                    <td className="py-3 font-medium">{item.name}</td>
                    <td className="py-3 text-right font-semibold">
                      {item.totalQuantity}
                    </td>
                    <td className="py-3 text-right text-green-600 font-semibold">
                      {formatCurrency(item.totalRevenue)}
                    </td>
                    <td className="py-3 text-right">{item.orderCount}</td>
                    <td className="py-3 text-right">
                      {formatCurrency(item.averagePrice)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-600" />
            Recent Orders
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {statistics.recentOrders.map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div>
                    <p className="font-semibold text-sm">
                      #{order.id.slice(-8)}
                    </p>
                    <p className="text-xs text-gray-600">
                      {order.customerName}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(order.status)}>
                      {order.status}
                    </Badge>
                    <Badge variant="outline">
                      {order.orderType === "dine-in"
                        ? `Table ${order.tableNumber}`
                        : "Delivery"}
                    </Badge>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-emerald-600">
                    {formatCurrency(order.total)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {order.itemCount} items • {formatDate(order.timestamp)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
