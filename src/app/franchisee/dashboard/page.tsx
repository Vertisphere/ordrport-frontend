"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Receipt, AlertTriangle, ArrowRight, FileEdit, Clock } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/context/auth-context"
import { jwtDecode } from "jwt-decode"
import { motion } from "framer-motion"

export default function FranchiseeDashboard() {
  const [unpaidInvoices, setUnpaidInvoices] = useState(0)
  const [draftOrders, setDraftOrders] = useState(0)
  const [pendingOrders, setPendingOrders] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [companyId, setCompanyId] = useState("")
  const [customerId, setCustomerId] = useState("")
  const [jwt, setJwt] = useState<string | null>(null)

  useEffect(() => {
    // Initialize jwt state after component mounts
    if (typeof window !== 'undefined') {
      setJwt(localStorage.getItem('jwt'))
    }
  }, [])

  useEffect(() => {
    if (!jwt) return

    const decoded = jwtDecode(jwt) as any
    setCompanyId(decoded.qb_company_id || "")
    setCustomerId(decoded.qb_customer_id || "")

    const fetchData = async () => {
      try {
        const headers = { Authorization: `Bearer ${jwt}` }
        const [unpaidRes, draftsRes, pendingRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/qbInvoices?statuses=C`, { headers }),
          fetch(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/qbInvoices?statuses=D`, { headers }),
          fetch(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/qbInvoices?statuses=P`, { headers })
        ])

        const [unpaidData, draftsData, pendingData] = await Promise.all([
          unpaidRes.json(),
          draftsRes.json(),
          pendingRes.json()
        ])

        setUnpaidInvoices(unpaidData.total_count)
        setDraftOrders(draftsData.total_count)
        setPendingOrders(pendingData.total_count)
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [jwt])

  const StatusCard = ({ href, icon: Icon, title, count, color, textColor }: { href: string, icon: React.ElementType, title: string, count: number, color: string, textColor: string }) => (
    <Link href={href}>
      <Card className={`${color} shadow-lg hover:shadow-xl transition-all cursor-pointer group w-72`}>
        <CardContent className="p-4">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <Icon className={`h-4 w-4 ${textColor}`} />
                {title}
              </h3>
              <ArrowRight className={`h-4 w-4 ${textColor} transform group-hover:translate-x-1 transition-transform`} />
            </div>
            <p className={`${textColor} text-sm font-medium`}>
              {count} {count === 1 ? title.slice(0, -1) : title.toLowerCase()}
            </p>
          </div>
        </CardContent>
      </Card>
    </Link>
  )

  if (!jwt) {
    return null
  }

  return (
    <>
      <main className="flex-1 overflow-auto p-6">
        <div className="max-w-6xl mx-auto">
          {/* Welcome Section with Animated Text */}
          <div className="text-center mb-8 pt-12">
            <div className="flex items-center justify-center space-x-2">
              <h1 className="text-4xl font-bold">
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  Welcome to
                </motion.span>
              </h1>
              <div className="text-4xl font-bold overflow-hidden">
                {["O", "r", "d", "r", "p", "o", "r", "t"].map((letter, i) => (
                  <motion.span
                    key={i}
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{
                      duration: 0.5,
                      delay: i * 0.1,
                      type: "spring",
                      stiffness: 120
                    }}
                    className="text-blue-600"
                    style={{ display: "inline-block" }}
                  >
                    {letter}
                  </motion.span>
                ))}
              </div>
              <h1 className="text-4xl font-bold">
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1, duration: 0.5 }}
                >
                  (franchisee)
                </motion.span>
              </h1>
            </div>
            {customerId && companyId && (
              <motion.p 
                className="text-gray-600 mt-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5 }}
              >
                Customer #{customerId}, working in Company #{companyId}
              </motion.p>
            )}
          </div>

          {/* Status Cards with Delayed Fade In */}
          {!isLoading && (
            <motion.div 
              className="flex flex-wrap justify-center gap-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.5, duration: 0.5 }}
            >
              <div className="transform hover:-translate-y-1 transition-transform">
                <StatusCard
                  href="/franchisee/invoices"
                  icon={AlertTriangle}
                  title="Unpaid Invoices"
                  count={unpaidInvoices}
                  color="bg-blue-50 border-blue-100"
                  textColor="text-blue-600"
                />
              </div>
              <div className="transform hover:-translate-y-1 transition-transform md:mt-8">
                <StatusCard
                  href="/franchisee/orders"
                  icon={FileEdit}
                  title="Draft Orders"
                  count={draftOrders}
                  color="bg-gray-50 border-gray-100"
                  textColor="text-gray-600"
                />
              </div>
              <div className="transform hover:-translate-y-1 transition-transform">
                <StatusCard
                  href="/franchisee/orders"
                  icon={Clock}
                  title="Pending Orders"
                  count={pendingOrders}
                  color="bg-yellow-50 border-yellow-100"
                  textColor="text-yellow-600"
                />
              </div>
            </motion.div>
          )}

          {/* Quick Access Cards */}
          <motion.div 
            className="grid md:grid-cols-2 gap-6 mt-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2, duration: 0.5 }}
          >
            <Link href="/franchisee/orders">
              <Card className="hover:bg-gray-50 transition-colors cursor-pointer">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <FileText className="h-5 w-5 text-blue-600" />
                      <span>Orders</span>
                    </div>
                    <ArrowRight className="h-5 w-5 text-gray-400" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-500">
                    Create and manage your orders
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/franchisee/invoices">
              <Card className="hover:bg-gray-50 transition-colors cursor-pointer">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Receipt className="h-5 w-5 text-blue-600" />
                      <span>Invoices</span>
                    </div>
                    <ArrowRight className="h-5 w-5 text-gray-400" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-500">
                    View and manage your invoices
                  </p>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        </div>
      </main>
    </>
  )
} 