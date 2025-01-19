"use client"

import { useState, useEffect, useCallback } from "react"
import { DataTable } from "@/components/data-table"
import { PageSidebar } from "@/components/page-sidebar"
import { PageHeader } from "@/components/page-header"
import { RefreshCw, Printer } from 'lucide-react'
import { Invoice, invoiceColumns } from "@/types/entities"
import { SortingState } from "@tanstack/react-table"
import { useRouter } from "next/navigation"
import { FilterItem } from "@/components/advanced-filter"
import Link from "next/link"

const sidebarItems = [
  { title: "Invoices", href: "/franchisor/invoices", isActive: true },
]

// Filter the invoice columns to only show the ones we want
const filteredInvoiceColumns = invoiceColumns.filter(column => 
  ['Id', 'CustomerRef', 'DueDate', 'Balance'].includes(column.accessorKey as string)
).map(column => {
  if (column.accessorKey === 'Id') {
    return {
      ...column,
      cell: (value: string) => (
        <Link 
          href={`/franchisor/invoices/${value}`}
          className="text-blue-600 underline hover:underline"
        >
          {value}
        </Link>
      )
    }
  }
  return column
})

export default function FranchisorInvoicesPage() {
  const router = useRouter()
  const [selectedRows, setSelectedRows] = useState<Record<string, boolean>>({})
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [totalRows, setTotalRows] = useState(0)
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<FilterItem[]>([])
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 50 })
  const [skipEffect, setSkipEffect] = useState(false)

  const buildQueryString = useCallback((
    pageSize: number,
    pageToken: number,
    sorting: SortingState,
    filters: FilterItem[]
  ) => {
    const params = new URLSearchParams({
      page_size: pageSize.toString(),
      page_token: pageToken.toString(),
      statuses: 'C'
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

  const fetchInvoices = useCallback(
    async ({
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
    },
    [router, buildQueryString]
  )

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

  const selectedRowsCount = Object.values(selectedRows).filter(Boolean).length

  const secondaryActions = [
    {
      title: "REFRESH",
      onClick: handleRefresh,
      icon: RefreshCw,
    },
    {
      title: "PRINT",
      onClick: () => {
        const selectedId = Object.keys(selectedRows).find(id => selectedRows[id])
        if (selectedId) {
          router.push(`/franchisor/invoices/${selectedId}`)
        }
      },
      icon: Printer,
      disabled: selectedRowsCount !== 1,
    }
  ]

  return (
    <>
      <PageHeader title="Invoices" subtitle="View completed invoices" />
      <div className="flex flex-1 overflow-hidden">
        <PageSidebar items={sidebarItems} />
        <main className="flex-1 overflow-auto p-4">
          <DataTable 
            columns={filteredInvoiceColumns} 
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
    </>
  )
}