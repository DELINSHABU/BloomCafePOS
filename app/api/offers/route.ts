import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const OFFERS_FILE = path.join(process.cwd(), 'offers.json')

interface Offer {
  id: string
  itemId: string
  itemName: string
  itemType: 'menu' | 'special' // menu item or today's special
  originalPrice: number
  offerPrice: number
  discountPercentage: number
  isActive: boolean
  startDate?: string
  endDate?: string
  createdAt: string
  updatedAt: string
}

interface OffersData {
  offers: Offer[]
  lastUpdated: string
}

// Helper function to read offers data
function readOffersData(): OffersData {
  try {
    if (fs.existsSync(OFFERS_FILE)) {
      console.log('🎯 JSON FILE ACCESS: offers.json accessed from api/offers/route.ts -> readOffersData()');
      const data = fs.readFileSync(OFFERS_FILE, 'utf8')
      return JSON.parse(data)
    }
    return { offers: [], lastUpdated: new Date().toISOString() }
  } catch (error) {
    console.error('Error reading offers.json:', error)
    return { offers: [], lastUpdated: new Date().toISOString() }
  }
}

// Helper function to write offers data
function writeOffersData(data: OffersData): boolean {
  try {
    console.log('💾 JSON FILE ACCESS: offers.json updated from api/offers/route.ts -> writeOffersData()');
    data.lastUpdated = new Date().toISOString()
    fs.writeFileSync(OFFERS_FILE, JSON.stringify(data, null, 2))
    return true
  } catch (error) {
    console.error('Error writing offers.json:', error)
    return false
  }
}

// GET - Fetch all offers
export async function GET() {
  try {
    const offersData = readOffersData()
    return NextResponse.json({ success: true, offers: offersData.offers })
  } catch (error) {
    console.error('Error fetching offers:', error)
    return NextResponse.json(
      { error: 'Failed to fetch offers' },
      { status: 500 }
    )
  }
}

// POST - Add new offer
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { itemId, itemName, itemType, originalPrice, offerPrice, isActive = true, startDate, endDate } = body

    if (!itemId || !itemName || !itemType || !originalPrice || !offerPrice) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (offerPrice >= originalPrice) {
      return NextResponse.json(
        { error: 'Offer price must be less than original price' },
        { status: 400 }
      )
    }

    const offersData = readOffersData()
    const discountPercentage = Math.round(((originalPrice - offerPrice) / originalPrice) * 100)
    
    const newOffer: Offer = {
      id: Date.now().toString(),
      itemId,
      itemName,
      itemType,
      originalPrice: Number(originalPrice),
      offerPrice: Number(offerPrice),
      discountPercentage,
      isActive,
      startDate,
      endDate,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    // Remove existing offer for the same item if exists
    offersData.offers = offersData.offers.filter(offer => offer.itemId !== itemId || offer.itemType !== itemType)
    offersData.offers.push(newOffer)
    
    if (writeOffersData(offersData)) {
      return NextResponse.json({ success: true, offer: newOffer })
    } else {
      return NextResponse.json(
        { error: 'Failed to save offer' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error adding offer:', error)
    return NextResponse.json(
      { error: 'Failed to add offer' },
      { status: 500 }
    )
  }
}

// PUT - Update existing offer
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, itemId, itemName, itemType, originalPrice, offerPrice, isActive, startDate, endDate } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Offer ID is required' },
        { status: 400 }
      )
    }

    const offersData = readOffersData()
    const offerIndex = offersData.offers.findIndex(offer => offer.id === id)

    if (offerIndex === -1) {
      return NextResponse.json(
        { error: 'Offer not found' },
        { status: 404 }
      )
    }

    if (offerPrice && originalPrice && offerPrice >= originalPrice) {
      return NextResponse.json(
        { error: 'Offer price must be less than original price' },
        { status: 400 }
      )
    }

    // Update the offer
    const updatedOffer = {
      ...offersData.offers[offerIndex],
      ...(itemId !== undefined && { itemId }),
      ...(itemName !== undefined && { itemName }),
      ...(itemType !== undefined && { itemType }),
      ...(originalPrice !== undefined && { originalPrice: Number(originalPrice) }),
      ...(offerPrice !== undefined && { offerPrice: Number(offerPrice) }),
      ...(isActive !== undefined && { isActive }),
      ...(startDate !== undefined && { startDate }),
      ...(endDate !== undefined && { endDate }),
      updatedAt: new Date().toISOString()
    }

    // Recalculate discount percentage if prices changed
    if (originalPrice !== undefined || offerPrice !== undefined) {
      updatedOffer.discountPercentage = Math.round(((updatedOffer.originalPrice - updatedOffer.offerPrice) / updatedOffer.originalPrice) * 100)
    }

    offersData.offers[offerIndex] = updatedOffer

    if (writeOffersData(offersData)) {
      return NextResponse.json({ success: true, offer: updatedOffer })
    } else {
      return NextResponse.json(
        { error: 'Failed to update offer' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error updating offer:', error)
    return NextResponse.json(
      { error: 'Failed to update offer' },
      { status: 500 }
    )
  }
}

// DELETE - Remove offer
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Offer ID is required' },
        { status: 400 }
      )
    }

    const offersData = readOffersData()
    const filteredOffers = offersData.offers.filter(offer => offer.id !== id)

    if (filteredOffers.length === offersData.offers.length) {
      return NextResponse.json(
        { error: 'Offer not found' },
        { status: 404 }
      )
    }

    offersData.offers = filteredOffers

    if (writeOffersData(offersData)) {
      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json(
        { error: 'Failed to delete offer' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error deleting offer:', error)
    return NextResponse.json(
      { error: 'Failed to delete offer' },
      { status: 500 }
    )
  }
}