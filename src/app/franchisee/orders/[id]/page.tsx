"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { OrderPanel } from "@/components/order/order-panel";
import { OrderInfoSection } from "@/components/order/order-info-section";
import { DataTable } from "@/components/data-table";
import {
  Item,
  itemColumns,
  LineItem,
  InvoiceInfo,
  getInvoiceStatus,
} from "@/types/entities";
import { SortingState } from "@tanstack/react-table";
import { FilterItem } from "@/components/advanced-filter";
import { Plus } from "lucide-react";
import { EditableOrderInfoSection } from "@/components/order/editable-order-info-section";
import { useToast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { get } from "http";

export default function OrderPage() {
  const params = useParams();
  const router = useRouter();
  const [invoice, setInvoice] = useState<InvoiceInfo | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [selectedRows, setSelectedRows] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [totalRows, setTotalRows] = useState(0);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<FilterItem[]>([]);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 50 });
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [skipEffect, setSkipEffect] = useState(false);
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch invoice details
  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const jwt = localStorage.getItem("jwt");
        if (!jwt) {
          router.push("/franchisee");
          return;
        }

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_ENDPOINT}/qbInvoice/${params.id}`,
          {
            headers: {
              Authorization: `Bearer ${jwt}`,
            },
          }
        );

        if (response.status === 401) {
          router.push("/franchisee");
          return;
        }

        const data: InvoiceInfo = await response.json();
        setInvoice(data);
      } catch (error) {
        console.error("Error fetching invoice:", error);
      }
    };

    fetchInvoice();
  }, [params.id, router]);

  const buildQueryString = useCallback(
    (
      pageSize: number,
      pageToken: number,
      sorting: SortingState,
      filters: FilterItem[]
    ) => {
      const params = new URLSearchParams({
        page_size: pageSize.toString(),
        page_token: pageToken.toString(),
      });

      if (sorting.length > 0) {
        const { id, desc } = sorting[0];
        params.append("order_by", `${id} ${desc ? "DESC" : "ASC"}`);
      }

      if (filters.length > 0) {
        const queryFilters = filters
          .map((filter) => `${filter.field} LIKE '%${filter.value}%'`)
          .join(" AND ");
        params.append("query", queryFilters);
      }

      return params.toString();
    },
    []
  );

  const fetchItems = useCallback(
    async ({
      pageIndex = 0,
      pageSize = 50,
      sorting = [] as SortingState,
      filters = [] as FilterItem[],
    }) => {
      setIsLoading(true);
      setSelectedRows({});

      try {
        const jwt = localStorage.getItem("jwt");
        if (!jwt) {
          router.push("/franchisee");
          return;
        }

        const queryString = buildQueryString(
          pageSize,
          pageIndex + 1,
          sorting,
          filters
        );
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_ENDPOINT}/qbItems?${queryString}`,
          {
            headers: {
              Authorization: `Bearer ${jwt}`,
            },
          }
        );

        if (response.status === 401) {
          router.push("/franchisee");
          return;
        }

        const data = await response.json();
        setItems(data.items || []);
        setTotalRows(data.total_count || 0);
      } catch (error) {
        console.error("Error fetching items:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [router, buildQueryString]
  );

  useEffect(() => {
    if (!skipEffect) {
      fetchItems({
        pageIndex: pagination.pageIndex,
        pageSize: pagination.pageSize,
        sorting,
        filters: columnFilters,
      });
    }
  }, [pagination, sorting, columnFilters, skipEffect, fetchItems]);

  const handleAddToOrder = (item: Item) => {
    setLineItems((prev) => {
      const exists = prev.find((li) => li.item.Id === item.Id);
      if (exists) {
        return prev.map((li) =>
          li.item.Id === item.Id ? { ...li, quantity: li.quantity + 1 } : li
        );
      }
      return [
        ...prev,
        {
          item: {
            Id: item.Id,
            Name: item.Name,
            UnitPrice: item.UnitPrice,
            SalesTaxCodeRef: {
              value: item.SalesTaxCodeRef?.value || "5",
            },
          },
          quantity: 1,
        },
      ];
    });
  };

  useEffect(() => {
    if (invoice) {
      const items = invoice.invoice.Line.filter(
        (line) =>
          line.SalesItemLineDetail?.ItemRef &&
          line.DetailType === "SalesItemLineDetail"
      ).map((line) => ({
        item: {
          Id: line.SalesItemLineDetail!.ItemRef.value,
          Name: line.SalesItemLineDetail!.ItemRef.name,
          UnitPrice: line.Amount / line.SalesItemLineDetail!.Qty,
          SalesTaxCodeRef: {
            value: line.SalesItemLineDetail!.TaxCodeRef.value,
          },
        },
        quantity: line.SalesItemLineDetail!.Qty,
      }));
      setLineItems(items);
    }
  }, [invoice]);

  const handleSaveChanges = async () => {
    setIsSaving(true);
    try {
      const jwt = localStorage.getItem("jwt");
      if (!jwt) return;

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_ENDPOINT}/qbInvoice:modify/${params.id}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${jwt}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            lines: lineItems.map((item) => ({
              item: {
                Id: item.item.Id,
                UnitPrice: item.item.UnitPrice,
                SalesTaxCodeRef: item.item.SalesTaxCodeRef,
              },
              quantity: item.quantity,
            })),
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Changes saved successfully",
          description: "Your order has been updated.",
          variant: "default",
        });
      }
    } catch (error) {
      console.error("Error saving changes:", error);
      toast({
        title: "Error saving changes",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmitOrder = async () => {
    setIsSubmitting(true);
    try {
      const jwt = localStorage.getItem("jwt");
      if (!jwt) return;

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_ENDPOINT}/qbInvoice:publish/${params.id}`,
        {
          headers: {
            Authorization: `Bearer ${jwt}`,
          },
        }
      );
      const data = await response.json();
      if (data.success) {
        toast({
          title: "Order submitted successfully",
          description: "Your order has been submitted.",
          variant: "default",
        });
        // Redirect back to orders page after successful submission
        router.push("/franchisee/orders");
      }
    } catch (error) {
      console.error("Error submitting order:", error);
      toast({
        title: "Error submitting order",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper to check if order can be submitted
  const canSubmitOrder = invoice
    ? getInvoiceStatus(invoice.invoice.DocNumber).label === "Draft"
    : false;
  
  const canSaveChanges = invoice
    ? getInvoiceStatus(invoice.invoice.DocNumber).label === "Draft" || getInvoiceStatus(invoice.invoice.DocNumber).label === "Pending"
    : false;

  return (
    <div className="flex flex-col h-[calc(100vh-57px)]">
      <PageHeader
        title={`Order #${params.id}`}
        subtitle={invoice?.invoice.CustomerRef.name || "Loading..."}
      />

      <div className="flex flex-1 min-h-0">
        <div className="w-1/2 p-4 overflow-auto">
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
              setSkipEffect(true);
              setPagination({ pageIndex, pageSize });
              setTimeout(() => setSkipEffect(false), 0);
            }}
            onSortingChange={(newSorting) => {
              setSkipEffect(true);
              setSorting(newSorting);
              setPagination((prev) => ({ ...prev, pageIndex: 0 }));
              setTimeout(() => setSkipEffect(false), 0);
            }}
            onFiltersChange={(newFilters) => {
              setSkipEffect(true);
              setColumnFilters(newFilters);
              setPagination((prev) => ({ ...prev, pageIndex: 0 }));
              setTimeout(() => setSkipEffect(false), 0);
            }}
            // onSelectionChange={setSelectedRows}
            // rowSelection={selectedRows}
            rowActions={[
              {
                label: "Add to Order",
                icon: Plus,
                onClick: (item: Item) => handleAddToOrder(item),
              },
            ]}
            selectionMode="none"
          />
        </div>

        {invoice && (
          <OrderPanel
            orderId={invoice.invoice.Id}
            customerName={invoice.invoice.CustomerRef.name}
            detailsContent={
              <OrderInfoSection
                invoice={invoice.invoice}
                actions={[
                  {
                    buttonText: "SUBMIT",
                    buttonColor: "bg-blue-600 hover:bg-blue-700",
                    opensModal: true,
                    modalTitle: "Submit Order",
                    modalDescription:
                      "This will send an order request to your franchisor. Are you sure you want to proceed?",
                    onSubmit: handleSubmitOrder,
                    disabled: !canSubmitOrder,
                  },
                ]}
              />
            }
            itemsContent={
              <EditableOrderInfoSection
                items={lineItems}
                onQuantityChange={(itemId, quantity) => {
                  setLineItems((prev) =>
                    prev.map((item) =>
                      item.item.Id === itemId ? { ...item, quantity } : item
                    )
                  );
                }}
                onRemoveItem={(itemId) => {
                  setLineItems((prev) =>
                    prev.filter((item) => item.item.Id !== itemId)
                  );
                }}
                onSave={handleSaveChanges}
                onSubmit={handleSubmitOrder}
                isSaving={isSaving}
                isSubmitting={isSubmitting}
                canSubmit={canSubmitOrder}
              />
            }
          />
        )}
      </div>
      <Toaster />
    </div>
  );
}
