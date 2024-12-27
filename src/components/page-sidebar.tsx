"use client"

import * as React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface SidebarItem {
  title: string
  href: string
  isActive?: boolean
}

interface PageSidebarProps {
  items: SidebarItem[]
}

export function PageSidebar({ items }: PageSidebarProps) {
  const pathname = usePathname()

  if (items.length === 0) {
    return null
  }

  return (
    <div className="relative w-[200px] border-r">
      <div className="h-full overflow-hidden w-[200px]">
        <div className="p-4">
          <nav className="space-y-1">
            {items.map((item, index) => (
              <Link
                key={index}
                href={item.href}
                className={`block px-3 py-2 text-sm rounded-md transition-colors ${
                  pathname === item.href
                    ? 'bg-gray-100 text-gray-900 font-medium'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                {item.title}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </div>
  )
}

