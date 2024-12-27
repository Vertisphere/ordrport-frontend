import { TypeIcon as type, LucideIcon, CheckCircle, XCircle } from 'lucide-react'

export interface LoadBalancer {
  id: string
  name: string
  type: string
  accessType: string
  protocols: string
  region: string
  backends: {
    count: number
    instanceGroups: number
    networkEndpointGroups: number
    healthy: boolean
  }
}

export interface ComputeEngine {
  id: string
  name: string
  zone: string
  machineType: string
  internalIP: string
  externalIP: string
  status: 'Running' | 'Stopped'
}

export type EntityType = LoadBalancer | ComputeEngine | Franchisee

export interface ColumnDefinition<T> {
  accessorKey: keyof T
  id?: string
  header: string
  filterable: boolean
  sortable: boolean
  visible: boolean
  cell?: (value: any) => React.ReactNode
}
export const loadBalancerColumns: ColumnDefinition<LoadBalancer>[] = [
  { accessorKey: "name", header: "Name", filterable: true, sortable: true, visible: true },
  { accessorKey: "type", header: "Load balancer type", filterable: true, sortable: true, visible: true },
  { accessorKey: "accessType", header: "Access type", filterable: true, sortable: true, visible: true },
  { accessorKey: "protocols", header: "Protocols", filterable: true, sortable: true, visible: true },
  { accessorKey: "region", header: "Region", filterable: true, sortable: true, visible: true },
  { 
    accessorKey: "backends", 
    header: "Backends", 
    filterable: false, 
    sortable: false,
    visible: true,
    cell: (value: LoadBalancer['backends']) => (
      <div className="flex items-center gap-0.5 text-xs">
        {value.healthy ? (
          <CheckCircle className="h-3 w-3 text-green-500" />
        ) : (
          <XCircle className="h-3 w-3 text-red-500" />
        )}
        <span>
          {value.count} backend ({value.instanceGroups} IG, {value.networkEndpointGroups} NEG)
        </span>
      </div>
    )
  },
]

export const statusIcons: Record<ComputeEngine['status'], LucideIcon> = {
  'Running': CheckCircle,
  'Stopped': XCircle,
}

export const computeEngineColumns: ColumnDefinition<ComputeEngine>[] = [
  { accessorKey: "name", header: "Name", filterable: true, sortable: true, visible: true },
  { accessorKey: "machineType", header: "Machine Type", filterable: true, sortable: true, visible: true },
  { accessorKey: "zone", header: "Zone", filterable: true, sortable: true, visible: true },
  { 
    accessorKey: "status", 
    header: "Status", 
    filterable: true, 
    sortable: true,
    visible: true,
    cell: (value: ComputeEngine['status']) => {
      const Icon = statusIcons[value]
      return (
        <div className="flex items-center gap-2">
          <Icon className={value === 'Running' ? 'text-green-500' : 'text-red-500'} size={16} />
          <span>{value}</span>
        </div>
      )
    }
  },
  { accessorKey: "internalIP", header: "Internal IP", filterable: true, sortable: true, visible: true },
  { accessorKey: "externalIP", header: "External IP", filterable: true, sortable: true, visible: true },
]
export interface Franchisee {
  Id: string
  SyncToken: string
  MetaData: {
    CreateTime: string
    LastUpdatedTime: string
  }
  GivenName: string
  FamilyName: string
  DisplayName: string
  FullyQualifiedName: string
  PrintOnCheckName: string
  Active: boolean
  PrimaryPhone: Record<string, unknown>
  AlternatePhone: Record<string, unknown>
  Mobile: Record<string, unknown>
  Fax: Record<string, unknown>
  CustomerTypeRef: Record<string, unknown>
  PrimaryEmailAddr: {
    Address: string
  }
  Taxable: boolean
  BillAddr: {
    Id: string
    Line1: string
    City: string
    CountrySubDivisionCode: string
    PostalCode: string
    Lat: string
    Long: string
  }
  Job: boolean
  ParentRef: Record<string, unknown>
  Balance: number
  OpenBalanceDate: string
  BalanceWithJobs: number
  qb_customer_id: string
  qb_company_id: string
  firebase_id: string
  created_at: string
}

export const franchiseeColumns: ColumnDefinition<Franchisee>[] = [
  { 
    accessorKey: "Id", 
    header: "ID", 
    filterable: true, 
    sortable: true,
    visible: true
  },
  { 
    accessorKey: "SyncToken",
    header: "Sync Token",
    filterable: true,
    sortable: true,
    visible: false
  },
  {
    accessorKey: "MetaData.CreateTime" as keyof Franchisee,
    header: "Created Time", 
    filterable: true,
    sortable: true,
    cell: (value: string) => value ? new Date(value).toLocaleString() : '-',
    visible: false
  },
  {
    accessorKey: "MetaData.LastUpdatedTime" as keyof Franchisee,
    header: "Last Updated",
    filterable: true,
    sortable: true,
    cell: (value: string) => value ? new Date(value).toLocaleString() : '-',
    visible: false
  },
  {
    accessorKey: "GivenName",
    header: "Given Name",
    filterable: true,
    sortable: true,
    visible: true
  },
  {
    accessorKey: "FamilyName",
    header: "Last Name",
    filterable: true,
    sortable: true,
    visible: false
  },
  { 
    accessorKey: "DisplayName", 
    header: "Display Name", 
    filterable: true, 
    sortable: true,
    visible: false
  },
  {
    accessorKey: "FullyQualifiedName",
    header: "Full Name",
    filterable: true,
    sortable: true,
    visible: false
  },
  {
    accessorKey: "PrintOnCheckName",
    header: "Check Name",
    filterable: true,
    sortable: true,
    visible: false
  },
  {
    accessorKey: "Active",
    header: "Status",
    filterable: true,
    sortable: true,
    cell: (value: boolean) => value ? "Active" : "Inactive",
    visible: false
  },
  {
    accessorKey: "PrimaryEmailAddr",
    header: "Email",
    filterable: true,
    sortable: true,
    cell: (value: Franchisee['PrimaryEmailAddr']) => value?.Address || '-',
    visible: true
  },
  {
    accessorKey: "Taxable",
    header: "Taxable",
    filterable: true,
    sortable: true,
    cell: (value: boolean) => value ? "Yes" : "No",
    visible: false
  },
  {
    accessorKey: "BillAddr",
    header: "Billing Address",
    filterable: true,
    sortable: true,
    cell: (value: Franchisee['BillAddr']) => {
      if (!value) return "-"
      return `${value.Line1}, ${value.City}, ${value.CountrySubDivisionCode} ${value.PostalCode}`
    },
    visible: true
  },
  {
    accessorKey: "Job",
    header: "Is Job",
    filterable: true,
    sortable: true,
    cell: (value: boolean) => value ? "Yes" : "No",
    visible: false
  },
  {
    accessorKey: "Balance",
    header: "Balance",
    filterable: true,
    sortable: true,
    cell: (value: number) => `$${value.toFixed(2)}`,
    visible: true
  },
  {
    accessorKey: "OpenBalanceDate",
    header: "Balance Date",
    filterable: true,
    sortable: true,
    cell: (value: string) => new Date(value).toLocaleDateString(),
    visible: false
  },
  {
    accessorKey: "BalanceWithJobs",
    header: "Balance with Jobs",
    filterable: true,
    sortable: true,
    cell: (value: number) => `$${value.toFixed(2)}`,
    visible: false
  },
  {
    accessorKey: "qb_customer_id",
    header: "QB Customer ID",
    filterable: true,
    sortable: true,
    visible: false
  },
  {
    accessorKey: "qb_company_id",
    header: "QB Company ID",
    filterable: false,
    sortable: true,
    visible: false
  },
  {
    accessorKey: "firebase_id",
    header: "Firebase ID",
    filterable: false,
    sortable: true,
    visible: true
  },
  {
    accessorKey: "created_at",
    header: "Created At",
    filterable: true,
    sortable: true,
    cell: (value: string) => new Date(value).toLocaleString(),
    visible: false
  }
]


