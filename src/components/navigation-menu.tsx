"use client"

import * as React from "react"
import { X, ChevronRight, Grid, LayoutGrid, Settings, ShoppingCart, Terminal, Shield, Database, Box, ClipboardList, Receipt, Package, Users } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { useAuth } from "@/context/auth-context"
import { usePathname } from 'next/navigation'

interface MenuItem {
  icon: React.ElementType
  title: string
  href?: string
  isPinned?: boolean
  submenu?: MenuItem[]
}

const getBaseItems = (pathname: string): MenuItem[] => {
  const isFranchisorPath = pathname.startsWith('/franchisor')
  const isFranchiseePath = pathname.startsWith('/franchisee')
  const baseUrl = isFranchisorPath ? '/franchisor' : isFranchiseePath ? '/franchisee' : ''
  
  return [
    {
      icon: ClipboardList,
      title: "Orders",
      href: `${baseUrl}/orders`,
      ...(isFranchisorPath && {
        submenu: [
          { 
            icon: ClipboardList, 
            title: "All Orders", 
            href: `${baseUrl}/orders` 
          },
          { 
            icon: Box, 
            title: "Pending Review", 
            href: `${baseUrl}/orders/pending-review` 
          },
          { 
            icon: Package, 
            title: "Orders In Preparation", 
            href: `${baseUrl}/orders/in-preparation` 
          }
        ]
      })
    },
    {
      icon: Receipt,
      title: "Invoices",
      href: `${baseUrl}/invoices`
    }
  ]
}

const getFranchisorItems = (pathname: string): MenuItem[] => {
  const isFranchisorPath = pathname.startsWith('/franchisor')
  const baseUrl = isFranchisorPath ? '/franchisor' : ''
  
  return [
    {
      icon: Package,
      title: "Items",
      href: `${baseUrl}/items`,
      isPinned: true
    },
    {
      icon: Users,
      title: "Franchisees",
      href: `${baseUrl}/franchisees`,
      isPinned: true
    }
  ]
}

const pinnedProducts: MenuItem[] = [
  {
    icon: Terminal,
    title: "APIs & Services",
    href: "/apis",
    isPinned: true,
    submenu: [
      { icon: Box, title: "Enabled APIs & services", href: "/apis/enabled" },
      { icon: Database, title: "Library", href: "/apis/library" },
      { icon: Settings, title: "Credentials", href: "/apis/credentials" }
    ]
  },
  {
    icon: ShoppingCart,
    title: "Billing",
    href: "/billing",
    isPinned: true
  }
]

interface NavigationMenuProps {
  isOpen: boolean
  onClose: () => void
}

interface MenuItemPosition {
  top: number
  height: number
}

export function NavigationMenu({ isOpen, onClose }: NavigationMenuProps) {
  const { user } = useAuth()
  const pathname = usePathname()
  const [mounted, setMounted] = React.useState(false)
  const [activeSubmenu, setActiveSubmenu] = React.useState<string | null>(null)
  const [menuItemPositions, setMenuItemPositions] = React.useState<Record<string, MenuItemPosition>>({})
  const menuRefs = React.useRef<Record<string, HTMLDivElement | null>>({})
  const hoverTimeoutRef = React.useRef<NodeJS.Timeout>()
  const submenuRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  // Use ResizeObserver to update positions when the menu items change size
  React.useEffect(() => {
    const observer = new ResizeObserver(() => {
      updateMenuItemPositions()
    })

    Object.values(menuRefs.current).forEach(ref => {
      if (ref) {
        observer.observe(ref)
      }
    })

    return () => {
      observer.disconnect()
    }
  }, [])

  // Update positions when the menu opens
  React.useEffect(() => {
    if (isOpen) {
      updateMenuItemPositions()
    }
  }, [isOpen])

  const updateMenuItemPositions = () => {
    const positions: Record<string, MenuItemPosition> = {}
    Object.entries(menuRefs.current).forEach(([title, ref]) => {
      if (ref) {
        const rect = ref.getBoundingClientRect()
        positions[title] = {
          top: rect.top,
          height: rect.height
        }
      }
    })
    setMenuItemPositions(positions)
  }

  const handleMouseEnter = (title: string) => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current)
    }
    hoverTimeoutRef.current = setTimeout(() => {
      setActiveSubmenu(title)
      updateMenuItemPositions() // Update positions when submenu opens
    }, 100)
  }

  const handleMouseLeave = (e: React.MouseEvent) => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current)
    }

    // Check if we're moving between menu item and submenu
    if (submenuRef.current) {
      const submenuRect = submenuRef.current.getBoundingClientRect()
      const isMovingToSubmenu = e.clientX >= submenuRect.left && 
                               e.clientX <= submenuRect.right && 
                               e.clientY >= submenuRect.top && 
                               e.clientY <= submenuRect.bottom

      if (isMovingToSubmenu) {
        return
      }
    }

    hoverTimeoutRef.current = setTimeout(() => {
      setActiveSubmenu(null)
    }, 100)
  }

  if (!mounted) return null

  const renderMenuItem = (item: MenuItem) => {
    const position = menuItemPositions[item.title]
    
    return (
      <div
        key={item.title}
        ref={el => menuRefs.current[item.title] = el}
        className="relative"
        onMouseEnter={() => handleMouseEnter(item.title)}
        onMouseLeave={handleMouseLeave}
        role={item.submenu ? "button" : undefined}
        tabIndex={item.submenu ? 0 : undefined}
        aria-expanded={item.submenu ? activeSubmenu === item.title : undefined}
        aria-haspopup={item.submenu ? "true" : undefined}
      >
        <Link
          href={item.href || "#"}
          className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md group"
          onClick={item.submenu ? (e) => e.preventDefault() : undefined}
        >
          <item.icon className="h-5 w-5" />
          <span>{item.title}</span>
          {item.submenu && (
            <ChevronRight className="ml-auto h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          )}
        </Link>
        {item.submenu && activeSubmenu === item.title && position && (
          <div 
            ref={submenuRef}
            className="fixed left-[280px] w-64 overflow-hidden rounded-r-md border bg-white shadow-lg"
            style={{
              top: `${position.top}px`,
              minHeight: `${position.height}px`
            }}
            onMouseEnter={() => handleMouseEnter(item.title)}
            onMouseLeave={handleMouseLeave}
            role="menu"
          >
            <div className="p-2">
              {item.submenu.map((subitem) => (
                <Link
                  key={subitem.title}
                  href={subitem.href || "#"}
                  className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={onClose}
                  role="menuitem"
                >
                  <subitem.icon className="h-5 w-5" />
                  <span>{subitem.title}</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div
      className={cn(
        "fixed inset-0 z-[150] transition-all duration-300",
        isOpen ? "pointer-events-auto" : "pointer-events-none"
      )}
    >
      <div
        className={cn(
          "absolute inset-0 bg-black/20 transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0"
        )}
        onClick={onClose}
      />
      <div
        className={cn(
          "absolute left-0 top-0 h-full w-[280px] bg-white shadow-lg transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <Link href="./dashboard" className="flex items-center gap-2">
              <span className="text-2xl font-semibold text-blue-600">Ordrport</span>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex-1 overflow-auto">
            <nav className="p-2">
              {getBaseItems(pathname).map((item) => renderMenuItem(item))}
              {user?.isFranchisor && (
                <div className="mt-6 mb-2">
                  <div className="px-3 py-2 text-xs font-medium text-gray-500">
                    FRANCHISOR PAGES
                  </div>
                  {getFranchisorItems(pathname).map((item) => renderMenuItem(item))}
                </div>
              )}
            </nav>
          </div>
        </div>
      </div>
    </div>
  )
}

