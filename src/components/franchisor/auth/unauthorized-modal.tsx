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

export function UnauthorizedModal() {
  const { showAuthModal, setShowAuthModal, logout } = useAuth()

  const handleFranchiseeRedirect = () => {
    window.location.href = '/franchisee'
  }

  const handleLogout = () => {
    logout()
    setShowAuthModal(false)
  }

  return (
    <Dialog open={showAuthModal} onOpenChange={setShowAuthModal}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Access Denied</DialogTitle>
          <DialogDescription>
            Your account doesn't have permission to access the franchisor portal. Please log in with a franchisor account or visit the franchisee portal.
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
            onClick={handleFranchiseeRedirect}
          >
            Go to Franchisee Portal
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
