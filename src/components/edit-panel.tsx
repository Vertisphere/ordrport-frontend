"use client"

import { useEffect, useState } from "react"
import { X } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { EntityType, EntityFormConfig } from "@/types/entities"
import { EditForm } from "./edit-form"

interface EditPanelProps<T extends EntityType> {
  isOpen: boolean
  onClose: () => void
  entity: T | null
  formConfig: EntityFormConfig
}

export function EditPanel<T extends EntityType>({ 
  isOpen, 
  onClose, 
  entity, 
  formConfig 
}: EditPanelProps<T>) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  if (!mounted || !entity) return null

  const handleSave = (values: Record<string, any>) => {
    console.log('Saving changes:', values)
    onClose()
  }

  return (
    <div
      className={`fixed inset-0 z-50 ${
        isOpen ? "pointer-events-auto" : "pointer-events-none"
      }`}
    >
      <div
        className={`absolute inset-0 bg-black transition-opacity duration-300 ${
          isOpen ? "opacity-20" : "opacity-0"
        }`}
        onClick={onClose}
      />
      <div
        className={`absolute right-0 top-0 h-full w-[500px] bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b px-6 py-3">
            <h2 className="text-lg font-semibold">Edit access to &quot;{formConfig.title}&quot;</h2>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex-1 overflow-auto p-6">
            <EditForm
              title={formConfig.title}
              description={formConfig.description}
              fields={formConfig.fields}
              values={entity}
              onSave={handleSave}
              onCancel={onClose}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

