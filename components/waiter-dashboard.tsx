"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Clock,
  CheckCircle,
  Truck,
  ChefHat,
  UserPlus,
  RefreshCw,
  LogOut,
  User,
  X,
  Printer,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SimpleThemeToggle } from "@/components/theme-toggle";
import { useOrders } from "@/lib/order-context";
import type { OrderStatus } from "@/app/page";
import WaiterTaskManagement from "@/components/waiter-task-management";

interface WaiterDashboardProps {
  onNavigate?: (page: any) => void;
  currentUser?: { username: string; role: string; name: string };
  onLogout?: () => void;
}

export default function WaiterDashboard({
  onNavigate,
  currentUser,
  onLogout,
}: WaiterDashboardProps) {
  const { orders, updateOrderStatus, cancelOrder, syncOrders } = useOrders();
  const [isSyncing, setIsSyncing] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [cancellingOrderId, setCancellingOrderId] = useState<string | null>(null);
  const [cancellationReason, setCancellationReason] = useState("");

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleManualSync = async () => {
    setIsSyncing(true);
    try {
      await syncOrders();
    } finally {
      setIsSyncing(false);
    }
  };
  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500";
      case "preparing":
        return "bg-blue-500";
      case "ready":
        return "bg-green-500";
      case "delivered":
        return "bg-gray-500";
      case "cancelled":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "preparing":
        return <ChefHat className="w-4 h-4" />;
      case "ready":
        return <CheckCircle className="w-4 h-4" />;
      case "delivered":
        return <Truck className="w-4 h-4" />;
      case "cancelled":
        return <X className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const handleCancelOrder = (orderId: string) => {
    if (!cancellationReason.trim()) {
      alert('Please enter a cancellation reason');
      return;
    }
    
    cancelOrder(orderId, cancellationReason, currentUser?.name || 'Staff');
    setCancellingOrderId(null);
    setCancellationReason('');
  };

  const getNextStatus = (currentStatus: OrderStatus): OrderStatus | null => {
    switch (currentStatus) {
      case "pending":
        return "preparing";
      case "preparing":
        return "ready";
      case "ready":
        return "delivered";
      default:
        return null;
    }
  };

  const filterOrdersByStatus = (status: OrderStatus) => {
    return orders.filter((order) => order.status === status);
  };

  const formatTime = (date: Date) => {
    // Use a consistent format that works on both server and client
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";
    const displayHours = hours % 12 || 12;
    const displayMinutes = minutes.toString().padStart(2, "0");
    return `${displayHours}:${displayMinutes} ${ampm}`;
  };

  const getTimeElapsed = (timestamp: Date) => {
    const now = new Date();
    const orderTime = new Date(timestamp);
    const diffInMinutes = Math.floor(
      (now.getTime() - orderTime.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 1) {
      return { text: "Just now", color: "text-green-600", urgent: false };
    } else if (diffInMinutes < 60) {
      const urgency = diffInMinutes > 30;
      return {
        text: `${diffInMinutes}m ago`,
        color: urgency ? "text-orange-600" : "text-blue-600",
        urgent: urgency,
      };
    } else {
      const hours = Math.floor(diffInMinutes / 60);
      const minutes = diffInMinutes % 60;
      const urgency = hours >= 1;
      return {
        text: minutes > 0 ? `${hours}h ${minutes}m ago` : `${hours}h ago`,
        color: urgency ? "text-red-600" : "text-orange-600",
        urgent: urgency,
      };
    }
  };

  const getStatusTimeWarning = (status: OrderStatus, timestamp: Date) => {
    const elapsed = getTimeElapsed(timestamp);
    const diffInMinutes = Math.floor(
      (new Date().getTime() - new Date(timestamp).getTime()) / (1000 * 60)
    );

    switch (status) {
      case "pending":
        if (diffInMinutes > 10)
          return {
            show: true,
            level: "high",
            message: "Order waiting too long!",
          };
        if (diffInMinutes > 5)
          return { show: true, level: "medium", message: "Needs attention" };
        return { show: false, level: "low", message: "" };
      case "preparing":
        if (diffInMinutes > 30)
          return { show: true, level: "high", message: "Cooking too long!" };
        if (diffInMinutes > 20)
          return { show: true, level: "medium", message: "Check kitchen" };
        return { show: false, level: "low", message: "" };
      case "ready":
        if (diffInMinutes > 5)
          return { show: true, level: "high", message: "Food getting cold!" };
        if (diffInMinutes > 2)
          return { show: true, level: "medium", message: "Serve soon" };
        return { show: false, level: "low", message: "" };
      default:
        return { show: false, level: "low", message: "" };
    }
  };

  const handlePrintOrder = (order: any) => {
    const printContent = `
      ╔════════════════════════════════════════╗
      ║              BLOOM GARDEN CAFE         ║
      ║               ORDER RECEIPT            ║
      ╚════════════════════════════════════════╝
      
      Order #: ${order.id.slice(-6)}
      Date: ${formatTime(order.timestamp)}
      Status: ${order.status.toUpperCase()}
      ${order.orderType === 'dine-in' && order.tableNumber ? `Table: ${order.tableNumber}` : ''}
      ${order.orderType === 'delivery' ? `\nCustomer: ${order.customerName || 'N/A'}` : ''}
      ${order.orderType === 'delivery' && order.customerPhone ? `Phone: ${order.customerPhone}` : ''}
      ${order.orderType === 'delivery' && order.deliveryAddress ? `\nDelivery Address:\n${order.deliveryAddress.streetAddress}\n${order.deliveryAddress.city}, ${order.deliveryAddress.state} ${order.deliveryAddress.zipCode}` : ''}
      
      ────────────────────────────────────────
      ITEMS:
      ────────────────────────────────────────
      ${order.items.map((item: any) => 
        `${item.quantity}x ${item.name.padEnd(25)} ₹${(item.price * item.quantity).toFixed(2)}`
      ).join('\n      ')}
      
      ────────────────────────────────────────
      TOTAL: ₹${order.total.toFixed(2)}
      ────────────────────────────────────────
      
      ${order.staffMember ? `Served by: ${order.staffMember}` : ''}
      
      Thank you for dining with us!
      
      ════════════════════════════════════════
    `;

    // Create a new window for printing
    const printWindow = window.open('', '_blank', 'width=400,height=600');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Order #${order.id.slice(-6)} - Print</title>
            <style>
              body {
                font-family: 'Courier New', monospace;
                font-size: 12px;
                line-height: 1.4;
                margin: 20px;
                white-space: pre-wrap;
              }
              @media print {
                body { margin: 0; }
              }
            </style>
          </head>
          <body>
            ${printContent}
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      
      // Auto print after a short delay
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 250);
    }
  };

  // Prevent hydration mismatch by not rendering until mounted
  if (!isMounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-emerald-700 text-white p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">Waiter Dashboard</h1>
            <p className="text-emerald-100 text-sm sm:text-base">
              Bloom Garden Cafe
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <div className="flex items-center gap-2 text-emerald-100 mr-4">
              <User className="w-4 h-4" />
              <span className="text-sm">
                Welcome, {currentUser?.name || "Waiter User"}
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="bg-white text-emerald-700 hover:bg-gray-50"
              onClick={handleManualSync}
              disabled={isSyncing}
            >
              <RefreshCw
                className={`w-4 h-4 mr-2 ${isSyncing ? "animate-spin" : ""}`}
              />
              {isSyncing ? "Syncing..." : "Sync Orders"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="bg-white text-emerald-700 hover:bg-gray-50"
              onClick={() => onNavigate && onNavigate("orders")}
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Assist Order
            </Button>
            <SimpleThemeToggle />
            <Button
              variant="outline"
              size="sm"
              className="bg-white text-emerald-700 hover:bg-gray-50"
              onClick={onLogout || (() => window.location.reload())}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-6">
        {/* Sync Status Indicator */}
        {orders.length > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
            <div className="flex items-center gap-2 text-green-700">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm">
                Real-time sync active • {orders.length} total orders
              </span>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {filterOrdersByStatus("pending").length}
                </div>
                <div className="text-sm text-gray-600">Pending</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {filterOrdersByStatus("preparing").length}
                </div>
                <div className="text-sm text-gray-600">Preparing</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {filterOrdersByStatus("ready").length}
                </div>
                <div className="text-sm text-gray-600">Ready</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-600">
                  {filterOrdersByStatus("delivered").length}
                </div>
                <div className="text-sm text-gray-600">Delivered</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="orders" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="orders">Order Management</TabsTrigger>
            <TabsTrigger value="tasks">Task Management</TabsTrigger>
          </TabsList>

          <TabsContent value="orders" className="mt-6">
            {/* Orders Sub-Tabs */}
            <Tabs defaultValue="pending" className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="pending">Pending</TabsTrigger>
                <TabsTrigger value="preparing">Preparing</TabsTrigger>
                <TabsTrigger value="ready">Ready</TabsTrigger>
                <TabsTrigger value="delivered">Delivered</TabsTrigger>
                <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
              </TabsList>

          {(
            ["pending", "preparing", "ready", "delivered", "cancelled"] as OrderStatus[]
          ).map((status) => (
            <TabsContent key={status} value={status} className="mt-6">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filterOrdersByStatus(status).map((order) => {
                  const timeElapsed = getTimeElapsed(order.timestamp);
                  const warning = getStatusTimeWarning(status, order.timestamp);

                  return (
                    <Card
                      key={order.id}
                      className={`relative ${
                        warning.show && warning.level === "high"
                          ? "ring-2 ring-red-500 ring-opacity-50"
                          : warning.show && warning.level === "medium"
                          ? "ring-2 ring-orange-500 ring-opacity-50"
                          : ""
                      }`}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">
                            Order #{order.id.slice(-6)}
                          </CardTitle>
                          <Badge
                            className={`${getStatusColor(status)} text-white`}
                          >
                            <div className="flex items-center gap-1">
                              {getStatusIcon(status)}
                              {status}
                            </div>
                          </Badge>
                        </div>

                        {/* Time Elapsed and Warning */}
                        <div className="flex items-center justify-between mb-2">
                          <div
                            className={`text-sm font-medium ${timeElapsed.color}`}
                          >
                            <Clock className="w-3 h-3 inline mr-1" />
                            {timeElapsed.text}
                          </div>
                          {warning.show && (
                            <div
                              className={`text-xs px-2 py-1 rounded-full ${
                                warning.level === "high"
                                  ? "bg-red-100 text-red-700"
                                  : "bg-orange-100 text-orange-700"
                              }`}
                            >
                              {warning.message}
                            </div>
                          )}
                        </div>

                        <div className="text-sm text-gray-600 space-y-1">
                          <div>{formatTime(order.timestamp)}</div>
                          {order.orderType === "dine-in" &&
                            order.tableNumber && (
                              <div>Table {order.tableNumber}</div>
                            )}
                          {order.orderType === "delivery" && (
                            <>
                              {order.customerName && (
                                <div className="font-medium text-gray-800">{order.customerName}</div>
                              )}
                              {order.customerPhone && (
                                <div className="flex items-center gap-1 text-green-600">
                                  📞 {order.customerPhone}
                                </div>
                              )}
                              {order.deliveryAddress && (
                                <div className="text-xs bg-gray-50 p-2 rounded border-l-2 border-blue-400">
                                  <div className="font-medium text-blue-600 mb-1">📍 Delivery Address:</div>
                                  <div>{order.deliveryAddress.streetAddress}</div>
                                  <div>{order.deliveryAddress.city}, {order.deliveryAddress.state} {order.deliveryAddress.zipCode}</div>
                                  {order.deliveryAddress.phoneNumber && (
                                    <div className="text-green-600 mt-1">📞 {order.deliveryAddress.phoneNumber}</div>
                                  )}
                                </div>
                              )}
                            </>
                          )}
                          {order.staffMember && (
                            <div className="text-blue-600">
                              Staff: {order.staffMember}
                            </div>
                          )}
                          <div className="capitalize font-medium">{order.orderType}</div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 mb-4">
                          {order.items.map((item, index) => (
                            <div
                              key={index}
                              className="flex justify-between text-sm"
                            >
                              <span>
                                {item.quantity}x {item.name}
                              </span>
                              <span>
                                ₹{(item.price * item.quantity).toFixed(2)}
                              </span>
                            </div>
                          ))}
                        </div>
                        {/* Show cancellation info for cancelled orders */}
                        {status === "cancelled" && order.cancellationReason && (
                          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded">
                            <div className="text-sm font-medium text-red-800 mb-1">Cancelled</div>
                            <div className="text-sm text-red-600">Reason: {order.cancellationReason}</div>
                            {order.cancelledBy && (
                              <div className="text-xs text-red-500 mt-1">By: {order.cancelledBy}</div>
                            )}
                          </div>
                        )}
                        
                        <div className="flex justify-between items-center pt-2 border-t">
                          <div className="font-bold">
                            Total: ₹{order.total.toFixed(2)}
                          </div>
                          <div className="flex gap-2">
                            {/* Cancel button for active orders */}
                            {(status === "pending" || status === "preparing") && (
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => setCancellingOrderId(order.id)}
                                  >
                                    <X className="w-4 h-4 mr-1" />
                                    Cancel
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Cancel Order #{order.id.slice(-6)}</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This action cannot be undone. Please provide a reason for cancelling this order.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <div className="space-y-4">
                                    <div>
                                      <Label htmlFor="cancellation-reason">Cancellation Reason *</Label>
                                      <Textarea
                                        id="cancellation-reason"
                                        placeholder="Please enter the reason for cancelling this order..."
                                        value={cancellationReason}
                                        onChange={(e) => setCancellationReason(e.target.value)}
                                        className="mt-2"
                                        rows={3}
                                      />
                                    </div>
                                  </div>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel onClick={() => {
                                      setCancellingOrderId(null);
                                      setCancellationReason('');
                                    }}>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleCancelOrder(order.id)}
                                      className="bg-red-600 hover:bg-red-700"
                                    >
                                      Yes, Cancel Order
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            )}
                            
                            {/* Print button - available for all orders except cancelled */}
                            {status !== "cancelled" && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handlePrintOrder(order)}
                                className="bg-blue-50 hover:bg-blue-100 border-blue-300 text-blue-700"
                              >
                                <Printer className="w-4 h-4 mr-1" />
                                Print
                              </Button>
                            )}
                            
                            {/* Progress button */}
                            {getNextStatus(status) && (
                              <Button
                                size="sm"
                                onClick={() =>
                                  updateOrderStatus(
                                    order.id,
                                    getNextStatus(status)!
                                  )
                                }
                                className="bg-emerald-600 hover:bg-emerald-700"
                              >
                                Mark as {getNextStatus(status)}
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
              {filterOrdersByStatus(status).length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  No {status} orders
                </div>
              )}
            </TabsContent>
              ))}
            </Tabs>
          </TabsContent>

          <TabsContent value="tasks" className="mt-6">
            <WaiterTaskManagement currentUser={currentUser} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
