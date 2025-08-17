"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  TrendingUp as TrendingUpIcon,
  BarChart,
  RefreshCw,
  DollarSign,
  ShoppingCart,
  Users,
  Clock,
  Calendar,
  Loader2,
  UserCheck,
  Star,
  Timer,
  Award,
  Package,
} from "lucide-react";
import InventoryAnalyticsDashboard from "@/components/inventory-analytics-dashboard";
import {
  AreaChart,
  Area,
  BarChart as RechartsBarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface AnalyticsData {
  revenue: Array<{ date: string; amount: number; orders: number }>;
  topProducts: Array<{ name: string; revenue: number; orders: number; color: string }>;
  hourlyData: Array<{ hour: string; orders: number; revenue: number }>;
  categoryBreakdown: Array<{ category: string; percentage: number; value: number }>;
  metrics: {
    totalRevenue: number;
    totalOrders: number;
    avgOrderValue: number;
    conversionRate: number;
  };
}

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
  isPaid?: boolean;
  discountPercentage?: number;
  finalPrice?: number;
  paymentMethods?: string[];
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

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

export default function DetailedAnalytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [inventoryData, setInventoryData] = useState<InventoryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [animationKey, setAnimationKey] = useState(0);
  const [animationId, setAnimationId] = useState(Date.now());
  const [period, setPeriod] = useState("week");
  const [dayPeriod, setDayPeriod] = useState("all");

  // Fetch inventory data
  const fetchInventoryData = useCallback(async () => {
    try {
      const response = await fetch('/api/inventory');
      if (response.ok) {
        const data = await response.json();
        setInventoryData(data);
      } else {
        console.error('Failed to fetch inventory data');
      }
    } catch (error) {
      console.error('Error fetching inventory:', error);
    }
  }, []);

  const fetchData = useCallback(async (showRefreshLoader = false) => {
    try {
      if (showRefreshLoader) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      // Fetch both analytics and inventory data
      await Promise.all([
        (async () => {
          // Simulate API call - replace with your actual endpoint
          const response = await fetch(`/api/detailed-analytics?period=${period}&dayPeriod=${dayPeriod}`);
          
          let analyticsData: AnalyticsData;
          
          if (response.ok) {
            analyticsData = await response.json();
          } else {
            // Mock data that varies based on filters for demonstration
            const getVariedData = () => {
              const baseMultiplier = dayPeriod === "morning" ? 0.7 : dayPeriod === "evening" ? 1.3 : 1;
              const periodMultiplier = 
                period === "today" ? 0.3 : 
                period === "week" ? 1 : 
                period === "month" ? 3 : 12;
              
              const multiplier = baseMultiplier * periodMultiplier;
              
              return {
                revenue: [
                  { date: "Mon", amount: Math.round(2400 * multiplier), orders: Math.round(24 * multiplier) },
                  { date: "Tue", amount: Math.round(1398 * multiplier), orders: Math.round(18 * multiplier) },
                  { date: "Wed", amount: Math.round(9800 * multiplier), orders: Math.round(45 * multiplier) },
                  { date: "Thu", amount: Math.round(3908 * multiplier), orders: Math.round(32 * multiplier) },
                  { date: "Fri", amount: Math.round(4800 * multiplier), orders: Math.round(38 * multiplier) },
                  { date: "Sat", amount: Math.round(3800 * multiplier), orders: Math.round(28 * multiplier) },
                  { date: "Sun", amount: Math.round(4300 * multiplier), orders: Math.round(35 * multiplier) },
                ],
                topProducts: [
                  { name: "Coffee Latte", revenue: Math.round(4500 * multiplier), orders: Math.round(120 * multiplier), color: COLORS[0] },
                  { name: "Chicken Burger", revenue: Math.round(3200 * multiplier), orders: Math.round(80 * multiplier), color: COLORS[1] },
                  { name: "Caesar Salad", revenue: Math.round(2800 * multiplier), orders: Math.round(95 * multiplier), color: COLORS[2] },
                  { name: "Pasta Alfredo", revenue: Math.round(2100 * multiplier), orders: Math.round(65 * multiplier), color: COLORS[3] },
                  { name: "Fresh Juice", revenue: Math.round(1800 * multiplier), orders: Math.round(150 * multiplier), color: COLORS[4] },
                ],
                hourlyData: dayPeriod === "morning" ? [
                  { hour: "6AM", orders: Math.round(8 * multiplier), revenue: Math.round(240 * multiplier) },
                  { hour: "7AM", orders: Math.round(15 * multiplier), revenue: Math.round(450 * multiplier) },
                  { hour: "8AM", orders: Math.round(25 * multiplier), revenue: Math.round(750 * multiplier) },
                  { hour: "9AM", orders: Math.round(30 * multiplier), revenue: Math.round(900 * multiplier) },
                  { hour: "10AM", orders: Math.round(35 * multiplier), revenue: Math.round(1050 * multiplier) },
                  { hour: "11AM", orders: Math.round(40 * multiplier), revenue: Math.round(1200 * multiplier) },
                ] : dayPeriod === "evening" ? [
                  { hour: "5PM", orders: Math.round(25 * multiplier), revenue: Math.round(750 * multiplier) },
                  { hour: "6PM", orders: Math.round(40 * multiplier), revenue: Math.round(1200 * multiplier) },
                  { hour: "7PM", orders: Math.round(45 * multiplier), revenue: Math.round(1350 * multiplier) },
                  { hour: "8PM", orders: Math.round(35 * multiplier), revenue: Math.round(1050 * multiplier) },
                  { hour: "9PM", orders: Math.round(20 * multiplier), revenue: Math.round(600 * multiplier) },
                  { hour: "10PM", orders: Math.round(10 * multiplier), revenue: Math.round(300 * multiplier) },
                ] : [
                  { hour: "6AM", orders: Math.round(5 * multiplier), revenue: Math.round(150 * multiplier) },
                  { hour: "8AM", orders: Math.round(15 * multiplier), revenue: Math.round(450 * multiplier) },
                  { hour: "10AM", orders: Math.round(25 * multiplier), revenue: Math.round(750 * multiplier) },
                  { hour: "12PM", orders: Math.round(45 * multiplier), revenue: Math.round(1350 * multiplier) },
                  { hour: "2PM", orders: Math.round(35 * multiplier), revenue: Math.round(1050 * multiplier) },
                  { hour: "4PM", orders: Math.round(20 * multiplier), revenue: Math.round(600 * multiplier) },
                  { hour: "6PM", orders: Math.round(40 * multiplier), revenue: Math.round(1200 * multiplier) },
                  { hour: "8PM", orders: Math.round(30 * multiplier), revenue: Math.round(900 * multiplier) },
                  { hour: "10PM", orders: Math.round(10 * multiplier), revenue: Math.round(300 * multiplier) },
                ],
                categoryBreakdown: [
                  { category: "Beverages", percentage: dayPeriod === "morning" ? 45 : 35, value: Math.round(8500 * multiplier) },
                  { category: "Main Course", percentage: dayPeriod === "evening" ? 50 : 40, value: Math.round(9600 * multiplier) },
                  { category: "Desserts", percentage: 15, value: Math.round(3600 * multiplier) },
                  { category: "Appetizers", percentage: dayPeriod === "evening" ? 15 : 10, value: Math.round(2400 * multiplier) },
                ],
                metrics: {
                  totalRevenue: Math.round(24100 * multiplier),
                  totalOrders: Math.round(340 * multiplier),
                  avgOrderValue: Math.round(70.88 * baseMultiplier * 100) / 100,
                  conversionRate: Math.round((12.5 * baseMultiplier) * 10) / 10,
                },
              };
            };
            
            analyticsData = getVariedData();
          }

          setData(analyticsData);
        }),
        fetchInventoryData()
      ]);

      // Trigger animation by incrementing key and updating animation ID
      setAnimationKey(prev => prev + 1);
      setAnimationId(Date.now());
    } catch (error) {
      console.error("Error fetching detailed analytics:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [period, dayPeriod]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRefresh = () => {
    fetchData(true);
  };

  const handlePeriodChange = (newPeriod: string) => {
    setPeriod(newPeriod);
  };

  const handleDayPeriodChange = (newDayPeriod: string) => {
    setDayPeriod(newDayPeriod);
  };

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString()}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex items-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          <span className="text-gray-600">Loading detailed analytics...</span>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center p-8">
        <p className="text-gray-600 mb-4">Failed to load analytics data</p>
        <Button onClick={() => fetchData()} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">
      {/* Header with Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
            <BarChart className="w-8 h-8 text-blue-600" />
            Detailed Analytics
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Comprehensive insights and performance metrics
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={period} onValueChange={handlePeriodChange}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Time Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
            </SelectContent>
          </Select>
          <Select value={dayPeriod} onValueChange={handleDayPeriodChange}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Day Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  All Day
                </div>
              </SelectItem>
              <SelectItem value="morning">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-yellow-400" />
                  Morning
                </div>
              </SelectItem>
              <SelectItem value="evening">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-orange-500" />
                  Evening
                </div>
              </SelectItem>
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

      {/* Waiter's Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-teal-600" />
            Waiter's Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-lg">
              <div className="flex items-center gap-3">
                <Star className="w-8 h-8 text-yellow-500" />
                <div>
                  <p className="text-sm text-gray-600">Top Waiter</p>
                  <p className="text-lg font-bold text-gray-800">John Doe</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg">
              <div className="flex items-center gap-3">
                <Timer className="w-8 h-8 text-blue-500" />
                <div>
                  <p className="text-sm text-gray-600">Avg Service Time</p>
                  <p className="text-lg font-bold text-gray-800">4.2 min</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg">
              <div className="flex items-center gap-3">
                <Award className="w-8 h-8 text-green-500" />
                <div>
                  <p className="text-sm text-gray-600">Customer Rating</p>
                  <p className="text-lg font-bold text-gray-800">4.8/5</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg">
              <div className="flex items-center gap-3">
                <Users className="w-8 h-8 text-purple-500" />
                <div>
                  <p className="text-sm text-gray-600">Tables Served</p>
                  <p className="text-lg font-bold text-gray-800">142</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Revenue</p>
                <p className="text-3xl font-bold text-green-600">
                  {formatCurrency(data.metrics.totalRevenue)}
                </p>
              </div>
              <DollarSign className="w-10 h-10 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Orders</p>
                <p className="text-3xl font-bold text-blue-600">
                  {data.metrics.totalOrders}
                </p>
              </div>
              <ShoppingCart className="w-10 h-10 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Avg Order Value</p>
                <p className="text-3xl font-bold text-purple-600">
                  {formatCurrency(data.metrics.avgOrderValue)}
                </p>
              </div>
              <TrendingUpIcon className="w-10 h-10 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Conversion Rate</p>
                <p className="text-3xl font-bold text-orange-600">
                  {data.metrics.conversionRate}%
                </p>
              </div>
              <Users className="w-10 h-10 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUpIcon className="w-5 h-5 text-green-600" />
            Revenue Trend
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                key={`revenue-${animationId}-${animationKey}`}
                data={data.revenue}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip
                  formatter={[
                    (value: number) => [formatCurrency(value), "Revenue"],
                    (value: number) => [value, "Orders"],
                  ]}
                  labelStyle={{ color: "#374151" }}
                  contentStyle={{
                    backgroundColor: "#f9fafb",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="amount"
                  stroke="#10b981"
                  fill="#10b981"
                  fillOpacity={0.3}
                  name="Revenue"
                  animationDuration={1500}
                  animationBegin={0}
                  isAnimationActive={true}
                />
                <Line
                  type="monotone"
                  dataKey="orders"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  name="Orders"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart className="w-5 h-5 text-blue-600" />
              Top Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsBarChart
                  key={`products-${animationId}-${animationKey}`}
                  data={data.topProducts}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis
                    dataKey="name"
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    fontSize={12}
                  />
                  <YAxis />
                  <Tooltip
                    formatter={[
                      (value: number) => [formatCurrency(value), "Revenue"],
                      (value: number) => [value, "Orders"],
                    ]}
                    labelStyle={{ color: "#374151" }}
                    contentStyle={{
                      backgroundColor: "#f9fafb",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                  <Bar
                    dataKey="revenue"
                    fill="#3b82f6"
                    name="Revenue"
                    animationDuration={1200}
                    animationBegin={200}
                    isAnimationActive={true}
                  />
                </RechartsBarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Category Breakdown Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-gradient-to-r from-blue-500 to-purple-500" />
              Category Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart key={`category-${animationId}-${animationKey}`}>
                  <Pie
                    data={data.categoryBreakdown}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ category, percentage }) => `${category} (${percentage}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    animationDuration={1000}
                    animationBegin={400}
                    isAnimationActive={true}
                  >
                    {data.categoryBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={[(value: number) => [formatCurrency(value), "Revenue"]]}
                    contentStyle={{
                      backgroundColor: "#f9fafb",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Inventory Analytics Dashboard */}
      {inventoryData && (
        <InventoryAnalyticsDashboard 
          inventoryData={inventoryData} 
          onRefresh={fetchInventoryData}
        />
      )}

      {/* Waiter's Performance Analytics (Duplicate) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-teal-600" />
            Waiter's Performance Analytics (Second View)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-lg">
              <div className="flex items-center gap-3">
                <Star className="w-8 h-8 text-yellow-500" />
                <div>
                  <p className="text-sm text-gray-600">Top Waiter</p>
                  <p className="text-lg font-bold text-gray-800">John Doe</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg">
              <div className="flex items-center gap-3">
                <Timer className="w-8 h-8 text-blue-500" />
                <div>
                  <p className="text-sm text-gray-600">Avg Service Time</p>
                  <p className="text-lg font-bold text-gray-800">4.2 min</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg">
              <div className="flex items-center gap-3">
                <Award className="w-8 h-8 text-green-500" />
                <div>
                  <p className="text-sm text-gray-600">Customer Rating</p>
                  <p className="text-lg font-bold text-gray-800">4.8/5</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg">
              <div className="flex items-center gap-3">
                <Users className="w-8 h-8 text-purple-500" />
                <div>
                  <p className="text-sm text-gray-600">Tables Served</p>
                  <p className="text-lg font-bold text-gray-800">142</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Hourly Performance Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-600" />
            Hourly Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                key={`hourly-${animationId}-${animationKey}`}
                data={data.hourlyData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="hour" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip
                  formatter={[
                    (value: number) => [value, "Orders"],
                    (value: number) => [formatCurrency(value), "Revenue"],
                  ]}
                  labelStyle={{ color: "#374151" }}
                  contentStyle={{
                    backgroundColor: "#f9fafb",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="orders"
                  stroke="#8884d8"
                  strokeWidth={3}
                  name="Orders"
                  animationDuration={1800}
                  animationBegin={600}
                  isAnimationActive={true}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="revenue"
                  stroke="#82ca9d"
                  strokeWidth={3}
                  name="Revenue"
                  animationDuration={1800}
                  animationBegin={800}
                  isAnimationActive={true}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

