import fs from 'fs'
import path from 'path'

// JSON file paths
const DATA_DIR = path.join(process.cwd(), 'jsonfiles')
const FILES = {
  MENU: path.join(DATA_DIR, 'menu.json'),
  ORDERS: path.join(DATA_DIR, 'orders.json'),
  ANALYTICS: path.join(DATA_DIR, 'analytics_data.json'),
  COMBOS: path.join(DATA_DIR, 'combos.json'),
  OFFERS: path.join(DATA_DIR, 'offers.json'),
  MENU_AVAILABILITY: path.join(DATA_DIR, 'menu-availability.json'),
  STAFF_CREDENTIALS: path.join(DATA_DIR, 'staff-credentials.json'),
  TASKS: path.join(DATA_DIR, 'tasks.json'),
  TODAYS_SPECIAL: path.join(DATA_DIR, 'todays-special.json')
}

// Generic JSON file operations
export class JsonDataService {
  
  // Read JSON file with error handling
  static readJsonFile<T>(filePath: string, defaultData: T): T {
    try {
      if (fs.existsSync(filePath)) {
        const data = fs.readFileSync(filePath, 'utf8')
        return JSON.parse(data) as T
      }
      return defaultData
    } catch (error) {
      console.error(`Error reading ${filePath}:`, error)
      return defaultData
    }
  }

  // Write JSON file with error handling
  static writeJsonFile<T>(filePath: string, data: T): boolean {
    try {
      const jsonData = {
        ...data,
        lastUpdated: new Date().toISOString()
      }
      fs.writeFileSync(filePath, JSON.stringify(jsonData, null, 2))
      return true
    } catch (error) {
      console.error(`Error writing ${filePath}:`, error)
      return false
    }
  }

  // Create backup of JSON file
  static backupJsonFile(filePath: string): boolean {
    try {
      if (fs.existsSync(filePath)) {
        const backupPath = `${filePath}.backup.${Date.now()}`
        fs.copyFileSync(filePath, backupPath)
        return true
      }
      return false
    } catch (error) {
      console.error(`Error backing up ${filePath}:`, error)
      return false
    }
  }

  // Menu operations
  static getMenu() {
    return this.readJsonFile(FILES.MENU, { 
      menu: [], 
      lastUpdated: new Date().toISOString() 
    })
  }

  static saveMenu(menuData: any) {
    return this.writeJsonFile(FILES.MENU, menuData)
  }

  static getMenuItem(itemNo: string) {
    const menuData = this.getMenu()
    for (const category of menuData.menu) {
      const item = category.products?.find((p: any) => p.itemNo === itemNo)
      if (item) {
        return { ...item, category: category.category }
      }
    }
    return null
  }

  static getMenuByCategory(categoryName: string) {
    const menuData = this.getMenu()
    const category = menuData.menu.find((cat: any) => 
      cat.category.toLowerCase() === categoryName.toLowerCase()
    )
    return category ? { category: category.category, products: category.products } : null
  }

  static updateMenuItem(itemNo: string, updates: any) {
    const menuData = this.getMenu()
    let updated = false
    
    for (const category of menuData.menu) {
      const itemIndex = category.products?.findIndex((p: any) => p.itemNo === itemNo)
      if (itemIndex !== -1) {
        category.products[itemIndex] = { ...category.products[itemIndex], ...updates }
        updated = true
        break
      }
    }
    
    if (updated) {
      this.saveMenu(menuData)
    }
    return updated
  }

  static addMenuItem(newItem: any) {
    const menuData = this.getMenu()
    let categoryIndex = menuData.menu.findIndex((cat: any) => cat.category === newItem.category)
    
    if (categoryIndex === -1) {
      menuData.menu.push({
        category: newItem.category,
        products: [newItem]
      })
    } else {
      menuData.menu[categoryIndex].products.push(newItem)
    }
    
    return this.saveMenu(menuData)
  }

  static deleteMenuItem(itemNo: string) {
    const menuData = this.getMenu()
    let deleted = false
    
    for (const category of menuData.menu) {
      const itemIndex = category.products?.findIndex((p: any) => p.itemNo === itemNo)
      if (itemIndex !== -1) {
        category.products.splice(itemIndex, 1)
        deleted = true
        break
      }
    }
    
    if (deleted) {
      this.saveMenu(menuData)
    }
    return deleted
  }

  // Orders operations
  static getOrders() {
    return this.readJsonFile(FILES.ORDERS, { 
      orders: [], 
      lastUpdated: new Date().toISOString() 
    })
  }

  static saveOrders(ordersData: any) {
    return this.writeJsonFile(FILES.ORDERS, ordersData)
  }

  static addOrder(newOrder: any) {
    const ordersData = this.getOrders()
    const orderWithId = {
      ...newOrder,
      id: `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString()
    }
    ordersData.orders.push(orderWithId)
    const success = this.saveOrders(ordersData)
    
    if (success) {
      // Update analytics after adding order
      this.updateAnalytics()
    }
    
    return success ? orderWithId : null
  }

  static updateOrder(orderId: string, updates: any) {
    const ordersData = this.getOrders()
    const orderIndex = ordersData.orders.findIndex((order: any) => order.id === orderId)
    
    if (orderIndex !== -1) {
      ordersData.orders[orderIndex] = { ...ordersData.orders[orderIndex], ...updates }
      const success = this.saveOrders(ordersData)
      if (success) {
        this.updateAnalytics()
      }
      return success
    }
    return false
  }

  static deleteOrder(orderId: string) {
    const ordersData = this.getOrders()
    const orderIndex = ordersData.orders.findIndex((order: any) => order.id === orderId)
    
    if (orderIndex !== -1) {
      ordersData.orders.splice(orderIndex, 1)
      const success = this.saveOrders(ordersData)
      if (success) {
        this.updateAnalytics()
      }
      return success
    }
    return false
  }

  // Analytics operations
  static getAnalytics() {
    return this.readJsonFile(FILES.ANALYTICS, { 
      lastUpdated: new Date().toISOString(),
      fullRecord: { totalOrders: 0, totalRevenue: 0, orders: [] },
      ordersOverTime: [],
      revenueAnalytics: {
        totalRevenue: 0,
        revenueByStaff: {},
        revenueByMonth: {},
        revenueByDay: {},
        averageOrderValue: 0
      },
      dailyAnalytics: {
        morning: { orders: 0, revenue: 0, staffBreakdown: {} },
        noon: { orders: 0, revenue: 0, staffBreakdown: {} },
        night: { orders: 0, revenue: 0, staffBreakdown: {} },
        fullDay: { orders: 0, revenue: 0, staffBreakdown: {} }
      },
      popularItems: []
    })
  }

  static updateAnalytics() {
    const ordersData = this.getOrders()
    const orders = ordersData.orders || []

    const analytics = {
      lastUpdated: new Date().toISOString(),
      fullRecord: {
        totalOrders: orders.length,
        totalRevenue: orders.reduce((sum: number, order: any) => sum + (order.total || 0), 0),
        orders: orders
      },
      ordersOverTime: [] as any[],
      revenueAnalytics: {
        totalRevenue: 0,
        revenueByStaff: {} as Record<string, number>,
        revenueByMonth: {} as Record<string, any>,
        revenueByDay: {} as Record<string, number>,
        averageOrderValue: 0
      },
      dailyAnalytics: {
        morning: { orders: 0, revenue: 0, staffBreakdown: {} as Record<string, any> },
        noon: { orders: 0, revenue: 0, staffBreakdown: {} as Record<string, any> },
        night: { orders: 0, revenue: 0, staffBreakdown: {} as Record<string, any> },
        fullDay: { orders: 0, revenue: 0, staffBreakdown: {} as Record<string, any> }
      },
      popularItems: [] as any[]
    }

    const monthlyData: Record<string, any> = {}
    const staffRevenue: Record<string, number> = {}
    const itemStats: Record<string, any> = {}

    orders.forEach((order: any) => {
      const date = new Date(order.timestamp)
      const monthKey = date.toLocaleString('en-US', { month: 'long' })
      const dayKey = date.toISOString().split('T')[0]
      const hour = date.getHours()
      
      // Monthly aggregation
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { orders: 0, revenue: 0 }
      }
      monthlyData[monthKey].orders++
      monthlyData[monthKey].revenue += order.total || 0
      
      // Staff revenue tracking
      const staffKey = order.staffMember || 'Customer Orders'
      if (!staffRevenue[staffKey]) {
        staffRevenue[staffKey] = 0
      }
      staffRevenue[staffKey] += order.total || 0
      
      // Daily period tracking
      let period = 'fullDay'
      if (hour >= 6 && hour < 12) period = 'morning'
      else if (hour >= 12 && hour < 18) period = 'noon'
      else if (hour >= 18 && hour < 24) period = 'night'
      
      analytics.dailyAnalytics[period as keyof typeof analytics.dailyAnalytics].orders++
      analytics.dailyAnalytics[period as keyof typeof analytics.dailyAnalytics].revenue += order.total || 0
      analytics.dailyAnalytics.fullDay.orders++
      analytics.dailyAnalytics.fullDay.revenue += order.total || 0
      
      if (!analytics.dailyAnalytics[period as keyof typeof analytics.dailyAnalytics].staffBreakdown[staffKey]) {
        analytics.dailyAnalytics[period as keyof typeof analytics.dailyAnalytics].staffBreakdown[staffKey] = { orders: 0, revenue: 0 }
      }
      analytics.dailyAnalytics[period as keyof typeof analytics.dailyAnalytics].staffBreakdown[staffKey].orders++
      analytics.dailyAnalytics[period as keyof typeof analytics.dailyAnalytics].staffBreakdown[staffKey].revenue += order.total || 0
      
      // Item statistics
      if (order.items && Array.isArray(order.items)) {
        order.items.forEach((item: any) => {
          if (!itemStats[item.name]) {
            itemStats[item.name] = {
              name: item.name,
              totalQuantity: 0,
              totalRevenue: 0,
              orderCount: 0,
              averagePrice: item.price || 0
            }
          }
          itemStats[item.name].totalQuantity += item.quantity || 0
          itemStats[item.name].totalRevenue += (item.price || 0) * (item.quantity || 0)
          itemStats[item.name].orderCount++
        })
      }
      
      // Daily revenue tracking
      if (!analytics.revenueAnalytics.revenueByDay[dayKey]) {
        analytics.revenueAnalytics.revenueByDay[dayKey] = 0
      }
      analytics.revenueAnalytics.revenueByDay[dayKey] += order.total || 0
    })

    // Convert monthly data to array
    analytics.ordersOverTime = Object.entries(monthlyData)
      .sort((a, b) => {
        const monthOrder = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
        return monthOrder.indexOf(a[0]) - monthOrder.indexOf(b[0])
      })
      .map(([month, data]: [string, any]) => ({
        month,
        orders: data.orders,
        revenue: data.revenue,
        john: Math.floor(data.orders * 0.15),
        emily: Math.floor(data.orders * 0.18),
        mike: Math.floor(data.orders * 0.22),
        sarah: Math.floor(data.orders * 0.12),
        david: Math.floor(data.orders * 0.16),
        customer: Math.floor(data.orders * 0.60)
      }))

    // Set revenue analytics
    analytics.revenueAnalytics.totalRevenue = analytics.fullRecord.totalRevenue
    analytics.revenueAnalytics.revenueByStaff = staffRevenue
    analytics.revenueAnalytics.revenueByMonth = monthlyData
    analytics.revenueAnalytics.averageOrderValue = Math.round(
      analytics.fullRecord.totalOrders > 0 
        ? analytics.fullRecord.totalRevenue / analytics.fullRecord.totalOrders 
        : 0
    )

    // Set popular items
    analytics.popularItems = Object.values(itemStats)
      .sort((a: any, b: any) => b.totalQuantity - a.totalQuantity)
      .slice(0, 15)

    return this.writeJsonFile(FILES.ANALYTICS, analytics)
  }

  // Other data operations
  static getCombos() {
    return this.readJsonFile(FILES.COMBOS, { combos: [], lastUpdated: new Date().toISOString() })
  }

  static saveCombos(combosData: any) {
    return this.writeJsonFile(FILES.COMBOS, combosData)
  }

  static getOffers() {
    return this.readJsonFile(FILES.OFFERS, { offers: [], lastUpdated: new Date().toISOString() })
  }

  static saveOffers(offersData: any) {
    return this.writeJsonFile(FILES.OFFERS, offersData)
  }

  static getMenuAvailability() {
    return this.readJsonFile(FILES.MENU_AVAILABILITY, { availability: {}, lastUpdated: new Date().toISOString() })
  }

  static saveMenuAvailability(availabilityData: any) {
    return this.writeJsonFile(FILES.MENU_AVAILABILITY, availabilityData)
  }

  static getStaffCredentials() {
    return this.readJsonFile(FILES.STAFF_CREDENTIALS, { staff: [], lastUpdated: new Date().toISOString() })
  }

  static saveStaffCredentials(staffData: any) {
    return this.writeJsonFile(FILES.STAFF_CREDENTIALS, staffData)
  }

  static getTasks() {
    return this.readJsonFile(FILES.TASKS, { tasks: [], lastUpdated: new Date().toISOString() })
  }

  static saveTasks(tasksData: any) {
    return this.writeJsonFile(FILES.TASKS, tasksData)
  }

  static getTodaysSpecial() {
    return this.readJsonFile(FILES.TODAYS_SPECIAL, { special: null, lastUpdated: new Date().toISOString() })
  }

  static saveTodaysSpecial(specialData: any) {
    return this.writeJsonFile(FILES.TODAYS_SPECIAL, specialData)
  }
}

export default JsonDataService
