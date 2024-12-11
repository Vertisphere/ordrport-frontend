import Link from 'next/link'
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="space-x-4">
        <Link href="/dashboard">
          <Button size="lg">Franchisor Login</Button>
        </Link>
        <Link href="/portal">
          <Button size="lg" variant="outline">Franchisee Login</Button>
        </Link>
      </div>
    </div>
  )
}