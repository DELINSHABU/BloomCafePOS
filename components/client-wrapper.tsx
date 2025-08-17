"use client"

import { OrderProvider } from '@/lib/order-context'
import { Toaster } from '@/components/ui/toaster'

interface ClientWrapperProps {
  children: React.ReactNode
}

export default function ClientWrapper({ children }: ClientWrapperProps) {
  return (
    <div suppressHydrationWarning>
      <OrderProvider>
        {children}
        <Toaster />
      </OrderProvider>
    </div>
  )
}
