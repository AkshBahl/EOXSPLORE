import { NextRequest, NextResponse } from 'next/server'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '@/firebase'

export async function GET(request: NextRequest) {
  try {
    console.log("🔍 Checking admin user in Firestore...")
    
    // Check for admin user
    const userQuery = query(
      collection(db, "users"), 
      where("email", "==", "admin@gmail.com"), 
      where("role", "==", "admin")
    )
    
    const userSnapshot = await getDocs(userQuery)
    
    if (userSnapshot.empty) {
      console.log("❌ No admin user found in Firestore")
      return NextResponse.json({
        success: false,
        message: "No admin user found in Firestore",
        users: []
      }, { status: 404 })
    }
    
    const users = userSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
    
    console.log("✅ Admin user found:", users)
    
    return NextResponse.json({
      success: true,
      message: "Admin user found",
      users: users
    }, { status: 200 })
    
  } catch (error: any) {
    console.error("❌ Error checking admin user:", error)
    return NextResponse.json({
      success: false,
      message: "Error checking admin user",
      error: error.message
    }, { status: 500 })
  }
}
