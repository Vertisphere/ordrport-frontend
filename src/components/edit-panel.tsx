"use client"

import { useEffect, useState } from "react"
import { X } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { LoadBalancer } from "@/types/entities"
import { EditForm } from "./edit-form"

interface EditPanelProps {
  isOpen: boolean
  onClose: () => void
  loadBalancer: LoadBalancer | null
}

export function EditPanel({ isOpen, onClose, loadBalancer }: EditPanelProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  if (!mounted || !loadBalancer) return null

  const fields = [
    {
      key: "name",
      label: "Name",
      type: "text" as const,
      description: "The name of the load balancer",
      required: true
    },
    {
      key: "type",
      label: "Load balancer type",
      type: "select" as const,
      options: ['HTTP(S)', 'TCP', 'UDP', 'SSL Proxy', 'TCP Proxy'],
      description: "The type of load balancer",
      required: true
    },
    {
      key: "accessType",
      label: "Access type",
      type: "select" as const,
      options: ['External', 'Internal'],
      description: "Whether the load balancer is externally or internally accessible",
      required: true
    },
    {
      key: "protocols",
      label: "Protocols",
      type: "select" as const,
      options: ['HTTP', 'HTTPS', 'TCP', 'UDP', 'SSL'],
      description: "The protocols supported by this load balancer",
      required: true
    },
    {
      key: "region",
      label: "Region",
      type: "select" as const,
      options: ['us-central1', 'us-east1', 'us-west1', 'europe-west1', 'asia-east1'],
      description: "The region where the load balancer is deployed",
      required: true
    }
  ]

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
            <h2 className="text-lg font-semibold">Edit access to "{loadBalancer.name}"</h2>
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
              title="Load Balancer"
              description="Configure the load balancer settings"
              fields={fields}
              values={loadBalancer}
              onSave={handleSave}
              onCancel={onClose}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

