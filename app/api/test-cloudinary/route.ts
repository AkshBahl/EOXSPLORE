import { NextRequest, NextResponse } from 'next/server'
import { cloudinaryConfig, getUploadUrl } from '@/app/cloudinary-config'

export async function POST(request: NextRequest) {
  try {
    console.log("🧪 Testing Cloudinary configuration...")
    console.log("☁️ Cloudinary config:", cloudinaryConfig)
    console.log("🔗 Upload URL:", getUploadUrl('video'))
    
    // Test with a simple text file
    const testContent = "This is a test file for Cloudinary upload"
    const testFile = new File([testContent], "test.txt", { type: "text/plain" })
    
    const formData = new FormData()
    formData.append("file", testFile)
    formData.append("upload_preset", cloudinaryConfig.uploadPreset)
    formData.append("cloud_name", cloudinaryConfig.cloudName)
    
    // Try without API key first (for unsigned uploads)
    console.log("📤 Attempting test upload without API key...")
    
    const response = await fetch(getUploadUrl('video'), {
      method: "POST",
      body: formData,
    })
    
    console.log("📡 Response status:", response.status)
    console.log("📡 Response headers:", Object.fromEntries(response.headers.entries()))
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error("❌ Test upload failed:", errorText)
      
      // Try with API key in headers
      console.log("🔄 Trying with API key in headers...")
      const responseWithKey = await fetch(getUploadUrl('video'), {
        method: "POST",
        headers: {
          'Authorization': `Basic ${btoa(`${cloudinaryConfig.apiKey}:`)}`
        },
        body: formData,
      })
      
      console.log("📡 Response with key status:", responseWithKey.status)
      
      if (!responseWithKey.ok) {
        const errorTextWithKey = await responseWithKey.text()
        console.error("❌ Test upload with key failed:", errorTextWithKey)
        return NextResponse.json({ 
          success: false, 
          error: `Upload failed: ${response.status} ${response.statusText}`,
          details: errorText,
          errorWithKey: errorTextWithKey
        }, { status: 400 })
      }
      
      const dataWithKey = await responseWithKey.json()
      console.log("✅ Test upload with key successful:", dataWithKey)
      
      return NextResponse.json({ 
        success: true, 
        message: "Cloudinary upload test successful (with API key)",
        data: dataWithKey
      })
    }
    
    const data = await response.json()
    console.log("✅ Test upload successful:", data)
    
    return NextResponse.json({ 
      success: true, 
      message: "Cloudinary upload test successful",
      data: data
    })
    
  } catch (error) {
    console.error("❌ Test upload error:", error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
