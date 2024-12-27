import Link from "next/link"
import { Button } from "@/components/ui/button"
import { TypeIcon as type, type LucideIcon } from 'lucide-react'
import { GitBranch, ActivityIcon as Function, Globe } from 'lucide-react'

interface SecondaryAction {
  icon: LucideIcon
  title: string
  href: string
}

interface PageHeaderProps {
  title?: string
  subtitle?: string
  primaryAction?: {
    title: string
    onClick?: () => void
  }
  secondaryActions?: SecondaryAction[]
}

export function PageHeader({ title = 'Dashboard', subtitle = 'Overview', primaryAction, secondaryActions = [] }: PageHeaderProps) {
  const displayTitle = title || 'Dashboard'
  const displaySubtitle = subtitle || 'Overview'

  return (
    <div className="border-b">
      <div className="flex items-center px-4 h-16 gap-4">
  <div className="flex items-center gap-2">
    <svg viewBox="0 0 24 24" className="h-8 w-8">
      <path
        fill="#4285F4"
        d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z"
      />
    </svg>
    <div>
      <h1 className="text-xl font-normal">{displayTitle}</h1>
      <div className="text-sm text-gray-500">{displaySubtitle}</div>
    </div>
  </div>
  <div className="flex-1 flex items-center gap-2">
    {primaryAction && (
      <Button 
        variant="default" 
        onClick={primaryAction.onClick}
        className="bg-blue-600 hover:bg-blue-700 text-xs font-medium"
      >
        {primaryAction.title}
      </Button>
    )}
    {secondaryActions.map((action, index) => {
      const Icon = action.icon
      return (
        <Button 
          key={index}
          variant="ghost" 
          className="text-blue-600 hover:bg-blue-50 text-xs font-medium"
          asChild
        >
          <Link href={action.href}>
            <Icon className="mr-0.5 h-4 w-4" />
            {action.title}
          </Link>
        </Button>
      )
    })}
  </div>
</div>
      <div className="px-4">
        <nav className="flex gap-8">
          <Link 
            href="#" 
            className="px-1 py-2 text-xs font-medium text-blue-600 border-b-2 border-blue-600"
          >
            {displaySubtitle.toUpperCase()}
          </Link>
        </nav>
      </div>
    </div>
  )
}

