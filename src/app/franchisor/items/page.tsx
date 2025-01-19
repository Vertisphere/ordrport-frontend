"use client"

import { useState, useEffect, useCallback } from "react"
import { DataTable } from "@/components/data-table"
import { PageSidebar } from "@/components/page-sidebar"
import { PageHeader } from "@/components/page-header"
import { Edit, Trash2, RefreshCw } from 'lucide-react'
import { EditPanel } from "@/components/edit-panel"
import { Item, itemColumns } from "@/types/entities"
import { SortingState } from "@tanstack/react-table"
import { useRouter } from "next/navigation"
import { FilterItem } from "@/components/advanced-filter"

const sidebarItems = [
  { title: "Items", href: "/franchisor/items", isActive: true },
]

export default function FranchisorItemsPage() {
  const router = useRouter()
  const [selectedRows, setSelectedRows] = useState<Record<string, boolean>>({})
  const [isEditPanelOpen, setIsEditPanelOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<Item | null>(null)
  const [items, setItems] = useState<Item[]>([])
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
      page_token: pageToken.toString()
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

  const fetchItems = useCallback(async ({
    pageIndex = 0,
    pageSize = 50,
    sorting = [] as SortingState,
    filters = [] as FilterItem[]
  }) => {
    setIsLoading(true)
    setSelectedItem(null)
    setSelectedRows({})

    try {
      const jwt = localStorage.getItem('jwt')
      if (!jwt) {
        router.push('/franchisor')
        return
      }

      const queryString = buildQueryString(pageSize, pageIndex + 1, sorting, filters)
      const response = await fetch(
        `https://api.ordrport.com/qbItems?${queryString}`,
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
      setItems(data.items || [])
      setTotalRows(data.total_count || 0)
    } catch (error) {
      console.error('Error fetching items:', error)
    } finally {
      setIsLoading(false)
    }
  }, [router, buildQueryString])

  useEffect(() => {
    if (!skipEffect) {
      fetchItems({
        pageIndex: pagination.pageIndex,
        pageSize: pagination.pageSize,
        sorting,
        filters: columnFilters
      })
    }
  }, [pagination, sorting, columnFilters, skipEffect, fetchItems])

  const handleRefresh = () => {
    fetchItems({
      pageIndex: pagination.pageIndex,
      pageSize: pagination.pageSize,
      sorting,
      filters: columnFilters
    })
  }

  const handleEdit = () => {
    const selectedId = Object.keys(selectedRows).find(id => selectedRows[id])
    const item = items.find(i => i.Id === selectedId)
    if (item) {
      setSelectedItem(item)
      setIsEditPanelOpen(true)
    }
  }

  const handleDelete = () => {
    console.log("Delete clicked")
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
    }
  ]

  return (
    <>
      <PageHeader title="Items" subtitle="management" />
      <div className="flex flex-1 overflow-hidden">
        <PageSidebar items={sidebarItems} />
        <main className="flex-1 overflow-auto p-4">
          <DataTable 
            columns={itemColumns} 
            data={items}
            isLoading={isLoading}
            entityType="Items"
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
      <EditPanel
        isOpen={isEditPanelOpen}
        onClose={() => {
          setIsEditPanelOpen(false)
          setSelectedItem(null)
        }}
        entity={selectedItem}
        formConfig={{
          title: "Item",
          description: "Edit item details",
          fields: [] // Add fields if needed
        }}
      />
    </>
  )
} 