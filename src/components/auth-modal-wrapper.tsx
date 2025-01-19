'use client'

import { useAuth } from "@/context/auth-context"
import { useState, useEffect } from "react"
import { AuthModal as FranchisorAuthModal } from "./franchisor/auth/auth-modal"
import { AuthModal as FranchiseeAuthModal } from "./franchisee/auth/auth-modal"

export function AuthModalWrapper() {
  const { user } = useAuth()
  const [isFranchisorPath, setIsFranchisorPath] = useState(false)

  useEffect(() => {
    setIsFranchisorPath(window.location.pathname.startsWith('/franchisor'))
  }, [])

  return isFranchisorPath ? <FranchisorAuthModal /> : <FranchiseeAuthModal />
} 