"use client"

import * as React from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Info } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { FormField, EntityType } from "@/types/entities"

interface EditFormProps<T extends EntityType> {
  title: string
  description?: string
  fields: FormField[]
  values: T
  onSave: (values: T) => void
  onCancel: () => void
}

export function EditForm<T extends EntityType>({
  title,
  description,
  fields,
  values,
  onSave,
  onCancel
}: EditFormProps<T>) {
  const [formValues, setFormValues] = React.useState<T>(values)
  const [isEdited, setIsEdited] = React.useState(false)

  const handleChange = (key: string, value: any) => {
    // Handle nested keys (e.g., "PrimaryEmailAddr.Address")
    const keys = key.split('.')
    if (keys.length > 1) {
      setFormValues(prev => {
        const newValues = { ...prev }
        let current: any = newValues
        for (let i = 0; i < keys.length - 1; i++) {
          current[keys[i]] = { ...current[keys[i]] }
          current = current[keys[i]]
        }
        current[keys[keys.length - 1]] = value
        return newValues
      })
    } else {
      setFormValues(prev => ({ ...prev, [key]: value }))
    }
    setIsEdited(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formValues)
  }

  const renderField = (field: FormField) => {
    // Get the value, handling nested keys
    const getValue = (key: string) => {
      const keys = key.split('.')
      let value: any = formValues
      for (const k of keys) {
        value = value?.[k]
      }
      return value
    }

    switch (field.type) {
      case 'select':
        return (
          <Select
            value={getValue(field.key)?.toString()}
            onValueChange={(value) => handleChange(field.key, value)}
          >
            <SelectTrigger id={field.key} className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )
      case 'boolean':
        return (
          <Select
            value={getValue(field.key)?.toString()}
            onValueChange={(value) => handleChange(field.key, value === 'true')}
          >
            <SelectTrigger id={field.key} className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="true">Yes</SelectItem>
              <SelectItem value="false">No</SelectItem>
            </SelectContent>
          </Select>
        )
      default:
        return (
          <Input
            id={field.key}
            type={field.type}
            value={getValue(field.key) || ''}
            onChange={(e) => handleChange(field.key, e.target.value)}
            className="w-full"
            required={field.required}
          />
        )
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1">
        <div className="space-y-1 mb-6">
          <h2 className="text-lg font-semibold">{title}</h2>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          {fields.map((field) => (
            <div key={field.key} className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor={field.key} className="text-sm font-medium">
                  {field.label}
                  {field.required && <span className="text-red-500 ml-0.5">*</span>}
                </Label>
                {field.description && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-3.5 w-3.5 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs">{field.description}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
              {renderField(field)}
            </div>
          ))}
        </form>
      </div>
      <div className="border-t mt-6 px-4 py-3 -mx-4 -mb-4 flex justify-end gap-2">
        <Button
          type="button"
          variant="ghost"
          onClick={onCancel}
          className="h-8 px-3 text-sm"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={!isEdited}
          onClick={handleSubmit}
          className="h-8 px-3 text-sm"
        >
          Save changes
        </Button>
      </div>
    </div>
  )
}

