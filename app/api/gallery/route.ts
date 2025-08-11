import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const GALLERY_FILE = path.join(process.cwd(), 'data', 'gallery.json');

function readGalleryData() {
  try {
    const data = fs.readFileSync(GALLERY_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading gallery data:', error);
    return { items: [], categories: [] };
  }
}

function writeGalleryData(data: any) {
  try {
    fs.writeFileSync(GALLERY_FILE, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing gallery data:', error);
    return false;
  }
}

// GET - Fetch all gallery items or filtered by category/type
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const type = searchParams.get('type');
    const featured = searchParams.get('featured');
    const limit = searchParams.get('limit');

    const galleryData = readGalleryData();
    let items = galleryData.items;

    // Apply filters
    if (category && category !== 'all') {
      items = items.filter((item: any) => item.category === category);
    }

    if (type && type !== 'all') {
      items = items.filter((item: any) => item.type === type);
    }

    if (featured === 'true') {
      items = items.filter((item: any) => item.featured === true);
    }

    // Sort by upload date (newest first)
    items.sort((a: any, b: any) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());

    // Apply limit
    if (limit && parseInt(limit) > 0) {
      items = items.slice(0, parseInt(limit));
    }

    return NextResponse.json({
      success: true,
      items,
      categories: galleryData.categories,
      total: items.length
    });
  } catch (error) {
    console.error('Error fetching gallery data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch gallery data' },
      { status: 500 }
    );
  }
}

// POST - Add new gallery item
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const requiredFields = ['type', 'url', 'title', 'category'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { success: false, error: `${field} is required` },
          { status: 400 }
        );
      }
    }

    const galleryData = readGalleryData();
    
    // Generate new ID
    const newId = Date.now().toString();
    
    // Create new gallery item
    const newItem = {
      id: newId,
      type: body.type,
      url: body.url,
      thumbnail: body.thumbnail || body.url,
      title: body.title,
      description: body.description || '',
      category: body.category,
      uploadedAt: new Date().toISOString(),
      uploadedBy: body.uploadedBy || 'admin@bloomcafe.com',
      featured: body.featured || false,
      tags: body.tags || [],
      ...(body.type === 'video' && body.duration && { duration: body.duration })
    };

    // Add to gallery
    galleryData.items.push(newItem);
    
    // Save to file
    if (!writeGalleryData(galleryData)) {
      throw new Error('Failed to save gallery data');
    }

    return NextResponse.json({
      success: true,
      message: 'Gallery item added successfully',
      item: newItem
    });
  } catch (error) {
    console.error('Error adding gallery item:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to add gallery item' },
      { status: 500 }
    );
  }
}

// PUT - Update gallery item
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    
    if (!body.id) {
      return NextResponse.json(
        { success: false, error: 'Item ID is required' },
        { status: 400 }
      );
    }

    const galleryData = readGalleryData();
    const itemIndex = galleryData.items.findIndex((item: any) => item.id === body.id);
    
    if (itemIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Gallery item not found' },
        { status: 404 }
      );
    }

    // Update item
    galleryData.items[itemIndex] = {
      ...galleryData.items[itemIndex],
      ...body,
      id: body.id, // Ensure ID doesn't change
      uploadedAt: galleryData.items[itemIndex].uploadedAt // Preserve original upload date
    };

    // Save to file
    if (!writeGalleryData(galleryData)) {
      throw new Error('Failed to save gallery data');
    }

    return NextResponse.json({
      success: true,
      message: 'Gallery item updated successfully',
      item: galleryData.items[itemIndex]
    });
  } catch (error) {
    console.error('Error updating gallery item:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update gallery item' },
      { status: 500 }
    );
  }
}

// DELETE - Remove gallery item
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Item ID is required' },
        { status: 400 }
      );
    }

    const galleryData = readGalleryData();
    const itemIndex = galleryData.items.findIndex((item: any) => item.id === id);
    
    if (itemIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Gallery item not found' },
        { status: 404 }
      );
    }

    // Remove item
    const removedItem = galleryData.items.splice(itemIndex, 1)[0];

    // Save to file
    if (!writeGalleryData(galleryData)) {
      throw new Error('Failed to save gallery data');
    }

    return NextResponse.json({
      success: true,
      message: 'Gallery item deleted successfully',
      item: removedItem
    });
  } catch (error) {
    console.error('Error deleting gallery item:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete gallery item' },
      { status: 500 }
    );
  }
}
