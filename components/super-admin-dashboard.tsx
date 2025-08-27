"use client";

import React, { useState, useEffect } from "react";
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
  ClipboardList,
  FileText,
  Package,
  MapPin,
} from "lucide-react";
import { SimpleThemeToggle } from "@/components/theme-toggle";
import WaiterDashboard from "@/components/waiter-dashboard";
import AdminMenuPanel from "@/components/admin-menu-panel";
import QRGenerator from "@/components/qr-generator";
import TodaysSpecialManager from "@/components/todays-special-manager";
import OrderStatisticsDashboard from "@/components/order-statistics-dashboard";
import OffersManager from "@/components/offers-manager";
import UserCredentialsManager from "@/components/UserCredentialsManager";
import TaskAssignmentManager from "@/components/task-assignment-manager";
import AboutUsContentManagerComponent from "./about-us-content-manager";
import BlogManager from "./blog-manager";
import InventoryManager from "./inventory-manager";
import RolePermissionManager from "./role-permission-manager";
import BillingDashboard from "@/components/billing-dashboard";
import TableManagementDashboard from "@/components/table-management-dashboard";
import { useRolePermissions } from "@/hooks/useRolePermissions";

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
  const { hasPermission, getDefaultTab, getAllowedTabs, permissions } = useRolePermissions();
  const userRole = currentUser?.role || 'waiter';
  const allowedTabs = getAllowedTabs(userRole);
  const defaultTab = getDefaultTab(userRole);
  
  const [activeTab, setActiveTab] = useState(defaultTab || "overview");
  
  // Debug logging
  console.log('Current user:', currentUser);
  console.log('User role:', userRole);
  console.log('Permissions loaded:', permissions);
  console.log('Allowed tabs:', allowedTabs);
  console.log('Default tab:', defaultTab);
  console.log('Active tab:', activeTab);
  
  // Count actual visible tabs
  const visibleTabsCount = allowedTabs.length;
  console.log('Number of visible tabs for', userRole, ':', visibleTabsCount);

  // Update active tab if current one is not allowed for the role
  React.useEffect(() => {
    if (!hasPermission(userRole, activeTab) && allowedTabs.length > 0) {
      setActiveTab(allowedTabs[0]);
    }
  }, [userRole, activeTab, hasPermission, allowedTabs]);

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
        {/* Debug Info Panel - Temporary for testing */}
        {process.env.NODE_ENV === 'development' && (
          <Card className="mb-6 border-yellow-300 bg-yellow-50">
            <CardHeader>
              <CardTitle className="text-yellow-800">🐛 Debug Information</CardTitle>
            </CardHeader>
            <CardContent className="text-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p><strong>User:</strong> {currentUser?.name || 'None'}</p>
                  <p><strong>Role:</strong> {userRole}</p>
                  <p><strong>Active Tab:</strong> {activeTab}</p>
                  <p><strong>Default Tab:</strong> {defaultTab}</p>
                </div>
                <div>
                  <p><strong>Visible Tabs ({visibleTabsCount}):</strong></p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {allowedTabs.map(tab => (
                      <Badge key={tab} variant="outline" className="text-xs">{tab}</Badge>
                    ))}
                  </div>
                  <p className="mt-2"><strong>Permissions Loaded:</strong> {Object.keys(permissions).length > 0 ? '✅' : '❌'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        
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
          <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-2 mb-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">
              {/* Create array of visible tabs and render them responsively */}
              {[
                { key: 'overview', label: 'Overview', icon: null },
                { key: 'specials', label: "Today's Special", icon: null },
                { key: 'offers', label: 'Offers', icon: null },
                { key: 'billing', label: 'Billing POS', icon: <ShoppingCart className="w-3 h-3 mr-1" /> },
                { key: 'tables', label: 'Table Management', icon: <MapPin className="w-3 h-3 mr-1" /> },
                { key: 'waiter', label: 'Waiter View', icon: null },
                { key: 'admin', label: 'Admin View', icon: null },
                { key: 'qr', label: 'QR Codes', icon: null },
                { key: 'users', label: 'User Credentials', icon: null },
                { key: 'tasks', label: 'Tasks', icon: <ClipboardList className="w-3 h-3 mr-1" /> },
                { key: 'about-us', label: 'About Us', icon: <FileText className="w-3 h-3 mr-1" /> },
                { key: 'blog', label: 'Blog', icon: null },
                { key: 'inventory', label: 'Inventory', icon: <Package className="w-3 h-3 mr-1" /> },
                { key: 'management-overview', label: 'Management', icon: <Settings className="w-3 h-3 mr-1" /> },
                { key: 'workflow', label: 'Workflow', icon: <ClipboardList className="w-3 h-3 mr-1" /> },
                { key: 'editing-panel', label: 'Editing Panel', icon: <FileText className="w-3 h-3 mr-1" /> }
              ]
                .filter(tab => hasPermission(userRole, tab.key))
                .map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`
                      flex items-center justify-center px-2 py-2 text-xs sm:text-sm rounded-md transition-colors duration-200
                      ${activeTab === tab.key 
                        ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm font-medium' 
                        : 'text-gray-600 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-white'
                      }
                    `}
                  >
                    {tab.icon}
                    <span className="truncate">{tab.label}</span>
                  </button>
                ))
              }
            </div>
          </div>

          {/* Hidden TabsList for compatibility with existing TabsContent */}
          <TabsList className="hidden">
            {hasPermission(userRole, "overview") && (
              <TabsTrigger value="overview">Overview</TabsTrigger>
            )}
            {hasPermission(userRole, "specials") && (
              <TabsTrigger value="specials">Today's Special</TabsTrigger>
            )}
            {hasPermission(userRole, "offers") && (
              <TabsTrigger value="offers">Offers</TabsTrigger>
            )}
            {hasPermission(userRole, "billing") && (
              <TabsTrigger value="billing">Billing POS</TabsTrigger>
            )}
            {hasPermission(userRole, "waiter") && (
              <TabsTrigger value="waiter">Waiter View</TabsTrigger>
            )}
            {hasPermission(userRole, "admin") && (
              <TabsTrigger value="admin">Admin View</TabsTrigger>
            )}
            {hasPermission(userRole, "qr") && (
              <TabsTrigger value="qr">QR Codes</TabsTrigger>
            )}
            {hasPermission(userRole, "users") && (
              <TabsTrigger value="users">User Credentials</TabsTrigger>
            )}
            {hasPermission(userRole, "tasks") && (
              <TabsTrigger value="tasks">Tasks</TabsTrigger>
            )}
            {hasPermission(userRole, "about-us") && (
              <TabsTrigger value="about-us">About Us</TabsTrigger>
            )}
            {hasPermission(userRole, "blog") && (
              <TabsTrigger value="blog">Blog</TabsTrigger>
            )}
            {hasPermission(userRole, "inventory") && (
              <TabsTrigger value="inventory">Inventory</TabsTrigger>
            )}
            {hasPermission(userRole, "management-overview") && (
              <TabsTrigger value="management-overview">Management Overview</TabsTrigger>
            )}
            {hasPermission(userRole, "workflow") && (
              <TabsTrigger value="workflow">Managing Workflow</TabsTrigger>
            )}
            {hasPermission(userRole, "editing-panel") && (
              <TabsTrigger value="editing-panel">Editing Panel</TabsTrigger>
            )}
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
                    <ShoppingCart className="w-5 h-5 text-blue-600" />
                    Billing POS System
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    Complete Point of Sale system for processing orders, managing
                    bills, accepting payments, and printing receipts.
                  </p>
                  <Button
                    onClick={() => setActiveTab("billing")}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    Open POS System
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-emerald-600" />
                    Table Management
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    Monitor and manage restaurant table status, reservations,
                    and seating arrangements in real-time.
                  </p>
                  <Button
                    onClick={() => setActiveTab("tables")}
                    className="w-full bg-emerald-600 hover:bg-emerald-700"
                  >
                    Manage Tables
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

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ClipboardList className="w-5 h-5 text-teal-600" />
                    Task Assignment
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    Assign tasks to waiters, track progress, and manage
                    workload distribution with priority levels and due dates.
                  </p>
                  <Button
                    onClick={() => setActiveTab("tasks")}
                    className="w-full bg-teal-600 hover:bg-teal-700"
                  >
                    Manage Task Assignment
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-slate-600" />
                    About Us Content
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    Edit and manage all About Us page content including story,
                    features, location, hours, and mission statement.
                  </p>
                  <Button
                    onClick={() => setActiveTab("about-us")}
                    className="w-full bg-slate-600 hover:bg-slate-700"
                  >
                    Manage About Us Content
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    📝 Blog Management
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    Create, edit, and manage blog posts for the About Us page.
                    Add rich content with images, videos, categories, and tags.
                  </p>
                  <Button
                    onClick={() => setActiveTab("blog")}
                    className="w-full bg-amber-600 hover:bg-amber-700"
                  >
                    Manage Blog Posts
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="w-5 h-5 text-cyan-600" />
                    Inventory Management
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    Manage restaurant inventory including ingredients, supplies,
                    stock levels, suppliers, and automatic low-stock alerts.
                  </p>
                  <Button
                    onClick={() => setActiveTab("inventory")}
                    className="w-full bg-cyan-600 hover:bg-cyan-700"
                  >
                    Manage Inventory
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

          <TabsContent value="billing" className="mt-6">
            <div className="bg-white rounded-lg border">
              <BillingDashboard
                onNavigate={onNavigate}
                currentUser={currentUser}
                onLogout={onLogout}
              />
            </div>
          </TabsContent>

          <TabsContent value="tables" className="mt-6">
            <div className="bg-white rounded-lg border">
              <TableManagementDashboard
                onNavigate={onNavigate}
                currentUser={currentUser}
                onLogout={onLogout}
              />
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

          <TabsContent value="tasks" className="mt-6">
            <div className="bg-white rounded-lg border p-6">
              <TaskAssignmentManager currentUser={currentUser} />
            </div>
          </TabsContent>

          <TabsContent value="about-us" className="mt-6">
            <div className="bg-white rounded-lg border p-6">
              <AboutUsContentManagerComponent currentUser={currentUser} />
            </div>
          </TabsContent>

          <TabsContent value="blog" className="mt-6">
            <div className="bg-white rounded-lg border p-6">
              <BlogManager currentUser={currentUser} />
            </div>
          </TabsContent>

          <TabsContent value="inventory" className="mt-6">
            <div className="bg-white rounded-lg border p-6">
              <InventoryManager currentUser={currentUser} />
            </div>
          </TabsContent>

          <TabsContent value="management-overview" className="mt-6">
            <div className="bg-white rounded-lg border p-6">
              <div className="space-y-6">
                <div className="border-b pb-4">
                  <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <Settings className="w-6 h-6 text-blue-600" />
                    Management Overview
                  </h2>
                  <p className="text-gray-600 mt-2">
                    Comprehensive view of all system management functions and controls.
                  </p>
                </div>

                {/* Overview Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <Card className="border-l-4 border-l-blue-500">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-blue-600">
                        <Users className="w-5 h-5" />
                        Staff Management
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 mb-4">
                        Monitor staff activities, assign roles, and manage user permissions across the system.
                      </p>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Active Users:</span>
                          <span className="font-semibold text-blue-600">8</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Pending Tasks:</span>
                          <span className="font-semibold text-orange-600">3</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-l-4 border-l-emerald-500">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-emerald-600">
                        <Package className="w-5 h-5" />
                        System Resources
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 mb-4">
                        Overview of system resources, inventory levels, and operational status.
                      </p>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>System Health:</span>
                          <Badge className="bg-emerald-100 text-emerald-700">Excellent</Badge>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Storage Used:</span>
                          <span className="font-semibold text-emerald-600">72%</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-l-4 border-l-purple-500">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-purple-600">
                        <Star className="w-5 h-5" />
                        Performance Metrics
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 mb-4">
                        Key performance indicators and system efficiency metrics.
                      </p>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Orders Today:</span>
                          <span className="font-semibold text-purple-600">127</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Avg Response:</span>
                          <span className="font-semibold text-purple-600">2.3s</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Quick Actions */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4">Quick Management Actions</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Button onClick={() => setActiveTab("users")} className="bg-blue-600 hover:bg-blue-700">
                      <Users className="w-4 h-4 mr-2" />
                      Manage Users
                    </Button>
                    <Button onClick={() => setActiveTab("tasks")} className="bg-teal-600 hover:bg-teal-700">
                      <ClipboardList className="w-4 h-4 mr-2" />
                      View Tasks
                    </Button>
                    <Button onClick={() => setActiveTab("inventory")} className="bg-cyan-600 hover:bg-cyan-700">
                      <Package className="w-4 h-4 mr-2" />
                      Check Inventory
                    </Button>
                    <Button onClick={() => setActiveTab("admin")} className="bg-emerald-600 hover:bg-emerald-700">
                      <Settings className="w-4 h-4 mr-2" />
                      Admin Panel
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="workflow" className="mt-6">
            <div className="bg-white rounded-lg border p-6">
              <div className="space-y-6">
                <div className="border-b pb-4">
                  <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <ClipboardList className="w-6 h-6 text-teal-600" />
                    Managing Workflow
                  </h2>
                  <p className="text-gray-600 mt-2">
                    Monitor and manage operational workflows, task assignments, and process optimization.
                  </p>
                </div>

                {/* Workflow Status */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <ClipboardList className="w-5 h-5 text-teal-600" />
                        Active Workflows
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                          <div>
                            <p className="font-medium text-blue-800">Order Processing</p>
                            <p className="text-sm text-blue-600">15 orders in queue</p>
                          </div>
                          <Badge className="bg-blue-100 text-blue-700">Active</Badge>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg">
                          <div>
                            <p className="font-medium text-emerald-800">Kitchen Preparation</p>
                            <p className="text-sm text-emerald-600">8 items cooking</p>
                          </div>
                          <Badge className="bg-emerald-100 text-emerald-700">Running</Badge>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                          <div>
                            <p className="font-medium text-orange-800">Delivery Queue</p>
                            <p className="text-sm text-orange-600">5 orders ready</p>
                          </div>
                          <Badge className="bg-orange-100 text-orange-700">Pending</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-purple-600" />
                        Staff Workflow
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                          <div>
                            <p className="font-medium text-purple-800">Waiters On Duty</p>
                            <p className="text-sm text-purple-600">4 active, 2 break</p>
                          </div>
                          <Badge className="bg-purple-100 text-purple-700">6 Total</Badge>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-indigo-50 rounded-lg">
                          <div>
                            <p className="font-medium text-indigo-800">Kitchen Staff</p>
                            <p className="text-sm text-indigo-600">3 active</p>
                          </div>
                          <Badge className="bg-indigo-100 text-indigo-700">Available</Badge>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                          <div>
                            <p className="font-medium text-slate-800">Management</p>
                            <p className="text-sm text-slate-600">2 supervisors</p>
                          </div>
                          <Badge className="bg-slate-100 text-slate-700">Online</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Workflow Controls */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4">Workflow Management Tools</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Button onClick={() => setActiveTab("tasks")} className="bg-teal-600 hover:bg-teal-700">
                      <ClipboardList className="w-4 h-4 mr-2" />
                      Assign Tasks
                    </Button>
                    <Button onClick={() => setActiveTab("users")} className="bg-purple-600 hover:bg-purple-700">
                      <Users className="w-4 h-4 mr-2" />
                      Staff Schedule
                    </Button>
                    <Button onClick={() => setActiveTab("admin")} className="bg-emerald-600 hover:bg-emerald-700">
                      <Settings className="w-4 h-4 mr-2" />
                      Process Settings
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="editing-panel" className="mt-6">
            <div className="bg-white rounded-lg border p-6">
              <RolePermissionManager />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
