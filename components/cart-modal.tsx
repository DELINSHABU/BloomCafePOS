"use client"

import { Button } from "@/components/ui/button"
import { Minus, Plus } from "lucide-react"
import type { CartItem } from "@/app/page"

interface CartModalProps {
  items: CartItem[]
  onClose: () => void
  onUpdateQuantity: (id: string, quantity: number) => void
  onConfirm: () => void
}

export default function CartModal({ items, onClose, onUpdateQuantity, onConfirm }: CartModalProps) {
  const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const isEmpty = items.length === 0

  const handleConfirm = () => {
    if (isEmpty) {
      alert('Please add items to your cart before confirming the order.')
      return
    }
    onConfirm()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-4 sm:p-6 w-full max-w-sm max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">Your Cart</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </Button>
        </div>

        {/* Cart Items */}
        {isEmpty ? (
          <div className="text-center py-8">
            <div className="text-gray-400 mb-2">🛒</div>
            <p className="text-gray-500 mb-4">Your cart is empty</p>
            <Button
              onClick={onClose}
              variant="outline"
              className="border-emerald-600 text-emerald-600 hover:bg-emerald-50"
            >
              Continue Shopping
            </Button>
          </div>
        ) : (
          <>
            <div className="space-y-4 mb-6">
              {items.map((item) => (
                <div key={item.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                  <div className="flex-1 pr-4">
                    <h3 className="font-medium text-gray-900 text-sm">{item.name}</h3>
                    <p className="text-xs text-gray-500">{item.description}</p>
                    <p className="font-bold text-emerald-600 text-sm">₹{item.price}</p>
                  </div>
                  <div className="flex items-center bg-emerald-600 rounded-full">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-white hover:bg-emerald-700 w-7 h-7 p-0 rounded-full"
                      onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                    >
                      <Minus className="w-3 h-3" />
                    </Button>
                    <span className="text-white px-2 font-medium text-sm">{item.quantity}</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-white hover:bg-emerald-700 w-7 h-7 p-0 rounded-full"
                      onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                    >
                      <Plus className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="border-t border-gray-200 pt-4 mb-4">
              <div className="flex justify-between items-center">
                <span className="font-bold text-gray-900">Total:</span>
                <span className="font-bold text-emerald-600 text-lg">₹{totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </>
        )}

        {/* Action Buttons */}
        <div className="space-y-2">
          <Button
            onClick={handleConfirm}
            disabled={isEmpty}
            className={`w-full py-3 rounded-xl font-semibold ${
              isEmpty 
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
            }`}
          >
            {isEmpty ? 'Add Items to Cart' : `Confirm Order (₹${totalAmount.toFixed(2)})`}
          </Button>
          <Button
            onClick={onClose}
            variant="outline"
            className="w-full py-2 border-gray-300 text-gray-600 hover:bg-gray-50"
          >
            Continue Shopping
          </Button>
        </div>
      </div>
    </div>
  )
}
