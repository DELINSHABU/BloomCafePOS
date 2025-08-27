"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ShoppingCart,
  ArrowLeft,
  Plus,
  Minus,
  User,
  MapPin,
  LogOut,
  Package,
} from "lucide-react";
import {
  getMenuDataWithAvailability,
  getMenuDataWithAvailabilitySync,
  formatPrice,
  getCategoryIcon,
} from "@/lib/menu-data";
import { getActiveCombos } from "@/lib/combo-utils";
import { useOrders } from "@/lib/order-context";
import { useEffect } from "react";
import type { Page, CartItem, Order } from "@/app/page";
import staffCredentials from '@/jsonfiles/staff-credentials.json';
import { StaffPasswordDrawer } from '@/components/StaffPasswordDrawer';

interface StaffOrderPageProps {
  onNavigate?: (page: any) => void;
  currentUser?: { username: string; role: string; name: string };
  onLogout?: () => void;
}

const STAFF_NAMES = [
  "John Smith",
  "Sarah Johnson",
  "Mike Wilson",
  "Emily Davis",
  "David Brown",
  "Lisa Garcia",
  "Tom Anderson",
  "Maria Rodriguez",
];

const TABLE_NUMBERS = Array.from({ length: 20 }, (_, i) => (i + 1).toString());

export default function StaffOrderPage({
  onNavigate,
  currentUser,
  onLogout,
}: StaffOrderPageProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [selectedTable, setSelectedTable] = useState<string>("");
  const [selectedStaff, setSelectedStaff] = useState<string>("");
  const [customerName, setCustomerName] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [pendingStaffSelection, setPendingStaffSelection] = useState<string>("");
  const [showPasswordDrawer, setShowPasswordDrawer] = useState(false);
  const [passwordError, setPasswordError] = useState<string>("");

  const { addOrder } = useOrders();
  const [menuData, setMenuData] = useState<any[]>([]);
  const [combos, setCombos] = useState<any[]>([]);
  const [isLoadingMenu, setIsLoadingMenu] = useState(false);

  const loadMenuData = async () => {
    try {
      const [menuData, combosData] = await Promise.all([
        getMenuDataWithAvailability(),
        getActiveCombos(),
      ]);
      setMenuData(menuData);
      setCombos(combosData);
    } catch (error) {
      console.error("Error loading menu data:", error);
      // Fallback to sync version
      const fallbackData = getMenuDataWithAvailabilitySync();
      setMenuData(fallbackData);
      setCombos([]);
    }
  };

  useEffect(() => {
    loadMenuData();
  }, []);

  // Set default staff member to logged-in user
  useEffect(() => {
    if (currentUser && currentUser.role === 'waiter' && currentUser.name && !selectedStaff) {
      // Check if the current user's name is in the STAFF_NAMES list
      if (STAFF_NAMES.includes(currentUser.name)) {
        setSelectedStaff(currentUser.name);
      }
    }
  }, [currentUser, selectedStaff]);

  const addToCart = (itemNo: string, name: string, rate: string) => {
    const price = formatPrice(rate);
    if (price === 0 && (rate === "APS" || rate === "none")) {
      alert("Price available on request. Please check with kitchen.");
      return;
    }

    const newItem: CartItem = {
      id: `menu-${itemNo}-${price}`,
      name,
      description: `Item #${itemNo}`,
      price,
      quantity: 1,
    };

    setCartItems((prev) => {
      const existing = prev.find((item) => item.id === newItem.id);
      if (existing) {
        return prev.map((item) =>
          item.id === newItem.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, newItem];
    });
  };

  const addComboToCart = (combo: any) => {
    const newItem: CartItem = {
      id: `combo-${combo.id}`,
      name: combo.name,
      description: combo.description,
      price: combo.comboPrice,
      quantity: 1,
    };

    setCartItems((prev) => {
      const existing = prev.find((item) => item.id === newItem.id);
      if (existing) {
        return prev.map((item) =>
          item.id === newItem.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, newItem];
    });
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      setCartItems((prev) => prev.filter((item) => item.id !== id));
    } else {
      setCartItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, quantity } : item))
      );
    }
  };

  const getFilteredItems = () => {
    let items = menuData.flatMap((category) =>
      category.products
        .filter((item) => item.available)
        .map((item) => ({
          ...item,
          categoryName: category.category,
        }))
    );

    if (selectedCategory !== "All") {
      items = items.filter((item) => item.categoryName === selectedCategory);
    }

    if (searchTerm) {
      items = items.filter(
        (item) =>
          item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.itemNo.includes(searchTerm)
      );
    }

    return items;
  };

  const getTotalAmount = () => {
    return cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const getTotalItems = () => {
    return cartItems.reduce((sum, item) => sum + item.quantity, 0);
  };

  const placeOrder = () => {
    if (!selectedTable || !selectedStaff || cartItems.length === 0) {
      alert("Please select table, staff member, and add items to cart");
      return;
    }

    const newOrder: Order = {
      id: `staff-${Math.random().toString(36).substr(2, 9)}`,
      items: [...cartItems],
      total: getTotalAmount(),
      status: "pending",
      tableNumber: selectedTable,
      customerName: customerName || "Walk-in Customer",
      orderType: "dine-in",
      timestamp: new Date(),
      staffMember: selectedStaff,
    };

    addOrder(newOrder);

    // Reset form
    setCartItems([]);
    setSelectedTable("");
    // Only reset staff member if current user is not a waiter
    if (currentUser?.role !== 'waiter') {
      setSelectedStaff("");
    }
    setCustomerName("");

    alert("Order placed successfully!");
  };

  const categories = ["All", ...menuData.map((cat) => cat.category)];

  return (
    <div className="w-full bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Header */}
      <div className="bg-emerald-700 text-white p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-emerald-800 p-2"
              onClick={() => onNavigate && onNavigate("dashboard")}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold">
                Staff Assisted Order
              </h1>
              <p className="text-emerald-100 text-sm">
                Help customers place their orders
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-emerald-100">
              <User className="w-4 h-4" />
              <span className="text-sm">
                {currentUser?.name || "Staff User"}
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-emerald-800"
              onClick={onLogout || (() => window.location.reload())}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        {/* Order Info Form */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <div>
            <Label htmlFor="table" className="text-white">
              Table Number *
            </Label>
            <Select value={selectedTable} onValueChange={setSelectedTable}>
              <SelectTrigger className="bg-white text-gray-900">
                <SelectValue placeholder="Select table" />
              </SelectTrigger>
              <SelectContent>
                {TABLE_NUMBERS.map((table) => (
                  <SelectItem key={table} value={table}>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Table {table}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="staff" className="text-white">
              Staff Member *
            </Label>
        <Select
          value={selectedStaff}
          onValueChange={(staff) => {
            // Always require password for staff selection (except initial auto-selection)
            if (staff !== selectedStaff) {
              setPendingStaffSelection(staff);
              setPasswordError(""); // Clear any previous error
              setShowPasswordDrawer(true);
            }
          }}
        >
              <SelectTrigger className="bg-white text-gray-900">
                <SelectValue placeholder="Select staff" />
              </SelectTrigger>
              <SelectContent>
                {STAFF_NAMES.map((staff) => (
                  <SelectItem key={staff} value={staff}>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      {staff}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="customer" className="text-white">
              Customer Name
            </Label>
            <Input
              id="customer"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Optional"
              className="bg-white text-gray-900"
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col">
        {/* Order Summary at Top */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 sticky top-0 z-10">
          <div className="flex justify-between items-center mb-4">
            <span className="font-semibold text-gray-900 dark:text-gray-100">Total:</span>
            <span className="font-bold text-xl text-emerald-600">
              ₹{getTotalAmount().toFixed(2)}
            </span>
          </div>
          <Button
            onClick={placeOrder}
            className="w-full bg-emerald-600 hover:bg-emerald-700 py-3"
            disabled={
              !selectedTable ||
              !selectedStaff ||
              cartItems.length === 0
            }
          >
            Place Order
          </Button>
        </div>

        {/* Mobile Cart Summary Bar */}
        <div className="lg:hidden bg-white border-b border-gray-200 p-4 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-emerald-600" />
              <span className="font-medium">Cart ({getTotalItems()})</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="font-bold text-emerald-600">
                ₹{getTotalAmount().toFixed(2)}
              </span>
              <Button
                size="sm"
                onClick={placeOrder}
                className="bg-emerald-600 hover:bg-emerald-700"
                disabled={
                  !selectedTable || !selectedStaff || cartItems.length === 0
                }
              >
                Place Order
              </Button>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row min-h-0 flex-1">
          {/* Menu Section */}
          <div className="flex-1 p-4 sm:p-6 lg:pr-0">
            {/* Search and Category Filter */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <Input
                placeholder="Search menu items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
              />
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category === "All"
                        ? "All Items"
                        : `${getCategoryIcon(category)} ${category}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Combos Section - Display first if available and "All" is selected */}
            {combos.length > 0 && selectedCategory === "All" && !searchTerm && (
              <div className="mb-8">
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
                  <Package className="w-5 h-5 text-orange-500" />
                  Combo Specials
                  <Badge
                    variant="outline"
                    className="text-orange-600 border-orange-600"
                  >
                    {combos.length} Available
                  </Badge>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
                  {combos.map((combo) => (
                    <Card
                      key={combo.id}
                      className="hover:shadow-md transition-shadow border-orange-200"
                    >
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 dark:text-gray-100 text-sm mb-1">
                              {combo.name}
                            </h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                              {combo.description}
                            </p>
                            <div className="text-xs text-gray-400 dark:text-gray-500 mb-2">
                              {combo.items.map((item, idx) => (
                                <span key={idx}>
                                  {item.quantity}x {item.itemName}
                                  {idx < combo.items.length - 1 ? " + " : ""}
                                </span>
                              ))}
                            </div>
                          </div>
                          <Badge
                            variant="outline"
                            className="text-orange-600 border-orange-600"
                          >
                            -{combo.discountPercentage}% OFF
                          </Badge>
                        </div>

                        <div className="flex justify-between items-center">
                          <div className="flex flex-col">
                            <span className="font-bold text-orange-600">
                              ₹{combo.comboPrice}
                            </span>
                            <span className="text-xs text-gray-400 dark:text-gray-500 line-through">
                              M.R.P: ₹{combo.originalTotal}
                            </span>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => addComboToCart(combo)}
                            className="bg-orange-600 hover:bg-orange-700 h-8 px-3"
                          >
                            <Plus className="w-3 h-3 mr-1" />
                            Add Combo
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Menu Items Grid */}
            <div className="mb-4">
              {(selectedCategory !== "All" || searchTerm) && (
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-emerald-500" />
                  Menu Items
                  <Badge
                    variant="outline"
                    className="text-emerald-600 border-emerald-600"
                  >
                    {getFilteredItems().length} Available
                  </Badge>
                </h3>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 pb-20 lg:pb-4">
                {getFilteredItems().map((item) => {
                  const currentRate = item.currentPrice || item.rate;
                  const price = formatPrice(currentRate);
                  const priceDisplay =
                    currentRate === "APS" ? "APS" : `₹${price}`;

                  return (
                    <Card
                      key={item.itemNo}
                      className="hover:shadow-md transition-shadow"
                    >
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 dark:text-gray-100 text-sm mb-1">
                              {item.name}
                            </h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              #{item.itemNo} • {item.categoryName}
                            </p>
                          </div>
                          <Badge
                            variant="outline"
                            className="text-green-600 border-green-600"
                          >
                            Available
                          </Badge>
                        </div>

                        <div className="flex justify-between items-center">
                          <span className="font-bold text-emerald-600">
                            {priceDisplay}
                          </span>
                          <Button
                            size="sm"
                            onClick={() =>
                              addToCart(
                                item.itemNo,
                                item.name,
                                item.currentPrice || item.rate
                              )
                            }
                            className="bg-emerald-600 hover:bg-emerald-700 h-8 px-3"
                            disabled={currentRate === "none"}
                          >
                            <Plus className="w-3 h-3 mr-1" />
                            Add
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            {getFilteredItems().length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <ShoppingCart className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No items found</p>
              </div>
            )}
          </div>

          {/* Desktop Cart Section */}
          <div className="hidden lg:block w-96 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700">
            <div className="h-full flex flex-col">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-bold flex items-center gap-2 text-gray-900 dark:text-gray-100">
                  <ShoppingCart className="w-5 h-5" />
                  Order Cart ({getTotalItems()})
                </h3>
              </div>

              <div className="flex-1 overflow-hidden flex flex-col">
                {cartItems.length === 0 ? (
                  <div className="flex-1 flex items-center justify-center text-gray-500 dark:text-gray-400">
                    <div className="text-center">
                      <ShoppingCart className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                      <p>Cart is empty</p>
                      <p className="text-sm">Add items from the menu</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex-1 overflow-y-auto p-6 pt-4">
                      <div className="space-y-3">
                        {cartItems.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 rounded-lg p-3"
                          >
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-sm truncate text-gray-900 dark:text-gray-100">
                                {item.name}
                              </h4>
                              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                {item.description}
                              </p>
                              <p className="font-semibold text-emerald-600">
                                ₹{item.price}
                              </p>
                            </div>
                            <div className="flex items-center gap-2 ml-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  updateQuantity(item.id, item.quantity - 1)
                                }
                                className="h-8 w-8 p-0"
                              >
                                <Minus className="w-3 h-3" />
                              </Button>
                              <span className="w-8 text-center font-medium text-gray-900 dark:text-gray-100">
                                {item.quantity}
                              </span>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  updateQuantity(item.id, item.quantity + 1)
                                }
                                className="h-8 w-8 p-0"
                              >
                                <Plus className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Cart Modal/Drawer */}
        {cartItems.length > 0 && (
          <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-50">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-emerald-600" />
                <span className="font-medium">{getTotalItems()} items</span>
              </div>
              <span className="font-bold text-emerald-600">
                ₹{getTotalAmount().toFixed(2)}
              </span>
            </div>

            <div className="max-h-40 overflow-y-auto mb-3 space-y-2">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between bg-gray-50 rounded p-2"
                >
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium truncate block">
                      {item.name}
                    </span>
                    <span className="text-xs text-gray-500">
                      ₹{item.price} × {item.quantity}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 ml-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="h-6 w-6 p-0"
                    >
                      <Minus className="w-3 h-3" />
                    </Button>
                    <span className="w-6 text-center text-sm">
                      {item.quantity}
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="h-6 w-6 p-0"
                    >
                      <Plus className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <Button
              onClick={placeOrder}
              className="w-full bg-emerald-600 hover:bg-emerald-700 py-3"
              disabled={
                !selectedTable || !selectedStaff || cartItems.length === 0
              }
            >
              Place Order - ₹{getTotalAmount().toFixed(2)}
            </Button>
          </div>
        )}
      </div>
      
      {/* Loading Overlay during menu refresh */}
      {isLoadingMenu && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
            <p className="text-gray-900 dark:text-gray-100 font-medium">Refreshing menu data...</p>
          </div>
        </div>
      )}
      
      {/* Password Drawer */}
      {showPasswordDrawer && (
        <StaffPasswordDrawer 
          isOpen={showPasswordDrawer}
          staffName={pendingStaffSelection}
          errorMessage={passwordError}
          onPasswordSubmit={async (password) => {
            console.log('🔐 JSON FILE ACCESS: staff-credentials.json accessed from components/staff-order-page.tsx -> password verification');
            const user = staffCredentials.users.find((u) => u.name === pendingStaffSelection);
            if (user && password === user.password) {
              setSelectedStaff(pendingStaffSelection);
              setShowPasswordDrawer(false);
              setPendingStaffSelection("");
              setPasswordError(""); // Clear error on success
              
              // Show loading and reload menu data after successful staff change
              setIsLoadingMenu(true);
              await loadMenuData();
              setIsLoadingMenu(false);
            } else {
              setPasswordError('Incorrect password! Please try again.');
            }
          }}
          onClose={() => {
            setShowPasswordDrawer(false);
            setPendingStaffSelection("");
            setPasswordError(""); // Clear error on close
          }}
        />
      )}
    </div>
  );
}
