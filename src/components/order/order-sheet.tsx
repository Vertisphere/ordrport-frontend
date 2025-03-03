"use client"

import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"
import { OrderPanel } from "./order-panel"
import { OrderInfoSection } from "./order-info-section"
import { EditableOrderInfoSection } from "./editable-order-info-section"
import { Button } from "@/components/ui/button"
import { FileText } from "lucide-react"
import { useState, useEffect } from "react"
import { getInvoiceStatus, Invoice, InvoiceInfo, LineItem } from "@/types/entities"

interface OrderSheetProps {
  orderId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function OrderSheet({ orderId, open, onOpenChange }: OrderSheetProps) {
  const [invoice, setInvoice] = useState<InvoiceInfo | null>(null)
  const [isLoading, setIsLoading] = useState(false)

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

  const convertToLineItems = (lines: any[]): LineItem[] => {
    console.log('Original lines:', lines);
    
    const convertedItems = lines
      .filter(line => 
        line.SalesItemLineDetail?.ItemRef?.name && 
        line.Id &&
        typeof line.SalesItemLineDetail.Qty !== 'undefined'
      )
      .map(line => {
        const item = {
          item: {
            Id: line.Id,
            Name: line.SalesItemLineDetail.ItemRef.name,
            UnitPrice: line.Amount || 0,
            SalesTaxCodeRef: {
              value: line.SalesItemLineDetail.TaxCodeRef?.value || ''
            }
          },
          quantity: line.SalesItemLineDetail.Qty
        };
        return item;
      });

    console.log('Converted items:', convertedItems);
    return convertedItems;
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[800px] p-0 sm:max-w-[800px]" side="right">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
          </div>
        ) : invoice ? (
          <>
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
              className="w-full border-none shadow-none h-full"
            />
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  )
} 