'use client'

import AdminMenuPanel from '@/components/admin-menu-panel'
import WaiterDashboard from '@/components/waiter-dashboard'
import StaffOrderPage from '@/components/staff-order-page'
import SuperAdminDashboard from '@/components/super-admin-dashboard'
import SimpleStaffLogin from '@/components/simple-staff-login'
import { useState } from 'react'

type StaffPage = 'dashboard' | 'orders' | 'menu' | 'login'

interface User {
  username: string
  role: 'admin' | 'waiter' | 'superadmin'
  name: string
}

export default function StaffPortal() {
  const [currentPage, setCurrentPage] = useState<StaffPage>('login')
  const [currentUser, setCurrentUser] = useState<User | null>(null)

  const handleLogin = (user: User) => {
    setCurrentUser(user)
    setCurrentPage('dashboard')
  }

  const handleLogout = () => {
    setCurrentUser(null)
    setCurrentPage('login')
  }

  if (currentPage === 'login' || !currentUser) {
    return <SimpleStaffLogin onLogin={handleLogin} />
  }

  if (currentUser.role === 'superadmin') {
    switch (currentPage) {
      case 'orders':
        return <StaffOrderPage onNavigate={setCurrentPage} currentUser={currentUser} onLogout={handleLogout} />
      case 'menu':
        return <AdminMenuPanel onNavigate={setCurrentPage} currentUser={currentUser} onLogout={handleLogout} />
      case 'dashboard':
      default:
        return <SuperAdminDashboard onNavigate={setCurrentPage} currentUser={currentUser} onLogout={handleLogout} />
    }
  }

  if (currentUser.role === 'admin') {
    switch (currentPage) {
      case 'orders':
        return <StaffOrderPage onNavigate={setCurrentPage} currentUser={currentUser} onLogout={handleLogout} />
      case 'menu':
      case 'dashboard':
      default:
        return <AdminMenuPanel onNavigate={setCurrentPage} currentUser={currentUser} onLogout={handleLogout} />
    }
  }

  if (currentUser.role === 'waiter') {
    switch (currentPage) {
      case 'orders':
        return <StaffOrderPage onNavigate={setCurrentPage} currentUser={currentUser} onLogout={handleLogout} />
      case 'dashboard':
      default:
        return <WaiterDashboard onNavigate={setCurrentPage} currentUser={currentUser} onLogout={handleLogout} />
    }
  }

  return null
}