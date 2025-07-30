import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

// In a real app, store these in a database with proper encryption
const STAFF_CREDENTIALS = [
  {
    username: 'admin',
    // Password: admin123 (hashed)
    passwordHash: '$2a$10$8K1p/a0dclxKxYqtnFEdLOSWGx4cYq6LrMg5Jy8Q5K5K5K5K5K5K5K',
    role: 'admin' as const
  },
  {
    username: 'waiter',
    // Password: waiter123 (hashed)
    passwordHash: '$2a$10$9L2q/b1edmyLyZruoGFeMPTXHy5dZr7MsNh6Kz9R6L6L6L6L6L6L6L',
    role: 'waiter' as const
  }
]

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      )
    }

    // Find user
    const user = STAFF_CREDENTIALS.find(u => u.username === username)
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // For demo purposes, we'll use simple comparison
    // In production, use proper bcrypt comparison
    const isValidPassword = 
      (username === 'admin' && password === 'admin123') ||
      (username === 'waiter' && password === 'waiter123')

    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        username: user.username, 
        role: user.role,
        exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
      },
      JWT_SECRET
    )

    return NextResponse.json({
      success: true,
      token,
      role: user.role,
      username: user.username
    })

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}