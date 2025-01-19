"use client"

import { useState, useMemo } from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  Row,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Settings2, ChevronLeft, ChevronRight, CheckCircle, XCircle, Loader2, MoreHorizontal, LucideIcon } from 'lucide-react'
import { AdvancedFilter, type FilterItem } from "./advanced-filter"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { EntityType, ColumnDefinition } from "@/types/entities"
import { cn } from "@/lib/utils"
import { Checkbox } from "@/components/ui/checkbox"

interface RowAction<T> {
  label: string
  icon: LucideIcon
  onClick: (row: T) => void
}

interface DataTableProps<TData extends EntityType & { Id: string }, TValue> {
  columns: ColumnDefinition<TData>[]
  data: TData[]
  totalRows: number
  isLoading: boolean
  entityType: 'Franchisees' | 'Invoices' | 'Orders' | 'Items' | 'Orders Pending Review' | 'Orders In Preparation'
  sorting: SortingState
  columnFilters: FilterItem[]
  pagination: {
    pageIndex: number
    pageSize: number
  }
  onPaginationChange: (pageIndex: number, pageSize: number) => void
  onSortingChange: (sorting: SortingState) => void
  onFiltersChange: (filters: FilterItem[]) => void
  primaryAction?: {
    title: string
    onClick: () => void
  }
  secondaryActions?: Array<{
    title: string
    onClick: () => void
    icon?: React.ElementType
    disabled?: boolean
  }>
  selectionMode?: 'checkbox' | 'highlight' | 'none'
  onSelectionChange?: (selectedRows: Record<string, boolean>) => void
  rowSelection?: Record<string, boolean>
  onRowSelectionChange?: (value: Record<string, boolean>) => void
  rowActions?: RowAction<TData>[]
  title?: string
}

export function DataTable<TData extends EntityType & { Id: string }, TValue>({
  columns,
  data,
  totalRows,
  isLoading,
  entityType,
  primaryAction,
  secondaryActions,
  onSelectionChange,
  sorting,
  onSortingChange,
  columnFilters,
  onFiltersChange,
  pagination,
  onPaginationChange,
  rowSelection = {},
  onRowSelectionChange = () => {},
  rowActions,
  selectionMode = 'checkbox',
  title,
}: DataTableProps<TData, TValue>) {
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(
    columns.reduce((acc, column) => ({
      ...acc,
      [column.accessorKey]: column.visible ?? true
    }), {})
  )

  const tableColumns = useMemo(
    () => [
      selectionMode === 'checkbox' && {
        id: "select",
        header: ({ table }: { table: any }) => (
          <Checkbox
            checked={table.getIsAllPageRowsSelected()}
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Select all"
          />
        ),
        cell: ({ row }: { row: Row<TData> }) => (
          <Checkbox
            checked={rowSelection[row.original.Id]}
            onCheckedChange={(value) => {
              const newSelection: Record<string, boolean> = {
                ...rowSelection,
                [row.original.Id]: !!value
              }
              onRowSelectionChange(newSelection)
            }}
            aria-label="Select row"
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      ...columns.map(col => ({
        accessorKey: col.accessorKey as string,
        header: col.header,
        cell: col.cell 
          ? ({ row }: { row: Row<TData> }) => {
              const path = col.accessorKey.toString().split('.');
              let value: any = row.original;
              for (const key of path) {
                value = value?.[key as keyof typeof value];
              }
              return col.cell?.(value) ?? value;
            }
          : ({ row }: { row: Row<TData> }) => {
              const path = col.accessorKey.toString().split('.');
              let value: any = row.original;
              for (const key of path) {
                value = value?.[key as keyof typeof value];
              }
              return value;
            },
        enableSorting: col.sortable,
        enableColumnFilter: col.filterable,
      })),
      rowActions && {
        id: 'actions',
        cell: ({ row }: { row: Row<TData> }) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {rowActions.map((action, index) => {
                const Icon = action.icon
                return (
                  <DropdownMenuItem
                    key={index}
                    onClick={() => action.onClick(row.original)}
                  >
                    <Icon className="mr-2 h-4 w-4" />
                    {action.label}
                  </DropdownMenuItem>
                )
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      }
    ].filter(Boolean),
    [columns, rowActions, rowSelection, onRowSelectionChange, selectionMode]
  )

  const table = useReactTable<TData>({
    data,
    columns: tableColumns as ColumnDef<TData, any>[],
    getCoreRowModel: getCoreRowModel(), 
    getPaginationRowModel: getPaginationRowModel(),
    pageCount: Math.ceil(totalRows / pagination.pageSize),
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      ...(selectionMode !== 'none' && { rowSelection }),
      pagination,
    },
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    onSortingChange: (updater) => {
      const newSorting = typeof updater === 'function' ? updater(sorting) : updater
      onSortingChange(newSorting)
    },
    // onColumnFiltersChange: (updater) => {
    //   const newFilters = typeof updater === 'function' ? updater(columnFilters) : updater
    //   onFiltersChange(newFilters)
    // },
    // onPaginationChange: (updater) => {
    //   const newPagination = typeof updater === 'function' 
    //     ? updater(pagination)
    //     : updater
    //   console.log("Pagination changed")
    //   onPaginationChange(newPagination.pageIndex, newPagination.pageSize)
    // },
    onColumnVisibilityChange: setColumnVisibility,
    ...(selectionMode !== 'none' && {
      onRowSelectionChange: (updater) => {
        const newRowSelection = 
          typeof updater === 'function' ? updater(rowSelection) : updater;
        onRowSelectionChange?.(newRowSelection);
      },
    }),
  })

  console.log('Total Rows:', totalRows)
  console.log('Page Count:', Math.ceil(totalRows / pagination.pageSize))

  const handleFiltersChange = (filters: FilterItem[]) => {
    table.getAllColumns().forEach(column => {
      column.setFilterValue(undefined)
    })
    
    filters.forEach(filter => {
      const column = table.getColumn(filter.field)
      if (column) {
        column.setFilterValue(filter.value)
      }
    })
  }


  const handleRowClick = (rowId: string) => {
    if (selectionMode === 'highlight') {
      const newSelection = {
        [rowId]: true
      }
      onRowSelectionChange(newSelection)
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between py-1">
        <div className="text-base font-medium">{title || entityType}</div>
        <div className="flex items-center gap-0.5">
          {primaryAction && (
            <Button 
              variant="default" 
              size="sm" 
              onClick={primaryAction.onClick}
              className="h-7 px-2 text-xs font-medium"
            >
              {primaryAction.title}
            </Button>
          )}
          {secondaryActions?.map((action, index) => (
            <Button 
              key={index}
              variant="ghost" 
              size="sm" 
              onClick={action.onClick}
              className="h-7 px-2 text-xs font-medium"
              disabled={action.disabled}
            >
              {action.icon && <action.icon className="mr-1.5 h-3.5 w-3.5" />}
              {action.title}
            </Button>
          ))}
        </div>
      </div>

      <AdvancedFilter 
        onFiltersChange={onFiltersChange} 
        entityColumns={columns}
        columnVisibilityDropdown={
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                <Settings2 className="h-4 w-4" />
                <span className="sr-only">View options</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[180px]">
              <DropdownMenuLabel className="text-xs font-normal text-gray-500">Toggle columns</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {table.getAllColumns().filter((column) => column.getCanHide()).map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize text-xs"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) => column.toggleVisibility(!!value)}
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                )
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        } 
      />

      {isLoading && (
        <div className="flex justify-center py-2">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      )}

      <div className="rounded-md border overflow-hidden">
        <Table className="text-xs">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead 
                    key={header.id} 
                    className={cn(
                      "px-2 py-0.5 h-8 bg-gray-50/80 group",
                      header.column.getCanSort() 
                        ? "cursor-pointer select-none text-gray-900" 
                        : "text-gray-500",
                      header.id === "select" ? "w-8" : ""
                    )}
                    onClick={header.column.getCanSort() ? header.column.getToggleSortingHandler() : undefined}
                  >
                    {header.isPlaceholder ? null : (
                      <div className="flex items-center gap-1">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getCanSort() && (
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                            {header.column.getIsSorted() === "asc" ? (
                              "↑"
                            ) : header.column.getIsSorted() === "desc" ? (
                              "↓"
                            ) : (
                              "↕"
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className={cn(
                    "h-8",
                    selectionMode === 'highlight' && [
                      "cursor-pointer",
                      "hover:bg-gray-50",
                      rowSelection[row.original.Id] && [
                        "bg-blue-50",
                        "hover:bg-blue-100"
                      ]
                    ]
                  )}
                  onClick={() => selectionMode === 'highlight' && handleRowClick(row.original.Id)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell 
                      key={cell.id} 
                      className="px-2 py-1 h-8"
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length + (selectionMode === 'checkbox' ? 1 : 0)}
                  className="h-16 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between px-2 py-1">
        <div className="flex items-center space-x-2">
          <span className="text-xs text-gray-500">Rows per page:</span>
          <Select
            value={pagination.pageSize.toString()}
            onValueChange={(value) => {
              const newSize = Number(value);
              onPaginationChange(0, newSize);
            }}
          >
            <SelectTrigger className="h-7 w-[60px] text-xs">
              <SelectValue>{pagination.pageSize}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {[10, 20, 30, 40, 50].map((size) => (
                <SelectItem key={size} value={size.toString()} className="text-xs">
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center justify-center text-xs text-gray-500">
            {`${pagination.pageIndex + 1} - ${Math.min(
              (pagination.pageIndex + pagination.pageSize),
              totalRows
            )} of ${totalRows}`}
          </div>
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              className="h-7 w-7 p-0"
              onClick={() => onPaginationChange(pagination.pageIndex - pagination.pageSize, pagination.pageSize)}
              disabled={pagination.pageIndex - pagination.pageSize < 0}
            >
              <span className="sr-only">Go to previous page</span>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              className="h-7 w-7 p-0"
              onClick={() => onPaginationChange(pagination.pageIndex + pagination.pageSize, pagination.pageSize)}
              disabled={pagination.pageIndex + pagination.pageSize >= totalRows}
            >
              <span className="sr-only">Go to next page</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
