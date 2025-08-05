"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ShoppingCart,
  ArrowLeft,
  Home,
  Search,
  X,
} from "lucide-react";
import type { Page, CartItem } from "@/app/page";

interface SimpleMenuPageProps {
  onNavigate: (page: Page) => void;
  onAddToCart: (item: Omit<CartItem, "quantity">) => void;
  cartItemCount: number;
  onShowCart?: () => void;
}

export default function SimpleMenuPage({
  onNavigate,
  onAddToCart,
  cartItemCount,
  onShowCart,
}: SimpleMenuPageProps) {
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Simple static menu data for testing
  const menuCategories = [
    {
      category: "🍗 AL FAHAM",
      products: [
        { itemNo: "001", name: "CHICKEN AL FAHAM", rate: "240", available: true },
        { itemNo: "002", name: "MUTTON AL FAHAM", rate: "280", available: true },
        { itemNo: "003", name: "FISH AL FAHAM", rate: "220", available: true },
      ]
    },
    {
      category: "🍚 BIRIYANI", 
      products: [
        { itemNo: "011", name: "CHICKEN BIRIYANI", rate: "180", available: true },
        { itemNo: "012", name: "MUTTON BIRIYANI", rate: "220", available: true },
        { itemNo: "013", name: "VEG BIRIYANI", rate: "140", available: true },
        { itemNo: "014", name: "FISH BIRIYANI", rate: "200", available: true },
      ]
    },
    {
      category: "🍹 BEVERAGES",
      products: [
        { itemNo: "021", name: "MINT MOJITO", rate: "90", available: true },
        { itemNo: "022", name: "LEMON MOJITO", rate: "85", available: true },
        { itemNo: "023", name: "MANGO SHAKE", rate: "120", available: true },
        { itemNo: "024", name: "CHOCOLATE SHAKE", rate: "130", available: true },
      ]
    },
    {
      category: "🍨 FALOODA",
      products: [
        { itemNo: "031", name: "ROYAL FALOODA", rate: "160", available: true },
        { itemNo: "032", name: "CLASSIC FALOODA", rate: "140", available: true },
        { itemNo: "033", name: "CHOCOLATE FALOODA", rate: "150", available: true },
        { itemNo: "034", name: "STRAWBERRY FALOODA", rate: "155", available: true },
      ]
    }
  ];

  const handleAddToCart = (itemNo: string, name: string, rate: string) => {
    const price = parseInt(rate) || 0;
    onAddToCart({
      id: `menu-${itemNo}-${price}`,
      name,
      description: `Item #${itemNo}`,
      price,
    });
  };

  // Filter items based on search term
  const getFilteredCategories = () => {
    if (!searchTerm) return menuCategories;
    
    return menuCategories
      .map(category => ({
        ...category,
        products: category.products.filter(item =>
          item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.itemNo.includes(searchTerm)
        )
      }))
      .filter(category => category.products.length > 0);
  };

  return (
    <div className="w-full bg-gradient-to-br from-emerald-50 to-green-100 min-h-screen">
      {/* Header */}
      <div className="bg-emerald-700 px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 pb-4 sticky top-0 z-30 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-emerald-800 p-2 rounded-full"
                onClick={() => onNavigate("home")}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <h1 className="text-yellow-300 text-xl sm:text-2xl lg:text-3xl font-bold">
                Full Menu
              </h1>
            </div>

            <div className="text-emerald-100 text-sm">
              {cartItemCount > 0
                ? `${cartItemCount} items in cart`
                : "Cart is empty"}
            </div>
          </div>

          {/* Search Bar */}
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search menu items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-10 bg-white text-gray-900 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500"
              />
              {searchTerm && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-gray-100"
                  onClick={() => setSearchTerm("")}
                >
                  <X className="w-4 h-4 text-gray-400" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {getFilteredCategories().map((categoryData) => (
          <div key={categoryData.category} className="mb-8 lg:mb-12">
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 mb-4 sm:mb-6 flex items-center gap-2 bg-white/70 backdrop-blur-sm rounded-lg px-4 py-2 shadow-sm">
              <span className="text-xl sm:text-2xl">
                {categoryData.category.split(' ')[0]}
              </span>
              {categoryData.category.split(' ').slice(1).join(' ')}
              <span className="text-sm text-gray-500 ml-auto">
                ({categoryData.products.length} items)
              </span>
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-6">
              {categoryData.products.map((item) => (
                <div key={item.itemNo} className="bg-white rounded-lg sm:rounded-xl border border-gray-200 p-3 sm:p-4 lg:p-5 shadow-sm sm:shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.02] hover:border-emerald-300">
                  <div className="mb-3">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-gray-800 text-xs sm:text-sm lg:text-base line-clamp-2 flex-1 pr-2">
                        {item.name}
                      </h3>
                      <div className="text-right flex-shrink-0">
                        <span className="font-bold text-emerald-600 text-xs sm:text-sm lg:text-base block">
                          ₹{item.rate}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-full inline-block">
                      #{item.itemNo}
                    </p>
                  </div>
                  <div className="flex justify-center mt-3">
                    <Button
                      size="sm"
                      className="bg-emerald-600 hover:bg-emerald-700 text-white px-2 sm:px-3 lg:px-4 py-1 sm:py-2 h-7 sm:h-8 lg:h-9 text-xs sm:text-sm transition-all duration-200 hover:shadow-md w-full sm:w-auto"
                      onClick={() => handleAddToCart(item.itemNo, item.name, item.rate)}
                    >
                      <ShoppingCart className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                      Add
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {getFilteredCategories().length === 0 && (
          <div className="text-center py-12 sm:py-16 lg:py-20">
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 sm:p-12 max-w-md mx-auto shadow-lg">
              <ShoppingCart className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg sm:text-xl font-semibold text-gray-600 mb-2">
                No items found
              </h3>
              <p className="text-sm sm:text-base text-gray-500">
                Try searching for something else or clear your search.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Bottom spacing for floating navigation */}
      <div className="h-24"></div>

      {/* Floating Bottom Navigation */}
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
        <div className="bg-white rounded-full shadow-2xl border border-gray-200 p-2 flex items-center gap-2">
          {/* Home Button */}
          <Button
            variant="ghost"
            size="sm"
            className="rounded-full w-12 h-12 p-0 hover:bg-gray-100 transition-colors"
            onClick={() => onNavigate("home")}
          >
            <Home className="w-5 h-5 text-gray-600" />
          </Button>

          {/* Cart Button */}
          <Button
            variant="ghost"
            size="sm"
            className="rounded-full w-12 h-12 p-0 hover:bg-emerald-100 transition-colors relative"
            onClick={onShowCart || (() => onNavigate("cart"))}
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