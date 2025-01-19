"use client"

import { useState, useEffect, useCallback } from "react"
import { DataTable } from "@/components/data-table"
import { PageSidebar } from "@/components/page-sidebar"
import { PageHeader } from "@/components/page-header"
import { Edit, Trash2, RefreshCw, UserPlus, Unlink } from 'lucide-react'
import { EditPanel } from "@/components/edit-panel"
import { Franchisee, franchiseeColumns, franchiseeFormConfig } from "@/types/entities"
import { SortingState, ColumnFiltersState } from "@tanstack/react-table"
import { useRouter } from "next/navigation"
import { FilterItem } from "@/components/advanced-filter"
import { AccountPanel } from "@/components/account-panel"
import { UnlinkPanel } from "@/components/unlink-panel"

const sidebarItems = [
  { title: "Franchisees", href: "/franchisor/franchisees", isActive: true },
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
  const [isAccountPanelOpen, setIsAccountPanelOpen] = useState(false)
  const [isUnlinkPanelOpen, setIsUnlinkPanelOpen] = useState(false)

  const buildQueryString = useCallback((
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
  }, [])

  const fetchFranchisees = useCallback(async ({
    pageIndex = 0,
    pageSize = 50,
    sorting = [] as SortingState,
    filters = [] as FilterItem[]
  }) => {
    setIsLoading(true)
    setSelectedFranchisee(null)
    setSelectedRows({})

    try {
      const jwt = localStorage.getItem('jwt')
      if (!jwt) {
        router.push('/franchisor')
        return
      }

      const queryString = buildQueryString(pageSize, pageIndex + 1, sorting, filters)
      const response = await fetch(
        `https://api.ordrport.com/qbCustomers?${queryString}`,
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
      setFranchisees(data.customers)
      setTotalRows(data.total_count)
    } catch (error) {
      console.error('Error fetching franchisees:', error)
    } finally {
      setIsLoading(false)
    }
  }, [router, buildQueryString])

  useEffect(() => {
    if (!skipEffect) {
      fetchFranchisees({
        pageIndex: pagination.pageIndex,
        pageSize: pagination.pageSize,
        sorting,
        filters: columnFilters
      })
    }
  }, [pagination, sorting, columnFilters, skipEffect, fetchFranchisees])

  const handleCreateFranchisee = () => {
    console.log("Create franchisee clicked")
  }

  const handleRefresh = () => {
    // Reset the selected franchisee and selected rows
    // setSelectedFranchisee(null)
    // setSelectedRows({})
    // 
    fetchFranchisees({
      pageIndex: pagination.pageIndex,
      pageSize: pagination.pageSize,
      sorting,
      filters: columnFilters
    })
  }

  const handleEdit = () => {
    // Find the franchisee by ID instead of row index
    const selectedId = Object.keys(selectedRows)[0]
    const franchisee = franchisees.find(f => f.Id === selectedId)
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

  const handleCreateAccount = () => {
    const selectedId = Object.keys(selectedRows).find(id => selectedRows[id])
    const franchisee = franchisees.find(f => f.Id === selectedId)
    if (franchisee) {
      setSelectedFranchisee(franchisee)
      setIsAccountPanelOpen(true)
    }
  }

  const handleUnlink = () => {
    const selectedId = Object.keys(selectedRows).find(id => selectedRows[id])
    const franchisee = franchisees.find(f => f.Id === selectedId)
    if (franchisee) {
      setSelectedFranchisee(franchisee)
      setIsUnlinkPanelOpen(true)
    }
  }

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
    {
      title: "CREATE ACCOUNT",
      onClick: handleCreateAccount,
      icon: UserPlus,
      disabled: selectedRowsCount !== 1,
    },
    {
      title: "UNLINK ACCOUNT",
      onClick: handleUnlink,
      icon: Unlink,
      disabled: selectedRowsCount !== 1 || (() => {
        const selectedId = Object.keys(selectedRows).find(id => selectedRows[id])
        const franchisee = franchisees.find(f => f.Id === selectedId)
        return !franchisee?.firebase_id
      })(),
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
            entityType="Franchisees"
            totalRows={totalRows}
            sorting={sorting}
            columnFilters={columnFilters}
            pagination={pagination}
            onPaginationChange={(pageIndex, pageSize) => { 
              setSkipEffect(true)
              setPagination({ pageIndex, pageSize })
              // This is specifically for the franchisor page since we only want to edit one franchisee at a time. 
              // on the ordering page, we want to set this off since we want to select multiple items.
              // setSelectedFranchisee(null)
              // setSelectedRows({})
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
            primaryAction={{
              title: "CREATE FRANCHISEE",
              onClick: handleCreateFranchisee
            }}
            secondaryActions={secondaryActions}
            onSelectionChange={handleSelectionChange}
            rowSelection={selectedRows}
            onRowSelectionChange={setSelectedRows}
          />
        </main>
      </div>
      <EditPanel
        isOpen={isEditPanelOpen}
        onClose={() => {
          setIsEditPanelOpen(false)
          setSelectedFranchisee(null)
        }}
        entity={selectedFranchisee}
        formConfig={franchiseeFormConfig}
      />
      <AccountPanel
        isOpen={isAccountPanelOpen}
        onClose={() => {
          setIsAccountPanelOpen(false)
          setSelectedFranchisee(null)
        }}
        franchisee={selectedFranchisee}
        defaultEmail={selectedFranchisee?.PrimaryEmailAddr?.Address}
        onSuccess={handleRefresh}
      />
      <UnlinkPanel
        isOpen={isUnlinkPanelOpen}
        onClose={() => {
          setIsUnlinkPanelOpen(false)
          setSelectedFranchisee(null)
        }}
        franchisee={selectedFranchisee}
        onSuccess={handleRefresh}
      />
    </>
  )
}
