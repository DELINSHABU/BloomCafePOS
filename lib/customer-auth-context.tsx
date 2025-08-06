'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import {
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth'
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  Timestamp,
} from 'firebase/firestore'
import { auth, db } from './firebase'

export interface CustomerAddress {
  id: string
  label: string // e.g., "Home", "Work", "Other"
  streetAddress: string
  city: string
  state: string
  zipCode: string
  phoneNumber?: string
  isDefault: boolean
}

export interface CustomerProfile {
  uid: string
  email: string
  displayName: string
  phoneNumber?: string
  addresses: CustomerAddress[]
  createdAt: Date
  updatedAt: Date
}

export interface CustomerOrder {
  id: string
  customerId: string
  items: any[]
  total: number
  status: 'pending' | 'preparing' | 'ready' | 'delivered' | 'cancelled'
  orderType: 'dine-in' | 'delivery'
  tableNumber?: string
  deliveryAddress?: CustomerAddress
  customerName: string
  timestamp: Date
  estimatedDeliveryTime?: Date
}

interface CustomerAuthContextType {
  user: User | null
  profile: CustomerProfile | null
  loading: boolean
  // Auth methods
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, displayName: string) => Promise<void>
  loginWithGoogle: () => Promise<void>
  logout: () => Promise<void>
  // Profile methods
  updateProfile: (data: Partial<CustomerProfile>) => Promise<void>
  // Address methods
  addAddress: (address: Omit<CustomerAddress, 'id'>) => Promise<void>
  updateAddress: (addressId: string, data: Partial<CustomerAddress>) => Promise<void>
  deleteAddress: (addressId: string) => Promise<void>
  setDefaultAddress: (addressId: string) => Promise<void>
  // Order methods
  createOrder: (orderData: Omit<CustomerOrder, 'id' | 'customerId' | 'timestamp'>) => Promise<string>
  getOrderHistory: () => Promise<CustomerOrder[]>
}

const CustomerAuthContext = createContext<CustomerAuthContextType | undefined>(undefined)

export function CustomerAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<CustomerProfile | null>(null)
  const [loading, setLoading] = useState(true)

  // Initialize Google Auth Provider
  const googleProvider = new GoogleAuthProvider()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user)
      if (user) {
        await loadUserProfile(user.uid)
      } else {
        setProfile(null)
      }
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const loadUserProfile = async (uid: string) => {
    try {
      const profileDoc = await getDoc(doc(db, 'customers', uid))
      if (profileDoc.exists()) {
        const data = profileDoc.data()
        setProfile({
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as CustomerProfile)
      }
    } catch (error) {
      console.error('Error loading user profile:', error)
    }
  }

  const createUserProfile = async (user: User, displayName: string) => {
    const profileData: CustomerProfile = {
      uid: user.uid,
      email: user.email!,
      displayName: displayName,
      phoneNumber: user.phoneNumber || undefined,
      addresses: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    // Create Firestore document data, filtering out undefined values
    const firestoreData: any = {
      uid: profileData.uid,
      email: profileData.email,
      displayName: profileData.displayName,
      addresses: profileData.addresses,
      createdAt: Timestamp.fromDate(profileData.createdAt),
      updatedAt: Timestamp.fromDate(profileData.updatedAt),
    }

    // Only add phoneNumber if it's not undefined
    if (profileData.phoneNumber) {
      firestoreData.phoneNumber = profileData.phoneNumber
    }

    await setDoc(doc(db, 'customers', user.uid), firestoreData)
    setProfile(profileData)
  }

  const login = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password)
    } catch (error: any) {
      // Handle specific Firebase auth errors with user-friendly messages
      switch (error.code) {
        case 'auth/invalid-credential':
        case 'auth/wrong-password':
        case 'auth/user-not-found':
          throw new Error('Invalid credentials. Please check your email and password.')
        case 'auth/invalid-email':
          throw new Error('Please enter a valid email address.')
        case 'auth/user-disabled':
          throw new Error('This account has been disabled. Please contact support.')
        case 'auth/too-many-requests':
          throw new Error('Too many failed login attempts. Please try again later.')
        case 'auth/network-request-failed':
          throw new Error('Network error. Please check your connection and try again.')
        default:
          throw new Error('Login failed. Please try again.')
      }
    }
  }

  const register = async (email: string, password: string, displayName: string) => {
    try {
      const { user: newUser } = await createUserWithEmailAndPassword(auth, email, password)
      await updateProfile(newUser, { displayName })
      await createUserProfile(newUser, displayName)
    } catch (error: any) {
      // Handle specific Firebase auth errors with user-friendly messages
      switch (error.code) {
        case 'auth/email-already-in-use':
          throw new Error('An account with this email already exists. Please try logging in instead.')
        case 'auth/invalid-email':
          throw new Error('Please enter a valid email address.')
        case 'auth/weak-password':
          throw new Error('Password is too weak. Please choose a stronger password with at least 6 characters.')
        case 'auth/operation-not-allowed':
          throw new Error('Email registration is currently disabled. Please contact support.')
        case 'auth/network-request-failed':
          throw new Error('Network error. Please check your connection and try again.')
        default:
          throw new Error('Registration failed. Please try again.')
      }
    }
  }

  const loginWithGoogle = async () => {
    try {
      console.log('🔥 Starting Google sign-in...')
      const result = await signInWithPopup(auth, googleProvider)
      const user = result.user
      console.log('✅ Google sign-in successful:', user.email)

      // Check if profile exists, if not create one
      console.log('🔍 Checking if user profile exists in Firestore...')
      try {
        const profileDoc = await getDoc(doc(db, 'customers', user.uid))
        if (!profileDoc.exists()) {
          console.log('📝 Creating new user profile...')
          await createUserProfile(user, user.displayName || 'Customer')
          console.log('✅ User profile created successfully')
        } else {
          console.log('✅ User profile already exists')
        }
      } catch (firestoreError: any) {
        console.error('❌ Firestore error:', firestoreError)
        console.error('❌ Error code:', firestoreError.code)
        console.error('❌ Error message:', firestoreError.message)
        
        if (firestoreError.code === 'unavailable') {
          throw new Error('Database is currently unavailable. Please check if Firestore is enabled in Firebase Console.')
        } else if (firestoreError.code === 'permission-denied') {
          throw new Error('Permission denied. Please check Firestore security rules.')
        } else {
          throw new Error(`Database error: ${firestoreError.message}`)
        }
      }
    } catch (error: any) {
      console.error('❌ Google login error:', error)
      throw new Error(error.message)
    }
  }

  const logout = async () => {
    try {
      await signOut(auth)
      setProfile(null)
    } catch (error: any) {
      throw new Error(error.message)
    }
  }

  const updateUserProfile = async (data: Partial<CustomerProfile>) => {
    if (!user || !profile) throw new Error('User not authenticated')

    try {
      const updatedProfile = { ...profile, ...data, updatedAt: new Date() }
      
      // Create Firestore update data, filtering out undefined values
      const firestoreUpdateData: any = {
        uid: updatedProfile.uid,
        email: updatedProfile.email,
        displayName: updatedProfile.displayName,
        addresses: updatedProfile.addresses,
        createdAt: Timestamp.fromDate(updatedProfile.createdAt),
        updatedAt: Timestamp.fromDate(updatedProfile.updatedAt),
      }

      // Only add phoneNumber if it's not undefined
      if (updatedProfile.phoneNumber !== undefined) {
        firestoreUpdateData.phoneNumber = updatedProfile.phoneNumber
      }

      await updateDoc(doc(db, 'customers', user.uid), firestoreUpdateData)
      setProfile(updatedProfile)
    } catch (error: any) {
      throw new Error(error.message)
    }
  }

  const addAddress = async (addressData: Omit<CustomerAddress, 'id'>) => {
    if (!user || !profile) throw new Error('User not authenticated')

    try {
      const addressId = `addr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      const newAddress: CustomerAddress = { ...addressData, id: addressId }

      let updatedAddresses = [...profile.addresses, newAddress]

      // If this is the first address or marked as default, make it default
      if (updatedAddresses.length === 1 || newAddress.isDefault) {
        updatedAddresses = updatedAddresses.map(addr => ({
          ...addr,
          isDefault: addr.id === addressId
        }))
      }

      await updateUserProfile({ addresses: updatedAddresses })
    } catch (error: any) {
      throw new Error(error.message)
    }
  }

  const updateAddress = async (addressId: string, data: Partial<CustomerAddress>) => {
    if (!user || !profile) throw new Error('User not authenticated')

    try {
      let updatedAddresses = profile.addresses.map(addr =>
        addr.id === addressId ? { ...addr, ...data } : addr
      )

      // If setting as default, remove default from others
      if (data.isDefault) {
        updatedAddresses = updatedAddresses.map(addr => ({
          ...addr,
          isDefault: addr.id === addressId
        }))
      }

      await updateUserProfile({ addresses: updatedAddresses })
    } catch (error: any) {
      throw new Error(error.message)
    }
  }

  const deleteAddress = async (addressId: string) => {
    if (!user || !profile) throw new Error('User not authenticated')

    try {
      const updatedAddresses = profile.addresses.filter(addr => addr.id !== addressId)
      
      // If we deleted the default address, make the first remaining address default
      if (updatedAddresses.length > 0 && !updatedAddresses.some(addr => addr.isDefault)) {
        updatedAddresses[0].isDefault = true
      }

      await updateUserProfile({ addresses: updatedAddresses })
    } catch (error: any) {
      throw new Error(error.message)
    }
  }

  const setDefaultAddress = async (addressId: string) => {
    if (!user || !profile) throw new Error('User not authenticated')

    try {
      const updatedAddresses = profile.addresses.map(addr => ({
        ...addr,
        isDefault: addr.id === addressId
      }))

      await updateUserProfile({ addresses: updatedAddresses })
    } catch (error: any) {
      throw new Error(error.message)
    }
  }

  const createOrder = async (orderData: Omit<CustomerOrder, 'id' | 'customerId' | 'timestamp'>) => {
    if (!user || !profile) throw new Error('User not authenticated')

    try {
      const order: Omit<CustomerOrder, 'id'> = {
        ...orderData,
        customerId: user.uid,
        timestamp: new Date(),
      }

      const docRef = await addDoc(collection(db, 'orders'), {
        ...order,
        timestamp: Timestamp.fromDate(order.timestamp),
        estimatedDeliveryTime: order.estimatedDeliveryTime 
          ? Timestamp.fromDate(order.estimatedDeliveryTime)
          : null,
      })

      return docRef.id
    } catch (error: any) {
      throw new Error(error.message)
    }
  }

  const getOrderHistory = async (): Promise<CustomerOrder[]> => {
    if (!user) throw new Error('User not authenticated')

    try {
      const q = query(
        collection(db, 'orders'),
        where('customerId', '==', user.uid)
      )
      const querySnapshot = await getDocs(q)
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate() || new Date(),
        estimatedDeliveryTime: doc.data().estimatedDeliveryTime?.toDate() || undefined,
      })) as CustomerOrder[]
    } catch (error: any) {
      throw new Error(error.message)
    }
  }

  const value = {
    user,
    profile,
    loading,
    login,
    register,
    loginWithGoogle,
    logout,
    updateProfile: updateUserProfile,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
    createOrder,
    getOrderHistory,
  }

  return (
    <CustomerAuthContext.Provider value={value}>
      {children}
    </CustomerAuthContext.Provider>
  )
}

export function useCustomerAuth() {
  const context = useContext(CustomerAuthContext)
  if (context === undefined) {
    throw new Error('useCustomerAuth must be used within a CustomerAuthProvider')
  }
  return context
}
