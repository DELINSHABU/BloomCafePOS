import menuData from '../menu.json'

export interface MenuItem {
  itemNo: string
  name: string
  rate: string
}

export interface MenuCategory {
  category: string
  products: MenuItem[]
}

export const getMenuData = (): MenuCategory[] => {
  console.log('🍽️ JSON FILE ACCESS: menu.json accessed from lib/menu-data.ts -> getMenuData()');
  return menuData.categories || menuData.menu || []
}

export const getMenuCategories = (): string[] => {
  const data = getMenuData()
  return data.map(category => category.category)
}

export const getItemsByCategory = (categoryName: string): MenuItem[] => {
  const data = getMenuData()
  const category = data.find(cat => cat.category === categoryName)
  return category ? category.products : []
}

export const getAllItems = (): MenuItem[] => {
  const data = getMenuData()
  return data.flatMap(category => category.products)
}

export const getPopularItems = (): MenuItem[] => {
  // Get some popular items from different categories
  const popularCategories = ['AL FAHAM', 'BIRIYANI', 'MOJITTO', 'SHAKES']
  const popularItems: MenuItem[] = []
  
  popularCategories.forEach(categoryName => {
    const items = getItemsByCategory(categoryName)
    if (items.length > 0) {
      // Take first 2 items from each popular category
      popularItems.push(...items.slice(0, 2))
    }
  })
  
  return popularItems
}

export const formatPrice = (rate: string): number => {
  if (rate === 'APS' || rate === 'none') {
    return 0 // Price on request
  }
  return parseInt(rate) || 0
}

export const getCategoryIcon = (category: string): string => {
  const iconMap: { [key: string]: string } = {
    'Breakfast': '🍳',
    'Starter': '🥗',
    'HOT BEVERAGE': '☕',
    'SOUP': '🍲',
    'SALADS': '🥗',
    'BREADS': '🍞',
    'NADANKOOTTU': '🍛',
    'BIRIYANI': '🍚',
    'MEALS': '🍽️',
    'INDIAN RICE': '🍚',
    'AL FAHAM': '🍗',
    'VEG CURRY': '🍛',
    'NON INDIAN': '🍖',
    'SANDWICH': '🥪',
    'BEEF': '🥩',
    'SEAFOOD': '🦐',
    'GRILLED FISH': '🐟',
    'RICE AND NOODLES': '🍜',
    'VEG CHINESE': '🥢',
    'NON CHINESE': '🥢',
    'BURGER': '🍔',
    'MOJITTO': '🍹',
    'FLAVOR SODA': '🥤',
    'SHARJA': '🥤',
    'SHAKES': '🥤'
  }
  
  return iconMap[category] || '🍴'
}

// Function to get menu data with availability from separate JSON file
export const getMenuDataWithAvailability = async () => {
  try {
    // Fetch availability data from API
    const availabilityResponse = await fetch('/api/menu-availability')
    let availabilityData = { items: {} }
    
    if (availabilityResponse.ok) {
      availabilityData = await availabilityResponse.json()
    }
    
    // Get base menu data
    const data = getMenuData()
    
    // Merge with availability data
    return data.map(category => ({
      ...category,
      products: category.products.map(item => {
        const availability = availabilityData.items[item.itemNo] || {}
        return {
          ...item,
          available: availability.available !== undefined ? availability.available : true,
          currentPrice: availability.price || item.rate,
          originalPrice: item.rate
        }
      })
    }))
  } catch (error) {
    console.error('Error fetching availability data:', error)
    // Fallback to default availability
    const data = getMenuData()
    return data.map(category => ({
      ...category,
      products: category.products.map(item => ({
        ...item,
        available: true,
        currentPrice: item.rate,
        originalPrice: item.rate
      }))
    }))
  }
}

// Synchronous version for components that can't use async
export const getMenuDataWithAvailabilitySync = () => {
  const data = getMenuData()
  return data.map(category => ({
    ...category,
    products: category.products.map(item => ({
      ...item,
      available: true,
      currentPrice: item.rate,
      originalPrice: item.rate
    }))
  }))
}

// Function to update item availability
export const updateItemAvailability = async (itemNo: string, available: boolean) => {
  try {
    const response = await fetch('/api/menu-availability', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ itemNo, available }),
    })
    
    if (!response.ok) {
      throw new Error('Failed to update availability')
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error updating availability:', error)
    throw error
  }
}

// Function to update item price
export const updateItemPrice = async (itemNo: string, price: string) => {
  try {
    const response = await fetch('/api/menu-availability', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ itemNo, price }),
    })
    
    if (!response.ok) {
      throw new Error('Failed to update price')
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error updating price:', error)
    throw error
  }
}

// Function to get popular items with availability
export const getPopularAvailableItems = async () => {
  try {
    const menuWithAvailability = await getMenuDataWithAvailability()
    const popularCategories = ['AL FAHAM', 'BIRIYANI', 'MOJITTO', 'SHAKES']
    const popularItems: any[] = []
    
    popularCategories.forEach(categoryName => {
      const category = menuWithAvailability.find(cat => cat.category === categoryName)
      if (category) {
        const availableItems = category.products.filter(item => item.available)
        popularItems.push(...availableItems.slice(0, 2))
      }
    })
    
    return popularItems
  } catch (error) {
    console.error('Error fetching popular available items:', error)
    // Fallback to regular popular items
    return getPopularItems().map(item => ({
      ...item,
      available: true,
      currentPrice: item.rate,
      originalPrice: item.rate
    }))
  }
}

// Synchronous version for popular items
export const getPopularAvailableItemsSync = () => {
  const popularCategories = ['AL FAHAM', 'BIRIYANI', 'MOJITTO', 'SHAKES']
  const popularItems: any[] = []
  
  popularCategories.forEach(categoryName => {
    const items = getItemsByCategory(categoryName)
    if (items.length > 0) {
      const itemsWithAvailability = items.slice(0, 2).map(item => ({
        ...item,
        available: true,
        currentPrice: item.rate,
        originalPrice: item.rate
      }))
      popularItems.push(...itemsWithAvailability)
    }
  })
  
  return popularItems
}