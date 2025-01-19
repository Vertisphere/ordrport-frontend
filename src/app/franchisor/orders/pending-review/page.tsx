"use client"

import { useState, useEffect, useCallback } from "react"
import { DataTable } from "@/components/data-table"
import { PageSidebar } from "@/components/page-sidebar"
import { PageHeader } from "@/components/page-header"
import { RefreshCw, FileText } from 'lucide-react'
import { Invoice, invoiceColumns } from "@/types/entities"
import { SortingState } from "@tanstack/react-table"
import { useRouter } from "next/navigation"
import { FilterItem } from "@/components/advanced-filter"
import { FranchisorOrderSheet } from "@/components/order/franchisor-order-sheet"
import { sidebarItems } from "../sidebar-items"

export default function PendingReviewOrdersPage() {
  const router = useRouter()
  const [selectedRows, setSelectedRows] = useState<Record<string, boolean>>({})
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [totalRows, setTotalRows] = useState(0)
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<FilterItem[]>([])
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 50 })
  const [skipEffect, setSkipEffect] = useState(false)
  const [isOrderSheetOpen, setIsOrderSheetOpen] = useState(false)
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)

  const buildQueryString = useCallback((
    pageSize: number,
    pageToken: number,
    sorting: SortingState,
    filters: FilterItem[]
  ) => {
    const params = new URLSearchParams({
      page_size: pageSize.toString(),
      page_token: pageToken.toString(),
      statuses: 'P'
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
    setSelectedRows({})

    try {
      const jwt = localStorage.getItem('jwt')
      if (!jwt) {
        router.push('/franchisor')
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
        router.push('/franchisor')
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

  const handleOpenOrderSheet = (orderId: string) => {
    setSelectedOrderId(orderId)
    setIsOrderSheetOpen(true)
  }

  const selectedRowsCount = Object.values(selectedRows).filter(Boolean).length

  const secondaryActions = [
    {
      title: "REFRESH",
      onClick: handleRefresh,
      icon: RefreshCw,
    },
    {
      title: "REVIEW",
      onClick: () => {
        const selectedId = Object.keys(selectedRows).find(id => selectedRows[id])
        if (selectedId) {
          handleOpenOrderSheet(selectedId)
        }
      },
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
      <PageHeader title="Orders Pending Review" subtitle="Review and approve pending orders" />
      <div className="flex flex-1 overflow-hidden">
        <PageSidebar items={sidebarItems} />
        <main className="flex-1 overflow-auto p-4">
          <DataTable 
            columns={invoiceColumnsWithSheet} 
            data={invoices}
            isLoading={isLoading}
            entityType="Orders Pending Review"
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