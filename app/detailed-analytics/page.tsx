"use client";

import React, { useState, useEffect } from "react";
import { TrendingUp, Crown, User, LogOut, Filter, Calendar, Settings, Zap, RefreshCw } from "lucide-react";
import { Pie, PieChart, CartesianGrid, Line, LineChart, XAxis, Bar, BarChart, LabelList, YAxis } from "recharts";
import { ThemeToggle } from "@/components/theme-toggle";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { ChartRadarPopularItems } from "@/components/charts/chart-radar-popular-items";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

export const description = "A pie chart with a label";

// Analytics data state interface
interface AnalyticsData {
  lastUpdated: string;
  fullRecord: {
    totalOrders: number;
    totalRevenue: number;
    orders: any[];
  };
  ordersOverTime: Array<{
    month: string;
    orders: number;
    revenue: number;
    john: number;
    emily: number;
    mike: number;
    sarah: number;
    david: number;
    customer: number;
  }>;
  revenueAnalytics: {
    totalRevenue: number;
    revenueByStaff: Record<string, number>;
    revenueByMonth: Record<string, any>;
    revenueByDay: Record<string, number>;
    averageOrderValue: number;
  };
  dailyAnalytics: {
    morning: { orders: number; revenue: number; staffBreakdown: Record<string, any> };
    noon: { orders: number; revenue: number; staffBreakdown: Record<string, any> };
    night: { orders: number; revenue: number; staffBreakdown: Record<string, any> };
    fullDay: { orders: number; revenue: number; staffBreakdown: Record<string, any> };
  };
  popularItems: Array<{
    name: string;
    totalQuantity: number;
    totalRevenue: number;
    orderCount: number;
    averagePrice: number;
  }>;
}

// Colors for consistency
const STAFF_COLORS = {
  "John Smith": "#3b82f6", // Blue
  "Emily Davis": "#10b981", // Green
  "Mike Wilson": "#f59e0b", // Amber
  "Sarah Johnson": "#ef4444", // Red
  "David Brown": "#8b5cf6", // Purple
  "Lisa Garcia": "#f97316", // Orange
  "Tom Anderson": "#06b6d4", // Cyan
  "Customer Orders": "#6b7280", // Grey
};

// Analytics data loading function
const loadAnalyticsData = async (): Promise<AnalyticsData> => {
  const response = await fetch('/api/analytics');
  return await response.json();
};

// Data for different time periods
const dailyData = {
  morning: [
    { type: "John - Assisted Orders", orders: 8, fill: "#3b82f6" },
    { type: "Emily - Assisted Orders", orders: 10, fill: "#10b981" },
    { type: "Mike - Assisted Orders", orders: 12, fill: "#f59e0b" },
    { type: "Sarah - Assisted Orders", orders: 4, fill: "#ef4444" },
    { type: "David - Assisted Orders", orders: 6, fill: "#8b5cf6" },
    { type: "Customer Orders", orders: 25, fill: "#6b7280" },
  ],
  noon: [
    { type: "John - Assisted Orders", orders: 15, fill: "#3b82f6" },
    { type: "Emily - Assisted Orders", orders: 18, fill: "#10b981" },
    { type: "Mike - Assisted Orders", orders: 22, fill: "#f59e0b" },
    { type: "Sarah - Assisted Orders", orders: 8, fill: "#ef4444" },
    { type: "David - Assisted Orders", orders: 12, fill: "#8b5cf6" },
    { type: "Customer Orders", orders: 45, fill: "#6b7280" },
  ],
  night: [
    { type: "John - Assisted Orders", orders: 12, fill: "#3b82f6" },
    { type: "Emily - Assisted Orders", orders: 14, fill: "#10b981" },
    { type: "Mike - Assisted Orders", orders: 18, fill: "#f59e0b" },
    { type: "Sarah - Assisted Orders", orders: 6, fill: "#ef4444" },
    { type: "David - Assisted Orders", orders: 9, fill: "#8b5cf6" },
    { type: "Customer Orders", orders: 35, fill: "#6b7280" },
  ],
  fullDay: [
    { type: "John - Assisted Orders", orders: 35, fill: "#3b82f6" },
    { type: "Emily - Assisted Orders", orders: 42, fill: "#10b981" },
    { type: "Mike - Assisted Orders", orders: 52, fill: "#f59e0b" },
    { type: "Sarah - Assisted Orders", orders: 18, fill: "#ef4444" },
    { type: "David - Assisted Orders", orders: 27, fill: "#8b5cf6" },
    { type: "Customer Orders", orders: 105, fill: "#6b7280" },
  ]
};

// Colors matching line chart style for consistency
const pieChartData = [
  { type: "John - Assisted Orders", orders: 20, fill: "#3b82f6" }, // Blue
  { type: "Emily - Assisted Orders", orders: 25, fill: "#10b981" }, // Green
  { type: "Mike - Assisted Orders", orders: 30, fill: "#f59e0b" }, // Amber
  { type: "Sarah - Assisted Orders", orders: 10, fill: "#ef4444" }, // Red
  { type: "David - Assisted Orders", orders: 15, fill: "#8b5cf6" }, // Purple
  { type: "Customer Orders", orders: 65, fill: "#6b7280" }, // Grey
];




const pieChartConfig = {
  orders: {
    label: "Orders",
  },
  assisted: {
    label: "Assisted Orders",
    color: "#3b82f6", // Blue similar to John
  },
  customer: {
    label: "Customer Orders",
    color: "#6b7280", // Grey color
  },
} satisfies ChartConfig;

const lineChartConfig = {
  john: {
    label: "John",
    color: "hsl(var(--chart-1))",
  },
  emily: {
    label: "Emily",
    color: "hsl(var(--chart-2))",
  },
  mike: {
    label: "Mike",
    color: "hsl(var(--chart-3))",
  },
  sarah: {
    label: "Sarah",
    color: "hsl(var(--chart-4))",
  },
  david: {
    label: "David",
    color: "hsl(var(--chart-5))",
  },
  customer: {
    label: "Customer Orders",
    color: "#6b7280", // Grey color
  },
} satisfies ChartConfig;

const barChartConfig = {
  revenue: {
    label: "Revenue",
    color: "hsl(var(--chart-2))",
  },
  label: {
    color: "hsl(var(--background))",
  },
} satisfies ChartConfig;

export default function DetailedAnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [filterMode, setFilterMode] = useState<"simple" | "advanced">("simple");
  const [timePeriod, setTimePeriod] = useState("fullRecord");
  const [dayPeriod, setDayPeriod] = useState("fullDay");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [startDate, setStartDate] = useState<Date | undefined>(new Date());
  const [endDate, setEndDate] = useState<Date | undefined>(new Date());
  const [isLoading, setIsLoading] = useState(false);
  const [animateCharts, setAnimateCharts] = useState(false);
  const [chartKey, setChartKey] = useState(0);

  // Waiter Performance Analytics separate filters
  const [waiterFilterMode, setWaiterFilterMode] = useState<"simple" | "advanced">("simple");
  const [waiterTimePeriod, setWaiterTimePeriod] = useState("fullRecord");
  const [waiterDayPeriod, setWaiterDayPeriod] = useState("fullDay");
  const [waiterPriority, setWaiterPriority] = useState("orders");
  const [waiterStartDate, setWaiterStartDate] = useState<Date | undefined>(new Date());
  const [waiterEndDate, setWaiterEndDate] = useState<Date | undefined>(new Date());

  // Chart data states, initialized with static data and updated from API
  const [lineChartData, setLineChartData] = useState([
    { month: "January", john: 18, emily: 22, mike: 28, sarah: 8, david: 12, customer: 45 },
    { month: "February", john: 25, emily: 30, mike: 35, sarah: 15, david: 18, customer: 65 },
    { month: "March", john: 22, emily: 28, mike: 32, sarah: 12, david: 16, customer: 58 },
    { month: "April", john: 15, emily: 20, mike: 25, sarah: 18, david: 22, customer: 72 },
    { month: "May", john: 28, emily: 35, mike: 40, sarah: 20, david: 25, customer: 68 },
    { month: "June", john: 20, emily: 25, mike: 30, sarah: 10, david: 15, customer: 55 },
  ]);
  const [revenueData, setRevenueData] = useState([
    { person: "Customer Orders", revenue: 154200, fill: "#6b7280" },
    { person: "Mike", revenue: 89500, fill: "#f59e0b" },
    { person: "Emily", revenue: 72500, fill: "#10b981" },
    { person: "John", revenue: 61800, fill: "#3b82f6" },
    { person: "David", revenue: 48900, fill: "#8b5cf6" },
    { person: "Sarah", revenue: 32400, fill: "#ef4444" },
  ]);

  const isSingleDay = (filterMode === 'advanced' && startDate && endDate && startDate.getTime() === endDate.getTime()) || timePeriod === 'oneDay';
  const isDateRange = filterMode === 'advanced' && startDate && endDate && startDate < endDate;
  
  // Waiter Performance specific conditions
  const waiterIsSingleDay = (waiterFilterMode === 'advanced' && waiterStartDate && waiterEndDate && waiterStartDate.getTime() === waiterEndDate.getTime()) || waiterTimePeriod === 'oneDay';
  const waiterIsDateRange = waiterFilterMode === 'advanced' && waiterStartDate && waiterEndDate && waiterStartDate < waiterEndDate;

  // Initial animation trigger on component mount
  useEffect(() => {
    setChartKey(1);
    setAnimateCharts(true);
  }, []);

  // Fetch data whenever filters change
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setAnimateCharts(false);
      
      try {
        const data = await loadAnalyticsData();
        setAnalyticsData(data); // Store the fetched data

        // Update chart data from the fetched analytics data
        if (data) {
          // Orders Over Time (Line Chart)
          if (isDateRange) {
            const dateArray = [];
            let currentDate = new Date(startDate!);
            while (currentDate <= endDate!) {
              // NOTE: This is simulated data. In a real app, this data would come from the API.
              dateArray.push({
                date: currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                john: Math.floor(Math.random() * 10 + 5),
                emily: Math.floor(Math.random() * 10 + 5),
                mike: Math.floor(Math.random() * 15 + 5),
                sarah: Math.floor(Math.random() * 8 + 4),
                david: Math.floor(Math.random() * 9 + 4),
                customer: Math.floor(Math.random() * 25 + 10),
              });
              currentDate.setDate(currentDate.getDate() + 1);
            }
            setLineChartData(dateArray as any);
          } else if (isSingleDay) {
            const dailyAnalytics = data.dailyAnalytics;
            const dailyLineData = ['morning', 'noon', 'night'].map((period) => {
              const periodKey = period as keyof typeof dailyAnalytics;
              const entry: { [key: string]: string | number } = { time: period.charAt(0).toUpperCase() + period.slice(1) };
              const staffBreakdown = dailyAnalytics[periodKey].staffBreakdown;
              Object.keys(staffBreakdown).forEach((staffName) => {
                const shortName = staffName.split(' ')[0].toLowerCase();
                entry[shortName] = staffBreakdown[staffName].orders;
              });
              return entry;
            });
            setLineChartData(dailyLineData);
          } else {
            setLineChartData(data.ordersOverTime);
          }

          // Revenue Analytics (Bar Chart)
          if (isDateRange) {
            // For date ranges, simulate daily revenue data (in a real app, this would come from the API)
            const simulatedRevenueData = [
              { person: "Customer Orders", revenue: Math.floor(Math.random() * 5000 + 2000), fill: "#6b7280" },
              { person: "Mike", revenue: Math.floor(Math.random() * 3000 + 1000), fill: "#f59e0b" },
              { person: "Emily", revenue: Math.floor(Math.random() * 2500 + 800), fill: "#10b981" },
              { person: "John", revenue: Math.floor(Math.random() * 2000 + 600), fill: "#3b82f6" },
              { person: "David", revenue: Math.floor(Math.random() * 1800 + 500), fill: "#8b5cf6" },
              { person: "Sarah", revenue: Math.floor(Math.random() * 1500 + 400), fill: "#ef4444" },
            ];
            setRevenueData(simulatedRevenueData);
          } else if (isSingleDay) {
            // For single day, use daily revenue breakdown from API
            const period = timePeriod === 'oneDay' ? dayPeriod as keyof typeof data.dailyAnalytics : 'fullDay';
            const periodData = data.dailyAnalytics[period].staffBreakdown;
            const dailyRevenueData = Object.keys(periodData).map((key) => ({
              person: key === 'Customer Orders' ? key : key.split(' ')[0],
              revenue: periodData[key].revenue || Math.floor(Math.random() * 2000 + 500),
              fill: STAFF_COLORS[key as keyof typeof STAFF_COLORS] || "#6b7280",
            }));
            setRevenueData(dailyRevenueData);
          } else {
            // For monthly/full record, use overall revenue data from API
            const formattedRevenueData = Object.entries(
              data.revenueAnalytics.revenueByStaff
            ).map(([person, revenue]) => ({
              person,
              revenue,
              fill: STAFF_COLORS[person as keyof typeof STAFF_COLORS] || "#6b7280",
            }));
            setRevenueData(formattedRevenueData);
          }
        }

        console.log('Analytics data loaded:', data);
      } catch (error) {
        console.error('Error fetching analytics data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [timePeriod, dayPeriod, startDate, endDate, filterMode, isDateRange, isSingleDay]);

  // Trigger animations after data fetch
  useEffect(() => {
    if (!isLoading && analyticsData) {
      const timer = setTimeout(() => {
        setChartKey(prevKey => prevKey + 1);
        setAnimateCharts(true);
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isLoading, analyticsData]);

  // Fetch fresh data whenever waiter-specific filters change (including priority)
  useEffect(() => {
    const fetchWaiterData = async () => {
      // Fetch if waiter filters are different from main filters, in advanced mode, or priority changed
      const shouldFetch = 
        waiterFilterMode !== filterMode ||
        waiterTimePeriod !== timePeriod ||
        waiterDayPeriod !== dayPeriod ||
        waiterPriority || // Always fetch when priority changes
        (waiterFilterMode === 'advanced' && (
          waiterStartDate?.getTime() !== startDate?.getTime() ||
          waiterEndDate?.getTime() !== endDate?.getTime()
        ));

      if (shouldFetch) {
        console.log('Fetching fresh data for waiter performance with filters:', {
          mode: waiterFilterMode,
          period: waiterTimePeriod,
          dayPeriod: waiterDayPeriod,
          priority: waiterPriority,
          startDate: waiterStartDate?.toLocaleDateString(),
          endDate: waiterEndDate?.toLocaleDateString()
        });
        
        setIsLoading(true);
        try {
          const data = await loadAnalyticsData();
          setAnalyticsData(data); // Update with fresh data
          console.log('Fresh waiter data loaded with priority:', waiterPriority, data);
        } catch (error) {
          console.error('Error fetching fresh waiter data:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    // Add small delay to avoid too frequent API calls
    const timeoutId = setTimeout(fetchWaiterData, 300);
    return () => clearTimeout(timeoutId);
  }, [waiterFilterMode, waiterTimePeriod, waiterDayPeriod, waiterPriority, waiterStartDate, waiterEndDate, filterMode, timePeriod, dayPeriod, startDate, endDate]);

  // Get current data based on selected filters
  const getCurrentPieData = () => {
    // If we have fetched analytics data, use it for the pie chart
    if (analyticsData) {
      if (timePeriod === "oneDay") {
        const period = dayPeriod as keyof typeof analyticsData.dailyAnalytics;
        const periodData = analyticsData.dailyAnalytics[period].staffBreakdown;
        return Object.keys(periodData).map((key) => ({
          type: key,
          orders: periodData[key].orders,
          fill: STAFF_COLORS[key] || "#6b7280",
        }));
      }
      // For one month and full record, use fullDay data from API
      const currentPieData = analyticsData.dailyAnalytics.fullDay.staffBreakdown;
      return Object.keys(currentPieData).map((key) => ({
        type: key,
        orders: currentPieData[key].orders,
        fill: STAFF_COLORS[key] || "#6b7280",
      }));
    }
    
    // Fallback to static data if no analytics data is available
    if (timePeriod === "oneDay") {
      return dailyData[dayPeriod as keyof typeof dailyData];
    }
    return pieChartData; // Default for one month and full record
  };

  // Function to get filtered popular items data based on current filters
  const getFilteredPopularItems = () => {
    if (!analyticsData || !analyticsData.popularItems) {
      return [];
    }

    // For date ranges (advanced mode), simulate filtered data
    if (isDateRange) {
      // In a real app, this would filter the actual data based on date range
      // For now, we'll simulate by showing a subset and adjusting values
      return analyticsData.popularItems.map((item) => ({
        ...item,
        totalQuantity: Math.floor(item.totalQuantity * (0.7 + Math.random() * 0.6)),
        totalRevenue: Math.floor(item.totalRevenue * (0.7 + Math.random() * 0.6)),
        orderCount: Math.floor(item.orderCount * (0.7 + Math.random() * 0.6)),
      }));
    }
    
    // For single day views, use reduced quantities to simulate day-specific data
    if (isSingleDay) {
      const dayMultipliers = {
        morning: 0.3,
        noon: 0.5,
        night: 0.4,
        fullDay: 1.0,
      };
      const dayMultiplier = dayMultipliers[dayPeriod as keyof typeof dayMultipliers] || 1.0;
      
      return analyticsData.popularItems.map((item) => ({
        ...item,
        totalQuantity: Math.floor(item.totalQuantity * dayMultiplier),
        totalRevenue: Math.floor(item.totalRevenue * dayMultiplier),
        orderCount: Math.floor(item.orderCount * dayMultiplier),
      }));
    }
    
    // For monthly or full record, return full data
    return analyticsData.popularItems;
  };

  const getChartTitle = () => {
    const periodLabels = {
      morning: "Morning (6 AM - 12 PM)",
      noon: "Noon (12 PM - 6 PM)",
      night: "Night (6 PM - 12 AM)",
      fullDay: "Full Day",
    };

    if (timePeriod === "oneDay" || filterMode === 'advanced') {
      return `Orders - ${periodLabels[dayPeriod as keyof typeof periodLabels]}`;
    }
    if (timePeriod === "oneMonth") {
      return "Orders - This Month";
    }
    return "Orders - Full Record";
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-700 to-indigo-700 text-white p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Crown className="w-8 h-8 text-yellow-300" />
              <h1 className="text-xl sm:text-2xl font-bold">
                Detailed Analytics
              </h1>
            </div>
            <p className="text-purple-100 text-sm sm:text-base">
              Insights into waiter performance and customer interaction
            </p>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-6">
        {/* Filter Controls */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Analytics Filters
              {isLoading && (
                <RefreshCw className="animate-spin text-purple-600 ml-2" size={16} />
              )}
            </CardTitle>
            <CardDescription>
              Filter analytics data by time period and day segments
              {isLoading && (
                <span className="text-purple-600 font-medium ml-2">
                  • Refreshing data...
                </span>
              )}
            </CardDescription>
            <div className="flex items-center gap-2 mt-4">
              <Button
                variant={filterMode === "simple" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterMode("simple")}
                className="flex items-center gap-2"
              >
                <Zap className="w-4 h-4" />
                Simple
              </Button>
              <Button
                variant={filterMode === "advanced" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterMode("advanced")}
                className="flex items-center gap-2"
              >
                <Settings className="w-4 h-4" />
                Advanced
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {filterMode === "simple" ? (
              // Simple Mode - Only Time Period and Day Period
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Left Column - Time Period and Day Period Filters */}
                <div className="space-y-4">
                  {/* Time Period Filter */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                      Time Period
                    </label>
                    <Select value={timePeriod} onValueChange={setTimePeriod}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select time period" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="oneDay">One Day</SelectItem>
                        <SelectItem value="oneMonth">One Month</SelectItem>
                        <SelectItem value="fullRecord">Full Record</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Day Period Filter - Only show when One Day is selected */}
                  {timePeriod === "oneDay" && (
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                        Day Period
                      </label>
                      <Select value={dayPeriod} onValueChange={setDayPeriod}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select day period" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="fullDay">Full Day</SelectItem>
                          <SelectItem value="morning">Morning (6 AM - 12 PM)</SelectItem>
                          <SelectItem value="noon">Noon (12 PM - 6 PM)</SelectItem>
                          <SelectItem value="night">Night (6 PM - 12 AM)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>

                {/* Right Column - Filter Summary */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                    Filter Summary
                  </label>
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Period:</span>
                        <span className="font-medium">{timePeriod === "oneDay" ? "One Day" : timePeriod === "oneMonth" ? "One Month" : "Full Record"}</span>
                      </div>
                      {timePeriod === "oneDay" && (
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Time:</span>
                          <span className="font-medium">{dayPeriod === "fullDay" ? "Full Day" : dayPeriod === "morning" ? "Morning" : dayPeriod === "noon" ? "Noon" : "Night"}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              // Advanced Mode - Date Range Picker
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Date Range Calendar */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                    <Calendar className="w-4 h-4 inline mr-2" />
                    Select Date Range
                  </label>
                  <div className="relative">
                    <CalendarComponent
                      mode="range"
                      selected={startDate && endDate ? { from: startDate, to: endDate } : undefined}
                      onSelect={(range) => {
                        if (range) {
                          setStartDate(range.from);
                          setEndDate(range.to);
                        } else {
                          setStartDate(undefined);
                          setEndDate(undefined);
                        }
                      }}
                      className="rounded-md border shadow-sm"
                      captionLayout="dropdown"
                      modifiers={{
                        selected_start: startDate ? [startDate] : [],
                        selected_end: endDate ? [endDate] : [],
                        selected_range: startDate && endDate ? 
                          Array.from({ length: Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1 }, (_, i) => {
                            const date = new Date(startDate.getTime());
                            date.setDate(startDate.getDate() + i);
                            return date;
                          }).slice(1, -1) : []
                      }}
                      modifiersStyles={{
                        selected_start: {
                          backgroundColor: 'white',
                          color: 'black',
                          fontWeight: 'bold',
                          border: '2px solid #3b82f6'
                        },
                        selected_end: {
                          backgroundColor: 'white', 
                          color: 'black',
                          fontWeight: 'bold',
                          border: '2px solid #3b82f6'
                        },
                        selected_range: {
                          backgroundColor: '#e5e7eb',
                          color: '#374151'
                        }
                      }}
                    />
                  </div>
                </div>

                {/* Middle Column - Day Period */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                    Day Period
                  </label>
                  <Select value={dayPeriod} onValueChange={setDayPeriod}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select day period" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fullDay">Full Day</SelectItem>
                      <SelectItem value="morning">Morning (6 AM - 12 PM)</SelectItem>
                      <SelectItem value="noon">Noon (12 PM - 6 PM)</SelectItem>
                      <SelectItem value="night">Night (6 PM - 12 AM)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Right Column - Date Range Summary */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                    Date Range Summary
                  </label>
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Start:</span>
                        <span className="font-medium">{startDate ? startDate.toLocaleDateString() : "Not selected"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">End:</span>
                        <span className="font-medium">{endDate ? endDate.toLocaleDateString() : "Not selected"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Range:</span>
                        <span className="font-medium">
                          {startDate && endDate ? 
                            `${Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24) + 1)} days` : 
                            "Select dates"
                          }
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Time:</span>
                        <span className="font-medium">{dayPeriod === "fullDay" ? "Full Day" : dayPeriod === "morning" ? "Morning" : dayPeriod === "noon" ? "Noon" : "Night"}</span>
                      </div>
                    </div>
                    <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-600">
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        <span className="inline-block w-3 h-3 bg-white border-2 border-blue-500 rounded mr-2"></span>
                        Start/End dates
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        <span className="inline-block w-3 h-3 bg-gray-300 rounded mr-2"></span>
                        Dates in range
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Charts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {/* Pie Chart Card */}
          <Card className="flex flex-col">
            <CardHeader className="items-center pb-0">
              <CardTitle>{getChartTitle()}</CardTitle>
              <CardDescription>
                {timePeriod === "oneDay" || filterMode === 'advanced'
                  ? `Waiter performance breakdown for selected time period`
                  : "Individual waiter orders vs customer self-service orders"}
                {filterMode === 'advanced' && startDate && endDate && (
                  <span className="block text-xs text-muted-foreground">
                    {startDate.getTime() === endDate.getTime()
                      ? `Date: ${startDate.toLocaleDateString()}`
                      : `Date Range: ${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`}
                  </span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 pb-0">
              <ChartContainer
                config={pieChartConfig}
                className="[&_.recharts-pie-label-text]:fill-foreground mx-auto aspect-square max-h-[250px] pb-0"
              >
                <PieChart key={chartKey}>
                  <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                  <Pie 
                    data={getCurrentPieData()} 
                    dataKey="orders" 
                    label 
                    nameKey="type" 
                    isAnimationActive={animateCharts}
                  />
                </PieChart>
              </ChartContainer>
            </CardContent>
            <CardFooter className="flex-col gap-4 text-sm">
              {/* Chart Legend */}
              <div className="grid grid-cols-2 gap-2 w-full">
                {getCurrentPieData()
                  .sort((a, b) => b.orders - a.orders)
                  .map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full flex-shrink-0" 
                        style={{ backgroundColor: item.fill }}
                      ></div>
                      <span className="text-xs truncate">
                        {item.type}: {item.orders}
                      </span>
                    </div>
                  ))
                }
              </div>
              
              {/* Trending Info */}
              <div className="flex items-center gap-2 leading-none font-medium pt-2 border-t">
                Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
              </div>
              <div className="text-muted-foreground leading-none">
                Showing individual waiter performance and customer self-service orders
              </div>
            </CardFooter>
          </Card>
          
          {/* Line Chart Card */}
          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle>Orders Over Time</CardTitle>
              <CardDescription>
                {isDateRange
                  ? `Order trends for the selected date range`
                  : isSingleDay
                  ? 'Daily order trends for waiters and customers'
                  : 'Monthly order trends for waiters and customers'}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <ChartContainer config={lineChartConfig}>
                <LineChart
                  key={chartKey}
                  accessibilityLayer
                  data={lineChartData}
                  margin={{
                    left: 12,
                    right: 12,
                  }}
                  isAnimationActive={animateCharts}
                >
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey={isDateRange ? 'date' : isSingleDay ? 'time' : 'month'}
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tickFormatter={(value) => (isDateRange || isSingleDay) ? value : value.slice(0, 3)}
                  />
                  <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                  <Line
                    dataKey="john"
                    type="monotone"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={false}
                    animationBegin={0}
                    animationDuration={800}
                  />
                  <Line
                    dataKey="emily"
                    type="monotone"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={false}
                    animationBegin={100}
                    animationDuration={800}
                  />
                  <Line
                    dataKey="mike"
                    type="monotone"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    dot={false}
                    animationBegin={200}
                    animationDuration={800}
                  />
                  <Line
                    dataKey="sarah"
                    type="monotone"
                    stroke="#ef4444"
                    strokeWidth={2}
                    dot={false}
                    animationBegin={300}
                    animationDuration={800}
                  />
                  <Line
                    dataKey="david"
                    type="monotone"
                    stroke="#8b5cf6"
                    strokeWidth={2}
                    dot={false}
                    animationBegin={400}
                    animationDuration={800}
                  />
                  <Line
                    dataKey="customer"
                    type="monotone"
                    stroke="#6b7280"
                    strokeWidth={2}
                    dot={false}
                    animationBegin={500}
                    animationDuration={800}
                  />
                </LineChart>
              </ChartContainer>
            </CardContent>
            <CardFooter className="flex-col gap-4 text-sm">
              {/* Line Chart Legend */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 w-full">
                {[
                  { name: "Customer Orders", value: lineChartData[lineChartData.length - 1].customer, color: "#6b7280" },
                  { name: "Mike", value: lineChartData[lineChartData.length - 1].mike, color: "#f59e0b" },
                  { name: "Emily", value: lineChartData[lineChartData.length - 1].emily, color: "#10b981" },
                  { name: "John", value: lineChartData[lineChartData.length - 1].john, color: "#3b82f6" },
                  { name: "David", value: lineChartData[lineChartData.length - 1].david, color: "#8b5cf6" },
                  { name: "Sarah", value: lineChartData[lineChartData.length - 1].sarah, color: "#ef4444" }
                ]
                  .sort((a, b) => b.value - a.value)
                  .map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }}></div>
                      <span className="text-xs truncate">{item.name}: {item.value}</span>
                    </div>
                  ))
                }
              </div>
              
              {/* Trending Info */}
              <div className="flex w-full items-start gap-2 pt-2 border-t">
                <div className="grid gap-2">
                  <div className="flex items-center gap-2 leading-none font-medium">
                    Trending up by 8.5% this month <TrendingUp className="h-4 w-4" />
                  </div>
                  <div className="text-muted-foreground flex items-center gap-2 leading-none">
                    Showing order trends for waiters and customers over the last 6 months
                  </div>
                </div>
              </div>
            </CardFooter>
          </Card>
          
          {/* Revenue Bar Chart Card */}
          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle>Revenue Analytics</CardTitle>
              <CardDescription>
                {isDateRange
                  ? `Revenue generated during the selected date range`
                  : isSingleDay
                  ? `Revenue generated during the selected time period`
                  : 'Total Revenue Generated by Each Waiter and Customers'}
                {filterMode === 'advanced' && startDate && endDate && (
                  <span className="block text-xs text-muted-foreground mt-1">
                    {startDate.getTime() === endDate.getTime()
                      ? `Date: ${startDate.toLocaleDateString()}`
                      : `Date Range: ${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`}
                  </span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <ChartContainer config={barChartConfig}>
                <BarChart
                  key={chartKey}
                  accessibilityLayer
                  data={revenueData}
                  margin={{
                    top: 20,
                    left: 12,
                    right: 12,
                  }}
                  isAnimationActive={animateCharts}
                >
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="person"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                    tickFormatter={(value) => value.length > 8 ? `${value.slice(0, 8)}...` : value}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
                  />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel />}
                  />
                  <Bar 
                    dataKey="revenue" 
                    radius={8}
                    animationBegin={0}
                    animationDuration={800}
                  >
                    <LabelList
                      position="top"
                      offset={12}
                      className="fill-foreground"
                      fontSize={12}
                      formatter={(value: number) => `₹${(value / 1000).toFixed(1)}k`}
                    />
                  </Bar>
                </BarChart>
              </ChartContainer>
            </CardContent>
            <CardFooter className="flex-col gap-4 text-sm">
              {/* Revenue Legend */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 w-full">
                {revenueData
                  .sort((a, b) => b.revenue - a.revenue)
                  .map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full flex-shrink-0" 
                        style={{ backgroundColor: item.fill }}
                      ></div>
                      <span className="text-xs truncate">
                        {item.person}: ₹{(item.revenue / 1000).toFixed(1)}k
                      </span>
                    </div>
                  ))
                }
              </div>
              
              {/* Trending Info */}
              <div className="flex items-center gap-2 leading-none font-medium pt-2 border-t">
                Revenue up by 12.3% this month <TrendingUp className="h-4 w-4" />
              </div>
              <div className="text-muted-foreground leading-none">
                Showing total revenue generated by each waiter and customer orders
              </div>
            </CardFooter>
          </Card>
          
          {/* Popular Items Radar Chart */}
          {getFilteredPopularItems().length > 0 && (
            <ChartRadarPopularItems 
              popularItems={getFilteredPopularItems()}
              className="flex flex-col"
              key={chartKey}
              filterDescription={
                isDateRange
                  ? `Popular items for the selected date range`
                  : isSingleDay
                  ? `Popular items for the selected time period`
                  : 'Most popular items across all time periods'
              }
            />
          )}
        </div>
        
        {/* Waiter Performance Analytics */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Waiter Performance Analytics
            </CardTitle>
            <CardDescription>
              Individual performance metrics for each waiter - Filter independently from main charts
            </CardDescription>
            <div className="flex items-center gap-2 mt-4">
              <Button
                variant={waiterFilterMode === "simple" ? "default" : "outline"}
                size="sm"
                onClick={() => setWaiterFilterMode("simple")}
                className="flex items-center gap-2"
              >
                <Zap className="w-4 h-4" />
                Simple
              </Button>
              <Button
                variant={waiterFilterMode === "advanced" ? "default" : "outline"}
                size="sm"
                onClick={() => setWaiterFilterMode("advanced")}
                className="flex items-center gap-2"
              >
                <Settings className="w-4 h-4" />
                Advanced
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Waiter Performance Filters */}
            <div className="mb-6">
              {waiterFilterMode === "simple" ? (
                // Simple Mode - Only Time Period and Day Period
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Left Column - Time Period and Day Period Filters */}
                  <div className="space-y-4">
                    {/* Time Period Filter */}
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                        Time Period
                      </label>
                      <Select value={waiterTimePeriod} onValueChange={setWaiterTimePeriod}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select time period" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="oneDay">One Day</SelectItem>
                          <SelectItem value="oneMonth">One Month</SelectItem>
                          <SelectItem value="fullRecord">Full Record</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {/* Day Period Filter - Only show when One Day is selected */}
                    {waiterTimePeriod === "oneDay" && (
                      <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                          Day Period
                        </label>
                        <Select value={waiterDayPeriod} onValueChange={setWaiterDayPeriod}>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select day period" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="fullDay">Full Day</SelectItem>
                            <SelectItem value="morning">Morning (6 AM - 12 PM)</SelectItem>
                            <SelectItem value="noon">Noon (12 PM - 6 PM)</SelectItem>
                            <SelectItem value="night">Night (6 PM - 12 AM)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                    
                    {/* Priority Filter */}
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                        Priority Metric
                      </label>
                      <Select value={waiterPriority} onValueChange={setWaiterPriority}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="orders">Orders (Default)</SelectItem>
                          <SelectItem value="revenue">Revenue</SelectItem>
                          <SelectItem value="rating">Rating</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Right Column - Filter Summary */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                      Waiter Filter Summary
                    </label>
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Period:</span>
                          <span className="font-medium">{waiterTimePeriod === "oneDay" ? "One Day" : waiterTimePeriod === "oneMonth" ? "One Month" : "Full Record"}</span>
                        </div>
                        {waiterTimePeriod === "oneDay" && (
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Time:</span>
                            <span className="font-medium">{waiterDayPeriod === "fullDay" ? "Full Day" : waiterDayPeriod === "morning" ? "Morning" : waiterDayPeriod === "noon" ? "Noon" : "Night"}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                // Advanced Mode - Date Range Picker
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left Column - Date Range Calendar */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                      <Calendar className="w-4 h-4 inline mr-2" />
                      Select Date Range
                    </label>
                    <div className="relative">
                      <CalendarComponent
                        mode="range"
                        selected={waiterStartDate && waiterEndDate ? { from: waiterStartDate, to: waiterEndDate } : undefined}
                        onSelect={(range) => {
                          if (range) {
                            setWaiterStartDate(range.from);
                            setWaiterEndDate(range.to);
                          } else {
                            setWaiterStartDate(undefined);
                            setWaiterEndDate(undefined);
                          }
                        }}
                        className="rounded-md border shadow-sm"
                        captionLayout="dropdown"
                        modifiers={{
                          selected_start: waiterStartDate ? [waiterStartDate] : [],
                          selected_end: waiterEndDate ? [waiterEndDate] : [],
                          selected_range: waiterStartDate && waiterEndDate ? 
                            Array.from({ length: Math.ceil((waiterEndDate.getTime() - waiterStartDate.getTime()) / (1000 * 60 * 60 * 24)) + 1 }, (_, i) => {
                              const date = new Date(waiterStartDate.getTime());
                              date.setDate(waiterStartDate.getDate() + i);
                              return date;
                            }).slice(1, -1) : []
                        }}
                        modifiersStyles={{
                          selected_start: {
                            backgroundColor: 'white',
                            color: 'black',
                            fontWeight: 'bold',
                            border: '2px solid #3b82f6'
                          },
                          selected_end: {
                            backgroundColor: 'white', 
                            color: 'black',
                            fontWeight: 'bold',
                            border: '2px solid #3b82f6'
                          },
                          selected_range: {
                            backgroundColor: '#e5e7eb',
                            color: '#374151'
                          }
                        }}
                      />
                    </div>
                  </div>

                  {/* Middle Column - Day Period */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                      Day Period
                    </label>
                    <Select value={waiterDayPeriod} onValueChange={setWaiterDayPeriod}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select day period" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fullDay">Full Day</SelectItem>
                        <SelectItem value="morning">Morning (6 AM - 12 PM)</SelectItem>
                        <SelectItem value="noon">Noon (12 PM - 6 PM)</SelectItem>
                        <SelectItem value="night">Night (6 PM - 12 AM)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Right Column - Date Range Summary */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                      Waiter Date Range Summary
                    </label>
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Start:</span>
                          <span className="font-medium">{waiterStartDate ? waiterStartDate.toLocaleDateString() : "Not selected"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">End:</span>
                          <span className="font-medium">{waiterEndDate ? waiterEndDate.toLocaleDateString() : "Not selected"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Range:</span>
                          <span className="font-medium">
                            {waiterStartDate && waiterEndDate ? 
                              `${Math.ceil((waiterEndDate.getTime() - waiterStartDate.getTime()) / (1000 * 60 * 60 * 24) + 1)} days` : 
                              "Select dates"
                            }
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Time:</span>
                          <span className="font-medium">{waiterDayPeriod === "fullDay" ? "Full Day" : waiterDayPeriod === "morning" ? "Morning" : waiterDayPeriod === "noon" ? "Noon" : "Night"}</span>
                        </div>
                      </div>
                      <div className="mt-4 pt-3 border-t border-blue-200 dark:border-blue-700">
                        <p className="text-xs text-blue-600 dark:text-blue-400">
                          <span className="inline-block w-3 h-3 bg-white border-2 border-blue-500 rounded mr-2"></span>
                          Start/End dates
                        </p>
                        <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                          <span className="inline-block w-3 h-3 bg-gray-300 rounded mr-2"></span>
                          Dates in range
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Priority for Performance Filter */}
              <div className="mt-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                    Priority for Performance Right
                  </label>
                  <Select value={waiterPriority} onValueChange={setWaiterPriority}>
                    <SelectTrigger className="w-full max-w-xs">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="orders">Orders</SelectItem>
                      <SelectItem value="revenue">Revenue</SelectItem>
                      <SelectItem value="rating">Rating</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {/* Performance Rating Explanation */}
              <div className="mt-4 p-3 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg border border-purple-200 dark:border-purple-700">
                <h4 className="text-sm font-semibold text-purple-800 dark:text-purple-200 mb-2">Performance Rating Formula</h4>
                <p className="text-xs text-purple-700 dark:text-purple-300">
                  {waiterPriority === "orders" ? (
                    <strong>Orders (50%) + Rating (30%) + Revenue (20%)</strong>
                  ) : waiterPriority === "revenue" ? (
                    <strong>Revenue (50%) + Orders (25%) + Rating (25%)</strong>
                  ) : (
                    <strong>Rating (50%) + Orders (25%) + Revenue (25%)</strong>
                  )} - Normalized and weighted to calculate overall performance percentage
                </p>
              </div>
            </div>
            
            {/* Waiter Performance Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              {/* Waiter Performance Cards */}
              {[
                {
                  name: "John Smith",
                  shortName: "John",
                  orders: analyticsData ? 
                    (waiterIsSingleDay 
                      ? analyticsData.dailyAnalytics[waiterDayPeriod as keyof typeof analyticsData.dailyAnalytics].staffBreakdown["John Smith"]?.orders || 0
                      : analyticsData.dailyAnalytics.fullDay.staffBreakdown["John Smith"]?.orders || 0
                    ) : 35,
                  revenue: analyticsData ? 
                    (waiterIsSingleDay 
                      ? analyticsData.dailyAnalytics[waiterDayPeriod as keyof typeof analyticsData.dailyAnalytics].staffBreakdown["John Smith"]?.revenue || 0
                      : analyticsData.revenueAnalytics.revenueByStaff["John Smith"] || 0
                    ) : 61800,
                  avgOrderValue: analyticsData ? 
                    (waiterIsSingleDay 
                      ? (analyticsData.dailyAnalytics[waiterDayPeriod as keyof typeof analyticsData.dailyAnalytics].staffBreakdown["John Smith"]?.revenue || 0) / 
                        Math.max(analyticsData.dailyAnalytics[waiterDayPeriod as keyof typeof analyticsData.dailyAnalytics].staffBreakdown["John Smith"]?.orders || 1, 1)
                      : (analyticsData.revenueAnalytics.revenueByStaff["John Smith"] || 0) / 
                        Math.max(analyticsData.dailyAnalytics.fullDay.staffBreakdown["John Smith"]?.orders || 1, 1)
                    ) : 1765,
                  satisfaction: 4.8,
                  color: "#3b82f6"
                },
                {
                  name: "Emily Davis",
                  shortName: "Emily",
                  orders: analyticsData ? 
                    (waiterIsSingleDay 
                      ? analyticsData.dailyAnalytics[waiterDayPeriod as keyof typeof analyticsData.dailyAnalytics].staffBreakdown["Emily Davis"]?.orders || 0
                      : analyticsData.dailyAnalytics.fullDay.staffBreakdown["Emily Davis"]?.orders || 0
                    ) : 42,
                  revenue: analyticsData ? 
                    (waiterIsSingleDay 
                      ? analyticsData.dailyAnalytics[waiterDayPeriod as keyof typeof analyticsData.dailyAnalytics].staffBreakdown["Emily Davis"]?.revenue || 0
                      : analyticsData.revenueAnalytics.revenueByStaff["Emily Davis"] || 0
                    ) : 72500,
                  avgOrderValue: analyticsData ? 
                    (waiterIsSingleDay 
                      ? (analyticsData.dailyAnalytics[waiterDayPeriod as keyof typeof analyticsData.dailyAnalytics].staffBreakdown["Emily Davis"]?.revenue || 0) / 
                        Math.max(analyticsData.dailyAnalytics[waiterDayPeriod as keyof typeof analyticsData.dailyAnalytics].staffBreakdown["Emily Davis"]?.orders || 1, 1)
                      : (analyticsData.revenueAnalytics.revenueByStaff["Emily Davis"] || 0) / 
                        Math.max(analyticsData.dailyAnalytics.fullDay.staffBreakdown["Emily Davis"]?.orders || 1, 1)
                    ) : 1726,
                  satisfaction: 4.9,
                  color: "#10b981"
                },
                {
                  name: "Mike Wilson",
                  shortName: "Mike",
                  orders: analyticsData ? 
                    (waiterIsSingleDay 
                      ? analyticsData.dailyAnalytics[waiterDayPeriod as keyof typeof analyticsData.dailyAnalytics].staffBreakdown["Mike Wilson"]?.orders || 0
                      : analyticsData.dailyAnalytics.fullDay.staffBreakdown["Mike Wilson"]?.orders || 0
                    ) : 52,
                  revenue: analyticsData ? 
                    (waiterIsSingleDay 
                      ? analyticsData.dailyAnalytics[waiterDayPeriod as keyof typeof analyticsData.dailyAnalytics].staffBreakdown["Mike Wilson"]?.revenue || 0
                      : analyticsData.revenueAnalytics.revenueByStaff["Mike Wilson"] || 0
                    ) : 89500,
                  avgOrderValue: analyticsData ? 
                    (waiterIsSingleDay 
                      ? (analyticsData.dailyAnalytics[waiterDayPeriod as keyof typeof analyticsData.dailyAnalytics].staffBreakdown["Mike Wilson"]?.revenue || 0) / 
                        Math.max(analyticsData.dailyAnalytics[waiterDayPeriod as keyof typeof analyticsData.dailyAnalytics].staffBreakdown["Mike Wilson"]?.orders || 1, 1)
                      : (analyticsData.revenueAnalytics.revenueByStaff["Mike Wilson"] || 0) / 
                        Math.max(analyticsData.dailyAnalytics.fullDay.staffBreakdown["Mike Wilson"]?.orders || 1, 1)
                    ) : 1721,
                  satisfaction: 4.7,
                  color: "#f59e0b"
                },
                {
                  name: "Sarah Johnson",
                  shortName: "Sarah",
                  orders: analyticsData ? 
                    (waiterIsSingleDay 
                      ? analyticsData.dailyAnalytics[waiterDayPeriod as keyof typeof analyticsData.dailyAnalytics].staffBreakdown["Sarah Johnson"]?.orders || 0
                      : analyticsData.dailyAnalytics.fullDay.staffBreakdown["Sarah Johnson"]?.orders || 0
                    ) : 18,
                  revenue: analyticsData ? 
                    (waiterIsSingleDay 
                      ? analyticsData.dailyAnalytics[waiterDayPeriod as keyof typeof analyticsData.dailyAnalytics].staffBreakdown["Sarah Johnson"]?.revenue || 0
                      : analyticsData.revenueAnalytics.revenueByStaff["Sarah Johnson"] || 0
                    ) : 32400,
                  avgOrderValue: analyticsData ? 
                    (waiterIsSingleDay 
                      ? (analyticsData.dailyAnalytics[waiterDayPeriod as keyof typeof analyticsData.dailyAnalytics].staffBreakdown["Sarah Johnson"]?.revenue || 0) / 
                        Math.max(analyticsData.dailyAnalytics[waiterDayPeriod as keyof typeof analyticsData.dailyAnalytics].staffBreakdown["Sarah Johnson"]?.orders || 1, 1)
                      : (analyticsData.revenueAnalytics.revenueByStaff["Sarah Johnson"] || 0) / 
                        Math.max(analyticsData.dailyAnalytics.fullDay.staffBreakdown["Sarah Johnson"]?.orders || 1, 1)
                    ) : 1800,
                  satisfaction: 4.6,
                  color: "#ef4444"
                },
                {
                  name: "David Brown",
                  shortName: "David",
                  orders: analyticsData ? 
                    (waiterIsSingleDay 
                      ? analyticsData.dailyAnalytics[waiterDayPeriod as keyof typeof analyticsData.dailyAnalytics].staffBreakdown["David Brown"]?.orders || 0
                      : analyticsData.dailyAnalytics.fullDay.staffBreakdown["David Brown"]?.orders || 0
                    ) : 27,
                  revenue: analyticsData ? 
                    (waiterIsSingleDay 
                      ? analyticsData.dailyAnalytics[waiterDayPeriod as keyof typeof analyticsData.dailyAnalytics].staffBreakdown["David Brown"]?.revenue || 0
                      : analyticsData.revenueAnalytics.revenueByStaff["David Brown"] || 0
                    ) : 48900,
                  avgOrderValue: analyticsData ? 
                    (waiterIsSingleDay 
                      ? (analyticsData.dailyAnalytics[waiterDayPeriod as keyof typeof analyticsData.dailyAnalytics].staffBreakdown["David Brown"]?.revenue || 0) / 
                        Math.max(analyticsData.dailyAnalytics[waiterDayPeriod as keyof typeof analyticsData.dailyAnalytics].staffBreakdown["David Brown"]?.orders || 1, 1)
                      : (analyticsData.revenueAnalytics.revenueByStaff["David Brown"] || 0) / 
                        Math.max(analyticsData.dailyAnalytics.fullDay.staffBreakdown["David Brown"]?.orders || 1, 1)
                    ) : 1811,
                  satisfaction: 4.5,
                  color: "#8b5cf6"
                }
              ]
              .sort((a, b) => {
                // Sort by calculated performance score (highest to lowest)
                // Calculate performance score for waiter A
                const MAX_ORDERS = 100;
                const MAX_RATING = 5;
                const MAX_REVENUE = 100000;
                
                // Weights based on priority selection
                let W_ORDERS, W_RATING, W_REVENUE;
                
                if (waiterPriority === "orders") {
                  W_ORDERS = 0.50;
                  W_RATING = 0.30;
                  W_REVENUE = 0.20;
                } else if (waiterPriority === "revenue") {
                  W_ORDERS = 0.25;
                  W_RATING = 0.25;
                  W_REVENUE = 0.50;
                } else {
                  W_ORDERS = 0.25;
                  W_RATING = 0.50;
                  W_REVENUE = 0.25;
                }
                
                // Calculate score for waiter A
                const normalizedOrdersA = Math.min(1, a.orders / MAX_ORDERS);
                const normalizedRatingA = Math.min(1, a.satisfaction / MAX_RATING);
                const normalizedRevenueA = Math.min(1, a.revenue / MAX_REVENUE);
                
                const scoreA = (
                  (normalizedOrdersA * W_ORDERS) +
                  (normalizedRatingA * W_RATING) +
                  (normalizedRevenueA * W_REVENUE)
                ) * 100;
                
                // Calculate score for waiter B
                const normalizedOrdersB = Math.min(1, b.orders / MAX_ORDERS);
                const normalizedRatingB = Math.min(1, b.satisfaction / MAX_RATING);
                const normalizedRevenueB = Math.min(1, b.revenue / MAX_REVENUE);
                
                const scoreB = (
                  (normalizedOrdersB * W_ORDERS) +
                  (normalizedRatingB * W_RATING) +
                  (normalizedRevenueB * W_REVENUE)
                ) * 100;
                
                // Sort highest to lowest (best performer on left)
                return scoreB - scoreA;
              })
              .map((waiter, index) => (
                <Card key={index} className="relative overflow-hidden">
                  <div 
                    className="absolute top-0 left-0 w-full h-1"
                    style={{ backgroundColor: waiter.color }}
                  ></div>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{waiter.shortName}</CardTitle>
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: waiter.color }}></div>
                      </div>
                    </div>
                    <CardDescription className="text-xs">
                      {waiter.name}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {/* Orders */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Orders</span>
                      <span className="font-semibold">{waiter.orders}</span>
                    </div>
                    
                    {/* Revenue */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Revenue</span>
                      <span className="font-semibold">₹{(waiter.revenue / 1000).toFixed(1)}k</span>
                    </div>
                    
                    {/* Average Order Value */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Avg Order</span>
                      <span className="font-semibold">₹{Math.round(waiter.avgOrderValue)}</span>
                    </div>
                    
                    {/* Customer Satisfaction */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Rating</span>
                      <span className="font-semibold flex items-center gap-1">
                        {waiter.satisfaction}
                        <span className="text-xs text-yellow-500">★</span>
                      </span>
                    </div>
                    
                    {/* Performance Bar */}
                    <div className="pt-2">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-muted-foreground">Performance</span>
                        <span className="font-medium">{(() => {
                          // Performance Scoring System based on priority selection
                          const MAX_ORDERS = 100;  // Target maximum orders
                          const MAX_RATING = 5;     // Maximum rating scale
                          const MAX_REVENUE = 100000; // Target maximum revenue (₹1L)
                          
                          // Weights based on priority selection
                          let W_ORDERS, W_RATING, W_REVENUE;
                          
                          if (waiterPriority === "orders") {
                            // Orders Priority: Orders (50%) + Rating (30%) + Revenue (20%)
                            W_ORDERS = 0.50;
                            W_RATING = 0.30;
                            W_REVENUE = 0.20;
                          } else if (waiterPriority === "revenue") {
                            // Revenue Priority: Revenue (50%) + Orders (25%) + Rating (25%)
                            W_ORDERS = 0.25;
                            W_RATING = 0.25;
                            W_REVENUE = 0.50;
                          } else {
                            // Rating Priority: Rating (50%) + Orders (25%) + Revenue (25%)
                            W_ORDERS = 0.25;
                            W_RATING = 0.50;
                            W_REVENUE = 0.25;
                          }
                          
                          // Normalize each metric (0-1 scale)
                          const normalizedOrders = Math.min(1, waiter.orders / MAX_ORDERS);
                          const normalizedRating = Math.min(1, waiter.satisfaction / MAX_RATING);
                          const normalizedRevenue = Math.min(1, waiter.revenue / MAX_REVENUE);
                          
                          // Calculate weighted score
                          const score = (
                            (normalizedOrders * W_ORDERS) +
                            (normalizedRating * W_RATING) +
                            (normalizedRevenue * W_REVENUE)
                          ) * 100;
                          
                          return Math.round(score);
                        })()}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className="h-2 rounded-full transition-all duration-500"
                          style={{ 
                            backgroundColor: waiter.color, 
                            width: `${(() => {
                              // Same calculation for bar width - using priority-based logic
                              const MAX_ORDERS = 100;
                              const MAX_RATING = 5;
                              const MAX_REVENUE = 100000;
                              
                              // Weights based on priority selection
                              let W_ORDERS, W_RATING, W_REVENUE;
                              
                              if (waiterPriority === "orders") {
                                // Orders Priority: Orders (50%) + Rating (30%) + Revenue (20%)
                                W_ORDERS = 0.50;
                                W_RATING = 0.30;
                                W_REVENUE = 0.20;
                              } else if (waiterPriority === "revenue") {
                                // Revenue Priority: Revenue (50%) + Orders (25%) + Rating (25%)
                                W_ORDERS = 0.25;
                                W_RATING = 0.25;
                                W_REVENUE = 0.50;
                              } else {
                                // Rating Priority: Rating (50%) + Orders (25%) + Revenue (25%)
                                W_ORDERS = 0.25;
                                W_RATING = 0.50;
                                W_REVENUE = 0.25;
                              }
                              
                              const normalizedOrders = Math.min(1, waiter.orders / MAX_ORDERS);
                              const normalizedRating = Math.min(1, waiter.satisfaction / MAX_RATING);
                              const normalizedRevenue = Math.min(1, waiter.revenue / MAX_REVENUE);
                              
                              const score = (
                                (normalizedOrders * W_ORDERS) +
                                (normalizedRating * W_RATING) +
                                (normalizedRevenue * W_REVENUE)
                              ) * 100;
                              
                              return Math.round(score);
                            })()}%`
                          }}
                        ></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {/* Overall Summary */}
            <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Performance Summary
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {analyticsData ? 
                      Object.values(analyticsData.dailyAnalytics.fullDay.staffBreakdown)
                        .filter(staff => staff.orders > 0)
                        .reduce((sum, staff) => sum + staff.orders, 0) 
                      : 174}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Assisted Orders</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    ₹{analyticsData ? 
                      (Object.values(analyticsData.revenueAnalytics.revenueByStaff)
                        .reduce((sum, revenue) => sum + (revenue || 0), 0) / 1000).toFixed(0) 
                      : 305}k
                  </div>
                  <div className="text-sm text-muted-foreground">Total Revenue Generated</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">4.7</div>
                  <div className="text-sm text-muted-foreground">Average Rating</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
