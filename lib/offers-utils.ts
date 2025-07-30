interface Offer {
  id: string
  itemId: string
  itemName: string
  itemType: 'menu' | 'special'
  originalPrice: number
  offerPrice: number
  discountPercentage: number
  isActive: boolean
  startDate?: string
  endDate?: string
  createdAt: string
  updatedAt: string
}

// Cache for offers to avoid repeated API calls
let offersCache: Offer[] | null = null
let cacheTimestamp: number = 0
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

export async function getActiveOffers(): Promise<Offer[]> {
  const now = Date.now()
  
  // Return cached data if it's still fresh
  if (offersCache && (now - cacheTimestamp) < CACHE_DURATION) {
    return offersCache
  }

  try {
    const response = await fetch('/api/offers')
    if (response.ok) {
      const data = await response.json()
      const activeOffers = (data.offers || []).filter((offer: Offer) => offer.isActive)
      
      // Update cache
      offersCache = activeOffers
      cacheTimestamp = now
      
      return activeOffers
    }
  } catch (error) {
    console.error('Error fetching offers:', error)
  }
  
  return []
}

export function getOfferForItem(offers: Offer[], itemId: string, itemType: 'menu' | 'special'): Offer | null {
  return offers.find(offer => 
    offer.itemId === itemId && 
    offer.itemType === itemType && 
    offer.isActive
  ) || null
}

export function applyOfferToPrice(originalPrice: number, offer: Offer | null): {
  finalPrice: number
  hasOffer: boolean
  discountPercentage: number
  originalPrice: number
} {
  if (!offer) {
    return {
      finalPrice: originalPrice,
      hasOffer: false,
      discountPercentage: 0,
      originalPrice
    }
  }

  return {
    finalPrice: offer.offerPrice,
    hasOffer: true,
    discountPercentage: offer.discountPercentage,
    originalPrice: offer.originalPrice
  }
}

// Sync version for immediate use (fallback)
export function getActiveOffersSync(): Offer[] {
  return offersCache || []
}