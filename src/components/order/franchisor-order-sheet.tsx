"use client"

import {
  Sheet,
  SheetContent,
} from "@/components/ui/sheet"
import { OrderPanel } from "./order-panel"
import { OrderInfoSection } from "./order-info-section"
import { EditableOrderInfoSection } from "./editable-order-info-section"
import { CheckCircle, XCircle, Check } from 'lucide-react'
import { useState, useEffect } from "react"
import { getInvoiceStatus, Invoice, InvoiceInfo, LineItem } from "@/types/entities"
import { useToast } from "@/components/ui/use-toast"

interface FranchisorOrderSheetProps {
  orderId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onActionComplete?: () => void
}

export function FranchisorOrderSheet({ 
  orderId, 
  open, 
  onOpenChange,
  onActionComplete 
}: FranchisorOrderSheetProps) {
  const [invoice, setInvoice] = useState<InvoiceInfo | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isActionLoading, setIsActionLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (!open) {
      setInvoice(null)
    }
    if (open) {
      setIsLoading(true)
      const fetchInvoice = async () => {
        try {
          const jwt = localStorage.getItem('jwt')
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/qbInvoice/${orderId}`, {
            headers: {
              Authorization: `Bearer ${jwt}`
            }
          })
          const data = await response.json()
          setInvoice(data)
        } catch (error) {
          console.error('Error fetching invoice:', error)
        } finally {
          setIsLoading(false)
        }
      }
      fetchInvoice()
    }
  }, [open, orderId])

  const handleApprove = async () => {
    setIsActionLoading(true)
    try {
      const jwt = localStorage.getItem('jwt')
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/qbInvoice:approve/${orderId}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${jwt}`
        }
      })
      
      if (response.ok) {
        toast({
          title: "Order approved",
          description: "The order has been approved successfully.",
          variant: "default",
        })
        onActionComplete?.()
        onOpenChange(false)
      }
    } catch (error) {
      console.error('Error approving order:', error)
      toast({
        title: "Error",
        description: "Failed to approve order. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsActionLoading(false)
    }
  }

  const handleReject = async () => {
    setIsActionLoading(true)
    try {
      const jwt = localStorage.getItem('jwt')
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/qbInvoice:unpublish/${orderId}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${jwt}`
        }
      })
      
      if (response.ok) {
        toast({
          title: "Order rejected",
          description: "The order has been rejected.",
          variant: "default",
        })
        onActionComplete?.()
        onOpenChange(false)
      }
    } catch (error) {
      console.error('Error rejecting order:', error)
      toast({
        title: "Error",
        description: "Failed to reject order. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsActionLoading(false)
    }
  }

  const handleComplete = async () => {
    setIsActionLoading(true)
    try {
      const jwt = localStorage.getItem('jwt')
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/qbInvoice:complete/${orderId}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${jwt}`
        }
      })
      
      if (response.ok) {
        toast({
          title: "Order completed",
          description: "The order is now ready for pickup.",
          variant: "default",
        })
        onActionComplete?.()
        onOpenChange(false)
      }
    } catch (error) {
      console.error('Error completing order:', error)
      toast({
        title: "Error",
        description: "Failed to complete order. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsActionLoading(false)
    }
  }

  const convertToLineItems = (lines: any[]): LineItem[] => {
    return lines
      .filter(line => 
        line.SalesItemLineDetail?.ItemRef?.name && 
        line.Id &&
        typeof line.SalesItemLineDetail.Qty !== 'undefined'
      )
      .map(line => ({
        item: {
          Id: line.Id,
          Name: line.SalesItemLineDetail.ItemRef.name,
          UnitPrice: line.Amount || 0,
          SalesTaxCodeRef: {
            value: line.SalesItemLineDetail.TaxCodeRef?.value || ''
          }
        },
        quantity: line.SalesItemLineDetail.Qty
      }))
  }

  const getActions = (status: string) => {
    switch (status) {
      case 'Pending':
        return [
          {
            buttonText: "APPROVE",
            buttonColor: "bg-green-600",
            icon: CheckCircle,
            opensModal: true,
            modalTitle: "Approve Order",
            modalDescription: "Are you sure you want to approve this order?",
            onSubmit: handleApprove,
            loading: isActionLoading
          },
          {
            buttonText: "REJECT",
            buttonColor: "bg-red-600",
            icon: XCircle,
            opensModal: true,
            modalTitle: "Reject Order",
            modalDescription: "Are you sure you want to reject this order?",
            onSubmit: handleReject,
            loading: isActionLoading
          }
        ]
      case 'Approved':
        return [{
          buttonText: "COMPLETE",
          buttonColor: "#3b82f6",
          icon: Check,
          opensModal: true,
          modalTitle: "Complete Order",
          modalDescription: "Mark this order as ready for pickup?",
          onSubmit: handleComplete,
          loading: isActionLoading
        }]
      default:
        return []
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[800px] p-0 sm:max-w-[800px]" side="right">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
          </div>
        ) : invoice ? (
          <OrderPanel 
            orderId={invoice.invoice.Id}
            customerName={invoice.invoice.CustomerRef.name}
            detailsContent={
              <OrderInfoSection
                invoice={invoice.invoice}
                actions={getActions(getInvoiceStatus(invoice.invoice.DocNumber).label)}
              />
            }
            itemsContent={
              <EditableOrderInfoSection
                items={convertToLineItems(invoice.invoice.Line)}
                onQuantityChange={() => {}}
                onRemoveItem={async () => {}}
                onSave={async () => {}}
                isSaving={false}
                editable={false}
              />
            }
            className="w-full border-none shadow-none h-full"
          />
        ) : null}
      </SheetContent>
    </Sheet>
  )
} 