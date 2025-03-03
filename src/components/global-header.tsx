"use client"

import { useState, useCallback, forwardRef, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Search, Bell, HelpCircle, Settings, MoreVertical, History, Bot, Menu, ChevronDown } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { NavigationMenu } from "./navigation-menu"
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import { CommandItem as CommandItemOriginal } from "cmdk"
import type { RouteInfo } from '@/utils/route-utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import Link from 'next/link'

const CommandItem = forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<typeof CommandItemOriginal>>(
  ({ children, ...props }, forwardedRef) => (
    <CommandItemOriginal
      ref={forwardedRef}
      {...props}
      className="cursor-pointer aria-selected:bg-accent aria-selected:text-accent-foreground"
      onSelect={(value) => {
        props.onSelect?.(value)
      }}
    >
      {children}
    </CommandItemOriginal>
  )
)
CommandItem.displayName = 'CommandItem'

interface GlobalHeaderProps {
  routes?: RouteInfo[]
}

const siteTitle = 'Ordrport Dashboard';

const recentSearches = [
  { query: "orders", timestamp: new Date() },
  // { query: "cloud run", timestamp: new Date() },
  // { query: "load balancer", timestamp: new Date() },
]

// const aiFeatures = [
//   {
//     id: 'gemini',
//     title: 'Ask Gemini',
//     description: 'Chat with an AI companion to get comprehensive answers to any topic related to Google Cloud',
//     icon: Bot,
//     url: '/gemini',
//     type: 'ai' as const
//   }
// ]

export function GlobalHeader({ routes = [] }: GlobalHeaderProps) {
  const [open, setOpen] = useState(false)
  const [isNavOpen, setIsNavOpen] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(0)
  const router = useRouter()
  const pathname = usePathname()
  const [currentMode, setCurrentMode] = useState<'Franchisor' | 'Franchisee'>('Franchisor')

  useEffect(() => {
    if (pathname.startsWith('/franchisor')) {
      setCurrentMode('Franchisor')
    } else if (pathname.startsWith('/franchisee')) {
      setCurrentMode('Franchisee')
    }
  }, [pathname])

  const switchMode = (mode: 'Franchisor' | 'Franchisee') => {
    const newPath = mode === 'Franchisor' 
      ? pathname.replace('/franchisee', '/franchisor') 
      : pathname.replace('/franchisor', '/franchisee')
    router.push(newPath)
  }

  const serviceRoutes = routes.filter(route => route.type === 'service')
  const adminRoutes = routes.filter(route => route.type === 'admin')
  const allRoutes = [...serviceRoutes, ...adminRoutes]

  const runCommand = useCallback((url: string) => {
    setOpen(false)
    router.push(url)
  }, [router])

  return (
    <>
      <div className="flex items-center px-4 gap-2 sticky top-0 z-50 border-b bg-white h-14">
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-10 w-10"
          onClick={() => setIsNavOpen(true)}
        >
          <Menu className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-2">
          <Link 
            href={pathname.startsWith('/franchisor') ? '/franchisor/dashboard' : '/franchisee/dashboard'} 
            className="flex items-center gap-2"
          >
            <span className="text-2xl font-semibold text-blue-600">Ordrport</span>
          </Link>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="ml-2">
              {currentMode} <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => switchMode('Franchisor')}>
              Franchisor
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => switchMode('Franchisee')}>
              Franchisee
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <div className="flex-1 max-w-4xl mx-4">
          <div className="relative">
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full justify-start text-sm text-muted-foreground h-9"
              onClick={() => setOpen(true)}
            >
              <Search className="mr-2 h-4 w-4" />
              Search (/) for resources, docs, products, and more
            </Button>
            <CommandDialog open={open} onOpenChange={setOpen}>
              <CommandInput 
                placeholder="Type a command or search..." 
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && allRoutes.length > 0) {
                    e.preventDefault()
                    const selectedRoute = allRoutes[highlightedIndex]
                    runCommand(selectedRoute.url)
                  } else if (e.key === 'ArrowDown') {
                    setHighlightedIndex((prev) => (prev + 1) % allRoutes.length)
                  } else if (e.key === 'ArrowUp') {
                    setHighlightedIndex((prev) => (prev - 1 + allRoutes.length) % allRoutes.length)
                  }
                }}
              />
              <CommandList>
                <CommandEmpty>No results found.</CommandEmpty>
                <CommandGroup heading="RECENT SEARCHES">
                  {recentSearches.map((item, index) => (
                    <CommandItem
                      key={item.query}
                      onSelect={() => runCommand(`/search?q=${encodeURIComponent(item.query)}`)}
                    >
                      <History className="mr-2 h-4 w-4" />
                      {item.query}
                    </CommandItem>
                  ))}
                </CommandGroup>
                <CommandSeparator />
                {serviceRoutes.length > 0 && (
                  <CommandGroup heading="AVAILABLE SERVICES">
                    {serviceRoutes.map((route, index) => (
                      <CommandItem
                        key={route.id}
                        onSelect={() => runCommand(route.url)}
                      >
                        {/* <route.icon className="mr-2 h-4 w-4" /> */}
                        <div className="flex flex-col">
                          <span>{route.title}</span>
                          <span className="text-xs text-muted-foreground">{route.description}</span>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}
                <CommandSeparator />
                {/* <CommandGroup heading="GEMINI">
                  {aiFeatures.map((feature, index) => (
                    <CommandItem
                      key={feature.id}
                      onSelect={() => runCommand(feature.url)}
                    >
                      {/* <feature.icon className="mr-2 h-4 w-4" /> */}
                      {/* <div className="flex flex-col"> */}
                        {/* <span>{feature.title}</span> */}
                        {/* <span className="text-xs text-muted-foreground">{feature.description}</span> */}
                      {/* </div> */}
                    {/* </CommandItem> */}
                  {/* ))} */}
                {/* </CommandGroup> */}
                {adminRoutes.length > 0 && (
                  <>
                    <CommandSeparator />
                    <CommandGroup heading="BECAUSE YOU'RE AN ADMINISTRATOR">
                      {adminRoutes.map((route, index) => (
                        <CommandItem
                          key={route.id}
                          onSelect={() => runCommand(route.url)}
                        >
                          {/* <route.icon className="mr-2 h-4 w-4" /> */}
                          <div className="flex flex-col">
                            <span>{route.title}</span>
                            <span className="text-xs text-muted-foreground">{route.description}</span>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </>
                )}
              </CommandList>
            </CommandDialog>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9 bg-rose-600 text-white hover:bg-rose-700 hover:text-white ml-1">
                <span className="text-sm font-medium">O</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {/* <DropdownMenuItem onClick={() => router.push('/profile')}>
                Profile
              </DropdownMenuItem> */}
              {/* <DropdownMenuItem onClick={() => router.push('/settings')}>
                Settings
              </DropdownMenuItem> */}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => {
                // Add your logout logic here
                localStorage.removeItem('jwt');
                // refresh
                window.location.reload();
                // router.push('/auth/logout')
              }}>
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <NavigationMenu 
        isOpen={isNavOpen}
        onClose={() => setIsNavOpen(false)}
      />
    </>
  )
}

