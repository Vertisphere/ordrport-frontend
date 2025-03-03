"use client"

import { useState, useEffect, useCallback } from "react"
import { DataTable } from "@/components/data-table"
import { PageSidebar } from "@/components/page-sidebar"
import { PageHeader } from "@/components/page-header"
import { Edit, Trash2, RefreshCw, CheckCircle, XCircle } from 'lucide-react'
import { EditPanel } from "@/components/edit-panel"
import { Invoice, invoiceColumns } from "@/types/entities"
import { SortingState } from "@tanstack/react-table"
import { useRouter } from "next/navigation"
import { FilterItem } from "@/components/advanced-filter"
import { FranchisorOrderSheet } from "@/components/order/franchisor-order-sheet"
import { sidebarItems } from "./sidebar-items"

export default function FranchisorOrdersPage() {
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

  const buildQueryString = useCallback((
    pageSize: number,
    pageToken: number,
    sorting: SortingState,
    filters: FilterItem[]
  ) => {
    const params = new URLSearchParams({
      page_size: pageSize.toString(),
      page_token: pageToken.toString(),
      statuses: 'PARVC'
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
        router.push('/franchisor')
        return
      }

      const queryString = buildQueryString(pageSize, pageIndex + 1, sorting, filters)
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_ENDPOINT}/qbInvoices?${queryString}`,
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

  const handleApprove = async () => {
    const selectedId = Object.keys(selectedRows)[0]
    try {
      const jwt = localStorage.getItem('jwt')
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/qbInvoice:approve/${selectedId}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${jwt}`
        }
      })
      
      if (response.ok) {
        handleRefresh()
      }
    } catch (error) {
      console.error('Error approving order:', error)
    }
  }

  const handleReject = async () => {
    const selectedId = Object.keys(selectedRows)[0]
    try {
      const jwt = localStorage.getItem('jwt')
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/qbInvoice:unpublish/${selectedId}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${jwt}`
        }
      })
      
      if (response.ok) {
        handleRefresh()
      }
    } catch (error) {
      console.error('Error rejecting order:', error)
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
      title: "APPROVE",
      onClick: handleApprove,
      icon: CheckCircle,
      disabled: selectedRowsCount !== 1,
    },
    {
      title: "REJECT",
      onClick: handleReject,
      icon: XCircle,
      disabled: selectedRowsCount !== 1,
    }
  ]

  const handleOpenOrderSheet = (orderId: string) => {
    setSelectedOrderId(orderId)
    setIsOrderSheetOpen(true)
  }

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
      <PageHeader title="Orders" subtitle="management" />
      <div className="flex flex-1 overflow-hidden">
        <PageSidebar items={sidebarItems} />
        <main className="flex-1 overflow-auto p-4">
          <DataTable 
            columns={invoiceColumnsWithSheet}
            data={invoices}
            isLoading={isLoading}
            entityType="Invoices"
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
          />
        </main>
      </div>
      <FranchisorOrderSheet
        orderId={selectedOrderId || ''}
        open={isOrderSheetOpen}
        onOpenChange={setIsOrderSheetOpen}
        onActionComplete={handleRefresh}
      />
    </>
  )
} 