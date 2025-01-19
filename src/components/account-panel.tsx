import { useState, useEffect } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle, Info, Loader2 } from 'lucide-react'
import { Franchisee } from "@/types/entities"
import { Label } from "@/components/ui/label"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Checkbox } from "@/components/ui/checkbox"

interface AccountPanelProps {
  isOpen: boolean
  onClose: () => void
  franchisee: Franchisee | null
  defaultEmail?: string
  onSuccess?: () => void
}

export function AccountPanel({ isOpen, onClose, franchisee, defaultEmail, onSuccess }: AccountPanelProps) {
  const [email, setEmail] = useState(defaultEmail || "")
  useEffect(() => {
    if (defaultEmail) {
      setEmail(defaultEmail)
    }
  }, [defaultEmail])

  const [setQbEmail, setSetQbEmail] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async () => {
    try {
      setIsLoading(true)
      const jwt = localStorage.getItem('jwt')
      const response = await fetch('https://api.ordrport.com/customer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwt}`
        },
        body: JSON.stringify({
          qb_customer_id: franchisee?.Id,
          customer_email: email,
          set_qb_customer_email: setQbEmail
        })
      })

      if (!response.ok) throw new Error('Failed to create account')
      onSuccess?.() // Trigger table refresh
      onClose()
    } catch (error) {
      console.error('Error creating account:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!franchisee) return null
  const isLinked = Boolean(franchisee.firebase_id)

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Create Account</SheetTitle>
        </SheetHeader>

        {isLinked ? (
          <Alert className="mt-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              This franchisee already has a linked account.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Email</Label>
              <Input
                type="email"
                placeholder="Enter email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="setQbEmail" 
                checked={setQbEmail} 
                onCheckedChange={(checked) => setSetQbEmail(!!checked)}
              />
              <div className="flex items-center space-x-2">
                <Label htmlFor="setQbEmail">Set email in QuickBooks</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">Checking this will set the email address in the franchisee state in your QuickBooks data.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={onClose} disabled={isLoading}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Account & Send Email'
                )}
              </Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
} 