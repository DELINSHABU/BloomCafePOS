interface ComboItem {
  itemId: string
  itemName: string
  quantity: number
  originalPrice: number
}

interface Combo {
  id: string
  name: string
  description: string
  items: ComboItem[]
  originalTotal: number
  comboPrice: number
  discountAmount: number
  discountPercentage: number
  isActive: boolean
  category: string
  createdAt: string
  updatedAt: string
}

// Cache for combos to avoid repeated API calls
let combosCache: Combo[] | null = null
let cacheTimestamp: number = 0
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

export async function getActiveCombos(): Promise<Combo[]> {
  const now = Date.now()
  
  // Return cached data if it's still fresh
  if (combosCache && (now - cacheTimestamp) < CACHE_DURATION) {
    return combosCache
  }

  try {
    const response = await fetch('/api/combos')
    if (response.ok) {
      const data = await response.json()
      const activeCombos = (data.combos || []).filter((combo: Combo) => combo.isActive)
      
      // Update cache
      combosCache = activeCombos
      cacheTimestamp = now
      
      return activeCombos
    }
  } catch (error) {
    console.error('Error fetching combos:', error)
  }
  
  return []
}

export function getComboById(combos: Combo[], comboId: string): Combo | null {
  return combos.find(combo => combo.id === comboId && combo.isActive) || null
}

export function formatComboForCart(combo: Combo): {
  id: string
  name: string
  description: string
  price: number
  originalPrice: number
  discountPercentage: number
  items: ComboItem[]
  isCombo: boolean
} {
  return {
    id: `combo-${combo.id}`,
    name: combo.name,
    description: combo.description,
    price: combo.comboPrice,
    originalPrice: combo.originalTotal,
    discountPercentage: combo.discountPercentage,
    items: combo.items,
    isCombo: true
  }
}

// Sync version for immediate use (fallback)
export function getActiveCombosSync(): Combo[] {
  return combosCache || []
}

// Clear cache when combos are updated
export function clearCombosCache(): void {
  combosCache = null
  cacheTimestamp = 0
}