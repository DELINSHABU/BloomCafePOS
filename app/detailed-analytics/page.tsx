"use client";

import React, { useState, useEffect } from "react";
import { TrendingUp, Crown, User, LogOut, Filter, Calendar, Settings, Zap, RefreshCw } from "lucide-react";
import { Pie, PieChart, CartesianGrid, Line, LineChart, XAxis, Bar, BarChart, LabelList, YAxis } from "recharts";
import { ThemeToggle } from "@/components/theme-toggle";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
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
        </div>
      </div>
    </div>
  );
}
