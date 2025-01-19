'use client'

import { useEffect } from 'react'
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useAuth } from "@/context/auth-context"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { LogIn } from 'lucide-react'

export function AuthModal() {
  const { showAuthModal, setShowAuthModal } = useAuth()

  const handleQuickBooksLogin = () => {
    // In production, these would come from environment variables
    const clientId = 'ABRZXEqL4DpCxHz4OhdiuKg0BXaKIYf4QfVgqLdzC3SngxVNWy'
    const redirectUri = `http://localhost:3000/franchisor/oauth-redirect`
    const scope = 'com.intuit.quickbooks.accounting openid profile email phone'
    
    const authUrl = `https://appcenter.intuit.com/connect/oauth2/authorize`
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: scope,
      state: Math.random().toString(36).substring(7) // Add any state you want to verify later
    })

    window.location.href = `${authUrl}?${params.toString()}`
  }

  return (
    <Dialog open={showAuthModal} onOpenChange={setShowAuthModal}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Welcome to Franchise Management</DialogTitle>
          <DialogDescription>
            Please log in with your QuickBooks account to access the franchisor portal.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-center mt-6">
          <Button 
            onClick={handleQuickBooksLogin} 
            variant="outline"
            size="sm"
            className={cn(
              "font-medium transition-colors",
              'hover:bg-green-50 hover:text-green-600 hover:border-green-600',
              "flex items-center gap-2"
            )}
          >
            <LogIn className="h-4 w-4" />
            Log in with QuickBooks
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}