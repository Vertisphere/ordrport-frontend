import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { InvoiceInfo } from "@/types/entities"
import { useState } from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/components/ui/use-toast"
import { getInvoiceStatus,  } from "@/types/entities"
import { cn } from "@/lib/utils"
import { LucideIcon } from "lucide-react"
import { lighten, darken } from 'color2k'

interface OrderInfoAction {
  buttonText: string
  buttonColor?: string
  opensModal: boolean
  modalTitle?: string
  modalDescription?: string
  onSubmit?: (...args: any[]) => Promise<void>
  disabled?: boolean
}

interface OrderInfoSectionProps {
  invoice: InvoiceInfo['invoice']
  actions?: OrderInfoAction[]
}

// Helper function to determine if a color is light
const isLightColor = (color: string) => {
  // Remove any leading # and convert to RGB
  const hex = color.replace('#', '')
  const r = parseInt(hex.substr(0, 2), 16)
  const g = parseInt(hex.substr(2, 2), 16)
  const b = parseInt(hex.substr(4, 2), 16)
  const brightness = (r * 299 + g * 587 + b * 114) / 1000
  return brightness > 128
}

// Helper function to get hover colors
const getHoverColors = (baseColor: string = '#3b82f6') => {
  // Remove any 'bg-' or 'hover:bg-' prefixes and get the base color
  const color = baseColor.replace(/^(bg-|hover:bg-)/, '')
  
  // Default colors if we can't process the input
  if (!color.startsWith('#')) {
    return {
      bgHover: 'hover:bg-blue-50',
      textHover: 'hover:text-blue-600',
      borderHover: 'hover:border-blue-600'
    }
  }

  try {
    const lightBg = lighten(color, 0.9)
    const darkText = darken(color, 0.1)
    
    return {
      bgHover: lightBg,
      textHover: darkText,
      borderHover: darkText
    }
  } catch {
    return {
      bgHover: 'hover:bg-blue-50',
      textHover: 'hover:text-blue-600',
      borderHover: 'hover:border-blue-600'
    }
  }
}

// Simplified color mapping
const getHoverStyles = (baseColor?: string) => {
  switch (baseColor) {
    case 'bg-red-600':
    case 'bg-red-500':
      return 'hover:bg-red-50 hover:text-red-600 hover:border-red-600'
    case 'bg-green-600':
    case 'bg-green-500':
      return 'hover:bg-green-50 hover:text-green-600 hover:border-green-600'
    case 'bg-yellow-600':
    case 'bg-yellow-500':
      return 'hover:bg-yellow-50 hover:text-yellow-600 hover:border-yellow-600'
    case 'bg-blue-600':
    case 'bg-blue-500':
      return 'hover:bg-blue-50 hover:text-blue-600 hover:border-blue-600'
    default:
      return 'hover:bg-blue-50 hover:text-blue-600 hover:border-blue-600'
  }
}

export function OrderInfoSection({ invoice, actions }: OrderInfoSectionProps) {
  const [isOpen, setIsOpen] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (action: OrderInfoAction) => {
    if (!action.onSubmit) return
    
    setIsSubmitting(true)
    try {
      await action.onSubmit()
    } catch (error) {
      console.error('Error:', error)
      toast({
        title: "Error",
        description: "Please try again later.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
      setIsOpen(null)
    }
  }

  if (!invoice) {
    return <div>Loading...</div>
  }

  const status = getInvoiceStatus(invoice.DocNumber)

  const items = [
    { label: "Document Number", value: invoice.DocNumber },
    { label: "Status", value: status.label, icon: status.icon as LucideIcon, color: status.color },
    { label: "Customer", value: invoice.CustomerRef.name },
    { label: "Balance", value: `${invoice.CurrencyRef.name} ${invoice.Balance ? invoice.Balance.toFixed(2) : 'N/A'}` },
    { label: "Total Amount", value: `${invoice.CurrencyRef.name} ${invoice.TotalAmt ? invoice.TotalAmt.toFixed(2) : 'N/A'}` },
    { label: "Tax", value: `${invoice.CurrencyRef.name} ${invoice.TxnTaxDetail.TotalTax ? invoice.TxnTaxDetail.TotalTax.toFixed(2) : 'N/A'}` },
    { label: "Created", value: format(new Date(invoice.MetaData.CreateTime), 'PPP p') },
    { label: "Last Updated", value: format(new Date(invoice.MetaData.LastUpdatedTime), 'PPP p') },
    { label: "Due Date", value: format(new Date(invoice.DueDate), 'PPP') },
    { label: "Print Status", value: invoice.PrintStatus },
    { label: "Email Status", value: invoice.EmailStatus }
  ]

  return (
    <>
      <div className="flex flex-col h-full">
        <Card className="rounded-none border-x-0 border-t-0 shadow-none flex-1 overflow-auto">
          <CardHeader className="px-4 py-3">
            <CardTitle className="text-sm font-medium">Order Details</CardTitle>
          </CardHeader>
          <CardContent className="px-4 py-0">
            <div className="space-y-2">
              {items.map((item, index) => (
                <div key={item.label}>
                  <div className="grid grid-cols-2 gap-4 py-2">
                    <div className="text-xs font-medium text-muted-foreground">
                      {item.label}
                    </div>
                    <div className="text-xs">
                      {'icon' in item ? (
                        <div className="flex items-center gap-2">
                          {item.icon && <item.icon className={`h-4 w-4 ${item.color}`} />}
                          <span>{item.value}</span>
                        </div>
                      ) : (
                        item.value
                      )}
                    </div>
                  </div>
                  {index < items.length - 1 && (
                    <Separator />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        {actions && actions.length > 0 && (
          <div className="mt-auto px-4 py-3 border-t flex gap-2 bg-white flex-none">
            {actions.map((action, index) => (
              <Button 
                key={index}
                onClick={() => action.opensModal ? setIsOpen(action.buttonText) : action.buttonText !== "PRINT ITEMS" ? action.onSubmit?.() : action.onSubmit?.(invoice.Id)}
                disabled={isSubmitting || action.disabled}
                variant="outline"
                size="sm"
                className={cn(
                  "font-medium transition-colors",
                  index === 0 && getHoverStyles(action.buttonColor),
                  index !== 0 && "text-gray-500 hover:text-gray-700 hover:bg-gray-50",
                  isSubmitting && "opacity-50 cursor-not-allowed"
                )}
              >
              {isSubmitting
                ? "Submitting..."
                : action.disabled
                ? "Already Pending; Can only modify items"
                : action.buttonText}
              </Button>
            ))}
          </div>
        )}
      </div>

      {actions?.map((action, index) => action.opensModal && (
        <AlertDialog 
          key={index}
          open={isOpen === action.buttonText} 
          onOpenChange={(open) => setIsOpen(open ? action.buttonText : null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{action.modalTitle}</AlertDialogTitle>
              <AlertDialogDescription>
                {action.modalDescription}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel 
                disabled={isSubmitting}
                className="text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                disabled={isSubmitting}
                onClick={() => handleSubmit(action)}
                className={cn(
                  "font-medium transition-colors",
                  getHoverStyles(action.buttonColor),
                  isSubmitting && "opacity-50 cursor-not-allowed"
                )}
              >
                {isSubmitting ? "Submitting..." : action.buttonText}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      ))}
    </>
  )
} 