'use client'
import { X } from 'lucide-react'
import { Button } from "@/components/ui/button"

interface FilterBubbleProps {
  field: string
  value: string
  onRemove: () => void
}

export function FilterBubble({ field, value, onRemove }: FilterBubbleProps) {
  return (
    <div className="flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-1 rounded-md text-xs">
      <span className="font-medium">{field}:</span>
      <span>{value}</span>
      <Button
        variant="ghost"
        size="sm"
        className="h-4 w-4 p-0 hover:bg-blue-100"
        onClick={onRemove}
      >
        <X className="h-3 w-3" />
        <span className="sr-only">Remove filter</span>
      </Button>
    </div>
  )
}

