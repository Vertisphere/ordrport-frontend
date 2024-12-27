"use client"

import { useState, useEffect } from "react"
import { DataTable } from "@/components/data-table"
import { PageSidebar } from "@/components/page-sidebar"
import { PageHeader } from "@/components/page-header"
import { Edit, Trash2, RefreshCw } from 'lucide-react'
import { EditPanel } from "@/components/edit-panel"
import { Franchisee, franchiseeColumns } from "@/types/entities"
import { SortingState, ColumnFiltersState } from "@tanstack/react-table"
import { useRouter } from "next/navigation"
import { FilterItem } from "@/components/advanced-filter"

const sidebarItems = [
  { title: "Dashboard", href: "/franchisor/dashboard" },
  { title: "Franchisees", href: "/franchisor/franchisees", isActive: true },
  { title: "Compute Engine", href: "/franchisor/compute-engine" },
  { title: "Load Balancing", href: "/franchisor/load-balancers" },
  { title: "Cloud Storage", href: "/franchisor/cloud-storage" },
]

export default function FranchisorFranchiseesPage() {
  const router = useRouter()
  const [selectedRows, setSelectedRows] = useState<Record<string, boolean>>({})
  const [isEditPanelOpen, setIsEditPanelOpen] = useState(false)
  const [selectedFranchisee, setSelectedFranchisee] = useState<Franchisee | null>(null)
  const [franchisees, setFranchisees] = useState<Franchisee[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [totalRows, setTotalRows] = useState(0)
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<FilterItem[]>([])
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 50 })
  const [skipEffect, setSkipEffect] = useState(false)

  const buildQueryString = (
    pageSize: number,
    pageToken: number,
    sorting: SortingState,
    filters: FilterItem[]
  ) => {
    const params = new URLSearchParams({
      page_size: pageSize.toString(),
      page_token: pageToken.toString()
    })

    // Handle sorting
    if (sorting.length > 0) {
      const { id, desc } = sorting[0]
      params.append('order_by', `${id} ${desc ? 'desc' : 'asc'}`)
    }

    console.log(filters)
    console.log(typeof filters)
    console.log(filters.map(filter => typeof filter))
    // console.log(filters.map(filter => filter.value))
    // Handle filters
    if (filters.length > 0) {
      // Note: The filter string will be automatically URL encoded by URLSearchParams
      const queryFilters = filters.map(filter => 
        `${filter.field} LIKE '%${filter.value}%'`
      ).join(' AND ')
      params.append('query', queryFilters)
    }

    return params.toString()
  }

  const fetchFranchisees = async ({
    pageIndex = 0,
    pageSize = 50,
    sorting = [] as SortingState,
    filters = [] as FilterItem[]
  }) => {
    setIsLoading(true)
    try {
      // Check if we have a valid auth token
      const jwt = localStorage.getItem('jwt')
      if (!jwt) {
        router.push('/login')
        return
      }

      const queryString = buildQueryString(pageSize, pageIndex + 1, sorting, filters)
      console.log(queryString)
      const response = await fetch(
        `https://api.ordrport.com/qbCustomers?${queryString}`,
        {
          headers: {
            Authorization: `Bearer ${jwt}`
          }
        }
      )

      if (response.status === 401) {
        router.push('/login')
        return
      }

      const data = await response.json()
      setFranchisees(data.customers)
      setTotalRows(data.total_count)
      console.log('Total Rows:', data.total_count)
    } catch (error) {
      console.error('Error fetching franchisees:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (!skipEffect) {
      fetchFranchisees({
        pageIndex: pagination.pageIndex,
        pageSize: pagination.pageSize,
        sorting,
        filters: columnFilters
      })
    }
  }, [pagination, sorting, columnFilters, skipEffect])

  const handleCreateFranchisee = () => {
    console.log("Create franchisee clicked")
  }

  const handleRefresh = () => {
    fetchFranchisees({
      pageIndex: pagination.pageIndex,
      pageSize: pagination.pageSize,
      sorting,
      filters: columnFilters
    })
  }

  const handleEdit = () => {
    const selectedId = Object.keys(selectedRows).find(id => selectedRows[id])
    const franchisee = franchisees.find(item => item.Id === selectedId)
    if (franchisee) {
      setSelectedFranchisee(franchisee)
      setIsEditPanelOpen(true)
    }
  }

  const handleDelete = () => {
    console.log("Delete clicked")
  }

  const handleSelectionChange = (newSelection: Record<string, boolean>) => {
    setSelectedRows(newSelection)
  }

  const selectedRowsCount = Object.values(selectedRows).filter(Boolean).length

  const secondaryActions = [
    {
      title: "REFRESH",
      onClick: handleRefresh,
      icon: RefreshCw,
    },
    {
      title: "EDIT",
      onClick: handleEdit,
      icon: Edit,
      disabled: selectedRowsCount !== 1,
    },
    {
      title: "DELETE",
      onClick: handleDelete,
      icon: Trash2,
      disabled: selectedRowsCount === 0,
    },
  ]

  return (
    <>
      <PageHeader title="Franchisees" subtitle="management" />
      <div className="flex flex-1 overflow-hidden">
        <PageSidebar items={sidebarItems} />
        <main className="flex-1 overflow-auto p-4">
          <DataTable 
            columns={franchiseeColumns} 
            data={franchisees}
            isLoading={isLoading}
            entityType="franchisee"
            totalRows={totalRows}
            sorting={sorting}
            columnFilters={columnFilters}
            pagination={pagination}
            onPaginationChange={(pageIndex, pageSize) => 
              setPagination({ pageIndex, pageSize })}
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
            primaryAction={{
              title: "CREATE FRANCHISEE",
              onClick: handleCreateFranchisee
            }}
            secondaryActions={secondaryActions}
            onSelectionChange={handleSelectionChange}
          />
        </main>
      </div>
      <EditPanel
        isOpen={isEditPanelOpen}
        onClose={() => {
          setIsEditPanelOpen(false)
          setSelectedFranchisee(null)
        }}
        franchisee={selectedFranchisee}
      />
    </>
  )
}
