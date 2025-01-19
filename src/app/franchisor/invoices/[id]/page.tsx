"use client"

import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { PageHeader } from "@/components/page-header"

export default function InvoicePDFPage() {
  const params = useParams()
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchPDF = async () => {
      try {
        const jwt = localStorage.getItem('jwt')
        const response = await fetch(`https://api.ordrport.com/qbInvoicePDF/${params.id}`, {
          headers: {
            Authorization: `Bearer ${jwt}`,
          },
        })

        if (!response.ok) throw new Error('Failed to fetch PDF')

        const blob = await response.blob()
        const url = URL.createObjectURL(blob)
        setPdfUrl(url)
      } catch (error) {
        console.error('Error fetching PDF:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPDF()

    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl)
      }
    }
  }, [params.id, pdfUrl])

  return (
    <>
      <PageHeader title={`Invoice #${params.id}`} subtitle="View invoice PDF" />
      <div className="flex-1 p-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
          </div>
        ) : pdfUrl ? (
          <iframe
            src={pdfUrl}
            className="w-full h-[calc(100vh-120px)]"
            title="Invoice PDF"
          />
        ) : (
          <div className="text-center text-gray-500">
            Failed to load PDF
          </div>
        )}
      </div>
    </>
  )
} 