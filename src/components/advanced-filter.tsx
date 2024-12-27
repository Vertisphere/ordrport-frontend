"use client"

import { useState, useRef, useEffect } from "react"
import { Filter, X, HelpCircle } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FilterBubble } from "./filter-bubble"
import { ColumnDefinition, EntityType } from "@/types/entities"

export interface FilterItem {
  id: string
  field: string
  value: string
}

interface AdvancedFilterProps<T extends EntityType> {
  onFiltersChange: (filters: FilterItem[]) => void
  columnVisibilityDropdown?: React.ReactNode
  entityColumns?: ColumnDefinition<T>[]
}

export function AdvancedFilter<T extends EntityType>({ 
  onFiltersChange, 
  columnVisibilityDropdown,
  entityColumns = []
}: AdvancedFilterProps<T>) {
  const [filters, setFilters] = useState<FilterItem[]>([])
  const [inputValue, setInputValue] = useState("")
  const [selectedField, setSelectedField] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [inputWidth, setInputWidth] = useState(0)

  const FILTERABLE_FIELDS = entityColumns
    .filter(column => column.filterable)
    .map(column => ({ label: column.header, value: column.accessorKey as string }))

  const addFilter = (field: string, value: string) => {
    const newFilter = {
      id: Math.random().toString(36).substr(2, 9),
      field: field.trim(),
      value: value.trim()
    }
    const newFilters = [...filters, newFilter]
    setFilters(newFilters)
    onFiltersChange(newFilters)
    setInputValue("")
    setSelectedField(null)
  }

  const removeFilter = (id: string) => {
    const newFilters = filters.filter(f => f.id !== id)
    setFilters(newFilters)
    onFiltersChange(newFilters)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      if (selectedField && inputValue) {
        addFilter(selectedField, inputValue);
      } else if (!selectedField && inputValue.includes(':')) {
        const [field, value] = inputValue.split(':');
        const matchedField = FILTERABLE_FIELDS.find(f => f.value.toLowerCase() === field.toLowerCase());
        if (matchedField && value.trim()) {
          addFilter(matchedField.value, value.trim());
        }
      } else if (!selectedField) {
        const firstField = filteredFields[0];
        if (firstField) {
          setSelectedField(firstField.value);
          setInputValue("");
        }
      }
    }
  };

  const handleFieldSelect = (field: string) => {
    setSelectedField(field);
    setInputValue("");
    inputRef.current?.focus();
  };

  const clearAll = () => {
    setFilters([])
    setInputValue("")
    setSelectedField(null)
    onFiltersChange([])
    inputRef.current?.focus()
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    
    if (value.includes(':') && !selectedField) {
      const [field, fieldValue] = value.split(':');
      const matchedField = FILTERABLE_FIELDS.find(f => f.value.toLowerCase() === field.toLowerCase());
      if (matchedField) {
        setSelectedField(matchedField.value);
        setInputValue(fieldValue.trim());
      }
    }
    
    // Update input width
    const tempSpan = document.createElement('span');
    tempSpan.style.visibility = 'hidden';
    tempSpan.style.position = 'absolute';
    tempSpan.style.whiteSpace = 'pre';
    tempSpan.style.font = window.getComputedStyle(e.target).font;
    tempSpan.textContent = value || e.target.placeholder;
    document.body.appendChild(tempSpan);
    setInputWidth(Math.max(20, tempSpan.offsetWidth + 10)); // Add some padding
    document.body.removeChild(tempSpan);

    // Ensure input maintains focus after state update
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleInputClick = () => {
    inputRef.current?.focus();
  };

  useEffect(() => {
    inputRef.current?.focus();
  }, [inputValue, selectedField]);

  const filteredFields = FILTERABLE_FIELDS.filter(field => 
    !selectedField && (field.label.toLowerCase().includes(inputValue.toLowerCase()) ||
    field.value.toLowerCase().includes(inputValue.toLowerCase()))
  )

  return (
    <div className="flex items-center gap-1.5 px-1.5 py-1 border rounded-md bg-gray-50/50 w-full">
      <div className="flex items-center gap-1.5 text-gray-500">
        <Filter className="h-4 w-4" />
        <span className="text-xs font-medium">Filter</span>
      </div>
      <div className="flex flex-wrap gap-1.5 flex-grow min-h-[28px] items-center">
        {filters.map(filter => (
          <FilterBubble
            key={filter.id}
            field={filter.field}
            value={filter.value}
            onRemove={() => removeFilter(filter.id)}
          />
        ))}
        <div className="relative flex-1 min-w-[120px]">
          {selectedField ? (
            <div className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-1 rounded-md text-xs">
              <span className="font-medium whitespace-nowrap">{selectedField}:</span>
              <input
                ref={inputRef}
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                onClick={handleInputClick}
                className="flex-1 bg-transparent border-none focus:outline-none text-xs min-w-[20px]"
                style={{ width: `${inputWidth}px` }}
                placeholder={`Enter value for ${FILTERABLE_FIELDS.find(f => f.value === selectedField)?.label}`}
              />
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 hover:bg-blue-100 ml-1"
                onClick={() => {
                  setSelectedField(null);
                  setInputValue("");
                }}
              >
                <X className="h-3 w-3" />
                <span className="sr-only">Remove field</span>
              </Button>
            </div>
          ) : (
            <Input
              ref={inputRef}
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onClick={handleInputClick}
              className="h-7 w-full text-xs border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 p-0"
              placeholder="Filter services (field:value)"
            />
          )}
          {!selectedField && inputValue && (
            <div 
              className="absolute z-10 w-48 mt-1 py-1 bg-white rounded-md shadow-lg"
            >
              {filteredFields.map((field) => (
                <div
                  key={field.value}
                  className="px-3 py-1 text-xs hover:bg-gray-100 cursor-pointer"
                  onClick={() => handleFieldSelect(field.value)}
                >
                  {field.label}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center gap-1">
        {(filters.length > 0 || inputValue || selectedField) && (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={clearAll}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Clear filters</span>
          </Button>
        )}
        {columnVisibilityDropdown}
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 text-gray-500"
        >
          <HelpCircle className="h-4 w-4" />
          <span className="sr-only">Filter help</span>
        </Button>
      </div>
    </div>
  )
}

