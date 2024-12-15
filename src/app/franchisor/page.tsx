// src/app/franchisor/page.tsx
'use client'

import { useAuth } from '@/context/auth-context'
import { Bell, ChevronDown, Globe, Menu, Users, Box, FileText, ShoppingCart, User, Settings } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sidebar } from "@/components/ui/sidebar"
import { DashboardView } from "@/components/franchisor/views/dashboard-view"
import { FranchiseesView } from "@/components/franchisor/views/franchisees-view"
import { ItemsView } from "@/components/franchisor/views/items-view"
import { InvoicesView } from "@/components/franchisor/views/invoices-view"
import { OrdersView } from "@/components/franchisor/views/orders-view"
import { ProfileView } from "@/components/franchisor/views/profile-view"
import { AuthModal } from "@/components/franchisor/auth/auth-modal"
import { UnauthorizedModal } from "@/components/franchisor/auth/unauthorized-modal"
import { ExpiredModal } from "@/components/franchisor/auth/expired-modal"
import { useState } from 'react'

export default function Franchisor() {
  const { user, isLoading, showAuthModal } = useAuth()
  const searchParams = useSearchParams()
  const currentView = searchParams.get('view') || 'franchisees'

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">
      Loading...
    </div>
  }

  const renderView = () => {
    switch (currentView) {
      case 'franchisees':
        return <FranchiseesView />
      case 'items':
        return <ItemsView />
      case 'invoices':
        return <InvoicesView />
      case 'orders':
        return <OrdersView />
      case 'profile':
        return <ProfileView />
      default:
        return <DashboardView />
    }
  }

  const renderAuthModal = () => {
    if (!user && showAuthModal) {
      return <AuthModal />
    }
    
    if (user && !user.isFranchisor) {
      return <UnauthorizedModal />
    }

    if (showAuthModal) {  // If showAuthModal is true but we have a user, it means token expired
      return <ExpiredModal />
    }

    return null
  }

  return (
    <div className={`min-h-screen flex flex-col ${showAuthModal ? 'blur-sm' : ''}`}>
      <header className="bg-[#4B2E83] text-white p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold">Franchise Management System</h1>
          <span className="text-xs opacity-50">v1.0.0</span>
        </div>
        <div className="flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="text-white">
                <Globe className="w-4 h-4 mr-2" />
                EN
                <ChevronDown className="w-4 h-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>English</DropdownMenuItem>
              <DropdownMenuItem>Spanish</DropdownMenuItem>
              <DropdownMenuItem>French</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="text-white">
                  Main Office
                  <ChevronDown className="w-4 h-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>Main Office</DropdownMenuItem>
                <DropdownMenuItem>Regional Office</DropdownMenuItem>
                <DropdownMenuItem>Branch Office</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </header>
      <div className="flex flex-1">
        {user && user.isFranchisor && (
          <Sidebar 
            name={user.name}
            userId={user.userId}
            navItems={[
              { icon: Users, label: "Franchisees", href: "?view=franchisees", isActive: currentView === 'franchisees' },
              { icon: Box, label: "Items", href: "?view=items", isActive: currentView === 'items' },
              { icon: FileText, label: "Invoices", href: "?view=invoices", isActive: currentView === 'invoices' },
              { icon: ShoppingCart, label: "Orders", href: "?view=orders", isActive: currentView === 'orders' },
            ]}
            adminItems={[
              { icon: User, label: "Profile", href: "?view=profile", isActive: currentView === 'profile' },
              { icon: Settings, label: "Settings", href: "?view=settings", isActive: currentView === 'settings' },
            ]}
          />
        )}
        <main className="flex-1 overflow-auto pl-16" style={{ height: 'calc(100vh - 64px)' }}>
          {user && user.isFranchisor && renderView()}
        </main>
      </div>
      {renderAuthModal()}
    </div>
  )
}