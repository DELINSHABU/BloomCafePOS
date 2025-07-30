"use client"

import { useEffect, useState } from "react"
import { OrderProvider } from '@/lib/order-context'
import { Toaster } from '@/components/ui/toaster'

interface ClientWrapperProps {
  children: React.ReactNode
}

export default function ClientWrapper({ children }: ClientWrapperProps) {
  const [hasMounted, setHasMounted] = useState(false)

  useEffect(() => {
    setHasMounted(true)
  }, [])

  if (!hasMounted) {
    return null
  }

  return (
    <OrderProvider>
      {children}
      <Toaster />
    </OrderProvider>
  )
}