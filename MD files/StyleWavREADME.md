# StyleWav - Modern E-Commerce Platform

A full-featured Next.js 15 e-commerce application for selling trendy t-shirts and streetwear, featuring a JSON-based database system, Firebase authentication, and a comprehensive admin panel.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Technology Stack](#technology-stack)
- [Database Architecture](#database-architecture)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [API Routes](#api-routes)
- [Key Features](#key-features)
- [Development Guide](#development-guide)

---

## 🌟 Overview

StyleWav is a modern, full-stack e-commerce web application built with Next.js 15 and React 19. It provides a complete shopping experience with cart management, checkout process, order tracking, customer management, and an administrative dashboard for product and order management.

The application uses a **JSON file-based database system** for development/demo purposes, making it easy to set up and understand without requiring a traditional database server.

---

## 🛠 Technology Stack

### Frontend
- **Framework**: Next.js 15 (App Router)
- **UI Library**: React 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Component Library**: shadcn/ui (Radix UI primitives)
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **State Management**: Zustand

### Backend & Data
- **Database**: JSON file-based system
- **Authentication**: Firebase Auth with Google OAuth
- **API**: Next.js API Routes (REST)
- **File Storage**: Local file system

### Additional Tools
- **Form Handling**: React Hook Form + Zod validation
- **Carousel**: Embla Carousel
- **Analytics**: Vercel Analytics
- **Date Handling**: date-fns

---

## 🗄️ Database Architecture

### Overview

StyleWav uses a **JSON file-based database system** located in the `jsonDatabase/` directory. This approach is perfect for development, prototyping, and small-to-medium scale deployments.

### Database Files

```
jsonDatabase/
├── products.json         # Product catalog with inventory
├── orders.json          # Order history and tracking
├── customers.json       # Customer profiles, carts, wishlists
├── coins.json           # Customer coin balances and transactions
├── offers.json          # Active offers and promotions
├── notifications.json   # Customer notifications
├── careers.json         # Job listings
├── media.json           # Banner and media management
└── settings.json        # Application settings
```

### Data Models

#### Products (`products.json`)
```typescript
{
  id: string              // Unique product ID (e.g., "sw-001")
  name: string            // Product name
  price: number           // Price in INR (paise)
  image: string           // Main product image URL
  images: string[]        // Array of product images
  description: string     // Product description
  category: string        // Product category
  sizes: string[]         // Available sizes
  colors: string[]        // Available colors
  sizeStock: {            // Size-specific inventory
    [size: string]: number
  }
  stockQuantity: number   // Total stock (sum of sizeStock)
  inStock: boolean        // Availability flag
  unlimitedStock: boolean // Unlimited inventory flag
  lowStockThreshold: number // Alert threshold
  rating: number          // Product rating (0-5)
  reviews: number         // Number of reviews
}
```

#### Orders (`orders.json`)
```typescript
{
  id: string                    // Unique order ID
  orderNumber: string           // Human-readable order number (e.g., "ORD-123456-789")
  customerId: string            // Customer ID reference
  customerEmail: string         // Customer email
  items: OrderItem[]            // Array of ordered items
  subtotal: number              // Subtotal amount
  shipping: number              // Shipping cost
  total: number                 // Total amount
  status: OrderStatus           // Order lifecycle status
  paymentStatus: PaymentStatus  // Payment state
  paymentMethod?: string        // Payment method used
  shippingAddress: ShippingAddress
  orderDate: string             // ISO timestamp
  updatedAt: string             // Last update timestamp
  trackingNumber?: string       // Shipping tracking number
  notes?: string                // Additional notes
}
```

**Order Statuses**: `pending`, `confirmed`, `processing`, `shipped`, `delivered`, `cancelled`

**Payment Statuses**: `pending`, `paid`, `failed`, `refunded`

#### Customers (`customers.json`)
```typescript
{
  id: string                    // Unique customer ID
  email: string                 // Customer email (unique)
  firstName: string
  lastName: string
  phone: string
  dateJoined: string            // ISO timestamp
  lastActive: string            // Last activity timestamp
  isActive: boolean             // Account status
  
  // Addresses
  defaultShippingAddress?: ShippingAddress
  addresses: ShippingAddress[]  // Saved addresses
  
  // Shopping Data
  wishlist: CustomerWishlistItem[]
  cart: CustomerCartItem[]
  
  // Order History
  totalOrders: number           // Lifetime order count
  totalSpent: number            // Lifetime spending
  lastOrderDate?: string
  
  // Preferences
  emailMarketing: boolean
  smsMarketing: boolean
  preferences: {
    currency: string
    notifications: boolean
    [key: string]: any
  }
}
```

#### Coins System (`coins.json`)
Customer loyalty coin system with transactions:
```typescript
{
  customerId: string
  customerEmail: string
  balance: number               // Current coin balance
  totalEarned: number           // Total coins earned
  totalSpent: number            // Total coins spent
  transactions: CoinTransaction[]
}
```

#### Offers (`offers.json`)
Promotional offers and discounts:
```typescript
{
  id: string
  name: string
  description: string
  type: 'product' | 'combo' | 'payment_method' | 'category' | 'sitewide'
  discountType: 'percentage' | 'fixed' | 'coins'
  discountValue: number
  productIds?: string[]
  paymentMethods?: string[]
  minPurchaseAmount?: number
  maxDiscountAmount?: number
  startDate: string
  endDate: string
  isActive: boolean
  usageCount: number
  priority: number
}
```

### Database Operations

#### Core Functions

**Products** (`lib/database.ts`)
- `readProductsFromFile()`: Read all products
- `writeProductsToFile(products)`: Write products to file
- `initializeProductsFile()`: Initialize with default products

**Orders** (`lib/orders-database.ts`)
- `createOrder(orderData)`: Create new order
- `getOrderById(orderId)`: Get specific order
- `getOrdersByCustomerId(customerId)`: Get customer orders
- `updateOrder(orderId, updates)`: Update order
- `getAllOrders(filters?)`: Get filtered orders
- `getOrderStatistics()`: Get order analytics

**Customers** (`lib/customers-database.ts`)
- `createCustomer(customerData)`: Create new customer
- `getCustomerById(customerId)`: Get specific customer
- `getCustomerByEmail(email)`: Get customer by email
- `updateCustomer(customerId, updates)`: Update customer
- `addToWishlist(customerId, item)`: Add item to wishlist
- `updateCustomerCart(customerId, cart)`: Update shopping cart
- `getAllCustomers(filters?)`: Get filtered customers

### Data Persistence

- All database operations are **file-based** using Node.js `fs/promises`
- Data is stored as **formatted JSON** with 2-space indentation
- Database directory is created automatically if it doesn't exist
- Each operation includes logging for debugging and monitoring
- All timestamps use **ISO 8601 format**

### Advantages of JSON-Based System

✅ **No Database Server Required**: No PostgreSQL, MySQL, or MongoDB setup  
✅ **Version Control Friendly**: Data files can be committed to git  
✅ **Easy Debugging**: Human-readable data format  
✅ **Simple Backup**: Copy files to backup data  
✅ **Fast Development**: No migrations or schema changes  
✅ **Portable**: Works anywhere Node.js runs  

### Migration Path

For production deployment, the JSON files can be easily migrated to:
- **PostgreSQL/MySQL**: Using Prisma ORM or TypeORM
- **MongoDB**: Direct JSON import
- **Firebase Firestore**: Collection-based migration
- **Supabase**: PostgreSQL with REST API

---

## 📁 Project Structure

```
StyleWav/
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes
│   │   ├── admin/               # Admin endpoints
│   │   │   ├── products/        # Product management
│   │   │   ├── offers/          # Offer management
│   │   │   ├── coins/           # Coin system admin
│   │   │   ├── media/           # Media upload
│   │   │   └── notifications/   # Notification management
│   │   ├── coins/               # Coin operations
│   │   ├── customers/           # Customer management
│   │   ├── orders/              # Order processing
│   │   ├── images/              # Image serving
│   │   └── settings/            # App settings
│   ├── cart/                    # Shopping cart page
│   ├── checkout/                # Checkout flow
│   ├── products/                # Product pages
│   ├── admin/                   # Admin dashboard
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Homepage
│   └── globals.css              # Global styles
│
├── components/                   # React Components
│   ├── ui/                      # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   └── ... (40+ components)
│   └── site/                    # App-specific components
│       ├── Header.tsx
│       ├── Footer.tsx
│       ├── ProductCard.tsx
│       └── CategoryTiles.tsx
│
├── lib/                         # Utilities & Database
│   ├── database.ts              # Product database operations
│   ├── orders-database.ts       # Order management
│   ├── customers-database.ts    # Customer operations
│   ├── database-types.ts        # TypeScript interfaces
│   ├── products.ts              # Product utilities
│   ├── firebase.ts              # Firebase config
│   └── utils.ts                 # Helper functions
│
├── hooks/                       # Custom React Hooks
│   └── use-toast.ts
│
├── jsonDatabase/                # JSON Database Files
│   ├── products.json
│   ├── orders.json
│   ├── customers.json
│   ├── coins.json
│   ├── offers.json
│   └── notifications.json
│
├── public/                      # Static Assets
│   └── images/                  # Product images
│
├── scripts/                     # Utility Scripts
│   ├── add-size-stock.js
│   ├── complete-product-data.js
│   └── fix-product-stock.js
│
├── components.json              # shadcn/ui config
├── tailwind.config.ts           # Tailwind configuration
├── tsconfig.json                # TypeScript config
└── package.json                 # Dependencies
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Firebase project (for authentication)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd StyleWav
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```

4. **Initialize the database**
   The database will auto-initialize on first API call, or run:
   ```bash
   npm run dev
   curl http://localhost:3000/api/admin/products
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

   Visit [http://localhost:3000](http://localhost:3000)

### Production Build

```bash
npm run build
npm start
```

---

## 🔌 API Routes

### Public Endpoints

#### Products
- `GET /api/admin/products` - Get all products
- `GET /api/admin/products?id={productId}` - Get product by ID

#### Orders
- `POST /api/orders` - Create new order
- `GET /api/orders?customerId={id}` - Get customer orders
- `GET /api/orders?email={email}` - Get orders by email
- `GET /api/orders?stats=true` - Get order statistics
- `GET /api/orders/{orderId}` - Get specific order
- `PATCH /api/orders/{orderId}` - Update order status

#### Customers
- `POST /api/customers/sync` - Create/sync customer
- `GET /api/customers/{email}` - Get customer by email
- `PATCH /api/customers/{email}` - Update customer
- `POST /api/customers/{email}/addresses` - Manage addresses

#### Coins
- `GET /api/coins?customerId={id}` - Get coin balance
- `POST /api/coins/transaction` - Record coin transaction

### Admin Endpoints

#### Product Management
- `POST /api/admin/products` - Create product
- `PUT /api/admin/products` - Update product
- `DELETE /api/admin/products?id={productId}` - Delete product
- `POST /api/admin/products/upload-image` - Upload product image

#### Offer Management
- `GET /api/admin/offers` - Get all offers
- `POST /api/admin/offers` - Create offer
- `PUT /api/admin/offers/{offerId}` - Update offer
- `DELETE /api/admin/offers/{offerId}` - Delete offer
- `POST /api/admin/offers/apply` - Apply offer to cart

#### Coin Management
- `POST /api/admin/coins` - Gift coins to customer
- `GET /api/admin/coins?customerId={id}` - Get coin history

#### Media Management
- `POST /api/admin/media/upload` - Upload media files
- `GET /api/media/banner` - Get banner configuration
- `POST /api/admin/media/banners` - Update banner configuration

---

## ✨ Key Features

### 🛒 Shopping Experience
- Product browsing with filters and search
- Size and color selection with stock validation
- Real-time cart management with persistent storage
- Wishlist functionality
- Guest and authenticated checkout
- Order tracking and history

### 👤 Customer Management
- Firebase authentication with Google OAuth
- Customer profiles with order history
- Multiple shipping addresses
- Cart and wishlist persistence
- Purchase history and analytics

### 📦 Inventory System
- Size-specific stock tracking
- Automatic stock deduction on orders
- Low stock threshold alerts
- Unlimited stock option for evergreen items
- Stock replenishment tracking

### 💰 Coin System
- Loyalty rewards program
- Coin earning on purchases
- Coin redemption for discounts
- Transaction history
- Admin coin gifting

### 🎁 Offers & Promotions
- Multiple offer types:
  - Product-specific
  - Category-wide
  - Payment method based
  - Combo deals
  - Sitewide promotions
- Percentage or fixed discounts
- Usage limits and expiration
- Priority-based offer stacking

### 📊 Admin Dashboard
- Product CRUD operations
- Order management and tracking
- Customer analytics
- Offer creation and management
- Coin system administration
- Media and banner management

### 🔐 Security Features
- Firebase authentication
- API route protection
- Input validation with Zod
- XSS protection
- CSRF token support ready

---

## 💻 Development Guide

### Adding a New Component

```bash
npx shadcn@latest add [component-name]
```

### Database Operations

#### Creating an Order
```typescript
import { createOrder } from '@/lib/orders-database'

const order = await createOrder({
  customerId: 'customer_123',
  customerEmail: 'user@example.com',
  items: [...],
  subtotal: 1500,
  shipping: 100,
  total: 1600,
  status: 'pending',
  paymentStatus: 'pending',
  shippingAddress: {...}
})
```

#### Updating Customer Cart
```typescript
import { updateCustomerCart } from '@/lib/customers-database'

await updateCustomerCart('customer_123', [
  {
    id: 'sw-001',
    name: 'Product Name',
    price: 699,
    quantity: 2,
    size: 'L',
    image: '/image.png',
    addedAt: new Date().toISOString()
  }
])
```

#### Managing Products
```typescript
import { readProductsFromFile, writeProductsToFile } from '@/lib/database'

// Read products
const products = await readProductsFromFile()

// Update product stock
products[0].sizeStock.M -= 1
products[0].stockQuantity -= 1

// Save changes
await writeProductsToFile(products)
```

### Testing Database Operations

```bash
# Initialize products
curl http://localhost:3000/api/admin/products

# Create test order
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{"customerId":"test","customerEmail":"test@example.com",...}'

# Get order statistics
curl "http://localhost:3000/api/orders?stats=true"

# Get customer details
curl "http://localhost:3000/api/customers/test@example.com"
```

### Scripts

**Add size-specific stock:**
```bash
node scripts/add-size-stock.js
```

**Complete product data:**
```bash
node scripts/complete-product-data.js
```

**Fix product stock inconsistencies:**
```bash
node scripts/fix-product-stock.js
```

### Code Style & Best Practices

1. **TypeScript**: Always use proper types from `lib/database-types.ts`
2. **Error Handling**: Wrap database operations in try-catch blocks
3. **Logging**: Use console logs for debugging database operations
4. **Validation**: Use Zod schemas for API request validation
5. **Components**: Follow shadcn/ui conventions for UI components
6. **File Structure**: Keep related functionality together

### Common Commands

```bash
# Development
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint

# Add shadcn component
npx shadcn@latest add button
```

---

## 📄 License

This project is for educational and demonstration purposes.

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit issues and pull requests.

---

## 📧 Contact

For questions or support, please contact the development team.

---

**Built with ❤️ using Next.js, React, and modern web technologies**
