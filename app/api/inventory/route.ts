import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const INVENTORY_FILE_PATH = path.join(process.cwd(), 'data', 'inventory.json');

interface InventoryItem {
  id: string;
  name: string;
  category: string;
  currentStock: number;
  unit: string;
  minimumStock: number;
  maximumStock: number;
  unitPrice: number;
  supplier: string;
  lastRestocked: string;
  expiryDate: string;
  status: 'in_stock' | 'low_stock' | 'out_of_stock';
  description: string;
  // New payment-related fields
  isPaid?: boolean;
  discountPercentage?: number;
  finalPrice?: number;
  paymentMethods?: string[];
  qrCodeImage?: string;
  upiLink?: string;
  supplierPhone?: string;
}

interface InventoryData {
  inventory: InventoryItem[];
  categories: string[];
  suppliers: string[];
  units: string[];
  lastUpdated: string;
  updatedBy: string;
}

// Helper function to read inventory data
function readInventoryData(): InventoryData {
  try {
    if (!fs.existsSync(INVENTORY_FILE_PATH)) {
      // Create default inventory file if it doesn't exist
      const defaultData: InventoryData = {
        inventory: [],
        categories: [],
        suppliers: [],
        units: [],
        lastUpdated: new Date().toISOString(),
        updatedBy: 'system'
      };
      fs.writeFileSync(INVENTORY_FILE_PATH, JSON.stringify(defaultData, null, 2));
      return defaultData;
    }
    
    const fileContent = fs.readFileSync(INVENTORY_FILE_PATH, 'utf-8');
    return JSON.parse(fileContent);
  } catch (error) {
    console.error('Error reading inventory data:', error);
    throw new Error('Failed to read inventory data');
  }
}

// Helper function to write inventory data
function writeInventoryData(data: InventoryData): void {
  try {
    data.lastUpdated = new Date().toISOString();
    fs.writeFileSync(INVENTORY_FILE_PATH, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error writing inventory data:', error);
    throw new Error('Failed to write inventory data');
  }
}

// Helper function to determine stock status
function getStockStatus(currentStock: number, minimumStock: number): string {
  if (currentStock <= 0) return 'out_of_stock';
  if (currentStock <= minimumStock) return 'low_stock';
  return 'in_stock';
}

// Helper function to generate unique ID
function generateId(): string {
  return 'inv_' + Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// GET - Fetch all inventory items
export async function GET() {
  try {
    const data = readInventoryData();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch inventory data' },
      { status: 500 }
    );
  }
}

// POST - Add new inventory item
export async function POST(request: NextRequest) {
  try {
    const newItem = await request.json();
    
    // Validate required fields
    const requiredFields = ['name', 'category', 'currentStock', 'unit', 'minimumStock', 'maximumStock', 'unitPrice', 'supplier'];
    for (const field of requiredFields) {
      if (!newItem[field] && newItem[field] !== 0) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    const data = readInventoryData();
    
    // Check if item with same name already exists
    const existingItem = data.inventory.find(item => 
      item.name.toLowerCase() === newItem.name.toLowerCase()
    );
    
    if (existingItem) {
      return NextResponse.json(
        { error: 'Item with this name already exists' },
        { status: 409 }
      );
    }

    // Create new inventory item
    const inventoryItem: InventoryItem = {
      id: generateId(),
      name: newItem.name,
      category: newItem.category,
      currentStock: parseFloat(newItem.currentStock),
      unit: newItem.unit,
      minimumStock: parseFloat(newItem.minimumStock),
      maximumStock: parseFloat(newItem.maximumStock),
      unitPrice: parseFloat(newItem.unitPrice),
      supplier: newItem.supplier,
      lastRestocked: newItem.lastRestocked || new Date().toISOString(),
      expiryDate: newItem.expiryDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      status: getStockStatus(parseFloat(newItem.currentStock), parseFloat(newItem.minimumStock)),
      description: newItem.description || '',
      // Add new payment-related fields
      isPaid: newItem.isPaid || false,
      discountPercentage: newItem.discountPercentage ? parseFloat(newItem.discountPercentage) : 0,
      finalPrice: newItem.finalPrice ? parseFloat(newItem.finalPrice) : parseFloat(newItem.unitPrice),
      paymentMethods: newItem.paymentMethods || [],
      qrCodeImage: newItem.qrCodeImage || '',
      upiLink: newItem.upiLink || '',
      supplierPhone: newItem.supplierPhone || ''
    };

    // Add to inventory
    data.inventory.push(inventoryItem);
    
    // Update categories, suppliers, and units arrays if new values
    if (!data.categories.includes(inventoryItem.category)) {
      data.categories.push(inventoryItem.category);
    }
    if (!data.suppliers.includes(inventoryItem.supplier)) {
      data.suppliers.push(inventoryItem.supplier);
    }
    if (!data.units.includes(inventoryItem.unit)) {
      data.units.push(inventoryItem.unit);
    }

    data.updatedBy = newItem.updatedBy || 'admin';
    writeInventoryData(data);

    return NextResponse.json({
      success: true,
      message: 'Inventory item added successfully',
      item: inventoryItem
    });

  } catch (error) {
    console.error('Error adding inventory item:', error);
    return NextResponse.json(
      { error: 'Failed to add inventory item' },
      { status: 500 }
    );
  }
}

// PUT - Update existing inventory item
export async function PUT(request: NextRequest) {
  try {
    const updatedItem = await request.json();
    
    if (!updatedItem.id) {
      return NextResponse.json(
        { error: 'Item ID is required' },
        { status: 400 }
      );
    }

    const data = readInventoryData();
    const itemIndex = data.inventory.findIndex(item => item.id === updatedItem.id);
    
    if (itemIndex === -1) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      );
    }

    // Check if another item with same name exists (excluding current item)
    const duplicateItem = data.inventory.find(item => 
      item.id !== updatedItem.id && 
      item.name.toLowerCase() === updatedItem.name.toLowerCase()
    );
    
    if (duplicateItem) {
      return NextResponse.json(
        { error: 'Another item with this name already exists' },
        { status: 409 }
      );
    }

    // Update the item
    const currentItem = data.inventory[itemIndex];
    const updatedInventoryItem: InventoryItem = {
      ...currentItem,
      name: updatedItem.name || currentItem.name,
      category: updatedItem.category || currentItem.category,
      currentStock: updatedItem.currentStock !== undefined ? parseFloat(updatedItem.currentStock) : currentItem.currentStock,
      unit: updatedItem.unit || currentItem.unit,
      minimumStock: updatedItem.minimumStock !== undefined ? parseFloat(updatedItem.minimumStock) : currentItem.minimumStock,
      maximumStock: updatedItem.maximumStock !== undefined ? parseFloat(updatedItem.maximumStock) : currentItem.maximumStock,
      unitPrice: updatedItem.unitPrice !== undefined ? parseFloat(updatedItem.unitPrice) : currentItem.unitPrice,
      supplier: updatedItem.supplier || currentItem.supplier,
      lastRestocked: updatedItem.lastRestocked || currentItem.lastRestocked,
      expiryDate: updatedItem.expiryDate || currentItem.expiryDate,
      description: updatedItem.description !== undefined ? updatedItem.description : currentItem.description,
      // Update new payment-related fields
      isPaid: updatedItem.isPaid !== undefined ? updatedItem.isPaid : (currentItem.isPaid || false),
      discountPercentage: updatedItem.discountPercentage !== undefined ? parseFloat(updatedItem.discountPercentage) : (currentItem.discountPercentage || 0),
      finalPrice: updatedItem.finalPrice !== undefined ? parseFloat(updatedItem.finalPrice) : (currentItem.finalPrice || currentItem.unitPrice),
      paymentMethods: updatedItem.paymentMethods !== undefined ? updatedItem.paymentMethods : (currentItem.paymentMethods || []),
      qrCodeImage: updatedItem.qrCodeImage !== undefined ? updatedItem.qrCodeImage : (currentItem.qrCodeImage || ''),
      upiLink: updatedItem.upiLink !== undefined ? updatedItem.upiLink : (currentItem.upiLink || ''),
      supplierPhone: updatedItem.supplierPhone !== undefined ? updatedItem.supplierPhone : (currentItem.supplierPhone || '')
    };

    // Update stock status
    updatedInventoryItem.status = getStockStatus(updatedInventoryItem.currentStock, updatedInventoryItem.minimumStock);

    data.inventory[itemIndex] = updatedInventoryItem;
    
    // Update categories, suppliers, and units arrays if new values
    if (!data.categories.includes(updatedInventoryItem.category)) {
      data.categories.push(updatedInventoryItem.category);
    }
    if (!data.suppliers.includes(updatedInventoryItem.supplier)) {
      data.suppliers.push(updatedInventoryItem.supplier);
    }
    if (!data.units.includes(updatedInventoryItem.unit)) {
      data.units.push(updatedInventoryItem.unit);
    }

    data.updatedBy = updatedItem.updatedBy || 'admin';
    writeInventoryData(data);

    return NextResponse.json({
      success: true,
      message: 'Inventory item updated successfully',
      item: updatedInventoryItem
    });

  } catch (error) {
    console.error('Error updating inventory item:', error);
    return NextResponse.json(
      { error: 'Failed to update inventory item' },
      { status: 500 }
    );
  }
}

// DELETE - Remove inventory item
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get('id');
    
    if (!itemId) {
      return NextResponse.json(
        { error: 'Item ID is required' },
        { status: 400 }
      );
    }

    const data = readInventoryData();
    const itemIndex = data.inventory.findIndex(item => item.id === itemId);
    
    if (itemIndex === -1) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      );
    }

    const deletedItem = data.inventory[itemIndex];
    data.inventory.splice(itemIndex, 1);
    
    data.updatedBy = searchParams.get('updatedBy') || 'admin';
    writeInventoryData(data);

    return NextResponse.json({
      success: true,
      message: 'Inventory item deleted successfully',
      deletedItem
    });

  } catch (error) {
    console.error('Error deleting inventory item:', error);
    return NextResponse.json(
      { error: 'Failed to delete inventory item' },
      { status: 500 }
    );
  }
}
