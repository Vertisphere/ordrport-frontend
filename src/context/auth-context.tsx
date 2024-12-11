// src/context/auth-context.tsx
'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { jwtDecode } from 'jwt-decode'

interface User {
  name: string
  userId: string
  isFranchisor: boolean
  // Add other user properties
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  showAuthModal: boolean
  setShowAuthModal: (show: boolean) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showAuthModal, setShowAuthModal] = useState(false)

  const checkAuth = () => {
    const token = localStorage.getItem('jwt')
    
    if (!token) {
      console.log('no token') 
      setShowAuthModal(true)
      setIsLoading(false)
      return
    }

    try {
      const decoded = jwtDecode(token) as any
      // Check if token is expired
      console.log(decoded)
      if (decoded.exp * 1000 < Date.now()) {
        console.log('expired')
        localStorage.removeItem('jwt')
        setShowAuthModal(true)
        setIsLoading(false)
        return
      }


      setUser({
        name: decoded.name,
        userId: decoded.sub,
        // TODO: fix this in backend (franchisor)
        isFranchisor: decoded.is_franchiser,
      })
      
    } catch (error) {
        console.error('Failed to decode token', error)
      localStorage.removeItem('jwt')
      setShowAuthModal(true)
    }
    
    setIsLoading(false)
  }

  const logout = () => {
    localStorage.removeItem('jwt')
    setUser(null)
    setShowAuthModal(true)
  }

  useEffect(() => {
    checkAuth()
  }, [])

  return (
    <AuthContext.Provider value={{ user, isLoading, showAuthModal, setShowAuthModal, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}