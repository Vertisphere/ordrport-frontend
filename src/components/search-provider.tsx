import { getRoutes, type RouteInfo } from "@/utils/route-utils"

interface SearchProviderProps {
  children: (routes: RouteInfo[]) => React.ReactNode
}

export function SearchProvider({ children }: SearchProviderProps) {
  const routes = getRoutes()
  return children(routes)
}

