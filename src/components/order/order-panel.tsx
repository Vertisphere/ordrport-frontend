import * as React from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useState } from "react"
import Link from "next/link"

interface OrderPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  orderId: string
  customerName: string
  detailsContent: React.ReactNode
  itemsContent: React.ReactNode
}

export function OrderPanel({ 
  orderId, 
  customerName, 
  detailsContent,
  itemsContent,
  ...props 
}: OrderPanelProps) {
  const [activeTab, setActiveTab] = useState<'details' | 'items'>('details')

  return (
    <div 
      className="w-1/2 border-l bg-background flex flex-col" 
      {...props}
    >
      <div className="border-b px-4 py-3 flex-none">
        <h1 className="text-lg font-medium leading-none tracking-tight">
          Order #{orderId}
        </h1>
        <p className="mt-1.5 text-xs text-muted-foreground">
          {customerName}
        </p>
      </div>
      <Tabs defaultValue="details" className="flex-1 flex flex-col min-h-0">
        <TabsList className="w-full justify-start rounded-none border-b h-10 bg-transparent p-0 flex-none">
          <TabsTrigger 
            value="details"
            className="rounded-none border-b-2 border-b-transparent data-[state=active]:border-b-blue-600 data-[state=active]:text-blue-600 data-[state=active]:shadow-none h-full"
          >
            Details
          </TabsTrigger>
          <TabsTrigger 
            value="items"
            className="rounded-none border-b-2 border-b-transparent data-[state=active]:border-b-blue-600 data-[state=active]:text-blue-600 data-[state=active]:shadow-none h-full"
          >
            Items
          </TabsTrigger>
        </TabsList>
        <div className="flex-1 min-h-0">
          <TabsContent value="details" className="mt-0 h-full">
            {detailsContent}
          </TabsContent>
          <TabsContent value="items" className="mt-0 h-full">
            {itemsContent}
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
} 