'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface AuthContextType {
  isAuthenticated: boolean
  userRole: 'admin' | 'waiter' | null
  username: string | null
  login: (role: 'admin' | 'waiter') => void
  logout: () => void
  checkAuth: () => Promise<boolean>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userRole, setUserRole] = useState<'admin' | 'waiter' | null>(null)
  const [username, setUsername] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const checkAuth = async (): Promise<boolean> => {
    const token = localStorage.getItem('staff_token')
    const role = localStorage.getItem('staff_role') as 'admin' | 'waiter' | null
    const storedUsername = localStorage.getItem('staff_username')

    if (!token || !role || !storedUsername) {
      setIsAuthenticated(false)
      setUserRole(null)
      setUsername(null)
      return false
    }

    try {
      const response = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      })

      if (response.ok) {
        const data = await response.json()
        setIsAuthenticated(true)
        setUserRole(data.role)
        setUsername(data.username)
        return true
      } else {
        // Token is invalid, clear storage
        localStorage.removeItem('staff_token')
        localStorage.removeItem('staff_role')
        localStorage.removeItem('staff_username')
        setIsAuthenticated(false)
        setUserRole(null)
        setUsername(null)
        return false
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      setIsAuthenticated(false)
      setUserRole(null)
      setUsername(null)
      return false
    }
  }

  const login = (role: 'admin' | 'waiter') => {
    setIsAuthenticated(true)
    setUserRole(role)
    const storedUsername = localStorage.getItem('staff_username')
    setUsername(storedUsername)
  }

  const logout = () => {
    localStorage.removeItem('staff_token')
    localStorage.removeItem('staff_role')
    localStorage.removeItem('staff_username')
    setIsAuthenticated(false)
    setUserRole(null)
    setUsername(null)
  }

  useEffect(() => {
    checkAuth().finally(() => setIsLoading(false))
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    )
  }

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      userRole,
      username,
      login,
      logout,
      checkAuth
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}