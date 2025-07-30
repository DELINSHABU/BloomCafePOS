"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Star, Plus, Edit, Trash2, Save, X, Loader2 } from "lucide-react";

interface TodaysSpecialItem {
  id: string;
  name: string;
  price: number;
  description: string;
  category: string;
  isActive: boolean;
}

interface TodaysSpecialManagerProps {
  currentUser?: { username: string; role: string; name: string };
}

export default function TodaysSpecialManager({
  currentUser,
}: TodaysSpecialManagerProps) {
  const [specialItems, setSpecialItems] = useState<TodaysSpecialItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<TodaysSpecialItem | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newItem, setNewItem] = useState<Omit<TodaysSpecialItem, "id">>({
    name: "",
    price: 0,
    description: "",
    category: "Main Course",
    isActive: true,
  });

  const categories = [
    "Main Course",
    "Beverages",
    "Appetizers",
    "Desserts",
    "Snacks",
  ];

  // Load Today's Special items from API
  useEffect(() => {
    loadSpecialItems();
  }, []);

  const loadSpecialItems = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/todays-special');
      if (response.ok) {
        const data = await response.json();
        setSpecialItems(data.items || []);
      } else {
        console.error('Failed to load Today\'s Special items');
      }
    } catch (error) {
      console.error('Error loading Today\'s Special items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!editingItem) return;

    try {
      const response = await fetch('/api/todays-special', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editingItem),
      });

      if (response.ok) {
        const data = await response.json();
        setSpecialItems(items =>
          items.map(item => item.id === editingItem.id ? data.item : item)
        );
        setEditingItem(null);
      } else {
        alert('Failed to update item. Please try again.');
      }
    } catch (error) {
      console.error('Error updating item:', error);
      alert('Failed to update item. Please try again.');
    }
  };

  const handleAddNew = async () => {
    if (!newItem.name || !newItem.price || newItem.price <= 0) {
      alert('Please fill in all required fields with valid values.');
      return;
    }

    try {
      const response = await fetch('/api/todays-special', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newItem),
      });

      if (response.ok) {
        const data = await response.json();
        setSpecialItems(items => [...items, data.item]);
        setNewItem({
          name: "",
          price: 0,
          description: "",
          category: "Main Course",
          isActive: true,
        });
        setIsAddingNew(false);
      } else {
        alert('Failed to add item. Please try again.');
      }
    } catch (error) {
      console.error('Error adding item:', error);
      alert('Failed to add item. Please try again.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) {
      return;
    }

    try {
      const response = await fetch(`/api/todays-special?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setSpecialItems(items => items.filter(item => item.id !== id));
      } else {
        alert('Failed to delete item. Please try again.');
      }
    } catch (error) {
      console.error('Error deleting item:', error);
      alert('Failed to delete item. Please try again.');
    }
  };

  const toggleActive = async (id: string) => {
    const item = specialItems.find(item => item.id === id);
    if (!item) return;

    try {
      const updatedItem = { ...item, isActive: !item.isActive };
      const response = await fetch('/api/todays-special', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedItem),
      });

      if (response.ok) {
        const data = await response.json();
        setSpecialItems(items =>
          items.map(item => item.id === id ? data.item : item)
        );
      } else {
        alert('Failed to update item status. Please try again.');
      }
    } catch (error) {
      console.error('Error toggling item status:', error);
      alert('Failed to update item status. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
          <span className="text-gray-600">Loading Today's Special items...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Star className="w-6 h-6 text-yellow-500" />
            Today's Special Management
          </h2>
          <p className="text-gray-600 mt-1">
            Manage featured items that appear on the home page
          </p>
        </div>
        <Button
          onClick={() => setIsAddingNew(true)}
          className="bg-emerald-600 hover:bg-emerald-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add New Special
        </Button>
      </div>

      {/* Add New Item Form */}
      {isAddingNew && (
        <Card className="mb-6 border-emerald-200">
          <CardHeader className="bg-emerald-50">
            <CardTitle className="text-emerald-700">
              Add New Special Item
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="new-name">Item Name *</Label>
                <Input
                  id="new-name"
                  value={newItem.name}
                  onChange={(e) =>
                    setNewItem({ ...newItem, name: e.target.value })
                  }
                  placeholder="Enter item name"
                />
              </div>
              <div>
                <Label htmlFor="new-price">Price (₹) *</Label>
                <Input
                  id="new-price"
                  type="number"
                  value={newItem.price || ""}
                  onChange={(e) =>
                    setNewItem({ ...newItem, price: Number(e.target.value) })
                  }
                  placeholder="Enter price"
                />
              </div>
              <div>
                <Label htmlFor="new-category">Category *</Label>
                <Select
                  value={newItem.category}
                  onValueChange={(value) =>
                    setNewItem({ ...newItem, category: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="new-description">Description *</Label>
                <Textarea
                  id="new-description"
                  value={newItem.description}
                  onChange={(e) =>
                    setNewItem({ ...newItem, description: e.target.value })
                  }
                  placeholder="Enter description"
                  rows={3}
                />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button
                onClick={handleAddNew}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                <Save className="w-4 h-4 mr-2" />
                Add Item
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsAddingNew(false);
                  setNewItem({
                    name: "",
                    price: 0,
                    description: "",
                    category: "Main Course",
                    isActive: true,
                  });
                }}
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Special Items List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {specialItems.map((item) => (
          <Card
            key={item.id}
            className={`${
              item.isActive
                ? "border-emerald-200"
                : "border-gray-200 opacity-60"
            }`}
          >
            <CardContent className="p-4">
              {editingItem?.id === item.id ? (
                // Edit Mode
                <div className="space-y-4">
                  <div>
                    <Label htmlFor={`edit-name-${item.id}`}>Item Name</Label>
                    <Input
                      id={`edit-name-${item.id}`}
                      value={editingItem.name}
                      onChange={(e) =>
                        setEditingItem({ ...editingItem, name: e.target.value })
                      }
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor={`edit-price-${item.id}`}>Price (₹)</Label>
                      <Input
                        id={`edit-price-${item.id}`}
                        type="number"
                        value={editingItem.price}
                        onChange={(e) =>
                          setEditingItem({
                            ...editingItem,
                            price: Number(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor={`edit-category-${item.id}`}>
                        Category
                      </Label>
                      <Select
                        value={editingItem.category}
                        onValueChange={(value) =>
                          setEditingItem({ ...editingItem, category: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor={`edit-description-${item.id}`}>
                      Description
                    </Label>
                    <Textarea
                      id={`edit-description-${item.id}`}
                      value={editingItem.description}
                      onChange={(e) =>
                        setEditingItem({
                          ...editingItem,
                          description: e.target.value,
                        })
                      }
                      rows={2}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={handleSaveEdit}
                      size="sm"
                      className="bg-emerald-600 hover:bg-emerald-700"
                    >
                      <Save className="w-4 h-4 mr-1" />
                      Save
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingItem(null)}
                    >
                      <X className="w-4 h-4 mr-1" />
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                // View Mode
                <div>
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-lg text-gray-800">
                        {item.name}
                      </h3>
                      <p className="text-emerald-600 font-bold text-lg">
                        ₹{item.price}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={item.isActive ? "default" : "secondary"}>
                        {item.isActive ? "Active" : "Inactive"}
                      </Badge>
                      <Badge variant="outline">{item.category}</Badge>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm mb-4">
                    {item.description}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingItem(item)}
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant={item.isActive ? "outline" : "default"}
                      size="sm"
                      onClick={() => toggleActive(item.id)}
                      className={
                        item.isActive
                          ? ""
                          : "bg-emerald-600 hover:bg-emerald-700"
                      }
                    >
                      {item.isActive ? "Deactivate" : "Activate"}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(item.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {specialItems.length === 0 && !loading && (
        <Card className="text-center py-12">
          <CardContent>
            <Star className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              No Special Items
            </h3>
            <p className="text-gray-500 mb-4">
              Add your first special item to get started
            </p>
            <Button
              onClick={() => setIsAddingNew(true)}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Special Item
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}