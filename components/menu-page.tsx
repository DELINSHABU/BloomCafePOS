"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  ShoppingCart,
  Grid3X3,
  ArrowLeft,
  Filter,
  Home,
  ArrowUpDown,
  Package,
  Search,
  X,
} from "lucide-react";
import {
  getActiveOffers,
  getOfferForItem,
  applyOfferToPrice,
} from "@/lib/offers-utils";
import { getActiveCombos } from "@/lib/combo-utils";
import {
  getMenuDataWithAvailability,
  getMenuDataWithAvailabilitySync,
  getMenuCategories,
  formatPrice,
  getCategoryIcon,
} from "@/lib/menu-data";
import type { Page, CartItem } from "@/app/page";

interface MenuPageProps {
  onNavigate: (page: Page) => void;
  onAddToCart: (item: Omit<CartItem, "quantity">) => void;
  cartItemCount: number;
  onShowCart?: () => void;
}

export default function MenuPage({
  onNavigate,
  onAddToCart,
  cartItemCount,
  onShowCart,
}: MenuPageProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [sortBy, setSortBy] = useState<"name" | "price-low" | "price-high">(
    "name"
  );
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [menuData, setMenuData] = useState<any[]>([]);
  const [combos, setCombos] = useState<any[]>([]);
  const [offers, setOffers] = useState<any[]>([]);
  const categories = getMenuCategories();

  useEffect(() => {
    const loadMenuData = async () => {
      try {
        // Load menu data, offers, and combos
        const [menuData, offersData, combosData] = await Promise.all([
          getMenuDataWithAvailability(),
          getActiveOffers(),
          getActiveCombos(),
        ]);

        setMenuData(menuData);
        setOffers(offersData);
        setCombos(combosData);
      } catch (error) {
        console.error("Error loading menu data:", error);
        // Fallback to sync version
        const fallbackData = getMenuDataWithAvailabilitySync();
        setMenuData(fallbackData);

        // Try to load offers and combos separately
        try {
          const [offersData, combosData] = await Promise.all([
            getActiveOffers(),
            getActiveCombos(),
          ]);
          setOffers(offersData);
          setCombos(combosData);
        } catch (offerError) {
          console.error("Error loading offers/combos:", offerError);
          setOffers([]);
          setCombos([]);
        }
      }
    };
    loadMenuData();
  }, []);

  const handleAddToCart = (itemNo: string, name: string, item: any) => {
    const currentRate = item.currentPrice || item.rate;
    const price = formatPrice(currentRate);
    if (price === 0 && (currentRate === "APS" || currentRate === "none")) {
      alert("Price available on request. Please contact staff.");
      return;
    }

    // Use finalPrice if available (from offers), otherwise use regular price
    const finalPrice = item.finalPrice || price;

    // Create consistent ID based on item number and final price to handle offers correctly
    const itemId = `menu-${itemNo}-${finalPrice}`;

    onAddToCart({
      id: itemId,
      name,
      description: `Item #${itemNo}`,
      price: finalPrice,
    });
  };

  const sortProducts = (products: any[]) => {
    return [...products].sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "price-low":
          const priceA = formatPrice(a.currentPrice || a.rate);
          const priceB = formatPrice(b.currentPrice || b.rate);
          return priceA - priceB;
        case "price-high":
          const priceA2 = formatPrice(a.currentPrice || a.rate);
          const priceB2 = formatPrice(b.currentPrice || b.rate);
          return priceB2 - priceA2;
        default:
          return 0;
      }
    });
  };

  // Enhanced search function with better matching priority and stricter fuzzy matching
  const searchMatches = (
    text: string,
    searchTerm: string
  ): { matches: boolean; score: number } => {
    const normalizedText = text.toLowerCase().replace(/[^a-z0-9]/g, "");
    const normalizedSearch = searchTerm.toLowerCase().replace(/[^a-z0-9]/g, "");

    // Exact match gets highest score
    if (normalizedText === normalizedSearch) {
      return { matches: true, score: 100 };
    }

    // Contains match gets high score
    if (normalizedText.includes(normalizedSearch)) {
      return { matches: true, score: 90 };
    }

    // Starts with match gets good score
    if (normalizedText.startsWith(normalizedSearch)) {
      return { matches: true, score: 85 };
    }

    // Common spelling variations
    const variations: { [key: string]: string[] } = {
      biryani: ["biriyani", "biryani", "biriani"],
      biriyani: ["biryani", "biriyani", "biriani"],
      chicken: ["chiken", "chickan"],
      mutton: ["muttun", "muton"],
      prawn: ["prwan", "praan"],
      fish: ["fis", "phish"],
      curry: ["curri", "cury"],
      masala: ["masaala", "masla"],
      fry: ["fri", "frai"],
      roast: ["rost", "roost"],
      pepper: ["pepar", "peper"],
      special: ["specal", "speshal"],
      chinese: ["chinees", "chinise"],
      fried: ["frid", "fryed"],
      rice: ["rais", "ric"],
      falooda: ["faluda", "falooda"],
      faluda: ["falooda", "faluda"],
    };

    // Check spelling variations
    for (const [correct, variants] of Object.entries(variations)) {
      if (variants.includes(normalizedSearch) || correct === normalizedSearch) {
        const allForms = [correct, ...variants];
        if (allForms.some((form) => normalizedText.includes(form))) {
          return { matches: true, score: 80 };
        }
      }
    }

    // More restrictive fuzzy matching - only for very close matches
    if (normalizedSearch.length >= 5) {
      const words = normalizedText.split(/\s+/);
      for (const word of words) {
        if (
          word.length >= 5 &&
          Math.abs(word.length - normalizedSearch.length) <= 2
        ) {
          let differences = 0;
          const minLength = Math.min(word.length, normalizedSearch.length);

          // Count character differences (more strict)
          for (let i = 0; i < minLength; i++) {
            if (word[i] !== normalizedSearch[i]) {
              differences++;
            }
          }
          differences += Math.abs(word.length - normalizedSearch.length);

          // Only allow 1 difference for words 5-7 chars, 2 for longer words
          const allowedDifferences = word.length <= 7 ? 1 : 2;
          const similarity =
            1 - differences / Math.max(word.length, normalizedSearch.length);

          // Require at least 70% similarity and within allowed differences
          if (differences <= allowedDifferences && similarity >= 0.7) {
            return { matches: true, score: Math.floor(similarity * 60) }; // Lower score for fuzzy matches
          }
        }
      }
    }

    return { matches: false, score: 0 };
  };

  const getDisplayItems = () => {
    let filteredData = menuData;

    // Apply search filter first
    if (searchTerm) {
      filteredData = menuData
        .map((category) => ({
          ...category,
          products: category.products
            .filter((item) => item.available)
            .map((item) => ({
              ...item,
              searchScore: searchMatches(item.name, searchTerm).matches
                ? searchMatches(item.name, searchTerm).score
                : item.itemNo.includes(searchTerm)
                ? 95
                : 0,
            }))
            .filter((item) => item.searchScore > 0)
            .sort((a, b) => b.searchScore - a.searchScore), // Sort by relevance
        }))
        .filter((category) => category.products.length > 0);
    }

    if (selectedCategory === "All") {
      // Filter out categories with no available items and sort products
      return filteredData
        .map((category) => ({
          ...category,
          products: sortProducts(
            searchTerm
              ? category.products
              : category.products.filter((item) => item.available)
          ),
        }))
        .filter((category) => category.products.length > 0);
    }

    const categoryData = filteredData.find(
      (cat) => cat.category === selectedCategory
    );
    if (categoryData) {
      const availableProducts = searchTerm
        ? categoryData.products
        : categoryData.products.filter((item) => item.available);
      return availableProducts.length > 0
        ? [
            {
              ...categoryData,
              products: sortProducts(availableProducts),
            },
          ]
        : [];
    }
    return [];
  };

  // Filter combos based on search term with enhanced matching and scoring
  const getFilteredCombos = () => {
    if (!searchTerm) return combos;

    return combos
      .map((combo) => {
        // Calculate search score for combo
        const nameMatch = searchMatches(combo.name, searchTerm);
        const descMatch = searchMatches(combo.description, searchTerm);
        const itemMatches = combo.items.map((item: any) =>
          searchMatches(item.itemName, searchTerm)
        );

        const maxItemScore = Math.max(0, ...itemMatches.map((m) => m.score));
        const totalScore = Math.max(
          nameMatch.score,
          descMatch.score,
          maxItemScore
        );

        return {
          ...combo,
          searchScore: totalScore,
        };
      })
      .filter((combo) => combo.searchScore > 0)
      .sort((a, b) => b.searchScore - a.searchScore); // Sort by relevance
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
                placeholder="Search menu items, combos..."
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

          {/* Category Navigation */}
          <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
            <Button
              variant={selectedCategory === "All" ? "secondary" : "outline"}
              size="sm"
              className={
                selectedCategory === "All"
                  ? "bg-emerald-800 text-white hover:bg-emerald-900 flex items-center gap-1 px-3 py-2 h-9 whitespace-nowrap flex-shrink-0 shadow-md"
                  : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50 flex items-center gap-1 px-3 py-2 h-9 whitespace-nowrap flex-shrink-0"
              }
              onClick={() => setSelectedCategory("All")}
            >
              <Grid3X3 className="w-4 h-4" />
              All
            </Button>
            {categories.map((category) => (
              <Button
                key={category}
                variant={
                  selectedCategory === category ? "secondary" : "outline"
                }
                size="sm"
                className={
                  selectedCategory === category
                    ? "bg-emerald-800 text-white hover:bg-emerald-900 flex items-center gap-1 px-3 py-2 h-9 whitespace-nowrap flex-shrink-0 shadow-md"
                    : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50 flex items-center gap-1 px-3 py-2 h-9 whitespace-nowrap flex-shrink-0"
                }
                onClick={() => setSelectedCategory(category)}
              >
                <span className="text-sm">{getCategoryIcon(category)}</span>
                <span className="hidden sm:inline">{category}</span>
                <span className="sm:hidden">
                  {category.length > 8
                    ? category.substring(0, 8) + "..."
                    : category}
                </span>
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Combos Section - Display first if available and "All" is selected or when searching */}
        {getFilteredCombos().length > 0 &&
          (selectedCategory === "All" || searchTerm) && (
            <div className="mb-8 lg:mb-12">
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 mb-4 sm:mb-6 flex items-center gap-2 bg-orange-50 backdrop-blur-sm rounded-lg px-4 py-2 shadow-sm border border-orange-200">
                <Package className="text-xl sm:text-2xl text-orange-500" />
                {searchTerm ? "Matching Combos" : "Combo Specials"}
                <span className="text-sm text-gray-500 ml-auto">
                  ({getFilteredCombos().length} combos)
                </span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 mb-8">
                {getFilteredCombos().map((combo) => (
                  <div key={combo.id} className="relative">
                    {/* Combo Badge */}
                    <div className="absolute top-1 left-2 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full z-10 shadow-lg">
                      -{combo.discountPercentage}% COMBO
                    </div>

                    <div className="bg-white rounded-lg sm:rounded-xl border border-orange-200 p-3 sm:p-4 lg:p-5 shadow-sm sm:shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.02] hover:border-orange-400">
                      <div className="w-full h-20 sm:h-24 bg-gradient-to-br from-orange-100 to-yellow-100 rounded-lg mb-3 overflow-hidden flex items-center justify-center">
                        <Package className="w-6 h-6 sm:w-8 sm:h-8 text-orange-500" />
                      </div>
                      <div className="mb-3">
                        <h3 className="font-semibold text-gray-800 text-xs sm:text-sm lg:text-base line-clamp-2 mb-1">
                          {combo.name}
                        </h3>
                        <p className="text-gray-500 text-xs mb-2 line-clamp-2">
                          {combo.description}
                        </p>
                        <div className="text-xs text-gray-400 mb-2">
                          {combo.items.map((item, idx) => (
                            <span key={idx}>
                              {item.quantity}x {item.itemName}
                              {idx < combo.items.length - 1 ? " + " : ""}
                            </span>
                          ))}
                        </div>
                        <div className="flex justify-between items-start">
                          <div className="flex flex-col">
                            <span className="font-bold text-orange-600 text-xs sm:text-sm lg:text-base">
                              ₹{combo.comboPrice}
                            </span>
                            <span className="text-xs text-gray-400 line-through">
                              M.R.P: ₹{combo.originalTotal}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-center mt-3">
                        <Button
                          size="sm"
                          className="bg-orange-600 hover:bg-orange-700 text-white px-2 sm:px-3 lg:px-4 py-1 sm:py-2 h-7 sm:h-8 lg:h-9 text-xs sm:text-sm transition-all duration-200 hover:shadow-md w-full sm:w-auto"
                          onClick={() => {
                            onAddToCart({
                              id: `combo-${combo.id}`,
                              name: combo.name,
                              description: combo.description,
                              price: combo.comboPrice,
                            });
                          }}
                        >
                          <ShoppingCart className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                          Add Combo
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        {getDisplayItems().map((categoryData) => (
          <div key={categoryData.category} className="mb-8 lg:mb-12">
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 mb-4 sm:mb-6 flex items-center gap-2 bg-white/70 backdrop-blur-sm rounded-lg px-4 py-2 shadow-sm">
              <span className="text-xl sm:text-2xl">
                {getCategoryIcon(categoryData.category)}
              </span>
              {categoryData.category}
              <span className="text-sm text-gray-500 ml-auto">
                ({categoryData.products.length} items)
              </span>
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-6">
              {categoryData.products.map((item) => {
                const currentRate = item.currentPrice || item.rate;
                const price = formatPrice(currentRate);
                const priceDisplay =
                  currentRate === "APS"
                    ? "APS"
                    : currentRate === "none"
                    ? "N/A"
                    : `₹${price}`;

                // Check for offers
                const offer = getOfferForItem(offers, item.itemNo, "menu");
                const priceInfo = applyOfferToPrice(price, offer);

                return (
                  <div key={item.itemNo} className="relative">
                    {/* Discount Badge - At top of card */}
                    {priceInfo.hasOffer && (
                      <div className="absolute top-1 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full z-10 shadow-lg">
                        -{priceInfo.discountPercentage}%
                      </div>
                    )}

                    <div className="bg-white rounded-lg sm:rounded-xl border border-gray-200 p-3 sm:p-4 lg:p-5 shadow-sm sm:shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.02] hover:border-emerald-300">
                      <div className="mb-3">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-gray-800 text-xs sm:text-sm lg:text-base line-clamp-2 flex-1 pr-2">
                            {item.name}
                          </h3>
                          <div className="text-right flex-shrink-0">
                            {priceInfo.hasOffer ? (
                              <div className="flex flex-col">
                                <span className="font-bold text-emerald-600 text-xs sm:text-sm lg:text-base block">
                                  ₹{priceInfo.finalPrice}
                                </span>
                                <span className="text-xs text-gray-400 line-through">
                                  M.R.P: ₹{priceInfo.originalPrice}
                                </span>
                              </div>
                            ) : (
                              <span className="font-bold text-emerald-600 text-xs sm:text-sm lg:text-base block">
                                {priceDisplay}
                              </span>
                            )}
                            {item.originalPrice &&
                              item.originalPrice !== currentRate &&
                              !priceInfo.hasOffer && (
                                <span className="text-xs text-gray-400 line-through">
                                  ₹{item.originalPrice}
                                </span>
                              )}
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-full inline-block">
                          #{item.itemNo}
                        </p>
                      </div>
                      <div className="flex justify-center mt-3">
                        <Button
                          size="sm"
                          className="bg-emerald-600 hover:bg-emerald-700 text-white px-2 sm:px-3 lg:px-4 py-1 sm:py-2 h-7 sm:h-8 lg:h-9 text-xs sm:text-sm transition-all duration-200 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
                          onClick={() =>
                            handleAddToCart(item.itemNo, item.name, {
                              ...item,
                              finalPrice: priceInfo.finalPrice,
                            })
                          }
                          disabled={currentRate === "none"}
                        >
                          <ShoppingCart className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                          Add
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {getDisplayItems().length === 0 && (
          <div className="text-center py-12 sm:py-16 lg:py-20">
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 sm:p-12 max-w-md mx-auto shadow-lg">
              <ShoppingCart className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg sm:text-xl font-semibold text-gray-600 mb-2">
                No items available
              </h3>
              <p className="text-sm sm:text-base text-gray-500">
                No items found in this category. Try selecting a different
                category.
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

          {/* Category Filter Sheet */}
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="rounded-full w-12 h-12 p-0 hover:bg-emerald-100 transition-colors"
              >
                <Filter className="w-5 h-5 text-emerald-600" />
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[70vh] flex flex-col">
              <SheetHeader className="flex-shrink-0">
                <SheetTitle>Filter by Category</SheetTitle>
                <SheetDescription>
                  Select a category to filter menu items
                </SheetDescription>
              </SheetHeader>
              <div className="flex-1 overflow-y-auto mt-6 pr-2">
                <div className="grid grid-cols-2 gap-3 pb-4">
                  <Button
                    variant={selectedCategory === "All" ? "default" : "outline"}
                    className={
                      selectedCategory === "All"
                        ? "bg-emerald-600 hover:bg-emerald-700 text-white h-12"
                        : "border-gray-200 hover:bg-gray-50 h-12"
                    }
                    onClick={() => setSelectedCategory("All")}
                  >
                    <Grid3X3 className="w-4 h-4 mr-2" />
                    All Items
                  </Button>
                  {categories.map((category) => (
                    <Button
                      key={category}
                      variant={
                        selectedCategory === category ? "default" : "outline"
                      }
                      className={
                        selectedCategory === category
                          ? "bg-emerald-600 hover:bg-emerald-700 text-white h-12"
                          : "border-gray-200 hover:bg-gray-50 h-12"
                      }
                      onClick={() => setSelectedCategory(category)}
                    >
                      <span className="mr-2">{getCategoryIcon(category)}</span>
                      <span className="text-xs">
                        {category.length > 12
                          ? category.substring(0, 12) + "..."
                          : category}
                      </span>
                    </Button>
                  ))}
                </div>
              </div>
            </SheetContent>
          </Sheet>

          {/* Sort Button */}
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="rounded-full w-12 h-12 p-0 hover:bg-emerald-100 transition-colors"
              >
                <ArrowUpDown className="w-5 h-5 text-emerald-600" />
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[50vh] flex flex-col">
              <SheetHeader className="flex-shrink-0">
                <SheetTitle>Sort Menu Items</SheetTitle>
                <SheetDescription>
                  Choose how to sort the menu items
                </SheetDescription>
              </SheetHeader>
              <div className="flex-1 overflow-y-auto mt-6 pr-2">
                <div className="grid grid-cols-1 gap-3 pb-4">
                  <Button
                    variant={sortBy === "name" ? "default" : "outline"}
                    className={
                      sortBy === "name"
                        ? "bg-emerald-600 hover:bg-emerald-700 text-white h-12 justify-start"
                        : "border-gray-200 hover:bg-gray-50 h-12 justify-start"
                    }
                    onClick={() => setSortBy("name")}
                  >
                    <Grid3X3 className="w-4 h-4 mr-2" />
                    Sort by Name (A-Z)
                  </Button>
                  <Button
                    variant={sortBy === "price-low" ? "default" : "outline"}
                    className={
                      sortBy === "price-low"
                        ? "bg-emerald-600 hover:bg-emerald-700 text-white h-12 justify-start"
                        : "border-gray-200 hover:bg-gray-50 h-12 justify-start"
                    }
                    onClick={() => setSortBy("price-low")}
                  >
                    <ArrowUpDown className="w-4 h-4 mr-2" />
                    Price: Low to High
                  </Button>
                  <Button
                    variant={sortBy === "price-high" ? "default" : "outline"}
                    className={
                      sortBy === "price-high"
                        ? "bg-emerald-600 hover:bg-emerald-700 text-white h-12 justify-start"
                        : "border-gray-200 hover:bg-gray-50 h-12 justify-start"
                    }
                    onClick={() => setSortBy("price-high")}
                  >
                    <ArrowUpDown className="w-4 h-4 mr-2" />
                    Price: High to Low
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>

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
