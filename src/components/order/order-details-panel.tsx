"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

interface OrderLine {
  Id: string
  LineNum: number
  Amount: number
  SalesItemLineDetail: {
    ItemRef: {
      value: string
      name: string
    }
    Qty: number
  }
}

interface OrderDetailsPanelProps {
  invoice: {
    Id: string
    Balance: number
    CustomerRef: {
      name: string
    }
    Line: OrderLine[]
  }
}

export function OrderDetailsPanel({ invoice }: OrderDetailsPanelProps) {
  const subtotal = invoice.Line
    .filter(line => line.SalesItemLineDetail?.ItemRef)
    .reduce((sum, line) => sum + line.Amount, 0)

  return (
    <div className="space-y-4 h-full">
      <Card>
        <CardHeader>
          <CardTitle>Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Balance</span>
            <span className="font-medium">${invoice.Balance ? invoice.Balance.toFixed(2) : 'N/A'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Customer</span>
            <span className="font-medium">{invoice.CustomerRef ? invoice.CustomerRef.name : 'N/A'}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Order Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {invoice.Line.map(line => (
              line.SalesItemLineDetail?.ItemRef && (
                <div key={line.Id}>
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <p className="font-medium">
                        {line.SalesItemLineDetail.ItemRef.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Qty: {line.SalesItemLineDetail.Qty}
                      </p>
                    </div>
                    <p className="font-medium">
                      ${line.Amount ? line.Amount.toFixed(2) : 'N/A'}
                    </p>
                  </div>
                  <Separator className="mt-4" />
                </div>
              )
            ))}
            
            <div className="flex justify-between items-center pt-4">
              <span className="font-medium">Subtotal</span>
              <span className="font-medium">${subtotal ? subtotal.toFixed(2) : 'N/A'}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 