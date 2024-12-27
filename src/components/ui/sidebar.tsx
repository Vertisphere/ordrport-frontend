// src/components/ui/sidebar.tsx

import { ChevronLeft, ChevronRight, LucideIcon } from 'lucide-react'
import Link from 'next/link'
import { useEffect } from 'react'

interface NavItem {
  href: string
  label: string
  icon: LucideIcon
  isActive: boolean
}

interface SidebarProps {
  name: string
  userId: string
  navItems: NavItem[]
  adminItems?: NavItem[]
  collapsed: boolean
  onToggle: () => void
}

export function Sidebar({ name, userId, navItems, adminItems, collapsed, onToggle }: SidebarProps) {
  return (
    <div 
      className={`${collapsed ? 'w-16' : 'w-64'} bg-white border-r transition-all duration-300 h-full`}
      onMouseEnter={() => collapsed && onToggle()}
      onMouseLeave={() => !collapsed && onToggle()}
    >
      <div className="p-4 bg-[#F4804F] text-white">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-white rounded-full flex-shrink-0" />
          <div className={`ml-3 flex-1 ${collapsed ? 'hidden' : ''}`}>
            <div className="font-medium">{name}</div>
            <div className="text-sm opacity-75">{userId}</div>
          </div>
        </div>
      </div>
      <nav className="p-2 space-y-1">
        {navItems.map((item, index) => (
          <Link
            key={index}
            href={item.href}
            className={`flex items-center h-9 px-3 text-sm rounded-md ${
              item.isActive 
                ? "bg-[#4B2E83] text-white" 
                : "text-gray-700 hover:bg-gray-100"
            }`}
            title={collapsed ? item.label : undefined}
          >
            <div className="w-4 flex items-center justify-center">
              <item.icon className="w-4 h-4 flex-shrink-0" />
            </div>
            <span className={`ml-3 ${collapsed ? 'hidden' : ''}`}>
              {item.label}
            </span>
          </Link>
        ))}

        {adminItems && adminItems.length > 0 && (
          <>
            <div className={`h-9 flex items-center ${collapsed ? 'hidden' : ''}`}>
              <div className="px-3 text-xs font-medium text-gray-500">Administration</div>
            </div>
            {adminItems.map((item, index) => (
              <Link
                key={`admin-${index}`}
                href={item.href}
                className={`flex items-center h-9 px-3 text-sm rounded-md ${
                  item.isActive 
                    ? "bg-[#4B2E83] text-white" 
                    : "text-gray-700 hover:bg-gray-100"
                }`}
                title={collapsed ? item.label : undefined}
              >
                <div className="w-4 flex items-center justify-center">
                  <item.icon className="w-4 h-4 flex-shrink-0" />
                </div>
                <span className={`ml-3 ${collapsed ? 'hidden' : ''}`}>
                  {item.label}
                </span>
              </Link>
            ))}
          </>
        )}
      </nav>
    </div>
  )
}