"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Settings,
  Users,
  ShoppingCart,
  LogOut,
  User,
  Crown,
  QrCode,
  Star,
  Percent,
} from "lucide-react";
import { SimpleThemeToggle } from "@/components/theme-toggle";
import WaiterDashboard from "@/components/waiter-dashboard";
import AdminMenuPanel from "@/components/admin-menu-panel";
import QRGenerator from "@/components/qr-generator";
import TodaysSpecialManager from "@/components/todays-special-manager";
import OrderStatisticsDashboard from "@/components/order-statistics-dashboard";
import OffersManager from "@/components/offers-manager";
import UserCredentialsManager from "@/components/UserCredentialsManager";

interface SuperAdminDashboardProps {
  onNavigate?: (page: any) => void;
  currentUser?: { username: string; role: string; name: string };
  onLogout?: () => void;
}

export default function SuperAdminDashboard({
  onNavigate,
  currentUser,
  onLogout,
}: SuperAdminDashboardProps) {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-700 to-indigo-700 text-white p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Crown className="w-8 h-8 text-yellow-300" />
              <h1 className="text-xl sm:text-2xl font-bold">
                Super Admin Dashboard
              </h1>
            </div>
            <p className="text-purple-100 text-sm sm:text-base">
              Complete system management & oversight
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-purple-100">
              <User className="w-4 h-4" />
              <span className="text-sm">
                Welcome, {currentUser?.name || "Super Admin"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <SimpleThemeToggle />
              <Button
                variant="outline"
                size="sm"
                className="bg-white text-purple-700 hover:bg-gray-50"
                onClick={onLogout || (() => window.location.reload())}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="border-l-4 border-l-purple-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">System Access</p>
                  <p className="text-2xl font-bold text-purple-600">
                    Full Control
                  </p>
                </div>
                <Crown className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Waiter Functions</p>
                  <p className="text-2xl font-bold text-blue-600">Available</p>
                </div>
                <Users className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-emerald-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Admin Functions</p>
                  <p className="text-2xl font-bold text-emerald-600">
                    Available
                  </p>
                </div>
                <Settings className="w-8 h-8 text-emerald-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">QR Generator</p>
                  <p className="text-2xl font-bold text-orange-600">Active</p>
                </div>
                <QrCode className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 sm:grid-cols-7 bg-gray-400 dark:bg-gray-800 gap-1 p-2 min-h-[80px] sm:min-h-[40px]">
            <TabsTrigger
              value="overview"
              className="data-[state=inactive]:text-white text-xs sm:text-sm px-1 sm:px-3"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="specials"
              className="data-[state=inactive]:text-white text-xs sm:text-sm px-1 sm:px-3"
            >
              Today's Special
            </TabsTrigger>
            <TabsTrigger
              value="offers"
              className="data-[state=inactive]:text-white text-xs sm:text-sm px-1 sm:px-3"
            >
              Offers
            </TabsTrigger>
            <TabsTrigger
              value="waiter"
              className="data-[state=inactive]:text-white text-xs sm:text-sm px-1 sm:px-3"
            >
              Waiter View
            </TabsTrigger>
            <TabsTrigger
              value="admin"
              className="data-[state=inactive]:text-white text-xs sm:text-sm px-1 sm:px-3"
            >
              Admin View
            </TabsTrigger>
            <TabsTrigger
              value="qr"
              className="data-[state=inactive]:text-white text-xs sm:text-sm px-1 sm:px-3"
            >
              QR Codes
            </TabsTrigger>
            <TabsTrigger
              value="users"
              className="data-[state=inactive]:text-white text-xs sm:text-sm px-1 sm:px-3"
            >
              User Credentials
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            {/* Order Statistics Dashboard */}
            <div className="mb-8">
              <OrderStatisticsDashboard />
            </div>

            {/* Quick Access Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mt-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-600" />
                    Waiter Management
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    Access all waiter functions including order tracking, status
                    updates, and customer service tools.
                  </p>
                  <Button
                    onClick={() => setActiveTab("waiter")}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    View Waiter Dashboard
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5 text-emerald-600" />
                    Admin Management
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    Full administrative control including menu management, item
                    availability, and system settings.
                  </p>
                  <Button
                    onClick={() => setActiveTab("admin")}
                    className="w-full bg-emerald-600 hover:bg-emerald-700"
                  >
                    View Admin Dashboard
                  </Button>
                </CardContent>
              </Card>


              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-600" />
                    Today's Special
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    Manage featured items that appear on the home page. Add,
                    edit, or remove today's special items.
                  </p>
                  <Button
                    onClick={() => setActiveTab("specials")}
                    className="w-full bg-yellow-600 hover:bg-yellow-700"
                  >
                    Manage Specials
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Percent className="w-5 h-5 text-red-600" />
                    Offers & Combos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    Create and manage discount offers for menu items, today's
                    specials, and combo deals with multiple items at discounted prices.
                  </p>
                  <Button
                    onClick={() => setActiveTab("offers")}
                    className="w-full bg-red-600 hover:bg-red-700"
                  >
                    Manage Offers & Combos
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <QrCode className="w-5 h-5 text-indigo-600" />
                    QR Code Generator
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    Generate QR codes for table ordering, allowing customers to
                    scan and order directly from their phones.
                  </p>
                  <Button
                    onClick={() => setActiveTab("qr")}
                    className="w-full bg-indigo-600 hover:bg-indigo-700"
                  >
                    Generate QR Codes
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-purple-600" />
                    User Credentials
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    Manage staff user accounts, passwords, and access levels.
                    Create, edit, or delete user credentials.
                  </p>
                  <Button
                    onClick={() => setActiveTab("users")}
                    className="w-full bg-purple-600 hover:bg-purple-700"
                  >
                    Manage User Credentials
                  </Button>
                </CardContent>
              </Card>

              <Card className="lg:col-span-2 xl:col-span-1">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Crown className="w-5 h-5 text-purple-600" />
                    Super Admin Privileges
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="secondary"
                        className="bg-purple-100 text-purple-700"
                      >
                        ✓ Full System Access
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="secondary"
                        className="bg-blue-100 text-blue-700"
                      >
                        ✓ Waiter Functions
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="secondary"
                        className="bg-emerald-100 text-emerald-700"
                      >
                        ✓ Admin Functions
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="secondary"
                        className="bg-indigo-100 text-indigo-700"
                      >
                        ✓ QR Code Generator
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="secondary"
                        className="bg-purple-100 text-purple-700"
                      >
                        ✓ User Management
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="waiter" className="mt-6">
            <div className="bg-white rounded-lg border">
              <WaiterDashboard
                onNavigate={onNavigate}
                currentUser={currentUser}
                onLogout={onLogout}
              />
            </div>
          </TabsContent>

          <TabsContent value="admin" className="mt-6">
            <div className="bg-white rounded-lg border">
              <AdminMenuPanel
                onNavigate={onNavigate}
                currentUser={currentUser}
                onLogout={onLogout}
              />
            </div>
          </TabsContent>


          <TabsContent value="specials" className="mt-6">
            <div className="bg-white rounded-lg border">
              <TodaysSpecialManager currentUser={currentUser} />
            </div>
          </TabsContent>

          <TabsContent value="offers" className="mt-6">
            <div className="bg-white rounded-lg border">
              <OffersManager currentUser={currentUser} />
            </div>
          </TabsContent>

          <TabsContent value="qr" className="mt-6">
            <div className="bg-white rounded-lg border">
              <QRGenerator onNavigate={onNavigate} />
            </div>
          </TabsContent>
          
          <TabsContent value="users" className="mt-6">
            <div className="bg-white rounded-lg border p-6">
              <UserCredentialsManager currentUser={currentUser} />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
