import { LucideIcon } from 'lucide-react'
import Link from "next/link"

interface NavItem {
  icon: LucideIcon
  label: string
  href: string
  isActive?: boolean
}

interface SidebarProps {
  name: string
  userId: string
  navItems: NavItem[]
  adminItems?: NavItem[]  // Optional admin section items
}

export function Sidebar({ name, userId, navItems, adminItems }: SidebarProps) {
  return (
    <div className="w-64 bg-white border-r">
      <div className="p-4 bg-[#F4804F] text-white">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-white rounded-full" />
          <div>
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
            className={`flex items-center gap-3 px-3 py-2 text-sm rounded-md ${
              item.isActive 
                ? "bg-[#4B2E83] text-white" 
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <item.icon className="w-4 h-4" />
            {item.label}
          </Link>
        ))}

        {adminItems && adminItems.length > 0 && (
          <>
            <div className="pt-4 pb-2">
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
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            ))}
          </>
        )}
      </nav>
    </div>
  )
}