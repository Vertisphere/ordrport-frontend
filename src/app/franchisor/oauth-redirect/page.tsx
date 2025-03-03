// src/app/franchisor/oauth-redirect/page.tsx
'use client'

import { Suspense } from 'react'
import { useEffect, useState, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

function OAuthRedirectContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState<string | null>(null)
  const isAuthenticating = useRef(false)

  useEffect(() => {
    const handleOAuthRedirect = async () => {
      // Only run in browser environment and prevent duplicate calls
      if (typeof window === 'undefined' || isAuthenticating.current) return
      isAuthenticating.current = true

      const code = searchParams.get('code')
      const realmId = searchParams.get('realmId')
    //   const state = searchParams.get('state')
     // Verify state matches what we sent (prevent CSRF)

      if (!code || !realmId) {
        setError('Missing required OAuth parameters')
        return
      }

      try {
        // Exchange code for JWT with your backend
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/franchiser/qbLogin`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            auth_code: code,
            realm_id: realmId,
            use_cached_bearer: false,
          }),
        })

        if (!response.ok) {
          const errorData = await response.status
          throw new Error(`Failed to authenticate: ${errorData || 'Unknown error'}`)
        }

        const data = await response.json()
        
        // Store the JWT
        localStorage.setItem('jwt', data.token)

        // Redirect back to dashboard
        window.location.href = '/franchisor/dashboard'
        
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Authentication failed')
      }
    }

    handleOAuthRedirect()
  }, [searchParams, router])

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Authentication Error</h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Completing Authentication</h1>
        <p className="text-gray-600">Please wait while we complete your login...</p>
      </div>
    </div>
  )
}

export default function OAuthRedirect() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Loading</h1>
          <p className="text-gray-600">Please wait...</p>
        </div>
      </div>
    }>
      <OAuthRedirectContent />
    </Suspense>
  )
}