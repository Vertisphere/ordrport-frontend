"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Filter, HelpCircle, Trash2 } from "lucide-react";
import { LineItem } from "@/types/entities";
import { cn } from "@/lib/utils";

interface EditableOrderInfoSectionProps {
  items: LineItem[];
  onQuantityChange: (itemId: string, quantity: number) => void;
  onRemoveItem: (itemId: string) => void;
  onSave: () => Promise<void>;
  onSubmit?: () => Promise<void>;
  isSaving?: boolean;
  isSubmitting?: boolean;
  editable?: boolean;
  canSubmit?: boolean;
  canSave?: boolean
}

export function EditableOrderInfoSection({
  items,
  onQuantityChange,
  onRemoveItem,
  onSave,
  onSubmit,
  isSaving = false,
  isSubmitting = false,
  editable = true,
  canSubmit = false,
  canSave = false,
}: EditableOrderInfoSectionProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredItems = items.filter((item) => {
    if (!item?.item?.Name) return false;
    return item.item.Name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleSaveAndSubmit = async () => {
    try {
      // First save the changes
      await onSave();
      // Then submit the order if onSubmit is provided
      if (onSubmit) {
        await onSubmit();
      }
    } catch (error) {
      console.error("Error in save and submit:", error);
    }
  };

  const calculateTotal = (quantity: number, unitPrice: number) => {
    return quantity * unitPrice
  }

  return (
      <div className="p-0 h-full flex-1 flex flex-col min-h-0">
        <div className="px-4 py-2 border-y bg-gray-50 flex-none">
          <div className="relative flex items-center">
            <Filter className="absolute left-2 h-3 w-3 text-muted-foreground" />
            <span className="absolute left-6 text-xs text-muted-foreground font-medium">
              Filter
            </span>
            <Input
              type="text"
              placeholder="Enter item name"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-16 h-7 text-xs bg-gray-100 focus-visible:ring-1 focus-visible:ring-gray-400 focus-visible:ring-offset-0"
            />
            <HelpCircle className="absolute right-2 h-3 w-3 text-muted-foreground" />
          </div>
        </div>
        <div className="flex-1 overflow-auto min-h-0">
          <div className="sticky top-0 grid grid-cols-[2fr,80px,80px,80px,40px] gap-2 px-4 py-1.5 bg-muted/30 z-10">
            <div className="text-xs font-medium">Item Name</div>
            <div className="text-xs font-medium text-right">Quantity</div>
            <div className="text-xs font-medium text-right">Unit Price</div>
            <div className="text-xs font-medium text-right">Total</div>
            <div className="text-xs font-medium"></div>
          </div>
          <div>
            {filteredItems.map((lineItem) => {
              const unitPrice = lineItem.item.UnitPrice || 0
              const total = calculateTotal(lineItem.quantity, unitPrice)
              
              return (
                <div
                  key={lineItem.item.Id}
                  className="w-full px-4 py-1.5 grid grid-cols-[2fr,80px,80px,80px,40px] gap-2 text-left hover:bg-muted/30 transition-colors items-center group"
                >
                  <div className="text-xs">{lineItem.item.Name}</div>
                  <div className="flex justify-end">
                    {editable ? (
                      <Input
                        type="number"
                        value={lineItem.quantity === 0 ? '' : lineItem.quantity}
                        onChange={(e) => {
                          const value = e.target.value
                          if (value === '') {
                            onQuantityChange(lineItem.item.Id, 0)
                          } else {
                            const numValue = parseInt(value)
                            if (!isNaN(numValue) && numValue >= 0) {
                              onQuantityChange(lineItem.item.Id, numValue)
                            }
                          }
                        }}
                        className="w-12 h-6 text-xs text-right p-0 border border-gray-300 rounded-md focus-visible:ring-0 focus-visible:ring-offset-0"
                        min="0"
                      />
                    ) : (
                      <div className="text-xs">{lineItem.quantity}</div>
                    )}
                  </div>
                  <div className="text-xs text-right">
                    ${unitPrice.toFixed(2)}
                  </div>
                  <div className="text-xs text-right font-medium">
                    ${total.toFixed(2)}
                  </div>
                  <div className="flex justify-end">
                    {editable && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onRemoveItem(lineItem.item.Id)}
                        className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      {editable && (
        <div className="mt-auto px-4 py-3 border-t flex gap-2 bg-white flex-none">
          <Button
            onClick={handleSaveAndSubmit}
            disabled={isSaving || isSubmitting || !canSubmit}
            variant="outline"
            size="sm"
            className={cn(
              "font-medium transition-colors",
              "hover:bg-blue-50 hover:text-blue-600 hover:border-blue-600",
              (isSaving || isSubmitting) && "opacity-50 cursor-not-allowed"
            )}
          >
            {isSubmitting
              ? "Submitting..."
              : isSaving
              ? "Saving..."
              : !canSubmit
              ? "Already Pending; Can only modify items"
              : "Submit Order"}
          </Button>

          <Button
            onClick={onSave}
            disabled={isSaving || isSubmitting || !canSave}
            variant="outline"
            size="sm"
            className={cn(
              "font-medium transition-colors",
              "hover:bg-blue-50 hover:text-blue-600 hover:border-blue-600",
              (isSaving || isSubmitting) && "opacity-50 cursor-not-allowed"
            )}
          >
            {isSubmitting
              ? "Submitting..."
              : isSaving
              ? "Saving..."
              : !canSave
              ? "Can only modify items when draft or pending"
              : "Save Changes"}
          </Button>

          {/* <Button
            variant="ghost"
            size="sm"
            disabled={isSaving || isSubmitting}
            className="text-gray-500 hover:text-gray-700 hover:bg-gray-50"
          >
            Discard Changes
          </Button> */}
        </div>
      )}
    </div>
  );
}
