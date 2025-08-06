import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
  DrawerDescription,
} from "@/components/ui/drawer"

interface PasswordDrawerProps {
  isOpen: boolean
  staffName: string
  onPasswordSubmit: (password: string) => void
  onClose: () => void
  errorMessage?: string
}

export function StaffPasswordDrawer({ 
  isOpen, 
  staffName, 
  onPasswordSubmit, 
  onClose,
  errorMessage 
}: PasswordDrawerProps) {
  const [password, setPassword] = useState("")

  const handlePasswordChange = (value: string) => {
    setPassword(value)
  }

  const handleSubmit = () => {
    if (password.trim().length > 0) {
      onPasswordSubmit(password.trim())
      setPassword("") // Reset password after submit
    }
  }

  const handleClose = () => {
    setPassword("") // Reset password on close
    onClose()
  }

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DrawerContent>
        <div className="mx-auto w-full max-w-sm">
          <DrawerHeader>
            <DrawerTitle>Enter Password for {staffName}</DrawerTitle>
            <DrawerDescription>
              Please enter the password to switch to this staff member.
            </DrawerDescription>
            {errorMessage && (
              <div className="text-red-500 text-sm mt-2">
                {errorMessage}
              </div>
            )}
          </DrawerHeader>
          <div className="p-4 pb-0">
            <Input
              type="password"
              value={password}
              onChange={(e) => handlePasswordChange(e.target.value)}
              className="w-full"
              placeholder="Enter password"
              autoFocus
            />
          </div>
          <DrawerFooter>
            <Button 
              onClick={handleSubmit}
              disabled={password.trim().length === 0}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              Submit
            </Button>
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  )
}

