"use client"

import { useState, useEffect, useCallback } from "react"
import { DataTable } from "@/components/data-table"
import { PageSidebar } from "@/components/page-sidebar"
import { PageHeader } from "@/components/page-header"
import { Edit, Trash2, RefreshCw, FileText, Copy } from 'lucide-react'
import { EditPanel } from "@/components/edit-panel"
import { Invoice, invoiceColumns } from "@/types/entities"
import { SortingState } from "@tanstack/react-table"
import { useRouter } from "next/navigation"
import { FilterItem } from "@/components/advanced-filter"
import { OrderSheet } from "@/components/order/order-sheet"
import { Button } from "@/components/ui/button"

const sidebarItems = [
  { title: "Orders", href: "/franchisee/orders", isActive: true },
]

export default function FranchiseeOrdersPage() {
  const router = useRouter()
  const [selectedRows, setSelectedRows] = useState<Record<string, boolean>>({})
  const [isEditPanelOpen, setIsEditPanelOpen] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [totalRows, setTotalRows] = useState(0)
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<FilterItem[]>([])
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 50 })
  const [skipEffect, setSkipEffect] = useState(false)
  const [isOrderSheetOpen, setIsOrderSheetOpen] = useState(false)
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)
  const [isCreatingOrder, setIsCreatingOrder] = useState(false)

  const buildQueryString = useCallback((
    pageSize: number,
    pageToken: number,
    sorting: SortingState,
    filters: FilterItem[]
  ) => {
    const params = new URLSearchParams({
      page_size: pageSize.toString(),
      page_token: pageToken.toString(),
      statuses: 'DPARVC'
    })

    if (sorting.length > 0) {
      const { id, desc } = sorting[0]
      params.append('order_by', `${id} ${desc ? 'DESC' : 'ASC'}`)
    }

    if (filters.length > 0) {
      const queryFilters = filters.map(filter => 
        `${filter.field} LIKE '%${filter.value}%'`
      ).join(' AND ')
      params.append('query', queryFilters)
    }

    return params.toString()
  }, [])

  const fetchInvoices = useCallback(async ({
    pageIndex = 0,
    pageSize = 50,
    sorting = [] as SortingState,
    filters = [] as FilterItem[]
  }) => {
    setIsLoading(true)
    setSelectedInvoice(null)
    setSelectedRows({})

    try {
      const jwt = localStorage.getItem('jwt')
      if (!jwt) {
        router.push('/franchisee')
        return
      }

      const queryString = buildQueryString(pageSize, pageIndex + 1, sorting, filters)
      const response = await fetch(
        `https://api.ordrport.com/qbInvoices?${queryString}`,
        {
          headers: {
            Authorization: `Bearer ${jwt}`
          }
        }
      )

      if (response.status === 401) {
        router.push('/franchisee')
        return
      }

      const data = await response.json()
      setInvoices(data.invoices || [])
      setTotalRows(data.total_count || 0)
    } catch (error) {
      console.error('Error fetching invoices:', error)
    } finally {
      setIsLoading(false)
    }
  }, [router, buildQueryString])

  useEffect(() => {
    if (!skipEffect) {
      fetchInvoices({
        pageIndex: pagination.pageIndex,
        pageSize: pagination.pageSize,
        sorting,
        filters: columnFilters
      })
    }
  }, [pagination, sorting, columnFilters, skipEffect, fetchInvoices])

  const handleRefresh = () => {
    fetchInvoices({
      pageIndex: pagination.pageIndex,
      pageSize: pagination.pageSize,
      sorting,
      filters: columnFilters
    })
  }

  const handleDelete = () => {
    console.log("Delete clicked")
  }

  const selectedRowsCount = Object.values(selectedRows).filter(Boolean).length

  const handleOpenOrderSheet = (orderId: string) => {
    console.log('Opening sheet for order: ', orderId)
    setSelectedOrderId(orderId)
    setIsOrderSheetOpen(true)
  }

  const secondaryActions = [
    {
      title: "REFRESH",
      onClick: handleRefresh,
      icon: RefreshCw,
    },
    {
      title: "DETAILS",
      onClick: () => {
        const selectedId = Object.keys(selectedRows).find(id => selectedRows[id])
        console.log('Details clicked, selected ID:', selectedId)
        if (selectedId) {
          handleOpenOrderSheet(selectedId)
        }
      },
      icon: FileText,
      disabled: selectedRowsCount !== 1,
    },
    {
      title: "DUPLICATE",
      onClick: async () => {
        const selectedId = Object.keys(selectedRows)[0]
        try {
          const jwt = localStorage.getItem('jwt')
          const response = await fetch(`https://api.ordrport.com/qbInvoice:duplicate/${selectedId}`, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${jwt}`
            }
          })
          
          const data = await response.json()
          if (data.success) {
            router.push(`/franchisee/orders/${data.id}`)
          }
        } catch (error) {
          console.error('Error duplicating order:', error)
        }
      },
      icon: Copy,
      disabled: selectedRowsCount !== 1,
    },
    {
      title: "DELETE",
      onClick: handleDelete,
      icon: Trash2,
      disabled: selectedRowsCount === 0,
    }
  ]

  useEffect(() => {
    console.log('Selected Rows:', selectedRows)
  }, [selectedRows])

  useEffect(() => {
    console.log('Selected Order ID:', selectedOrderId)
  }, [selectedOrderId])

  return (
    <>
      <PageHeader title="Orders" subtitle="management" />
      <div className="flex flex-1 overflow-hidden">
        <PageSidebar items={sidebarItems} />
        <main className="flex-1 overflow-auto p-4">
          <DataTable 
            columns={invoiceColumns} 
            data={invoices}
            isLoading={isLoading}
            entityType="Orders"
            totalRows={totalRows}
            sorting={sorting}
            columnFilters={columnFilters}
            pagination={pagination}
            onPaginationChange={(pageIndex, pageSize) => { 
              setSkipEffect(true)
              setPagination({ pageIndex, pageSize })
              setTimeout(() => setSkipEffect(false), 0)
            }}
            onSortingChange={(newSorting) => {
              setSkipEffect(true)
              setSorting(newSorting)
              setPagination(prev => ({ ...prev, pageIndex: 0 }))
              setTimeout(() => setSkipEffect(false), 0)
            }}
            onFiltersChange={(newFilters) => {
              setSkipEffect(true)
              setColumnFilters(newFilters)
              setPagination(prev => ({ ...prev, pageIndex: 0 }))
              setTimeout(() => setSkipEffect(false), 0)
            }}
            secondaryActions={secondaryActions}
            onSelectionChange={setSelectedRows}
            rowSelection={selectedRows}
            onRowSelectionChange={setSelectedRows}
            primaryAction={{
              title: isCreatingOrder ? "CREATING..." : "CREATE ORDER",
              onClick: async () => {
                try {
                  setIsCreatingOrder(true)
                  const jwt = localStorage.getItem('jwt')
                  const response = await fetch('https://api.ordrport.com/qbInvoice:create', {
                    method: 'GET',
                    headers: {
                      Authorization: `Bearer ${jwt}`
                    }
                  })
                  
                  const data = await response.json()
                  if (data.success) {
                    console.log('New order created:', data.id)
                    handleRefresh()
                  }
                } catch (error) {
                  console.error('Error creating order:', error)
                } finally {
                  setIsCreatingOrder(false)
                }
              }
            }}
          />
        </main>
      </div>
      <EditPanel
        isOpen={isEditPanelOpen}
        onClose={() => {
          setIsEditPanelOpen(false)
          setSelectedInvoice(null)
        }}
        entity={selectedInvoice}
        formConfig={{
          title: "Invoice",
          description: "Edit invoice details",
          fields: [] // Add fields if needed
        }}
      />
      {selectedOrderId && (
        <OrderSheet 
          orderId={selectedOrderId}
          open={isOrderSheetOpen}
          onOpenChange={setIsOrderSheetOpen}
        />
      )}
    </>
  )
}