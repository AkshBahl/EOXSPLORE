import { NextRequest, NextResponse } from 'next/server'
import { authHelpers } from '@/app/firebase-helpers'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '@/firebase'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()
    
    console.log("🔧 Testing admin login for:", email)
    
    // First authenticate with Firebase
    const userCredential = await authHelpers.signIn(email, password)
    console.log("✅ Firebase auth successful, user ID:", userCredential.user.uid)

    // Then check if the user is an admin
    const userQuery = query(collection(db, "users"), where("userId", "==", userCredential.user.uid), where("role", "==", "admin"))
    console.log("🔍 Checking admin privileges...")

    const userSnapshot = await getDocs(userQuery)
    console.log("📊 Admin query result:", userSnapshot.empty ? "No admin found" : "Admin found")

    if (userSnapshot.empty) {
      console.log("❌ User does not have admin privileges")
      return NextResponse.json({
        success: false,
        message: "You don't have admin privileges"
      }, { status: 403 })
    }

    // Admin login successful
    console.log("✅ Admin login successful!")
    return NextResponse.json({
      success: true,
      message: "Admin login successful",
      user: {
        uid: userCredential.user.uid,
        email: userCredential.user.email
      }
    }, { status: 200 })
    
  } catch (error: any) {
    console.error("❌ Admin login error:", error)
    return NextResponse.json({
      success: false,
      message: "Login failed",
      error: error.message
    }, { status: 400 })
  }
}
