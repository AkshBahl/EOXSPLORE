import { NextRequest, NextResponse } from 'next/server'
import { createAdminAccount } from '@/app/admin-setup'

export async function POST(request: NextRequest) {
  try {
    console.log("🔧 Admin setup API called...")
    
    const result = await createAdminAccount()
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        message: result.message,
        email: result.email,
        userId: result.userId
      }, { status: 200 })
    } else {
      return NextResponse.json({
        success: false,
        message: result.message,
        error: result.error
      }, { status: 400 })
    }
    
  } catch (error: any) {
    console.error("❌ Admin setup API error:", error)
    return NextResponse.json({
      success: false,
      message: "Internal server error",
      error: error.message
    }, { status: 500 })
  }
}
