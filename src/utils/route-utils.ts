// import { LayoutGrid, Globe, Server } from 'lucide-react'

export interface RouteInfo {
  id: string
  title: string
  description: string
  // icon: React.ComponentType
  url: string
  type: 'service' | 'admin' | 'ai'
}


const ROUTE_METADATA: Record<string, Partial<RouteInfo>> = {
  // 'compute-engine': {
  //   title: 'Compute Engine',
  //   description: 'VMs, GPUs, TPUs, disks',
  //   // icon: LayoutGrid,
  //   type: 'service'
  // },
  // 'load-balancers': {
  //   title: 'Load Balancing',
  //   description: 'Network Services',
  //   // icon: Globe,
  //   type: 'service'
  // }
  'dashboard': {
    title: 'Dashboard',
    description: 'Overview',
    type: 'service'
  },
  'orders': {
    title: 'Orders',
    description: 'View and manage orders',
    type: 'service'
  },
  'invoices': {
    title: 'Invoices',
    description: 'View and manage invoices',
    type: 'service'
  },
  'franchisees': {
    title: 'Franchisees',
    description: 'View and manage franchisees',
    type: 'admin'
  }
}

const getRoutes = (): RouteInfo[] => {
  return Object.entries(ROUTE_METADATA).map(([routeId, metadata]) => ({
    id: routeId,
    url: `${routeId}`,
    ...metadata,
  })) as RouteInfo[]
}

export { getRoutes }