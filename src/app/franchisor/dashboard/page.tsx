"use client"

import { PageHeader } from "@/components/page-header"
import { PageSidebar } from "@/components/page-sidebar"

const sidebarItems = [
  { title: "Dashboard", href: "/franchisor/dashboard", isActive: true },
  { title: "Compute Engine", href: "/franchisor/compute-engine" },
  { title: "Load Balancing", href: "/franchisor/load-balancers" },
  { title: "Kubernetes Engine", href: "/franchisor/kubernetes-engine" },
  { title: "Cloud Storage", href: "/franchisor/cloud-storage" },
]

export default function FranchisorDashboardPage() {
  return (
    <>
      <PageHeader title="Franchisor Dashboard" subtitle="Overview" />
      <div className="flex flex-1 overflow-hidden">
        <PageSidebar items={sidebarItems} />
        <main className="flex-1 overflow-auto p-4">
          <h2 className="text-lg font-semibold mb-4">Welcome to Ordrport Franchisor Dashboard</h2>
          <p>Select a service from the sidebar or use the global search to navigate.</p>
        </main>
      </div>
    </>
  )
}

