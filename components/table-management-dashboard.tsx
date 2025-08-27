"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  MapPin,
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  Plus,
  RefreshCw,
  Settings,
  User,
  LogOut,
  Edit,
  Trash2,
} from "lucide-react";
import { SimpleThemeToggle } from "@/components/theme-toggle";
import { useOrders } from "@/lib/order-context";

interface TableManagementDashboardProps {
  onNavigate?: (page: any) => void;
  currentUser?: { username: string; role: string; name: string };
  onLogout?: () => void;
}

interface TableData {
  id: string;
  number: string;
  area: string;
  capacity: number;
  status: "available" | "occupied" | "reserved" | "cleaning" | "out-of-order";
  currentOrder?: string;
  customerName?: string;
  orderTime?: Date;
  estimatedTime?: number;
}

interface AreaData {
  id: string;
  name: string;
  tables: TableData[];
  color: string;
}

const TABLE_STATUS_CONFIG = {
  available: {
    color: "bg-green-100 text-green-800 border-green-300",
    icon: CheckCircle,
    label: "Available",
  },
  occupied: {
    color: "bg-red-100 text-red-800 border-red-300",
    icon: Users,
    label: "Occupied",
  },
  reserved: {
    color: "bg-yellow-100 text-yellow-800 border-yellow-300",
    icon: Clock,
    label: "Reserved",
  },
  cleaning: {
    color: "bg-blue-100 text-blue-800 border-blue-300",
    icon: RefreshCw,
    label: "Cleaning",
  },
  "out-of-order": {
    color: "bg-gray-100 text-gray-800 border-gray-300",
    icon: XCircle,
    label: "Out of Order",
  },
};

export default function TableManagementDashboard({
  onNavigate,
  currentUser,
  onLogout,
}: TableManagementDashboardProps) {
  const { orders } = useOrders();
  const [areas, setAreas] = useState<AreaData[]>([]);
  const [selectedTable, setSelectedTable] = useState<TableData | null>(null);
  const [showTableDialog, setShowTableDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Initialize table data
  useEffect(() => {
    const initializeTableData = () => {
      const initialAreas: AreaData[] = [
        {
          id: "ac-premium",
          name: "AC Premium",
          color: "bg-blue-50 border-blue-200",
          tables: [
            { id: "ac1", number: "AC 1", area: "AC Premium", capacity: 4, status: "available" },
            { id: "ac2", number: "AC 2", area: "AC Premium", capacity: 4, status: "occupied", customerName: "John Doe", orderTime: new Date(Date.now() - 30 * 60000) },
            { id: "ac3", number: "AC 3", area: "AC Premium", capacity: 6, status: "reserved", customerName: "Jane Smith", estimatedTime: 15 },
            { id: "ac4", number: "AC 4", area: "AC Premium", capacity: 4, status: "cleaning" },
            { id: "ac5", number: "AC 5", area: "AC Premium", capacity: 2, status: "available" },
          ],
        },
        {
          id: "garden",
          name: "Garden",
          color: "bg-green-50 border-green-200",
          tables: [
            { id: "g1", number: "G 1", area: "Garden", capacity: 4, status: "available" },
            { id: "g2", number: "G 2", area: "Garden", capacity: 4, status: "occupied", customerName: "Mike Wilson", orderTime: new Date(Date.now() - 45 * 60000) },
            { id: "g3", number: "G 3", area: "Garden", capacity: 6, status: "available" },
            { id: "g4", number: "G 4", area: "Garden", capacity: 4, status: "reserved", customerName: "Sarah Davis", estimatedTime: 30 },
            { id: "g5", number: "G 5", area: "Garden", capacity: 8, status: "available" },
          ],
        },
        {
          id: "bar",
          name: "Bar",
          color: "bg-purple-50 border-purple-200",
          tables: [
            { id: "h1", number: "H 1", area: "Bar", capacity: 2, status: "occupied", customerName: "Alex Johnson", orderTime: new Date(Date.now() - 20 * 60000) },
            { id: "h2", number: "H 2", area: "Bar", capacity: 2, status: "available" },
            { id: "h3", number: "H 3", area: "Bar", capacity: 4, status: "available" },
            { id: "h4", number: "H 4", area: "Bar", capacity: 2, status: "occupied", customerName: "Emma Brown", orderTime: new Date(Date.now() - 60 * 60000) },
            { id: "h5", number: "H 5", area: "Bar", capacity: 2, status: "out-of-order" },
          ],
        },
      ];

      setAreas(initialAreas);
      setIsLoading(false);
    };

    initializeTableData();
  }, []);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdated(new Date());
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const getTableStats = () => {
    const allTables = areas.flatMap(area => area.tables);
    return {
      total: allTables.length,
      available: allTables.filter(t => t.status === "available").length,
      occupied: allTables.filter(t => t.status === "occupied").length,
      reserved: allTables.filter(t => t.status === "reserved").length,
      cleaning: allTables.filter(t => t.status === "cleaning").length,
      outOfOrder: allTables.filter(t => t.status === "out-of-order").length,
    };
  };

  const updateTableStatus = (tableId: string, status: TableData["status"], customerName?: string) => {
    setAreas(prev => prev.map(area => ({
      ...area,
      tables: area.tables.map(table => 
        table.id === tableId 
          ? { 
              ...table, 
              status, 
              customerName: status === "occupied" || status === "reserved" ? customerName : undefined,
              orderTime: status === "occupied" ? new Date() : undefined,
            }
          : table
      )
    })));
    setShowTableDialog(false);
    setSelectedTable(null);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getTimeElapsed = (orderTime: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - orderTime.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m`;
    } else {
      const hours = Math.floor(diffInMinutes / 60);
      const minutes = diffInMinutes % 60;
      return `${hours}h ${minutes}m`;
    }
  };

  const stats = getTableStats();

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
      <div className="bg-emerald-700 text-white p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <MapPin className="w-8 h-8 text-emerald-200" />
              <h1 className="text-xl sm:text-2xl font-bold">Table Management</h1>
            </div>
            <p className="text-emerald-100 text-sm sm:text-base">
              Bloom Garden Cafe - Ahmedabad Petpooja
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-emerald-100 mr-4">
              <User className="w-4 h-4" />
              <span className="text-sm">
                {currentUser?.name || "Manager"}
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="bg-white text-emerald-700 hover:bg-gray-50"
              onClick={() => setLastUpdated(new Date())}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
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
        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
                <div className="text-sm text-gray-600">Total Tables</div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-l-4 border-l-green-500">
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{stats.available}</div>
                <div className="text-sm text-gray-600">Available</div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-red-500">
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{stats.occupied}</div>
                <div className="text-sm text-gray-600">Occupied</div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-yellow-500">
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{stats.reserved}</div>
                <div className="text-sm text-gray-600">Reserved</div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-400">
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">{stats.cleaning}</div>
                <div className="text-sm text-gray-600">Cleaning</div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-gray-500">
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-600">{stats.outOfOrder}</div>
                <div className="text-sm text-gray-600">Out of Order</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Legend */}
        <div className="mb-6">
          <div className="bg-white p-4 rounded-lg border">
            <h3 className="text-lg font-semibold mb-3">Table Status Legend</h3>
            <div className="flex flex-wrap gap-4">
              {Object.entries(TABLE_STATUS_CONFIG).map(([status, config]) => {
                const IconComponent = config.icon;
                return (
                  <div key={status} className="flex items-center gap-2">
                    <div className={`px-3 py-1 rounded-full border ${config.color} flex items-center gap-1`}>
                      <IconComponent className="w-3 h-3" />
                      <span className="text-xs font-medium">{config.label}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Table Areas */}
        <div className="space-y-6">
          {areas.map((area) => (
            <Card key={area.id} className={`${area.color} border-2`}>
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-bold flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    {area.name}
                  </CardTitle>
                  <div className="text-sm text-gray-600">
                    {area.tables.filter(t => t.status === "available").length} / {area.tables.length} Available
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {area.tables.map((table) => {
                    const statusConfig = TABLE_STATUS_CONFIG[table.status];
                    const IconComponent = statusConfig.icon;
                    
                    return (
                      <div
                        key={table.id}
                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md ${statusConfig.color}`}
                        onClick={() => {
                          setSelectedTable(table);
                          setShowTableDialog(true);
                        }}
                      >
                        <div className="text-center space-y-2">
                          <div className="flex items-center justify-center gap-1">
                            <IconComponent className="w-4 h-4" />
                            <span className="font-bold text-lg">{table.number}</span>
                          </div>
                          
                          <div className="text-xs">
                            <div>Capacity: {table.capacity}</div>
                            {table.customerName && (
                              <div className="font-medium">{table.customerName}</div>
                            )}
                            {table.orderTime && (
                              <div className="text-xs opacity-75">
                                {getTimeElapsed(table.orderTime)} ago
                              </div>
                            )}
                            {table.estimatedTime && (
                              <div className="text-xs opacity-75">
                                ETA: {table.estimatedTime}m
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Last Updated */}
        <div className="mt-6 text-center text-sm text-gray-500">
          Last updated: {formatTime(lastUpdated)}
        </div>
      </div>

      {/* Table Management Dialog */}
      <Dialog open={showTableDialog} onOpenChange={setShowTableDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              Manage Table {selectedTable?.number}
            </DialogTitle>
            <DialogDescription>
              Update table status and customer information
            </DialogDescription>
          </DialogHeader>

          {selectedTable && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Area</Label>
                  <div className="text-sm text-gray-600">{selectedTable.area}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Capacity</Label>
                  <div className="text-sm text-gray-600">{selectedTable.capacity} seats</div>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Current Status</Label>
                <div className="mt-1">
                  <Badge className={TABLE_STATUS_CONFIG[selectedTable.status].color}>
                    {TABLE_STATUS_CONFIG[selectedTable.status].label}
                  </Badge>
                </div>
              </div>

              {selectedTable.customerName && (
                <div>
                  <Label className="text-sm font-medium">Customer</Label>
                  <div className="text-sm text-gray-600">{selectedTable.customerName}</div>
                </div>
              )}

              {selectedTable.orderTime && (
                <div>
                  <Label className="text-sm font-medium">Order Time</Label>
                  <div className="text-sm text-gray-600">
                    {formatTime(selectedTable.orderTime)} ({getTimeElapsed(selectedTable.orderTime)} ago)
                  </div>
                </div>
              )}

              <div className="pt-4 border-t">
                <Label className="text-sm font-medium">Update Status</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-green-700 border-green-300 hover:bg-green-50"
                    onClick={() => updateTableStatus(selectedTable.id, "available")}
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Available
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-700 border-red-300 hover:bg-red-50"
                    onClick={() => updateTableStatus(selectedTable.id, "occupied", "Walk-in Customer")}
                  >
                    <Users className="w-4 h-4 mr-1" />
                    Occupied
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-yellow-700 border-yellow-300 hover:bg-yellow-50"
                    onClick={() => updateTableStatus(selectedTable.id, "reserved", "Reserved Customer")}
                  >
                    <Clock className="w-4 h-4 mr-1" />
                    Reserved
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-blue-700 border-blue-300 hover:bg-blue-50"
                    onClick={() => updateTableStatus(selectedTable.id, "cleaning")}
                  >
                    <RefreshCw className="w-4 h-4 mr-1" />
                    Cleaning
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-gray-700 border-gray-300 hover:bg-gray-50 col-span-2"
                    onClick={() => updateTableStatus(selectedTable.id, "out-of-order")}
                  >
                    <XCircle className="w-4 h-4 mr-1" />
                    Out of Order
                  </Button>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTableDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
