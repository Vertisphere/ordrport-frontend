import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '../globals.css'
import { GlobalHeader } from '@/components/global-header'
import { SearchProvider } from '@/components/search-provider'
import { AuthProvider } from '@/context/auth-context'
import { AuthModalWrapper } from "@/components/auth-modal-wrapper"

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Ordrport Dashboard',
  description: 'A compact and data-dense cloud resource management interface',
}

export default function FranchisorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="h-full overflow-hidden flex flex-col">
      <SearchProvider>
        {(routes) => <GlobalHeader routes={routes} />}
      </SearchProvider>
      <AuthProvider>
        {children}
        <AuthModalWrapper />
      </AuthProvider>
    </div>
  )
}

