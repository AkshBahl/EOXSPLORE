"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import {
  type User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  createUserWithEmailAndPassword,
} from "firebase/auth"
import { auth } from "@/firebase"
import { getUserData } from "../firestore-utils"

interface UserData {
  userId: string
  email: string
  name?: string
  companyName?: string
  phoneCountryCode?: string
  phoneNumber?: string
  createdAt?: { seconds: number; nanoseconds: number }
  isSuspended: boolean
  daysUntilSuspension: number
  manuallySuspended?: boolean
  suspendedAt?: { seconds: number; nanoseconds: number }
  suspensionReason?: string
  role?: string
}

interface AuthContextType {
  user: User | null
  userData: UserData | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  refreshUserData: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log("🔥 AuthContext - Auth state changed:", user ? `User: ${user.uid}` : "No user")
      setUser(user)
      if (user) {
        try {
          console.log("🔥 AuthContext - Fetching user data for:", user.uid)
          const data = await getUserData(user.uid)
          console.log("🔥 AuthContext - User data fetched:", data)
          setUserData(data as UserData)
        } catch (error) {
          console.error("AuthContext - Error fetching user data:", error)
          setUserData(null)
        }
      } else {
        console.log("🔥 AuthContext - No user, clearing user data")
        setUserData(null)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const login = async (email: string, password: string) => {
    console.log("🔥 AuthContext - Login attempt for:", email)
    await signInWithEmailAndPassword(auth, email, password)
  }

  const signup = async (email: string, password: string) => {
    console.log("🔥 AuthContext - Signup attempt for:", email)
    await createUserWithEmailAndPassword(auth, email, password)
  }

  const logout = async () => {
    console.log("🔥 AuthContext - Logout attempt")
    await signOut(auth)
    setUserData(null)
  }

  const refreshUserData = async () => {
    if (user) {
      try {
        console.log("🔥 AuthContext - Refreshing user data for:", user.uid)
        const data = await getUserData(user.uid)
        console.log("🔥 AuthContext - User data refreshed:", data)
        setUserData(data as UserData)
      } catch (error) {
        console.error("Error refreshing user data:", error)
      }
    }
  }

  const value = {
    user,
    userData,
    loading,
    login,
    signup,
    logout,
    refreshUserData,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

