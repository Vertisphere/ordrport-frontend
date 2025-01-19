'use client'

import { useState, useEffect } from "react"
import { PageHeader } from "@/components/page-header"
import { PageSidebar } from "@/components/page-sidebar"
import { DataTable } from "@/components/data-table"
import { invoiceColumns } from "@/types/entities"
import { RefreshCw, FileText } from "lucide-react"
import { useRouter } from "next/navigation"
import { Invoice } from "@/types/entities"
import { SortingState } from "@tanstack/react-table"
import { FilterItem } from "@/components/advanced-filter"
import { FranchisorOrderSheet } from "@/components/order/franchisor-order-sheet"
import { sidebarItems } from "../sidebar-items"

export default function InPreparationOrdersPage() {
  const router = useRouter()
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedRows, setSelectedRows] = useState<Record<string, boolean>>({})
  const [totalRows, setTotalRows] = useState(0)
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<FilterItem[]>([])
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 50 })
  const [skipEffect, setSkipEffect] = useState(false)
  const [isOrderSheetOpen, setIsOrderSheetOpen] = useState(false)
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)

  const fetchInvoices = async ({ pageIndex, pageSize, sorting, filters }: any) => {
    try {
      setIsLoading(true)
      const jwt = localStorage.getItem('jwt')
      const queryParams = new URLSearchParams({
        page: (pageIndex + 1).toString(),
        limit: pageSize.toString(),
        statuses: 'A' // Only fetch approved orders
      })

      // Add sorting parameters
      if (sorting.length) {
        queryParams.append('sort', sorting[0].id)
        queryParams.append('order', sorting[0].desc ? 'desc' : 'asc')
      }

      // Add filter parameters
      if (filters.length) {
        filters.forEach((filter: any) => {
          queryParams.append(filter.id, filter.value)
        })
      }

      const response = await fetch(
        `https://api.ordrport.com/qbInvoices?${queryParams}`,
        {
          headers: {
            Authorization: `Bearer ${jwt}`
          }
        }
      )

      const data = await response.json()
      setInvoices(data.invoices || [])
      setTotalRows(data.total || 0)
    } catch (error) {
      console.error('Error fetching invoices:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (!skipEffect) {
      fetchInvoices({
        pageIndex: pagination.pageIndex,
        pageSize: pagination.pageSize,
        sorting,
        filters: columnFilters
      })
    }
  }, [pagination.pageIndex, pagination.pageSize, sorting, columnFilters, skipEffect])

  const handleRefresh = () => {
    fetchInvoices({
      pageIndex: pagination.pageIndex,
      pageSize: pagination.pageSize,
      sorting,
      filters: columnFilters
    })
  }

  const handleOpenOrderSheet = (orderId: string) => {
    setSelectedOrderId(orderId)
    setIsOrderSheetOpen(true)
  }

  const handleSetReadyForPickup = async () => {
    const selectedId = Object.keys(selectedRows).find(id => selectedRows[id])
    if (selectedId) {
      handleOpenOrderSheet(selectedId)
    }
  }

  const selectedRowsCount = Object.values(selectedRows).filter(Boolean).length

  const secondaryActions = [
    {
      title: "REFRESH",
      onClick: handleRefresh,
      icon: RefreshCw,
    },
    {
      title: "SET READY FOR PICKUP",
      onClick: handleSetReadyForPickup,
      icon: FileText,
      disabled: selectedRowsCount !== 1,
    }
  ]

  const invoiceColumnsWithSheet = invoiceColumns.map(column => {
    if (column.accessorKey === 'Id') {
      return {
        ...column,
        cell: (value: string) => (
          <button 
            onClick={() => handleOpenOrderSheet(value)}
            className="text-blue-600 underline hover:underline"
          >
            {value}
          </button>
        )
      }
    }
    return column
  })

  return (
    <>
      <PageHeader title="Orders In Preparation" subtitle="View and manage orders being prepared" />
      <div className="flex flex-1 overflow-hidden">
        <PageSidebar items={sidebarItems} />
        <main className="flex-1 overflow-auto p-4">
          <DataTable 
            columns={invoiceColumnsWithSheet}
            data={invoices}
            isLoading={isLoading}
            entityType="Orders In Preparation"
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
            selectionMode="highlight"
          />
        </main>
      </div>

      {selectedOrderId && (
        <FranchisorOrderSheet 
          orderId={selectedOrderId}
          open={isOrderSheetOpen}
          onOpenChange={setIsOrderSheetOpen}
          onActionComplete={handleRefresh}
        />
      )}
    </>
  )
} 