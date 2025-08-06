# Customer Authentication Setup Guide

This guide will help you set up Firebase authentication for customers in your Bloom Cafe ordering application.

## Overview

The customer authentication system provides:
- Email/password authentication
- Google OAuth login
- Customer profile management
- Address management for deliveries
- Order history tracking
- Secure data storage with Firebase Firestore

## Prerequisites

1. A Firebase project
2. Firebase web app configuration
3. Node.js and npm/pnpm installed

## Step 1: Firebase Project Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or use an existing one
3. Enable the following services:
   - **Authentication** with Email/Password and Google providers
   - **Cloud Firestore** for data storage

### Enable Authentication Providers

1. Go to Authentication > Sign-in method
2. Enable **Email/Password** authentication
3. Enable **Google** authentication:
   - Click on Google provider
   - Enable it and provide your support email
   - Download the config or copy the Web SDK configuration

### Set up Firestore

1. Go to Firestore Database
2. Create database in test mode (you can configure security rules later)
3. The app will automatically create the following collections:
   - `customers` - Customer profiles and addresses
   - `orders` - Customer orders with delivery information

## Step 2: Environment Configuration

1. Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

2. Fill in your Firebase configuration in `.env.local`:
```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key-here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

You can find these values in:
Firebase Console > Project Settings > General > Your apps > Web app config

## Step 3: Install Dependencies

The Firebase dependency should already be installed. If not, run:

```bash
pnpm add firebase
```

## Step 4: Test the Setup

1. Start your development server:
```bash
pnpm dev
```

2. Navigate to your application
3. Try the customer authentication features:
   - Click the user icon in the bottom navigation
   - Register a new account or login with existing credentials
   - Try Google OAuth login
   - Add delivery addresses
   - Place a test delivery order

## Features Included

### Customer Authentication
- **Registration**: Email/password signup with display name
- **Login**: Email/password and Google OAuth
- **Profile Management**: View and edit customer information

### Address Management
- **Add Addresses**: Customers can add multiple delivery addresses
- **Address Labels**: Home, Work, or Custom labels
- **Default Address**: Set a primary delivery address
- **Edit/Delete**: Full CRUD operations on addresses

### Order Integration
- **Authenticated Orders**: Orders are linked to customer accounts
- **Address Selection**: Choose delivery address during checkout
- **Order History**: View past orders with details
- **Auto-fill**: Customer information is automatically populated

### Security Features
- **Secure Authentication**: Firebase handles password security
- **Data Isolation**: Each customer can only access their own data
- **Real-time Updates**: Address and profile changes sync instantly

## Data Structure

### Customer Profile (Firestore: `customers/{userId}`)
```typescript
{
  uid: string
  email: string
  displayName: string
  phoneNumber?: string
  addresses: CustomerAddress[]
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

### Customer Address
```typescript
{
  id: string
  label: string // "Home", "Work", "Other"
  streetAddress: string
  city: string
  state: string
  zipCode: string
  phoneNumber?: string
  isDefault: boolean
}
```

### Customer Order (Firestore: `orders/{orderId}`)
```typescript
{
  id: string
  customerId: string
  items: CartItem[]
  total: number
  status: "pending" | "preparing" | "ready" | "delivered" | "cancelled"
  orderType: "dine-in" | "delivery"
  tableNumber?: string
  deliveryAddress?: CustomerAddress
  customerName: string
  timestamp: Timestamp
  estimatedDeliveryTime?: Timestamp
}
```

## Firestore Security Rules (Optional)

Here are recommended security rules for production:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Customers can only read/write their own data
    match /customers/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Orders: customers can create and read their own orders
    match /orders/{orderId} {
      allow create: if request.auth != null;
      allow read: if request.auth != null && 
        request.auth.uid == resource.data.customerId;
      // Staff can read/update all orders (you'll need to add staff auth)
    }
  }
}
```

## Troubleshooting

### Common Issues

1. **Authentication not working**: Check your Firebase config in `.env.local`
2. **Google login failing**: Ensure Google provider is enabled in Firebase Console
3. **Address not saving**: Check Firestore permissions and rules
4. **Build errors**: Make sure all environment variables are set

### Debug Tips

1. Check browser console for Firebase errors
2. Verify Firebase project settings
3. Test authentication in Firebase Console > Authentication
4. Check Firestore data in Firebase Console > Firestore Database

## Integration Points

The customer authentication integrates with these components:
- `HomePage`: Login/profile button in navigation
- `OrderListPage`: Address selection for delivery orders
- `CustomerAuthModal`: Login and registration forms
- `CustomerProfile`: Profile management and order history
- `AddressManager`: Address CRUD operations

## Next Steps

1. Customize the UI to match your brand
2. Add more profile fields if needed
3. Implement order status updates
4. Add email notifications for orders
5. Set up proper Firestore security rules for production
6. Consider adding phone number verification
7. Implement password reset functionality

The system is now ready for customers to create accounts, save addresses, and place orders with a seamless experience!
