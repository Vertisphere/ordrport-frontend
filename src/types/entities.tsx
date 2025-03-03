import { TypeIcon as type, LucideIcon, CheckCircle, XCircle, FileText, FileEdit, RotateCcw, Archive, Plus } from 'lucide-react'
import Link from "next/link"
import { Button } from "@/components/ui/button"

export interface InvoiceInfo {
  invoice: {
    Id: string
    SyncToken: string
    MetaData: {
      CreateTime: string
      LastUpdatedTime: string
    }
    DocNumber: string
    TxnDate: string
    Line: Array<{
      Id: string
      LineNum: number
      Amount: number
      DetailType: string
      SalesItemLineDetail?: {
        ItemRef: {
          value: string
          name: string
        }
        Qty: number
        ItemAccountRef: {
          value: string
          name: string
        }
        TaxCodeRef: {
          value: string
        }
        ServiceDate: string
      }
    }>
    TxnTaxDetail: {
      TotalTax: number
      TaxLine: Array<{
        Amount: number
        DetailType: string
        TaxLineDetail: {
          PercentBased: boolean
          NetAmountTaxable: number
          TaxPercent: number
          TaxRateRef: {
            value: string
          }
        }
      }>
    }
    CustomerRef: {
      value: string
      name: string
    }
    DueDate: string
    TotalAmt: number
    CurrencyRef: {
      value: string
      name: string
    }
    ExchangeRate: number
    HomeBalance: number
    PrintStatus: string
    EmailStatus: string
    Balance: number
  }
}

export interface LineItem {
  item: {
    Id: string
    Name: string
    UnitPrice: number
    SalesTaxCodeRef: {
      value: string
    }
  }
  quantity: number
}

export interface Invoice {
  Id: string
  CustomerRef: {
    value: string
    name: string
  }
  DocNumber: string
  TxnDate: string
  TotalAmt: number
  Balance: number
}

export interface Item {
  Id: string
  Name: string
  Sku: string
  Description: string
  Active: boolean
  UnitPrice: number
  Type: string
  QtyOnHand: number
  MetaData: {
    CreateTime: string
    LastUpdatedTime: string
  }
  IncomeAccountRef: {
    value: string
    name: string
  }
  ExpenseAccountRef: {
    value: string
    name: string
  }
  AssetAccountRef: {
    value: string
    name: string
  }
  SalesTaxCodeRef: {
    value: string
  }
}

export type EntityType =  Franchisee | Invoice | Item | InvoiceInfo

export interface ColumnDefinition<T> {
  accessorKey: keyof T | string
  id?: string
  header: string
  filterable: boolean
  sortable: boolean
  visible?: boolean
  cell?: (value: any) => React.ReactNode
}

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

export interface FormField {
  key: string
  label: string
  type: 'text' | 'select' | 'number' | 'date' | 'boolean'
  description?: string
  required?: boolean
  options?: string[]
}

export interface EntityFormConfig {
  fields: FormField[]
  title: string
  description: string
}

export const franchiseeFormConfig: EntityFormConfig = {
  title: "Franchisee",
  description: "Configure franchisee settings",
  fields: [
    {
      key: "GivenName",
      label: "Given Name",
      type: "text",
      description: "First name of the franchisee",
      required: true
    },
    {
      key: "FamilyName",
      label: "Family Name",
      type: "text",
      description: "Last name of the franchisee",
      required: true
    },
    {
      key: "Active",
      label: "Status",
      type: "select",
      options: ['Active', 'Inactive'],
      description: "Current status of the franchisee",
      required: true
    },
    {
      key: "PrimaryEmailAddr.Address",
      label: "Email Address",
      type: "text",
      description: "Primary contact email",
      required: true
    },
    // Add more fields as needed
  ]
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
    cell: (value: number) => `$${value ? value.toFixed(2) : 'N/A'}`,
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
    cell: (value: number) => `$${value ? value.toFixed(2) : 'N/A'}`,
    visible: false
  },
  // {
  //   accessorKey: "qb_customer_id",
  //   header: "QB Customer ID",
  //   filterable: true,
  //   sortable: true,
  //   visible: false
  // },
  // {
  //   accessorKey: "qb_company_id",
  //   header: "QB Company ID",
  //   filterable: false,
  //   sortable: true,
  //   visible: false
  // },
  {
    accessorKey: "firebase_id",
    header: "Is Linked",
    filterable: false,
    sortable: false,
    visible: true,
    cell: (value: string) => value ? <CheckCircle className="h-3 w-3 text-green-500" /> : <XCircle className="h-3 w-3 text-red-500" />,
  },
  // {
  //   accessorKey: "created_at",
  //   header: "Created At",
  //   filterable: true,
  //   sortable: true,
  //   cell: (value: string) => new Date(value).toLocaleString(),
  //   visible: false
  // }
]

const INVOICE_STATUS = {
  DRAFT: { icon: FileText, label: 'Draft', color: 'text-gray-500' },
  PENDING: { icon: FileEdit, label: 'Pending', color: 'text-yellow-500' },
  APPROVED: { icon: CheckCircle, label: 'Approved', color: 'text-green-500' },
  REVISION: { icon: RotateCcw, label: 'Revision', color: 'text-orange-500' },
  VOID: { icon: XCircle, label: 'Void', color: 'text-red-500' },
  COMPLETE: { icon: Archive, label: 'Complete', color: 'text-blue-500' },
}

export const getInvoiceStatus = (docNumber: string) => {
  const prefix = docNumber.substring(0, 8);
  
  switch (prefix) {
    case 'A1000000':
      return INVOICE_STATUS.DRAFT;
    case 'A0100000':
      return INVOICE_STATUS.PENDING;
    case 'A0010000':
      return INVOICE_STATUS.APPROVED;
    case 'A0001000':
      return INVOICE_STATUS.REVISION;
    case 'A0000100':
      return INVOICE_STATUS.VOID;
    case 'A0000010':
      return INVOICE_STATUS.COMPLETE;
    default:
      return INVOICE_STATUS.DRAFT;
  }
}

export const invoiceColumns: ColumnDefinition<Invoice>[] = [
  {
    accessorKey: "Id",
    header: "ID",
    filterable: true,
    sortable: true,
    visible: true,
    cell: (value: string) => (
      <Link 
        href={`/franchisee/orders/${value}`}
        className="text-blue-600 text-decoration-line-underline"
        style={{ textDecoration: 'underline' }}
      >
        {value}
      </Link>
    )
  },
  {
    accessorKey: "CustomerRef",
    header: "Customer",
    filterable: false,
    sortable: false,
    visible: true,
    cell: (value: Invoice['CustomerRef']) => value.name
  },
  {
    accessorKey: "DocNumber",
    header: "Document Number",
    filterable: true,
    sortable: true,
    visible: false
  },
  {
    accessorKey: "TxnDate",
    header: "Date",
    filterable: false,
    sortable: true,
    visible: true,
    cell: (value: string) => new Date(value).toLocaleDateString()
  },
  {
    accessorKey: "TotalAmt",
    header: "Total Amount",
    filterable: false,
    sortable: true,
    visible: true,
    cell: (value: number) => `$${ value ? value.toFixed(2) : 'N/A'}`
  },
  {
    accessorKey: "Balance",
    header: "Balance",
    filterable: false,
    sortable: true,
    visible: true,
    cell: (value: number) => `$${value ? value.toFixed(2) : 'N/A'}`
  },
  {
    accessorKey: "DocNumber",
    id: "status",
    header: "Status",
    filterable: false,
    sortable: false,
    visible: true,
    cell: (value: string) => {
      let status;
      const prefix = value.substring(0, 8);
      
      switch (prefix) {
        case 'A1000000':
          status = INVOICE_STATUS.DRAFT;
          break;
        case 'A0100000':
          status = INVOICE_STATUS.PENDING;
          break;
        case 'A0010000':
          status = INVOICE_STATUS.APPROVED;
          break;
        case 'A0001000':
          status = INVOICE_STATUS.REVISION;
          break;
        case 'A0000100':
          status = INVOICE_STATUS.VOID;
          break;
        case 'A0000010':
          status = INVOICE_STATUS.COMPLETE;
          break;
        default:
          status = INVOICE_STATUS.DRAFT;
      }

      const Icon = status.icon;
      
      return (
        <div className="flex items-center gap-2">
          <Icon className={`h-4 w-4 ${status.color}`} />
          <span>{status.label}</span>
        </div>
      );
    }
  },
]

export const itemColumns: ColumnDefinition<Item>[] = [
  {
    accessorKey: "Id",
    header: "ID",
    filterable: true,
    sortable: true,
    visible: true
  },
  {
    accessorKey: "Name",
    header: "Name",
    filterable: true,
    sortable: true,
    visible: true
  },
  {
    accessorKey: "Sku",
    header: "SKU",
    filterable: true,
    sortable: false,
    visible: true
  },
  {
    accessorKey: "UnitPrice",
    header: "Unit Price",
    filterable: false,
    sortable: true,
    visible: true,
    cell: (value: number) => `$${ value ? value.toFixed(2) : 'N/A'}`
  },
  {
    accessorKey: "QtyOnHand",
    header: "Quantity",
    filterable: false,
    sortable: false,
    visible: true
  }
]

export type InvoiceStatus = keyof typeof INVOICE_STATUS;


