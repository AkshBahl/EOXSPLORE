"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { authHelpers } from "@/app/firebase-helpers"
import { collection, getDocs, query, where } from "firebase/firestore"
import { db } from "@/firebase"
import { useAuth } from "@/app/context/AuthContext"
import { ThemeToggle } from "../theme-toggle"
import { Logo } from "../components/logo"

export default function AdminLogin() {
  const router = useRouter()
  const { user, userData } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  // Check if user is already authenticated and has admin privileges
  useEffect(() => {
    if (user && userData?.role === "admin") {
      console.log("✅ User already authenticated as admin, redirecting to dashboard")
      router.push("/admin-dashboard")
    }
  }, [user, userData, router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Basic validation
    if (!email || !password) {
      setError("Email and password are required")
      return
    }

    setLoading(true)

    try {
      console.log("🔧 Attempting admin login for:", email)
      
      // First authenticate with Firebase
      const userCredential = await authHelpers.signIn(email, password)
      console.log("✅ Firebase auth successful, user ID:", userCredential.user.uid)

      // Then check if the user is an admin
      const userQuery = query(collection(db, "users"), where("userId", "==", userCredential.user.uid), where("role", "==", "admin"))
      console.log("🔍 Checking admin privileges...")

      const userSnapshot = await getDocs(userQuery)
      console.log("📊 Admin query result:", userSnapshot.empty ? "No admin found" : "Admin found")

      if (userSnapshot.empty) {
        // Not an admin
        console.log("❌ User does not have admin privileges")
        setError("You don't have admin privileges")
        setLoading(false)
        return
      }

      // Admin login successful
      console.log("✅ Admin login successful!")
      setLoading(false)
      
      // Wait a moment for AuthContext to update, then redirect
      setTimeout(() => {
        router.push("/admin-dashboard")
      }, 500)
    } catch (err: any) {
      console.error("❌ Admin login error:", err)
      setLoading(false)
      // Handle specific Firebase auth errors
      if (err.message.includes("user-not-found") || err.message.includes("wrong-password")) {
        setError("Invalid email or password")
      } else if (err.message.includes("too-many-requests")) {
        setError("Too many failed login attempts. Please try again later")
      } else {
        setError("Failed to login. Please try again.")
      }
      console.error(err)
    }
  }
  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Header */}
      <header className="bg-transparent">
        <div className="container flex h-20 items-center px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                    <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <img src="/Black logo.png" alt="EOXS Logo" className="h-8 w-auto" />
            </Link>
          </div>
          <nav className="ml-auto flex gap-8 items-center">
            <Link href="https://eoxs.com/" className="text-base font-medium">
              Home
            </Link>
            <Link href="/about" className="text-base font-medium">
              About
            </Link>
            <Link href="https://eoxs.com/contact" className="text-base font-medium">
              Contact
            </Link>
          </nav>
          
        </div>
      </header>


        <main className="flex-1 flex items-center justify-center p-4 md:p-8">
          <Card className="w-full max-w-md">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold">Admin Login</CardTitle>
              <CardDescription>Enter your credentials to access the admin dashboard</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? "Signing in..." : "Sign In"}
                </Button>
              </form>
            </CardContent>
            <CardFooter>
              <p className="text-center text-sm text-muted-foreground w-full">
                Not an admin?{" "}
                <Link href="/" className="font-medium text-primary hover:underline">
                  Return to home
                </Link>
              </p>
            </CardFooter>
          </Card>
        </main>

      
      </div>
   
  )
}

