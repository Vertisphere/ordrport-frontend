'use client'

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { useAuth } from "@/context/auth-context"

export function ExpiredModal() {
  const { showAuthModal, setShowAuthModal, logout } = useAuth()

  const handleQuickBooksLogin = () => {
    // Same QuickBooks OAuth logic as in FranchisorAuthModal
    const clientId = 'YOUR_QB_CLIENT_ID'
    const redirectUri = `${window.location.origin}/franchisor/oauth-redirect`
    const scope = 'com.intuit.quickbooks.accounting'
    
    const authUrl = `https://appcenter.intuit.com/connect/oauth2`
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: scope,
      state: 'franchisor'
    })

    window.location.href = `${authUrl}?${params.toString()}`
  }

  const handleLogout = () => {
    logout()
    setShowAuthModal(false)
  }

  return (
    <Dialog open={showAuthModal} onOpenChange={setShowAuthModal}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Session Expired</DialogTitle>
          <DialogDescription>
            Your session has expired. Please log in again to continue using the franchisor portal.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex gap-2 sm:gap-0">
          <Button 
            variant="secondary" 
            onClick={handleLogout}
          >
            Log Out
          </Button>
          <Button 
            onClick={handleQuickBooksLogin}
            className="bg-[#2CA01C] hover:bg-[#2CA01C]/90"
          >
            Log in with QuickBooks
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}