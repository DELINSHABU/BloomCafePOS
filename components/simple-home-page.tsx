"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import type { Page, CartItem } from "@/app/page";
import AboutUs from "@/components/about-us";

interface SimpleHomePageProps {
  onNavigate: (page: Page) => void;
  onAddToCart: (item: Omit<CartItem, "quantity">) => void;
  onShowCart: () => void;
  cartItemCount: number;
  orderType?: "dine-in" | "delivery";
  tableNumber?: string;
  onOrderTypeChange?: (type: "dine-in" | "delivery") => void;
  showAboutUs?: boolean;
  onShowAboutUs?: (show: boolean) => void;
}

export default function SimpleHomePage({
  onNavigate,
  onAddToCart,
  onShowCart,
  cartItemCount,
  orderType = "delivery",
  tableNumber,
  onOrderTypeChange,
  showAboutUs = false,
  onShowAboutUs,
}: SimpleHomePageProps) {
  // Simple static menu items for testing
  const sampleItems = [
    { id: "1", name: "Al Faham", price: 220, description: "Grilled chicken" },
    { id: "2", name: "Chicken Biriyani", price: 180, description: "Fragrant rice dish" },
    { id: "3", name: "Mint Mojito", price: 90, description: "Refreshing drink" },
    { id: "4", name: "Dry Fruit Shake", price: 120, description: "Nutritious shake" },
  ];

  const handleAddToCart = (item: any) => {
    onAddToCart({
      id: `simple-${item.id}-${Date.now()}`,
      name: item.name,
      description: item.description,
      price: item.price,
    });
  };

  return (
    <div className="w-full bg-gradient-to-br from-emerald-50 to-green-100 min-h-screen">
      {/* Header */}
      <div className="bg-emerald-700 px-4 sm:px-6 lg:px-8 pt-8 pb-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-yellow-300 text-xl sm:text-2xl lg:text-3xl font-bold">
              Bloom Garden Cafe
            </h1>
            <div className="flex gap-2 sm:gap-3">
              <Button
                variant="outline"
                size="sm"
                className="bg-white text-emerald-700 hover:bg-gray-50 text-xs sm:text-sm lg:text-base px-3 sm:px-4 lg:px-6"
                onClick={() => onShowAboutUs?.(true)}
              >
                About Us
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="bg-white text-emerald-700 hover:bg-gray-50 text-xs sm:text-sm lg:text-base px-3 sm:px-4 lg:px-6"
                onClick={() => (window.location.href = "/staff")}
              >
                Staff Login
              </Button>
            </div>
          </div>

          {/* Order Type Selection */}
          {!tableNumber && (
            <div className="bg-white/10 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
              <p className="text-white text-sm sm:text-base mb-2">
                Order Type:
              </p>
              <div className="flex gap-2 sm:gap-3">
                <Button
                  variant={orderType === "delivery" ? "default" : "outline"}
                  size="sm"
                  className={
                    orderType === "delivery"
                      ? "bg-white text-emerald-700 hover:bg-gray-50 px-4 sm:px-6 py-2 sm:py-3"
                      : "bg-transparent text-white border-white hover:bg-white/10 px-4 sm:px-6 py-2 sm:py-3"
                  }
                  onClick={() => onOrderTypeChange?.("delivery")}
                >
                  🚚 Delivery
                </Button>
                <Button
                  variant={orderType === "dine-in" ? "default" : "outline"}
                  size="sm"
                  className={
                    orderType === "dine-in"
                      ? "bg-white text-emerald-700 hover:bg-gray-50 px-4 sm:px-6 py-2 sm:py-3"
                      : "bg-transparent text-white border-white hover:bg-white/10 px-4 sm:px-6 py-2 sm:py-3"
                  }
                  onClick={() => onOrderTypeChange?.("dine-in")}
                >
                  🍽️ Dine In
                </Button>
              </div>
            </div>
          )}

          {/* Table Number Display */}
          {tableNumber && (
            <div className="bg-white/10 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
              <p className="text-white text-sm sm:text-base">
                🍽️ <strong>Table {tableNumber}</strong> - Dine In Order
              </p>
            </div>
          )}

          {/* Today's Special Section Header */}
          <h2 className="text-white text-xl sm:text-2xl lg:text-3xl font-bold mb-4 sm:mb-6">
            Today's Special
          </h2>
        </div>
      </div>

      {/* Popular Items Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 sm:gap-6 mb-8">
          {sampleItems.map((item, index) => (
            <div key={index} className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
              <div className="w-full h-24 sm:h-28 lg:h-32 bg-gray-100 rounded-lg mb-3 overflow-hidden flex items-center justify-center">
                <div className="text-4xl">🍽️</div>
              </div>
              <h3 className="font-semibold text-gray-800 text-sm sm:text-base mb-1 line-clamp-2">
                {item.name}
              </h3>
              <p className="text-gray-500 text-xs sm:text-sm mb-2 line-clamp-1">
                {item.description}
              </p>
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="font-bold text-emerald-600 text-sm sm:text-base">
                    ₹{item.price}
                  </span>
                </div>
                <Button
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-2 sm:px-3 py-1 h-7 sm:h-8 text-xs sm:text-sm"
                  onClick={() => handleAddToCart(item)}
                >
                  Add
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* View All Menu Button */}
        <div className="flex justify-center">
          <Button
            className="w-full max-w-md bg-emerald-600 hover:bg-emerald-700 text-white py-3 sm:py-4 rounded-xl font-semibold text-sm sm:text-base lg:text-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center"
            onClick={() => onNavigate("menu")}
          >
            View Full Menu
          </Button>
        </div>
      </div>

      {/* Bottom spacing for floating navigation */}
      <div className="h-24"></div>

      {/* Floating Bottom Navigation */}
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
        <div className="bg-white rounded-full shadow-2xl border border-gray-200 p-2 flex items-center gap-2">
          {/* Cart Button */}
          <Button
            variant="ghost"
            size="sm"
            className="rounded-full w-12 h-12 p-0 hover:bg-emerald-100 transition-colors relative"
            onClick={onShowCart}
          >
            <ShoppingCart className="w-5 h-5 text-emerald-600" />
            {cartItemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                {cartItemCount}
              </span>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}