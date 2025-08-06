"use client";

import { useState, useEffect, useRef } from "react";
import {
  getActiveOffers,
  getOfferForItem,
  applyOfferToPrice,
} from "@/lib/offers-utils";
import { getActiveCombos, formatComboForCart } from "@/lib/combo-utils";
import { useCustomerAuth } from "@/lib/customer-auth-context";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ShoppingCart, Grid3X3, ArrowUpDown, Tag, Package, User, UserPlus } from "lucide-react";
import Image from "next/image";
import CustomerAuthModal from "@/components/customer-auth-modal";
import CustomerProfile from "@/components/customer-profile";
import AboutUs from "@/components/about-us";
import type { Page, CartItem } from "@/app/page";

interface HomePageProps {
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

interface TodaysSpecialItem {
  id: string;
  name: string;
  price: number;
  description: string;
  category: string;
  isActive: boolean;
}

export default function HomePage({
  onNavigate,
  onAddToCart,
  onShowCart,
  cartItemCount,
  orderType = "delivery",
  tableNumber,
  onOrderTypeChange,
  showAboutUs = false,
  onShowAboutUs,
}: HomePageProps) {
  const [sortBy, setSortBy] = useState<
    "name" | "price-low" | "price-high" | "category"
  >("name");
  const [specialItems, setSpecialItems] = useState<TodaysSpecialItem[]>([]);
  const [combos, setCombos] = useState<any[]>([]);
  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Customer auth states
  const { user, profile, loading: authLoading } = useCustomerAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  // Load Today's Special items from API
  useEffect(() => {
    loadSpecialItems();
  }, []);

  // Ensure video autoplay on component mount
  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      // Try to play the video programmatically
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          console.log("Video autoplay failed (browser policy):", error);
        });
      }
    }
  }, []);

  const loadSpecialItems = async () => {
    try {
      setLoading(true);

      // Load special items, offers, and combos
      const [specialResponse, offersData, combosData] = await Promise.all([
        fetch("/api/todays-special"),
        getActiveOffers(),
        getActiveCombos(),
      ]);

      setOffers(offersData);
      setCombos(combosData);

      if (specialResponse.ok) {
        const data = await specialResponse.json();
        setSpecialItems(data.items || []);
      } else {
        console.error("Failed to load Today's Special items");
        // Fallback to static data if API fails
        setSpecialItems([
          {
            id: "1",
            name: "Al Faham",
            price: 220,
            description: "Grilled chicken",
            category: "Main Course",
            isActive: true,
          },
          {
            id: "2",
            name: "Chicken Biriyani",
            price: 180,
            description: "Fragrant rice dish",
            category: "Main Course",
            isActive: true,
          },
          {
            id: "3",
            name: "Mint Mojito",
            price: 90,
            description: "Refreshing drink",
            category: "Beverages",
            isActive: true,
          },
          {
            id: "4",
            name: "Dry Fruit Shake",
            price: 120,
            description: "Nutritious shake",
            category: "Beverages",
            isActive: true,
          },
        ]);
      }
    } catch (error) {
      console.error("Error loading Today's Special items:", error);
      // Fallback to static data if API fails
      setSpecialItems([
        {
          id: "1",
          name: "Al Faham",
          price: 220,
          description: "Grilled chicken",
          category: "Main Course",
          isActive: true,
        },
        {
          id: "2",
          name: "Chicken Biriyani",
          price: 180,
          description: "Fragrant rice dish",
          category: "Main Course",
          isActive: true,
        },
        {
          id: "3",
          name: "Mint Mojito",
          price: 90,
          description: "Refreshing drink",
          category: "Beverages",
          isActive: true,
        },
        {
          id: "4",
          name: "Dry Fruit Shake",
          price: 120,
          description: "Nutritious shake",
          category: "Beverages",
          isActive: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (name: string, price: number, isCombo = false, comboId?: string) => {
    onAddToCart({
      id: isCombo ? `combo-${comboId}` : `special-${name}-${Date.now()}`,
      name,
      description: isCombo ? "Combo Special" : "Today's Special",
      price,
    });
  };

  // Filter only active items and sort them based on selected sort option
  const popularItems = specialItems
    .filter((item) => item.isActive)
    .sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "price-low":
          return a.price - b.price;
        case "price-high":
          return b.price - a.price;
        case "category":
          return a.category.localeCompare(b.category);
        default:
          return 0;
      }
    });

  return (
    <div className="w-full bg-gradient-to-br from-emerald-50 to-green-100 min-h-screen">
      {/* Header */}
      <div className="bg-emerald-700 px-4 sm:px-6 lg:px-8 pt-8 pb-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-yellow-300 text-xl sm:text-2xl lg:text-3xl font-bold">
              {user && profile ?
                `Welcome, ${profile.displayName}!` :
                "Bloom Garden Cafe"
              }
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

          {/* Bloom Cafe Logo */}
          <div className="flex justify-center mb-6">
            <div className="w-[80vw] max-w-lg">
              <video
                ref={videoRef}
                src="/BloomCafelogo.mp4"
                autoPlay
                loop
                muted
                playsInline
                preload="auto"
                controls={false}
                className="w-full h-auto object-contain"
                style={{ maxWidth: '500px', maxHeight: '500px' }}
                onLoadStart={() => console.log('Video loading started')}
                onLoadedData={() => console.log('Video data loaded')}
                onCanPlay={() => console.log('Video can play')}
                onPlay={() => console.log('Video started playing')}
                onError={(e) => {
                  console.error('Video error:', e);
                  console.error('Video error details:', e.currentTarget.error);
                }}
                onEnded={(e) => {
                  e.currentTarget.currentTime = 0;
                  e.currentTarget.play();
                }}
              >
                Your browser does not support the video tag.
              </video>
            </div>
          </div>

          {/* Today's Special Section Header */}
          <h2 className="text-white text-xl sm:text-2xl lg:text-3xl font-bold mb-4 sm:mb-6">
            Today's Special
          </h2>
        </div>
      </div>

      {/* Popular Items Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Combos Section - Display first if available */}
        {combos.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-orange-500" />
              Combo Specials
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6">
              {combos.map((combo) => (
                <div key={combo.id} className="relative">
                  {/* Combo Badge */}
                  <div className="absolute -top-2 left-2 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full z-20 shadow-lg">
                    -{combo.discountPercentage}% COMBO
                  </div>

                  <div className="bg-white rounded-xl border border-orange-200 p-4 sm:p-5 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
                    <div className="w-full h-24 sm:h-28 lg:h-32 bg-gradient-to-br from-orange-100 to-yellow-100 rounded-lg mb-3 overflow-hidden flex items-center justify-center">
                      <Package className="w-8 h-8 sm:w-10 sm:h-10 text-orange-500" />
                    </div>
                    <h3 className="font-semibold text-gray-800 text-sm sm:text-base mb-1 line-clamp-2">
                      {combo.name}
                    </h3>
                    <p className="text-gray-500 text-xs sm:text-sm mb-2 line-clamp-2">
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
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="font-bold text-orange-600 text-sm sm:text-base">
                          ₹{combo.comboPrice}
                        </span>
                        <span className="text-xs text-gray-400 line-through">
                          M.R.P: ₹{combo.originalTotal}
                        </span>
                      </div>
                      <Button
                        size="sm"
                        className="bg-orange-600 hover:bg-orange-700 text-white px-2 sm:px-3 py-1 h-7 sm:h-8 text-xs sm:text-sm"
                        onClick={() =>
                          handleAddToCart(combo.name, combo.comboPrice, true, combo.id)
                        }
                      >
                        Add
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Today's Special Items */}
        {popularItems.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Tag className="w-5 h-5 text-emerald-500" />
              Today's Special Items
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 sm:gap-6">
              {popularItems.map((item, index) => {
                const offer = getOfferForItem(offers, item.id, "special");
                const priceInfo = applyOfferToPrice(item.price, offer);

                return (
                  <div key={index} className="relative">
                    {/* Discount Badge - At top of card */}
                    {priceInfo.hasOffer && (
                      <div className="absolute -top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full z-20 shadow-lg">
                        -{priceInfo.discountPercentage}%
                      </div>
                    )}

                    <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
                      <div className="w-full h-24 sm:h-28 lg:h-32 bg-gray-100 rounded-lg mb-3 overflow-hidden">
                        <Image
                          src="/placeholder.svg?height=96&width=120"
                          alt={item.name}
                          width={120}
                          height={96}
                          className="w-full h-full object-cover"
                        />
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
                            ₹{priceInfo.finalPrice}
                          </span>
                          {priceInfo.hasOffer && (
                            <span className="text-xs text-gray-400 line-through">
                              M.R.P: ₹{priceInfo.originalPrice}
                            </span>
                          )}
                        </div>
                        <Button
                          size="sm"
                          className="bg-emerald-600 hover:bg-emerald-700 text-white px-2 sm:px-3 py-1 h-7 sm:h-8 text-xs sm:text-sm"
                          onClick={() =>
                            handleAddToCart(item.name, priceInfo.finalPrice)
                          }
                        >
                          Add
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

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
            <SheetContent side="bottom" className="h-[40vh]">
              <SheetHeader>
                <SheetTitle>Sort Popular Items</SheetTitle>
                <SheetDescription>
                  Choose how to sort the popular items
                </SheetDescription>
              </SheetHeader>
              <div className="grid grid-cols-1 gap-3 mt-6">
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
                <Button
                  variant={sortBy === "category" ? "default" : "outline"}
                  className={
                    sortBy === "category"
                      ? "bg-emerald-600 hover:bg-emerald-700 text-white h-12 justify-start"
                      : "border-gray-200 hover:bg-gray-50 h-12 justify-start"
                  }
                  onClick={() => setSortBy("category")}
                >
                  <Tag className="w-4 h-4 mr-2" />
                  Sort by Category
                </Button>
              </div>
            </SheetContent>
          </Sheet>

          {/* TEST BUTTON - Simple debugging */}
          <button
            style={{
              backgroundColor: 'blue',
              color: 'white',
              border: '3px solid red',
              borderRadius: '50%',
              width: '48px',
              height: '48px',
              fontSize: '12px'
            }}
            onClick={() => {
              alert('TEST BUTTON CLICKED!')
              console.log('🚨 TEST: Button clicked successfully')
              setShowAuthModal(true)
            }}
          >
            TEST
          </button>

          {/* Customer Account Button */}
          <button
            style={{
              backgroundColor: 'transparent',
              color: '#10b981',
              border: 'none',
              borderRadius: '50%',
              width: '48px',
              height: '48px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#dcfce7'}
            onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
            onClick={() => {
              console.log('🔧 Login button clicked!')
              console.log('🔧 User state:', user ? 'logged in' : 'not logged in')
              if (user) {
                console.log('🔧 Opening profile modal')
                setShowProfileModal(true)
              } else {
                console.log('🔧 Opening auth modal')
                setShowAuthModal(true)
              }
            }}
            title={user ? 'View Profile' : 'Login / Register'}
          >
            {user ? (
              <User style={{ width: '20px', height: '20px', color: '#10b981' }} />
            ) : (
              <UserPlus style={{ width: '20px', height: '20px', color: '#10b981' }} />
            )}
          </button>

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

      {/* Customer Authentication Modals */}
      {console.log('🔧 Rendering CustomerAuthModal, isOpen:', showAuthModal)}
      <CustomerAuthModal
        isOpen={showAuthModal}
        onClose={() => {
          console.log('🔧 Closing auth modal')
          setShowAuthModal(false)
        }}
        onSuccess={() => {
          console.log('🔧 Auth success, closing modal')
          setShowAuthModal(false)
          // Optionally show a success toast here
        }}
      />

      <CustomerProfile
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
      />
    </div>
  );
}
