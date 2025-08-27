"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ShoppingCart,
  Search,
  Plus,
  Minus,
  Trash2,
  Receipt,
  CreditCard,
  DollarSign,
  User,
  LogOut,
  RefreshCw,
  Printer,
  X,
  Calculator,
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
import { Textarea } from "@/components/ui/textarea";
import { SimpleThemeToggle } from "@/components/theme-toggle";
import { useOrders } from "@/lib/order-context";
import { getMenuDataWithAvailabilitySync, formatPrice } from "@/lib/menu-data";
import type { CartItem } from "@/app/page";

interface BillingDashboardProps {
  onNavigate?: (page: any) => void;
  currentUser?: { username: string; role: string; name: string };
  onLogout?: () => void;
}

interface MenuItemWithAvailability {
  itemNo: string;
  name: string;
  rate: string;
  available: boolean;
  currentPrice: string;
  originalPrice: string;
}

interface BillingOrder {
  id: string;
  items: CartItem[];
  customerName: string;
  tableNumber?: string;
  orderType: "dine-in" | "delivery";
  total: number;
  subtotal: number;
  tax: number;
  discount: number;
  status: "draft" | "confirmed";
  timestamp: Date;
}

const STATUS_COLORS = {
  available: "bg-green-500",
  popular: "bg-red-500",
  new: "bg-blue-500",
  special: "bg-purple-500",
  combo: "bg-orange-500",
};

export default function BillingDashboard({
  onNavigate,
  currentUser,
  onLogout,
}: BillingDashboardProps) {
  const { addOrder } = useOrders();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [currentOrder, setCurrentOrder] = useState<BillingOrder>({
    id: `order-${Date.now()}`,
    items: [],
    customerName: "Walk-in Customer",
    tableNumber: "",
    orderType: "dine-in",
    total: 0,
    subtotal: 0,
    tax: 0,
    discount: 0,
    status: "draft",
    timestamp: new Date(),
  });
  const [menuData, setMenuData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showSettleBill, setShowSettleBill] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "card" | "upi">("cash");

  useEffect(() => {
    const loadMenu = async () => {
      try {
        const data = getMenuDataWithAvailabilitySync();
        setMenuData(data);
      } catch (error) {
        console.error("Error loading menu:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadMenu();
  }, []);

  useEffect(() => {
    calculateOrderTotals();
  }, [currentOrder.items, currentOrder.discount]);

  const calculateOrderTotals = () => {
    const subtotal = currentOrder.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const tax = subtotal * 0.05; // 5% tax
    const discountAmount = (subtotal * currentOrder.discount) / 100;
    const total = subtotal + tax - discountAmount;

    setCurrentOrder((prev) => ({
      ...prev,
      subtotal,
      tax,
      total,
    }));
  };

  const getAllMenuItems = (): MenuItemWithAvailability[] => {
    return menuData.flatMap((category) => category.products);
  };

  const getFilteredItems = () => {
    const allItems = getAllMenuItems();
    let filtered = allItems;

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.itemNo.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== "all") {
      const categoryData = menuData.find(cat => cat.category === selectedCategory);
      filtered = categoryData ? categoryData.products : [];
    }

    return filtered;
  };

  const getItemStatus = (item: MenuItemWithAvailability): keyof typeof STATUS_COLORS => {
    if (!item.available) return "available";
    
    // Determine status based on item properties or random for demo
    const statuses: (keyof typeof STATUS_COLORS)[] = ["available", "popular", "new", "special", "combo"];
    const hash = item.itemNo.split("").reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    return statuses[Math.abs(hash) % statuses.length];
  };

  const addItemToOrder = (item: MenuItemWithAvailability) => {
    if (!item.available) return;

    const price = formatPrice(item.currentPrice);
    const existingItem = currentOrder.items.find((orderItem) => orderItem.id === item.itemNo);

    if (existingItem) {
      updateItemQuantity(existingItem.id, existingItem.quantity + 1);
    } else {
      const newItem: CartItem = {
        id: item.itemNo,
        name: item.name,
        description: `Item #${item.itemNo}`,
        price,
        quantity: 1,
      };

      setCurrentOrder((prev) => ({
        ...prev,
        items: [...prev.items, newItem],
      }));
    }
  };

  const updateItemQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItemFromOrder(itemId);
      return;
    }

    setCurrentOrder((prev) => ({
      ...prev,
      items: prev.items.map((item) =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      ),
    }));
  };

  const removeItemFromOrder = (itemId: string) => {
    setCurrentOrder((prev) => ({
      ...prev,
      items: prev.items.filter((item) => item.id !== itemId),
    }));
  };

  const clearOrder = () => {
    setCurrentOrder((prev) => ({
      ...prev,
      items: [],
      subtotal: 0,
      tax: 0,
      total: 0,
    }));
  };

  const settleOrder = () => {
    if (currentOrder.items.length === 0) {
      alert("No items in the current order");
      return;
    }

    // Add the order to the system
    const orderData = {
      id: currentOrder.id,
      items: currentOrder.items,
      total: currentOrder.total,
      status: "pending" as const,
      tableNumber: currentOrder.tableNumber || undefined,
      customerName: currentOrder.customerName,
      orderType: currentOrder.orderType,
      timestamp: new Date(),
      staffMember: currentUser?.name,
    };

    addOrder(orderData);

    // Print receipt
    handlePrintReceipt();

    // Clear the current order
    setCurrentOrder({
      id: `order-${Date.now()}`,
      items: [],
      customerName: "Walk-in Customer",
      tableNumber: "",
      orderType: "dine-in",
      total: 0,
      subtotal: 0,
      tax: 0,
      discount: 0,
      status: "draft",
      timestamp: new Date(),
    });

    setShowSettleBill(false);
    alert(`Order settled successfully via ${paymentMethod.toUpperCase()}!`);
  };

  const handlePrintReceipt = () => {
    const receiptContent = `
      ╔════════════════════════════════════════╗
      ║              BLOOM GARDEN CAFE         ║
      ║                   RECEIPT              ║
      ╚════════════════════════════════════════╝
      
      Order #: ${currentOrder.id.slice(-6)}
      Date: ${new Date().toLocaleString()}
      Customer: ${currentOrder.customerName}
      ${currentOrder.tableNumber ? `Table: ${currentOrder.tableNumber}` : ''}
      Order Type: ${currentOrder.orderType.toUpperCase()}
      
      ────────────────────────────────────────
      ITEMS:
      ────────────────────────────────────────
      ${currentOrder.items.map((item) => 
        `${item.quantity}x ${item.name.padEnd(20)} ₹${(item.price * item.quantity).toFixed(2)}`
      ).join('\n      ')}
      
      ────────────────────────────────────────
      Subtotal:           ₹${currentOrder.subtotal.toFixed(2)}
      Tax (5%):           ₹${currentOrder.tax.toFixed(2)}
      ${currentOrder.discount > 0 ? `Discount (${currentOrder.discount}%): -₹${((currentOrder.subtotal * currentOrder.discount) / 100).toFixed(2)}` : ''}
      ────────────────────────────────────────
      TOTAL:              ₹${currentOrder.total.toFixed(2)}
      ────────────────────────────────────────
      
      Payment Method: ${paymentMethod.toUpperCase()}
      Served by: ${currentUser?.name || 'Staff'}
      
      Thank you for dining with us!
      
      ════════════════════════════════════════
    `;

    const printWindow = window.open('', '_blank', 'width=400,height=600');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Receipt - Order #${currentOrder.id.slice(-6)}</title>
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
            ${receiptContent}
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 250);
    }
  };

  const categories = [
    { id: "all", name: "All", icon: "🍽️" },
    ...menuData.map((cat) => ({
      id: cat.category,
      name: cat.category,
      icon: "🍴"
    }))
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">POS Billing System</h1>
            <p className="text-blue-100 text-sm">Bloom Garden Cafe</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-blue-100 mr-4">
              <User className="w-4 h-4" />
              <span className="text-sm">
                {currentUser?.name || "Billing User"}
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="bg-white text-blue-600 hover:bg-gray-50"
              onClick={() => onNavigate && onNavigate("orders")}
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              Orders
            </Button>
            <SimpleThemeToggle />
            <Button
              variant="outline"
              size="sm"
              className="bg-white text-blue-600 hover:bg-gray-50"
              onClick={onLogout || (() => window.location.reload())}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-1 h-[calc(100vh-80px)]">
        {/* Left Panel - Menu Items */}
        <div className="flex-1 p-6 overflow-y-auto">
          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search items..."
                className="pl-10 h-12 text-lg"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button
                className="absolute right-2 top-2 bg-teal-500 hover:bg-teal-600"
                size="sm"
              >
                Add
                <Plus className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>

          {/* Category Filter Buttons */}
          <div className="mb-6">
            <div className="flex flex-wrap gap-3">
              {categories.slice(0, 6).map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  className={`${
                    selectedCategory === category.id
                      ? "bg-teal-500 hover:bg-teal-600"
                      : "hover:bg-gray-100"
                  }`}
                  onClick={() => setSelectedCategory(category.id)}
                >
                  {category.icon} {category.name}
                </Button>
              ))}
            </div>
            
            {/* Quick filter buttons like in the screenshot */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
              <Button className="bg-teal-500 hover:bg-teal-600 h-16 text-white font-semibold">
                Veg
              </Button>
              <Button className="bg-blue-600 hover:bg-blue-700 h-16 text-white font-semibold">
                Non-veg
              </Button>
              <Button className="bg-purple-600 hover:bg-purple-700 h-16 text-white font-semibold">
                Main course
              </Button>
              <Button className="bg-purple-600 hover:bg-purple-700 h-16 text-white font-semibold">
                Starter
              </Button>
              <Button className="bg-purple-600 hover:bg-purple-700 h-16 text-white font-semibold">
                Beverages
              </Button>
            </div>
          </div>

          {/* Menu Items Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {getFilteredItems().map((item) => {
              const status = getItemStatus(item);
              const price = formatPrice(item.currentPrice);
              
              return (
                <Card
                  key={item.itemNo}
                  className={`cursor-pointer transition-all hover:shadow-lg ${
                    !item.available ? "opacity-50" : "hover:scale-105"
                  }`}
                  onClick={() => addItemToOrder(item)}
                >
                  <CardContent className="p-4 relative">
                    <Badge
                      className={`absolute top-2 right-2 ${STATUS_COLORS[status]} text-white text-xs`}
                    >
                      {status.toUpperCase()}
                    </Badge>
                    
                    <div className="mt-2">
                      <h3 className="font-semibold text-sm mb-2 line-clamp-2">
                        {item.name}
                      </h3>
                      
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="text-lg font-bold text-gray-900">
                            ₹{price}
                          </span>
                          {item.originalPrice !== item.currentPrice && (
                            <span className="text-sm text-gray-500 line-through ml-2">
                              ₹{formatPrice(item.originalPrice)}
                            </span>
                          )}
                        </div>
                        
                        {item.available ? (
                          <Button size="sm" className="bg-teal-500 hover:bg-teal-600">
                            <Plus className="w-4 h-4" />
                          </Button>
                        ) : (
                          <Badge variant="secondary">Out</Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {getFilteredItems().length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <ShoppingCart className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No items found</p>
            </div>
          )}
        </div>

        {/* Right Panel - Current Order */}
        <div className="w-96 bg-white border-l border-gray-200 flex flex-col">
          {/* Order Header */}
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold mb-4">Current Order</h2>
            
            <div className="space-y-3">
              <div>
                <Label htmlFor="customer">Customer Name</Label>
                <Input
                  id="customer"
                  value={currentOrder.customerName}
                  onChange={(e) =>
                    setCurrentOrder((prev) => ({
                      ...prev,
                      customerName: e.target.value,
                    }))
                  }
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="table">Table Number</Label>
                <Input
                  id="table"
                  placeholder="Optional"
                  value={currentOrder.tableNumber}
                  onChange={(e) =>
                    setCurrentOrder((prev) => ({
                      ...prev,
                      tableNumber: e.target.value,
                    }))
                  }
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label>Order Type</Label>
                <div className="flex gap-2 mt-1">
                  <Button
                    size="sm"
                    variant={currentOrder.orderType === "dine-in" ? "default" : "outline"}
                    onClick={() =>
                      setCurrentOrder((prev) => ({ ...prev, orderType: "dine-in" }))
                    }
                  >
                    Dine-in
                  </Button>
                  <Button
                    size="sm"
                    variant={currentOrder.orderType === "delivery" ? "default" : "outline"}
                    onClick={() =>
                      setCurrentOrder((prev) => ({ ...prev, orderType: "delivery" }))
                    }
                  >
                    Delivery
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="flex-1 overflow-y-auto p-4">
            {currentOrder.items.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <ShoppingCart className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No items added yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {currentOrder.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{item.name}</h4>
                      <p className="text-sm text-gray-500">₹{item.price} each</p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          updateItemQuantity(item.id, item.quantity - 1)
                        }
                      >
                        <Minus className="w-3 h-3" />
                      </Button>
                      <span className="w-8 text-center font-semibold">
                        {item.quantity}
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          updateItemQuantity(item.id, item.quantity + 1)
                        }
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => removeItemFromOrder(item.id)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="border-t border-gray-200 p-4 space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal:</span>
                <span>₹{currentOrder.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Tax (5%):</span>
                <span>₹{currentOrder.tax.toFixed(2)}</span>
              </div>
              {currentOrder.discount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Discount ({currentOrder.discount}%):</span>
                  <span>-₹{((currentOrder.subtotal * currentOrder.discount) / 100).toFixed(2)}</span>
                </div>
              )}
              <hr />
              <div className="flex justify-between font-bold text-lg">
                <span>Total:</span>
                <span>₹{currentOrder.total.toFixed(2)}</span>
              </div>
            </div>

            <div className="space-y-2">
              <Button
                className="w-full bg-blue-600 hover:bg-blue-700"
                size="lg"
                disabled={currentOrder.items.length === 0}
                onClick={() => setShowSettleBill(true)}
              >
                <Calculator className="w-4 h-4 mr-2" />
                Settle Bill
              </Button>
              
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearOrder}
                  disabled={currentOrder.items.length === 0}
                >
                  <X className="w-4 h-4 mr-2" />
                  Clear
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentOrder.items.length === 0}
                >
                  <Printer className="w-4 h-4 mr-2" />
                  Print
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Settle Bill Dialog */}
      <AlertDialog open={showSettleBill} onOpenChange={setShowSettleBill}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Settle Bill</AlertDialogTitle>
            <AlertDialogDescription>
              Complete the payment for this order.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between font-bold text-lg">
                <span>Total Amount:</span>
                <span>₹{currentOrder.total.toFixed(2)}</span>
              </div>
            </div>
            
            <div>
              <Label>Payment Method</Label>
              <div className="grid grid-cols-3 gap-2 mt-2">
                <Button
                  size="sm"
                  variant={paymentMethod === "cash" ? "default" : "outline"}
                  onClick={() => setPaymentMethod("cash")}
                  className="flex flex-col h-16"
                >
                  <DollarSign className="w-5 h-5" />
                  Cash
                </Button>
                <Button
                  size="sm"
                  variant={paymentMethod === "card" ? "default" : "outline"}
                  onClick={() => setPaymentMethod("card")}
                  className="flex flex-col h-16"
                >
                  <CreditCard className="w-5 h-5" />
                  Card
                </Button>
                <Button
                  size="sm"
                  variant={paymentMethod === "upi" ? "default" : "outline"}
                  onClick={() => setPaymentMethod("upi")}
                  className="flex flex-col h-16"
                >
                  📱
                  UPI
                </Button>
              </div>
            </div>
          </div>
          
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={settleOrder}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Receipt className="w-4 h-4 mr-2" />
              Complete Payment
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
