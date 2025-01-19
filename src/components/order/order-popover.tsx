"use client"

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { OrderPanel } from "./order-panel"
import { Button } from "@/components/ui/button"
import { FileText } from "lucide-react"
import { useState, useEffect } from "react"
import { InvoiceInfo, LineItem } from "@/types/entities"
import { OrderInfoSection } from "./order-info-section"
import { EditableOrderInfoSection } from "./editable-order-info-section"

interface OrderPopoverProps {
  orderId: string
  trigger?: React.ReactNode
}

export function OrderPopover({ orderId, trigger }: OrderPopoverProps) {
  const [invoice, setInvoice] = useState<InvoiceInfo | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const fetchInvoice = async () => {
    setIsLoading(true)
    try {
      const jwt = localStorage.getItem('jwt')
      const response = await fetch(`https://api.ordrport.com/qbInvoice/${orderId}`, {
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

  return (
    <Popover>
      <PopoverTrigger asChild onClick={fetchInvoice}>
        {trigger || (
          <Button variant="ghost" size="sm">
            <FileText className="h-4 w-4 mr-2" />
            DETAILS
          </Button>
        )}
      </PopoverTrigger>
      <PopoverContent 
        className="w-[800px] p-0" 
        align="end"
        side="left"
      >
        {isLoading ? (
          <div className="flex items-center justify-center h-[400px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
          </div>
        ) : invoice ? (
          <OrderPanel 
            orderId={invoice.invoice.Id}
            customerName={invoice.invoice.CustomerRef.name}
            detailsContent={
              <OrderInfoSection
                invoice={invoice.invoice} 
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
            className="w-full border-none shadow-none h-[600px]"
          />
        ) : null}
      </PopoverContent>
    </Popover>
  )
} 