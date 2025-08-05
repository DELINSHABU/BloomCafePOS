'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Eye, EyeOff, Lock, User, ArrowLeft } from 'lucide-react'
import { SimpleThemeToggle } from '@/components/theme-toggle'
import staffCredentials from '@/staff-credentials.json'

interface SimpleStaffLoginProps {
  onLogin: (user: { username: string; role: 'superadmin' | 'admin' | 'waiter'; name: string }) => void
}

export default function SimpleStaffLogin({ onLogin }: SimpleStaffLoginProps) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    // Simple validation
    if (!username || !password) {
      setError('Please enter both username and password')
      setIsLoading(false)
      return
    }

    // Check credentials against JSON data
    const user = staffCredentials.users.find(
      u => u.username === username && u.password === password
    )

    if (user) {
      // Login successful
      onLogin({
        username: user.username,
        role: user.role as 'superadmin' | 'admin' | 'waiter',
        name: user.name
      })
    } else {
      setError('Invalid username or password')
    }

    setIsLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-900 dark:to-gray-800 p-4">
      {/* Theme Toggle - Positioned absolutely in top-right */}
      <div className="absolute top-4 right-4">
        <SimpleThemeToggle />
      </div>
      
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-emerald-100 dark:bg-emerald-800 rounded-full flex items-center justify-center mb-4">
            <Lock className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">Staff Login</CardTitle>
          <CardDescription className="dark:text-gray-300">
            Enter your credentials to access the staff dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button 
              type="submit" 
              className="w-full bg-emerald-600 hover:bg-emerald-700"
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Demo Credentials:</h4>
            <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
              <div><strong>Super Admin:</strong> superadmin / super123</div>
              <div><strong>Admin:</strong> admin / admin123</div>
              <div><strong>John Smith:</strong> john.smith / john123</div>
              <div><strong>Sarah Johnson:</strong> sarah.johnson / sarah123</div>
              <div><strong>Mike Wilson:</strong> mike.wilson / mike123</div>
              <div><strong>Emily Davis:</strong> emily.davis / emily123</div>
              <div>+ more waiters available...</div>
            </div>
          </div>

          <div className="mt-4">
            <Button 
              variant="outline"
              onClick={() => window.location.href = '/'}
              className="w-full"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Main Site
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}