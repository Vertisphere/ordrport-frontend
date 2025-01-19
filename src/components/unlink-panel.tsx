import { useState } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Loader2 } from 'lucide-react'
import { Franchisee } from "@/types/entities"

interface UnlinkPanelProps {
  isOpen: boolean
  onClose: () => void
  franchisee: Franchisee | null
  onSuccess?: () => void
}

export function UnlinkPanel({ isOpen, onClose, franchisee, onSuccess }: UnlinkPanelProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleUnlink = async () => {
    try {
      setIsLoading(true)
      const jwt = localStorage.getItem('jwt')
      const response = await fetch('https://api.ordrport.com/customer', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwt}`
        },
        body: JSON.stringify({
          qb_customer_id: franchisee?.Id
        })
      })

      if (!response.ok) throw new Error('Failed to unlink account')
      onSuccess?.()
      onClose()
    } catch (error) {
      console.error('Error unlinking account:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!franchisee) return null

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Unlink Account</SheetTitle>
        </SheetHeader>
        <div className="space-y-4 mt-4">
          <p className="text-sm text-gray-500">
            Are you sure you want to unlink this account? This will remove the franchisee&apos;s access to the portal.
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleUnlink} 
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Unlinking...
                </>
              ) : (
                'Unlink Account'
              )}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
} 