# BloomCafe POS - Restaurant Management System

A comprehensive Next.js 15 point-of-sale and restaurant management system featuring real-time order management, inventory tracking, staff performance analytics, and multi-role authentication with Firebase.

---

## 📸 UI Screenshots

### Analytics Dashboard
The detailed analytics dashboard provides comprehensive insights into waiter performance and customer interactions. It features order distribution charts, monthly order trends, and revenue analytics with real-time data visualization.

![Analytics Dashboard](Screenshots/Screenshot%202026-02-09%20233700.png)

### Waiter Performance Analytics
Individual performance metrics for each waiter including orders handled, revenue generated, average order value, customer ratings, and overall performance scores with configurable time periods.

![Waiter Performance](Screenshots/Screenshot%202026-02-09%20233812.png)

### Inventory Analytics
Comprehensive inventory tracking with distribution charts, stock health monitoring by category, and turnover rate trends. Includes detailed category breakdowns for Oil & Condiments, Vegetables, Rice & Grains, and Flour & Grains.

![Inventory Analytics](Screenshots/Screenshot%202026-02-09%20233829.png)

### POS Billing System
The main point-of-sale interface for staff-assisted ordering. Features menu item browsing with category filters (Veg, Non-veg, Main course, Starter, Beverages), product badges (Available, Popular, New, Special, Combo), and a real-time order cart with tax calculation.

![POS Billing System](Screenshots/Screenshot%202026-02-09%20233939.png)

### Table Management
Real-time table status management across different zones (AC Premium, Garden, Bar). Color-coded status indicators show Available, Occupied, Reserved, Cleaning, and Out of Order tables with customer names and timing information.

![Table Management](Screenshots/Screenshot%202026-02-09%20234009.png)

### Inventory Management Dashboard
Complete inventory management system with stock level tracking, low stock alerts, and visual analytics. Includes inventory by category distribution, stock status breakdown, and inventory grouped by value ranges.

![Inventory Management](Screenshots/Screenshot%202026-02-09%20234156.png)

### Inventory Items & Supplier Analysis
Detailed inventory item listing with category value analysis bar chart and supplier performance radar chart. Shows item details including stock levels, unit prices, suppliers, and expiry dates.

![Inventory Items](Screenshots/Screenshot%202026-02-09%20234209.png)

### Landing Page
The customer-facing landing page featuring the Bloom Garden Cafe branding with the tagline "Where Every Meal Blooms with Flavor - Your Perfect Dining Destination" and the cafe's story section.

![Landing Page](Screenshots/Screenshot%202026-02-09%20234347.png)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Technology Stack](#technology-stack)
- [Key Features](#key-features)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [API Routes](#api-routes)
- [Database Architecture](#database-architecture)
- [User Roles](#user-roles)
- [Development Guide](#development-guide)

---

## 🌟 Overview

BloomCafe POS is a modern, full-stack restaurant management system built with Next.js 15 and React 19. It provides a complete solution for cafe and restaurant operations including point-of-sale billing, order management, inventory tracking, table management, staff performance analytics, and customer self-service ordering via QR codes.

The application features a **multi-role authentication system** (Super Admin, Admin, Waiter) with Firebase authentication for customers and JWT-based authentication for staff members.

---

## 🛠 Technology Stack

### Frontend
- **Framework**: Next.js 15.2.4 (App Router)
- **UI Library**: React 19
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 3.4.17
- **Component Library**: shadcn/ui (Radix UI primitives)
- **Icons**: Lucide React
- **Charts**: Recharts
- **State Management**: React Context API

### Backend & Data
- **Database**: Firebase (Firestore + Realtime DB) + JSON files
- **Authentication**: Firebase Auth (customers) + JWT + bcryptjs (staff)
- **API**: Next.js API Routes (REST)
- **File Storage**: Firebase Storage

### Additional Tools
- **Form Handling**: React Hook Form + Zod validation
- **QR Code**: QR code generation for table ordering
- **Date Handling**: date-fns
- **Deployment**: Vercel + GitHub Pages

---

## ✨ Key Features

### 🛒 POS Billing System
- Staff-assisted order creation
- Menu item browsing with category filters
- Real-time cart management with tax calculation
- Multiple payment method support
- Order type selection (Dine-in/Delivery)

### 📊 Analytics Dashboard
- Order statistics and trends
- Revenue analytics by waiter and customer
- Monthly order tracking
- Performance rating formulas
- Exportable reports

### 👨‍💼 Waiter Performance Tracking
- Individual performance metrics
- Orders handled and revenue generated
- Customer ratings and reviews
- Performance percentage scoring
- Configurable time period filters

### 📦 Inventory Management
- Stock level tracking by category
- Low stock alerts and reorder notifications
- Supplier management and analysis
- Turnover rate monitoring
- Expiry date tracking

### 🍽️ Table Management
- Real-time table status (Available, Occupied, Reserved, Cleaning, Out of Order)
- Multiple zone support (AC Premium, Garden, Bar)
- Table capacity tracking
- Customer name and ETA display
- Quick status updates

### 📱 QR Code Ordering
- Customer self-service ordering
- Table-specific QR codes
- Menu browsing and cart management
- Order tracking for customers

### 👥 Multi-Role Authentication
- Super Admin: Full system access
- Admin: Menu and order management
- Waiter: Order handling and tasks
- Customer: Self-service ordering via Firebase Auth

### 📝 Content Management
- Blog management
- About Us page editing
- Special offers and combos
- Banner and media management

---

## 📁 Project Structure

```
BloomCafePOS/
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes
│   │   ├── auth/                # Authentication endpoints
│   │   ├── orders/              # Order management
│   │   ├── inventory/           # Inventory operations
│   │   └── admin/               # Admin endpoints
│   ├── admin/                    # Admin dashboard pages
│   ├── waiter/                   # Waiter dashboard
│   ├── pos/                      # POS billing interface
│   ├── tables/                   # Table management
│   ├── inventory/                # Inventory pages
│   ├── analytics/                # Analytics dashboard
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Homepage
│   └── globals.css               # Global styles
│
├── components/                    # React Components
│   ├── ui/                       # shadcn/ui components
│   └── site/                     # App-specific components
│
├── lib/                          # Utilities & Database
│   ├── firebase.ts               # Firebase configuration
│   ├── auth-context.tsx          # Staff authentication
│   ├── customer-auth-context.tsx # Customer authentication
│   ├── database.ts               # Database operations
│   └── utils.ts                  # Helper functions
│
├── hooks/                        # Custom React Hooks
│
├── jsonDatabase/                 # JSON Database Files
│   ├── products.json
│   ├── orders.json
│   ├── inventory.json
│   └── staff.json
│
├── public/                       # Static Assets
│   └── images/                   # Product images
│
├── Screenshots/                  # UI Screenshots
│
├── tailwind.config.ts            # Tailwind configuration
├── tsconfig.json                 # TypeScript config
└── package.json                  # Dependencies
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Firebase project (for authentication and database)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd BloomCafePOS
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
   NEXT_PUBLIC_FIREBASE_DATABASE_URL=your_database_url
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   JWT_SECRET=your_strong_jwt_secret_key
   ```

4. **Start development server**
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

### Authentication
- `POST /api/auth/login` - Staff login
- `POST /api/auth/verify` - Verify JWT token
- `POST /api/auth/logout` - Staff logout

### Orders
- `GET /api/orders` - Get all orders
- `POST /api/orders` - Create new order
- `GET /api/orders/{orderId}` - Get specific order
- `PATCH /api/orders/{orderId}` - Update order status

### Inventory
- `GET /api/inventory` - Get all inventory items
- `POST /api/inventory` - Add inventory item
- `PUT /api/inventory/{itemId}` - Update inventory
- `DELETE /api/inventory/{itemId}` - Delete item

### Products/Menu
- `GET /api/admin/products` - Get all menu items
- `POST /api/admin/products` - Add menu item
- `PUT /api/admin/products` - Update menu item
- `DELETE /api/admin/products?id={id}` - Delete menu item

### Tables
- `GET /api/tables` - Get all tables
- `PATCH /api/tables/{tableId}` - Update table status

### Analytics
- `GET /api/analytics/orders` - Order statistics
- `GET /api/analytics/revenue` - Revenue analytics
- `GET /api/analytics/waiters` - Waiter performance

---

## 🗄️ Database Architecture

### Firebase Collections
- **users**: Customer profiles and authentication
- **orders**: Order history and tracking
- **inventory**: Stock items and levels

### JSON Files (Development)
- **products.json**: Menu items and pricing
- **orders.json**: Order records
- **inventory.json**: Stock tracking
- **staff.json**: Staff credentials and roles

### Data Models

#### Order
```typescript
{
  id: string
  orderNumber: string
  customerId: string
  items: OrderItem[]
  subtotal: number
  tax: number
  total: number
  status: 'pending' | 'preparing' | 'ready' | 'delivered' | 'cancelled'
  orderType: 'dine-in' | 'delivery'
  tableNumber?: string
  waiterId?: string
  createdAt: string
  updatedAt: string
}
```

#### Inventory Item
```typescript
{
  id: string
  name: string
  category: string
  stock: number
  minStock: number
  maxStock: number
  unitPrice: number
  supplier: string
  expiryDate: string
  status: 'in-stock' | 'low-stock' | 'out-of-stock'
}
```

---

## 👥 User Roles

### Super Admin
- Full system access
- Staff management
- Analytics and reports
- Content management
- QR code generation
- All Admin and Waiter privileges

### Admin
- Menu management
- Item availability control
- Pricing updates
- Order management
- Basic analytics

### Waiter
- View and manage assigned orders
- Update order status
- Task management
- Assist customer orders

### Customer
- Browse menu
- Place orders via QR code
- Track order status
- View order history

---

## 💻 Development Guide

### Demo Credentials

**Staff Login:**
- Admin: `admin` / `admin123`
- Waiter: `waiter` / `waiter123`

### Adding New Components

```bash
npx shadcn@latest add [component-name]
```

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

# Type check
npm run typecheck
```

### Code Style

1. **TypeScript**: Use proper types for all components and functions
2. **Components**: Follow shadcn/ui conventions
3. **API Routes**: Use proper error handling and validation
4. **State Management**: Use React Context for global state
5. **Styling**: Use Tailwind CSS utility classes

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

**Built with ❤️ using Next.js, React, and Firebase**
