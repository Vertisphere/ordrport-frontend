// src/components/ui/sidebar.tsx

import { ChevronLeft, ChevronRight, LucideIcon } from 'lucide-react'
import Link from 'next/link'

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
  collapsed?: boolean
  onToggle?: () => void
}

export function Sidebar({ name, userId, navItems, adminItems, collapsed = true, onToggle = () => {} }: SidebarProps) {
  return (
    <div 
      className={`${collapsed ? 'w-16 hover:w-64' : 'w-64'} 
        bg-white border-r transition-all duration-300 group fixed h-full`}
    >
      <div className={`p-4 bg-[#F4804F] text-white`}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-white rounded-full flex-shrink-0" />
          <div className={`flex-1 ${collapsed ? 'opacity-0 group-hover:opacity-100' : ''} transition-opacity duration-300`}>
            <div className="font-medium">{name}</div>
            <div className="text-sm opacity-75">{userId}</div>
          </div>
          <button onClick={onToggle} className="p-2 hover:bg-[#e67341] rounded-full flex-shrink-0">
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>
      </div>
      <nav className="p-2 space-y-1">
        {navItems.map((item, index) => (
          <Link
            key={index}
            href={item.href}
            className={`flex items-center gap-3 px-3 py-2 text-sm rounded-md ${
              item.isActive 
                ? "bg-[#4B2E83] text-white" 
                : "text-gray-700 hover:bg-gray-100"
            }`}
            title={collapsed ? item.label : undefined}
          >
            <item.icon className="w-4 h-4 flex-shrink-0" />
            <span className={`${collapsed ? 'opacity-0 group-hover:opacity-100' : ''} transition-opacity duration-300 whitespace-nowrap`}>
              {item.label}
            </span>
          </Link>
        ))}

        {adminItems && adminItems.length > 0 && (
          <>
            <div className={`pt-4 pb-2 ${collapsed ? 'opacity-0 group-hover:opacity-100' : ''} transition-opacity duration-300`}>
              <div className="px-3 text-xs font-medium text-gray-500">Administration</div>
            </div>
            {adminItems.map((item, index) => (
              <Link
                key={`admin-${index}`}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 text-sm rounded-md ${
                  item.isActive 
                    ? "bg-[#4B2E83] text-white" 
                    : "text-gray-700 hover:bg-gray-100"
                }`}
                title={collapsed ? item.label : undefined}
              >
                <item.icon className="w-4 h-4 flex-shrink-0" />
                <span className={`${collapsed ? 'opacity-0 group-hover:opacity-100' : ''} transition-opacity duration-300 whitespace-nowrap`}>
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